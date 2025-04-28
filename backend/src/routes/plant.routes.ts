import express, { Request, Response } from 'express';
import { addPlant, getUserPlants, getPlantById, updatePlant } from '../services/plant.service';
import { authenticate } from '../middleware/auth.middleware';
import cookieParser from 'cookie-parser';
import { and, eq } from 'drizzle-orm';
import { plants } from '../db/schema';
import { db } from '../db';

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

router.get('/:id', async (req: Request, res: Response) => {
  const plantId = parseInt(req.params.id);
  
  if (isNaN(plantId)) {
    return res.status(400).json({ error: 'Invalid plant ID' });
  }
  
  try {
    const plant = await getPlantById(plantId, req.userId!);
    
    if (!plant) {
      return res.status(404).json({ error: 'Plant not found' });
    }
    
    return res.status(200).json({ plant });
  } catch (error) {
    console.error('Error fetching plant:', error);
    return res.status(500).json({ error: 'Failed to fetch plant' });
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

router.put('/:id', async (req: Request, res: Response) => {
  const plantId = parseInt(req.params.id);
  
  if (isNaN(plantId)) {
    return res.status(400).json({ error: 'Invalid plant ID' });
  }
  
  const { icon, name, species, weeklyWaterMl, humidity, location, longitude, latitude } = req.body;
  
  const updateData: any = {};
  
  if (icon !== undefined) updateData.icon = icon;
  if (name !== undefined) updateData.name = name;
  if (species !== undefined) updateData.species = species;
  if (weeklyWaterMl !== undefined) {
    if (typeof weeklyWaterMl !== 'number') {
      return res.status(400).json({ error: 'Weekly water must be a number' });
    }
    updateData.weeklyWaterMl = weeklyWaterMl;
  }
  if (humidity !== undefined) {
    if (typeof humidity !== 'number') {
      return res.status(400).json({ error: 'Humidity must be a number' });
    }
    updateData.humidity = humidity;
  }
  if (location !== undefined) updateData.location = location;
  if (longitude !== undefined) {
    if (typeof longitude !== 'number') {
      return res.status(400).json({ error: 'Longitude must be a number' });
    }
    updateData.longitude = longitude;
  }
  if (latitude !== undefined) {
    if (typeof latitude !== 'number') {
      return res.status(400).json({ error: 'Latitude must be a number' });
    }
    updateData.latitude = latitude;
  }
  
  if (Object.keys(updateData).length === 0) {
    return res.status(400).json({ error: 'No valid fields to update' });
  }
  
  try {
    const updatedPlant = await updatePlant(plantId, req.userId!, updateData);
    return res.status(200).json({ plant: updatedPlant });
  } catch (error) {
    console.error('Error updating plant:', error);
    
    if (error instanceof Error && error.message === 'Plant not found or does not belong to user') {
      return res.status(404).json({ error: 'Plant not found' });
    }
    
    return res.status(500).json({ error: 'Failed to update plant' });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  const plantId = parseInt(req.params.id);
  
  if (isNaN(plantId)) {
    return res.status(400).json({ error: 'Invalid plant ID' });
  }
  
  try {
    const plant = await getPlantById(plantId, req.userId!);
    
    if (!plant) {
      return res.status(404).json({ error: 'Plant not found' });
    }
    
    await db.delete(plants)
      .where(and(
        eq(plants.id, plantId),
        eq(plants.userId, req.userId!)
      ));
    
    return res.status(200).json({ message: 'Plant deleted successfully' });
  } catch (error) {
    console.error('Error deleting plant:', error);
    return res.status(500).json({ error: 'Failed to delete plant' });
  }
});

export default router; 