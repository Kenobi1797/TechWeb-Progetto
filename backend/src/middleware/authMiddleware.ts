import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthRequest } from '../dto/AuthDto';

function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ 
      error: 'Token mancante o formato non valido',
      code: 'MISSING_TOKEN' 
    });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: number };
    req.user = decoded;
    next();
  } catch (err) {
    console.error('JWT verification error:', err);
    
    // Distingui tra token scaduto e token non valido
    if (err instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ 
        error: 'Token scaduto',
        code: 'TOKEN_EXPIRED' 
      });
    } else if (err instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ 
        error: 'Token non valido',
        code: 'INVALID_TOKEN' 
      });
    } else {
      return res.status(401).json({ 
        error: 'Errore di autenticazione',
        code: 'AUTH_ERROR' 
      });
    }
  }
}

export = authMiddleware;
