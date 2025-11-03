import { z } from 'zod';

export const UserSchema = z.object({
  id: z.number(),
  username: z.string().min(3).max(50),
  email: z.string().email(),
  password_hash: z.string(),
  created_at: z.date()
});

export const CreateUserSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email(),
  password: z.string().min(8).max(100) // Password prima dell'hashing
});

export const LoginUserSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

export type User = z.infer<typeof UserSchema>;
export type CreateUserDTO = z.infer<typeof CreateUserSchema>;
export type LoginUserDTO = z.infer<typeof LoginUserSchema>;