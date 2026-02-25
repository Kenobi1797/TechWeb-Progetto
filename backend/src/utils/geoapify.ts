import axios from 'axios';
import { CoordinateValidationResult } from '../dto/GeoapifyDto';

export class GeoapifyService {
  private readonly apiKey: string;
  private readonly baseUrl = 'https://api.geoapify.com/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  // Genera coordinate da un indirizzo
  async getCoordinatesFromAddress(address: string) {
    try {
      const response = await axios.get(`${this.baseUrl}/geocode/search`, {
        params: {
          text: address,
          apiKey: this.apiKey,
          limit: 1
        },
        timeout: 10000
      });

      if (response.data.features && response.data.features.length > 0) {
        const props = response.data.features[0].properties;
        return {
          lat: Number.parseFloat(Number.parseFloat(props.lat).toFixed(6)),
          lon: Number.parseFloat(Number.parseFloat(props.lon).toFixed(6)),
          address: props.formatted,
          city: props.city,
          country: props.country
        };
      }
      return null;
    } catch (error) {
      console.error('Errore nel geocoding:', error);
      return null;
    }
  }

  // Converte coordinate in indirizzo
  async reverseGeocode(lat: number, lon: number) {
    try {
      const response = await axios.get(`${this.baseUrl}/geocode/reverse`, {
        params: { lat, lon, apiKey: this.apiKey },
        timeout: 10000
      });

      if (response.data.features && response.data.features.length > 0) {
        return response.data.features[0].properties.formatted;
      }
      return null;
    } catch (error) {
      console.error('Errore nel reverse geocoding:', error);
      return null;
    }
  }

  // Valida e formatta le coordinate con controllo area urbana
  async validateAndParseCoordinates(
    lat: string | number,
    lng: string | number
  ): Promise<CoordinateValidationResult> {
    const latitude = typeof lat === "string" ? Number.parseFloat(lat) : lat;
    const longitude = typeof lng === "string" ? Number.parseFloat(lng) : lng;

    // Validazione base
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return { valid: false, error: "Coordinate non valide: devono essere numeri" };
    }
    if (latitude < -90 || latitude > 90) {
      return { valid: false, error: "Latitudine non valida: deve essere tra -90 e 90 gradi" };
    }
    if (longitude < -180 || longitude > 180) {
      return { valid: false, error: "Longitudine non valida: deve essere tra -180 e 180 gradi" };
    }

    try {
      const response = await axios.get(`${this.baseUrl}/geocode/reverse`, {
        params: {
          lat: latitude,
          lon: longitude,
          apiKey: this.apiKey
        },
        timeout: 10000
      });

      if (!response.data.features || response.data.features.length === 0) {
        return { valid: false, error: "Coordinate non valide: posizione non trovata" };
      }

      const feature = response.data.features[0].properties;
      const locality = feature.city || feature.town || feature.village || 
                      feature.suburb || feature.district || feature.county || 
                      feature.state || feature.country;

      if (!locality) {
        return { valid: false, error: "Coordinate non valide: località non riconosciuta" };
      }

      return {
        valid: true,
        latitude: Number.parseFloat(latitude.toFixed(6)),
        longitude: Number.parseFloat(longitude.toFixed(6)),
        city: feature.city || feature.town || feature.village || 
              feature.suburb || feature.district || feature.county,
        country: feature.country
      };
    } catch (error) {
      console.error('Errore nella validazione delle coordinate:', error);
      return { valid: false, error: "Errore nella validazione delle coordinate" };
    }
  }

  // Calcola la distanza tra due punti in chilometri
  static calculateDistance(
    lat1: number, 
    lon1: number, 
    lat2: number, 
    lon2: number
  ): number {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  // Ottimizza la posizione per evitare sovrapposizioni
  findOptimalPosition(
    targetLat: number,
    targetLon: number,
    existingPoints: Array<{ lat: number; lon: number }>,
    maxRadiusMeters = 500,
    minDistanceMeters = 100,
    maxAttempts = 20
  ): { lat: number; lon: number; attempts: number } {
    let bestPosition = { lat: targetLat, lon: targetLon };
    let bestMinDistance = Math.min(
      ...existingPoints.map(p => 
        GeoapifyService.calculateDistance(targetLat, targetLon, p.lat, p.lon) * 1000
      )
    );
    
    if (bestMinDistance >= minDistanceMeters) {
      return { ...bestPosition, attempts: 0 };
    }

    let attempts = 0;
    for (; attempts < maxAttempts; attempts++) {
      const angle = Math.random() * 2 * Math.PI;
      const distance = Math.random() * maxRadiusMeters;
      const deltaLat = (distance / 111000) * Math.cos(angle);
      const deltaLon = (distance / 111000) * Math.sin(angle) / Math.cos(targetLat * Math.PI / 180);

      const newPos = {
        lat: targetLat + deltaLat,
        lon: targetLon + deltaLon
      };

      const minDistanceFromExisting = Math.min(
        ...existingPoints.map(p => 
          GeoapifyService.calculateDistance(newPos.lat, newPos.lon, p.lat, p.lon) * 1000
        )
      );

      if (minDistanceFromExisting > bestMinDistance) {
        bestMinDistance = minDistanceFromExisting;
        bestPosition = {
          lat: Number.parseFloat(newPos.lat.toFixed(6)),
          lon: Number.parseFloat(newPos.lon.toFixed(6))
        };
        if (minDistanceFromExisting >= minDistanceMeters) break;
      }
    }

    return { ...bestPosition, attempts };
  }
}

export * from '../dto/GeoapifyDto';
