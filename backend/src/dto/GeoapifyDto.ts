import { z } from 'zod';

// Schema Zod per la validazione delle coordinate
export const CoordinateValidationResultSchema = z.object({
  valid: z.boolean(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  error: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
});

// Schema Zod per le coordinate della città
export const CityCoordinateSchema = z.object({
  name: z.string(),
  lat: z.number(),
  lng: z.number(),
  country: z.string(),
});

// Schema Zod per la regione della città
export const CityRegionSchema = z.object({
  name: z.string(),
  latMin: z.number(),
  latMax: z.number(),
  lonMin: z.number(),
  lonMax: z.number(),
  country: z.string(),
});

export type CoordinateValidationResult = z.infer<typeof CoordinateValidationResultSchema>;
export type CityCoordinate = z.infer<typeof CityCoordinateSchema>;
export type CityRegion = z.infer<typeof CityRegionSchema>;

// Schema Zod per le coordinate
export const CoordinatesSchema = z.object({
  lat: z.number()
    .min(-90, "La latitudine deve essere maggiore di -90")
    .max(90, "La latitudine deve essere minore di 90"),
  lon: z.number()
    .min(-180, "La longitudine deve essere maggiore di -180")
    .max(180, "La longitudine deve essere minore di 180"),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
});

// Schema Zod per i risultati del geocoding
export const GeocodeResultSchema = z.object({
  lat: z.number()
    .min(-90, "La latitudine deve essere maggiore di -90")
    .max(90, "La latitudine deve essere minore di 90"),
  lon: z.number()
    .min(-180, "La longitudine deve essere maggiore di -180")
    .max(180, "La longitudine deve essere minore di 180"),
  formatted: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  display_name: z.string().optional(),
});

// Type delle coordinate derivato dallo schema Zod
export type Coordinates = z.infer<typeof CoordinatesSchema>;

// Type del risultato geocoding derivato dallo schema Zod
export type GeocodeResult = z.infer<typeof GeocodeResultSchema>;

// Funzioni helper per la validazione
export const validateCoordinates = (data: unknown): Coordinates => {
  return CoordinatesSchema.parse(data);
};

export const validateGeocodeResult = (data: unknown): GeocodeResult => {
  return GeocodeResultSchema.parse(data);
};