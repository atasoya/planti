import { Request, Response, NextFunction } from 'express';
import { authenticate } from './auth.middleware';
import { authenticateApiKey } from './api-auth.middleware';

export async function combinedAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authenticateApiKey(req, res, (err) => {
      if (err) return next(err);
      
      if (req.apiUserId) {
        (req as any).userId = req.apiUserId;
      }
      
      next();
    });
  } else {
    return authenticate(req, res, next);
  }
} 