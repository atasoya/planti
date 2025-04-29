import { Router } from 'express';
import { Request, Response } from 'express';
import { createApiKey, getApiKeysByUser, deleteApiKey } from '../services/apikey.service';
import { authenticate } from '../middleware/auth.middleware';
import { authenticateApiKey } from '../middleware/api-auth.middleware';

interface AuthRequest extends Request {
  userId?: number;
  apiUserId?: number;
}

const router = Router();

router.get('/verify', authenticateApiKey, async (req: AuthRequest, res: Response) => {
  try {
    return res.status(200).json({
      success: true,
      message: 'API key is valid',
      userId: req.apiUserId
    });
  } catch (error) {
    console.error('Error verifying API key:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while verifying API key'
    });
  }
});

router.get('/keys', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized - User not authenticated'
      });
    }
    
    const keys = await getApiKeysByUser(userId);
    
    const safeKeys = keys.map(key => ({
      id: key.id,
      name: key.name,
      key: '••••••••••••••••', 
      createdAt: key.createdAt,
      lastUsed: key.updatedAt !== key.createdAt ? key.updatedAt : null,
      usage: key.usage || 0
    }));
    
    return res.status(200).json({
      success: true,
      keys: safeKeys
    });
  } catch (error) {
    console.error('Error fetching API keys:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch API keys',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

router.post('/keys', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { name } = req.body;
    const userId = req.userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized - User not authenticated'
      });
    }
    
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'API key name is required'
      });
    }
    
    const { apiKey, fullKey } = await createApiKey(userId, name);
    
    return res.status(201).json({
      success: true,
      key: {
        id: apiKey.id,
        name: apiKey.name,
        key: fullKey, 
        createdAt: apiKey.createdAt,
        lastUsed: null
      }
    });
  } catch (error) {
    console.error('Error creating API key:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create API key',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

router.delete('/keys/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized - User not authenticated'
      });
    }
    
    const keyId = parseInt(req.params.id);
    
    if (isNaN(keyId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid API key ID'
      });
    }
    
    const success = await deleteApiKey(userId, keyId);
    
    if (!success) {
      return res.status(404).json({
        success: false,
        message: 'API key not found or you do not have permission to delete it'
      });
    }
    
    return res.status(200).json({
      success: true,
      message: 'API key deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting API key:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete API key',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

export const apiKeyRoutes = router; 