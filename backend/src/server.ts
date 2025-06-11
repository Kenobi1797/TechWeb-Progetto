import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import initDb from './config/initDb';
import authRoutes from './routes/auth';
import catRoutes from './routes/cats';
import commentRoutes from './routes/comments';
import { startCronJobs } from './cron';
import { populateCatsAndComments } from './utils/populateDebug';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Logging semplice delle richieste
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.use('/auth', authRoutes);
app.use('/uploads', express.static('uploads'));
app.use('/cats', catRoutes);
app.use('/comments', commentRoutes);

// Rotta di debug per popolazione manuale
app.post('/debug/populate', async (req, res) => {
  try {
    await populateCatsAndComments();
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Errore durante la popolazione', details: (err as any).message });
  }
});

const PORT = process.env.PORT ?? 5000;

initDb()
  .then(() => {
    startCronJobs();
    app.listen(Number(PORT), () => {
      console.log(`Server listening on port ${PORT}`);
    });
  })
  .catch((err: unknown) => {
    console.error('Errore durante l\'inizializzazione del database:', err);
    process.exit(1);
  });
