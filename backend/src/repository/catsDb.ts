import pool from '../config/db';
import { Cat, CreateCatDTO, CatSchema, UpdateCatStatusDTO } from '../dto/CatsDto';

// Funzione base per query singola con validazione
async function queryCat(query: string, values: unknown[]): Promise<Cat | null> {
  const result = await pool.query(query, values);
  const row = result.rows[0];
  return row ? CatSchema.parse(row) : null;
}

// Funzione base per query multiple con validazione
async function queryCats(query: string, values: unknown[] = []): Promise<Cat[]> {
  const result = await pool.query(query, values);
  return result.rows.map(row => CatSchema.parse(row));
}

export const getAllCats = async (): Promise<Cat[]> => {
  const query = 'SELECT * FROM cats ORDER BY created_at DESC';
  return queryCats(query);
};

export const getCatById = async (id: number): Promise<Cat | null> => {
  const query = 'SELECT * FROM cats WHERE id = $1';
  return queryCat(query, [id]);
};

export const getCatsByUserId = async (user_id: number): Promise<Cat[]> => {
  const query = 'SELECT * FROM cats WHERE user_id = $1 ORDER BY created_at DESC';
  return queryCats(query, [user_id]);
};

export async function insertCat(data: CreateCatDTO): Promise<Cat> {
  const { user_id, title, description, image_url, latitude, longitude, status = 'active' } = data;
  
  const query = `
    INSERT INTO cats (user_id, title, description, image_url, latitude, longitude, status)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *
  `;
  const values = [user_id, title, description, image_url, latitude, longitude, status];
  
  const cat = await queryCat(query, values);
  if (!cat) {
    throw new Error('Failed to insert cat');
  }
  return cat;
}

export const deleteCat = async (id: number): Promise<void> => {
  const query = 'DELETE FROM cats WHERE id = $1';
  await pool.query(query, [id]);
};

export const updateCatStatus = async (id: number, data: UpdateCatStatusDTO): Promise<Cat | null> => {
  const query = 'UPDATE cats SET status = $1 WHERE id = $2 RETURNING *';
  return queryCat(query, [data.status, id]);
};
