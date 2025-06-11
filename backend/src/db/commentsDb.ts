import pool from '../config/db';
import { Comment } from './types';

export async function getCommentsByCatId(cat_id: number): Promise<Comment[]> {
  const r = await pool.query<Comment>(
    `SELECT comments.*, users.username
     FROM comments
     JOIN users ON users.id = comments.user_id
     WHERE cat_id = $1
     ORDER BY created_at ASC`,
    [cat_id]
  );
  return r.rows;
}

export async function insertComment(user_id: number, cat_id: number, content: string): Promise<Comment> {
  const r = await pool.query<Comment>(
    `INSERT INTO comments (user_id, cat_id, content)
     VALUES ($1, $2, $3) RETURNING *`,
    [user_id, cat_id, content]
  );
  return r.rows[0];
}
