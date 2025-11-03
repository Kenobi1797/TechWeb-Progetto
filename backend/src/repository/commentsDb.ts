import pool from '../config/db';
import { Comment, CommentSchema, CreateCommentDTO } from '../dto/CommentDto';

// Funzione base per query commenti con validazione
async function queryComments(query: string, values: unknown[]): Promise<Comment[]> {
  const result = await pool.query(query, values);
  return result.rows.map(row => CommentSchema.parse(row));
}

// Funzione base per query singolo commento con validazione
async function queryComment(query: string, values: unknown[]): Promise<Comment | null> {
  const result = await pool.query(query, values);
  const row = result.rows[0];
  return row ? CommentSchema.parse(row) : null;
}

export const getCommentsByCatId = async (cat_id: number): Promise<Comment[]> => {
  const query = `
    SELECT comments.*, users.username
    FROM comments
    JOIN users ON users.id = comments.user_id
    WHERE cat_id = $1
    ORDER BY created_at ASC
  `;
  return queryComments(query, [cat_id]);
};

export async function insertComment(
  user_id: number,
  data: CreateCommentDTO
): Promise<Comment> {
  const query = `
    INSERT INTO comments (user_id, cat_id, content)
    VALUES ($1, $2, $3)
    RETURNING *
  `;
  const values = [user_id, data.cat_id, data.content];
  
  const comment = await queryComment(query, values);
  if (!comment) {
    throw new Error('Failed to insert comment');
  }
  return comment;
}
