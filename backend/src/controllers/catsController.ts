import { Request, Response, NextFunction } from 'express';
import pool from '../config/db';
import { validateMarkdown, parseMarkdown } from '../utils/markdown';
import { validateAndParseCoordinates } from '../utils/coordinates';

interface AuthRequest extends Request {
  user?: { userId: number };
  file?: Express.Multer.File;
}

// Utility per validazioni comuni
function validateCatData(body: any): { error?: string; validatedData?: any } {
  const { title, description, lat, lng, latitude, longitude } = body;
  
  if (!title?.trim()) return { error: 'Il titolo è obbligatorio' };
  if (!description?.trim()) return { error: 'La descrizione è obbligatoria' };
  
  const coordLat = lat || latitude;
  const coordLng = lng || longitude;
  if (!coordLat || !coordLng) return { error: 'Latitudine e longitudine sono obbligatorie' };
  
  const coordinateValidation = validateAndParseCoordinates(coordLat, coordLng);
  if (!coordinateValidation.valid || !coordinateValidation.latitude || !coordinateValidation.longitude) {
    return { error: coordinateValidation.error || 'Coordinate non valide' };
  }
  
  if (description.trim()) {
    const validation = validateMarkdown(description.trim());
    if (!validation.valid) return { error: validation.error };
  }
  
  return { 
    validatedData: {
      title: title.trim(),
      description: description.trim(),
      latitude: coordinateValidation.latitude,
      longitude: coordinateValidation.longitude
    }
  };
}

export const createCat = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ error: 'Utente non autenticato' });
    return;
  }

  const validation = validateCatData(req.body);
  if (validation.error) {
    res.status(400).json({ error: validation.error });
    return;
  }

  const { title, description, latitude, longitude } = validation.validatedData!;

  // Gestione immagine obbligatoria
  if (!req.file) {
    res.status(400).json({ error: 'Immagine obbligatoria per creare un avvistamento' });
    return;
  }

  const imageUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

  try {
    // Verifica utente e inserimento in una query
    const userCheck = await pool.query('SELECT id FROM users WHERE id = $1', [req.user.userId]);
    if (userCheck.rows.length === 0) {
      res.status(401).json({ error: 'Utente non trovato nel database' });
      return;
    }

    const result = await pool.query(
      `INSERT INTO cats (user_id, title, description, image_url, latitude, longitude, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [req.user.userId, title, description, imageUrl, latitude, longitude, 'active']
    );
    
    res.status(201).json(result.rows[0]);
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

  let baseQuery = 'SELECT id, title, latitude, longitude, image_url, status, created_at';
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

export const getUserCats = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ error: 'Utente non autenticato' });
    return;
  }

  try {
    const result = await pool.query(
      `SELECT id, title, description, image_url, latitude, longitude, status, created_at
       FROM cats 
       WHERE user_id = $1 
       ORDER BY created_at DESC`,
      [req.user.userId]
    );

    res.json(result.rows);
    return;
  } catch (err) {
    next(err);
  }
};

export const updateCatStatus = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { id } = req.params;
  const { status } = req.body;

  if (!req.user) {
    res.status(401).json({ error: 'Utente non autenticato' });
    return;
  }

  if (!status || !['active', 'adopted', 'moved'].includes(status)) {
    res.status(400).json({ error: 'Status non valido. Valori permessi: active, adopted, moved' });
    return;
  }

  try {
    // Verifica che il gatto appartenga all'utente
    const catCheck = await pool.query(
      'SELECT user_id FROM cats WHERE id = $1',
      [id]
    );

    if (catCheck.rows.length === 0) {
      res.status(404).json({ error: 'Gatto non trovato' });
      return;
    }

    if (catCheck.rows[0].user_id !== req.user.userId) {
      res.status(403).json({ error: 'Non hai i permessi per modificare questo avvistamento' });
      return;
    }

    // Aggiorna lo status
    const result = await pool.query(
      'UPDATE cats SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );

    res.json(result.rows[0]);
    return;
  } catch (err) {
    next(err);
  }
};

export const updateCat = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { id } = req.params;
  const { title, description, lat, lng, latitude, longitude } = req.body;

  if (!req.user) {
    res.status(401).json({ error: 'Utente non autenticato' });
    return;
  }

  try {
    // Verifica che il gatto appartenga all'utente
    const catCheck = await pool.query(
      'SELECT user_id FROM cats WHERE id = $1',
      [id]
    );

    if (catCheck.rows.length === 0) {
      res.status(404).json({ error: 'Gatto non trovato' });
      return;
    }

    if (catCheck.rows[0].user_id !== req.user.userId) {
      res.status(403).json({ error: 'Non hai i permessi per modificare questo avvistamento' });
      return;
    }

    // Prepara i dati da aggiornare
    const updateFields: string[] = [];
    const updateValues: any[] = [];
    let paramCounter = 1;

    if (title?.trim()) {
      updateFields.push(`title = $${paramCounter}`);
      updateValues.push(title.trim());
      paramCounter++;
    }

    if (description?.trim()) {
      // Validazione markdown se la descrizione è presente
      const validation = validateMarkdown(description.trim());
      if (!validation.valid) {
        res.status(400).json({ error: validation.error });
        return;
      }
      updateFields.push(`description = $${paramCounter}`);
      updateValues.push(description.trim());
      paramCounter++;
    }

    // Gestione coordinate se fornite
    if ((lat || latitude) && (lng || longitude)) {
      const coordLat = lat || latitude;
      const coordLng = lng || longitude;
      
      const coordinateValidation = validateAndParseCoordinates(coordLat, coordLng);
      if (!coordinateValidation.valid) {
        res.status(400).json({ error: coordinateValidation.error });
        return;
      }
      
      updateFields.push(`latitude = $${paramCounter}`);
      updateValues.push(coordinateValidation.latitude);
      paramCounter++;
      
      updateFields.push(`longitude = $${paramCounter}`);
      updateValues.push(coordinateValidation.longitude);
      paramCounter++;
    }

    // Gestione immagine se fornita
    if (req.file) {
      const base64Image = req.file.buffer.toString('base64');
      const imageUrl = `data:${req.file.mimetype};base64,${base64Image}`;
      updateFields.push(`image_url = $${paramCounter}`);
      updateValues.push(imageUrl);
      paramCounter++;
    }

    if (updateFields.length === 0) {
      res.status(400).json({ error: 'Nessun campo da aggiornare fornito' });
      return;
    }

    // Aggiunge l'ID come ultimo parametro
    updateValues.push(id);

    const query = `
      UPDATE cats 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCounter} 
      RETURNING *
    `;

    const result = await pool.query(query, updateValues);
    res.json(result.rows[0]);
    return;
  } catch (err) {
    next(err);
  }
};
