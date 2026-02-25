import cron from 'node-cron';
import fetch from 'node-fetch';
import { faker } from '@faker-js/faker';
import { insertCat } from '../repository/catsDb';
import { insertComment } from '../repository/commentsDb';
import { getAllUsers } from '../repository/usersDb';
import { strayCatComments, strayCatDescriptions, strayCatTitles, safeUrbanCoordinates } from './strayCat';
import { GeoapifyService } from './geoapify';
import pool from '../config/db';

// Inizializza il servizio Geoapify
const geoapifyService = new GeoapifyService(process.env.GEOAPIFY_API_KEY || '');

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
async function isValidLandCoordinate(latitude: number, longitude: number): Promise<boolean> {
  const validation = await geoapifyService.validateAndParseCoordinates(latitude, longitude);
  return validation.valid;
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
      GeoapifyService.calculateDistance(candidateLat, candidateLon, existing.lat, existing.lon) < CONFIG.MIN_DISTANCE
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
    GeoapifyService.calculateDistance(latitude, longitude, existing.lat, existing.lon) < CONFIG.MIN_DISTANCE
  );
  
  return hasOverlap 
    ? generateOptimalCoordinates({ latitude, longitude })
    : { lat: latitude, lon: longitude };
}

function getRandomCoordsInCity(): { latitude: number; longitude: number; city: string } {
  const cityData = faker.helpers.arrayElement(safeUrbanCoordinates);
  
  // Usa direttamente le coordinate sicure della città per evitare warning
  // Aggiunge solo una piccola variazione per evitare sovrapposizioni
  const smallOffset = 0.002; // ~200m di variazione massima
  const latitude = Number.parseFloat((cityData.lat + (Math.random() - 0.5) * smallOffset).toFixed(6));
  const longitude = Number.parseFloat((cityData.lng + (Math.random() - 0.5) * smallOffset).toFixed(6));
  
  return { 
    latitude, 
    longitude, 
    city: `${cityData.name}, ${cityData.country}` 
  };
}

export function startCronJobs() {
  // Log ridotto per evitare spam
  if (process.env.NODE_ENV === 'development') {
    console.log('Cron jobs avviati');
  }
  
  // Frequenza ottimizzata per ridurre carico
  const interval = process.env.NODE_ENV === 'production' ? '*/15 * * * *' : '*/10 * * * *';
  
  // Crea nuovi avvistamenti
  cron.schedule(interval, async () => {
    try {
      const users = await getAllUsers();
      if (!users.length) return;
      
      // Un solo gatto per volta per ridurre il carico
      await createRandomCatSighting(users);
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Errore nel cron job:', err);
      }
    }
  });

  // Controlli di manutenzione ridotti
  cron.schedule('*/30 * * * *', async () => {
    try {
      await fixInvalidDataOptimized();
      await checkAndFixOverlapsOptimized();
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Errore controlli:', err);
      }
    }
  });
}

async function createRandomCatSighting(users: any[]) {
  const systemUser = faker.helpers.arrayElement(users);
  
  // Ottieni immagine del gatto con timeout
  try {
    const res = await fetch(CAT_API, {
      headers: { 'x-api-key': process.env.CATAPI_KEY ?? '' },
      timeout: 5000 // Timeout di 5 secondi
    });
    const data = await res.json();
    const imageUrl: string | null = data?.[0]?.url ?? null;
    
    if (!imageUrl || imageUrl.toLowerCase().endsWith('.gif')) {
      return; // Exit silenzioso
    }

    const { latitude, longitude, city } = getRandomCoordsInCity();
    
    // Validazione semplificata
    if (!(await isValidLandCoordinate(latitude, longitude))) {
      return; // Exit silenzioso
    }
    
    const adjustedCoords = await adjustPositionIfOverlapping(latitude, longitude);
    
    if (!(await isValidLandCoordinate(adjustedCoords.lat, adjustedCoords.lon))) {
      return; // Exit silenzioso
    }
    
    const title = faker.helpers.arrayElement(strayCatTitles);
    const description = `${faker.helpers.arrayElement(strayCatDescriptions)} (${city})`;

    const cat = await insertCat({
      user_id: systemUser.id,
      title,
      description,
      image_url: imageUrl,
      latitude: adjustedCoords.lat,
      longitude: adjustedCoords.lon,
      status: 'active'
    });

    // Aggiungi commenti casuali con probabilità ridotta
    if (Math.random() < 0.7) { // 70% di probabilità di avere commenti
      const nComments = faker.number.int({ min: 1, max: 2 });
      for (let i = 0; i < nComments; i++) {
        const commenter = faker.helpers.arrayElement(users);
        const content = faker.helpers.arrayElement(strayCatComments);
        await insertComment(commenter.id, { cat_id: Number(cat.id), content });
      }
    }

    // Log ridotto
    if (process.env.NODE_ENV === 'development' && Math.random() < 0.1) { // Log solo 10% delle volte
      console.log(`Nuovo avvistamento: ${cat.id} in ${city}`);
    }
  } catch (err) {
    // Log solo errori critici in development
    if (process.env.NODE_ENV === 'development' && Math.random() < 0.05) {
      console.error('Errore nella creazione avvistamento:', err);
    }
    return;
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
    const validation = await geoapifyService.validateAndParseCoordinates(cat.latitude, cat.longitude);
    
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
    const distance = GeoapifyService.calculateDistance(pair.lat1, pair.lon1, pair.lat2, pair.lon2);
    
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
  
  // Log ridotto - solo se ci sono state correzioni significative
  if (correctedCount > 5 && process.env.NODE_ENV === 'development') {
    console.log(`Corrette ${correctedCount} sovrapposizioni`);
    coordinatesCache.clear();
  }
}

// Esportazioni consolidate
export { 
  adjustPositionIfOverlapping, 
  checkAndFixOverlapsOptimized, 
  fixInvalidDataOptimized,
  generateOptimalCoordinates
};
