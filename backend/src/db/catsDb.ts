import pool from '../config/db';
import { Cat } from './types';

export async function getAllCats(): Promise<Cat[]> {
  const r = await pool.query<Cat>('SELECT * FROM cats ORDER BY created_at DESC');
  return r.rows;
}

export async function getCatById(id: number): Promise<Cat | null> {
  const r = await pool.query<Cat>('SELECT * FROM cats WHERE id = $1', [id]);
  return r.rows[0] || null;
}

export async function insertCat(
  user_id: number,
  title: string,
  description: string | null,
  image_url: string | null,
  latitude: number,
  longitude: number
): Promise<Cat> {
  const r = await pool.query<Cat>(
    `INSERT INTO cats (user_id, title, description, image_url, latitude, longitude)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [user_id, title, description, image_url, latitude, longitude]
  );
  return r.rows[0];
}

export async function deleteCat(id: number): Promise<void> {
  await pool.query('DELETE FROM cats WHERE id = $1', [id]);
}
