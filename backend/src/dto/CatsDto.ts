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

export interface QueryParams {
  from?: string;
  to?: string;
  lat?: string;
  lon?: string;
  radius?: string;
  page?: string;
  limit?: string;
}

export interface QueryBuilder {
  query: string;
  values: unknown[];
}