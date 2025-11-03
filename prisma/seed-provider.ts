import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding API provider...');

  // Get Amadeus credentials from environment
  const clientId = process.env.AMADEUS_CLIENT_ID;
  const clientSecret = process.env.AMADEUS_CLIENT_SECRET;
  const environment = process.env.AMADEUS_ENVIRONMENT || 'test';

  if (!clientId || !clientSecret) {
    console.warn('⚠️  Warning: AMADEUS_CLIENT_ID or AMADEUS_CLIENT_SECRET not found in environment');
    console.log('Please set these in your .env.local file:');
    console.log('AMADEUS_CLIENT_ID=your_client_id');
    console.log('AMADEUS_CLIENT_SECRET=your_client_secret');
    console.log('');
    console.log('You can add a provider manually via admin dashboard later.');
    return;
  }

  // Encrypt credentials (for now just stringify, should use proper encryption in production)
  const credentials = JSON.stringify({
    clientId,
    clientSecret,
    environment,
  });

  // Create Amadeus provider
  const amadeusProvider = await prisma.apiProvider.upsert({
    where: { name: 'amadeus-primary' },
    update: {
      credentials,
      environment,
      isActive: true,
      isPrimary: true,
    },
    create: {
      name: 'amadeus-primary',
      displayName: 'Amadeus Travel API',
      provider: 'AMADEUS',
      credentials,
      environment,
      isActive: true,
      isPrimary: true,
      priority: 1,
      supportedFeatures: JSON.stringify(['FLIGHT_SEARCH', 'AIRPORT_SEARCH']),
      requestsPerMinute: 100,
      requestsPerDay: 10000,
    },
  });
  
  console.log('✅ Amadeus provider configured:', amadeusProvider.displayName);
  console.log('🌍 Environment:', amadeusProvider.environment);
  console.log('⚡ Status:', amadeusProvider.isActive ? 'Active' : 'Inactive');
  console.log('🎯 Primary:', amadeusProvider.isPrimary ? 'Yes' : 'No');
  console.log('');
  console.log('✨ Provider is ready to use!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding provider:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
