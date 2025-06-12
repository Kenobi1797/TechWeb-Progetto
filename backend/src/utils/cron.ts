import cron from 'node-cron';
import fetch from 'node-fetch';
import { faker } from '@faker-js/faker';
import { insertCat } from '../db/catsDb';
import { insertComment } from '../db/commentsDb';
import { getAllUsers } from '../db/usersDb';

const CAT_API = 'https://api.thecatapi.com/v1/images/search?limit=1';

export function startCronJobs() {
  // Ogni 10 minuti crea 2 nuovi avvistamenti con commenti random
  cron.schedule('*/10 * * * *', async () => {
    try {
      const users = await getAllUsers();
      if (!users.length) return;
      for (let j = 0; j < 2; j++) {
        const systemUser = faker.helpers.arrayElement(users);

        const res = await fetch(CAT_API, {
          headers: { 'x-api-key': process.env.CATAPI_KEY ?? '' }
        });
        const data = await res.json();
        let imageUrl = data?.[0]?.url ?? null;
        // Salta se è una GIF
        if (imageUrl?.toLowerCase().endsWith('.gif')) {
          console.log('Cron: immagine GIF scartata:', imageUrl);
          continue;
        }
        if (!imageUrl) continue;

        const latitude = parseString(faker.location.latitude().toString());
        const longitude = parseString(faker.location.longitude().toString());
        const title = faker.word.noun({ length: { min: 5, max: 15 } });
        const description = faker.hacker.phrase();

        const cat = await insertCat(
          systemUser.id,
          title,
          description,
          imageUrl,
          latitude,
          longitude
        );

        // 1–3 commenti casuali
        const nComments = faker.number.int({ min: 1, max: 3 });
        for (let i = 0; i < nComments; i++) {
          const commenter = faker.helpers.arrayElement(users);
          const content = faker.hacker.phrase();
          await insertComment(commenter.id, Number(cat.id), content);
        }

        console.log(`Cron: creato cat ${cat.id} e ${nComments} commenti`);
      }
    } catch (err) {
      console.error('Errore cron job:', err);
    }
  });
}
function parseString(value: string): number {
  const num = parseFloat(value);
  if (isNaN(num)) {
    throw new Error(`Invalid number string: ${value}`);
  }
  return num;
}

