import { db } from '../db';
import { plants, NewPlant } from '../db/schema';
import { eq, and } from 'drizzle-orm';

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

export async function getPlantById(plantId: number, userId: number): Promise<any> {
  try {
    const plant = await db.query.plants.findFirst({
      where: and(
        eq(plants.id, plantId),
        eq(plants.userId, userId)
      ),
    });
    
    return plant;
  } catch (error) {
    console.error('Error in getPlantById service:', error);
    throw error;
  }
}

export async function updatePlant(
  plantId: number, 
  userId: number, 
  updateData: Partial<Omit<NewPlant, 'createdAt' | 'updatedAt' | 'userId'>>
): Promise<any> {
  try {
    const plant = await getPlantById(plantId, userId);
    
    if (!plant) {
      throw new Error('Plant not found or does not belong to user');
    }
    
    const [updatedPlant] = await db.update(plants)
      .set({
        ...updateData,
        updatedAt: new Date()
      })
      .where(and(
        eq(plants.id, plantId),
        eq(plants.userId, userId)
      ))
      .returning();
    
    return updatedPlant;
  } catch (error) {
    console.error('Error in updatePlant service:', error);
    throw error;
  }
} 