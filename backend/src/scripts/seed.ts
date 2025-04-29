import { db } from '../db';
import { users, plants, plantData } from '../db/schema';
import { getWeatherData, calculatePlantHealthScore } from '../utils/weather';

async function seed() {
  console.log('🌱 Starting database seeding...');
  
  try {
    console.log('Clearing existing data...');
    await db.delete(plantData);
    await db.delete(plants);
    await db.delete(users);
    
    console.log('Creating users...');
    const [user1] = await db.insert(users)
      .values({
        email: 'test@example.com',
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();
    
    const [user2] = await db.insert(users)
      .values({
        email: 'ataatasoy2013@gmail.com',
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();
    
    console.log(`Created ${user1.email} (ID: ${user1.id})`);
    console.log(`Created ${user2.email} (ID: ${user2.id})`);
    
    const samplePlants = [
      {
        userId: user1.id,
        name: 'Monstera Deliciosa',
        species: 'Monstera',
        icon: '🌿',
        weeklyWaterMl: 1000,
        humidity: 65,
        location: 'Living Room',
        longitude: -122.4194,
        latitude: 37.7749
      },
      {
        userId: user1.id,
        name: 'Peace Lily',
        species: 'Spathiphyllum',
        icon: '🌱',
        weeklyWaterMl: 800,
        humidity: 60,
        location: 'Bedroom',
        longitude: -122.4194,
        latitude: 37.7749
      },
      {
        userId: user2.id,
        name: 'Snake Plant',
        species: 'Sansevieria',
        icon: '🪴',
        weeklyWaterMl: 300,
        humidity: 40,
        location: 'Office',
        longitude: -74.0060,
        latitude: 40.7128
      },
      {
        userId: user2.id,
        name: 'Fiddle Leaf Fig',
        species: 'Ficus lyrata',
        icon: '🌳',
        weeklyWaterMl: 1200,
        humidity: 55,
        location: 'Sunroom',
        longitude: -74.0060,
        latitude: 40.7128
      }
    ];
    
    console.log('Creating plants and plant data...');
    for (const plantInfo of samplePlants) {
      const weatherData = await getWeatherData(plantInfo.latitude, plantInfo.longitude);
      
      const healthScore = calculatePlantHealthScore(
        plantInfo.weeklyWaterMl,
        plantInfo.humidity,
        weatherData
      );
      
      const [createdPlant] = await db.insert(plants)
        .values({
          ...plantInfo,
          healthScore,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();
        
      console.log(`Created plant: ${createdPlant.name} (ID: ${createdPlant.id})`);
      
      await db.insert(plantData)
        .values({
          plantId: createdPlant.id,
          healthScore: Math.round(healthScore),
          humidity: Math.round(weatherData.humidity),
          weeklyWaterMl: plantInfo.weeklyWaterMl,
          createdAt: new Date()
        });
      
      const totalDays = 90;
      
      for (let i = 1; i <= totalDays; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        
        const waterVariation = 0.7 + (Math.random() * 0.6); 
        const randomWaterAmount = Math.round(plantInfo.weeklyWaterMl * waterVariation);
        
        const humidityVariation = (Math.random() * 30) - 15; 
        const randomHumidity = Math.min(95, Math.max(20, plantInfo.humidity + humidityVariation));
        
        const randomHealthScore = calculateDailyHealthScore(
          randomWaterAmount, 
          randomHumidity,
          plantInfo.weeklyWaterMl,
          plantInfo.humidity
        );
        
        await db.insert(plantData)
          .values({
            plantId: createdPlant.id,
            healthScore: Math.round(randomHealthScore),
            humidity: Math.round(randomHumidity),
            weeklyWaterMl: randomWaterAmount,
            createdAt: date
          });
      }
      
      console.log(`Created 3 months of historical data for plant ID: ${createdPlant.id}`);
    }
    
    console.log('✅ Seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    process.exit(0);
  }
}

function calculateDailyHealthScore(
  waterAmount: number, 
  humidity: number, 
  optimalWater: number, 
  optimalHumidity: number
): number {
  const waterDeviation = Math.abs(waterAmount - optimalWater) / optimalWater;
  const waterScore = 100 - (waterDeviation * 50);
  
  const humidityDeviation = Math.abs(humidity - optimalHumidity) / 50;
  const humidityScore = 100 - (humidityDeviation * 40);
  
  const randomVariation = (Math.random() * 10) - 5;
  
  let healthScore = (waterScore * 0.6) + (humidityScore * 0.4) + randomVariation;
  
  healthScore = Math.min(Math.max(healthScore, 30), 100);
  
  return healthScore;
}

seed(); 