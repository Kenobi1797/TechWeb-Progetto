import { z } from 'zod';

export const CommentSchema = z.object({
  id: z.number(),
  user_id: z.number(),
  cat_id: z.number(),
  content: z.string().min(1).max(1000),
  created_at: z.date(),
  username: z.string().optional()
});

export const CreateCommentSchema = z.object({
  cat_id: z.number(),
  content: z.string().min(1).max(1000)
});

export type Comment = z.infer<typeof CommentSchema>;
export type CreateCommentDTO = z.infer<typeof CreateCommentSchema>;
