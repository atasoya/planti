import { db } from '../db';
import { plantData } from '../db/schema';
import { eq, and, desc } from 'drizzle-orm';

interface PlantDataInput {
  plantId: number;
  healthScore: number;
  humidity: number;
  weeklyWaterMl: number;
}

export async function addPlantDataRecord(data: PlantDataInput): Promise<any> {
  try {
    const [record] = await db.insert(plantData)
      .values({
        ...data,
        createdAt: new Date()
      })
      .returning();
    
    return record;
  } catch (error) {
    console.error('Error in addPlantDataRecord service:', error);
    throw error;
  }
}

export async function getPlantDataHistory(plantId: number, limit: number = 10): Promise<any> {
  try {
    const history = await db.query.plantData.findMany({
      where: eq(plantData.plantId, plantId),
      orderBy: [desc(plantData.createdAt)],
      limit
    });
    
    return history;
  } catch (error) {
    console.error('Error in getPlantDataHistory service:', error);
    throw error;
  }
}

export async function getLatestPlantData(plantId: number): Promise<any> {
  try {
    const history = await getPlantDataHistory(plantId, 1);
    return history.length > 0 ? history[0] : null;
  } catch (error) {
    console.error('Error in getLatestPlantData service:', error);
    throw error;
  }
}

export async function calculatePlantDataTrend(plantId: number): Promise<'up' | 'down' | 'stable'> {
  try {
    const history = await getPlantDataHistory(plantId, 5);
    
    if (history.length < 2) {
      return 'stable'; 
    }
    
    const currentScore = history[0].healthScore;
    const previousScore = history[history.length - 1].healthScore;
    
    if (currentScore - previousScore >= 5) {
      return 'up';
    } else if (previousScore - currentScore >= 5) {
      return 'down';
    } else {
      return 'stable';
    }
  } catch (error) {
    console.error('Error in calculatePlantDataTrend service:', error);
    return 'stable';
  }
} 