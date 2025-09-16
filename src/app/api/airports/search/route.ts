import { NextRequest, NextResponse } from 'next/server';
import Amadeus from 'amadeus';
import { enhanceAirportData, searchLocalAirports, getAirportData } from '@/lib/airportDatabase';

// Initialize Amadeus client
const amadeus = new Amadeus({
  clientId: process.env.AMADEUS_CLIENT_ID!,
  clientSecret: process.env.AMADEUS_CLIENT_SECRET!,
  hostname: process.env.AMADEUS_ENVIRONMENT === 'production' ? 'production' : 'test'
});

export interface Airport {
  iataCode: string;
  icaoCode?: string;
  name: string;
  city: string;
  country: string;
  countryCode: string;
  region?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  timeZone?: string;
  type: 'airport' | 'city' | 'train_station';
  subtype?: 'domestic' | 'international';
  distance?: number; // Distance from user location in km
}

// Convert Amadeus location data to our Airport interface with enhanced fallback data
const convertAmadeusLocation = (location: any): Airport => {
  const iataCode = location.iataCode || location.id;
  const enhancedData = enhanceAirportData(location, iataCode);
  const fallbackData = getAirportData(iataCode);
  
  return {
    iataCode: iataCode,
    icaoCode: location.icaoCode || enhancedData.icaoCode || fallbackData?.icaoCode,
    name: location.name || enhancedData.name || fallbackData?.name || `${iataCode} Airport`,
    city: location.address?.cityName || enhancedData.city || fallbackData?.city || 'Unknown City',
    country: location.address?.countryName || enhancedData.country || fallbackData?.country || 'Unknown Country',
    countryCode: location.address?.countryCode || enhancedData.countryCode || fallbackData?.countryCode || 'XX',
    region: location.address?.regionCode || enhancedData.region || fallbackData?.region,
    coordinates: location.geoCode ? {
      latitude: parseFloat(location.geoCode.latitude),
      longitude: parseFloat(location.geoCode.longitude)
    } : enhancedData.coordinates || fallbackData?.coordinates,
    timeZone: location.timeZone || enhancedData.timeZone || fallbackData?.timeZone,
    type: location.subType?.toLowerCase() === 'airport' ? 'airport' : 
          location.subType?.toLowerCase() === 'city' ? 'city' : 
          enhancedData.type || fallbackData?.type || 'airport',
    subtype: location.category || enhancedData.subtype || fallbackData?.subtype
  };
};

// Calculate distance between two points using Haversine formula
const calculateDistance = (
  lat1: number, lon1: number, 
  lat2: number, lon2: number
): number => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return Math.round(R * c);
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const latitude = searchParams.get('lat');
    const longitude = searchParams.get('lng');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    if (!query || query.length < 2) {
      return NextResponse.json({
        success: false,
        error: 'Query must be at least 2 characters long'
      }, { status: 400 });
    }

    console.log('Airport search request:', { query, latitude, longitude, limit });

    let airports: Airport[] = [];
    
    try {
      // Search airports and cities using Amadeus API
      const response = await amadeus.referenceData.locations.get({
        keyword: query,
        subType: 'AIRPORT,CITY',
        page: { limit: Math.min(limit, 20) } // Max 20 results from Amadeus
      });

      if (response.data && response.data.length > 0) {
        // Convert Amadeus results to our airport format
        airports = response.data.map(convertAmadeusLocation);
      }
    } catch (amadeusError: any) {
      console.warn('Amadeus search failed, falling back to local search:', amadeusError.message);
    }
    
    // If Amadeus returned few results or failed, supplement with local search
    if (airports.length < 5) {
      const localResults = searchLocalAirports(query, limit - airports.length);
      
      // Convert local results to Airport format and filter out duplicates
      const localAirports: Airport[] = localResults
        .filter(local => !airports.some(amadeus => amadeus.iataCode === local.iataCode))
        .map(local => ({
          iataCode: local.iataCode,
          icaoCode: local.icaoCode,
          name: local.name,
          city: local.city,
          country: local.country,
          countryCode: local.countryCode,
          region: local.region,
          coordinates: local.coordinates,
          timeZone: local.timeZone,
          type: local.type,
          subtype: local.subtype
        }));
        
      airports = [...airports, ...localAirports];
    }
    
    if (airports.length === 0) {
      return NextResponse.json({
        success: true,
        airports: [],
        count: 0,
        message: `No airports found for "${query}"`
      });
    }

    // If user location is provided, calculate distances and sort by distance
    if (latitude && longitude) {
      const userLat = parseFloat(latitude);
      const userLng = parseFloat(longitude);
      
      airports = airports.map(airport => ({
        ...airport,
        distance: airport.coordinates ? 
          calculateDistance(
            userLat, userLng, 
            airport.coordinates.latitude, 
            airport.coordinates.longitude
          ) : undefined
      }));

      // Sort by distance (closest first)
      airports.sort((a, b) => {
        if (a.distance === undefined && b.distance === undefined) return 0;
        if (a.distance === undefined) return 1;
        if (b.distance === undefined) return -1;
        return a.distance - b.distance;
      });
    }

    console.log(`Found ${airports.length} airports for "${query}"`);

    return NextResponse.json({
      success: true,
      airports,
      count: airports.length,
      query
    });

  } catch (error: any) {
    console.error('Airport search error:', error);
    
    // Return error response
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to search airports',
      airports: []
    }, { status: 500 });
  }
}

// Nearby airports endpoint
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { latitude, longitude, radius = 100, limit = 10 } = body;
    
    if (!latitude || !longitude) {
      return NextResponse.json({
        success: false,
        error: 'Latitude and longitude are required'
      }, { status: 400 });
    }

    console.log('Nearby airports request:', { latitude, longitude, radius, limit });

    // Search for nearby airports
    const response = await amadeus.referenceData.locations.airports.get({
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      radius: Math.min(radius, 500), // Max 500km radius
      page: { limit: Math.min(limit, 20) }
    });

    if (!response.data || response.data.length === 0) {
      return NextResponse.json({
        success: true,
        airports: [],
        count: 0,
        message: 'No nearby airports found'
      });
    }

    // Convert to our airport format with distances
    const userLat = parseFloat(latitude);
    const userLng = parseFloat(longitude);
    
    const airports: Airport[] = response.data.map((location: any) => {
      const airport = convertAmadeusLocation(location);
      
      // Calculate distance
      if (airport.coordinates) {
        airport.distance = calculateDistance(
          userLat, userLng,
          airport.coordinates.latitude,
          airport.coordinates.longitude
        );
      }
      
      return airport;
    });

    // Sort by distance (closest first)
    airports.sort((a, b) => {
      if (a.distance === undefined && b.distance === undefined) return 0;
      if (a.distance === undefined) return 1;
      if (b.distance === undefined) return -1;
      return a.distance - b.distance;
    });

    console.log(`Found ${airports.length} nearby airports`);

    return NextResponse.json({
      success: true,
      airports,
      count: airports.length,
      location: { latitude, longitude, radius }
    });

  } catch (error: any) {
    console.error('Nearby airports error:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to find nearby airports',
      airports: []
    }, { status: 500 });
  }
}