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
      
      const pastDates = [];
      for (let i = 1; i <= 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        pastDates.push(date);
      }
      
      for (const date of pastDates) {
        const randomVariation = Math.floor(Math.random() * 10) - 5; 
        const historicalScore = Math.min(100, Math.max(50, healthScore + randomVariation));
        
        const randomHumidity = Math.round(
          Math.min(100, Math.max(30, weatherData.humidity + (Math.random() * 10 - 5)))
        );
        
        await db.insert(plantData)
          .values({
            plantId: createdPlant.id,
            healthScore: Math.round(historicalScore),
            humidity: randomHumidity,
            weeklyWaterMl: plantInfo.weeklyWaterMl,
            createdAt: date
          });
      }
      
      console.log(`Created historical data for plant ID: ${createdPlant.id}`);
    }
    
    console.log('✅ Seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    process.exit(0);
  }
}

seed(); 