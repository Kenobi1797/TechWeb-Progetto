import cron from 'node-cron';
import fetch from 'node-fetch';
import { faker } from '@faker-js/faker';
import { insertCat } from '../db/catsDb';
import { insertComment } from '../db/commentsDb';
import { getAllUsers } from '../db/usersDb';
import { strayCatComments, strayCatDescriptions, strayCatTitles, safeUrbanCoordinates } from './strayCat';
import { validateAndParseCoordinates, calculateDistance } from './coordinates';
import pool from '../config/db';

const CAT_API = 'https://api.thecatapi.com/v1/images/search?limit=1';

// Costanti consolidate
const CONFIG = {
  MIN_DISTANCE: 100,
  CACHE_DURATION: 300000, // 5 minuti
  GRID_SIZE: 0.001, // ~100m
  MAX_ATTEMPTS: 5,
  BATCH_SIZE: 20
} as const;

// Cache singleton ottimizzata
class CoordinatesCache {
  private static instance: CoordinatesCache;
  private cache: Array<{ lat: number; lon: number }> = [];
  private lastUpdate = 0;

  static getInstance(): CoordinatesCache {
    if (!CoordinatesCache.instance) {
      CoordinatesCache.instance = new CoordinatesCache();
    }
    return CoordinatesCache.instance;
  }

  async getCoordinates(): Promise<Array<{ lat: number; lon: number }>> {
    const now = Date.now();
    if (this.cache.length === 0 || (now - this.lastUpdate) > CONFIG.CACHE_DURATION) {
      const { rows } = await pool.query('SELECT latitude, longitude FROM cats');
      this.cache = rows.map(row => ({ lat: row.latitude, lon: row.longitude }));
      this.lastUpdate = now;
    }
    return this.cache;
  }

  clear(): void {
    this.cache = [];
    this.lastUpdate = 0;
  }
}

const coordinatesCache = CoordinatesCache.getInstance();

// Funzione semplificata per validazione coordinate
function isValidLandCoordinate(latitude: number, longitude: number): boolean {
  return validateAndParseCoordinates(latitude, longitude).valid;
}

// Funzione ottimizzata per generare coordinate senza sovrapposizioni
async function generateOptimalCoordinates(cityCoords: { latitude: number; longitude: number }): Promise<{ lat: number; lon: number }> {
  const coords = await coordinatesCache.getCoordinates();
  
  for (let attempt = 0; attempt < CONFIG.MAX_ATTEMPTS; attempt++) {
    // Pattern a griglia per evitare clustering
    const offsetLat = (Math.floor(Math.random() * 10) - 5) * CONFIG.GRID_SIZE;
    const offsetLon = (Math.floor(Math.random() * 10) - 5) * CONFIG.GRID_SIZE;
    
    const candidateLat = cityCoords.latitude + offsetLat;
    const candidateLon = cityCoords.longitude + offsetLon;
    
    // Controllo distanza con coordinate esistenti
    const hasConflict = coords.some(existing => 
      calculateDistance(candidateLat, candidateLon, existing.lat, existing.lon) < CONFIG.MIN_DISTANCE
    );
    
    if (!hasConflict) {
      return { lat: candidateLat, lon: candidateLon };
    }
  }
  
  // Fallback con offset casuale minimo
  return {
    lat: cityCoords.latitude + (Math.random() - 0.5) * 0.002,
    lon: cityCoords.longitude + (Math.random() - 0.5) * 0.002
  };
}

// Funzione semplificata per verificare sovrapposizioni
async function adjustPositionIfOverlapping(latitude: number, longitude: number): Promise<{ lat: number; lon: number }> {
  const coords = await coordinatesCache.getCoordinates();
  
  // Controllo sovrapposizione
  const hasOverlap = coords.some(existing => 
    calculateDistance(latitude, longitude, existing.lat, existing.lon) < CONFIG.MIN_DISTANCE
  );
  
  return hasOverlap 
    ? generateOptimalCoordinates({ latitude, longitude })
    : { lat: latitude, lon: longitude };
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
  const { rows: catsWithIssues } = await pool.query(`
    SELECT id, description, latitude, longitude 
    FROM cats 
    WHERE latitude < 35 OR latitude > 47.5 
       OR longitude < 6 OR longitude > 19
    LIMIT 50
  `);

  if (catsWithIssues.length === 0) return;

  coordinatesCache.clear(); // Forza refresh cache
  
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

// Funzione ottimizzata per controllare sovrapposizioni
async function checkAndFixOverlapsOptimized(): Promise<void> {
  const { rows: nearCats } = await pool.query(`
    SELECT c1.id as id1, c1.latitude as lat1, c1.longitude as lon1,
           c2.id as id2, c2.latitude as lat2, c2.longitude as lon2
    FROM cats c1, cats c2 
    WHERE c1.id < c2.id 
      AND ABS(c1.latitude - c2.latitude) < 0.002
      AND ABS(c1.longitude - c2.longitude) < 0.002
    LIMIT ${CONFIG.BATCH_SIZE}
  `);

  if (nearCats.length === 0) return;

  let correctedCount = 0;
  
  for (const pair of nearCats) {
    const distance = calculateDistance(pair.lat1, pair.lon1, pair.lat2, pair.lon2);
    
    if (distance < CONFIG.MIN_DISTANCE) {
      const catToMove = pair.id1 > pair.id2 ? 
        { id: pair.id1, lat: pair.lat1, lon: pair.lon1 } : 
        { id: pair.id2, lat: pair.lat2, lon: pair.lon2 };
      
      const adjustedCoords = await generateOptimalCoordinates({ 
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
    console.log(`Cron: ${correctedCount} sovrapposizioni corrette`);
    coordinatesCache.clear(); // Refresh cache dopo modifiche
  }
}

// Esportazioni consolidate
export { 
  adjustPositionIfOverlapping, 
  checkAndFixOverlapsOptimized, 
  fixInvalidDataOptimized,
  generateOptimalCoordinates
};
