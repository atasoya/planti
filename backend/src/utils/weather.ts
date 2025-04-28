import axios from 'axios';

interface WeatherData {
  humidity: number;
  dailyPrecipitation: number;
  weeklyPrecipitation: number;
}

export async function getWeatherData(latitude: number, longitude: number): Promise<WeatherData> {
  try {
    const response = await axios.get('https://api.open-meteo.com/v1/forecast', {
      params: {
        latitude,
        longitude,
        current: 'relative_humidity_2m,precipitation',
        daily: 'precipitation_sum',
        forecast_days: 7
      }
    });

    const { current, daily } = response.data;
    
    const weeklyPrecipitation = daily.precipitation_sum.reduce((sum: number, dailyValue: number) => sum + dailyValue, 0);
    
    return {
      humidity: current.relative_humidity_2m,
      dailyPrecipitation: current.precipitation,
      weeklyPrecipitation
    };
  } catch (error) {
    console.error('Error fetching weather data:', error);
    throw new Error('Failed to fetch weather data');
  }
}

export function calculatePlantHealthScore(
  weeklyWaterMl: number,
  optimalHumidity: number,
  currentWeather: WeatherData
): number {
  let score = 80;
  
  const humidityDifference = Math.abs(optimalHumidity - currentWeather.humidity);
  if (humidityDifference > 20) {
    score -= 15;
  } else if (humidityDifference > 10) {
    score -= 8;
  } else if (humidityDifference > 5) {
    score -= 3;
  }
  
  const weeklyWaterLiters = weeklyWaterMl / 1000;
  if (currentWeather.weeklyPrecipitation < (weeklyWaterLiters * 0.5)) {
    score -= 10;
  } else if (currentWeather.weeklyPrecipitation > (weeklyWaterLiters * 2)) {
    score -= 5;
  }
  
  return Math.min(100, Math.max(0, score));
}

export function calculateHealthTrend(previousScore: number, currentScore: number): 'up' | 'down' | 'stable' {
  const difference = currentScore - previousScore;
  if (difference > 5) return 'up';
  if (difference < -5) return 'down';
  return 'stable';
}