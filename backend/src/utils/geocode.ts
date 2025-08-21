import fetch from 'node-fetch';

export async function reverseGeocode(lat: number, lon: number): Promise<string | null> {
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`;
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'TechWeb-Progetto/1.0 (your@email.com)'
      }
    });
    if (!response.ok) return null;
    const data = await response.json();
    return data.display_name || null;
  } catch (error) {
    console.error('Error in reverseGeocode:', error);
    return null;
  }
}

export async function forwardGeocode(address: string): Promise<{ lat: number; lng: number; display_name: string } | null> {
  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(address)}&limit=1`;
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'TechWeb-Progetto/1.0 (your@email.com)'
      }
    });
    if (!response.ok) return null;
    
    const data = await response.json();
    if (!Array.isArray(data) || data.length === 0) return null;
    
    const result = data[0];
    if (!result.lat || !result.lon) return null;
    
    return {
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
      display_name: result.display_name || address
    };
  } catch (error) {
    console.error('Error in forwardGeocode:', error);
    return null;
  }
}
