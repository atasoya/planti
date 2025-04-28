import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../services/auth.service';

declare global {
  namespace Express {
    interface Request {
      userId?: number;
    }
  }
}

export async function authenticate(req: Request, res: Response, next: NextFunction) {

  const token = req.cookies['planti-auth-token'];
  
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized - No token provided' });
  }
  
  try {
    const user = await verifyToken(token);
    
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized - Invalid token' });
    }
    
    req.userId = user.id;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({ error: 'Unauthorized - Authentication failed' });
  }
} 