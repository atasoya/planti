import { db } from '../db';
import { users, plants, plantData } from '../db/schema';
import { getWeatherData, calculatePlantHealthScore } from '../utils/weather';

const plantSpecies = [
  { name: 'Monstera Deliciosa', species: 'Monstera', icon: '🌿', water: 1000, humidity: 65 },
  { name: 'Peace Lily', species: 'Spathiphyllum', icon: '🌱', water: 800, humidity: 60 },
  { name: 'Snake Plant', species: 'Sansevieria', icon: '🪴', water: 300, humidity: 40 },
  { name: 'Fiddle Leaf Fig', species: 'Ficus lyrata', icon: '🌳', water: 1200, humidity: 55 },
  { name: 'Pothos', species: 'Epipremnum aureum', icon: '🌱', water: 500, humidity: 50 },
  { name: 'Aloe Vera', species: 'Aloe', icon: '🌵', water: 200, humidity: 30 },
  { name: 'Spider Plant', species: 'Chlorophytum', icon: '🕸️', water: 600, humidity: 45 },
  { name: 'ZZ Plant', species: 'Zamioculcas', icon: '🌿', water: 400, humidity: 35 },
  { name: 'Boston Fern', species: 'Nephrolepis', icon: '🌿', water: 1100, humidity: 70 },
  { name: 'Rubber Plant', species: 'Ficus elastica', icon: '🌳', water: 700, humidity: 50 },
  { name: 'Parlor Palm', species: 'Chamaedorea', icon: '🌴', water: 800, humidity: 55 },
  { name: 'Chinese Money Plant', species: 'Pilea', icon: '🪴', water: 500, humidity: 45 },
  { name: 'Orchid', species: 'Phalaenopsis', icon: '🌸', water: 400, humidity: 65 },
  { name: 'Calathea', species: 'Calathea', icon: '🌿', water: 900, humidity: 70 },
  { name: 'English Ivy', species: 'Hedera helix', icon: '🌱', water: 700, humidity: 55 },
  { name: 'Philodendron', species: 'Philodendron', icon: '🌿', water: 800, humidity: 60 },
  { name: 'String of Pearls', species: 'Senecio', icon: '🫘', water: 300, humidity: 40 },
  { name: 'Jade Plant', species: 'Crassula', icon: '🌵', water: 250, humidity: 35 },
  { name: 'Air Plant', species: 'Tillandsia', icon: '🌬️', water: 150, humidity: 50 },
  { name: 'Bird of Paradise', species: 'Strelitzia', icon: '🦜', water: 1000, humidity: 60 }
];

const locations = [
  { name: 'New York', long: -74.006, lat: 40.7128 },
  { name: 'San Francisco', long: -122.4194, lat: 37.7749 },
  { name: 'London', long: -0.1278, lat: 51.5074 },
  { name: 'Tokyo', long: 139.6503, lat: 35.6762 },
  { name: 'Sydney', long: 151.2093, lat: -33.8688 },
  { name: 'Paris', long: 2.3522, lat: 48.8566 },
  { name: 'Berlin', long: 13.4050, lat: 52.5200 },
  { name: 'Rio de Janeiro', long: -43.1729, lat: -22.9068 },
  { name: 'Cape Town', long: 18.4241, lat: -33.9249 },
  { name: 'Dubai', long: 55.2708, lat: 25.2048 },
  { name: 'Mumbai', long: 72.8777, lat: 19.0760 },
  { name: 'Moscow', long: 37.6173, lat: 55.7558 },
  { name: 'Toronto', long: -79.3832, lat: 43.6532 },
  { name: 'Mexico City', long: -99.1332, lat: 19.4326 },
  { name: 'Cairo', long: 31.2357, lat: 30.0444 },
  { name: 'Bangkok', long: 100.5018, lat: 13.7563 },
  { name: 'Singapore', long: 103.8198, lat: 1.3521 },
  { name: 'Amsterdam', long: 4.9041, lat: 52.3676 },
  { name: 'Stockholm', long: 18.0686, lat: 59.3293 },
  { name: 'Istanbul', long: 28.9784, lat: 41.0082 }
];

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
    
    console.log('Creating plants and plant data...');
    
    for (const user of [user1, user2]) {
      console.log(`Creating 20 plants for user ${user.email}...`);
      
      for (let i = 0; i < 20; i++) {
        const plantTemplate = plantSpecies[i];
        const location = locations[i % locations.length];
        
        const plantName = i >= plantSpecies.length ? 
          `${plantTemplate.name} ${Math.floor(i / plantSpecies.length) + 1}` : 
          plantTemplate.name;
        
        const plantInfo = {
          userId: user.id,
          name: plantName,
          species: plantTemplate.species,
          icon: plantTemplate.icon,
          weeklyWaterMl: plantTemplate.water,
          humidity: plantTemplate.humidity,
          location: location.name,
          longitude: location.long,
          latitude: location.lat
        };
        
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
        
        await generateHealthHistory(createdPlant.id, plantInfo);
      }
    }
    
    console.log('✅ Seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    process.exit(0);
  }
}

async function generateHealthHistory(plantId: number, plantInfo: any) {
  const totalDays = 90;
  
  let previousHealth = 80 + (Math.random() * 15);
  
  for (let i = 1; i <= totalDays; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    const waterVariation = 0.7 + (Math.random() * 0.6); 
    const randomWaterAmount = Math.round(plantInfo.weeklyWaterMl * waterVariation);
    
    const humidityVariation = (Math.random() * 30) - 15; 
    const randomHumidity = Math.min(95, Math.max(20, plantInfo.humidity + humidityVariation));
    

    const changeAmount = (Math.random() * 10) - 4; 
    let newHealth = previousHealth + changeAmount;
    
    newHealth = Math.min(Math.max(newHealth, 30), 100);
    previousHealth = newHealth;
    
    await db.insert(plantData)
      .values({
        plantId: plantId,
        healthScore: Math.round(newHealth),
        humidity: Math.round(randomHumidity),
        weeklyWaterMl: randomWaterAmount,
        createdAt: date
      });
  }
  
  console.log(`Generated 90 days of health history for plant ID: ${plantId}`);
}


seed(); 