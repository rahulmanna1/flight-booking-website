import { NextRequest, NextResponse } from 'next/server';

// Comprehensive global airport database with proper names
const GLOBAL_AIRPORTS: { [key: string]: { name: string; city: string; country: string; } } = {
  // North America - United States
  'JFK': { name: 'John F. Kennedy International Airport', city: 'New York', country: 'United States' },
  'LAX': { name: 'Los Angeles International Airport', city: 'Los Angeles', country: 'United States' },
  'ORD': { name: "Chicago O'Hare International Airport", city: 'Chicago', country: 'United States' },
  'SFO': { name: 'San Francisco International Airport', city: 'San Francisco', country: 'United States' },
  'MIA': { name: 'Miami International Airport', city: 'Miami', country: 'United States' },
  'ATL': { name: 'Hartsfield-Jackson Atlanta International Airport', city: 'Atlanta', country: 'United States' },
  'DFW': { name: 'Dallas/Fort Worth International Airport', city: 'Dallas', country: 'United States' },
  'DEN': { name: 'Denver International Airport', city: 'Denver', country: 'United States' },
  'SEA': { name: 'Seattle-Tacoma International Airport', city: 'Seattle', country: 'United States' },
  'LAS': { name: 'Harry Reid International Airport', city: 'Las Vegas', country: 'United States' },
  'PHX': { name: 'Phoenix Sky Harbor International Airport', city: 'Phoenix', country: 'United States' },
  'IAH': { name: 'George Bush Intercontinental Airport', city: 'Houston', country: 'United States' },
  'EWR': { name: 'Newark Liberty International Airport', city: 'Newark', country: 'United States' },
  'BOS': { name: 'Logan International Airport', city: 'Boston', country: 'United States' },

  // North America - Canada
  'YYZ': { name: 'Toronto Pearson International Airport', city: 'Toronto', country: 'Canada' },
  'YVR': { name: 'Vancouver International Airport', city: 'Vancouver', country: 'Canada' },
  'YUL': { name: 'Montréal-Pierre Elliott Trudeau International Airport', city: 'Montreal', country: 'Canada' },
  'YYC': { name: 'Calgary International Airport', city: 'Calgary', country: 'Canada' },

  // Asia - India
  'BOM': { name: 'Chhatrapati Shivaji Maharaj International Airport', city: 'Mumbai', country: 'India' },
  'DEL': { name: 'Indira Gandhi International Airport', city: 'New Delhi', country: 'India' },
  'CCU': { name: 'Netaji Subhash Chandra Bose International Airport', city: 'Kolkata', country: 'India' },
  'BLR': { name: 'Kempegowda International Airport', city: 'Bangalore', country: 'India' },
  'MAA': { name: 'Chennai International Airport', city: 'Chennai', country: 'India' },
  'HYD': { name: 'Rajiv Gandhi International Airport', city: 'Hyderabad', country: 'India' },
  'COK': { name: 'Cochin International Airport', city: 'Kochi', country: 'India' },
  'AMD': { name: 'Sardar Vallabhbhai Patel International Airport', city: 'Ahmedabad', country: 'India' },
  'PNQ': { name: 'Pune Airport', city: 'Pune', country: 'India' },
  'GAU': { name: 'Lokpriya Gopinath Bordoloi International Airport', city: 'Guwahati', country: 'India' },

  // Europe - United Kingdom
  'LHR': { name: 'Heathrow Airport', city: 'London', country: 'United Kingdom' },
  'LGW': { name: 'Gatwick Airport', city: 'London', country: 'United Kingdom' },
  'MAN': { name: 'Manchester Airport', city: 'Manchester', country: 'United Kingdom' },
  'EDI': { name: 'Edinburgh Airport', city: 'Edinburgh', country: 'United Kingdom' },

  // Europe - Other Countries
  'CDG': { name: 'Charles de Gaulle Airport', city: 'Paris', country: 'France' },
  'FRA': { name: 'Frankfurt am Main Airport', city: 'Frankfurt', country: 'Germany' },
  'AMS': { name: 'Amsterdam Airport Schiphol', city: 'Amsterdam', country: 'Netherlands' },
  'FCO': { name: 'Leonardo da Vinci International Airport', city: 'Rome', country: 'Italy' },
  'MAD': { name: 'Adolfo Suárez Madrid-Barajas Airport', city: 'Madrid', country: 'Spain' },
  'BCN': { name: 'Barcelona-El Prat Airport', city: 'Barcelona', country: 'Spain' },
  'ZUR': { name: 'Zurich Airport', city: 'Zurich', country: 'Switzerland' },
  'VIE': { name: 'Vienna International Airport', city: 'Vienna', country: 'Austria' },
  'CPH': { name: 'Copenhagen Airport', city: 'Copenhagen', country: 'Denmark' },
  'ARN': { name: 'Stockholm Arlanda Airport', city: 'Stockholm', country: 'Sweden' },
  'OSL': { name: 'Oslo Airport', city: 'Oslo', country: 'Norway' },
  'HEL': { name: 'Helsinki Airport', city: 'Helsinki', country: 'Finland' },
  'ATH': { name: 'Athens International Airport', city: 'Athens', country: 'Greece' },
  'LIS': { name: 'Humberto Delgado Airport', city: 'Lisbon', country: 'Portugal' },
  'IST': { name: 'Istanbul Airport', city: 'Istanbul', country: 'Turkey' },
  'PRG': { name: 'Václav Havel Airport Prague', city: 'Prague', country: 'Czech Republic' },
  'WAW': { name: 'Warsaw Chopin Airport', city: 'Warsaw', country: 'Poland' },
  'BUD': { name: 'Budapest Ferenc Liszt International Airport', city: 'Budapest', country: 'Hungary' },

  // Asia - China
  'PVG': { name: 'Shanghai Pudong International Airport', city: 'Shanghai', country: 'China' },
  'PEK': { name: 'Beijing Capital International Airport', city: 'Beijing', country: 'China' },
  'CAN': { name: 'Guangzhou Baiyun International Airport', city: 'Guangzhou', country: 'China' },
  'CTU': { name: 'Chengdu Shuangliu International Airport', city: 'Chengdu', country: 'China' },
  'SZX': { name: 'Shenzhen Bao\'an International Airport', city: 'Shenzhen', country: 'China' },

  // Asia - Japan
  'NRT': { name: 'Narita International Airport', city: 'Tokyo', country: 'Japan' },
  'HND': { name: 'Haneda Airport', city: 'Tokyo', country: 'Japan' },
  'KIX': { name: 'Kansai International Airport', city: 'Osaka', country: 'Japan' },
  'NGO': { name: 'Chubu Centrair International Airport', city: 'Nagoya', country: 'Japan' },

  // Asia - South Korea
  'ICN': { name: 'Incheon International Airport', city: 'Seoul', country: 'South Korea' },
  'GMP': { name: 'Gimpo International Airport', city: 'Seoul', country: 'South Korea' },
  'PUS': { name: 'Busan International Airport', city: 'Busan', country: 'South Korea' },

  // Asia - Southeast Asia
  'SIN': { name: 'Singapore Changi Airport', city: 'Singapore', country: 'Singapore' },
  'BKK': { name: 'Suvarnabhumi Airport', city: 'Bangkok', country: 'Thailand' },
  'KUL': { name: 'Kuala Lumpur International Airport', city: 'Kuala Lumpur', country: 'Malaysia' },
  'CGK': { name: 'Soekarno-Hatta International Airport', city: 'Jakarta', country: 'Indonesia' },
  'DPS': { name: 'Ngurah Rai International Airport', city: 'Denpasar', country: 'Indonesia' },
  'MNL': { name: 'Ninoy Aquino International Airport', city: 'Manila', country: 'Philippines' },
  'HAN': { name: 'Noi Bai International Airport', city: 'Hanoi', country: 'Vietnam' },
  'SGN': { name: 'Tan Son Nhat International Airport', city: 'Ho Chi Minh City', country: 'Vietnam' },

  // Asia - Other
  'HKG': { name: 'Hong Kong International Airport', city: 'Hong Kong', country: 'Hong Kong' },
  'TPE': { name: 'Taiwan Taoyuan International Airport', city: 'Taipei', country: 'Taiwan' },

  // Middle East
  'DXB': { name: 'Dubai International Airport', city: 'Dubai', country: 'United Arab Emirates' },
  'AUH': { name: 'Abu Dhabi International Airport', city: 'Abu Dhabi', country: 'United Arab Emirates' },
  'DOH': { name: 'Hamad International Airport', city: 'Doha', country: 'Qatar' },
  'KWI': { name: 'Kuwait International Airport', city: 'Kuwait City', country: 'Kuwait' },
  'RUH': { name: 'King Khalid International Airport', city: 'Riyadh', country: 'Saudi Arabia' },
  'JED': { name: 'King Abdulaziz International Airport', city: 'Jeddah', country: 'Saudi Arabia' },

  // Africa
  'CAI': { name: 'Cairo International Airport', city: 'Cairo', country: 'Egypt' },
  'JNB': { name: 'O.R. Tambo International Airport', city: 'Johannesburg', country: 'South Africa' },
  'CPT': { name: 'Cape Town International Airport', city: 'Cape Town', country: 'South Africa' },
  'ADD': { name: 'Addis Ababa Bole International Airport', city: 'Addis Ababa', country: 'Ethiopia' },
  'NBO': { name: 'Jomo Kenyatta International Airport', city: 'Nairobi', country: 'Kenya' },
  'LOS': { name: 'Murtala Muhammed International Airport', city: 'Lagos', country: 'Nigeria' },
  'CMN': { name: 'Mohammed V International Airport', city: 'Casablanca', country: 'Morocco' },

  // Oceania
  'SYD': { name: 'Sydney Kingsford Smith Airport', city: 'Sydney', country: 'Australia' },
  'MEL': { name: 'Melbourne Airport', city: 'Melbourne', country: 'Australia' },
  'BNE': { name: 'Brisbane Airport', city: 'Brisbane', country: 'Australia' },
  'PER': { name: 'Perth Airport', city: 'Perth', country: 'Australia' },
  'AKL': { name: 'Auckland Airport', city: 'Auckland', country: 'New Zealand' },
  'CHC': { name: 'Christchurch Airport', city: 'Christchurch', country: 'New Zealand' },

  // South America
  'GRU': { name: 'São Paulo-Guarulhos International Airport', city: 'São Paulo', country: 'Brazil' },
  'GIG': { name: 'Rio de Janeiro-Galeão International Airport', city: 'Rio de Janeiro', country: 'Brazil' },
  'EZE': { name: 'Ezeiza International Airport', city: 'Buenos Aires', country: 'Argentina' },
  'BOG': { name: 'El Dorado International Airport', city: 'Bogotá', country: 'Colombia' },
  'LIM': { name: 'Jorge Chávez International Airport', city: 'Lima', country: 'Peru' },
  'SCL': { name: 'Arturo Merino Benítez International Airport', city: 'Santiago', country: 'Chile' },
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const codes = searchParams.get('codes'); // Comma-separated airport codes
    
    if (!codes) {
      return NextResponse.json({
        success: false,
        error: 'Airport codes parameter is required'
      }, { status: 400 });
    }
    
    const airportCodes = codes.split(',').map(code => code.trim().toUpperCase());
    const results: { [key: string]: any } = {};
    
    for (const code of airportCodes) {
      if (GLOBAL_AIRPORTS[code]) {
        results[code] = GLOBAL_AIRPORTS[code];
      } else {
        // For unknown airports, provide a generic fallback
        results[code] = {
          name: `${code} Airport`,
          city: 'Unknown',
          country: 'Unknown'
        };
      }
    }
    
    return NextResponse.json({
      success: true,
      airports: results,
      count: Object.keys(results).length
    });
    
  } catch (error: any) {
    console.error('Airport details API error:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to get airport details',
    }, { status: 500 });
  }
}