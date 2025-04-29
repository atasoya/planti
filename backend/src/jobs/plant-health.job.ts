import { getAllPlants } from '../services/plant.service';
import { getWeatherData, calculatePlantHealthScore } from '../utils/weather';
import { addPlantDataRecord } from '../services/plant-data.service';
import { db } from '../db';
import { plants } from '../db/schema';
import { eq } from 'drizzle-orm';

export async function calculateAllPlantsHealth(): Promise<void> {
  try {
    console.log('Starting daily plant health calculation job...');
    const allPlants = await getAllPlants();
    console.log(`Found ${allPlants.length} plants to process`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const plant of allPlants) {
      try {
        const weatherData = await getWeatherData(plant.latitude, plant.longitude);
        
        const healthScore = calculatePlantHealthScore(
          plant.weeklyWaterMl,
          plant.humidity,
          weatherData
        );
        
        await db.update(plants)
          .set({ 
            healthScore, 
            updatedAt: new Date() 
          })
          .where(eq(plants.id, plant.id));
        
        await addPlantDataRecord({
          plantId: plant.id,
          healthScore,
          humidity: weatherData.humidity,
          weeklyWaterMl: plant.weeklyWaterMl
        });
        
        successCount++;
      } catch (error) {
        console.error(`Error processing plant ${plant.id} (${plant.name}):`, error);
        errorCount++;
      }
    }
    
    console.log(`Plant health calculation job completed.`);
    console.log(`Successfully processed: ${successCount} plants`);
    
    if (errorCount > 0) {
      console.error(`Failed to process: ${errorCount} plants`);
    }
  } catch (error) {
    console.error('Error in calculateAllPlantsHealth job:', error);
  }
} 