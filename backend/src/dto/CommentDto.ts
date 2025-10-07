export interface Comment {
  id: number;
  user_id: number;
  cat_id: number;
  content: string;
  created_at: Date;
  username?: string;
}
