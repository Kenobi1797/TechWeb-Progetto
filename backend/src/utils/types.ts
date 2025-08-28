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
export interface User {
  id: number;
  username: string;
  email: string;
  password_hash: string;
  created_at: Date;
}

export interface Cat {
  id: number;
  user_id: number;
  title: string;
  description: string | null;
  image_url: string | null;
  latitude: number;
  longitude: number;
  status: 'active' | 'adopted' | 'moved';
  created_at: Date;
}

export interface Comment {
  id: number;
  user_id: number;
  cat_id: number;
  content: string;
  created_at: Date;
  username?: string;
}
