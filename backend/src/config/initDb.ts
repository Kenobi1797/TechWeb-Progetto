import pool from './db';

async function initDb(): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS cats (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      description TEXT,
      image_url TEXT,
      latitude DOUBLE PRECISION NOT NULL,
      longitude DOUBLE PRECISION NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS comments (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      cat_id INTEGER REFERENCES cats(id) ON DELETE CASCADE,
      content TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Inserisci 10 utenti di prova solo se la tabella è vuota
  const { rows } = await pool.query('SELECT COUNT(*) FROM users');
  if (rows[0].count === "0") {
    await pool.query(`
      INSERT INTO users (username, email, password_hash) VALUES
      ('MarcoRossi', 'marco.rossi@example.com', '$2b$10$hash1'),
      ('LucaBianchi', 'luca.bianchi@example.com', '$2b$10$hash2'),
      ('AnnaVerdi', 'anna.verdi@example.com', '$2b$10$hash3'),
      ('GiuliaBruni', 'giulia.bruni@example.com', '$2b$10$hash4'),
      ('PaoloNeri', 'paolo.neri@example.com', '$2b$10$hash5'),
      ('FrancescaGialli', 'francesca.gialli@example.com', '$2b$10$hash6'),
      ('GiorgioMarrone', 'giorgio.marrone@example.com', '$2b$10$hash7'),
      ('MartinaBlu', 'martina.blu@example.com', '$2b$10$hash8'),
      ('AlessandroRicci', 'alessandro.ricci@example.com', '$2b$10$hash9'),
      ('ValentinaNeri', 'valentina.neri@example.com', '$2b$10$hash10');
    `);
    console.log('✅ 10 utenti di prova inseriti');
  }

  console.log('✅ Database inizializzato (tabelle create se non esistono)');
}

export default initDb;
