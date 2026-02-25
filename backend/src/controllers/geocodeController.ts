import { Request, Response } from 'express';
import { GeoapifyService } from '../utils/geoapify';

const geoapifyService = new GeoapifyService(process.env.GEOAPIFY_API_KEY || '');

export async function getGeocode(req: Request, res: Response) {
  try {
    // Forward geocoding: indirizzo -> coordinate
    if (req.query.address) {
      const address = req.query.address as string;
      if (!address.trim()) {
        return res.status(400).json({ error: 'Parametro address non valido' });
      }
      
      const result = await geoapifyService.getCoordinatesFromAddress(address.trim());
      if (!result) {
        return res.status(404).json({ error: 'Indirizzo non trovato' });
      }
      
      return res.json({
        lat: result.lat,
        lng: result.lon,
        display_name: result.address
      });
    }
    
    // Reverse geocoding: coordinate -> indirizzo
    const lat = Number.parseFloat(req.query.lat as string);
    const lon = Number.parseFloat(req.query.lon as string);
    if (Number.isNaN(lat) || Number.isNaN(lon)) {
      return res.status(400).json({ error: 'Parametri lat e lon non validi' });
    }
    
    const location = await geoapifyService.reverseGeocode(lat, lon);
    if (!location) {
      return res.status(404).json({ error: 'Luogo non trovato' });
    }
    
    return res.json({ location });
  } catch (error) {
    console.error('Errore geocoding:', error);
    return res.status(500).json({ error: 'Errore interno del server' });
  }
}
