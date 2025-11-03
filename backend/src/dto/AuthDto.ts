import { Request } from 'express';

export interface AuthUser {
  userId: number;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
  file?: Express.Multer.File;
}