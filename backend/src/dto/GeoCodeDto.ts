export interface CoordinateValidationResult {
  valid: boolean;
  latitude?: number;
  longitude?: number;
  error?: string;
}
export interface CityCoordinate {
  name: string;
  lat: number;
  lng: number;
  country: string;
}

export interface CityRegion {
  name: string;
  latMin: number;
  latMax: number;
  lonMin: number;
  lonMax: number;
  country: string;
}