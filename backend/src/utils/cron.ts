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
  
  // Fai fino a 10 tentativi per trovare coordinate valide che non siano sull'acqua
  for (let attempt = 0; attempt < 10; attempt++) {
    const latitude = faker.number.float({ min: city.latMin, max: city.latMax, fractionDigits: 4 });
    const longitude = faker.number.float({ min: city.lonMin, max: city.lonMax, fractionDigits: 4 });
    
    // Prima verifica se le coordinate sono su terraferma
    if (isValidLandCoordinate(latitude, longitude)) {
      return { latitude, longitude, city: city.name };
    }
  }
  
  // Se tutti i tentativi falliscono, usa il centro del range della città
  const centerLat = (city.latMin + city.latMax) / 2;
  const centerLon = (city.lonMin + city.lonMax) / 2;
  
  return { latitude: centerLat, longitude: centerLon, city: city.name };
}

// Funzione per validare se le coordinate sono plausibili (non sull'acqua)
function isValidLandCoordinate(latitude: number, longitude: number): boolean {
  // Lista di controlli più precisi per zone d'acqua note
  const waterZones = [
    // Oceano Atlantico Nord
    { latMin: 20, latMax: 60, lonMin: -60, lonMax: -10 },
    // Oceano Atlantico Sud
    { latMin: -60, latMax: 20, lonMin: -50, lonMax: 10 },
    // Oceano Pacifico Nord
    { latMin: 0, latMax: 60, lonMin: -180, lonMax: -120 },
    // Oceano Pacifico Sud
    { latMin: -60, latMax: 0, lonMin: -180, lonMax: -70 },
    // Oceano Pacifico Ovest
    { latMin: -60, latMax: 60, lonMin: 120, lonMax: 180 },
    // Oceano Indiano
    { latMin: -60, latMax: 30, lonMin: 20, lonMax: 120 },
    // Mar Mediterraneo centrale (zone senza isole)
    { latMin: 36, latMax: 40, lonMin: 8, lonMax: 16 },
    // Mar Baltico centrale
    { latMin: 55, latMax: 59, lonMin: 15, lonMax: 25 },
    // Mare del Nord
    { latMin: 53, latMax: 60, lonMin: 0, lonMax: 8 },
    // Golfo del Messico
    { latMin: 23, latMax: 30, lonMin: -97, lonMax: -82 },
    // Mar Rosso
    { latMin: 12, latMax: 28, lonMin: 32, lonMax: 43 },
    // Golfo Persico
    { latMin: 24, latMax: 30, lonMin: 48, lonMax: 56 },
  ];
  
  // Verifica se le coordinate cadono in zone d'acqua note
  for (const zone of waterZones) {
    if (latitude >= zone.latMin && latitude <= zone.latMax &&
        longitude >= zone.lonMin && longitude <= zone.lonMax) {
      // Se è in una zona d'acqua, verifica se è vicino a una città conosciuta (raggio di 0.05 gradi)
      const nearCity = cityRegions.some(city => 
        latitude >= city.latMin - 0.05 && latitude <= city.latMax + 0.05 &&
        longitude >= city.lonMin - 0.05 && longitude <= city.lonMax + 0.05
      );
      return nearCity; // Accetta solo se molto vicino a una città
    }
  }
  
  // Controlli aggiuntivi per coordinate ovviamente sull'acqua
  // Coordinate impossibili per terre emerse
  if (Math.abs(latitude) > 85) return false; // Poli
  
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

