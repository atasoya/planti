import express, { Request, Response } from 'express';
import { addPlant, getUserPlants, getPlantById, updatePlant } from '../services/plant.service';
import { authenticate } from '../middleware/auth.middleware';
import cookieParser from 'cookie-parser';
import { and, eq } from 'drizzle-orm';
import { plants } from '../db/schema';
import { db } from '../db';
import { getWeatherData, calculatePlantHealthScore } from '../utils/weather';
import { addPlantDataRecord } from '../services/plant-data.service';

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

router.get('/:id/health', async (req: Request, res: Response) => {
  const plantId = parseInt(req.params.id);
  
  if (isNaN(plantId)) {
    return res.status(400).json({ error: 'Invalid plant ID' });
  }
  
  try {
    const plant = await getPlantById(plantId, req.userId!);
    
    if (!plant) {
      return res.status(404).json({ error: 'Plant not found' });
    }
    
    const weatherData = await getWeatherData(plant.latitude, plant.longitude);
    
    const healthScore = calculatePlantHealthScore(
      plant.weeklyWaterMl,
      plant.humidity,
      weatherData
    );
    
    await addPlantDataRecord({
      plantId: plant.id,
      healthScore,
      humidity: weatherData.humidity,
      weeklyWaterMl: plant.weeklyWaterMl
    });
    
    await db.update(plants)
      .set({ healthScore, updatedAt: new Date() })
      .where(and(
        eq(plants.id, plantId),
        eq(plants.userId, req.userId!)
      ));
    
    return res.status(200).json({ 
      plant: { ...plant, healthScore },
      healthScore,
      currentWeather: weatherData
    });
  } catch (error) {
    console.error('Error getting plant health:', error);
    return res.status(500).json({ error: 'Failed to get plant health information' });
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
  
  if (!icon || !name || !species || typeof weeklyWaterMl !== 'number' || 
      typeof humidity !== 'number' || !location || 
      typeof longitude !== 'number' || typeof latitude !== 'number') {
    return res.status(400).json({ error: 'Missing or invalid required fields' });
  }
  
  try {
    const weatherData = await getWeatherData(latitude, longitude);
    
    const initialHealthScore = calculatePlantHealthScore(
      weeklyWaterMl,
      humidity,
      weatherData
    );
    
    const plant = await addPlant({
      icon,
      name,
      species,
      weeklyWaterMl,
      humidity,
      location,
      longitude,
      latitude,
      healthScore: initialHealthScore
    }, req.userId!);
    
    await addPlantDataRecord({
      plantId: plant.id,
      healthScore: initialHealthScore,
      humidity: weatherData.humidity,
      weeklyWaterMl: weeklyWaterMl
    });
    
    return res.status(201).json({ 
      plant,
      healthScore: initialHealthScore,
      currentWeather: weatherData
    });
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
    // If any parameters affecting health have change calculate health score
    if (weeklyWaterMl !== undefined || humidity !== undefined || longitude !== undefined || latitude !== undefined) {
      const plant = await getPlantById(plantId, req.userId!);
      
      if (plant) {
        const newLongitude = longitude !== undefined ? longitude : plant.longitude;
        const newLatitude = latitude !== undefined ? latitude : plant.latitude;
        const newWeeklyWaterMl = weeklyWaterMl !== undefined ? weeklyWaterMl : plant.weeklyWaterMl;
        const newHumidity = humidity !== undefined ? humidity : plant.humidity;
        
        const weatherData = await getWeatherData(newLatitude, newLongitude);
        const newHealthScore = calculatePlantHealthScore(newWeeklyWaterMl, newHumidity, weatherData);
        
        updateData.healthScore = newHealthScore;
        
        await addPlantDataRecord({
          plantId: plant.id,
          healthScore: newHealthScore,
          humidity: weatherData.humidity,
          weeklyWaterMl: newWeeklyWaterMl
        });
      }
    }
    
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