import { Request, Response, NextFunction } from 'express';
const pool = require('../config/db');

// Interfaccia per user JWT
interface AuthUser {
  userId: number;
}

// Estendi Request per user
interface AuthRequest extends Request {
  user?: AuthUser;
}

exports.addComment = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const { id: cat_id } = req.params;
  const { content } = req.body;
  if (!req.user) {
    res.status(401).json({ error: 'Utente non autenticato' });
    return;
  }
  const user_id = req.user.userId;

  if (!content) {
    res.status(400).json({ error: 'Il contenuto del commento è obbligatorio' });
    return;
  }

  try {
    const result = await pool.query(
      `INSERT INTO comments (user_id, cat_id, content)
       VALUES ($1, $2, $3) RETURNING *`,
      [user_id, cat_id, content]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    const error = err as Error;
    console.error(error);
    res.status(500).json({ error: 'Errore durante l’inserimento del commento', details: error.message });
  }
};

exports.getComments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { id: cat_id } = req.params;

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
    const error = err as Error;
    console.error(error);
    res.status(500).json({ error: 'Errore durante il recupero dei commenti', details: error.message });
  }
};
