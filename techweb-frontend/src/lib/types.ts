export interface Cat {
  id: number;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  imageUrl: string;
  createdAt: string;
}

export interface Comment {
  id: number;
  userId: number;
  text: string;
  createdAt: string;
}
