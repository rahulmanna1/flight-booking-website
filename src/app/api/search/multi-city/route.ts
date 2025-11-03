import { NextRequest, NextResponse } from 'next/server';
import Amadeus from 'amadeus';

// Initialize Amadeus client
const amadeus = new Amadeus({
  clientId: process.env.AMADEUS_CLIENT_ID || '',
  clientSecret: process.env.AMADEUS_CLIENT_SECRET || '',
});

interface FlightSegment {
  from: string;
  to: string;
  departDate: string;
}

interface MultiCitySearchRequest {
  segments: FlightSegment[];
  passengers: number;
  travelClass?: 'ECONOMY' | 'PREMIUM_ECONOMY' | 'BUSINESS' | 'FIRST';
  directFlightsOnly?: boolean;
  maxStops?: number;
  preferredAirlines?: string[];
}

export async function POST(request: NextRequest) {
  try {
    const body: MultiCitySearchRequest = await request.json();
    
    const { segments, passengers, travelClass = 'ECONOMY', directFlightsOnly, maxStops, preferredAirlines } = body;

    // Validate input
    if (!segments || segments.length < 2) {
      return NextResponse.json(
        { error: 'At least 2 flight segments are required for multi-city search' },
        { status: 400 }
      );
    }

    if (segments.length > 6) {
      return NextResponse.json(
        { error: 'Maximum 6 flight segments allowed' },
        { status: 400 }
      );
    }

    // Validate each segment
    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      if (!segment.from || !segment.to || !segment.departDate) {
        return NextResponse.json(
          { error: `Segment ${i + 1}: origin, destination, and date are required` },
          { status: 400 }
        );
      }
    }

    console.log('🔍 Multi-city search request:', { segments, passengers, travelClass });

    // Build origin-destination array for Amadeus API
    const originDestinations = segments.map((segment) => ({
      id: String(segments.indexOf(segment) + 1),
      originLocationCode: segment.from,
      destinationLocationCode: segment.to,
      departureDateTimeRange: {
        date: segment.departDate,
      },
    }));

    // Build search parameters
    const searchParams: any = {
      originDestinations,
      travelers: Array.from({ length: passengers }, (_, index) => ({
        id: String(index + 1),
        travelerType: 'ADULT',
      })),
      sources: ['GDS'],
      searchCriteria: {
        maxFlightOffers: 50,
        flightFilters: {
          cabinRestrictions: [
            {
              cabin: travelClass,
              coverage: 'MOST_SEGMENTS',
              originDestinationIds: originDestinations.map((od) => od.id),
            },
          ],
        },
      },
    };

    // Add connection filters if specified
    if (directFlightsOnly) {
      searchParams.searchCriteria.flightFilters.connectionRestriction = {
        maxNumberOfConnections: 0,
      };
    } else if (maxStops !== undefined) {
      searchParams.searchCriteria.flightFilters.connectionRestriction = {
        maxNumberOfConnections: maxStops,
      };
    }

    // Add airline preference filter
    if (preferredAirlines && preferredAirlines.length > 0) {
      searchParams.searchCriteria.flightFilters.carrierRestrictions = {
        includedCarrierCodes: preferredAirlines,
      };
    }

    let flightOffers: any[];

    try {
      // Call Amadeus Flight Offers Search API
      const response = await (amadeus as any).shopping.flightOffersSearch.post(
        JSON.stringify(searchParams)
      );

      flightOffers = response.data || [];
      console.log(`✅ Found ${flightOffers.length} flight offers`);
    } catch (amadeusError: any) {
      console.error('❌ Amadeus API error:', amadeusError);
      
      // Return mock data for development
      if (process.env.NODE_ENV === 'development' || process.env.USE_MOCK_DATA === 'true') {
        console.log('⚠️ Using mock data for multi-city search');
        flightOffers = generateMockMultiCityFlights(segments, passengers, travelClass);
      } else {
        throw amadeusError;
      }
    }

    // Process and enhance flight offers
    const processedOffers = flightOffers.map((offer) => ({
      id: offer.id,
      price: {
        total: parseFloat(offer.price.total),
        currency: offer.price.currency,
        base: parseFloat(offer.price.base || offer.price.total),
      },
      itineraries: offer.itineraries.map((itinerary: any) => ({
        duration: itinerary.duration,
        segments: itinerary.segments.map((segment: any) => ({
          departure: {
            iataCode: segment.departure.iataCode,
            terminal: segment.departure.terminal,
            at: segment.departure.at,
          },
          arrival: {
            iataCode: segment.arrival.iataCode,
            terminal: segment.arrival.terminal,
            at: segment.arrival.at,
          },
          carrierCode: segment.carrierCode,
          number: segment.number,
          aircraft: segment.aircraft?.code,
          duration: segment.duration,
          numberOfStops: segment.numberOfStops || 0,
        })),
      })),
      validatingAirlineCodes: offer.validatingAirlineCodes,
      numberOfBookableSeats: offer.numberOfBookableSeats,
    }));

    return NextResponse.json({
      flights: processedOffers,
      searchCriteria: {
        segments,
        passengers,
        travelClass,
        directFlightsOnly,
        maxStops,
        preferredAirlines,
      },
      count: processedOffers.length,
    });

  } catch (error: any) {
    console.error('❌ Multi-city search error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to search multi-city flights' },
      { status: 500 }
    );
  }
}

// Mock data generator for development
function generateMockMultiCityFlights(
  segments: FlightSegment[],
  passengers: number,
  travelClass: string
): any[] {
  const airlines = ['AA', 'UA', 'DL', 'BA', 'LH', 'AF'];
  const basePrice = travelClass === 'BUSINESS' ? 2000 : travelClass === 'FIRST' ? 4000 : 500;
  
  return Array.from({ length: 10 }, (_, index) => {
    const totalPrice = basePrice * segments.length + Math.random() * 500;
    
    return {
      id: `MOCK_MC_${index + 1}`,
      type: 'flight-offer',
      source: 'GDS',
      price: {
        currency: 'USD',
        total: totalPrice.toFixed(2),
        base: (totalPrice * 0.85).toFixed(2),
        fees: [{ amount: (totalPrice * 0.15).toFixed(2), type: 'SUPPLIER' }],
      },
      itineraries: segments.map((segment, segIndex) => {
        const departTime = new Date(segment.departDate);
        departTime.setHours(8 + Math.floor(Math.random() * 12));
        
        const arrivalTime = new Date(departTime);
        arrivalTime.setHours(arrivalTime.getHours() + 2 + Math.floor(Math.random() * 4));
        
        const carrier = airlines[Math.floor(Math.random() * airlines.length)];
        
        return {
          duration: `PT${2 + Math.floor(Math.random() * 8)}H${Math.floor(Math.random() * 60)}M`,
          segments: [
            {
              departure: {
                iataCode: segment.from,
                at: departTime.toISOString(),
                terminal: String.fromCharCode(65 + Math.floor(Math.random() * 5)),
              },
              arrival: {
                iataCode: segment.to,
                at: arrivalTime.toISOString(),
                terminal: String.fromCharCode(65 + Math.floor(Math.random() * 5)),
              },
              carrierCode: carrier,
              number: `${Math.floor(Math.random() * 9000) + 1000}`,
              aircraft: { code: '320' },
              duration: `PT${2 + Math.floor(Math.random() * 8)}H${Math.floor(Math.random() * 60)}M`,
              numberOfStops: 0,
              blacklistedInEU: false,
            },
          ],
        };
      }),
      pricingOptions: {
        fareType: ['PUBLISHED'],
        includedCheckedBagsOnly: true,
      },
      validatingAirlineCodes: [airlines[Math.floor(Math.random() * airlines.length)]],
      travelerPricings: Array.from({ length: passengers }, (_, i) => ({
        travelerId: String(i + 1),
        fareOption: 'STANDARD',
        travelerType: 'ADULT',
        price: {
          currency: 'USD',
          total: (totalPrice / passengers).toFixed(2),
          base: ((totalPrice / passengers) * 0.85).toFixed(2),
        },
      })),
    };
  });
}
