import express, { Request, Response, NextFunction } from 'express';
const compression = require('compression');
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

// Configurazione CORS più specifica per supportare credenziali
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-domain.com'] // Sostituire con il dominio reale in produzione
    : ['http://localhost:3000', 'http://127.0.0.1:3000'], // Frontend in sviluppo
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json({ limit: '10mb' })); // Aumentato per supportare immagini Base64
app.use(compression());

// Log delle richieste solo per endpoint importanti
if (process.env.NODE_ENV === 'development') {
  app.use((req: Request, res: Response, next: NextFunction) => {
    // Log solo per richieste POST, PUT, DELETE e non per endpoint frequenti
    const skipUrls = ['/maptiler-key', '/geocode'];
    const shouldLog = !req.method.startsWith('GET') || 
                     !skipUrls.some(url => req.url.startsWith(url));
    
    if (shouldLog) {
      console.log(`${req.method} ${req.url}`);
    }
    next();
  });
}

app.use('/auth', authRoutes);
app.use('/cats', catRoutes);
app.use('/comments', commentRoutes);
app.use('/geocode', geocodeRoutes);

// Espone la chiave MapTiler solo in sviluppo
app.get('/maptiler-key', (req, res) => {
  res.json({ key: process.env.NODE_ENV === 'production' ? undefined : process.env.MAPTILER_KEY ?? "" });
});

// Endpoint debug per vedere utenti in sviluppo
if (process.env.NODE_ENV === 'development') {
  app.get('/debug/users', async (req, res) => {
    try {
      const result = await require('./config/db').default.query('SELECT id, username, email FROM users ORDER BY id');
      res.json(result.rows);
    } catch (err) {
      console.error('Errore debug users:', err);
      res.status(500).json({ error: 'Errore nel recupero utenti' });
    }
  });
}

// Middleware per gestire errori di multer e altri errori
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  // Errori di multer
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: 'File troppo grande (max 5MB)' });
  }
  
  if (err.code === 'LIMIT_FILE_COUNT') {
    return res.status(400).json({ error: 'Troppi file caricati' });
  }
  
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({ error: 'Campo file non atteso' });
  }
  
  // Altri errori multer
  if (err.message?.includes('Formato file non supportato')) {
    return res.status(400).json({ error: err.message });
  }
  
  // Errori generici
  console.error('Errore del server:', err);
  res.status(500).json({ error: 'Errore interno del server' });
});

const PORT = process.env.PORT ?? 5000;

initDb()
  .then(() => {
    // Avvia cron jobs sempre tranne in test
    if (process.env.NODE_ENV !== 'test') {
      startCronJobs();
      console.log('Cron jobs attivati');
    }
    app.listen(Number(PORT), () => {
      console.log(`Server listening on port ${PORT}`);
    });
  })
  .catch((err: unknown) => {
    console.error('Errore durante l\'inizializzazione del database:', err);
    process.exit(1);
  });
