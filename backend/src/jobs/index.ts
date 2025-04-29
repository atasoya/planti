import cron from 'node-cron';
import { calculateAllPlantsHealth } from './plant-health.job';

export function scheduleCronJobs(): void {
  cron.schedule('0 10 * * *', async () => { // daily 10:00 AM
    console.log(`Running daily plant health calculation at ${new Date().toISOString()}`);
    await calculateAllPlantsHealth();
  });
  
  console.log('Cron jobs scheduled successfully');
}

export async function runPlantHealthJobNow(): Promise<void> {
  console.log(`Manually running plant health calculation at ${new Date().toISOString()}`);
  await calculateAllPlantsHealth();
}
