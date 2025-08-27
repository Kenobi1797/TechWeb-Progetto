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
const CITY_PROXIMITY_RADIUS = 0.03;

// Funzione migliorata per validare coordinate che non siano in mare
function isValidLandCoordinate(latitude: number, longitude: number): boolean {
  // Usa la validazione avanzata che include controlli anti-mare
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

  // Ogni 6 ore esegui una correzione completa delle coordinate marine
  cron.schedule('0 */6 * * *', async () => {
    try {
      await fixMarineCoordinates();
      console.log('Cron: correzione coordinate marine completata.');
    } catch (err) {
      console.error('Errore correzione coordinate marine:', err);
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
  // Aggiorna descrizioni dei gatti non coerenti e correggi coordinate fuori città o in mare
  const { rows: cats } = await pool.query('SELECT id, description, latitude, longitude FROM cats');
  
  for (const cat of cats) {
    // Correggi descrizione se non coerente
    let updateDesc = false;
    let newDescription = cat.description;
    
    if (!strayCatDescriptions.some(d => cat.description?.startsWith(d))) {
      newDescription = faker.helpers.arrayElement(strayCatDescriptions);
      updateDesc = true;
    }
    
    // Usa la nuova validazione avanzata per verificare coordinate
    const validation = validateAndParseCoordinates(cat.latitude, cat.longitude);
    
    if (!validation.valid || validation.latitude !== cat.latitude || validation.longitude !== cat.longitude) {
      // Le coordinate sono state corrette o sono invalide
      const { latitude, longitude, city } = getRandomCoordsInCity();
      newDescription = `${faker.helpers.arrayElement(strayCatDescriptions)} (coordinata corretta in ${city})`;
      
      await pool.query(
        'UPDATE cats SET latitude = $1, longitude = $2, description = $3 WHERE id = $4',
        [latitude, longitude, newDescription, cat.id]
      );
      console.log(`Cron: Coordinate corrette per gatto #${cat.id} in ${city} (erano in mare o non valide)`);
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

/**
 * Corregge tutte le coordinate marine nel database (versione completa per cron)
 * Questa funzione viene eseguita periodicamente per mantenere pulite le coordinate
 */
async function fixMarineCoordinates(): Promise<void> {
  console.log('Cron: Inizio correzione coordinate marine nel database...');
  
  try {
    // Ottieni tutti i gatti con le loro coordinate
    const { rows: cats } = await pool.query('SELECT id, title, latitude, longitude FROM cats');
    
    let correctedCount = 0;
    
    for (const cat of cats) {
      // Valida le coordinate attuali
      const validation = validateAndParseCoordinates(cat.latitude, cat.longitude);
      
      // Se le coordinate sono state corrette automaticamente (erano in mare)
      if (validation.valid && 
          (validation.latitude !== cat.latitude || validation.longitude !== cat.longitude)) {
        
        // Aggiorna le coordinate nel database
        await pool.query(
          'UPDATE cats SET latitude = $1, longitude = $2 WHERE id = $3',
          [validation.latitude, validation.longitude, cat.id]
        );
        
        correctedCount++;
        console.log(`Cron: Gatto #${cat.id} "${cat.title}": coordinate corrette da (${cat.latitude}, ${cat.longitude}) a (${validation.latitude}, ${validation.longitude})`);
      }
      // Se le coordinate sono completamente invalide, assegna coordinate di una città sicura
      else if (!validation.valid) {
        const safeCity = faker.helpers.arrayElement(safeUrbanCoordinates);
        
        await pool.query(
          'UPDATE cats SET latitude = $1, longitude = $2 WHERE id = $3',
          [safeCity.lat, safeCity.lng, cat.id]
        );
        
        correctedCount++;
        console.log(`Cron: Gatto #${cat.id} "${cat.title}": coordinate invalide sostituite con ${safeCity.name}, ${safeCity.country}`);
      }
    }
    
    console.log(`Cron: Correzione completata! ${correctedCount} coordinate corrette su ${cats.length} totali.`);
    
    if (correctedCount === 0) {
      console.log('Cron: Tutte le coordinate erano già valide e sulla terraferma!');
    }
    
  } catch (error) {
    console.error('Cron: Errore durante la correzione delle coordinate:', error);
    throw error;
  }
}

