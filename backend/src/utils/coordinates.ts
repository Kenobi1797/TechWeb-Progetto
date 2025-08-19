export interface CoordinateValidationResult {
  valid: boolean;
  latitude?: number;
  longitude?: number;
  error?: string;
}

/**
 * Valida e converte le coordinate da stringa a numero
 */
export function validateAndParseCoordinates(
  lat: string | number, 
  lng: string | number
): CoordinateValidationResult {
  // Conversione sicura a numero
  const latitude = typeof lat === 'string' ? parseFloat(lat) : lat;
  const longitude = typeof lng === 'string' ? parseFloat(lng) : lng;

  // Controllo NaN
  if (isNaN(latitude) || isNaN(longitude)) {
    return {
      valid: false,
      error: 'Coordinate non valide: devono essere numeri'
    };
  }

  // Validazione range latitudine
  if (latitude < -90 || latitude > 90) {
    return {
      valid: false,
      error: 'Latitudine non valida: deve essere tra -90 e 90 gradi'
    };
  }

  // Validazione range longitudine
  if (longitude < -180 || longitude > 180) {
    return {
      valid: false,
      error: 'Longitudine non valida: deve essere tra -180 e 180 gradi'
    };
  }

  // Validazione precisione (max 6 decimali per evitare precisione eccessiva)
  const latPrecision = countDecimals(latitude);
  const lngPrecision = countDecimals(longitude);
  
  if (latPrecision > 6 || lngPrecision > 6) {
    return {
      valid: false,
      error: 'Precisione eccessiva: massimo 6 decimali per le coordinate'
    };
  }

  return {
    valid: true,
    latitude: parseFloat(latitude.toFixed(6)), // Normalize a 6 decimali
    longitude: parseFloat(longitude.toFixed(6))
  };
}

/**
 * Conta i decimali di un numero
 */
function countDecimals(value: number): number {
  if (Math.floor(value) === value) return 0;
  const str = value.toString();
  if (str.indexOf('.') !== -1 && str.indexOf('e-') === -1) {
    return str.split('.')[1].length;
  } else if (str.indexOf('e-') !== -1) {
    const parts = str.split('e-');
    return parseInt(parts[1], 10);
  }
  return 0;
}

/**
 * Calcola la distanza tra due punti usando la formula di Haversine
 */
export function calculateDistance(
  lat1: number, 
  lng1: number, 
  lat2: number, 
  lng2: number
): number {
  const R = 6371; // Raggio della Terra in km
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}
