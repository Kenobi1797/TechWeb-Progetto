import pool from '../config/db';
import { User } from '../config/types';

export async function getUserByEmail(email: string): Promise<User | null> {
  const r = await pool.query<User>('SELECT * FROM users WHERE email = $1', [email]);
  return r.rows[0] || null;
}

export async function getUserById(id: number): Promise<User | null> {
  const r = await pool.query<User>('SELECT * FROM users WHERE id = $1', [id]);
  return r.rows[0] || null;
}

export async function insertUser(username: string, email: string, password_hash: string): Promise<User> {
  const r = await pool.query<User>(
    'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING *',
    [username, email, password_hash]
  );
  return r.rows[0];
}

export async function getAllUsers(): Promise<User[]> {
  const r = await pool.query<User>('SELECT * FROM users');
  return r.rows;
}
