import Amadeus from 'amadeus';

// Token management and retry configuration
interface AmadeusConfig {
  client: Amadeus | null;
  lastTokenRefresh?: number;
  tokenExpiryBuffer: number; // Buffer time before token expires (in ms)
  maxRetries: number;
  retryDelay: number;
  requestTimeout: number;
}

const config: AmadeusConfig = {
  client: null,
  tokenExpiryBuffer: 5 * 60 * 1000, // 5 minutes before expiry
  maxRetries: 3,
  retryDelay: 1000, // 1 second base delay
  requestTimeout: 10000 // 10 seconds timeout
};

// Initialize Amadeus client with error handling
const initializeAmadeusClient = (): Amadeus | null => {
  try {
    if (!process.env.AMADEUS_CLIENT_ID || !process.env.AMADEUS_CLIENT_SECRET) {
      console.warn('⚠️ Amadeus API credentials not configured');
      return null;
    }

    const client = new Amadeus({
      clientId: process.env.AMADEUS_CLIENT_ID,
      clientSecret: process.env.AMADEUS_CLIENT_SECRET,
      hostname: process.env.AMADEUS_ENVIRONMENT === 'production' ? 'production' : 'test'
    });

    console.log('✅ Amadeus client initialized successfully');
    return client;
  } catch (error: any) {
    console.error('❌ Failed to initialize Amadeus client:', error.message);
    return null;
  }
};

// Get or initialize the Amadeus client
const getAmadeusClient = (): Amadeus | null => {
  if (!config.client) {
    config.client = initializeAmadeusClient();
  }
  return config.client;
};

// Exponential backoff delay calculation
const calculateRetryDelay = (retryCount: number): number => {
  return config.retryDelay * Math.pow(2, retryCount) + Math.random() * 1000;
};

// Enhanced error handling with specific error types
interface AmadeusError {
  type: 'auth' | 'rate_limit' | 'validation' | 'network' | 'server' | 'unknown';
  message: string;
  retryable: boolean;
  statusCode?: number;
  originalError?: any;
}

const parseAmadeusError = (error: any): AmadeusError => {
  if (!error.response) {
    return {
      type: 'network',
      message: `Network error: ${error.message}`,
      retryable: true,
      originalError: error
    };
  }

  const statusCode = error.response.statusCode || error.response.status;
  const errorBody = error.response.body || error.response.data;

  switch (statusCode) {
    case 401:
    case 403:
      return {
        type: 'auth',
        message: 'Authentication failed - check API credentials',
        retryable: false,
        statusCode,
        originalError: error
      };
    
    case 429:
      return {
        type: 'rate_limit',
        message: 'Rate limit exceeded - too many requests',
        retryable: true,
        statusCode,
        originalError: error
      };
    
    case 400:
      return {
        type: 'validation',
        message: errorBody?.error_description || 'Invalid request parameters',
        retryable: false,
        statusCode,
        originalError: error
      };
    
    case 500:
    case 502:
    case 503:
    case 504:
      return {
        type: 'server',
        message: 'Server error - Amadeus API temporarily unavailable',
        retryable: true,
        statusCode,
        originalError: error
      };
    
    default:
      return {
        type: 'unknown',
        message: errorBody?.error_description || error.message || 'Unknown API error',
        retryable: statusCode >= 500,
        statusCode,
        originalError: error
      };
  }
};

// Retry wrapper for API calls with exponential backoff
const withRetry = async <T>(
  operation: () => Promise<T>,
  operationName: string
): Promise<T> => {
  let lastError: AmadeusError;
  
  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        const delay = calculateRetryDelay(attempt - 1);
        console.log(`⏳ Retrying ${operationName} (attempt ${attempt + 1}/${config.maxRetries + 1}) after ${Math.round(delay)}ms delay`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
      
      return await operation();
    } catch (error: any) {
      lastError = parseAmadeusError(error);
      
      console.warn(`⚠️ ${operationName} attempt ${attempt + 1} failed:`, lastError.message);
      
      // Don't retry if error is not retryable
      if (!lastError.retryable) {
        console.error(`❌ ${operationName} failed with non-retryable error:`, lastError.message);
        throw new Error(lastError.message);
      }
      
      // Don't retry on the last attempt
      if (attempt === config.maxRetries) {
        console.error(`❌ ${operationName} failed after ${config.maxRetries + 1} attempts:`, lastError.message);
        throw new Error(`${operationName} failed: ${lastError.message}`);
      }
    }
  }
  
  throw new Error(`${operationName} failed: ${lastError!.message}`);
};

// Airport code mapping for Amadeus (IATA codes)
export const AMADEUS_AIRPORT_CODES: { [key: string]: string } = {
  // North America
  'JFK': 'JFK', 'LAX': 'LAX', 'ORD': 'ORD', 'SFO': 'SFO', 'MIA': 'MIA', 'DEN': 'DEN',
  'SEA': 'SEA', 'ATL': 'ATL', 'DFW': 'DFW', 'LAS': 'LAS', 'PHX': 'PHX', 'BOS': 'BOS',
  'EWR': 'EWR', 'LGA': 'LGA', 'DCA': 'DCA', 'IAD': 'IAD', 'BWI': 'BWI', 'MCO': 'MCO',
  'FLL': 'FLL', 'TPA': 'TPA', 'SAN': 'SAN', 'MSP': 'MSP', 'DTW': 'DTW', 'CLT': 'CLT',
  'PHL': 'PHL', 'SLC': 'SLC', 'PDX': 'PDX', 'HNL': 'HNL', 'ANC': 'ANC',
  
  // Canada
  'YYZ': 'YYZ', 'YVR': 'YVR', 'YUL': 'YUL', 'YYC': 'YYC', 'YOW': 'YOW', 'YHZ': 'YHZ',
  'YWG': 'YWG', 'YEG': 'YEG',
  
  // Mexico
  'MEX': 'MEX', 'CUN': 'CUN', 'GDL': 'GDL', 'MTY': 'MTY',
  
  // Europe
  'LHR': 'LHR', 'LGW': 'LGW', 'STN': 'STN', 'LTN': 'LTN', 'MAN': 'MAN', 'EDI': 'EDI',
  'CDG': 'CDG', 'ORY': 'ORY', 'NCE': 'NCE', 'LYS': 'LYS',
  'FRA': 'FRA', 'MUC': 'MUC', 'DUS': 'DUS', 'TXL': 'TXL',
  'AMS': 'AMS', 'MAD': 'MAD', 'BCN': 'BCN', 'FCO': 'FCO', 'MXP': 'MXP',
  'ZUR': 'ZUR', 'GVA': 'GVA', 'VIE': 'VIE', 'BRU': 'BRU', 'LUX': 'LUX',
  'ARN': 'ARN', 'CPH': 'CPH', 'OSL': 'OSL', 'HEL': 'HEL',
  'WAW': 'WAW', 'PRG': 'PRG', 'BUD': 'BUD', 'ATH': 'ATH', 'LIS': 'LIS',
  'DUB': 'DUB', 'KEF': 'KEF', 'IST': 'IST',
  
  // Asia-Pacific
  'NRT': 'NRT', 'HND': 'HND', 'KIX': 'KIX', 'ICN': 'ICN', 'GMP': 'GMP',
  'PEK': 'PEK', 'PVG': 'PVG', 'CAN': 'CAN', 'SIN': 'SIN', 'HKG': 'HKG',
  'BKK': 'BKK', 'DMK': 'DMK', 'KUL': 'KUL', 'CGK': 'CGK', 'MNL': 'MNL',
  'SYD': 'SYD', 'MEL': 'MEL', 'AKL': 'AKL', 'TPE': 'TPE',
  
  // India
  'BOM': 'BOM', 'DEL': 'DEL', 'CCU': 'CCU', 'BLR': 'BLR', 'MAA': 'MAA',
  'HYD': 'HYD', 'AMD': 'AMD', 'COK': 'COK', 'PNQ': 'PNQ', 'GOI': 'GOI',
  
  // Middle East
  'DXB': 'DXB', 'AUH': 'AUH', 'DOH': 'DOH', 'KWI': 'KWI', 'BAH': 'BAH',
  'RUH': 'RUH', 'JED': 'JED', 'TLV': 'TLV',
  
  // Africa
  'CAI': 'CAI', 'JNB': 'JNB', 'CPT': 'CPT', 'LOS': 'LOS', 'ADD': 'ADD',
  'NBO': 'NBO', 'CMN': 'CMN',
  
  // South America
  'GRU': 'GRU', 'GIG': 'GIG', 'EZE': 'EZE', 'BOG': 'BOG', 'LIM': 'LIM',
  'SCL': 'SCL', 'BSB': 'BSB'
};

// Flight search interface matching our current structure
export interface AmadeusSearchParams {
  from: string;
  to: string;
  departDate: string;
  returnDate?: string;
  passengers: number;
  tripType: 'roundtrip' | 'oneway';
  travelClass?: 'economy' | 'premium-economy' | 'business' | 'first';
}

// Amadeus flight offer interface (simplified)
export interface AmadeusFlightOffer {
  id: string;
  source: string;
  instantTicketingRequired: boolean;
  nonHomogeneous: boolean;
  oneWay: boolean;
  lastTicketingDate: string;
  numberOfBookableSeats: number;
  itineraries: Array<{
    duration: string;
    segments: Array<{
      departure: {
        iataCode: string;
        terminal?: string;
        at: string;
      };
      arrival: {
        iataCode: string;
        terminal?: string;
        at: string;
      };
      carrierCode: string;
      number: string;
      aircraft: {
        code: string;
      };
      operating?: {
        carrierCode: string;
      };
      duration: string;
      id: string;
      numberOfStops: number;
    }>;
  }>;
  price: {
    currency: string;
    total: string;
    base: string;
    fees: Array<{
      amount: string;
      type: string;
    }>;
    grandTotal: string;
  };
  pricingOptions: {
    fareType: Array<string>;
    includedCheckedBagsOnly: boolean;
  };
  validatingAirlineCodes: Array<string>;
  travelerPricings: Array<any>;
}

// Extract travel class from Amadeus offer
const extractTravelClass = (offer: AmadeusFlightOffer, requestedClass?: string) => {
  // Try to get travel class from traveler pricings
  if (offer.travelerPricings && offer.travelerPricings.length > 0) {
    const firstTraveler = offer.travelerPricings[0];
    if (firstTraveler.fareDetailsBySegment && firstTraveler.fareDetailsBySegment.length > 0) {
      const cabin = firstTraveler.fareDetailsBySegment[0].cabin;
      switch (cabin) {
        case 'ECONOMY': return 'economy';
        case 'PREMIUM_ECONOMY': return 'premium-economy';
        case 'BUSINESS': return 'business';
        case 'FIRST': return 'first';
        default: return 'economy';
      }
    }
  }
  
  // If Amadeus doesn't provide cabin info, try to infer from requested class
  // This happens when Amadeus API doesn't return detailed cabin information
  if (requestedClass && ['economy', 'premium-economy', 'business', 'first'].includes(requestedClass)) {
    // If user specifically searched for this class, assume the API returned flights in that class
    return requestedClass;
  }
  
  // Final fallback based on price (rough estimation)
  const price = parseFloat(offer.price.grandTotal);
  if (price > 5000) return 'first';
  if (price > 2000) return 'business';
  if (price > 800) return 'premium-economy';
  return 'economy';
};

// Convert Amadeus flight offer to our Flight interface
export const convertAmadeusFlightToOurFormat = (offer: AmadeusFlightOffer, airlines: { [key: string]: string }, requestedTravelClass?: string) => {
  const firstSegment = offer.itineraries[0].segments[0];
  const lastSegment = offer.itineraries[0].segments[offer.itineraries[0].segments.length - 1];
  
  // Parse departure and arrival times
  const departTime = new Date(firstSegment.departure.at).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
  
  const arriveTime = new Date(lastSegment.arrival.at).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
  
  // Calculate total stops
  const totalStops = offer.itineraries[0].segments.length - 1;
  
  // Get airline name
  const airlineCode = firstSegment.carrierCode;
  const airlineName = airlines[airlineCode] || `${airlineCode} Airlines`;
  
  // Get aircraft code (use the raw code for our database)
  const aircraftCode = firstSegment.aircraft.code;
  
  // Extract travel class with context of what user requested
  const travelClass = extractTravelClass(offer, requestedTravelClass);
  
  // Convert duration from ISO 8601 format (PT10H30M) to readable format
  const durationMatch = offer.itineraries[0].duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  const hours = durationMatch?.[1] ? parseInt(durationMatch[1]) : 0;
  const minutes = durationMatch?.[2] ? parseInt(durationMatch[2]) : 0;
  const duration = `${hours}h ${minutes}m`;
  
  return {
    id: offer.id,
    airline: airlineName,
    flightNumber: `${firstSegment.carrierCode} ${firstSegment.number}`,
    origin: firstSegment.departure.iataCode,
    destination: lastSegment.arrival.iataCode,
    departTime,
    arriveTime,
    duration,
    price: Math.round(parseFloat(offer.price.grandTotal)),
    stops: totalStops,
    aircraft: aircraftCode, // Use raw code for aircraft database lookup
    travelClass,
    rawOffer: offer // Keep original data for booking
  };
};

// Airline codes mapping - comprehensive list for better user experience
export const AIRLINE_NAMES = {
  // Major US Airlines
  'AA': 'American Airlines',
  'DL': 'Delta Air Lines', 
  'UA': 'United Airlines',
  'WN': 'Southwest Airlines',
  'B6': 'JetBlue Airways',
  'AS': 'Alaska Airlines',
  'NK': 'Spirit Airlines',
  'F9': 'Frontier Airlines',
  'G4': 'Allegiant Air',
  'SY': 'Sun Country Airlines',
  'WS': 'WestJet',
  'AC': 'Air Canada',
  
  // European Airlines
  'BA': 'British Airways',
  'VS': 'Virgin Atlantic',
  'LH': 'Lufthansa',
  'AF': 'Air France',
  'KL': 'KLM Royal Dutch Airlines',
  'LX': 'Swiss International Air Lines',
  'OS': 'Austrian Airlines',
  'IB': 'Iberia',
  'AZ': 'ITA Airways',
  'SK': 'Scandinavian Airlines',
  'FI': 'Icelandair',
  'AY': 'Finnair',
  'SN': 'Brussels Airlines',
  'TP': 'TAP Air Portugal',
  'EI': 'Aer Lingus',
  'FR': 'Ryanair',
  'U2': 'easyJet',
  'VY': 'Vueling',
  
  // Middle Eastern & Asian Airlines
  'EK': 'Emirates',
  'EY': 'Etihad Airways',
  'QR': 'Qatar Airways',
  'TK': 'Turkish Airlines',
  'SQ': 'Singapore Airlines',
  'CX': 'Cathay Pacific',
  'JL': 'Japan Airlines',
  'NH': 'All Nippon Airways',
  'KE': 'Korean Air',
  'OZ': 'Asiana Airlines',
  'TG': 'Thai Airways',
  'MH': 'Malaysia Airlines',
  'CI': 'China Airlines',
  'BR': 'EVA Air',
  
  // Others
  'QF': 'Qantas',
  'NZ': 'Air New Zealand',
  'SA': 'South African Airways',
  'ET': 'Ethiopian Airlines',
  'MS': 'EgyptAir',
  'AI': 'Air India',
  '6E': 'IndiGo',
  'SG': 'SpiceJet'
};

// Aircraft code mapping for user-friendly display
export const AIRCRAFT_NAMES = {
  // Boeing Aircraft
  '737': 'Boeing 737',
  '73H': 'Boeing 737-800', 
  '738': 'Boeing 737-800',
  '73G': 'Boeing 737-700',
  '73W': 'Boeing 737-700',
  '739': 'Boeing 737-900',
  '38M': 'Boeing 737 MAX 8',
  '3M8': 'Boeing 737 MAX 8',
  '7M8': 'Boeing 737 MAX 8',
  '757': 'Boeing 757',
  '75W': 'Boeing 757-200',
  '767': 'Boeing 767',
  '76W': 'Boeing 767-300',
  '777': 'Boeing 777',
  '77W': 'Boeing 777-300ER',
  '772': 'Boeing 777-200',
  '773': 'Boeing 777-300',
  '77L': 'Boeing 777-200LR',
  '787': 'Boeing 787 Dreamliner',
  '788': 'Boeing 787-8',
  '789': 'Boeing 787-9',
  '78J': 'Boeing 787-10',
  '747': 'Boeing 747',
  '74H': 'Boeing 747-8',
  '744': 'Boeing 747-400',
  
  // Airbus Aircraft
  '318': 'Airbus A318',
  '319': 'Airbus A319',
  '320': 'Airbus A320',
  '32S': 'Airbus A320neo',
  '32N': 'Airbus A320neo',
  '321': 'Airbus A321',
  '32Q': 'Airbus A321neo',
  '21N': 'Airbus A321neo',
  '330': 'Airbus A330',
  '332': 'Airbus A330-200',
  '333': 'Airbus A330-300',
  '33X': 'Airbus A330-200',
  '339': 'Airbus A330-900neo',
  '340': 'Airbus A340',
  '343': 'Airbus A340-300',
  '346': 'Airbus A340-600',
  '350': 'Airbus A350',
  '359': 'Airbus A350-900',
  '351': 'Airbus A350-1000',
  '380': 'Airbus A380',
  '388': 'Airbus A380-800',
  
  // Regional Aircraft
  'CR9': 'Bombardier CRJ-900',
  'CRJ': 'Bombardier CRJ',
  'CR7': 'Bombardier CRJ-700',
  'E70': 'Embraer E-Jet E170',
  'E75': 'Embraer E-Jet E175',
  'E90': 'Embraer E-Jet E190',
  'ER4': 'Embraer ERJ-145',
  'DH4': 'De Havilland Dash 8-400',
  'AT7': 'ATR 72',
  'AT5': 'ATR 42'
};

// Map travel class to Amadeus cabin class
const mapTravelClass = (travelClass?: string) => {
  switch (travelClass) {
    case 'economy': return 'ECONOMY';
    case 'premium-economy': return 'PREMIUM_ECONOMY';
    case 'business': return 'BUSINESS';
    case 'first': return 'FIRST';
    default: return 'ECONOMY';
  }
};

// Validate search parameters
const validateSearchParams = (params: AmadeusSearchParams): void => {
  const errors: string[] = [];

  if (!params.from || params.from.length < 3) {
    errors.push('Origin airport code is required (minimum 3 characters)');
  }

  if (!params.to || params.to.length < 3) {
    errors.push('Destination airport code is required (minimum 3 characters)');
  }

  if (!params.departDate) {
    errors.push('Departure date is required');
  } else {
    const departDate = new Date(params.departDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (departDate < today) {
      errors.push('Departure date cannot be in the past');
    }
  }

  if (params.tripType === 'roundtrip' && params.returnDate) {
    const returnDate = new Date(params.returnDate);
    const departDate = new Date(params.departDate);
    
    if (returnDate <= departDate) {
      errors.push('Return date must be after departure date');
    }
  }

  if (!params.passengers || params.passengers < 1 || params.passengers > 9) {
    errors.push('Passengers must be between 1 and 9');
  }

  if (errors.length > 0) {
    throw new Error(`Invalid search parameters: ${errors.join(', ')}`);
  }
};

// Check if Amadeus client is available
const checkAmadeusAvailability = (): boolean => {
  const client = getAmadeusClient();
  if (!client) {
    console.warn('⚠️ Amadeus client not available - API credentials missing');
    return false;
  }
  return true;
};

// Search flights using Amadeus API with enhanced error handling and retry logic
export const searchFlights = async (params: AmadeusSearchParams): Promise<any> => {
  const startTime = Date.now();
  
  try {
    // Validate input parameters
    validateSearchParams(params);
    
    // Check if client is available
    if (!checkAmadeusAvailability()) {
      throw new Error('Amadeus API not available - missing credentials');
    }
    
    const client = getAmadeusClient()!;
    
    console.log('🛩️ Searching flights with Amadeus API...', {
      from: params.from,
      to: params.to,
      departDate: params.departDate,
      returnDate: params.returnDate,
      passengers: params.passengers,
      travelClass: params.travelClass,
      tripType: params.tripType
    });
    
    const searchParams: any = {
      originLocationCode: AMADEUS_AIRPORT_CODES[params.from] || params.from,
      destinationLocationCode: AMADEUS_AIRPORT_CODES[params.to] || params.to,
      departureDate: params.departDate,
      adults: params.passengers.toString(),
      max: '20',
      currencyCode: 'USD',
      travelClass: mapTravelClass(params.travelClass)
    };
    
    // Add return date for round trip
    if (params.tripType === 'roundtrip' && params.returnDate) {
      searchParams.returnDate = params.returnDate;
    }
    
    // Execute the search with retry logic and timeout
    const response = await withRetry(async () => {
      // Check if shopping API is available
      const clientWithShopping = client as any;
      if (!clientWithShopping.shopping?.flightOffersSearch) {
        throw new Error('Amadeus shopping API not available in this SDK version');
      }
      
      return Promise.race([
        clientWithShopping.shopping.flightOffersSearch.get(searchParams),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), config.requestTimeout)
        )
      ]);
    }, 'Amadeus flight search');
    
    const duration = Date.now() - startTime;
    const resultCount = (response as any).data?.length || 0;
    
    console.log(`✅ Amadeus search completed: ${resultCount} flights found in ${duration}ms`);
    
    // Validate response data
    if (!(response as any).data || !Array.isArray((response as any).data)) {
      throw new Error('Invalid response format from Amadeus API');
    }
    
    return (response as any).data;
    
  } catch (error: any) {
    const duration = Date.now() - startTime;
    console.error(`❌ Amadeus flight search failed after ${duration}ms:`, error.message);
    
    // Re-throw with enhanced error information
    throw new Error(`Amadeus flight search failed: ${error.message}`);
  }
};

// Health check for Amadeus API
export const checkAmadeusHealth = async (): Promise<{
  available: boolean;
  configured: boolean;
  lastError?: string;
  responseTime?: number;
}> => {
  const configured = !!(process.env.AMADEUS_CLIENT_ID && process.env.AMADEUS_CLIENT_SECRET);
  
  if (!configured) {
    return {
      available: false,
      configured: false,
      lastError: 'API credentials not configured'
    };
  }
  
  try {
    const startTime = Date.now();
    const client = getAmadeusClient();
    
    if (!client) {
      return {
        available: false,
        configured: true,
        lastError: 'Failed to initialize client'
      };
    }
    
    // Test with a simple airport search to check connectivity
    await Promise.race([
      (client as any).referenceData?.locations?.get({
        keyword: 'NYC',
        subType: 'AIRPORT'
      }) || Promise.resolve({ data: [] }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Health check timeout')), 5000)
      )
    ]);
    
    const responseTime = Date.now() - startTime;
    
    return {
      available: true,
      configured: true,
      responseTime
    };
    
  } catch (error: any) {
    const parsedError = parseAmadeusError(error);
    
    return {
      available: false,
      configured: true,
      lastError: parsedError.message
    };
  }
};

// Export the client getter for backward compatibility
const amadeus = getAmadeusClient();

export default {
  client: amadeus,
  searchFlights,
  checkAmadeusHealth,
  convertAmadeusFlightToOurFormat,
  AMADEUS_AIRPORT_CODES,
  AIRLINE_NAMES,
  AIRCRAFT_NAMES
};
