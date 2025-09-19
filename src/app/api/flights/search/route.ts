import { NextRequest, NextResponse } from 'next/server';
import { searchFlights, convertAmadeusFlightToOurFormat, AIRLINE_NAMES } from '@/lib/amadeus';
import SimpleCache, { flightSearchCache } from '@/lib/cache';

// Mock data fallback (your existing generateMockFlights logic)
import { generateMockFlights } from '@/lib/mockFlights';

export async function POST(request: NextRequest) {
  try {
    const searchData = await request.json();
    const { from, to, departDate, returnDate, passengers, tripType, travelClass } = searchData;
    
    // Validate required fields
    if (!from || !to || !departDate || !passengers) {
      return NextResponse.json({
        success: false,
        error: 'Missing required search parameters'
      }, { status: 400 });
    }
    
    // Validate origin and destination are different
    if (from === to) {
      return NextResponse.json({
        success: false,
        error: 'Origin and destination airports must be different'
      }, { status: 400 });
    }
    
    // Validate dates for round trip
    if (tripType === 'roundtrip' && returnDate) {
      const depDate = new Date(departDate);
      const retDate = new Date(returnDate);
      
      if (retDate <= depDate) {
        return NextResponse.json({
          success: false,
          error: 'Return date must be after departure date'
        }, { status: 400 });
      }
    }
    
    // Validate departure date is not in the past
    const today = new Date();
    const depDate = new Date(departDate);
    today.setHours(0, 0, 0, 0);
    depDate.setHours(0, 0, 0, 0);
    
    if (depDate < today) {
      return NextResponse.json({
        success: false,
        error: 'Departure date cannot be in the past'
      }, { status: 400 });
    }
    
    console.log('Flight search request:', searchData);
    
    // Check if we should use real API or mock data
    const useRealAPI = process.env.USE_REAL_API === 'true';
    const hasCredentials = process.env.AMADEUS_CLIENT_ID && process.env.AMADEUS_CLIENT_SECRET;
    
    if (useRealAPI && hasCredentials) {
      // Generate cache key
      const cacheKey = SimpleCache.generateKey('flight-search', {
        from,
        to,
        departDate,
        returnDate,
        passengers,
        tripType,
        travelClass
      });
      
      // Check cache first
      const cachedResult = flightSearchCache.get<any[]>(cacheKey);
      if (cachedResult) {
        console.log(`Returning ${cachedResult.length} cached flights`);
        return NextResponse.json({
          success: true,
          flights: cachedResult,
          source: 'amadeus_cached',
          count: cachedResult.length,
          cached: true
        });
      }
      
      try {
        // Use Amadeus API
        const amadeusOffers = await searchFlights({
          from,
          to,
          departDate,
          returnDate: tripType === 'roundtrip' ? returnDate : undefined,
          passengers: parseInt(passengers),
          tripType,
          travelClass
        });
        
        // Convert Amadeus offers to our format
        const flights = amadeusOffers.map((offer: any) => 
          convertAmadeusFlightToOurFormat(offer, AIRLINE_NAMES, travelClass)
        );
        
        // Cache the results
        if (flights.length > 0) {
          flightSearchCache.set(cacheKey, flights, 10 * 60 * 1000); // Cache for 10 minutes
        }
        
        console.log(`Returning ${flights.length} real flights from Amadeus`);
        
        return NextResponse.json({
          success: true,
          flights,
          source: 'amadeus',
          count: flights.length
        });
        
      } catch (amadeusError: any) {
        console.warn('Amadeus API failed:', amadeusError.message);
        
        // Check if it's a rate limit error
        if (amadeusError.message?.includes('429') || amadeusError.message?.includes('rate limit')) {
          console.log('Rate limit detected, using mock data');
          
          // For rate limits, use a shorter cache time for mock data
          const mockFlights = generateMockFlights(from, to, departDate);
          const mockCacheKey = SimpleCache.generateKey('flight-search-mock', searchData);
          flightSearchCache.set(mockCacheKey, mockFlights, 2 * 60 * 1000); // Cache mock for 2 minutes
          
          return NextResponse.json({
            success: true,
            flights: mockFlights,
            source: 'mock_ratelimit',
            count: mockFlights.length,
            warning: 'API rate limit reached. Using demo data temporarily.'
          });
        }
        
        // Fallback to mock data if Amadeus fails
        const mockFlights = generateMockFlights(from, to, departDate);
        
        return NextResponse.json({
          success: true,
          flights: mockFlights,
          source: 'mock_fallback',
          count: mockFlights.length,
          warning: 'Using mock data due to API error'
        });
      }
    } else {
      // Use mock data
      const mockFlights = generateMockFlights(from, to, departDate);
      
      console.log(`Returning ${mockFlights.length} mock flights`);
      
      return NextResponse.json({
        success: true,
        flights: mockFlights,
        source: 'mock',
        count: mockFlights.length
      });
    }
    
  } catch (error: any) {
    console.error('Flight search API error:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Internal server error',
      source: 'error'
    }, { status: 500 });
  }
}

// Handle GET requests (for testing)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  // Convert query params to the expected format
  const searchData = {
    from: searchParams.get('from') || 'JFK',
    to: searchParams.get('to') || 'LAX',
    departDate: searchParams.get('departDate') || new Date().toISOString().split('T')[0],
    returnDate: searchParams.get('returnDate'),
    passengers: parseInt(searchParams.get('passengers') || '1'),
    tripType: (searchParams.get('tripType') as 'roundtrip' | 'oneway') || 'oneway'
  };
  
  // Create a mock request object and call POST
  const mockRequest = {
    json: () => Promise.resolve(searchData)
  } as NextRequest;
  
  return POST(mockRequest);
}