import { db } from '../db';
import { plants, NewPlant } from '../db/schema';
import { eq } from 'drizzle-orm';

export async function addPlant(
  plantData: Omit<NewPlant, 'createdAt' | 'updatedAt' | 'userId'>, 
  userId: number
): Promise<any> {
  try {
    const [plant] = await db.insert(plants)
      .values({
        ...plantData,
        userId,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();
    
    return plant;
  } catch (error) {
    console.error('Error in addPlant service:', error);
    throw error;
  }
}

export async function getUserPlants(userId: number): Promise<any> {
  try {
    const userPlants = await db.query.plants.findMany({
      where: eq(plants.userId, userId),
    });
    
    return userPlants;
  } catch (error) {
    console.error('Error in getUserPlants service:', error);
    throw error;
  }
} 