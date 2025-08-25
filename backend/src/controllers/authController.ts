import { Request, Response } from 'express';
import pool from '../config/db';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

interface AuthRequest extends Request {
  user?: { userId: number };
}

// Funzione per generare refresh token
const generateRefreshToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

// Funzione per salvare refresh token nel database
const saveRefreshToken = async (userId: number, refreshToken: string): Promise<void> => {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30); // 30 giorni
  
  await pool.query(
    'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
    [userId, refreshToken, expiresAt]
  );
};

// Funzione per revocare refresh token
const revokeRefreshToken = async (refreshToken: string): Promise<void> => {
  await pool.query('DELETE FROM refresh_tokens WHERE token = $1', [refreshToken]);
};

// Funzione per pulire token scaduti
const cleanupExpiredTokens = async (): Promise<void> => {
  await pool.query('DELETE FROM refresh_tokens WHERE expires_at < NOW()');
};

export const register = async (req: Request, res: Response) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Tutti i campi sono obbligatori' });
  }
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email, created_at',
      [username, email, hashedPassword]
    );
    const user = result.rows[0];
    
    // Genera access token (durata media per UX migliore)
    const accessToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET as string, { expiresIn: '1h' });
    
    // Genera refresh token (lunga durata)
    const refreshToken = generateRefreshToken();
    await saveRefreshToken(user.id, refreshToken);
    
    // Pulisci token scaduti
    await cleanupExpiredTokens();
    
    res.status(201).json({ 
      message: 'Registrazione avvenuta con successo', 
      accessToken, 
      refreshToken,
      user 
    });
  } catch (error: unknown) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code?: string }).code === '23505'
    ) {
      // Violazione di vincolo UNIQUE
      const detail = (error as { detail?: string })?.detail as string;
      if (detail?.includes('email')) {
        return res.status(400).json({ error: 'Email già registrata' });
      }
      if (detail?.includes('username')) {
        return res.status(400).json({ error: 'Username già registrato' });
      }
      return res.status(400).json({ error: 'Utente già registrato' });
    }
    res.status(500).json({ error: 'Errore durante la registrazione', details: (error as { message?: string }).message });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email e password sono obbligatori' });
  }
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Credenziali non corrette' });
    }
    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Credenziali non corrette' });
    }
    
    // Genera access token (durata media per UX migliore)
    const accessToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET as string, { expiresIn: '1h' });
    
    // Genera refresh token (lunga durata)
    const refreshToken = generateRefreshToken();
    await saveRefreshToken(user.id, refreshToken);
    
    // Pulisci token scaduti
    await cleanupExpiredTokens();
    
    res.json({ 
      message: 'Login effettuato', 
      accessToken, 
      refreshToken,
      user: { id: user.id, username: user.username, email: user.email } 
    });
  } catch (error: unknown) {
    res.status(500).json({ error: 'Errore durante il login', details: (error as { message?: string }).message });
  }
};

export const logout = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  
  if (refreshToken) {
    try {
      await revokeRefreshToken(refreshToken);
    } catch (error) {
      console.error('Errore nella revoca del refresh token:', error);
    }
  }
  
  res.json({ message: 'Logout effettuato con successo' });
};

export const refreshToken = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  
  if (!refreshToken) {
    return res.status(401).json({ error: 'Refresh token mancante' });
  }
  
  try {
    // Verifica se il refresh token esiste ed è valido
    const result = await pool.query(
      'SELECT rt.*, u.id, u.username, u.email FROM refresh_tokens rt JOIN users u ON rt.user_id = u.id WHERE rt.token = $1 AND rt.expires_at > NOW()',
      [refreshToken]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Refresh token non valido o scaduto' });
    }
    
    const tokenData = result.rows[0];
    const user = {
      id: tokenData.id,
      username: tokenData.username,
      email: tokenData.email
    };
    
    // Revoca il vecchio refresh token (rotation)
    await revokeRefreshToken(refreshToken);
    
    // Genera nuovo access token (durata media per UX migliore)
    const newAccessToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET as string, { expiresIn: '1h' });
    
    // Genera nuovo refresh token
    const newRefreshToken = generateRefreshToken();
    await saveRefreshToken(user.id, newRefreshToken);
    
    // Pulisci token scaduti
    await cleanupExpiredTokens();
    
    res.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      user
    });
  } catch (error: unknown) {
    res.status(500).json({ error: 'Errore durante il refresh del token', details: (error as { message?: string }).message });
  }
};
