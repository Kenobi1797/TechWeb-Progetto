import { Request, Response } from 'express';
import { reverseGeocode } from '../utils/geocode';

export async function getGeocode(req: Request, res: Response) {
  const lat = parseFloat(req.query.lat as string);
  const lon = parseFloat(req.query.lon as string);
  if (isNaN(lat) || isNaN(lon)) {
    return res.status(400).json({ error: 'Parametri lat e lon non validi' });
  }
  const location = await reverseGeocode(lat, lon);
  if (!location) {
    return res.status(404).json({ error: 'Luogo non trovato' });
  }
  return res.json({ location });
}
