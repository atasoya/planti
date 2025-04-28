import express, { Request, Response } from 'express';
import { createMagicLink, verifyMagicLink } from '../services/auth.service';
import { serialize } from 'cookie';

const router = express.Router();

const TOKEN_EXPIRY_SECONDS = 60 * 60 * 24 * 7;

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
    
    if (result && result.token && result.user) {
      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: TOKEN_EXPIRY_SECONDS,
        sameSite: process.env.NODE_ENV === 'production' ? 'none' as const : 'lax' as const,
      };

      res.setHeader('Set-Cookie', serialize('planti-auth-token', result.token, cookieOptions));

      return res.status(200).json({ 
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

router.post('/logout', (req: Request, res: Response) => {
  try {
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: -1,
      sameSite: process.env.NODE_ENV === 'production' ? 'none' as const : 'lax' as const,
    };

    res.setHeader('Set-Cookie', serialize('planti-auth-token', '', cookieOptions));
    
    console.log('Logout successful, cookie cleared.');
    return res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Error during logout:', error);
    return res.status(500).json({ error: 'Internal server error during logout' });
  }
});

export default router; 