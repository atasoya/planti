import { db } from '../db';
import { apiKeys, ApiKey, NewApiKey } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import crypto from 'crypto';

export async function createApiKey(userId: number, name: string): Promise<{ apiKey: ApiKey, fullKey: string }> {
  const fullKey = `planti_${crypto.randomBytes(32).toString('hex')}`;
  
  const hashedKey = crypto.createHash('sha256').update(fullKey).digest('hex');
  
  const newApiKey: NewApiKey = {
    userId,
    key: hashedKey,
    name,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  const [apiKey] = await db.insert(apiKeys).values(newApiKey).returning();
  
  return { apiKey, fullKey };
}

export async function getApiKeysByUser(userId: number): Promise<ApiKey[]> {
  return await db.select().from(apiKeys).where(eq(apiKeys.userId, userId));
}

export async function deleteApiKey(userId: number, keyId: number): Promise<boolean> {
  const result = await db
    .delete(apiKeys)
    .where(and(eq(apiKeys.id, keyId), eq(apiKeys.userId, userId)))
    .returning({ id: apiKeys.id });
  
  return result.length > 0;
}

export async function incrementApiKeyUsage(hashedKey: string): Promise<ApiKey | null> {
  const key = await db.select().from(apiKeys).where(eq(apiKeys.key, hashedKey)).limit(1);
  
  if (key.length === 0) {
    return null;
  }
  
  const [updatedKey] = await db
    .update(apiKeys)
    .set({ 
      usage: (key[0].usage || 0) + 1,
      updatedAt: new Date()
    })
    .where(eq(apiKeys.id, key[0].id))
    .returning();
    
  return updatedKey;
}

export async function validateApiKey(fullKey: string): Promise<number | null> {
  const hashedKey = crypto.createHash('sha256').update(fullKey).digest('hex');
  
  const key = await db.select().from(apiKeys).where(eq(apiKeys.key, hashedKey)).limit(1);
  
  if (key.length === 0) {
    return null;
  }
  
  await incrementApiKeyUsage(hashedKey);
  
  return key[0].userId;
} 