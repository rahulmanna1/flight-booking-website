// Comprehensive airport database for fallback data
export interface AirportData {
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
  type: 'airport' | 'city';
  subtype?: 'domestic' | 'international';
}

// Comprehensive airport database
export const AIRPORT_DATABASE: Record<string, AirportData> = {
  // Major Indian Airports
  'DEL': {
    iataCode: 'DEL',
    icaoCode: 'VIDP',
    name: 'Indira Gandhi International Airport',
    city: 'New Delhi',
    country: 'India',
    countryCode: 'IN',
    coordinates: { latitude: 28.5665, longitude: 77.1031 },
    type: 'airport',
    subtype: 'international'
  },
  'BOM': {
    iataCode: 'BOM',
    icaoCode: 'VABB',
    name: 'Chhatrapati Shivaji Maharaj International Airport',
    city: 'Mumbai',
    country: 'India',
    countryCode: 'IN',
    coordinates: { latitude: 19.0896, longitude: 72.8656 },
    type: 'airport',
    subtype: 'international'
  },
  'CCU': {
    iataCode: 'CCU',
    icaoCode: 'VECC',
    name: 'Netaji Subhash Chandra Bose International Airport',
    city: 'Kolkata',
    country: 'India',
    countryCode: 'IN',
    coordinates: { latitude: 22.6546, longitude: 88.4467 },
    type: 'airport',
    subtype: 'international'
  },
  'MAA': {
    iataCode: 'MAA',
    icaoCode: 'VOMM',
    name: 'Chennai International Airport',
    city: 'Chennai',
    country: 'India',
    countryCode: 'IN',
    coordinates: { latitude: 12.9941, longitude: 80.1709 },
    type: 'airport',
    subtype: 'international'
  },
  'BLR': {
    iataCode: 'BLR',
    icaoCode: 'VOBL',
    name: 'Kempegowda International Airport',
    city: 'Bangalore',
    country: 'India',
    countryCode: 'IN',
    coordinates: { latitude: 13.1986, longitude: 77.7066 },
    type: 'airport',
    subtype: 'international'
  },
  'HYD': {
    iataCode: 'HYD',
    icaoCode: 'VOHS',
    name: 'Rajiv Gandhi International Airport',
    city: 'Hyderabad',
    country: 'India',
    countryCode: 'IN',
    coordinates: { latitude: 17.2313, longitude: 78.4298 },
    type: 'airport',
    subtype: 'international'
  },
  'AMD': {
    iataCode: 'AMD',
    icaoCode: 'VAAH',
    name: 'Sardar Vallabhbhai Patel International Airport',
    city: 'Ahmedabad',
    country: 'India',
    countryCode: 'IN',
    coordinates: { latitude: 23.0776, longitude: 72.6347 },
    type: 'airport',
    subtype: 'international'
  },
  'COK': {
    iataCode: 'COK',
    icaoCode: 'VOCI',
    name: 'Cochin International Airport',
    city: 'Kochi',
    country: 'India',
    countryCode: 'IN',
    coordinates: { latitude: 10.1520, longitude: 76.4019 },
    type: 'airport',
    subtype: 'international'
  },
  'PNQ': {
    iataCode: 'PNQ',
    icaoCode: 'VAPO',
    name: 'Pune Airport',
    city: 'Pune',
    country: 'India',
    countryCode: 'IN',
    coordinates: { latitude: 18.5820, longitude: 73.9197 },
    type: 'airport',
    subtype: 'domestic'
  },
  'GOI': {
    iataCode: 'GOI',
    icaoCode: 'VAGO',
    name: 'Dabolim Airport',
    city: 'Goa',
    country: 'India',
    countryCode: 'IN',
    coordinates: { latitude: 15.3808, longitude: 73.8314 },
    type: 'airport',
    subtype: 'international'
  },
  'JAI': {
    iataCode: 'JAI',
    icaoCode: 'VIJP',
    name: 'Jaipur International Airport',
    city: 'Jaipur',
    country: 'India',
    countryCode: 'IN',
    coordinates: { latitude: 26.8242, longitude: 75.8122 },
    type: 'airport',
    subtype: 'international'
  },
  'LKO': {
    iataCode: 'LKO',
    icaoCode: 'VILK',
    name: 'Chaudhary Charan Singh International Airport',
    city: 'Lucknow',
    country: 'India',
    countryCode: 'IN',
    coordinates: { latitude: 26.7606, longitude: 80.8893 },
    type: 'airport',
    subtype: 'international'
  },
  'IXC': {
    iataCode: 'IXC',
    icaoCode: 'VICG',
    name: 'Chandigarh Airport',
    city: 'Chandigarh',
    country: 'India',
    countryCode: 'IN',
    coordinates: { latitude: 30.6735, longitude: 76.7884 },
    type: 'airport',
    subtype: 'domestic'
  },

  // Major International Airports
  'JFK': {
    iataCode: 'JFK',
    icaoCode: 'KJFK',
    name: 'John F. Kennedy International Airport',
    city: 'New York',
    country: 'United States',
    countryCode: 'US',
    coordinates: { latitude: 40.6413, longitude: -73.7781 },
    type: 'airport',
    subtype: 'international'
  },
  'LAX': {
    iataCode: 'LAX',
    icaoCode: 'KLAX',
    name: 'Los Angeles International Airport',
    city: 'Los Angeles',
    country: 'United States',
    countryCode: 'US',
    coordinates: { latitude: 34.0522, longitude: -118.2437 },
    type: 'airport',
    subtype: 'international'
  },
  'LHR': {
    iataCode: 'LHR',
    icaoCode: 'EGLL',
    name: 'London Heathrow Airport',
    city: 'London',
    country: 'United Kingdom',
    countryCode: 'GB',
    coordinates: { latitude: 51.4700, longitude: -0.4543 },
    type: 'airport',
    subtype: 'international'
  },
  'CDG': {
    iataCode: 'CDG',
    icaoCode: 'LFPG',
    name: 'Charles de Gaulle Airport',
    city: 'Paris',
    country: 'France',
    countryCode: 'FR',
    coordinates: { latitude: 49.0097, longitude: 2.5479 },
    type: 'airport',
    subtype: 'international'
  },
  'NRT': {
    iataCode: 'NRT',
    icaoCode: 'RJAA',
    name: 'Tokyo Narita International Airport',
    city: 'Tokyo',
    country: 'Japan',
    countryCode: 'JP',
    coordinates: { latitude: 35.7647, longitude: 140.3864 },
    type: 'airport',
    subtype: 'international'
  },
  'DXB': {
    iataCode: 'DXB',
    icaoCode: 'OMDB',
    name: 'Dubai International Airport',
    city: 'Dubai',
    country: 'United Arab Emirates',
    countryCode: 'AE',
    coordinates: { latitude: 25.2532, longitude: 55.3657 },
    type: 'airport',
    subtype: 'international'
  },
  'SIN': {
    iataCode: 'SIN',
    icaoCode: 'WSSS',
    name: 'Singapore Changi Airport',
    city: 'Singapore',
    country: 'Singapore',
    countryCode: 'SG',
    coordinates: { latitude: 1.3644, longitude: 103.9915 },
    type: 'airport',
    subtype: 'international'
  },
  'SYD': {
    iataCode: 'SYD',
    icaoCode: 'YSSY',
    name: 'Sydney Kingsford Smith Airport',
    city: 'Sydney',
    country: 'Australia',
    countryCode: 'AU',
    coordinates: { latitude: -33.9399, longitude: 151.1753 },
    type: 'airport',
    subtype: 'international'
  },
  'HKG': {
    iataCode: 'HKG',
    icaoCode: 'VHHH',
    name: 'Hong Kong International Airport',
    city: 'Hong Kong',
    country: 'Hong Kong',
    countryCode: 'HK',
    coordinates: { latitude: 22.3080, longitude: 113.9185 },
    type: 'airport',
    subtype: 'international'
  },
  'ICN': {
    iataCode: 'ICN',
    icaoCode: 'RKSI',
    name: 'Incheon International Airport',
    city: 'Seoul',
    country: 'South Korea',
    countryCode: 'KR',
    coordinates: { latitude: 37.4602, longitude: 126.4407 },
    type: 'airport',
    subtype: 'international'
  },
  'SFO': {
    iataCode: 'SFO',
    icaoCode: 'KSFO',
    name: 'San Francisco International Airport',
    city: 'San Francisco',
    country: 'United States',
    countryCode: 'US',
    coordinates: { latitude: 37.6213, longitude: -122.3790 },
    type: 'airport',
    subtype: 'international'
  },
  'ORD': {
    iataCode: 'ORD',
    icaoCode: 'KORD',
    name: "Chicago O'Hare International Airport",
    city: 'Chicago',
    country: 'United States',
    countryCode: 'US',
    coordinates: { latitude: 41.9742, longitude: -87.9073 },
    type: 'airport',
    subtype: 'international'
  },
  'FCO': {
    iataCode: 'FCO',
    icaoCode: 'LIRF',
    name: 'Leonardo da Vinci–Fiumicino Airport',
    city: 'Rome',
    country: 'Italy',
    countryCode: 'IT',
    coordinates: { latitude: 41.7999, longitude: 12.2462 },
    type: 'airport',
    subtype: 'international'
  },
  'AMS': {
    iataCode: 'AMS',
    icaoCode: 'EHAM',
    name: 'Amsterdam Airport Schiphol',
    city: 'Amsterdam',
    country: 'Netherlands',
    countryCode: 'NL',
    coordinates: { latitude: 52.3105, longitude: 4.7683 },
    type: 'airport',
    subtype: 'international'
  },
  'FRA': {
    iataCode: 'FRA',
    icaoCode: 'EDDF',
    name: 'Frankfurt am Main Airport',
    city: 'Frankfurt',
    country: 'Germany',
    countryCode: 'DE',
    coordinates: { latitude: 50.0379, longitude: 8.5622 },
    type: 'airport',
    subtype: 'international'
  },
  'IST': {
    iataCode: 'IST',
    icaoCode: 'LTFM',
    name: 'Istanbul Airport',
    city: 'Istanbul',
    country: 'Turkey',
    countryCode: 'TR',
    coordinates: { latitude: 41.2753, longitude: 28.7519 },
    type: 'airport',
    subtype: 'international'
  },
  'DOH': {
    iataCode: 'DOH',
    icaoCode: 'OTHH',
    name: 'Hamad International Airport',
    city: 'Doha',
    country: 'Qatar',
    countryCode: 'QA',
    coordinates: { latitude: 25.2731, longitude: 51.6080 },
    type: 'airport',
    subtype: 'international'
  },

  // More Indian Airports
  'IXB': {
    iataCode: 'IXB',
    icaoCode: 'VEBD',
    name: 'Bagdogra Airport',
    city: 'Bagdogra',
    country: 'India',
    countryCode: 'IN',
    coordinates: { latitude: 26.6812, longitude: 88.3286 },
    type: 'airport',
    subtype: 'domestic'
  },
  'GAU': {
    iataCode: 'GAU',
    icaoCode: 'VEGT',
    name: 'Lokpriya Gopinath Bordoloi International Airport',
    city: 'Guwahati',
    country: 'India',
    countryCode: 'IN',
    coordinates: { latitude: 26.1061, longitude: 91.5859 },
    type: 'airport',
    subtype: 'international'
  },
  'IXR': {
    iataCode: 'IXR',
    icaoCode: 'VERC',
    name: 'Birsa Munda Airport',
    city: 'Ranchi',
    country: 'India',
    countryCode: 'IN',
    coordinates: { latitude: 23.3144, longitude: 85.3217 },
    type: 'airport',
    subtype: 'domestic'
  },
  'PAT': {
    iataCode: 'PAT',
    icaoCode: 'VEPT',
    name: 'Jay Prakash Narayan International Airport',
    city: 'Patna',
    country: 'India',
    countryCode: 'IN',
    coordinates: { latitude: 25.5913, longitude: 85.0879 },
    type: 'airport',
    subtype: 'international'
  },
  'VNS': {
    iataCode: 'VNS',
    icaoCode: 'VEBN',
    name: 'Lal Bahadur Shastri Airport',
    city: 'Varanasi',
    country: 'India',
    countryCode: 'IN',
    coordinates: { latitude: 25.4522, longitude: 82.8596 },
    type: 'airport',
    subtype: 'domestic'
  },
  'IXA': {
    iataCode: 'IXA',
    icaoCode: 'VEAT',
    name: 'Agartala Airport',
    city: 'Agartala',
    country: 'India',
    countryCode: 'IN',
    coordinates: { latitude: 23.8870, longitude: 91.2403 },
    type: 'airport',
    subtype: 'domestic'
  },
  'IMP': {
    iataCode: 'IMP',
    icaoCode: 'VEIM',
    name: 'Imphal Airport',
    city: 'Imphal',
    country: 'India',
    countryCode: 'IN',
    coordinates: { latitude: 24.7597, longitude: 93.8967 },
    type: 'airport',
    subtype: 'domestic'
  },
  'SHL': {
    iataCode: 'SHL',
    icaoCode: 'VESL',
    name: 'Shillong Airport',
    city: 'Shillong',
    country: 'India',
    countryCode: 'IN',
    coordinates: { latitude: 25.7036, longitude: 91.9786 },
    type: 'airport',
    subtype: 'domestic'
  },
  'IXS': {
    iataCode: 'IXS',
    icaoCode: 'VEJS',
    name: 'Silchar Airport',
    city: 'Silchar',
    country: 'India',
    countryCode: 'IN',
    coordinates: { latitude: 24.9129, longitude: 92.9787 },
    type: 'airport',
    subtype: 'domestic'
  },
  'DIB': {
    iataCode: 'DIB',
    icaoCode: 'VEMN',
    name: 'Dibrugarh Airport',
    city: 'Dibrugarh',
    country: 'India',
    countryCode: 'IN',
    coordinates: { latitude: 27.4839, longitude: 95.0169 },
    type: 'airport',
    subtype: 'domestic'
  },

  // Southeast Asian Airports
  'BKK': {
    iataCode: 'BKK',
    icaoCode: 'VTBS',
    name: 'Suvarnabhumi Airport',
    city: 'Bangkok',
    country: 'Thailand',
    countryCode: 'TH',
    coordinates: { latitude: 13.6900, longitude: 100.7501 },
    type: 'airport',
    subtype: 'international'
  },
  'KUL': {
    iataCode: 'KUL',
    icaoCode: 'WMKK',
    name: 'Kuala Lumpur International Airport',
    city: 'Kuala Lumpur',
    country: 'Malaysia',
    countryCode: 'MY',
    coordinates: { latitude: 2.7456, longitude: 101.7072 },
    type: 'airport',
    subtype: 'international'
  },
  'CGK': {
    iataCode: 'CGK',
    icaoCode: 'WIII',
    name: 'Soekarno-Hatta International Airport',
    city: 'Jakarta',
    country: 'Indonesia',
    countryCode: 'ID',
    coordinates: { latitude: -6.1275, longitude: 106.6537 },
    type: 'airport',
    subtype: 'international'
  },
  'MNL': {
    iataCode: 'MNL',
    icaoCode: 'RPLL',
    name: 'Ninoy Aquino International Airport',
    city: 'Manila',
    country: 'Philippines',
    countryCode: 'PH',
    coordinates: { latitude: 14.5086, longitude: 121.0194 },
    type: 'airport',
    subtype: 'international'
  },

  // Middle Eastern Airports
  'AUH': {
    iataCode: 'AUH',
    icaoCode: 'OMAA',
    name: 'Abu Dhabi International Airport',
    city: 'Abu Dhabi',
    country: 'United Arab Emirates',
    countryCode: 'AE',
    coordinates: { latitude: 24.4330, longitude: 54.6511 },
    type: 'airport',
    subtype: 'international'
  },
  'KWI': {
    iataCode: 'KWI',
    icaoCode: 'OKBK',
    name: 'Kuwait International Airport',
    city: 'Kuwait City',
    country: 'Kuwait',
    countryCode: 'KW',
    coordinates: { latitude: 29.2267, longitude: 47.9689 },
    type: 'airport',
    subtype: 'international'
  },
  'MCT': {
    iataCode: 'MCT',
    icaoCode: 'OOMS',
    name: 'Muscat International Airport',
    city: 'Muscat',
    country: 'Oman',
    countryCode: 'OM',
    coordinates: { latitude: 23.5933, longitude: 58.2844 },
    type: 'airport',
    subtype: 'international'
  },
  'BAH': {
    iataCode: 'BAH',
    icaoCode: 'OBBI',
    name: 'Bahrain International Airport',
    city: 'Manama',
    country: 'Bahrain',
    countryCode: 'BH',
    coordinates: { latitude: 26.2708, longitude: 50.6336 },
    type: 'airport',
    subtype: 'international'
  },

  // Special cases and unknown airports with better fallbacks
  'LYX': {
    iataCode: 'LYX',
    name: 'Unknown Airport',
    city: 'Unknown',
    country: 'Unknown',
    countryCode: 'XX',
    type: 'airport'
  }
};

// Function to get airport data with fallback
export const getAirportData = (iataCode: string): AirportData | null => {
  const code = iataCode.toUpperCase();
  return AIRPORT_DATABASE[code] || null;
};

// Function to enhance Amadeus data with our database
export const enhanceAirportData = (amadeusData: any, iataCode: string): Partial<AirportData> => {
  const dbData = getAirportData(iataCode);
  
  if (!dbData) {
    return {};
  }

  return {
    name: amadeusData.name || dbData.name,
    city: amadeusData.address?.cityName || dbData.city,
    country: amadeusData.address?.countryName || dbData.country,
    countryCode: amadeusData.address?.countryCode || dbData.countryCode,
    coordinates: amadeusData.geoCode ? {
      latitude: parseFloat(amadeusData.geoCode.latitude),
      longitude: parseFloat(amadeusData.geoCode.longitude)
    } : dbData.coordinates,
    icaoCode: amadeusData.icaoCode || dbData.icaoCode,
    timeZone: amadeusData.timeZone || dbData.timeZone,
    type: dbData.type,
    subtype: dbData.subtype
  };
};

// Search function for local airport data
export const searchLocalAirports = (query: string, limit: number = 10): AirportData[] => {
  const searchTerm = query.toLowerCase();
  const results: AirportData[] = [];
  
  for (const airport of Object.values(AIRPORT_DATABASE)) {
    if (results.length >= limit) break;
    
    const matches = 
      airport.iataCode.toLowerCase().includes(searchTerm) ||
      airport.name.toLowerCase().includes(searchTerm) ||
      airport.city.toLowerCase().includes(searchTerm) ||
      airport.country.toLowerCase().includes(searchTerm) ||
      (airport.icaoCode && airport.icaoCode.toLowerCase().includes(searchTerm));
      
    if (matches) {
      results.push(airport);
    }
  }
  
  // Sort by relevance (exact IATA code match first, then by name)
  results.sort((a, b) => {
    const aExactMatch = a.iataCode.toLowerCase() === searchTerm;
    const bExactMatch = b.iataCode.toLowerCase() === searchTerm;
    
    if (aExactMatch && !bExactMatch) return -1;
    if (!aExactMatch && bExactMatch) return 1;
    
    return a.name.localeCompare(b.name);
  });
  
  return results;
};