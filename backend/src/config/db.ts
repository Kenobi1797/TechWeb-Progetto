import { Pool, PoolConfig } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Configurazione ottimizzata del pool con valori sensati per performance
const poolConfig: PoolConfig = {
  connectionString: process.env.DATABASE_URL,
  max: 20, // Massimo 20 connessioni
  idleTimeoutMillis: 30000, // 30 secondi timeout per connessioni idle
  connectionTimeoutMillis: 2000, // 2 secondi timeout per connessione
};

const pool = new Pool(poolConfig);

// Gestione degli errori del pool
pool.on('error', (err) => {
  console.error('Errore inaspettato nel pool del database:', err);
  process.exit(-1);
});

export default pool;
