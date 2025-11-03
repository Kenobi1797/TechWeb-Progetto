import pool from '../config/db';
import { User, UserSchema } from '../dto/UserDto';

// Funzione base per query singola utente con validazione
async function queryUser(query: string, values: unknown[]): Promise<User | null> {
  const result = await pool.query(query, values);
  const row = result.rows[0];
  return row ? UserSchema.parse(row) : null;
}

// Funzione base per query multiple utenti con validazione
async function queryUsers(query: string, values: unknown[] = []): Promise<User[]> {
  const result = await pool.query(query, values);
  return result.rows.map(row => UserSchema.parse(row));
}

export const getUserByEmail = async (email: string): Promise<User | null> => {
  const query = 'SELECT * FROM users WHERE email = $1';
  return queryUser(query, [email]);
};

export const getUserById = async (id: number): Promise<User | null> => {
  const query = 'SELECT * FROM users WHERE id = $1';
  return queryUser(query, [id]);
};

export const getAllUsers = async (): Promise<User[]> => {
  const query = 'SELECT * FROM users';
  return queryUsers(query);
};

export async function insertUser(
  username: string,
  email: string,
  password_hash: string
): Promise<User> {
  const query = `
    INSERT INTO users (username, email, password_hash)
    VALUES ($1, $2, $3)
    RETURNING *
  `;
  const values = [username, email, password_hash];
  
  const user = await queryUser(query, values);
  if (!user) {
    throw new Error('Failed to insert user');
  }
  return user;
}
