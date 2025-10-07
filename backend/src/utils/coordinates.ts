import { CoordinateValidationResult } from "../dto/GeoCodeDto";

const MARINE_ZONES = [
  { latMin: 35, latMax: 42, lonMin: 8, lonMax: 20, name: "Mar Mediterraneo centrale" },
  { latMin: 38, latMax: 44.5, lonMin: 8, lonMax: 15, name: "Mar Tirreno" },
  { latMin: 39, latMax: 46, lonMin: 14, lonMax: 20, name: "Mar Adriatico" },
  { latMin: 35, latMax: 65, lonMin: -25, lonMax: -5, name: "Oceano Atlantico" },
  { latMin: -60, latMax: 70, lonMin: 120, lonMax: -70, name: "Oceano Pacifico" },
  { latMin: -60, latMax: 70, lonMin: -80, lonMax: -30, name: "Oceano Atlantico Occidentale" },
  { latMin: -60, latMax: 30, lonMin: 20, lonMax: 120, name: "Oceano Indiano" },
];

const SAFE_URBAN_AREAS = [
  { latMin: 41.85, latMax: 41.95, lonMin: 12.45, lonMax: 12.55, name: "Roma centro" },
  { latMin: 45.45, latMax: 45.48, lonMin: 9.17, lonMax: 9.21, name: "Milano centro" },
  { latMin: 40.82, latMax: 40.88, lonMin: 14.24, lonMax: 14.3, name: "Napoli centro" },
  { latMin: 45.43, latMax: 45.45, lonMin: 12.3, lonMax: 12.33, name: "Venezia terraferma" },
  { latMin: 43.76, latMax: 43.78, lonMin: 11.24, lonMax: 11.27, name: "Firenze centro" },
  { latMin: 44.48, latMax: 44.51, lonMin: 11.33, lonMax: 11.36, name: "Bologna centro" },
  { latMin: 45.06, latMax: 45.08, lonMin: 7.67, lonMax: 7.7, name: "Torino centro" },
  { latMin: 44.39, latMax: 44.42, lonMin: 8.93, lonMax: 8.96, name: "Genova centro" },
  { latMin: 41.1, latMax: 41.13, lonMin: 16.86, lonMax: 16.89, name: "Bari centro" },
  { latMin: 38.1, latMax: 38.13, lonMin: 13.35, lonMax: 13.38, name: "Palermo centro" },
  { latMin: 48.84, latMax: 48.87, lonMin: 2.33, lonMax: 2.37, name: "Parigi centro" },
  { latMin: 51.49, latMax: 51.52, lonMin: -0.14, lonMax: -0.11, name: "Londra centro" },
  { latMin: 52.5, latMax: 52.53, lonMin: 13.39, lonMax: 13.42, name: "Berlino centro" },
  { latMin: 40.4, latMax: 40.43, lonMin: -3.72, lonMax: -3.69, name: "Madrid centro" },
  { latMin: 41.37, latMax: 41.4, lonMin: 2.16, lonMax: 2.19, name: "Barcellona centro" },
];

function isInZone(
  latitude: number,
  longitude: number,
  zones: Array<{ latMin: number; latMax: number; lonMin: number; lonMax: number }>
): boolean {
  return zones.some(
    ({ latMin, latMax, lonMin, lonMax }) =>
      latitude >= latMin && latitude <= latMax &&
      longitude >= lonMin && longitude <= lonMax
  );
}

function isInMarineZone(latitude: number, longitude: number): boolean {
  return isInZone(latitude, longitude, MARINE_ZONES);
}

function isInSafeUrbanArea(latitude: number, longitude: number): boolean {
  return isInZone(latitude, longitude, SAFE_URBAN_AREAS);
}

function findNearestSafeArea(latitude: number, longitude: number): { lat: number; lng: number; name: string } | null {
  let minDistance = Infinity;
  let nearestArea: { lat: number; lng: number; name: string } | null = null;
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

export function validateAndParseCoordinates(
  lat: string | number,
  lng: string | number,
  allowMarineCorrection: boolean = false
  ): CoordinateValidationResult {
    const latitude = typeof lat === "string" ? parseFloat(lat) : lat;
    const longitude = typeof lng === "string" ? parseFloat(lng) : lng;

    if (!isFinite(latitude) || !isFinite(longitude))
      return { valid: false, error: "Coordinate non valide: devono essere numeri" };
    if (latitude < -90 || latitude > 90)
      return { valid: false, error: "Latitudine non valida: deve essere tra -90 e 90 gradi" };
    if (longitude < -180 || longitude > 180)
      return { valid: false, error: "Longitudine non valida: deve essere tra -180 e 180 gradi" };
    if (countDecimals(latitude) > 6 || countDecimals(longitude) > 6)
      return { valid: false, error: "Precisione eccessiva: massimo 6 decimali per le coordinate" };

    return validateLocation(latitude, longitude, allowMarineCorrection);
  }

function validateLocation(latitude: number, longitude: number, allowMarineCorrection: boolean = false): CoordinateValidationResult {
  if (allowMarineCorrection && isInMarineZone(latitude, longitude)) {
    const nearestSafe = findNearestSafeArea(latitude, longitude);
    if (nearestSafe) {
      if (process.env.NODE_ENV === "development" && Math.random() < 0.1)
        console.log(`Coordinate corrette da mare verso ${nearestSafe.name}`);
      return {
        valid: true,
        latitude: +nearestSafe.lat.toFixed(6),
        longitude: +nearestSafe.lng.toFixed(6),
      };
    }
    return { valid: false, error: "Coordinate in zona marina: impossibile trovare gatti in mare" };
  }
  if (
    !isInSafeUrbanArea(latitude, longitude) &&
    process.env.NODE_ENV === "development" &&
    Math.random() < 0.05
  ) {
    console.log(`Coordinate accettate: (${latitude}, ${longitude})`);
  }
  return {
    valid: true,
    latitude: +latitude.toFixed(6),
    longitude: +longitude.toFixed(6),
  };
}

function countDecimals(value: number): number {
  if (Number.isInteger(value)) return 0;
  const str = value.toString();
  if (str.includes(".") && !str.includes("e-")) return str.split(".")[1].length;
  if (str.includes("e-")) return parseInt(str.split("e-")[1], 10);
  return 0;
}

export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371;
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

export function generateRandomCoordinatesInRadius(
  centerLat: number,
  centerLon: number,
  radiusMeters: number
): { lat: number; lon: number } {
  const radiusInDegrees = radiusMeters / 111_000;
  const angle = Math.random() * 2 * Math.PI;
  const distance = Math.random() * radiusInDegrees;
  const deltaLat = distance * Math.cos(angle);
  const deltaLon = distance * Math.sin(angle) / Math.cos(toRadians(centerLat));
  return {
    lat: +((centerLat + deltaLat).toFixed(6)),
    lon: +((centerLon + deltaLon).toFixed(6)),
  };
}

export function areValidCoordinates(lat: number, lon: number): boolean {
  return lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;
}

export function areCoordinatesInItaly(lat: number, lon: number): boolean {
  return lat >= 35 && lat <= 47.5 && lon >= 6 && lon <= 19;
}

export function calculateMidpoint(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): { lat: number; lon: number } {
  const φ1 = toRadians(lat1);
  const φ2 = toRadians(lat2);
  const Δλ = toRadians(lon2 - lon1);
  const Bx = Math.cos(φ2) * Math.cos(Δλ);
  const By = Math.cos(φ2) * Math.sin(Δλ);
  const φ3 = Math.atan2(
    Math.sin(φ1) + Math.sin(φ2),
    Math.sqrt((Math.cos(φ1) + Bx) ** 2 + By ** 2)
  );
  const λ3 = toRadians(lon1) + Math.atan2(By, Math.cos(φ1) + Bx);
  return {
    lat: +(φ3 * 180 / Math.PI).toFixed(6),
    lon: +(λ3 * 180 / Math.PI).toFixed(6),
  };
}

export function findOptimalPosition(
  targetLat: number,
  targetLon: number,
  existingPoints: Array<{ lat: number; lon: number }>,
  maxRadiusMeters = 500,
  minDistanceMeters = 100,
  maxAttempts = 20
): { lat: number; lon: number; attempts: number } {
  let bestPosition = { lat: targetLat, lon: targetLon };
  let bestMinDistance = Math.min(
    ...existingPoints.map(
      (p) => calculateDistance(targetLat, targetLon, p.lat, p.lon) * 1000
    )
  );
  if (bestMinDistance >= minDistanceMeters)
    return { ...bestPosition, attempts: 0 };

  let attempts = 0;
  for (; attempts < maxAttempts; attempts++) {
    const newPos = generateRandomCoordinatesInRadius(
      targetLat,
      targetLon,
      maxRadiusMeters
    );
    const minDistanceFromExisting = Math.min(
      ...existingPoints.map(
        (p) => calculateDistance(newPos.lat, newPos.lon, p.lat, p.lon) * 1000
      )
    );
    if (minDistanceFromExisting > bestMinDistance) {
      bestMinDistance = minDistanceFromExisting;
      bestPosition = newPos;
      if (minDistanceFromExisting >= minDistanceMeters) break;
    }
  }
  return { ...bestPosition, attempts };
}

export function clusterNearbyPoints(
  points: Array<{ lat: number; lon: number; id?: string }>,
  maxDistanceMeters = 200
): Array<{ lat: number; lon: number; count: number; ids: string[] }> {
  const clusters: Array<{ lat: number; lon: number; count: number; ids: string[] }> = [];
  const processed = new Set<number>();
  for (let i = 0; i < points.length; i++) {
    if (processed.has(i)) continue;
    let clusterLat = points[i].lat;
    let clusterLon = points[i].lon;
    let count = 1;
    const ids = [points[i].id ?? i.toString()];
    processed.add(i);
    for (let j = i + 1; j < points.length; j++) {
      if (processed.has(j)) continue;
      const distance =
        calculateDistance(points[i].lat, points[i].lon, points[j].lat, points[j].lon) * 1000;
      if (distance <= maxDistanceMeters) {
        clusterLat = (clusterLat * count + points[j].lat) / (count + 1);
        clusterLon = (clusterLon * count + points[j].lon) / (count + 1);
        count++;
        ids.push(points[j].id ?? j.toString());
        processed.add(j);
      }
    }
    clusters.push({ lat: clusterLat, lon: clusterLon, count, ids });
  }
  return clusters;
}
