import { Request, Response, NextFunction } from 'express';
import { validateApiKey } from '../services/apikey.service';

declare global {
  namespace Express {
    interface Request {
      apiUserId?: number;
    }
  }
}

export async function authenticateApiKey(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      success: false,
      message: 'Unauthorized - API key required' 
    });
  }
  
  const apiKey = authHeader.split(' ')[1];
  
  if (!apiKey) {
    return res.status(401).json({ 
      success: false,
      message: 'Unauthorized - Invalid API key format' 
    });
  }
  
  try {
    const userId = await validateApiKey(apiKey);
    
    if (!userId) {
      return res.status(401).json({ 
        success: false,
        message: 'Unauthorized - Invalid API key' 
      });
    }
    
    req.apiUserId = userId;
    next();
  } catch (error) {
    console.error('API auth middleware error:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Authentication failed due to server error' 
    });
  }
} 