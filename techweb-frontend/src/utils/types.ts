export interface Cat {
  id: number;
  userId: number;
  title: string;
  description: string | null;
  imageUrl: string | null;
  latitude: number;
  longitude: number;
  createdAt: string;
}

export interface Comment {
  id: number;
  userId: number;
  catId: number;
  content: string;
  createdAt: string;
  username?: string;
}
