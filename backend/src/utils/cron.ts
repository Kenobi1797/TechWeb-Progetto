import cron from 'node-cron';
import fetch from 'node-fetch';
import { faker } from '@faker-js/faker';
import { insertCat } from '../db/catsDb';
import { insertComment } from '../db/commentsDb';
import { getAllUsers } from '../db/usersDb';
import { strayCatComments, strayCatDescriptions, strayCatTitles, safeUrbanCoordinates } from './strayCat';
import { validateAndParseCoordinates } from './coordinates';
import pool from '../config/db';

const CAT_API = 'https://api.thecatapi.com/v1/images/search?limit=1';

// Costanti ottimizzate
const MIN_DISTANCE = 100; // Distanza minima in metri
const MAX_ADJUSTMENT_RADIUS = 500; // Massimo 500 metri di spostamento
const CACHE_DURATION = 300000; // 5 minuti di cache

// Cache per ottimizzare le query ripetute
let coordinatesCache: Array<{ lat: number; lon: number; lastUpdate: number }> = [];

// Funzione ottimizzata per calcolare la distanza (versione semplificata per controlli rapidi)
function fastDistanceCheck(lat1: number, lon1: number, lat2: number, lon2: number): number {
  // Calcolo approssimato più veloce per controlli di prossimità
  const latDiff = (lat2 - lat1) * 111000; // Approssimazione: 1 grado lat ≈ 111km
  const lonDiff = (lon2 - lon1) * 111000 * Math.cos(lat1 * Math.PI / 180);
  return Math.sqrt(latDiff * latDiff + lonDiff * lonDiff);
}

// Funzione per calcolare la distanza precisa solo quando necessario
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c;
}

// Aggiorna la cache delle coordinate
async function updateCoordinatesCache(): Promise<void> {
  const now = Date.now();
  if (coordinatesCache.length === 0 || (now - coordinatesCache[0]?.lastUpdate || 0) > CACHE_DURATION) {
    const { rows } = await pool.query('SELECT latitude, longitude FROM cats');
    coordinatesCache = rows.map(row => ({
      lat: row.latitude,
      lon: row.longitude,
      lastUpdate: now
    }));
  }
}

// Funzione ottimizzata per generare coordinate senza sovrapposizioni
function generateOptimalCoordinates(cityCoords: { latitude: number; longitude: number }): { lat: number; lon: number } {
  const maxAttempts = 5; // Ridotto da 10
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    // Genera coordinate in un pattern a griglia per evitare clustering
    const gridSize = 0.001; // ~100m
    const offsetLat = (Math.floor(Math.random() * 10) - 5) * gridSize;
    const offsetLon = (Math.floor(Math.random() * 10) - 5) * gridSize;
    
    const candidateLat = cityCoords.latitude + offsetLat;
    const candidateLon = cityCoords.longitude + offsetLon;
    
    // Controllo rapido con cache
    let hasConflict = false;
    for (const existing of coordinatesCache) {
      if (fastDistanceCheck(candidateLat, candidateLon, existing.lat, existing.lon) < MIN_DISTANCE) {
        hasConflict = true;
        break;
      }
    }
    
    if (!hasConflict) {
      return { lat: candidateLat, lon: candidateLon };
    }
  }
  
  // Fallback: usa coordinate della città con offset casuale minimo
  return {
    lat: cityCoords.latitude + (Math.random() - 0.5) * 0.002,
    lon: cityCoords.longitude + (Math.random() - 0.5) * 0.002
  };
}

// Funzione semplificata per verificare sovrapposizioni con batching
async function adjustPositionIfOverlapping(latitude: number, longitude: number): Promise<{ lat: number; lon: number }> {
  await updateCoordinatesCache();
  
  // Controllo rapido iniziale
  let hasOverlap = false;
  for (const existing of coordinatesCache) {
    if (fastDistanceCheck(latitude, longitude, existing.lat, existing.lon) < MIN_DISTANCE) {
      hasOverlap = true;
      break;
    }
  }
  
  if (!hasOverlap) {
    return { lat: latitude, lon: longitude };
  }
  
  // Se c'è sovrapposizione, genera nuove coordinate ottimali
  return generateOptimalCoordinates({ latitude, longitude });
}

function isValidLandCoordinate(latitude: number, longitude: number): boolean {
  const validation = validateAndParseCoordinates(latitude, longitude);
  return validation.valid;
}

function getRandomCoordsInCity(): { latitude: number; longitude: number; city: string } {
  const cityData = faker.helpers.arrayElement(safeUrbanCoordinates);
  
  // Genera coordinate casuali in un raggio più piccolo (~1km) per rimanere in aree urbane sicure
  const radiusDegrees = 0.01; // ~1km per ridurre il rischio di finire in mare
  let latitude = parseFloat((cityData.lat + (Math.random() - 0.5) * radiusDegrees).toFixed(6));
  let longitude = parseFloat((cityData.lng + (Math.random() - 0.5) * radiusDegrees).toFixed(6));
  
  // Valida le coordinate con la nuova funzione anti-mare
  const validation = validateAndParseCoordinates(latitude, longitude);
  
  if (validation.valid && validation.latitude && validation.longitude) {
    // Se le coordinate sono state corrette (ad esempio da mare a terraferma), usa quelle corrette
    return { 
      latitude: validation.latitude, 
      longitude: validation.longitude, 
      city: `${cityData.name}, ${cityData.country}` 
    };
  }
  
  // Fallback sicuro: coordinate esatte della città (garantite sulla terraferma)
  return { latitude: cityData.lat, longitude: cityData.lng, city: `${cityData.name}, ${cityData.country}` };
}

export function startCronJobs() {
  if (process.env.NODE_ENV === 'development') {
    console.log(`Avvio cron jobs ottimizzati in modalità: ${process.env.NODE_ENV || 'development'}`);
  }
  
  // Frequenza ridotta per diminuire carico computazionale
  const interval = process.env.NODE_ENV === 'production' ? '*/15 * * * *' : '*/5 * * * *';
  
  // Crea nuovi avvistamenti con la frequenza specificata
  cron.schedule(interval, async () => {
    try {
      const users = await getAllUsers();
      if (!users.length) return;
      
      const numCats = 1; // Ridotto per diminuire carico
      
      for (let j = 0; j < numCats; j++) {
        await createRandomCatSighting(users);
      }
    } catch (err) {
      console.error('Errore nel cron job:', err);
    }
  });

  // Controlli ottimizzati ogni 15 minuti
  cron.schedule('*/15 * * * *', async () => {
    try {
      await fixInvalidDataOptimized();
      console.log('Cron: controlli ottimizzati completati.');
    } catch (err) {
      console.error('Errore controlli ottimizzati:', err);
    }
  });

  // Controllo sovrapposizioni ridotto a ogni 10 minuti
  cron.schedule('*/10 * * * *', async () => {
    try {
      await checkAndFixOverlapsOptimized();
      console.log('Cron: controllo sovrapposizioni ottimizzato completato.');
    } catch (err) {
      console.error('Errore controllo sovrapposizioni ottimizzato:', err);
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
  
  // Aggiusta la posizione per evitare sovrapposizioni
  const adjustedCoords = await adjustPositionIfOverlapping(latitude, longitude);
  
  // Valida nuovamente le coordinate aggiustate
  if (!isValidLandCoordinate(adjustedCoords.lat, adjustedCoords.lon)) {
    console.log(`Cron: Coordinate aggiustate non valide per ${city}, salto questo avvistamento`);
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
    adjustedCoords.lat,
    adjustedCoords.lon
  );

  // Aggiungi commenti casuali
  const nComments = faker.number.int({ min: 1, max: 3 });
  for (let i = 0; i < nComments; i++) {
    const commenter = faker.helpers.arrayElement(users);
    const content = faker.helpers.arrayElement(strayCatComments);
    await insertComment(commenter.id, Number(cat.id), content);
  }

  if (process.env.NODE_ENV === 'development') {
    console.log(`Cron: creato avvistamento #${cat.id} (${city}) con ${nComments} commenti alle coordinate (${adjustedCoords.lat.toFixed(6)}, ${adjustedCoords.lon.toFixed(6)})`);
  }
}

// Funzione ottimizzata per controllare e correggere i dati non validi
async function fixInvalidDataOptimized(): Promise<void> {
  // Usa una singola query con filtri per efficienza
  const { rows: catsWithIssues } = await pool.query(`
    SELECT id, description, latitude, longitude 
    FROM cats 
    WHERE latitude < 35 OR latitude > 47.5 
       OR longitude < 6 OR longitude > 19
    LIMIT 50
  `);

  if (catsWithIssues.length === 0) return;

  await updateCoordinatesCache();
  
  for (const cat of catsWithIssues) {
    const validation = validateAndParseCoordinates(cat.latitude, cat.longitude);
    
    if (!validation.valid) {
      const { latitude, longitude, city } = getRandomCoordsInCity();
      const adjustedCoords = await adjustPositionIfOverlapping(latitude, longitude);
      const newDescription = `${faker.helpers.arrayElement(strayCatDescriptions)} (${city})`;
      
      await pool.query(
        'UPDATE cats SET latitude = $1, longitude = $2, description = $3 WHERE id = $4',
        [adjustedCoords.lat, adjustedCoords.lon, newDescription, cat.id]
      );
    }
  }
}

// Funzione ottimizzata per controllare sovrapposizioni con algoritmo spaziale
async function checkAndFixOverlapsOptimized(): Promise<void> {
  // Query ottimizzata che trova solo gatti potenzialmente vicini
  const { rows: nearCats } = await pool.query(`
    SELECT c1.id as id1, c1.latitude as lat1, c1.longitude as lon1,
           c2.id as id2, c2.latitude as lat2, c2.longitude as lon2
    FROM cats c1, cats c2 
    WHERE c1.id < c2.id 
      AND ABS(c1.latitude - c2.latitude) < 0.002  -- ~200m approssimativo
      AND ABS(c1.longitude - c2.longitude) < 0.002
    LIMIT 20
  `);

  if (nearCats.length === 0) return;

  let correctedCount = 0;
  
  for (const pair of nearCats) {
    const distance = fastDistanceCheck(pair.lat1, pair.lon1, pair.lat2, pair.lon2);
    
    if (distance < MIN_DISTANCE) {
      // Sposta il gatto con ID più alto
      const catToMove = pair.id1 > pair.id2 ? 
        { id: pair.id1, lat: pair.lat1, lon: pair.lon1 } : 
        { id: pair.id2, lat: pair.lat2, lon: pair.lon2 };
      
      const adjustedCoords = generateOptimalCoordinates({ 
        latitude: catToMove.lat, 
        longitude: catToMove.lon 
      });
      
      await pool.query(
        'UPDATE cats SET latitude = $1, longitude = $2 WHERE id = $3',
        [adjustedCoords.lat, adjustedCoords.lon, catToMove.id]
      );
      
      correctedCount++;
    }
  }
  
  if (correctedCount > 0) {
    console.log(`Cron: ${correctedCount} sovrapposizioni corrette (ottimizzato)`);
  }
}

// Esportazioni per test e utilizzo esterno
export { 
  calculateDistance, 
  fastDistanceCheck,
  adjustPositionIfOverlapping, 
  checkAndFixOverlapsOptimized, 
  fixInvalidDataOptimized,
  generateOptimalCoordinates,
  updateCoordinatesCache
};
