import pool from '../config/db';
import { User } from '../utils/types';

// Funzione base per query singola utente
async function queryUser(query: string, values: unknown[]): Promise<User | null> {
  const r = await pool.query<User>(query, values);
  return r.rows[0] || null;
}

// Funzione base per query multiple utenti
async function queryUsers(query: string, values: unknown[] = []): Promise<User[]> {
  const r = await pool.query<User>(query, values);
  return r.rows;
}

export const getUserByEmail = (email: string): Promise<User | null> =>
  queryUser('SELECT * FROM users WHERE email = $1', [email]);

export const getUserById = (id: number): Promise<User | null> =>
  queryUser('SELECT * FROM users WHERE id = $1', [id]);

export const getAllUsers = (): Promise<User[]> =>
  queryUsers('SELECT * FROM users');

export async function insertUser(username: string, email: string, password_hash: string): Promise<User> {
  const user = await queryUser(
    'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING *',
    [username, email, password_hash]
  );
  return user!; // Safe because INSERT sempre ritorna un record
}
