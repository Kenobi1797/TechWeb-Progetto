import axios from 'axios';
import { CoordinateValidationResult, Coordinates } from '../dto/GeoapifyDto';

// Cache per ottimizzare le richieste
const geocodeCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 60 * 60 * 1000; // 1 ora
const RATE_LIMIT_DELAY = 1000; // 1 secondo tra le richieste
let lastRequestTime = 0;

async function waitForRateLimit(): Promise<void> {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  if (timeSinceLastRequest < RATE_LIMIT_DELAY) {
    await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY - timeSinceLastRequest));
  }
  lastRequestTime = Date.now();
}

export class GeoapifyService {
  private readonly apiKey: string;
  private readonly baseUrl = 'https://api.geoapify.com/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  // Genera coordinate da un indirizzo con gestione cache
  async getCoordinatesFromAddress(address: string): Promise<Coordinates | null> {
    const cacheKey = `forward:${address.toLowerCase().trim()}`;
    
    // Controlla cache
    const cached = geocodeCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
      return cached.data;
    }

    await waitForRateLimit();

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
        const feature = response.data.features[0];
        const props = feature.properties;
        
        const result = {
          lat: Number.parseFloat(Number.parseFloat(props.lat).toFixed(6)),
          lon: Number.parseFloat(Number.parseFloat(props.lon).toFixed(6)),
          address: props.formatted,
          city: props.city,
          country: props.country
        };

        // Salva in cache
        geocodeCache.set(cacheKey, { data: result, timestamp: Date.now() });
        return result;
      }

      geocodeCache.set(cacheKey, { data: null, timestamp: Date.now() });
      return null;
    } catch (error) {
      console.error('Errore nel geocoding:', error);
      geocodeCache.set(cacheKey, { data: null, timestamp: Date.now() });
      return null;
    }
  }

  // Genera coordinate casuali per una località specifica
  async getRandomCoordinatesInLocation(location: string, count: number = 5, radiusKm: number = 5): Promise<Coordinates[]> {
    try {
      const locationCenter = await this.getCoordinatesFromAddress(location);
      
      if (!locationCenter) {
        throw new Error(`Località ${location} non trovata`);
      }

      const coordinates: Coordinates[] = [];
      const radiusInDegrees = (radiusKm / 111); // Approssimazione: 1 grado = 111km all'equatore
      
      for (let i = 0; i < count; i++) {
        const offsetLat = (Math.random() - 0.5) * radiusInDegrees * 2;
        const offsetLon = (Math.random() - 0.5) * radiusInDegrees * 2 / Math.cos(locationCenter.lat * Math.PI / 180);
        
        coordinates.push({
          lat: Number.parseFloat((locationCenter.lat + offsetLat).toFixed(6)),
          lon: Number.parseFloat((locationCenter.lon + offsetLon).toFixed(6)),
          city: locationCenter.city,
          country: locationCenter.country
        });
      }

      return coordinates;
    } catch (error) {
      console.error('Errore nella generazione coordinate casuali:', error);
      throw error;
    }
  }

  // Cerca luoghi di un tipo specifico
  async getPlacesCoordinates(
    category: string, 
    location: string, 
    radius: number = 5000,
    limit: number = 10
  ): Promise<Coordinates[]> {
    const cacheKey = `places:${category}:${location}:${radius}:${limit}`;
    
    const cached = geocodeCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
      return cached.data;
    }

    await waitForRateLimit();

    try {
      const baseLocation = await this.getCoordinatesFromAddress(location);
      
      if (!baseLocation) {
        throw new Error(`Località ${location} non trovata`);
      }

      const response = await axios.get(`${this.baseUrl}/places`, {
        params: {
          categories: category,
          filter: `circle:${baseLocation.lon},${baseLocation.lat},${radius}`,
          limit: limit,
          apiKey: this.apiKey
        },
        timeout: 10000
      });

      const places: Coordinates[] = [];

      if (response.data.features) {
        for (const feature of response.data.features) {
          const props = feature.properties;
          places.push({
            lat: Number.parseFloat(Number.parseFloat(props.lat).toFixed(6)),
            lon: Number.parseFloat(Number.parseFloat(props.lon).toFixed(6)),
            address: props.formatted,
            city: props.city,
            country: props.country
          });
        }
      }

      geocodeCache.set(cacheKey, { data: places, timestamp: Date.now() });
      return places;
    } catch (error) {
      console.error('Errore nella ricerca places:', error);
      geocodeCache.set(cacheKey, { data: [], timestamp: Date.now() });
      return [];
    }
  }

  // Genera coordinate di test per una lista di città
  async getTestCoordinates(cities: string[]): Promise<Coordinates[]> {
    const coordinates: Coordinates[] = [];

    for (const city of cities) {
      const coord = await this.getCoordinatesFromAddress(city);
      if (coord) {
        coordinates.push(coord);
      }
    }

    return coordinates;
  }

  // Verifica e converte coordinate in indirizzo con cache
  async reverseGeocode(lat: number, lon: number): Promise<string | null> {
    const cacheKey = `reverse:${lat.toFixed(6)},${lon.toFixed(6)}`;
    
    const cached = geocodeCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
      return cached.data;
    }

    await waitForRateLimit();

    try {
      const response = await axios.get(`${this.baseUrl}/geocode/reverse`, {
        params: {
          lat: lat,
          lon: lon,
          apiKey: this.apiKey
        },
        timeout: 10000
      });

      if (response.data.features && response.data.features.length > 0) {
        const result = response.data.features[0].properties.formatted;
        geocodeCache.set(cacheKey, { data: result, timestamp: Date.now() });
        return result;
      }

      geocodeCache.set(cacheKey, { data: null, timestamp: Date.now() });
      return null;
    } catch (error) {
      console.error('Errore nel reverse geocoding:', error);
      geocodeCache.set(cacheKey, { data: null, timestamp: Date.now() });
      return null;
    }
  }

  // Valida e formatta le coordinate
  validateAndParseCoordinates(
    lat: string | number,
    lng: string | number
  ): CoordinateValidationResult {
    const latitude = typeof lat === "string" ? Number.parseFloat(lat) : lat;
    const longitude = typeof lng === "string" ? Number.parseFloat(lng) : lng;

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return { valid: false, error: "Coordinate non valide: devono essere numeri" };
    }
    if (latitude < -90 || latitude > 90) {
      return { valid: false, error: "Latitudine non valida: deve essere tra -90 e 90 gradi" };
    }
    if (longitude < -180 || longitude > 180) {
      return { valid: false, error: "Longitudine non valida: deve essere tra -180 e 180 gradi" };
    }

    return {
      valid: true,
      latitude: Number.parseFloat(latitude.toFixed(6)),
      longitude: Number.parseFloat(longitude.toFixed(6))
    };
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
