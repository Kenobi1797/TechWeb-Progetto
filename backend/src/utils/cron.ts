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
  const latitude = faker.number.float({ min: city.latMin, max: city.latMax, fractionDigits: 4 });
  const longitude = faker.number.float({ min: city.lonMin, max: city.lonMax, fractionDigits: 4 });
  return { latitude, longitude, city: city.name };
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
        // Correggi coordinate se fuori da tutte le città
        const found = cityRegions.find(c =>
          cat.latitude >= c.latMin && cat.latitude <= c.latMax &&
          cat.longitude >= c.lonMin && cat.longitude <= c.lonMax
        );
        if (!found) {
          const { latitude, longitude, city } = getRandomCoordsInCity();
          newDescription = `${faker.helpers.arrayElement(strayCatDescriptions)} (coordinata corretta in ${city})`;
          await pool.query(
            'UPDATE cats SET latitude = $1, longitude = $2, description = $3 WHERE id = $4',
            [latitude, longitude, newDescription, cat.id]
          );
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

