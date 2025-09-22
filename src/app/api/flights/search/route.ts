import { NextRequest, NextResponse } from 'next/server';
import { searchFlights, convertAmadeusFlightToOurFormat, AIRLINE_NAMES } from '@/lib/amadeus';
import { searchFlightsMultiProvider, checkProviderHealth, getProviderStats } from '@/lib/flightProviders';
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
    
    console.log('🔍 Enhanced flight search request:', searchData);
    
    try {
      // Use the new multi-provider search system
      const searchResult = await searchFlightsMultiProvider({
        from,
        to,
        departDate,
        returnDate: tripType === 'roundtrip' ? returnDate : undefined,
        passengers: parseInt(passengers),
        tripType,
        travelClass
      });
      
      console.log(`✅ Multi-provider search completed: ${searchResult.flights.length} flights from ${searchResult.sources.length} sources`);
      
      // Prepare response with enhanced metadata
      const response = {
        success: true,
        flights: searchResult.flights,
        count: searchResult.flights.length,
        sources: searchResult.sources,
        cached: searchResult.cached,
        searchTime: searchResult.searchTime,
        metadata: {
          searchDuration: `${searchResult.searchTime}ms`,
          dataProviders: searchResult.sources,
          totalResults: searchResult.flights.length,
          enhancedFeatures: {
            multiProvider: true,
            realTimeData: searchResult.sources.some(s => s.includes('Real-time')),
            priceComparison: true,
            amenityInfo: true,
            layoverDetails: searchResult.flights.some(f => f.layovers?.length)
          }
        }
      };
      
      // Add warnings if there were provider errors
      if (searchResult.errors.length > 0) {
        response.warnings = searchResult.errors.map(error => 
          `Provider issue: ${error}`
        );
      }
      
      return NextResponse.json(response);
      
    } catch (multiProviderError: any) {
      console.error('❌ Multi-provider search failed:', multiProviderError.message);
      
      // Ultimate fallback to simple mock data
      console.log('🔧 Falling back to simple mock data generation');
      const fallbackFlights = generateMockFlights(from, to, departDate);
      
      return NextResponse.json({
        success: true,
        flights: fallbackFlights,
        count: fallbackFlights.length,
        sources: ['Fallback System'],
        cached: false,
        warning: 'Using fallback system due to search service unavailability',
        error: multiProviderError.message
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