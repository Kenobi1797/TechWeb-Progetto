import { Request, Response, NextFunction } from 'express';
import pool from '../config/db';
import { validateMarkdown, parseMarkdown } from '../utils/markdown';
import { validateAndParseCoordinates } from '../utils/coordinates';

interface AuthRequest extends Request {
  user?: { userId: number };
}

export const createCat = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { title, description, lat, lng } = req.body;
  
  // Validazioni di base
  if (!title?.trim()) {
    res.status(400).json({ error: 'Il titolo è obbligatorio' });
    return;
  }
  
  if (!description?.trim()) {
    res.status(400).json({ error: 'La descrizione è obbligatoria' });
    return;
  }
  
  if (!lat || !lng) {
    res.status(400).json({ error: 'Latitudine e longitudine sono obbligatorie' });
    return;
  }
  
  // Validazione coordinate
  const coordinateValidation = validateAndParseCoordinates(lat, lng);
  if (!coordinateValidation.valid) {
    res.status(400).json({ error: coordinateValidation.error });
    return;
  }
  
  const { latitude, longitude } = coordinateValidation;
  
  if (!req.user) {
    res.status(401).json({ error: 'Utente non autenticato' });
    return;
  }
  
  // Validazione immagine (ora opzionale per permettere avvistamenti senza foto)
  let imageUrl = null;
  if (req.body.imageData) {
    // Validazione Base64
    if (!req.body.imageData.startsWith('data:image/')) {
      res.status(400).json({ error: 'Formato immagine non valido' });
      return;
    }
    
    // Verifica dimensione Base64 (circa 1.37x la dimensione originale)
    const sizeInBytes = (req.body.imageData.length * 3) / 4;
    if (sizeInBytes > 5 * 1024 * 1024) { // 5MB
      res.status(400).json({ error: 'Immagine troppo grande (max 5MB)' });
      return;
    }
    
    imageUrl = req.body.imageData;
  }

  // Validazione markdown se la descrizione è presente
  if (description.trim()) {
    const validation = validateMarkdown(description.trim());
    if (!validation.valid) {
      res.status(400).json({ error: validation.error });
      return;
    }
  }
  
  try {
    const result = await pool.query(
      `INSERT INTO cats (user_id, title, description, image_url, latitude, longitude)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [req.user.userId, title.trim(), description.trim(), imageUrl, latitude, longitude]
    );
    res.status(201).json(result.rows[0]);
    return;
  } catch (err) {
    next(err);
  }
};

interface QueryParams {
  from?: string;
  to?: string;
  lat?: string;
  lon?: string;
  radius?: string;
  page?: string;
  limit?: string;
}

interface QueryBuilder {
  query: string;
  values: unknown[];
}

function addDistanceCalculation(
  baseQuery: string, 
  lat: string, 
  lon: string, 
  values: unknown[]
): { query: string; coordValid: boolean } {
  const coordValidation = validateAndParseCoordinates(lat, lon);
  if (!coordValidation.valid) {
    return { query: baseQuery, coordValid: false };
  }

  const idx = values.length + 1;
  const distanceQuery = `SELECT id, title, latitude, longitude, image_url, created_at,
    (6371 * acos(
      cos(radians($${idx})) * cos(radians(latitude)) *
      cos(radians(longitude) - radians($${idx + 1})) +
      sin(radians($${idx})) * sin(radians(latitude))
    )) AS distance`;
  
  values.push(coordValidation.latitude, coordValidation.longitude);
  return { query: distanceQuery, coordValid: true };
}

function addRadiusFilter(
  conditions: string[], 
  radius: string, 
  values: unknown[]
): void {
  const radiusKm = parseFloat(radius);
  if (isNaN(radiusKm) || radiusKm <= 0) return;

  const latIdx = values.length - 1;
  const lngIdx = values.length;
  const radiusIdx = values.length + 1;

  conditions.push(`
    (6371 * acos(
      cos(radians($${latIdx})) * cos(radians(latitude)) *
      cos(radians(longitude) - radians($${lngIdx})) +
      sin(radians($${latIdx})) * sin(radians(latitude))
    )) <= $${radiusIdx}
  `);
  values.push(radiusKm);
}

function buildCatsQuery(params: QueryParams): QueryBuilder {
  const { from, to, lat, lon, radius, page = '1', limit = '20' } = params;
  
  const pageNum = Math.max(1, parseInt(page) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20));
  const offset = (pageNum - 1) * limitNum;

  let baseQuery = 'SELECT id, title, latitude, longitude, image_url, created_at';
  const values: unknown[] = [];
  const conditions: string[] = [];
  let hasDistance = false;

  // Gestione coordinate
  if (lat && lon) {
    const result = addDistanceCalculation(baseQuery, lat, lon, values);
    baseQuery = result.query;
    hasDistance = result.coordValid;
    
    if (hasDistance && radius) {
      addRadiusFilter(conditions, radius, values);
    }
  }

  // Filtro data
  if (from && to) {
    const idx = values.length + 1;
    conditions.push(`created_at BETWEEN $${idx} AND $${idx + 1}`);
    values.push(from, to);
  }

  // Costruzione query finale
  let query = baseQuery + ' FROM cats';
  if (conditions.length) {
    query += ' WHERE ' + conditions.join(' AND ');
  }
  
  query += hasDistance ? ' ORDER BY distance ASC, created_at DESC' : ' ORDER BY created_at DESC';
  
  const limitIdx = values.length + 1;
  query += ` LIMIT $${limitIdx} OFFSET $${limitIdx + 1}`;
  values.push(limitNum, offset);

  return { query, values };
}

export const getAllCats = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { query, values } = buildCatsQuery(req.query as QueryParams);
    const result = await pool.query(query, values);
    let cats: Array<Record<string, unknown>> = result.rows;

    cats = cats.map(({ distance, ...rest }: { distance?: number }) => rest);

    // Filtra immagini GIF
    cats = cats.filter((cat: Record<string, unknown>) => {
      const imageUrl = cat.image_url;
      return typeof imageUrl !== 'string' || !imageUrl.toLowerCase().endsWith('.gif');
    });

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

    const cat = catResult.rows[0];
    
    // Converte la descrizione markdown in HTML se presente
    let descriptionHtml = null;
    if (cat.description) {
      try {
        descriptionHtml = await parseMarkdown(cat.description);
      } catch (error) {
        console.error('Errore nel parsing markdown:', error);
        descriptionHtml = cat.description; // Fallback al testo originale
      }
    }

    res.json({
      ...cat,
      descriptionHtml,
      comments: comments.rows,
    });
    return;
  } catch (err) {
    next(err);
  }
};
