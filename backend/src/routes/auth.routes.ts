import express, { Request, Response } from 'express';
import { createMagicLink, verifyMagicLink } from '../services/auth.service';

const router = express.Router();

router.post('/magic-link', async (req: Request, res: Response) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }
  
  try {
    const success = await createMagicLink(email);
    
    if (success) {
      return res.status(200).json({ message: 'Magic link sent successfully' });
    } else {
      return res.status(500).json({ error: 'Failed to send magic link' });
    }
  } catch (error) {
    console.error('Error requesting magic link:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/verify', async (req: Request, res: Response) => {
  const { token } = req.body;
  
  if (!token) {
    return res.status(400).json({ error: 'Token is required' });
  }
  
  try {
    const result = await verifyMagicLink(token);
    
    if (result) {
      return res.status(200).json({ 
        token: result.token, 
        user: result.user 
      });
    } else {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
  } catch (error) {
    console.error('Error verifying magic link:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 