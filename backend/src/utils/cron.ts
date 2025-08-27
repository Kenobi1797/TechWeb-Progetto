import cron from 'node-cron';
import fetch from 'node-fetch';
import { faker } from '@faker-js/faker';
import { insertCat } from '../db/catsDb';
import { insertComment } from '../db/commentsDb';
import { getAllUsers } from '../db/usersDb';
import { strayCatComments, strayCatDescriptions, strayCatTitles, safeUrbanCoordinates } from './strayCat';
import pool from '../config/db';

const CAT_API = 'https://api.thecatapi.com/v1/images/search?limit=1';
const CITY_PROXIMITY_RADIUS = 0.03;

// Funzione semplificata per validare coordinate vicino a città sicure
function isValidLandCoordinate(latitude: number, longitude: number): boolean {
  // Coordinate impossibili
  if (Math.abs(latitude) > 85) return false;
  
  // Verifica se è vicino a una delle nostre città sicure
  return safeUrbanCoordinates.some(city => {
    const distance = Math.sqrt(
      Math.pow(latitude - city.lat, 2) + Math.pow(longitude - city.lng, 2)
    );
    return distance <= CITY_PROXIMITY_RADIUS;
  });
}

function getRandomCoordsInCity(): { latitude: number; longitude: number; city: string } {
  const cityData = faker.helpers.arrayElement(safeUrbanCoordinates);
  
  // Genera coordinate casuali in un raggio di ~2km dalla città sicura
  const radiusDegrees = 0.02; // ~2km
  const latitude = parseFloat((cityData.lat + (Math.random() - 0.5) * radiusDegrees).toFixed(6));
  const longitude = parseFloat((cityData.lng + (Math.random() - 0.5) * radiusDegrees).toFixed(6));
  
  // Verifica che siano ancora valide, altrimenti usa le coordinate esatte della città
  if (isValidLandCoordinate(latitude, longitude)) {
    return { latitude, longitude, city: `${cityData.name}, ${cityData.country}` };
  }
  
  // Fallback sicuro: coordinate esatte della città
  return { latitude: cityData.lat, longitude: cityData.lng, city: `${cityData.name}, ${cityData.country}` };
}

export function startCronJobs() {
  if (process.env.NODE_ENV === 'development') {
    console.log(`Avvio cron jobs in modalità: ${process.env.NODE_ENV || 'development'}`);
  }
  
  // Frequenza differente per development vs production
  const interval = process.env.NODE_ENV === 'production' ? '*/10 * * * *' : '*/2 * * * *';
  
  // Crea nuovi avvistamenti con la frequenza specificata
  cron.schedule(interval, async () => {
    try {
      const users = await getAllUsers();
      if (!users.length) return;
      
      const numCats = process.env.NODE_ENV === 'production' ? 2 : 1;
      
      for (let j = 0; j < numCats; j++) {
        await createRandomCatSighting(users);
      }
    } catch (err) {
      console.error('Errore nel cron job:', err);
    }
  });

  // Ogni ora correggi descrizioni, commenti e coordinate non plausibili
  cron.schedule('0 * * * *', async () => {
    try {
      await fixInvalidData();
      console.log('Cron: descrizioni, commenti e coordinate non coerenti/valide aggiornati.');
    } catch (err) {
      console.error('Errore aggiornamento descrizioni/commenti/coordinate:', err);
    }
  });
}

async function createRandomCatSighting(users: any[]) {
  const systemUser = faker.helpers.arrayElement(users);
  
  // Ottieni immagine del gatto
  const res = await fetch(CAT_API, {
    headers: { 'x-api-key': process.env.CATAPI_KEY ?? '' }
  });
  const data = await res.json();
  const imageUrl: string | null = data?.[0]?.url ?? null;
  
  if (!imageUrl || imageUrl.toLowerCase().endsWith('.gif')) {
    console.log('Cron: Immagine non valida, salto questo avvistamento');
    return;
  }
  
  const { latitude, longitude, city } = getRandomCoordsInCity();
  
  // Validazione aggiuntiva per assicurarsi che le coordinate non siano sull'acqua
  if (!isValidLandCoordinate(latitude, longitude)) {
    console.log(`Cron: Coordinate non valide per ${city}, salto questo avvistamento`);
    return;
  }
  
  // Usa titoli specifici per gatti invece di parole casuali
  const title = faker.helpers.arrayElement(strayCatTitles);
  const description = `${faker.helpers.arrayElement(strayCatDescriptions)} (${city})`;

  const cat = await insertCat(
    systemUser.id,
    title,
    description,
    imageUrl,
    latitude,
    longitude
  );

  // Aggiungi commenti casuali
  const nComments = faker.number.int({ min: 1, max: 3 });
  for (let i = 0; i < nComments; i++) {
    const commenter = faker.helpers.arrayElement(users);
    const content = faker.helpers.arrayElement(strayCatComments);
    await insertComment(commenter.id, Number(cat.id), content);
  }

  if (process.env.NODE_ENV === 'development') {
    console.log(`Cron: creato avvistamento #${cat.id} (${city}) con ${nComments} commenti`);
  }
}

async function fixInvalidData() {
  // Aggiorna descrizioni dei gatti non coerenti e correggi coordinate fuori città
  const { rows: cats } = await pool.query('SELECT id, description, latitude, longitude FROM cats');
  
  for (const cat of cats) {
    // Correggi descrizione se non coerente
    let updateDesc = false;
    let newDescription = cat.description;
    
    if (!strayCatDescriptions.some(d => cat.description?.startsWith(d))) {
      newDescription = faker.helpers.arrayElement(strayCatDescriptions);
      updateDesc = true;
    }
    
    // Correggi coordinate se fuori da tutte le città o sull'acqua
    const found = safeUrbanCoordinates.find(city => {
      const distance = Math.sqrt(
        Math.pow(cat.latitude - city.lat, 2) + Math.pow(cat.longitude - city.lng, 2)
      );
      return distance <= CITY_PROXIMITY_RADIUS;
    });
    
    const needsCoordinateUpdate = !found || !isValidLandCoordinate(cat.latitude, cat.longitude);
    
    if (needsCoordinateUpdate) {
      const { latitude, longitude, city } = getRandomCoordsInCity();
      newDescription = `${faker.helpers.arrayElement(strayCatDescriptions)} (coordinata corretta in ${city})`;
      await pool.query(
        'UPDATE cats SET latitude = $1, longitude = $2, description = $3 WHERE id = $4',
        [latitude, longitude, newDescription, cat.id]
      );
      console.log(`Cron: Coordinate corrette per gatto #${cat.id} in ${city}`);
    } else if (updateDesc) {
      await pool.query(
        'UPDATE cats SET description = $1 WHERE id = $2',
        [newDescription, cat.id]
      );
    }
  }
  
  // Aggiorna commenti non coerenti
  const { rows: comments } = await pool.query('SELECT id, content FROM comments');
  for (const comment of comments) {
    if (!strayCatComments.includes(comment.content)) {
      const newContent = faker.helpers.arrayElement(strayCatComments);
      await pool.query(
        'UPDATE comments SET content = $1 WHERE id = $2',
        [newContent, comment.id]
      );
    }
  }
}

