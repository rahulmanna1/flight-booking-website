import Amadeus from 'amadeus';

// Initialize Amadeus client
const amadeus = new Amadeus({
  clientId: process.env.AMADEUS_CLIENT_ID!,
  clientSecret: process.env.AMADEUS_CLIENT_SECRET!,
  hostname: process.env.AMADEUS_ENVIRONMENT === 'production' ? 'production' : 'test'
});

// Airport code mapping for Amadeus (IATA codes)
export const AMADEUS_AIRPORT_CODES = {
  'JFK': 'JFK', // John F. Kennedy International
  'LAX': 'LAX', // Los Angeles International
  'LHR': 'LHR', // London Heathrow
  'CDG': 'CDG', // Charles de Gaulle
  'NRT': 'NRT', // Tokyo Narita International
  'DXB': 'DXB', // Dubai International
  'SYD': 'SYD', // Sydney Kingsford Smith
  'SFO': 'SFO', // San Francisco International
  'ORD': 'ORD', // Chicago O'Hare International
  'MIA': 'MIA', // Miami International
  'FCO': 'FCO', // Leonardo da Vinci–Fiumicino
  'AMS': 'AMS', // Amsterdam Airport Schiphol
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

// Search flights using Amadeus API
export const searchFlights = async (params: AmadeusSearchParams): Promise<any> => {
  try {
    console.log('Searching flights with Amadeus API...', params);
    
    const searchParams: any = {
      originLocationCode: AMADEUS_AIRPORT_CODES[params.from] || params.from,
      destinationLocationCode: AMADEUS_AIRPORT_CODES[params.to] || params.to,
      departureDate: params.departDate,
      adults: params.passengers.toString(),
      max: '20', // Maximum number of flight offers to return
      currencyCode: 'USD',
      travelClass: mapTravelClass(params.travelClass)
    };
    
    // Add return date for round trip
    if (params.tripType === 'roundtrip' && params.returnDate) {
      searchParams.returnDate = params.returnDate;
    }
    
    const response = await amadeus.shopping.flightOffersSearch.get(searchParams);
    
    console.log(`Found ${response.data.length} flight offers from Amadeus`);
    return response.data;
    
  } catch (error: any) {
    console.error('Amadeus API Error:', error);
    
    // Handle specific Amadeus errors
    if (error.response) {
      console.error('Error Response:', error.response.body);
      throw new Error(`Amadeus API Error: ${error.response.body?.error_description || 'Unknown error'}`);
    }
    
    throw new Error(`Flight search failed: ${error.message}`);
  }
};

export default amadeus;