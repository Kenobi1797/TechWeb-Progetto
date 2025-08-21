import { Request, Response } from 'express';
import { reverseGeocode, forwardGeocode } from '../utils/geocode';

export async function getGeocode(req: Request, res: Response) {
  try {
    // Forward geocoding: indirizzo -> coordinate
    if (req.query.address) {
      const address = req.query.address as string;
      if (!address.trim()) {
        return res.status(400).json({ error: 'Parametro address non valido' });
      }
      
      const result = await forwardGeocode(address.trim());
      if (!result) {
        return res.status(404).json({ error: 'Indirizzo non trovato' });
      }
      
      return res.json(result);
    }
    
    // Reverse geocoding: coordinate -> indirizzo
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
  } catch (error) {
    console.error('Errore geocoding:', error);
    return res.status(500).json({ error: 'Errore interno del server' });
  }
}
