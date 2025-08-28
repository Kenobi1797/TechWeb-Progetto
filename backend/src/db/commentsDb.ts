import pool from '../config/db';
import { Comment } from '../utils/types';

// Funzione base per query commenti
async function queryComments(query: string, values: unknown[]): Promise<Comment[]> {
  const r = await pool.query<Comment>(query, values);
  return r.rows;
}

// Funzione base per query singolo commento
async function queryComment(query: string, values: unknown[]): Promise<Comment | null> {
  const r = await pool.query<Comment>(query, values);
  return r.rows[0] || null;
}

export const getCommentsByCatId = (cat_id: number): Promise<Comment[]> =>
  queryComments(
    `SELECT comments.*, users.username
     FROM comments
     JOIN users ON users.id = comments.user_id
     WHERE cat_id = $1
     ORDER BY created_at ASC`,
    [cat_id]
  );

export async function insertComment(user_id: number, cat_id: number, content: string): Promise<Comment> {
  const comment = await queryComment(
    'INSERT INTO comments (user_id, cat_id, content) VALUES ($1, $2, $3) RETURNING *',
    [user_id, cat_id, content]
  );
  return comment!; // Safe because INSERT sempre ritorna un record
}
