import { db } from '../db';
import { plants, NewPlant } from '../db/schema';
import { eq, and, desc, count } from 'drizzle-orm';

type PlantInput = Omit<NewPlant, 'createdAt' | 'updatedAt' | 'userId'>;

export async function addPlant(
  plantData: PlantInput, 
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

export async function getUserPlants(userId: number, page: number = 1, limit: number = 15): Promise<{plants: any[], total: number}> {
  try {
    const offset = (page - 1) * limit;
    
    const totalCount = await db.select({ count: count() })
      .from(plants)
      .where(eq(plants.userId, userId));
    
    const userPlants = await db.query.plants.findMany({
      where: eq(plants.userId, userId),
      orderBy: [desc(plants.createdAt)],
      limit: limit,
      offset: offset
    });
    
    return {
      plants: userPlants,
      total: Number(totalCount[0].count)
    };
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
  updateData: Partial<PlantInput>
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

export async function getAllPlants(): Promise<any[]> {
  try {
    const allPlants = await db.query.plants.findMany({
      orderBy: [desc(plants.id)]
    });
    
    return allPlants;
  } catch (error) {
    console.error('Error in getAllPlants service:', error);
    throw error;
  }
} 