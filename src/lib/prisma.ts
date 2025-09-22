import { PrismaClient } from '@prisma/client';

// Global variable to store the Prisma client instance
declare global {
  var __prisma: PrismaClient | undefined;
}

// Create a singleton Prisma client instance
// In development, store the instance in a global variable to prevent multiple instances
// In production, create a new instance for each request
const prisma = globalThis.__prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  errorFormat: 'pretty',
});

if (process.env.NODE_ENV === 'development') {
  globalThis.__prisma = prisma;
}

export { prisma };

// Database connection utilities
export async function connectToDatabase() {
  try {
    await prisma.$connect();
    console.log('✅ Successfully connected to database');
    return true;
  } catch (error) {
    console.error('❌ Failed to connect to database:', error);
    return false;
  }
}

export async function disconnectFromDatabase() {
  try {
    await prisma.$disconnect();
    console.log('✅ Successfully disconnected from database');
    return true;
  } catch (error) {
    console.error('❌ Failed to disconnect from database:', error);
    return false;
  }
}

// Database health check
export async function checkDatabaseHealth() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { status: 'healthy', timestamp: new Date() };
  } catch (error) {
    return { status: 'unhealthy', error: error instanceof Error ? error.message : 'Unknown error', timestamp: new Date() };
  }
}

// Graceful shutdown handling
process.on('beforeExit', async () => {
  await disconnectFromDatabase();
});

process.on('SIGINT', async () => {
  await disconnectFromDatabase();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await disconnectFromDatabase();
  process.exit(0);
});