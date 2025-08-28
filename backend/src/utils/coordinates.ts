export interface CoordinateValidationResult {
  valid: boolean;
  latitude?: number;
  longitude?: number;
  error?: string;
}

// Zone marine conosciute da evitare (bounding boxes di mari e oceani principali)
const MARINE_ZONES = [
  // Mar Mediterraneo centrale
  { latMin: 35.0, latMax: 42.0, lonMin: 8.0, lonMax: 20.0, name: "Mar Mediterraneo centrale" },
  // Mar Tirreno
  { latMin: 38.0, latMax: 44.5, lonMin: 8.0, lonMax: 15.0, name: "Mar Tirreno" },
  // Mar Adriatico sud
  { latMin: 39.0, latMax: 46.0, lonMin: 14.0, lonMax: 20.0, name: "Mar Adriatico" },
  // Atlantico Europa occidentale
  { latMin: 35.0, latMax: 65.0, lonMin: -25.0, lonMax: -5.0, name: "Oceano Atlantico" },
  // Pacifico
  { latMin: -60.0, latMax: 70.0, lonMin: 120.0, lonMax: -70.0, name: "Oceano Pacifico" },
  // Atlantico Americas
  { latMin: -60.0, latMax: 70.0, lonMin: -80.0, lonMax: -30.0, name: "Oceano Atlantico Occidentale" },
  // Oceano Indiano
  { latMin: -60.0, latMax: 30.0, lonMin: 20.0, lonMax: 120.0, name: "Oceano Indiano" },
];

// Aree urbane sicure conosciute (centri città dove è probabile trovare gatti)
const SAFE_URBAN_AREAS = [
  // Italia - aree urbane principali
  { latMin: 41.85, latMax: 41.95, lonMin: 12.45, lonMax: 12.55, name: "Roma centro" },
  { latMin: 45.45, latMax: 45.48, lonMin: 9.17, lonMax: 9.21, name: "Milano centro" },
  { latMin: 40.82, latMax: 40.88, lonMin: 14.24, lonMax: 14.30, name: "Napoli centro" },
  { latMin: 45.43, latMax: 45.45, lonMin: 12.30, lonMax: 12.33, name: "Venezia terraferma" },
  { latMin: 43.76, latMax: 43.78, lonMin: 11.24, lonMax: 11.27, name: "Firenze centro" },
  { latMin: 44.48, latMax: 44.51, lonMin: 11.33, lonMax: 11.36, name: "Bologna centro" },
  { latMin: 45.06, latMax: 45.08, lonMin: 7.67, lonMax: 7.70, name: "Torino centro" },
  { latMin: 44.39, latMax: 44.42, lonMin: 8.93, lonMax: 8.96, name: "Genova centro" },
  { latMin: 41.10, latMax: 41.13, lonMin: 16.86, lonMax: 16.89, name: "Bari centro" },
  { latMin: 38.10, latMax: 38.13, lonMin: 13.35, lonMax: 13.38, name: "Palermo centro" },
  
  // Altre città europee
  { latMin: 48.84, latMax: 48.87, lonMin: 2.33, lonMax: 2.37, name: "Parigi centro" },
  { latMin: 51.49, latMax: 51.52, lonMin: -0.14, lonMax: -0.11, name: "Londra centro" },
  { latMin: 52.50, latMax: 52.53, lonMin: 13.39, lonMax: 13.42, name: "Berlino centro" },
  { latMin: 40.40, latMax: 40.43, lonMin: -3.72, lonMax: -3.69, name: "Madrid centro" },
  { latMin: 41.37, latMax: 41.40, lonMin: 2.16, lonMax: 2.19, name: "Barcellona centro" },
];

/**
 * Verifica se le coordinate sono in una zona marina nota
 */
function isInMarineZone(latitude: number, longitude: number): boolean {
  return MARINE_ZONES.some(zone => 
    latitude >= zone.latMin && latitude <= zone.latMax &&
    longitude >= zone.lonMin && longitude <= zone.lonMax
  );
}

/**
 * Verifica se le coordinate sono in un'area urbana sicura
 */
function isInSafeUrbanArea(latitude: number, longitude: number): boolean {
  return SAFE_URBAN_AREAS.some(area => 
    latitude >= area.latMin && latitude <= area.latMax &&
    longitude >= area.lonMin && longitude <= area.lonMax
  );
}

/**
 * Trova l'area urbana sicura più vicina per coordinate sospette
 */
function findNearestSafeArea(latitude: number, longitude: number): { lat: number; lng: number; name: string } | null {
  let minDistance = Infinity;
  let nearestArea = null;
  
  for (const area of SAFE_URBAN_AREAS) {
    const centerLat = (area.latMin + area.latMax) / 2;
    const centerLng = (area.lonMin + area.lonMax) / 2;
    const distance = calculateDistance(latitude, longitude, centerLat, centerLng);
    
    if (distance < minDistance) {
      minDistance = distance;
      nearestArea = { lat: centerLat, lng: centerLng, name: area.name };
    }
  }
  
  return nearestArea;
}

/**
 * Valida e converte le coordinate da stringa a numero con controlli anti-mare
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

  // Controllo zone marine - se le coordinate sono in mare, le correggiamo
  if (isInMarineZone(latitude, longitude)) {
    const nearestSafe = findNearestSafeArea(latitude, longitude);
    if (nearestSafe) {
      console.log(`Coordinate in mare (${latitude}, ${longitude}) corrette verso ${nearestSafe.name}`);
      return {
        valid: true,
        latitude: parseFloat(nearestSafe.lat.toFixed(6)),
        longitude: parseFloat(nearestSafe.lng.toFixed(6))
      };
    } else {
      return {
        valid: false,
        error: 'Coordinate in zona marina: impossibile trovare gatti in mare'
      };
    }
  }

  // Se non è in area urbana sicura, ma non è nemmeno in mare, accettiamo con warning
  if (!isInSafeUrbanArea(latitude, longitude)) {
    console.log(`Attenzione: coordinate (${latitude}, ${longitude}) non in area urbana nota, ma accettate`);
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

/**
 * Genera coordinate casuali entro un raggio specificato da un punto centrale
 */
export function generateRandomCoordinatesInRadius(
  centerLat: number, 
  centerLon: number, 
  radiusMeters: number
): { lat: number; lon: number } {
  const radiusInDegrees = radiusMeters / 111000; // Approssimazione: 1 grado ≈ 111km
  
  const angle = Math.random() * 2 * Math.PI;
  const distance = Math.random() * radiusInDegrees;
  
  const deltaLat = distance * Math.cos(angle);
  const deltaLon = distance * Math.sin(angle) / Math.cos(toRadians(centerLat));
  
  return {
    lat: parseFloat((centerLat + deltaLat).toFixed(6)),
    lon: parseFloat((centerLon + deltaLon).toFixed(6))
  };
}

/**
 * Verifica se le coordinate sono valide
 */
export function areValidCoordinates(lat: number, lon: number): boolean {
  return lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;
}

/**
 * Verifica se le coordinate sono in Italia (approssimativo)
 */
export function areCoordinatesInItaly(lat: number, lon: number): boolean {
  return lat >= 35 && lat <= 47.5 && lon >= 6 && lon <= 19;
}

/**
 * Calcola il punto medio tra due coordinate
 */
export function calculateMidpoint(lat1: number, lon1: number, lat2: number, lon2: number): { lat: number; lon: number } {
  const φ1 = toRadians(lat1);
  const φ2 = toRadians(lat2);
  const Δλ = toRadians(lon2 - lon1);

  const Bx = Math.cos(φ2) * Math.cos(Δλ);
  const By = Math.cos(φ2) * Math.sin(Δλ);

  const φ3 = Math.atan2(
    Math.sin(φ1) + Math.sin(φ2),
    Math.sqrt((Math.cos(φ1) + Bx) * (Math.cos(φ1) + Bx) + By * By)
  );
  const λ3 = toRadians(lon1) + Math.atan2(By, Math.cos(φ1) + Bx);

  return {
    lat: parseFloat((φ3 * 180 / Math.PI).toFixed(6)),
    lon: parseFloat((λ3 * 180 / Math.PI).toFixed(6))
  };
}

/**
 * Trova le coordinate che minimizzano la sovrapposizione con punti esistenti
 */
export function findOptimalPosition(
  targetLat: number,
  targetLon: number,
  existingPoints: Array<{ lat: number; lon: number }>,
  maxRadiusMeters: number = 500,
  minDistanceMeters: number = 100,
  maxAttempts: number = 20
): { lat: number; lon: number; attempts: number } {
  let bestPosition = { lat: targetLat, lon: targetLon };
  let bestMinDistance = 0;
  let attempts = 0;

  // Calcola la distanza minima dalla posizione iniziale
  for (const point of existingPoints) {
    const distance = calculateDistance(targetLat, targetLon, point.lat, point.lon) * 1000; // Converti in metri
    if (attempts === 0 || distance < bestMinDistance) {
      bestMinDistance = distance;
    }
  }

  // Se la posizione iniziale è già buona, usala
  if (bestMinDistance >= minDistanceMeters) {
    return { lat: targetLat, lon: targetLon, attempts: 0 };
  }

  // Prova a trovare una posizione migliore
  for (let i = 0; i < maxAttempts; i++) {
    attempts++;
    const newPos = generateRandomCoordinatesInRadius(targetLat, targetLon, maxRadiusMeters);
    
    let minDistanceFromExisting = Infinity;
    for (const point of existingPoints) {
      const distance = calculateDistance(newPos.lat, newPos.lon, point.lat, point.lon) * 1000; // Converti in metri
      minDistanceFromExisting = Math.min(minDistanceFromExisting, distance);
    }

    if (minDistanceFromExisting > bestMinDistance) {
      bestMinDistance = minDistanceFromExisting;
      bestPosition = newPos;
      
      // Se abbiamo trovato una posizione abbastanza buona, fermati
      if (minDistanceFromExisting >= minDistanceMeters) {
        break;
      }
    }
  }

  return { ...bestPosition, attempts };
}

/**
 * Raggruppa punti vicini e calcola i centroidi
 */
export function clusterNearbyPoints(
  points: Array<{ lat: number; lon: number; id?: string }>,
  maxDistanceMeters: number = 200
): Array<{ lat: number; lon: number; count: number; ids: string[] }> {
  const clusters: Array<{ lat: number; lon: number; count: number; ids: string[] }> = [];
  const processed = new Set<number>();

  for (let i = 0; i < points.length; i++) {
    if (processed.has(i)) continue;

    const cluster = {
      lat: points[i].lat,
      lon: points[i].lon,
      count: 1,
      ids: [points[i].id || i.toString()]
    };

    processed.add(i);

    // Trova tutti i punti vicini
    for (let j = i + 1; j < points.length; j++) {
      if (processed.has(j)) continue;

      const distance = calculateDistance(
        points[i].lat, points[i].lon,
        points[j].lat, points[j].lon
      ) * 1000; // Converti in metri

      if (distance <= maxDistanceMeters) {
        // Aggiorna il centroide
        cluster.lat = (cluster.lat * cluster.count + points[j].lat) / (cluster.count + 1);
        cluster.lon = (cluster.lon * cluster.count + points[j].lon) / (cluster.count + 1);
        cluster.count++;
        cluster.ids.push(points[j].id || j.toString());
        processed.add(j);
      }
    }

    clusters.push(cluster);
  }

  return clusters;
}
