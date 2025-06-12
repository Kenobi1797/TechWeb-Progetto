import { Request, Response, NextFunction } from 'express';
import pool from '../config/db';

interface AuthRequest extends Request {
  user?: { userId: number };
}

export const createCat = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { title, description, latitude, longitude } = req.body;
  if (!title || !latitude || !longitude) {
    res.status(400).json({ error: 'Titolo, latitudine e longitudine sono obbligatori' });
    return;
  }
  if (!req.user) {
    res.status(401).json({ error: 'Utente non autenticato' });
    return;
  }

  const image_url = req.file?.filename
    ? `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`
    : null;
  try {
    const result = await pool.query(
      `INSERT INTO cats (user_id, title, description, image_url, latitude, longitude)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [req.user.userId, title, description, image_url, latitude, longitude]
    );
    res.status(201).json(result.rows[0]);
    return;
  } catch (err) {
    next(err);
  }
};

export const getAllCats = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { from, to, lat, lon, radius } = req.query;

  let selectFields = `
    id, title, latitude, longitude, image_url, created_at
  `;
  let baseQuery = `SELECT ${selectFields}`;
  let values: any[] = [];
  let conditions: string[] = [];
  let idx = 1;

  if (lat && lon) {
    baseQuery = `SELECT ${selectFields},
      (6371 * acos(
        cos(radians($${idx++})) * cos(radians(latitude)) *
        cos(radians(longitude) - radians($${idx++})) +
        sin(radians(${
          idx - 2
        })) * sin(radians(latitude))
      )) AS distance`;
    values.push(lat, lon);
  }

  if (from && to) {
    conditions.push(`created_at BETWEEN $${idx++} AND $${idx++}`);
    values.push(from, to);
  }

  let query = baseQuery + ' FROM cats';
  if (conditions.length) query += ' WHERE ' + conditions.join(' AND ');
  query += ' ORDER BY created_at DESC';

  try {
    const result = await pool.query(query, values);
    let cats: any[] = result.rows;

    if (radius && lat && lon) {
      cats = cats.filter((r: any) => r.distance !== undefined && r.distance <= parseFloat(radius as string));
    }

    cats = cats.map(({ distance, ...rest }: { distance?: number }) => rest);

    // Filtra immagini GIF
    cats = cats.filter((cat: any) =>
      !cat.image_url?.toLowerCase().endsWith('.gif')
    );

    res.json(cats);
    return;
  } catch (err) {
    next(err);
  }
};

export const getCatById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { id } = req.params;

  try {
    const catResult = await pool.query('SELECT * FROM cats WHERE id = $1', [id]);
    if (catResult.rows.length === 0) {
      res.status(404).json({ error: 'Gatto non trovato' });
      return;
    }

    const comments = await pool.query(
      `SELECT comments.*, users.username
       FROM comments
       JOIN users ON users.id = comments.user_id
       WHERE cat_id = $1
       ORDER BY created_at ASC`,
      [id]
    );

    res.json({
      ...catResult.rows[0],
      comments: comments.rows,
    });
    return;
  } catch (err) {
    next(err);
  }
};
