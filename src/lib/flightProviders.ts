// Advanced multi-provider flight search service
// Integrates multiple flight data sources for comprehensive results

import { AmadeusSearchParams, searchFlights as amadeusSearch, convertAmadeusFlightToOurFormat, AIRLINE_NAMES } from './amadeus';
import { generateMockFlights } from './mockFlights';
import SimpleCache, { flightSearchCache } from './cache';

// Flight interface standardized across all providers
export interface FlightOffer {
  id: string;
  airline: string;
  flightNumber: string;
  origin: string;
  destination: string;
  departTime: string;
  arriveTime: string;
  duration: string;
  price: number;
  stops?: number;
  aircraft?: string;
  travelClass?: string;
  provider: 'amadeus' | 'mock' | 'skyscanner' | 'kayak' | 'aggregated';
  reliability?: 'high' | 'medium' | 'low';
  bookingUrl?: string;
  priceBreakdown?: {
    baseFare: number;
    taxes: number;
    fees: number;
    total: number;
  };
  availability?: {
    economyAvailable: number;
    businessAvailable: number;
    firstAvailable: number;
    totalSeats: number;
    bookingClass: string;
  };
  layovers?: Array<{
    airport: string;
    duration: string;
  }>;
  amenities?: {
    wifi: boolean;
    meals: boolean;
    entertainment: boolean;
    powerOutlets: boolean;
  };
}

// Provider configuration
interface ProviderConfig {
  name: string;
  enabled: boolean;
  priority: number;
  timeout: number;
  reliability: 'high' | 'medium' | 'low';
  supportedRegions: string[];
  rateLimit: {
    requestsPerMinute: number;
    requestsPerHour: number;
  };
}

const PROVIDERS: Record<string, ProviderConfig> = {
  amadeus: {
    name: 'Amadeus',
    enabled: true,
    priority: 1,
    timeout: 10000,
    reliability: 'high',
    supportedRegions: ['*'], // Global coverage
    rateLimit: {
      requestsPerMinute: 10,
      requestsPerHour: 100
    }
  },
  mock: {
    name: 'Mock Provider',
    enabled: true,
    priority: 9,
    timeout: 1000,
    reliability: 'medium',
    supportedRegions: ['*'],
    rateLimit: {
      requestsPerMinute: 1000,
      requestsPerHour: 10000
    }
  }
};

// Rate limiting tracker
const rateLimitTracker = new Map<string, { minute: number[], hour: number[] }>();

// Check if provider is rate limited
const checkRateLimit = (provider: string): boolean => {
  const config = PROVIDERS[provider];
  if (!config) return false;

  const now = Date.now();
  const oneMinute = 60 * 1000;
  const oneHour = 60 * oneMinute;

  let tracker = rateLimitTracker.get(provider);
  if (!tracker) {
    tracker = { minute: [], hour: [] };
    rateLimitTracker.set(provider, tracker);
  }

  // Clean old requests
  tracker.minute = tracker.minute.filter(time => now - time < oneMinute);
  tracker.hour = tracker.hour.filter(time => now - time < oneHour);

  // Check limits
  if (tracker.minute.length >= config.rateLimit.requestsPerMinute) {
    return true; // Rate limited
  }
  if (tracker.hour.length >= config.rateLimit.requestsPerHour) {
    return true; // Rate limited
  }

  // Record this request
  tracker.minute.push(now);
  tracker.hour.push(now);

  return false; // Not rate limited
};

// Enhanced Amadeus provider with better error handling
const searchAmadeusFlights = async (params: AmadeusSearchParams): Promise<FlightOffer[]> => {
  if (!PROVIDERS.amadeus.enabled) {
    throw new Error('Amadeus provider disabled');
  }

  if (checkRateLimit('amadeus')) {
    throw new Error('Amadeus rate limit exceeded');
  }

  try {
    console.log('🛩️ Searching Amadeus flights...');
    const startTime = Date.now();
    
    const amadeusOffers = await Promise.race([
      amadeusSearch(params),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Amadeus timeout')), PROVIDERS.amadeus.timeout)
      )
    ]);

    const duration = Date.now() - startTime;
    console.log(`✅ Amadeus returned ${(amadeusOffers as any[]).length} results in ${duration}ms`);

    return (amadeusOffers as any[]).map((offer: any) => ({
      ...convertAmadeusFlightToOurFormat(offer, AIRLINE_NAMES, params.travelClass),
      provider: 'amadeus' as const,
      reliability: 'high' as const,
      bookingUrl: `https://amadeus.com/booking/${offer.id}`,
      amenities: inferAmenities(offer)
    }));

  } catch (error: any) {
    console.warn('⚠️ Amadeus search failed:', error.message);
    throw error;
  }
};

// Infer amenities from aircraft and airline data
const inferAmenities = (offer: any) => {
  const aircraftCode = offer.itineraries?.[0]?.segments?.[0]?.aircraft?.code || '';
  const carrierCode = offer.itineraries?.[0]?.segments?.[0]?.carrierCode || '';
  
  // Wide-body aircraft typically have better amenities
  const isWidebody = ['77W', '380', '787', '788', '789', '350', '359', '333'].includes(aircraftCode);
  
  // Premium airlines typically offer better amenities
  const isPremiumAirline = ['EK', 'QR', 'SQ', 'CX', 'LH', 'BA', 'AF'].includes(carrierCode);

  return {
    wifi: isWidebody || isPremiumAirline,
    meals: true, // Most international flights have meals
    entertainment: isWidebody,
    powerOutlets: isWidebody || isPremiumAirline
  };
};

// Mock provider with enhanced features
const searchMockFlights = async (params: AmadeusSearchParams): Promise<FlightOffer[]> => {
  if (!PROVIDERS.mock.enabled) {
    throw new Error('Mock provider disabled');
  }

  console.log('🎭 Generating mock flights...');
  const mockFlights = generateMockFlights(params.from, params.to, params.departDate);

  return mockFlights.map(flight => ({
    ...flight,
    provider: 'mock' as const,
    reliability: 'medium' as const,
    bookingUrl: `https://demo-booking.com/flight/${flight.id}`,
    layovers: flight.stops ? generateLayovers(flight.stops, params.from, params.to) : undefined,
    amenities: {
      wifi: Math.random() > 0.5,
      meals: flight.travelClass !== 'economy' || (flight.duration && parseInt(flight.duration) > 2),
      entertainment: flight.aircraft?.includes('Boeing 777') || flight.aircraft?.includes('Airbus A380'),
      powerOutlets: flight.travelClass === 'business' || flight.travelClass === 'first'
    }
  }));
};

// Generate realistic layovers
const generateLayovers = (stops: number, origin: string, destination: string) => {
  if (stops === 0) return undefined;

  const commonHubAirports = {
    'US': ['ORD', 'DFW', 'ATL', 'DEN'],
    'EU': ['FRA', 'AMS', 'CDG', 'LHR'],
    'ASIA': ['DXB', 'SIN', 'HKG', 'NRT'],
    'MIDDLE_EAST': ['DOH', 'DXB', 'AUH']
  };

  const layovers = [];
  for (let i = 0; i < stops; i++) {
    const hubAirports = commonHubAirports.US; // Simplified for now
    const hubAirport = hubAirports[Math.floor(Math.random() * hubAirports.length)];
    const duration = `${Math.floor(Math.random() * 3 + 1)}h ${Math.floor(Math.random() * 60)}m`;
    
    layovers.push({
      airport: hubAirport,
      duration
    });
  }

  return layovers;
};

// Flight result aggregation and deduplication
const aggregateFlightResults = (results: FlightOffer[][]): FlightOffer[] => {
  const allFlights = results.flat();
  
  // Deduplicate similar flights (same airline, similar time, same price)
  const uniqueFlights = new Map<string, FlightOffer>();
  
  for (const flight of allFlights) {
    const key = `${flight.airline}-${flight.departTime}-${Math.floor(flight.price / 50) * 50}`;
    
    if (!uniqueFlights.has(key)) {
      uniqueFlights.set(key, flight);
    } else {
      // Keep the flight from the more reliable provider
      const existing = uniqueFlights.get(key)!;
      if (PROVIDERS[flight.provider].reliability === 'high' && 
          PROVIDERS[existing.provider].reliability !== 'high') {
        uniqueFlights.set(key, flight);
      }
    }
  }
  
  return Array.from(uniqueFlights.values())
    .sort((a, b) => a.price - b.price)
    .slice(0, 20); // Limit to top 20 results
};

// Main multi-provider flight search function
export const searchFlightsMultiProvider = async (params: AmadeusSearchParams): Promise<{
  flights: FlightOffer[];
  sources: string[];
  cached: boolean;
  searchTime: number;
  errors: string[];
}> => {
  const searchStartTime = Date.now();
  console.log('🔍 Starting multi-provider flight search...', params);

  // Check cache first
  const cacheKey = SimpleCache.generateKey('multi-provider-flight-search', params);
  const cachedResult = flightSearchCache.get<any>(cacheKey);
  
  if (cachedResult) {
    console.log('📋 Returning cached multi-provider results');
    return {
      ...cachedResult,
      cached: true,
      searchTime: Date.now() - searchStartTime
    };
  }

  const results: FlightOffer[][] = [];
  const sources: string[] = [];
  const errors: string[] = [];

  // Get enabled providers sorted by priority
  const enabledProviders = Object.entries(PROVIDERS)
    .filter(([_, config]) => config.enabled)
    .sort(([_, a], [__, b]) => a.priority - b.priority);

  // Search providers in parallel with different strategies
  const searchPromises = enabledProviders.map(async ([providerName, config]) => {
    try {
      let providerResults: FlightOffer[] = [];

      switch (providerName) {
        case 'amadeus':
          // Only use Amadeus if we have credentials and API is configured
          if (process.env.AMADEUS_CLIENT_ID && process.env.AMADEUS_CLIENT_SECRET) {
            providerResults = await searchAmadeusFlights(params);
            sources.push('Amadeus (Real-time)');
          } else {
            console.log('⚠️ Amadeus credentials not configured, skipping');
            return [];
          }
          break;
        
        case 'mock':
          // Always include mock as fallback
          providerResults = await searchMockFlights(params);
          sources.push('Demo Data');
          break;
        
        default:
          console.log(`⚠️ Unknown provider: ${providerName}`);
          return [];
      }

      console.log(`✅ ${config.name} returned ${providerResults.length} flights`);
      return providerResults;

    } catch (error: any) {
      console.error(`❌ ${config.name} search failed:`, error.message);
      errors.push(`${config.name}: ${error.message}`);
      return [];
    }
  });

  try {
    // Wait for all providers with timeout
    const providerResults = await Promise.allSettled(
      searchPromises.map(promise => 
        Promise.race([
          promise,
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Provider timeout')), 15000)
          )
        ])
      )
    );

    // Collect successful results
    providerResults.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value.length > 0) {
        results.push(result.value);
      } else if (result.status === 'rejected') {
        const providerName = enabledProviders[index][0];
        errors.push(`${providerName}: ${result.reason.message}`);
      }
    });

    // If no providers returned results, ensure we have mock data
    if (results.length === 0) {
      console.log('⚠️ No providers returned results, generating fallback mock data');
      const fallbackResults = await searchMockFlights(params);
      results.push(fallbackResults);
      sources.push('Fallback Demo Data');
    }

    // Aggregate and deduplicate results
    const aggregatedFlights = aggregateFlightResults(results);
    const searchTime = Date.now() - searchStartTime;

    const finalResult = {
      flights: aggregatedFlights,
      sources,
      cached: false,
      searchTime,
      errors
    };

    // Cache results for 5 minutes
    if (aggregatedFlights.length > 0) {
      flightSearchCache.set(cacheKey, finalResult, 5 * 60 * 1000);
    }

    console.log(`🎉 Multi-provider search completed in ${searchTime}ms`);
    console.log(`📊 Found ${aggregatedFlights.length} unique flights from ${sources.length} sources`);
    
    if (errors.length > 0) {
      console.log('⚠️ Errors encountered:', errors);
    }

    return finalResult;

  } catch (error: any) {
    console.error('❌ Multi-provider search failed:', error);
    throw new Error(`Multi-provider search failed: ${error.message}`);
  }
};

// Provider health check
export const checkProviderHealth = async (): Promise<Record<string, boolean>> => {
  const healthStatus: Record<string, boolean> = {};

  for (const [providerName, config] of Object.entries(PROVIDERS)) {
    if (!config.enabled) {
      healthStatus[providerName] = false;
      continue;
    }

    try {
      switch (providerName) {
        case 'amadeus':
          healthStatus[providerName] = !!(process.env.AMADEUS_CLIENT_ID && process.env.AMADEUS_CLIENT_SECRET);
          break;
        case 'mock':
          healthStatus[providerName] = true; // Mock is always available
          break;
        default:
          healthStatus[providerName] = false;
      }
    } catch {
      healthStatus[providerName] = false;
    }
  }

  return healthStatus;
};

// Get provider statistics
export const getProviderStats = (): Record<string, any> => {
  const stats: Record<string, any> = {};

  for (const [providerName, config] of Object.entries(PROVIDERS)) {
    const tracker = rateLimitTracker.get(providerName);
    stats[providerName] = {
      enabled: config.enabled,
      reliability: config.reliability,
      requestsLastMinute: tracker?.minute.length || 0,
      requestsLastHour: tracker?.hour.length || 0,
      rateLimit: config.rateLimit
    };
  }

  return stats;
};

export default {
  searchFlightsMultiProvider,
  checkProviderHealth,
  getProviderStats
};