import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import initDb from './config/initDb';
import authRoutes from './routes/auth';
import catRoutes from './routes/cats';
import commentRoutes from './routes/comments';
import geocodeRoutes from './routes/geocode';
import { startCronJobs } from './utils/cron';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Log delle richieste solo in ambiente di sviluppo
if (process.env.NODE_ENV === 'development') {
  app.use((req: Request, res: Response, next: NextFunction) => {
    console.log(`${req.method} ${req.url}`);
    next();
  });
}

app.use('/auth', authRoutes);
app.use('/uploads', express.static('uploads'));
app.use('/cats', catRoutes);
app.use('/comments', commentRoutes);
app.use('/geocode', geocodeRoutes);

// Espone la chiave MapTiler solo in sviluppo
app.get('/maptiler-key', (req, res) => {
  res.json({ key: process.env.NODE_ENV === 'production' ? undefined : process.env.MAPTILER_KEY ?? "" });
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
