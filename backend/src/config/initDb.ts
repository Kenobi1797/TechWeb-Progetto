import pool from './db';
import bcrypt from 'bcrypt';

async function initDb(): Promise<void> {
  // Crea le tabelle base
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
      status TEXT DEFAULT 'active' CHECK (status IN ('active', 'adopted', 'moved')),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS comments (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      cat_id INTEGER REFERENCES cats(id) ON DELETE CASCADE,
      content TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS refresh_tokens (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      token TEXT UNIQUE NOT NULL,
      expires_at TIMESTAMP NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Inserisci 10 utenti di prova solo se la tabella è vuota
  const { rows } = await pool.query('SELECT COUNT(*) FROM users');
  if (rows[0].count === "0") {
    // Utenti di prova con password: username + numero + punto
    const testUsers = [
      { username: 'MarcoRossi', email: 'marco.rossi@example.com', password: 'MarcoRossi1.' },
      { username: 'LucaBianchi', email: 'luca.bianchi@example.com', password: 'LucaBianchi2.' },
      { username: 'AnnaVerdi', email: 'anna.verdi@example.com', password: 'AnnaVerdi3.' },
      { username: 'GiuliaBruni', email: 'giulia.bruni@example.com', password: 'GiuliaBruni4.' },
      { username: 'PaoloNeri', email: 'paolo.neri@example.com', password: 'PaoloNeri5.' },
      { username: 'FrancescaGialli', email: 'francesca.gialli@example.com', password: 'FrancescaGialli6.' },
      { username: 'GiorgioMarrone', email: 'giorgio.marrone@example.com', password: 'GiorgioMarrone7.' },
      { username: 'MartinaBlu', email: 'martina.blu@example.com', password: 'MartinaBlu8.' },
      { username: 'AlessandroRicci', email: 'alessandro.ricci@example.com', password: 'AlessandroRicci9.' },
      { username: 'ValentinaNeri', email: 'valentina.neri@example.com', password: 'ValentinaNeri10.' }
    ];

    // Hash delle password e inserimento
    for (const user of testUsers) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      await pool.query(
        'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3)',
        [user.username, user.email, hashedPassword]
      );
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('✅ 10 utenti di prova inseriti con password hashate');
    }
  }

  if (process.env.NODE_ENV === 'development') {
    console.log('✅ Database inizializzato (tabelle create se non esistono)');
  }
}

export default initDb;
