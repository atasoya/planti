import express, { Request, Response } from 'express';
import { addPlant, getUserPlants } from '../services/plant.service';
import { authenticate } from '../middleware/auth.middleware';
import cookieParser from 'cookie-parser';

const router = express.Router();

router.use(cookieParser());

router.use(authenticate);

router.get('/', async (req: Request, res: Response) => {
  try {
    const plants = await getUserPlants(req.userId!);
    return res.status(200).json({ plants });
  } catch (error) {
    console.error('Error fetching plants:', error);
    return res.status(500).json({ error: 'Failed to fetch plants' });
  }
});

router.post('/', async (req: Request, res: Response) => {
  const { icon, name, species, weeklyWaterMl, humidity, location, longitude, latitude } = req.body;
  
  // Validate required fields
  if (!icon || !name || !species || typeof weeklyWaterMl !== 'number' || 
      typeof humidity !== 'number' || !location || 
      typeof longitude !== 'number' || typeof latitude !== 'number') {
    return res.status(400).json({ error: 'Missing or invalid required fields' });
  }
  
  try {
    const plant = await addPlant({
      icon,
      name,
      species,
      weeklyWaterMl,
      humidity,
      location,
      longitude,
      latitude
    }, req.userId!);
    
    return res.status(201).json({ plant });
  } catch (error) {
    console.error('Error adding plant:', error);
    return res.status(500).json({ error: 'Failed to add plant' });
  }
});

export default router; 