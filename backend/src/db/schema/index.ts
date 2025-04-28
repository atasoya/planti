import { pgTable, serial, text, varchar, timestamp, uuid, integer, real, doublePrecision } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Users table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Auth tokens table for magic links
export const authTokens = pgTable('auth_tokens', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  token: uuid('token').notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  usedAt: timestamp('used_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Plants table
export const plants = pgTable('plants', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  icon: text('icon').notNull(),
  name: text('name').notNull(),
  species: text('species').notNull(),
  weeklyWaterMl: integer('weekly_water_ml').notNull(),
  humidity: integer('humidity').notNull(),
  location: text('location').notNull(),
  longitude: real('longitude').notNull(),
  latitude: real('latitude').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Plant data table
export const plantData = pgTable('plant_data', {
  id: serial('id').primaryKey(),
  plantId: integer('plant_id').notNull(),
  healthScore: integer('health_score').notNull(),
  humidity: integer('humidity').notNull(),
  weeklyWaterMl: integer('weekly_water_ml').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Relationships
export const usersRelations = relations(users, ({ many }) => ({
  authTokens: many(authTokens),
  plants: many(plants),
}));

export const authTokensRelations = relations(authTokens, ({ one }) => ({
  user: one(users, {
    fields: [authTokens.userId],
    references: [users.id],
  }),
}));

export const plantsRelations = relations(plants, ({ one }) => ({
  user: one(users, {
    fields: [plants.userId],
    references: [users.id],
  }),
}));

export const plantDataRelations = relations(plantData, ({ one }) => ({
  plant: one(plants, {
    fields: [plantData.plantId],
    references: [plants.id],
  }),
}));

// Export types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type AuthToken = typeof authTokens.$inferSelect;
export type NewAuthToken = typeof authTokens.$inferInsert;
export type Plant = typeof plants.$inferSelect;
export type NewPlant = typeof plants.$inferInsert;