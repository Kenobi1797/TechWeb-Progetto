import { Request, Response, NextFunction } from 'express';
const pool = require('../config/db');
const path = require('path');

// Interfaccia per user JWT
interface AuthUser {
  userId: number;
  // ...altri campi se servono
}

// Estendi Request per user
interface AuthRequest extends Request {
  user?: AuthUser;
}

exports.createCat = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const { title, description, latitude, longitude } = req.body;
  if (!title || !latitude || !longitude) {
    res.status(400).json({ error: 'Titolo, latitudine e longitudine sono obbligatori' });
    return;
  }
  if (!req.user) {
    res.status(401).json({ error: 'Utente non autenticato' });
    return;
  }
  const image_url = req.file ? req.file.filename : null;

  try {
    const result = await pool.query(
      `INSERT INTO cats (user_id, title, description, image_url, latitude, longitude)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [req.user.userId, title, description, image_url, latitude, longitude]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    const error = err as Error;
    console.error(error);
    res.status(500).json({ error: 'Errore durante l’inserimento del gatto', details: error.message });
  }
};

exports.getAllCats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { from, to, lat, lon, radius } = req.query;

  // Se sono presenti lat e lon, calcola la distanza (in km) usando la formula dell'haversine
  let selectFields = `
    id, title, latitude, longitude, image_url, created_at
  `;
  let baseQuery = `SELECT ${selectFields}`;
  let distanceExpr = '';
  const values: any[] = [];
  let conditions: string[] = [];
  let idx = 1;

  if (lat && lon) {
    distanceExpr = `,
      (6371 * acos(
        cos(radians($${idx++})) * cos(radians(latitude)) *
        cos(radians(longitude) - radians($${idx++})) +
        sin(radians(${
          idx - 2
        })) * sin(radians(latitude))
      )) AS distance
    `;
    baseQuery = `SELECT ${selectFields}${distanceExpr}`;
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

    // Se radius, lat e lon sono presenti, filtra i risultati per distanza
    if (radius && lat && lon) {
      cats = cats.filter((r: any) => r.distance !== undefined && r.distance <= parseFloat(radius as string));
    }

    // Rimuovi il campo distance dalla risposta finale
    cats = cats.map(({ distance, ...rest }: { distance?: number }) => rest);

    res.json(cats);
  } catch (err) {
    const error = err as Error;
    console.error(error);
    res.status(500).json({ error: 'Errore durante il recupero dei gatti', details: error.message });
  }
};

exports.getCatById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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
       JOIN users ON comments.user_id = users.id
       WHERE cat_id = $1
       ORDER BY created_at ASC`,
      [id]
    );

    res.json({
      ...catResult.rows[0],
      comments: comments.rows
    });
  } catch (err) {
    const error = err as Error;
    console.error(error);
    res.status(500).json({ error: 'Errore durante il recupero del dettaglio', details: error.message });
  }
};
