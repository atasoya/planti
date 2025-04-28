import express, { Request, Response } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import cookieParser from 'cookie-parser';
import { addPlantDataRecord, getPlantDataHistory, getLatestPlantData, calculatePlantDataTrend } from '../services/plant-data.service';
import { getPlantById } from '../services/plant.service';
import { getWeatherData, calculatePlantHealthScore } from '../utils/weather';

const router = express.Router();

router.use(cookieParser());
router.use(authenticate);

router.post('/:plantId', async (req: Request, res: Response) => {
  const plantId = parseInt(req.params.plantId);
  
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
    
    const record = await addPlantDataRecord({
      plantId,
      healthScore,
      humidity: weatherData.humidity,
      weeklyWaterMl: plant.weeklyWaterMl,
    });
    
    return res.status(201).json({ 
      record,
      currentWeather: weatherData
    });
  } catch (error) {
    console.error('Error creating plant data record:', error);
    return res.status(500).json({ error: 'Failed to create plant data record' });
  }
});

router.get('/:plantId/history', async (req: Request, res: Response) => {
  const plantId = parseInt(req.params.plantId);
  
  if (isNaN(plantId)) {
    return res.status(400).json({ error: 'Invalid plant ID' });
  }
  
  try {
    const plant = await getPlantById(plantId, req.userId!);
    
    if (!plant) {
      return res.status(404).json({ error: 'Plant not found' });
    }
    
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const history = await getPlantDataHistory(plantId, limit);
    const trend = await calculatePlantDataTrend(plantId);
    
    return res.status(200).json({ 
      plant,
      history,
      trend
    });
  } catch (error) {
    console.error('Error fetching plant data history:', error);
    return res.status(500).json({ error: 'Failed to fetch plant data history' });
  }
});

export default router; 