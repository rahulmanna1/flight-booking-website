// Mock flight data generator (extracted from FlightResults component)

interface Flight {
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
  // Enhanced booking availability information
  availability?: {
    economyAvailable: number;
    businessAvailable: number;
    firstAvailable: number;
    totalSeats: number;
    bookingClass: string;
  };
  // Route information
  routeType?: 'domestic' | 'international' | 'regional';
  distance?: number; // in kilometers
  // Pricing breakdown
  priceBreakdown?: {
    baseFare: number;
    taxes: number;
    fees: number;
    total: number;
  };
}

// Regional pricing data
const regionalPricing = {
  // North America
  'US': { base: 250, range: 150 },
  'CA': { base: 280, range: 180 },
  
  // Europe
  'GB': { base: 200, range: 120 },
  'FR': { base: 220, range: 140 },
  'DE': { base: 210, range: 130 },
  'ES': { base: 180, range: 100 },
  'IT': { base: 190, range: 110 },
  'NL': { base: 200, range: 120 },
  
  // Asia
  'IN': { base: 150, range: 100 },
  'JP': { base: 400, range: 200 },
  'CN': { base: 300, range: 150 },
  'SG': { base: 350, range: 180 },
  'TH': { base: 200, range: 120 },
  
  // Middle East
  'AE': { base: 450, range: 250 },
  'QA': { base: 500, range: 300 },
  
  // Australia/Oceania
  'AU': { base: 400, range: 200 },
  'NZ': { base: 450, range: 250 },
  
  // Default for unknown regions
  'DEFAULT': { base: 350, range: 200 }
};

// Route-based pricing data (for specific popular routes)
const routePricing = {
  // Domestic US routes
  'JFK-LAX': { base: 280, range: 200 },
  'LAX-JFK': { base: 280, range: 200 },
  'ORD-SFO': { base: 220, range: 150 },
  'SFO-ORD': { base: 220, range: 150 },
  'MIA-JFK': { base: 180, range: 120 },
  'JFK-MIA': { base: 180, range: 120 },
  
  // Indian domestic routes
  'CCU-BOM': { base: 120, range: 80 },
  'BOM-CCU': { base: 120, range: 80 },
  'DEL-BOM': { base: 110, range: 70 },
  'BOM-DEL': { base: 110, range: 70 },
  'CCU-DEL': { base: 130, range: 90 },
  'DEL-CCU': { base: 130, range: 90 },
  'BLR-BOM': { base: 100, range: 60 },
  'BOM-BLR': { base: 100, range: 60 },
  
  // International routes
  'JFK-LHR': { base: 550, range: 300 },
  'LHR-JFK': { base: 550, range: 300 },
  'LAX-NRT': { base: 650, range: 400 },
  'NRT-LAX': { base: 650, range: 400 },
  'JFK-CDG': { base: 520, range: 280 },
  'CDG-JFK': { base: 520, range: 280 },
  'DXB-JFK': { base: 780, range: 450 },
  'JFK-DXB': { base: 780, range: 450 },
  'SYD-LAX': { base: 850, range: 500 },
  'LAX-SYD': { base: 850, range: 500 },
  'FCO-JFK': { base: 490, range: 250 },
  'JFK-FCO': { base: 490, range: 250 },
  'AMS-JFK': { base: 460, range: 220 },
  'JFK-AMS': { base: 460, range: 220 },
  
  // India to international
  'BOM-DXB': { base: 200, range: 100 },
  'DXB-BOM': { base: 200, range: 100 },
  'DEL-LHR': { base: 400, range: 200 },
  'LHR-DEL': { base: 400, range: 200 },
  'CCU-SIN': { base: 250, range: 120 },
  'SIN-CCU': { base: 250, range: 120 },
};

// Expanded global airport country mapping
const getCountryFromAirport = (code: string): string => {
  const airportCountryMap: { [key: string]: string } = {
    // North America - United States
    'JFK': 'US', 'LAX': 'US', 'ORD': 'US', 'SFO': 'US', 'MIA': 'US', 'DEN': 'US', 'SEA': 'US',
    'ATL': 'US', 'DFW': 'US', 'LAS': 'US', 'PHX': 'US', 'IAH': 'US', 'MCO': 'US', 'EWR': 'US',
    'MSP': 'US', 'DTW': 'US', 'PHL': 'US', 'LGA': 'US', 'BWI': 'US', 'SLC': 'US', 'BOS': 'US',
    
    // North America - Canada
    'YYZ': 'CA', 'YVR': 'CA', 'YUL': 'CA', 'YYC': 'CA', 'YEG': 'CA', 'YOW': 'CA', 'YHZ': 'CA',
    
    // North America - Mexico
    'MEX': 'MX', 'CUN': 'MX', 'GDL': 'MX', 'MTY': 'MX', 'TIJ': 'MX',
    
    // South America
    'GRU': 'BR', 'GIG': 'BR', 'BSB': 'BR', 'EZE': 'AR', 'BOG': 'CO', 'LIM': 'PE', 'SCL': 'CL',
    
    // Europe - United Kingdom
    'LHR': 'GB', 'LGW': 'GB', 'MAN': 'GB', 'STN': 'GB', 'EDI': 'GB', 'GLA': 'GB', 'BHX': 'GB',
    
    // Europe - Other Countries
    'CDG': 'FR', 'ORY': 'FR', 'NCE': 'FR', 'LYS': 'FR', // France
    'FRA': 'DE', 'MUC': 'DE', 'DUS': 'DE', 'TXL': 'DE', 'HAM': 'DE', // Germany
    'AMS': 'NL', 'RTM': 'NL', // Netherlands
    'FCO': 'IT', 'MXP': 'IT', 'VCE': 'IT', 'NAP': 'IT', // Italy
    'MAD': 'ES', 'BCN': 'ES', 'PMI': 'ES', 'VLC': 'ES', // Spain
    'ZUR': 'CH', 'GVA': 'CH', // Switzerland
    'VIE': 'AT', // Austria
    'BRU': 'BE', // Belgium
    'CPH': 'DK', // Denmark
    'HEL': 'FI', // Finland
    'OSL': 'NO', // Norway
    'ARN': 'SE', // Sweden
    'WAW': 'PL', 'KRK': 'PL', // Poland
    'PRG': 'CZ', // Czech Republic
    'BUD': 'HU', // Hungary
    'OTP': 'RO', // Romania
    'SOF': 'BG', // Bulgaria
    'ATH': 'GR', // Greece
    'LIS': 'PT', 'OPO': 'PT', // Portugal
    'IST': 'TR', 'SAW': 'TR', 'ADB': 'TR', // Turkey
    'SVO': 'RU', 'DME': 'RU', 'LED': 'RU', // Russia
    
    // Asia - India
    'BOM': 'IN', 'DEL': 'IN', 'CCU': 'IN', 'BLR': 'IN', 'MAA': 'IN', 'HYD': 'IN', 'COK': 'IN',
    'AMD': 'IN', 'PNQ': 'IN', 'GAU': 'IN', 'JAI': 'IN', 'LKO': 'IN', 'IXC': 'IN', 'VTZ': 'IN',
    
    // Asia - China
    'PVG': 'CN', 'PEK': 'CN', 'CAN': 'CN', 'CTU': 'CN', 'KMG': 'CN', 'XIY': 'CN', 'NKG': 'CN',
    'TSN': 'CN', 'WUH': 'CN', 'CSX': 'CN', 'SZX': 'CN', 'TAO': 'CN', 'HGH': 'CN',
    
    // Asia - Japan
    'NRT': 'JP', 'HND': 'JP', 'KIX': 'JP', 'ITM': 'JP', 'NGO': 'JP', 'FUK': 'JP', 'CTS': 'JP',
    'OKA': 'JP', 'KOJ': 'JP', 'HIJ': 'JP',
    
    // Asia - South Korea
    'ICN': 'KR', 'GMP': 'KR', 'PUS': 'KR', 'CJU': 'KR',
    
    // Asia - Southeast Asia
    'SIN': 'SG', // Singapore
    'BKK': 'TH', 'DMK': 'TH', 'CNX': 'TH', 'HKT': 'TH', // Thailand
    'KUL': 'MY', 'PEN': 'MY', 'JHB': 'MY', 'KCH': 'MY', // Malaysia
    'CGK': 'ID', 'DPS': 'ID', 'SUB': 'ID', // Indonesia
    'MNL': 'PH', 'CEB': 'PH', // Philippines
    'HAN': 'VN', 'SGN': 'VN', 'DAD': 'VN', // Vietnam
    'RGN': 'MM', // Myanmar
    'PNH': 'KH', // Cambodia
    'VTE': 'LA', // Laos
    
    // Asia - Other
    'HKG': 'HK', // Hong Kong
    'TPE': 'TW', 'KHH': 'TW', // Taiwan
    'ULN': 'MN', // Mongolia
    
    // Middle East
    'DXB': 'AE', 'AUH': 'AE', 'SHJ': 'AE', // UAE
    'DOH': 'QA', // Qatar
    'KWI': 'KW', // Kuwait
    'BAH': 'BH', // Bahrain
    'MCT': 'OM', // Oman
    'RUH': 'SA', 'JED': 'SA', 'DMM': 'SA', // Saudi Arabia
    'AMM': 'JO', // Jordan
    'BEY': 'LB', // Lebanon
    'DAM': 'SY', // Syria
    'BGW': 'IQ', // Iraq
    'IKA': 'IR', // Iran
    'TLV': 'IL', // Israel
    
    // Africa
    'CAI': 'EG', 'HRG': 'EG', 'SSH': 'EG', // Egypt
    'JNB': 'ZA', 'CPT': 'ZA', 'DUR': 'ZA', // South Africa
    'LOS': 'NG', 'ABV': 'NG', // Nigeria
    'ADD': 'ET', // Ethiopia
    'NBO': 'KE', // Kenya
    'DAR': 'TZ', // Tanzania
    'CMN': 'MA', 'RAK': 'MA', // Morocco
    'TUN': 'TN', // Tunisia
    'ALG': 'DZ', // Algeria
    'ACC': 'GH', // Ghana
    
    // Oceania
    'SYD': 'AU', 'MEL': 'AU', 'BNE': 'AU', 'PER': 'AU', 'ADL': 'AU', 'DRW': 'AU', 'CNS': 'AU',
    'OOL': 'AU', 'HBA': 'AU', 'LST': 'AU',
    'AKL': 'NZ', 'CHC': 'NZ', 'WLG': 'NZ', 'ZQN': 'NZ', // New Zealand
    'NAN': 'FJ', // Fiji
    'PPT': 'PF', // French Polynesia
    'NOU': 'NC', // New Caledonia
  };
  
  return airportCountryMap[code] || 'DEFAULT';
};

// Calculate distance-based pricing
const calculateDistancePrice = (from: string, to: string): { base: number, range: number } => {
  const fromCountry = getCountryFromAirport(from);
  const toCountry = getCountryFromAirport(to);
  
  // Same country (domestic)
  if (fromCountry === toCountry) {
    const pricing = (regionalPricing as any)[fromCountry] || regionalPricing['DEFAULT'];
    return { base: pricing.base * 0.6, range: pricing.range * 0.6 };
  }
  
  // International flights
  const fromPricing = (regionalPricing as any)[fromCountry] || regionalPricing['DEFAULT'];
  const toPricing = (regionalPricing as any)[toCountry] || regionalPricing['DEFAULT'];
  
  // Average the regional pricing and add international premium
  const avgBase = (fromPricing.base + toPricing.base) / 2;
  const avgRange = (fromPricing.range + toPricing.range) / 2;
  
  return {
    base: Math.round(avgBase * 1.8), // International premium
    range: Math.round(avgRange * 1.5)
  };
};

// Get route price with fallback to distance-based pricing
const getRoutePrice = (from: string, to: string) => {
  const route = `${from}-${to}`;
  return (routePricing as any)[route] || calculateDistancePrice(from, to);
};

// Mock flight data generator with realistic schedules and pricing
export const generateMockFlights = (from: string, to: string, date: string): Flight[] => {
  // Get realistic airlines based on route
  const getAllAirlines = () => [
    // US Airlines
    { name: 'American Airlines', code: 'AA', aircraft: ['738', '772', '321'], regions: ['US', 'DEFAULT'] },
    { name: 'Delta Air Lines', code: 'DL', aircraft: ['739', '333', '32N'], regions: ['US', 'DEFAULT'] },
    { name: 'United Airlines', code: 'UA', aircraft: ['738', '789', '320'], regions: ['US', 'DEFAULT'] },
    { name: 'JetBlue Airways', code: 'B6', aircraft: ['320', '321', 'E90'], regions: ['US'] },
    { name: 'Southwest Airlines', code: 'WN', aircraft: ['73G', '738', '7M8'], regions: ['US'] },
    
    // Indian Airlines
    { name: 'Air India', code: 'AI', aircraft: ['320', '321', '77W', '788'], regions: ['IN', 'DEFAULT'] },
    { name: 'IndiGo', code: '6E', aircraft: ['320', '321'], regions: ['IN', 'DEFAULT'] },
    { name: 'SpiceJet', code: 'SG', aircraft: ['738', '38M'], regions: ['IN'] },
    { name: 'Vistara', code: 'UK', aircraft: ['320', '321', '788'], regions: ['IN', 'DEFAULT'] },
    { name: 'GoAir', code: 'G8', aircraft: ['320'], regions: ['IN'] },
    { name: 'Air India Express', code: 'IX', aircraft: ['738'], regions: ['IN', 'AE', 'SG'] },
    
    // European Airlines
    { name: 'British Airways', code: 'BA', aircraft: ['77W', '388', '789'], regions: ['GB', 'DEFAULT'] },
    { name: 'Lufthansa', code: 'LH', aircraft: ['320', '74H', '359'], regions: ['DE', 'DEFAULT'] },
    { name: 'Air France', code: 'AF', aircraft: ['350', '77W', '320'], regions: ['FR', 'DEFAULT'] },
    { name: 'KLM', code: 'KL', aircraft: ['789', '333', '738'], regions: ['NL', 'DEFAULT'] },
    { name: 'Turkish Airlines', code: 'TK', aircraft: ['77W', '330', '738'], regions: ['TR', 'DEFAULT'] },
    
    // Middle East Airlines
    { name: 'Emirates', code: 'EK', aircraft: ['380', '77W', '789'], regions: ['AE', 'DEFAULT'] },
    { name: 'Qatar Airways', code: 'QR', aircraft: ['350', '77W', '321'], regions: ['QA', 'DEFAULT'] },
    { name: 'Etihad Airways', code: 'EY', aircraft: ['380', '77W', '789'], regions: ['AE', 'DEFAULT'] },
    
    // Asian Airlines
    { name: 'Singapore Airlines', code: 'SQ', aircraft: ['380', '359', '789'], regions: ['SG', 'DEFAULT'] },
    { name: 'Thai Airways', code: 'TG', aircraft: ['350', '77W', '333'], regions: ['TH', 'DEFAULT'] },
    { name: 'Cathay Pacific', code: 'CX', aircraft: ['350', '77W', '333'], regions: ['HK', 'DEFAULT'] },
    { name: 'ANA', code: 'NH', aircraft: ['788', '789', '77W'], regions: ['JP', 'DEFAULT'] },
    { name: 'JAL', code: 'JL', aircraft: ['788', '789', '77W'], regions: ['JP', 'DEFAULT'] },
    
    // Low Cost Carriers
    { name: 'AirAsia', code: 'AK', aircraft: ['320'], regions: ['TH', 'SG', 'IN'] },
    { name: 'Scoot', code: 'TR', aircraft: ['788', '320'], regions: ['SG', 'DEFAULT'] },
    { name: 'Jetstar', code: 'JQ', aircraft: ['320', '787'], regions: ['AU', 'SG'] },
  ];
  
  // Filter airlines based on route
  const getRelevantAirlines = (from: string, to: string) => {
    const fromCountry = getCountryFromAirport(from);
    const toCountry = getCountryFromAirport(to);
    const allAirlines = getAllAirlines();
    
    // Filter airlines that serve this route
    return allAirlines.filter(airline => {
      return airline.regions.includes(fromCountry) || 
             airline.regions.includes(toCountry) || 
             airline.regions.includes('DEFAULT');
    });
  };
  
  const airlines = getRelevantAirlines(from, to);

  // Realistic flight schedules (common departure times)
  const commonDepartureTimes = [
    '06:15', '07:30', '08:45', '10:20', '11:55', '13:10', 
    '14:25', '15:40', '16:55', '18:10', '19:25', '20:40', '22:00'
  ];

  const routePrice = getRoutePrice(from, to);
  const numFlights = 6 + Math.floor(Math.random() * 4); // 6-9 flights

  return Array.from({ length: numFlights }, (_, i) => {
    const airline = airlines[Math.floor(Math.random() * airlines.length)];
    const aircraft = airline.aircraft[Math.floor(Math.random() * airline.aircraft.length)];
    const departTime = commonDepartureTimes[Math.floor(Math.random() * commonDepartureTimes.length)];
    
    // Calculate realistic flight duration based on route
    let flightDuration;
    const fromCountry = getCountryFromAirport(from);
    const toCountry = getCountryFromAirport(to);
    const isDomestic = fromCountry === toCountry;
    
    if (isDomestic) {
      // Domestic flights: 1-4 hours depending on country
      if (fromCountry === 'IN') {
        flightDuration = 1 + Math.floor(Math.random() * 3); // 1-3 hours for India
      } else if (fromCountry === 'US') {
        flightDuration = 2 + Math.floor(Math.random() * 4); // 2-5 hours for US
      } else {
        flightDuration = 1 + Math.floor(Math.random() * 3); // 1-3 hours for other countries
      }
    } else {
      // International flights: 3-14 hours
      const isLongHaul = (fromCountry === 'IN' && ['US', 'AU'].includes(toCountry)) ||
                        (toCountry === 'IN' && ['US', 'AU'].includes(fromCountry)) ||
                        (fromCountry === 'US' && ['IN', 'AU', 'SG', 'JP'].includes(toCountry)) ||
                        (toCountry === 'US' && ['IN', 'AU', 'SG', 'JP'].includes(fromCountry));
      
      if (isLongHaul) {
        flightDuration = 10 + Math.floor(Math.random() * 5); // 10-14 hours
      } else {
        flightDuration = 3 + Math.floor(Math.random() * 6); // 3-8 hours
      }
    }
    
    // Calculate arrival time
    const [depHour, depMin] = departTime.split(':').map(Number);
    const totalMinutes = depHour * 60 + depMin + flightDuration * 60 + Math.floor(Math.random() * 30);
    const arrHour = Math.floor(totalMinutes / 60) % 24;
    const arrMin = totalMinutes % 60;
    const arriveTime = `${arrHour.toString().padStart(2, '0')}:${arrMin.toString().padStart(2, '0')}`;
    
    // Determine stops (most flights are direct or 1 stop)
    const stops = Math.random() < 0.7 ? 0 : (Math.random() < 0.8 ? 1 : 2);
    
    // Calculate realistic pricing
    const basePrice = routePrice.base;
    const priceVariation = Math.floor(Math.random() * routePrice.range) - routePrice.range / 2;
    const stopsMultiplier = stops === 0 ? 1 : (stops === 1 ? 0.85 : 0.7); // Connecting flights cheaper
    const timeMultiplier = ['06:15', '07:30', '19:25', '20:40', '22:00'].includes(departTime) ? 0.9 : 1;
    
    // Determine travel class based on price tier and airline
    let travelClass = 'economy';
    const isPremiumAirline = ['Emirates', 'Qatar Airways', 'Singapore Airlines', 'British Airways'].includes(airline.name);
    const isWideBody = ['380', '77W', '789', '359', '350', '333'].includes(aircraft);
    
    // Base price calculation
    const finalPrice = Math.round((basePrice + priceVariation) * stopsMultiplier * timeMultiplier);
    
    // Generate different travel classes with realistic pricing
    const travelClasses = ['economy', 'premium-economy', 'business', 'first'];
    const classWeights = isWideBody ? [0.6, 0.2, 0.15, 0.05] : [0.8, 0.15, 0.05, 0.0]; // Wide-body more likely to have premium classes
    
    const rand = Math.random();
    let cumulativeWeight = 0;
    for (let j = 0; j < travelClasses.length; j++) {
      cumulativeWeight += classWeights[j];
      if (rand <= cumulativeWeight) {
        travelClass = travelClasses[j];
        break;
      }
    }
    
    // Adjust price based on travel class
    let classPriceMultiplier = 1;
    switch (travelClass) {
      case 'premium-economy':
        classPriceMultiplier = 1.5;
        break;
      case 'business':
        classPriceMultiplier = 3.0;
        break;
      case 'first':
        classPriceMultiplier = 5.0;
        break;
      default:
        classPriceMultiplier = 1;
    }
    
    const adjustedPrice = Math.round(finalPrice * classPriceMultiplier);
    const finalPriceWithFloor = Math.max(adjustedPrice, 150);
    
    // Generate realistic seat availability
    const aircraftCapacity = {
      '320': { total: 180, economy: 156, business: 24, first: 0 },
      '321': { total: 220, economy: 184, business: 36, first: 0 },
      '737': { total: 189, economy: 162, business: 27, first: 0 },
      '738': { total: 189, economy: 162, business: 27, first: 0 },
      '77W': { total: 350, economy: 264, business: 68, first: 18 },
      '380': { total: 525, economy: 399, business: 96, first: 30 },
      '787': { total: 290, economy: 228, business: 50, first: 12 },
      '788': { total: 290, economy: 228, business: 50, first: 12 },
      '789': { total: 290, economy: 228, business: 50, first: 12 },
      '350': { total: 325, economy: 253, business: 60, first: 12 },
      '359': { total: 325, economy: 253, business: 60, first: 12 },
      '333': { total: 300, economy: 237, business: 51, first: 12 },
    };
    
    const capacity = (aircraftCapacity as any)[aircraft] || aircraftCapacity['320'];
    const loadFactor = 0.6 + Math.random() * 0.3; // 60-90% load factor
    
    const economyAvailable = Math.floor(capacity.economy * (1 - loadFactor) + Math.random() * 20);
    const businessAvailable = Math.floor(capacity.business * (1 - loadFactor * 0.7) + Math.random() * 10);
    const firstAvailable = capacity.first > 0 ? Math.floor(capacity.first * (1 - loadFactor * 0.5) + Math.random() * 5) : 0;
    
    // Determine route type and distance
    const isInternalRoute = fromCountry === toCountry;
    const routeType = isInternalRoute ? 'domestic' as const : 
                     (['US', 'CA'].includes(fromCountry) && ['US', 'CA'].includes(toCountry) ||
                      ['GB', 'FR', 'DE', 'ES', 'IT'].includes(fromCountry) && ['GB', 'FR', 'DE', 'ES', 'IT'].includes(toCountry)
                     ) ? 'regional' as const : 'international' as const;
    
    // Estimate distance (rough calculation)
    const getDistance = (from: string, to: string) => {
      const routeKey = `${from}-${to}`;
      const reverseKey = `${to}-${from}`;
      
      // Known route distances (in km)
      const knownDistances: { [key: string]: number } = {
        'JFK-LAX': 3944, 'LAX-JFK': 3944,
        'JFK-LHR': 5549, 'LHR-JFK': 5549,
        'LAX-NRT': 8815, 'NRT-LAX': 8815,
        'BOM-DXB': 1925, 'DXB-BOM': 1925,
        'DEL-BOM': 1138, 'BOM-DEL': 1138,
        'SYD-LAX': 12051, 'LAX-SYD': 12051,
      };
      
      if (knownDistances[routeKey]) return knownDistances[routeKey];
      if (knownDistances[reverseKey]) return knownDistances[reverseKey];
      
      // Estimate based on route type and duration
      if (isInternalRoute) {
        return flightDuration * 600; // ~600 km/hour average
      } else {
        return flightDuration * 800; // ~800 km/hour average for jets
      }
    };
    
    const distance = getDistance(from, to);
    
    // Calculate price breakdown
    const baseFare = Math.round(finalPriceWithFloor * 0.65);
    const taxes = Math.round(finalPriceWithFloor * 0.25);
    const fees = finalPriceWithFloor - baseFare - taxes;
    
    return {
      id: `${airline.code}${Math.floor(Math.random() * 9000) + 1000}-${i}`,
      airline: airline.name,
      flightNumber: `${airline.code} ${Math.floor(Math.random() * 9000) + 1000}`,
      origin: from,
      destination: to,
      departTime,
      arriveTime,
      duration: `${flightDuration}h ${Math.floor(Math.random() * 50) + 10}m`,
      price: finalPriceWithFloor,
      stops,
      aircraft: aircraft === '77W' ? 'Boeing 777-300ER' : 
               aircraft === '380' ? 'Airbus A380' : 
               aircraft === '787' ? 'Boeing 787 Dreamliner' : 
               aircraft === '350' ? 'Airbus A350' : 
               aircraft === '320' ? 'Airbus A320' : 
               aircraft === '321' ? 'Airbus A321' : 
               aircraft === '737' ? 'Boeing 737' : 
               `Aircraft ${aircraft}`,
      travelClass,
      // Enhanced information
      availability: {
        economyAvailable: Math.max(0, economyAvailable),
        businessAvailable: Math.max(0, businessAvailable),
        firstAvailable: Math.max(0, firstAvailable),
        totalSeats: capacity.total,
        bookingClass: travelClass === 'economy' ? 'Y' : 
                     travelClass === 'premium-economy' ? 'W' : 
                     travelClass === 'business' ? 'J' : 'F'
      },
      routeType,
      distance,
      priceBreakdown: {
        baseFare,
        taxes,
        fees,
        total: finalPriceWithFloor
      }
    };
  }).sort((a, b) => a.price - b.price);
};