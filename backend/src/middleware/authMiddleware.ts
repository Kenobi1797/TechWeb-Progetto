import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token mancante o formato non valido' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    // @ts-ignore
    req.user = decoded;
    next();
  } catch (err) {
    console.error('JWT verification error:', err);
    return res.status(401).json({ error: 'Token non valido' });
  }
}

export = authMiddleware;
