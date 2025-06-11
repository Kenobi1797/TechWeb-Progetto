import { Request, Response } from 'express';
import pool from '../config/db';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

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
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET as string, { expiresIn: '1h' });
    res.status(201).json({ message: 'Registrazione avvenuta con successo', token, user });
  } catch (error: unknown) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as any).code === '23505'
    ) {
      // Violazione di vincolo UNIQUE
      const detail = (error as any)?.detail as string;
      if (detail?.includes('email')) {
        return res.status(400).json({ error: 'Email già registrata' });
      }
      if (detail?.includes('username')) {
        return res.status(400).json({ error: 'Username già registrato' });
      }
      return res.status(400).json({ error: 'Utente già registrato' });
    }
    res.status(500).json({ error: 'Errore durante la registrazione', details: (error as any).message });
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
      return res.status(401).json({ error: 'Credenziali non valide' });
    }
    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Credenziali non valide' });
    }
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET as string, { expiresIn: '1h' });
    res.json({ message: 'Login effettuato', token, user: { id: user.id, username: user.username, email: user.email } });
  } catch (error: unknown) {
    res.status(500).json({ error: 'Errore durante il login', details: (error as any).message });
  }
};
