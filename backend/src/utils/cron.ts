import cron from 'node-cron';
import fetch from 'node-fetch';
import { faker } from '@faker-js/faker';
import { insertCat } from '../db/catsDb';
import { insertComment } from '../db/commentsDb';
import { getAllUsers } from '../db/usersDb';
import { strayCatComments } from './strayCatComments';

const CAT_API = 'https://api.thecatapi.com/v1/images/search?limit=1';

// Coordinate plausibili per l'Italia
function getRandomItalianCoords() {
  const latRange = [37.0, 46.5];
  const lonRange = [6.6, 13.9];
  const latitude = faker.number.float({ min: latRange[0], max: latRange[1], fractionDigits: 4 });
  const longitude = faker.number.float({ min: lonRange[0], max: lonRange[1], fractionDigits: 4 });
  return { latitude, longitude };
}

export function startCronJobs() {
  // Schedula un job che si attiva ogni 10 minuti
  cron.schedule('*/10 * * * *', async () => {
    try {
      // Ottieni tutti gli utenti dal database
      const users = await getAllUsers();
      // Se non ci sono utenti, esci
      if (!users.length) return;
      // Crea 2 nuovi avvistamenti per ogni esecuzione del job
      for (let j = 0; j < 2; j++) {
        // Scegli casualmente un utente che pubblicherà l'avvistamento
        const systemUser = faker.helpers.arrayElement(users);

        // Richiedi un'immagine casuale di gatto dall'API esterna
        const res = await fetch(CAT_API, {
          headers: { 'x-api-key': process.env.CATAPI_KEY ?? '' }
        });
        const data = await res.json();
        const imageUrl: string | null = data?.[0]?.url ?? null;
        // Se l'immagine è una GIF, scartala (preferiamo solo immagini statiche)
        if (!imageUrl || imageUrl.toLowerCase().endsWith('.gif')) {
          continue;
        }
        // Genera coordinate casuali per la posizione dell'avvistamento
        const { latitude, longitude } = getRandomItalianCoords();
        // Genera un titolo casuale per l'avvistamento
        const title = faker.word.noun({ length: { min: 5, max: 15 } });
        // Genera una descrizione casuale
        const description = faker.helpers.arrayElement([
          "Gatto avvistato nei pressi del parcheggio.",
          "Era nascosto sotto una macchina.",
          "Sembrava affamato e spaesato.",
          "Gatto molto docile e tranquillo.",
          "Ha miagolato quando mi sono avvicinato.",
          "Si aggirava tra i cespugli vicino al parco.",
          "Sembrava spaventato dai rumori del traffico.",
          "Ha seguito alcune persone fino all'ingresso del supermercato.",
          "Si è rifugiato sotto una panchina durante la pioggia.",
          "Ha il pelo arruffato e sembra aver bisogno di cure."
        ]);

        // Inserisci il nuovo avvistamento nel database
        const cat = await insertCat(
          systemUser.id, // ID dell'utente che pubblica
          title,         // Titolo dell'avvistamento
          description,   // Descrizione
          imageUrl,      // URL dell'immagine del gatto
          latitude,      // Latitudine
          longitude      // Longitudine
        );

        // Determina quanti commenti casuali aggiungere (tra 1 e 3)
        const nComments = faker.number.int({ min: 1, max: 3 });
        for (let i = 0; i < nComments; i++) {
          // Scegli casualmente un utente che commenterà
          const commenter = faker.helpers.arrayElement(users);
          // Scegli casualmente un contenuto per il commento
          const content = faker.helpers.arrayElement(strayCatComments);
          // Inserisci il commento nel database
          await insertComment(commenter.id, Number(cat.id), content);
        }

        // Log di conferma per debug
        console.log(`Cron: creato avvistamento #${cat.id} con ${nComments} commenti`);
      }
    } catch (err) {
      // Gestione degli errori: stampa l'errore in console
      console.error('Errore nel cron job:', err);
    }
  });
}

