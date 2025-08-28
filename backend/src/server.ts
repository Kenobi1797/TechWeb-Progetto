import express, { Request, Response, NextFunction } from 'express';
import compression from 'compression';
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
const isDev = process.env.NODE_ENV === 'development';

// Configurazione middleware consolidata
const setupMiddleware = () => {
  app.use(cors({
    origin: isDev 
      ? ['http://localhost:3000', 'http://127.0.0.1:3000']
      : ['https://your-domain.com'], // Aggiorna con dominio reale
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  }));

  app.use(express.json({ limit: '10mb' }));
  app.use(compression());

  // Logging semplificato per sviluppo
  if (isDev) {
    app.use((req: Request, res: Response, next: NextFunction) => {
      if (!req.method.startsWith('GET') || req.url.includes('/debug/')) {
        console.log(`${req.method} ${req.url}`);
      }
      next();
    });
  }
};

// Configurazione rotte consolidata
const setupRoutes = () => {
  app.use('/auth', authRoutes);
  app.use('/cats', catRoutes);
  app.use('/comments', commentRoutes);
  app.use('/geocode', geocodeRoutes);

  // Endpoint specifici per sviluppo
  if (isDev) {
    app.get('/maptiler-key', (req, res) => {
      res.json({ key: process.env.MAPTILER_KEY ?? "" });
    });

    app.get('/debug/users', async (req, res) => {
      try {
        const { default: pool } = await import('./config/db');
        const result = await pool.query('SELECT id, username, email FROM users ORDER BY id');
        res.json(result.rows);
      } catch (err) {
        console.error('Errore debug users:', err);
        res.status(500).json({ error: 'Errore nel recupero utenti' });
      }
    });
  }
};

// Gestione errori consolidata
const setupErrorHandling = () => {
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    // Mappa errori Multer
    const multerErrors: Record<string, string> = {
      'LIMIT_FILE_SIZE': 'File troppo grande (max 5MB)',
      'LIMIT_FILE_COUNT': 'Troppi file caricati',
      'LIMIT_UNEXPECTED_FILE': 'Campo file non atteso'
    };

    if (err.code && multerErrors[err.code]) {
      return res.status(400).json({ error: multerErrors[err.code] });
    }

    if (err.message?.includes('Formato file non supportato')) {
      return res.status(400).json({ error: err.message });
    }

    console.error('Errore del server:', err);
    res.status(500).json({ error: 'Errore interno del server' });
  });
};

// Inizializzazione server
const startServer = async () => {
  try {
    await initDb();
    
    if (process.env.NODE_ENV !== 'test') {
      startCronJobs();
      if (isDev) console.log('Cron jobs attivati');
    }

    const PORT = Number(process.env.PORT ?? 5000);
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  } catch (err) {
    console.error('Errore durante l\'inizializzazione del database:', err);
    process.exit(1);
  }
};

// Setup e avvio
setupMiddleware();
setupRoutes();
setupErrorHandling();
startServer();
