import { Request, Response, NextFunction } from 'express';
import pool from '../config/db';
import { AuthRequest } from '../dto/AuthDto';

export const addComment = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { content } = req.body;
  const { cat_id } = req.params;

  if (!req.user) {
    res.status(401).json({ 
      error: 'Solo gli utenti autenticati possono contribuire con nuovi commenti. Effettua il login per partecipare alla community!',
      code: 'NOT_AUTHENTICATED'
    });
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
    const { page = 1, limit = 20 } = req.query;
    const result = await pool.query(
      `SELECT comments.*, users.username
       FROM comments
       JOIN users ON users.id = comments.user_id
       WHERE cat_id = $1
       ORDER BY created_at ASC
       LIMIT $2 OFFSET $3`,
      [cat_id, Number(limit), (Number(page) - 1) * Number(limit)]
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};
