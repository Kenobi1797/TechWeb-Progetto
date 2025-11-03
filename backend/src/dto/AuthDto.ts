import { Request } from 'express';
import { z } from 'zod';

export const AuthUserSchema = z.object({
  userId: z.number()
});

export type AuthUser = z.infer<typeof AuthUserSchema>;

export interface AuthRequest extends Request {
  user?: AuthUser;
  file?: Express.Multer.File;
}

// Schema per il token JWT
export const JwtPayloadSchema = z.object({
  userId: z.number(),
  iat: z.number().optional(),
  exp: z.number().optional()
});

export type JwtPayload = z.infer<typeof JwtPayloadSchema>;