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