import cron from 'node-cron';
import fetch from 'node-fetch';
import { faker } from '@faker-js/faker';
import { insertCat } from '../db/catsDb';
import { insertComment } from '../db/commentsDb';
import { getAllUsers } from '../db/usersDb';
import { strayCatComments, strayCatDescriptions, cityRegions } from './strayCat';
import pool from '../config/db';

function getRandomCoordsInCity(): { latitude: number; longitude: number; city: string } {
  const city = faker.helpers.arrayElement(cityRegions);
  
  // Genera coordinate multiple volte e scegli quelle più centrali per evitare l'acqua
  let bestCoords: { latitude: number; longitude: number } | null = null;
  let bestDistance = Infinity;
  
  for (let attempt = 0; attempt < 5; attempt++) {
    const latitude = faker.number.float({ min: city.latMin, max: city.latMax, fractionDigits: 4 });
    const longitude = faker.number.float({ min: city.lonMin, max: city.lonMax, fractionDigits: 4 });
    
    // Calcola la distanza dal centro del range (approssimazione per trovare zone più urbane)
    const centerLat = (city.latMin + city.latMax) / 2;
    const centerLon = (city.lonMin + city.lonMax) / 2;
    const distance = Math.sqrt(
      Math.pow(latitude - centerLat, 2) + Math.pow(longitude - centerLon, 2)
    );
    
    if (distance < bestDistance) {
      bestDistance = distance;
      bestCoords = { latitude, longitude };
    }
  }
  
  // Fallback se per qualche motivo bestCoords è ancora null
  if (!bestCoords) {
    const centerLat = (city.latMin + city.latMax) / 2;
    const centerLon = (city.lonMin + city.lonMax) / 2;
    bestCoords = { latitude: centerLat, longitude: centerLon };
  }
  
  return { ...bestCoords, city: city.name };
}

// Funzione per validare se le coordinate sono plausibili (non sull'acqua)
function isValidLandCoordinate(latitude: number, longitude: number): boolean {
  // Lista di controlli base per zone d'acqua note
  const waterZones = [
    // Oceano Atlantico
    { latMin: 0, latMax: 60, lonMin: -60, lonMax: -10 },
    // Oceano Pacifico
    { latMin: -60, latMax: 60, lonMin: -180, lonMax: -120 },
    { latMin: -60, latMax: 60, lonMin: 120, lonMax: 180 },
    // Oceano Indiano
    { latMin: -60, latMax: 30, lonMin: 20, lonMax: 120 },
    // Mar Mediterraneo (zone centrali)
    { latMin: 35, latMax: 42, lonMin: 5, lonMax: 20 },
  ];
  
  // Verifica se le coordinate cadono in zone d'acqua note
  for (const zone of waterZones) {
    if (latitude >= zone.latMin && latitude <= zone.latMax &&
        longitude >= zone.lonMin && longitude <= zone.lonMax) {
      // Se è in una zona d'acqua, verifica se è vicino a una città conosciuta
      const nearCity = cityRegions.some(city => 
        latitude >= city.latMin - 0.1 && latitude <= city.latMax + 0.1 &&
        longitude >= city.lonMin - 0.1 && longitude <= city.lonMax + 0.1
      );
      return nearCity; // Accetta solo se vicino a una città
    }
  }
  
  return true; // Se non è in zone d'acqua note, presumiamo sia valida
}

const CAT_API = 'https://api.thecatapi.com/v1/images/search?limit=1';

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
      if (!users.length) {
        return;
      }
      
      const numCats = process.env.NODE_ENV === 'production' ? 2 : 1;
      
      for (let j = 0; j < numCats; j++) {
        const systemUser = faker.helpers.arrayElement(users);
        const res = await fetch(CAT_API, {
          headers: { 'x-api-key': process.env.CATAPI_KEY ?? '' }
        });
        const data = await res.json();
        const imageUrl: string | null = data?.[0]?.url ?? null;
        if (!imageUrl || imageUrl.toLowerCase().endsWith('.gif')) {
          console.log('Cron: Immagine non valida, salto questo avvistamento');
          continue;
        }
        const { latitude, longitude, city } = getRandomCoordsInCity();
        
        // Validazione aggiuntiva per assicurarsi che le coordinate non siano sull'acqua
        if (!isValidLandCoordinate(latitude, longitude)) {
          console.log(`Cron: Coordinate non valide per ${city}, genero nuove coordinate`);
          continue;
        }
        
        const title = faker.word.noun({ length: { min: 5, max: 15 } });
        // Inserisci la città nella descrizione per maggiore realismo
        const description = `${faker.helpers.arrayElement(strayCatDescriptions)} (${city})`;

        const cat = await insertCat(
          systemUser.id,
          title,
          description,
          imageUrl,
          latitude,
          longitude
        );

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
    } catch (err) {
      console.error('Errore nel cron job:', err);
    }
  });

  // Ogni ora correggi descrizioni, commenti e coordinate non plausibili
  cron.schedule('0 * * * *', async () => {
    try {
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
        const found = cityRegions.find(c =>
          cat.latitude >= c.latMin && cat.latitude <= c.latMax &&
          cat.longitude >= c.lonMin && cat.longitude <= c.lonMax
        );
        
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
      console.log('Cron: descrizioni, commenti e coordinate non coerenti/valide aggiornati.');
    } catch (err) {
      console.error('Errore aggiornamento descrizioni/commenti/coordinate:', err);
    }
  });
}

