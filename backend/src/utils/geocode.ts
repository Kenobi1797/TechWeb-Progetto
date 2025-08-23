import fetch from 'node-fetch';

// Cache semplice per evitare troppe richieste
const geocodeCache = new Map<string, { data: string | null; timestamp: number }>();
const CACHE_DURATION = 60 * 60 * 1000; // 1 ora
const RATE_LIMIT_DELAY = 1000; // 1 secondo tra le richieste
let lastRequestTime = 0;

// Funzione per aspettare il rate limit
async function waitForRateLimit(): Promise<void> {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  if (timeSinceLastRequest < RATE_LIMIT_DELAY) {
    await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY - timeSinceLastRequest));
  }
  lastRequestTime = Date.now();
}

export async function reverseGeocode(lat: number, lon: number): Promise<string | null> {
  // Crea una chiave per la cache con precisione ridotta
  const cacheKey = `${lat.toFixed(3)},${lon.toFixed(3)}`;
  
  // Controlla cache
  const cached = geocodeCache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
    return cached.data;
  }

  // Aspetta per rispettare il rate limit
  await waitForRateLimit();

  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`;
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'TechWeb-Progetto/1.0 (contact@example.com)',
        'Referer': 'https://localhost:3000'
      },
      timeout: 10000 // 10 secondi di timeout
    });
    
    if (!response.ok) {
      // Se errore HTTP, salva null in cache per evitare retry immediati
      geocodeCache.set(cacheKey, { data: null, timestamp: Date.now() });
      return null;
    }
    
    const data = await response.json();
    const result = data.display_name || null;
    
    // Salva in cache
    geocodeCache.set(cacheKey, { data: result, timestamp: Date.now() });
    
    return result;
  } catch (error) {
    // Log solo se non è un errore di timeout/connessione
    const errorObj = error as any;
    if (!(errorObj?.code === 'ECONNREFUSED' || errorObj?.code === 'ETIMEDOUT')) {
      console.error('Error in reverseGeocode:', errorObj?.message || error);
    }
    
    // Salva null in cache per evitare retry continui
    geocodeCache.set(cacheKey, { data: null, timestamp: Date.now() });
    return null;
  }
}

export async function forwardGeocode(address: string): Promise<{ lat: number; lng: number; display_name: string } | null> {
  // Crea una chiave per la cache
  const cacheKey = `forward:${address.toLowerCase().trim()}`;
  
  // Controlla cache
  const cached = geocodeCache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
    return cached.data ? JSON.parse(cached.data) : null;
  }

  // Aspetta per rispettare il rate limit
  await waitForRateLimit();

  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(address)}&limit=1`;
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'TechWeb-Progetto/1.0 (contact@example.com)',
        'Referer': 'https://localhost:3000'
      },
      timeout: 10000 // 10 secondi di timeout
    });
    
    if (!response.ok) {
      geocodeCache.set(cacheKey, { data: null, timestamp: Date.now() });
      return null;
    }
    
    const data = await response.json();
    if (!Array.isArray(data) || data.length === 0) {
      geocodeCache.set(cacheKey, { data: null, timestamp: Date.now() });
      return null;
    }
    
    const result = data[0];
    if (!result.lat || !result.lon) {
      geocodeCache.set(cacheKey, { data: null, timestamp: Date.now() });
      return null;
    }
    
    const returnValue = {
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
      display_name: result.display_name || address
    };
    
    // Salva in cache
    geocodeCache.set(cacheKey, { 
      data: JSON.stringify(returnValue), 
      timestamp: Date.now() 
    });
    
    return returnValue;
  } catch (error) {
    const errorObj = error as any;
    if (!(errorObj?.code === 'ECONNREFUSED' || errorObj?.code === 'ETIMEDOUT')) {
      console.error('Error in forwardGeocode:', errorObj?.message || error);
    }
    
    geocodeCache.set(cacheKey, { data: null, timestamp: Date.now() });
    return null;
  }
}
