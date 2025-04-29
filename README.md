![Postgres](https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)
![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)
![JWT](https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens)
![NPM](https://img.shields.io/badge/NPM-%23CB3837.svg?style=for-the-badge&logo=npm&logoColor=white)
![Next JS](https://img.shields.io/badge/Next-black?style=for-the-badge&logo=next.js&logoColor=white)
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)

# 🪴 Planti - Developer-First Plant Management System

Planti was created as a 2 day coding challenge to display my full-stack development skills.

![Plant Architecture](/documentation/homepage.png)

## What is Planti?

Planti is a smart plant management system that calculates real world health scores for your plants based on data from the [Open-Meteo API](https://open-meteo.com/en/docs/historical-forecast-api).

It also provides a developer API, enabling users to create their own automations and integrations.

## Features

- 🌱 Track all your plants in one place
- 📊 Monitor plant health based on real weather data
- 🔌 Developer API for custom integrations
- 📱 Mobile-friendly responsive design

## Setting Up Local Development Environment

1. **Clone the repository**

   ```bash
   git clone git@github.com:atasoya/planti.git
   cd planti
   ```

2. **Run Docker with docker-compose**

   ```bash
   docker-compose -f docker-compose.dev.yml up
   ```

3. **Create migration files and migrate the database**

   ```bash
   npm run db:generate
   npm run db:migrate
   ```

4. **Seed the database (optional)**

   ```bash
   npm run db:seed
   ```

5. **Additional development tools**
   - MailHog server is running at port 8025
   - Access Drizzle Studio by running `npm run db:studio` and visiting [local.drizzle.studio](http://local.drizzle.studio)

## API Documentation

Comprehensive API documentation is available in the application's Developer section after logging in.

## Architecture

![Plant Arcitecture](/documentation/architecture.png)

## Key Decisions

### Tech Stack:

- **Frontend**: Using **Next.js** as it's the framework I'm most confident with.
- **Backend**: **Express** with **TypeScript**, to keep the project consistent and improve development speed by using a single language throughout.
- **Database**: **PostgreSQL**, chosen for its performance and scalability. I'm using **Drizzle ORM** because it's lightweight, fast, and familiar.
- **Mail**: Integrated **MailHog** for local testing. This will be replaced with a production-ready solution in deployment environments.

### Authentication

This is my third time building a magic link authentication server from scratch, and it's my favorite authentication method.

For this project, I decided to implement server-side cookies as the token storage method.

### Calculating Plant Health

The health score calculation begins with a baseline of 80 points and adjusts based on:

1. **Humidity Comparison**:

   - Compares the plant's optimal humidity requirement with actual humidity from weather data
   - Penalizes larger differences:
     - 20% difference: -15 points
     - 10% difference: -8 points
     - 5% difference: -3 points

2. **Water Requirements**:
   - Compares the plant's weekly water needs with actual precipitation
   - Insufficient water (less than 50% of needs): -10 points
   - Excessive water (more than double needs): -5 points

All health scores are constrained between 0-100, with visual indicators that clearly communicate plant status.

## Project Demo

![Plant Demo](/documentation/demo-video.gif)
