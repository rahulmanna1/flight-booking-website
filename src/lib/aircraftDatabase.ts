// Comprehensive Aircraft Amenity Database
// Based on real airline configurations and industry standards

export interface AircraftAmenities {
  wifi: boolean;
  entertainment: boolean;
  meals: boolean;
  power: boolean;
  extraLegroom: boolean;
  category: 'Wide-body' | 'Narrow-body' | 'Regional';
  seatConfig: string;
  range: 'Short-haul' | 'Medium-haul' | 'Long-haul';
  description: string;
}

// Aircraft database with real-world configurations
export const AIRCRAFT_DATABASE: { [key: string]: AircraftAmenities } = {
  // Boeing 787 Family (Dreamliner)
  '787': {
    wifi: true,
    entertainment: true,
    meals: true,
    power: true,
    extraLegroom: true,
    category: 'Wide-body',
    seatConfig: '2-4-2 or 3-3-3',
    range: 'Long-haul',
    description: 'Modern wide-body with advanced amenities'
  },
  '788': {
    wifi: true,
    entertainment: true,
    meals: true,
    power: true,
    extraLegroom: true,
    category: 'Wide-body',
    seatConfig: '2-4-2 or 3-3-3',
    range: 'Long-haul',
    description: 'Boeing 787-8 Dreamliner'
  },
  '789': {
    wifi: true,
    entertainment: true,
    meals: true,
    power: true,
    extraLegroom: true,
    category: 'Wide-body',
    seatConfig: '2-4-2 or 3-3-3',
    range: 'Long-haul',
    description: 'Boeing 787-9 Dreamliner'
  },
  '78J': {
    wifi: true,
    entertainment: true,
    meals: true,
    power: true,
    extraLegroom: true,
    category: 'Wide-body',
    seatConfig: '2-4-2 or 3-3-3',
    range: 'Long-haul',
    description: 'Boeing 787-10 Dreamliner'
  },

  // Boeing 777 Family
  '777': {
    wifi: true,
    entertainment: true,
    meals: true,
    power: true,
    extraLegroom: true,
    category: 'Wide-body',
    seatConfig: '3-3-3 or 2-5-2',
    range: 'Long-haul',
    description: 'Large wide-body for long-haul routes'
  },
  '77W': {
    wifi: true,
    entertainment: true,
    meals: true,
    power: true,
    extraLegroom: true,
    category: 'Wide-body',
    seatConfig: '3-3-3 or 2-5-2',
    range: 'Long-haul',
    description: 'Boeing 777-300ER'
  },
  '772': {
    wifi: true,
    entertainment: true,
    meals: true,
    power: true,
    extraLegroom: false,
    category: 'Wide-body',
    seatConfig: '3-3-3 or 2-5-2',
    range: 'Long-haul',
    description: 'Boeing 777-200'
  },
  '773': {
    wifi: true,
    entertainment: true,
    meals: true,
    power: true,
    extraLegroom: true,
    category: 'Wide-body',
    seatConfig: '3-3-3',
    range: 'Long-haul',
    description: 'Boeing 777-300'
  },

  // Boeing 747 Family (Queen of the Skies)
  '747': {
    wifi: true,
    entertainment: true,
    meals: true,
    power: true,
    extraLegroom: true,
    category: 'Wide-body',
    seatConfig: '3-4-3',
    range: 'Long-haul',
    description: 'Iconic jumbo jet with upper deck'
  },
  '74H': {
    wifi: true,
    entertainment: true,
    meals: true,
    power: true,
    extraLegroom: true,
    category: 'Wide-body',
    seatConfig: '3-4-3',
    range: 'Long-haul',
    description: 'Boeing 747-8'
  },
  '744': {
    wifi: false,
    entertainment: true,
    meals: true,
    power: false,
    extraLegroom: true,
    category: 'Wide-body',
    seatConfig: '3-4-3',
    range: 'Long-haul',
    description: 'Boeing 747-400 (older configuration)'
  },

  // Boeing 737 Family (Workhorse)
  '737': {
    wifi: true,
    entertainment: false,
    meals: false,
    power: true,
    extraLegroom: false,
    category: 'Narrow-body',
    seatConfig: '3-3',
    range: 'Short-haul',
    description: 'Popular narrow-body for domestic routes'
  },
  '73H': {
    wifi: true,
    entertainment: false,
    meals: false,
    power: true,
    extraLegroom: false,
    category: 'Narrow-body',
    seatConfig: '3-3',
    range: 'Medium-haul',
    description: 'Boeing 737-800'
  },
  '738': {
    wifi: true,
    entertainment: false,
    meals: false,
    power: true,
    extraLegroom: false,
    category: 'Narrow-body',
    seatConfig: '3-3',
    range: 'Medium-haul',
    description: 'Boeing 737-800'
  },
  '73G': {
    wifi: true,
    entertainment: false,
    meals: false,
    power: false,
    extraLegroom: false,
    category: 'Narrow-body',
    seatConfig: '3-3',
    range: 'Short-haul',
    description: 'Boeing 737-700'
  },
  '739': {
    wifi: true,
    entertainment: true,
    meals: false,
    power: true,
    extraLegroom: false,
    category: 'Narrow-body',
    seatConfig: '3-3',
    range: 'Medium-haul',
    description: 'Boeing 737-900'
  },
  '38M': {
    wifi: true,
    entertainment: true,
    meals: false,
    power: true,
    extraLegroom: false,
    category: 'Narrow-body',
    seatConfig: '3-3',
    range: 'Medium-haul',
    description: 'Boeing 737 MAX 8'
  },
  '7M8': {
    wifi: true,
    entertainment: true,
    meals: false,
    power: true,
    extraLegroom: false,
    category: 'Narrow-body',
    seatConfig: '3-3',
    range: 'Medium-haul',
    description: 'Boeing 737 MAX 8'
  },

  // Airbus A380 (Super Jumbo)
  '380': {
    wifi: true,
    entertainment: true,
    meals: true,
    power: true,
    extraLegroom: true,
    category: 'Wide-body',
    seatConfig: '3-4-3 (lower), 2-4-2 (upper)',
    range: 'Long-haul',
    description: 'World\'s largest passenger airliner'
  },
  '388': {
    wifi: true,
    entertainment: true,
    meals: true,
    power: true,
    extraLegroom: true,
    category: 'Wide-body',
    seatConfig: '3-4-3 (lower), 2-4-2 (upper)',
    range: 'Long-haul',
    description: 'Airbus A380-800'
  },

  // Airbus A350 Family
  '350': {
    wifi: true,
    entertainment: true,
    meals: true,
    power: true,
    extraLegroom: true,
    category: 'Wide-body',
    seatConfig: '3-3-3',
    range: 'Long-haul',
    description: 'Modern wide-body with fuel efficiency'
  },
  '359': {
    wifi: true,
    entertainment: true,
    meals: true,
    power: true,
    extraLegroom: true,
    category: 'Wide-body',
    seatConfig: '3-3-3',
    range: 'Long-haul',
    description: 'Airbus A350-900'
  },
  '351': {
    wifi: true,
    entertainment: true,
    meals: true,
    power: true,
    extraLegroom: true,
    category: 'Wide-body',
    seatConfig: '3-3-3',
    range: 'Long-haul',
    description: 'Airbus A350-1000'
  },

  // Airbus A330 Family
  '330': {
    wifi: true,
    entertainment: true,
    meals: true,
    power: true,
    extraLegroom: false,
    category: 'Wide-body',
    seatConfig: '2-4-2',
    range: 'Long-haul',
    description: 'Twin-aisle wide-body'
  },
  '332': {
    wifi: true,
    entertainment: true,
    meals: true,
    power: true,
    extraLegroom: false,
    category: 'Wide-body',
    seatConfig: '2-4-2',
    range: 'Medium-haul',
    description: 'Airbus A330-200'
  },
  '333': {
    wifi: true,
    entertainment: true,
    meals: true,
    power: true,
    extraLegroom: false,
    category: 'Wide-body',
    seatConfig: '2-4-2',
    range: 'Long-haul',
    description: 'Airbus A330-300'
  },
  '339': {
    wifi: true,
    entertainment: true,
    meals: true,
    power: true,
    extraLegroom: true,
    category: 'Wide-body',
    seatConfig: '2-4-2',
    range: 'Long-haul',
    description: 'Airbus A330-900neo'
  },

  // Airbus A320 Family
  '320': {
    wifi: true,
    entertainment: false,
    meals: false,
    power: true,
    extraLegroom: false,
    category: 'Narrow-body',
    seatConfig: '3-3',
    range: 'Short-haul',
    description: 'Popular European narrow-body'
  },
  '32S': {
    wifi: true,
    entertainment: true,
    meals: false,
    power: true,
    extraLegroom: false,
    category: 'Narrow-body',
    seatConfig: '3-3',
    range: 'Medium-haul',
    description: 'Airbus A320neo'
  },
  '32N': {
    wifi: true,
    entertainment: true,
    meals: false,
    power: true,
    extraLegroom: false,
    category: 'Narrow-body',
    seatConfig: '3-3',
    range: 'Medium-haul',
    description: 'Airbus A320neo'
  },
  '321': {
    wifi: true,
    entertainment: true,
    meals: false,
    power: true,
    extraLegroom: false,
    category: 'Narrow-body',
    seatConfig: '3-3',
    range: 'Medium-haul',
    description: 'Airbus A321 (stretched A320)'
  },
  '21N': {
    wifi: true,
    entertainment: true,
    meals: false,
    power: true,
    extraLegroom: false,
    category: 'Narrow-body',
    seatConfig: '3-3',
    range: 'Medium-haul',
    description: 'Airbus A321neo'
  },
  '319': {
    wifi: true,
    entertainment: false,
    meals: false,
    power: false,
    extraLegroom: false,
    category: 'Narrow-body',
    seatConfig: '3-3',
    range: 'Short-haul',
    description: 'Airbus A319 (shortened A320)'
  },

  // Regional Aircraft
  'CR9': {
    wifi: false,
    entertainment: false,
    meals: false,
    power: false,
    extraLegroom: false,
    category: 'Regional',
    seatConfig: '2-2',
    range: 'Short-haul',
    description: 'Bombardier CRJ-900'
  },
  'CR7': {
    wifi: false,
    entertainment: false,
    meals: false,
    power: false,
    extraLegroom: false,
    category: 'Regional',
    seatConfig: '2-2',
    range: 'Short-haul',
    description: 'Bombardier CRJ-700'
  },
  'E70': {
    wifi: false,
    entertainment: false,
    meals: false,
    power: false,
    extraLegroom: false,
    category: 'Regional',
    seatConfig: '2-2',
    range: 'Short-haul',
    description: 'Embraer E-Jet E170'
  },
  'E75': {
    wifi: true,
    entertainment: false,
    meals: false,
    power: true,
    extraLegroom: false,
    category: 'Regional',
    seatConfig: '2-2',
    range: 'Short-haul',
    description: 'Embraer E-Jet E175'
  },
  'E90': {
    wifi: true,
    entertainment: false,
    meals: false,
    power: true,
    extraLegroom: false,
    category: 'Regional',
    seatConfig: '2-2',
    range: 'Short-haul',
    description: 'Embraer E-Jet E190'
  },
  'DH4': {
    wifi: false,
    entertainment: false,
    meals: false,
    power: false,
    extraLegroom: false,
    category: 'Regional',
    seatConfig: '2-2',
    range: 'Short-haul',
    description: 'De Havilland Dash 8-400'
  },
  'AT7': {
    wifi: false,
    entertainment: false,
    meals: false,
    power: false,
    extraLegroom: false,
    category: 'Regional',
    seatConfig: '2-2',
    range: 'Short-haul',
    description: 'ATR 72'
  }
};

// Airline-specific service enhancements
export const AIRLINE_SERVICE_ENHANCEMENTS: { [key: string]: Partial<AircraftAmenities> } = {
  'Emirates': {
    wifi: true,
    entertainment: true,
    meals: true,
    extraLegroom: true
  },
  'Qatar Airways': {
    wifi: true,
    entertainment: true,
    meals: true,
    extraLegroom: true
  },
  'Singapore Airlines': {
    wifi: true,
    entertainment: true,
    meals: true,
    extraLegroom: true
  },
  'Lufthansa': {
    wifi: true,
    entertainment: true,
    meals: true
  },
  'British Airways': {
    wifi: true,
    entertainment: true,
    meals: true
  },
  'Air France': {
    wifi: true,
    entertainment: true,
    meals: true
  },
  'KLM': {
    wifi: true,
    entertainment: true
  },
  'Turkish Airlines': {
    wifi: true,
    entertainment: true,
    meals: true
  },
  'American Airlines': {
    wifi: true,
    entertainment: true
  },
  'Delta Air Lines': {
    wifi: true,
    entertainment: true
  },
  'United Airlines': {
    wifi: true,
    entertainment: true
  },
  'JetBlue Airways': {
    wifi: true,
    entertainment: true
  },
  'Southwest Airlines': {
    wifi: true,
    entertainment: false
  },
  'WestJet': {
    wifi: true,
    entertainment: true
  }
};

// Get accurate aircraft amenities
export const getAircraftAmenities = (aircraftCode: string, airline?: string): AircraftAmenities => {
  // Start with aircraft-specific data
  let amenities = AIRCRAFT_DATABASE[aircraftCode];
  
  if (!amenities) {
    // Fallback logic for unknown aircraft codes
    if (aircraftCode.includes('787') || aircraftCode.includes('777') || 
        aircraftCode.includes('A350') || aircraftCode.includes('A380') ||
        aircraftCode.includes('747')) {
      amenities = {
        wifi: true,
        entertainment: true,
        meals: true,
        power: true,
        extraLegroom: true,
        category: 'Wide-body',
        seatConfig: 'Unknown',
        range: 'Long-haul',
        description: 'Wide-body aircraft'
      };
    } else if (aircraftCode.includes('737') || aircraftCode.includes('A32') ||
               aircraftCode.includes('320') || aircraftCode.includes('321')) {
      amenities = {
        wifi: true,
        entertainment: false,
        meals: false,
        power: true,
        extraLegroom: false,
        category: 'Narrow-body',
        seatConfig: '3-3',
        range: 'Medium-haul',
        description: 'Narrow-body aircraft'
      };
    } else {
      // Default for unknown aircraft
      amenities = {
        wifi: false,
        entertainment: false,
        meals: false,
        power: false,
        extraLegroom: false,
        category: 'Regional',
        seatConfig: 'Unknown',
        range: 'Short-haul',
        description: 'Regional aircraft'
      };
    }
  }

  // Apply airline-specific enhancements
  if (airline && AIRLINE_SERVICE_ENHANCEMENTS[airline]) {
    const enhancements = AIRLINE_SERVICE_ENHANCEMENTS[airline];
    amenities = { ...amenities, ...enhancements };
  }

  return amenities;
};

// Get feature list for display
export const getFeatureList = (amenities: AircraftAmenities): string[] => {
  const features: string[] = [];
  
  if (amenities.wifi) features.push('Wi-Fi Available');
  if (amenities.entertainment) features.push('Entertainment System');
  if (amenities.meals) features.push('Meal Service');
  else if (amenities.range === 'Short-haul' || amenities.range === 'Medium-haul') {
    features.push('Snack Service');
  }
  if (amenities.power) features.push('Power Outlets');
  if (amenities.extraLegroom) features.push('Extra Legroom Available');
  
  if (features.length === 0) {
    features.push('Basic Service');
  }
  
  return features;
};

// Check if aircraft has specific amenity (for filtering)
export const hasAmenity = (aircraftCode: string, airline: string | undefined, amenity: string): boolean => {
  const amenities = getAircraftAmenities(aircraftCode, airline);
  
  switch (amenity) {
    case 'wifi': return amenities.wifi;
    case 'entertainment': return amenities.entertainment;
    case 'meals': return amenities.meals;
    case 'power': return amenities.power;
    case 'extra-legroom': return amenities.extraLegroom;
    default: return false;
  }
};