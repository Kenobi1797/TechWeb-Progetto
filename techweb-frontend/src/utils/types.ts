export interface Cat {
  id: number;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  imageUrl: string; // <-- usa il campo del backend
  createdAt: string;
}

export interface Comment {
  id: number;
  userId: number;
  content: string; // <-- usa il campo del backend
  createdAt: string;
  username?: string;
}
