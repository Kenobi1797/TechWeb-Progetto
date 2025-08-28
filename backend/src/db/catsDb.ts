import pool from '../config/db';
import { Cat } from '../utils/types';

// Funzione base per query singola
async function queryCat(query: string, values: unknown[]): Promise<Cat | null> {
  const r = await pool.query<Cat>(query, values);
  return r.rows[0] || null;
}

// Funzione base per query multiple
async function queryCats(query: string, values: unknown[] = []): Promise<Cat[]> {
  const r = await pool.query<Cat>(query, values);
  return r.rows;
}

export const getAllCats = (): Promise<Cat[]> => 
  queryCats('SELECT * FROM cats ORDER BY created_at DESC');

export const getCatById = (id: number): Promise<Cat | null> => 
  queryCat('SELECT * FROM cats WHERE id = $1', [id]);

export const getCatsByUserId = (user_id: number): Promise<Cat[]> => 
  queryCats('SELECT * FROM cats WHERE user_id = $1 ORDER BY created_at DESC', [user_id]);

export async function insertCat(
  user_id: number,
  title: string,
  description: string | null,
  image_url: string | null,
  latitude: number,
  longitude: number,
  status: 'active' | 'adopted' | 'moved' = 'active'
): Promise<Cat> {
  const cat = await queryCat(
    `INSERT INTO cats (user_id, title, description, image_url, latitude, longitude, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
    [user_id, title, description, image_url, latitude, longitude, status]
  );
  return cat!; // Safe because INSERT sempre ritorna un record
}

export const deleteCat = (id: number): Promise<void> => 
  pool.query('DELETE FROM cats WHERE id = $1', [id]).then();

export const updateCatStatus = (
  id: number,
  status: 'active' | 'adopted' | 'moved'
): Promise<Cat | null> => 
  queryCat('UPDATE cats SET status = $1 WHERE id = $2 RETURNING *', [status, id]);
