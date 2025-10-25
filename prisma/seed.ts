import { PrismaClient } from '../src/generated/prisma';
import { GLOBAL_AIRPORTS } from '../src/data/globalAirports';

const prisma = new PrismaClient();

// Convert global airports to Prisma format
interface GlobalAirport {
  iataCode: string;
  icaoCode: string;
  name: string;
  city: string;
  country: string;
  countryCode: string;
  timezone: string;
  coordinates: { latitude: number; longitude: number };
  region?: string;
  subtype?: string;
  type?: string;
}

const convertToSeedFormat = (airport: GlobalAirport) => ({
  iataCode: airport.iataCode,
  icaoCode: airport.icaoCode,
  name: airport.name,
  city: airport.city,
  country: airport.country,
  countryCode: airport.countryCode,
  timezone: airport.timezone,
  latitude: airport.coordinates.latitude,
  longitude: airport.coordinates.longitude,
  elevation: 0, // Default elevation
  additionalInfo: JSON.stringify({
    region: airport.region,
    subtype: airport.subtype,
    type: airport.type
  })
});

const majorAirports = GLOBAL_AIRPORTS.map(convertToSeedFormat);

// Note: Legacy airports data is preserved for reference but not used in seeding
// If needed, uncomment the section below
/*
const legacyAirports = [
  // North America
  {
    iataCode: 'LAX',
    icaoCode: 'KLAX',
    name: 'Los Angeles International Airport',
    city: 'Los Angeles',
    country: 'United States',
    countryCode: 'US',
    timezone: 'America/Los_Angeles',
    latitude: 33.9425,
    longitude: -118.4081,
    elevation: 125,
  },
  {
    iataCode: 'JFK',
    icaoCode: 'KJFK',
    name: 'John F. Kennedy International Airport',
    city: 'New York',
    country: 'United States',
    countryCode: 'US',
    timezone: 'America/New_York',
    latitude: 40.6413,
    longitude: -73.7781,
    elevation: 13,
  },
  {
    iataCode: 'ORD',
    icaoCode: 'KORD',
    name: "O'Hare International Airport",
    city: 'Chicago',
    country: 'United States',
    countryCode: 'US',
    timezone: 'America/Chicago',
    latitude: 41.9742,
    longitude: -87.9073,
    elevation: 668,
  },
  {
    iataCode: 'MIA',
    icaoCode: 'KMIA',
    name: 'Miami International Airport',
    city: 'Miami',
    country: 'United States',
    countryCode: 'US',
    timezone: 'America/New_York',
    latitude: 25.7959,
    longitude: -80.2870,
    elevation: 11,
  },
  {
    iataCode: 'YYZ',
    icaoCode: 'CYYZ',
    name: 'Toronto Pearson International Airport',
    city: 'Toronto',
    country: 'Canada',
    countryCode: 'CA',
    timezone: 'America/Toronto',
    latitude: 43.6777,
    longitude: -79.6248,
    elevation: 569,
  },

  // Europe
  {
    iataCode: 'LHR',
    icaoCode: 'EGLL',
    name: 'Heathrow Airport',
    city: 'London',
    country: 'United Kingdom',
    countryCode: 'GB',
    timezone: 'Europe/London',
    latitude: 51.4700,
    longitude: -0.4543,
    elevation: 83,
  },
  {
    iataCode: 'CDG',
    icaoCode: 'LFPG',
    name: 'Charles de Gaulle Airport',
    city: 'Paris',
    country: 'France',
    countryCode: 'FR',
    timezone: 'Europe/Paris',
    latitude: 49.0097,
    longitude: 2.5479,
    elevation: 392,
  },
  {
    iataCode: 'FRA',
    icaoCode: 'EDDF',
    name: 'Frankfurt Airport',
    city: 'Frankfurt',
    country: 'Germany',
    countryCode: 'DE',
    timezone: 'Europe/Berlin',
    latitude: 50.0379,
    longitude: 8.5622,
    elevation: 364,
  },
  {
    iataCode: 'AMS',
    icaoCode: 'EHAM',
    name: 'Amsterdam Airport Schiphol',
    city: 'Amsterdam',
    country: 'Netherlands',
    countryCode: 'NL',
    timezone: 'Europe/Amsterdam',
    latitude: 52.3105,
    longitude: 4.7683,
    elevation: -11,
  },
  {
    iataCode: 'FCO',
    icaoCode: 'LIRF',
    name: 'Leonardo da Vinci International Airport',
    city: 'Rome',
    country: 'Italy',
    countryCode: 'IT',
    timezone: 'Europe/Rome',
    latitude: 41.8045,
    longitude: 12.2515,
    elevation: 13,
  },

  // Asia-Pacific
  {
    iataCode: 'NRT',
    icaoCode: 'RJAA',
    name: 'Narita International Airport',
    city: 'Tokyo',
    country: 'Japan',
    countryCode: 'JP',
    timezone: 'Asia/Tokyo',
    latitude: 35.7647,
    longitude: 140.3864,
    elevation: 141,
  },
  {
    iataCode: 'ICN',
    icaoCode: 'RKSI',
    name: 'Incheon International Airport',
    city: 'Seoul',
    country: 'South Korea',
    countryCode: 'KR',
    timezone: 'Asia/Seoul',
    latitude: 37.4602,
    longitude: 126.4407,
    elevation: 23,
  },
  {
    iataCode: 'SIN',
    icaoCode: 'WSSS',
    name: 'Singapore Changi Airport',
    city: 'Singapore',
    country: 'Singapore',
    countryCode: 'SG',
    timezone: 'Asia/Singapore',
    latitude: 1.3644,
    longitude: 103.9915,
    elevation: 22,
  },
  {
    iataCode: 'HKG',
    icaoCode: 'VHHH',
    name: 'Hong Kong International Airport',
    city: 'Hong Kong',
    country: 'Hong Kong',
    countryCode: 'HK',
    timezone: 'Asia/Hong_Kong',
    latitude: 22.3080,
    longitude: 113.9185,
    elevation: 28,
  },
  {
    iataCode: 'SYD',
    icaoCode: 'YSSY',
    name: 'Sydney Kingsford Smith Airport',
    city: 'Sydney',
    country: 'Australia',
    countryCode: 'AU',
    timezone: 'Australia/Sydney',
    latitude: -33.9399,
    longitude: 151.1753,
    elevation: 21,
  },

  // Middle East & Africa
  {
    iataCode: 'DXB',
    icaoCode: 'OMDB',
    name: 'Dubai International Airport',
    city: 'Dubai',
    country: 'United Arab Emirates',
    countryCode: 'AE',
    timezone: 'Asia/Dubai',
    latitude: 25.2532,
    longitude: 55.3657,
    elevation: 62,
  },
  {
    iataCode: 'DOH',
    icaoCode: 'OTHH',
    name: 'Hamad International Airport',
    city: 'Doha',
    country: 'Qatar',
    countryCode: 'QA',
    timezone: 'Asia/Qatar',
    latitude: 25.2731,
    longitude: 51.6080,
    elevation: 13,
  },
  {
    iataCode: 'JNB',
    icaoCode: 'FAJS',
    name: 'OR Tambo International Airport',
    city: 'Johannesburg',
    country: 'South Africa',
    countryCode: 'ZA',
    timezone: 'Africa/Johannesburg',
    latitude: -26.1367,
    longitude: 28.2411,
    elevation: 1694,
  },

  // South America
  {
    iataCode: 'GRU',
    icaoCode: 'SBGR',
    name: 'São Paulo-Guarulhos International Airport',
    city: 'São Paulo',
    country: 'Brazil',
    countryCode: 'BR',
    timezone: 'America/Sao_Paulo',
    latitude: -23.4356,
    longitude: -46.4731,
    elevation: 750,
  },
  {
    iataCode: 'LIM',
    icaoCode: 'SPJC',
    name: 'Jorge Chávez International Airport',
    city: 'Lima',
    country: 'Peru',
    countryCode: 'PE',
    timezone: 'America/Lima',
    latitude: -12.0219,
    longitude: -77.1143,
    elevation: 113,
  },
];
*/

async function main() {
  console.log('🌱 Starting database seed...');

  try {
    // Seed airports
    console.log('📍 Seeding airports...');
    
    for (const airport of majorAirports) {
      await prisma.airport.upsert({
        where: { iataCode: airport.iataCode },
        update: airport,
        create: airport,
      });
    }
    
    console.log(`✅ Seeded ${majorAirports.length} global airports (worldwide coverage)`);

    // Create demo users (if they don't exist)
    console.log('👤 Seeding demo users...');
    
    const demoUsers = [
      {
        email: 'demo@flightbooker.com',
        password: '$2b$12$jPXvjIw26nccvvkEhSO4h.lM2upOdt7osflU4ODtc1a/6N/D.I9Ry', // Password: Demo123!
        firstName: 'Demo',
        lastName: 'User',
        phone: '+1-555-DEMO',
        preferences: JSON.stringify({
          currency: 'USD',
          language: 'en',
          notifications: {
            email: true,
            sms: false,
            push: true,
          },
        }),
      },
      {
        email: 'admin@flightbooker.com',
        password: '$2b$12$mWO.gzfSb4ecn9WoUpisx.qgQ0PZ50kBqYeuj73ZOyzoJB7tEFCPi', // Password: Demo123!
        firstName: 'Admin',
        lastName: 'User',
        phone: '+1-555-ADMIN',
        preferences: JSON.stringify({
          currency: 'USD',
          language: 'en',
          notifications: {
            email: true,
            sms: true,
            push: true,
          },
        }),
      },
    ];

    for (const user of demoUsers) {
      await prisma.user.upsert({
        where: { email: user.email },
        update: {
          password: user.password,  // Force update password with correct hash
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          preferences: user.preferences,
        },
        create: user,
      });
    }

    console.log(`✅ Seeded ${demoUsers.length} demo users`);

    // Create some sample flight data for caching
    console.log('✈️ Seeding sample flights...');
    
    const sampleFlights = [
      {
        airline: 'Delta Air Lines',
        flightNumber: 'DL123',
        aircraftType: 'Boeing 737-800',
        origin: 'LAX',
        destination: 'JFK',
        departureTime: '08:00',
        arrivalTime: '16:30',
        departureDate: '2024-12-01',
        arrivalDate: '2024-12-01',
        duration: '5h 30m',
        stops: 0,
        basePrice: 299.99,
        currency: 'USD',
        availableSeats: 156,
        cabinClasses: JSON.stringify({
          economy: { price: 299.99, available: 120 },
          'premium-economy': { price: 449.99, available: 24 },
          business: { price: 899.99, available: 12 },
          first: { price: 1599.99, available: 8 }
        }),
        validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
      },
      {
        airline: 'United Airlines',
        flightNumber: 'UA456',
        aircraftType: 'Airbus A321',
        origin: 'ORD',
        destination: 'LHR',
        departureTime: '21:45',
        arrivalTime: '12:30',
        departureDate: '2024-12-01',
        arrivalDate: '2024-12-02',
        duration: '8h 45m',
        stops: 0,
        basePrice: 599.99,
        currency: 'USD',
        availableSeats: 189,
        cabinClasses: JSON.stringify({
          economy: { price: 599.99, available: 150 },
          'premium-economy': { price: 899.99, available: 24 },
          business: { price: 1799.99, available: 15 },
        }),
        validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
      {
        airline: 'American Airlines',
        flightNumber: 'AA789',
        aircraftType: 'Boeing 777-200ER',
        origin: 'MIA',
        destination: 'CDG',
        departureTime: '23:15',
        arrivalTime: '14:45',
        departureDate: '2024-12-01',
        arrivalDate: '2024-12-02',
        duration: '9h 30m',
        stops: 0,
        basePrice: 649.99,
        currency: 'USD',
        availableSeats: 289,
        cabinClasses: JSON.stringify({
          economy: { price: 649.99, available: 200 },
          'premium-economy': { price: 999.99, available: 40 },
          business: { price: 2199.99, available: 32 },
          first: { price: 4999.99, available: 16 }
        }),
        validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    ];

    for (const flight of sampleFlights) {
      await prisma.flight.upsert({
        where: {
          id: `${flight.airline}_${flight.flightNumber}_${flight.departureDate}`.replace(/\s+/g, '_')
        },
        update: flight,
        create: {
          id: `${flight.airline}_${flight.flightNumber}_${flight.departureDate}`.replace(/\s+/g, '_'),
          ...flight
        },
      });
    }

    console.log(`✅ Seeded ${sampleFlights.length} sample flights`);

    console.log('🎉 Database seed completed successfully!');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });