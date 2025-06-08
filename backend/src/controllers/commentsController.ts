import { Request, Response, NextFunction } from 'express';
import pool from '../config/db';

// Estendi Request per user (se non già fatto globalmente)
interface AuthUser {
  userId: number;
}
interface AuthRequest extends Request {
  user?: AuthUser;
}

export const addComment = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { content } = req.body;
  const { cat_id } = req.params;

  if (!req.user) {
    res.status(401).json({ error: 'Utente non autenticato' });
    return;
  }
  if (!content) {
    res.status(400).json({ error: 'Contenuto obbligatorio' });
    return;
  }

  try {
    const result = await pool.query(
      `INSERT INTO comments (user_id, cat_id, content)
       VALUES ($1, $2, $3) RETURNING *`,
      [req.user.userId, cat_id, content]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

export const getComments = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { cat_id } = req.params;

  try {
    const result = await pool.query(
      `SELECT comments.*, users.username
       FROM comments
       JOIN users ON users.id = comments.user_id
       WHERE cat_id = $1
       ORDER BY created_at ASC`,
      [cat_id]
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};
