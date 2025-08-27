import cron from 'node-cron';
import fetch from 'node-fetch';
import { faker } from '@faker-js/faker';
import { insertCat } from '../db/catsDb';
import { insertComment } from '../db/commentsDb';
import { getAllUsers } from '../db/usersDb';
import { strayCatComments, strayCatDescriptions, strayCatTitles, cityRegions } from './strayCat';
import pool from '../config/db';

// Zone d'acqua più precise per validazione coordinate
const WATER_ZONES = [
  // Oceani principali - zone più ristrette e precise
  { latMin: 30, latMax: 70, lonMin: -70, lonMax: -10, name: "Oceano Atlantico Nord" },
  { latMin: -40, latMax: 10, lonMin: -50, lonMax: 20, name: "Oceano Atlantico Sud" },
  { latMin: 10, latMax: 60, lonMin: -180, lonMax: -130, name: "Oceano Pacifico Nord-Est" },
  { latMin: -50, latMax: 10, lonMin: -180, lonMax: -80, name: "Oceano Pacifico Sud-Est" },
  { latMin: -40, latMax: 60, lonMin: 130, lonMax: 180, name: "Oceano Pacifico Ovest" },
  { latMin: -40, latMax: 25, lonMin: 40, lonMax: 100, name: "Oceano Indiano" },
  
  // Mari specifici d'Europa e Mediterraneo - coordinate precise
  { latMin: 30, latMax: 46, lonMin: -6, lonMax: 36, name: "Mar Mediterraneo" },
  { latMin: 53, latMax: 66, lonMin: 10, lonMax: 30, name: "Mar Baltico" },
  { latMin: 51, latMax: 62, lonMin: -4, lonMax: 12, name: "Mare del Nord" },
  { latMin: 39, latMax: 48, lonMin: 27, lonMax: 42, name: "Mar Nero" },
  { latMin: 35, latMax: 48, lonMin: 32, lonMax: 45, name: "Mar Caspio" },
  
  // Golfi e mari minori
  { latMin: 18, latMax: 31, lonMin: -98, lonMax: -80, name: "Golfo del Messico" },
  { latMin: 10, latMax: 30, lonMin: 32, lonMax: 43, name: "Mar Rosso" },
  { latMin: 24, latMax: 30, lonMin: 48, lonMax: 56, name: "Golfo Persico" },
  { latMin: 8, latMax: 24, lonMin: 50, lonMax: 60, name: "Mar Arabico" },
  
  // Zone lacustri principali
  { latMin: 41, latMax: 47, lonMin: -90, lonMax: -76, name: "Grandi Laghi Nord America" },
  { latMin: 50, latMax: 65, lonMin: 80, lonMax: 110, name: "Lago Baikal" },
  
  // Coordinate specifiche Italia - mari intorno
  { latMin: 37, latMax: 40, lonMin: 11, lonMax: 18, name: "Mar Ionio" },
  { latMin: 40, latMax: 45, lonMin: 12, lonMax: 16, name: "Mar Adriatico Sud" },
  { latMin: 45, latMax: 46, lonMin: 12, lonMax: 14, name: "Laguna Veneziana" },
  { latMin: 38, latMax: 41, lonMin: 8, lonMax: 10, name: "Mar di Sardegna" },
  { latMin: 37, latMax: 39, lonMin: 13, lonMax: 16, name: "Stretto di Sicilia" },
];

const CAT_API = 'https://api.thecatapi.com/v1/images/search?limit=1';
const MAX_COORDINATE_ATTEMPTS = 15;
const CITY_PROXIMITY_RADIUS = 0.03; // Ridotto per essere più precisi

// Funzione migliorata per validare se le coordinate sono su terraferma
function isValidLandCoordinate(latitude: number, longitude: number): boolean {
  // Coordinate impossibili per terre emerse
  if (Math.abs(latitude) > 85) return false;
  
  // Prima verifica se è vicino a una città conosciuta (alta priorità)
  const nearCity = cityRegions.some(city => 
    latitude >= city.latMin - CITY_PROXIMITY_RADIUS && 
    latitude <= city.latMax + CITY_PROXIMITY_RADIUS &&
    longitude >= city.lonMin - CITY_PROXIMITY_RADIUS && 
    longitude <= city.lonMax + CITY_PROXIMITY_RADIUS
  );
  
  // Se è vicino a una città, è sempre valido
  if (nearCity) return true;
  
  // Altrimenti verifica se cade in zone d'acqua note
  for (const zone of WATER_ZONES) {
    if (latitude >= zone.latMin && latitude <= zone.latMax &&
        longitude >= zone.lonMin && longitude <= zone.lonMax) {
      console.log(`Coordinate ${latitude}, ${longitude} cadono in ${zone.name}`);
      return false;
    }
  }
  
  // Controlli aggiuntivi per zone problematiche specifiche
  
  // Antartide (solo ricerca scientifica)
  if (latitude < -60) return false;
  
  // Groenlandia centrale (ghiaccio)
  if (latitude > 70 && longitude >= -50 && longitude <= -20) return false;
  
  // Sahara centrale (deserti estremi) - opzionale
  if (latitude >= 15 && latitude <= 30 && longitude >= -10 && longitude <= 30) {
    // Permetti solo se vicino a città note del Nord Africa
    return nearCity;
  }
  
  return true;
}

function getRandomCoordsInCity(): { latitude: number; longitude: number; city: string } {
  const city = faker.helpers.arrayElement(cityRegions);
  
  // Tentativi per trovare coordinate valide che non siano sull'acqua
  for (let attempt = 0; attempt < MAX_COORDINATE_ATTEMPTS; attempt++) {
    const latitude = faker.number.float({ min: city.latMin, max: city.latMax, fractionDigits: 4 });
    const longitude = faker.number.float({ min: city.lonMin, max: city.lonMax, fractionDigits: 4 });
    
    if (isValidLandCoordinate(latitude, longitude)) {
      return { latitude, longitude, city: city.name };
    }
  }
  
  // Fallback: usa il centro della città
  const centerLat = (city.latMin + city.latMax) / 2;
  const centerLon = (city.lonMin + city.lonMax) / 2;
  
  return { latitude: centerLat, longitude: centerLon, city: city.name };
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
}

