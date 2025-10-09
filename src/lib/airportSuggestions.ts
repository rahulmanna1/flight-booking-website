// Popular destinations from major airports
export const POPULAR_ROUTES: { [key: string]: Array<{ code: string; city: string; country: string; type: string }> } = {
  'JFK': [
    { code: 'LAX', city: 'Los Angeles', country: 'USA', type: 'domestic' },
    { code: 'LHR', city: 'London', country: 'UK', type: 'international' },
    { code: 'CDG', city: 'Paris', country: 'France', type: 'international' },
    { code: 'NRT', city: 'Tokyo', country: 'Japan', type: 'international' },
    { code: 'SFO', city: 'San Francisco', country: 'USA', type: 'domestic' },
    { code: 'MIA', city: 'Miami', country: 'USA', type: 'domestic' }
  ],
  'LAX': [
    { code: 'JFK', city: 'New York', country: 'USA', type: 'domestic' },
    { code: 'NRT', city: 'Tokyo', country: 'Japan', type: 'international' },
    { code: 'LHR', city: 'London', country: 'UK', type: 'international' },
    { code: 'SFO', city: 'San Francisco', country: 'USA', type: 'domestic' },
    { code: 'SYD', city: 'Sydney', country: 'Australia', type: 'international' },
    { code: 'ORD', city: 'Chicago', country: 'USA', type: 'domestic' }
  ],
  'LHR': [
    { code: 'JFK', city: 'New York', country: 'USA', type: 'international' },
    { code: 'CDG', city: 'Paris', country: 'France', type: 'international' },
    { code: 'AMS', city: 'Amsterdam', country: 'Netherlands', type: 'international' },
    { code: 'FCO', city: 'Rome', country: 'Italy', type: 'international' },
    { code: 'DXB', city: 'Dubai', country: 'UAE', type: 'international' },
    { code: 'LAX', city: 'Los Angeles', country: 'USA', type: 'international' }
  ],
  'CDG': [
    { code: 'LHR', city: 'London', country: 'UK', type: 'international' },
    { code: 'JFK', city: 'New York', country: 'USA', type: 'international' },
    { code: 'AMS', city: 'Amsterdam', country: 'Netherlands', type: 'international' },
    { code: 'FCO', city: 'Rome', country: 'Italy', type: 'international' },
    { code: 'NRT', city: 'Tokyo', country: 'Japan', type: 'international' },
    { code: 'LAX', city: 'Los Angeles', country: 'USA', type: 'international' }
  ],
  'NRT': [
    { code: 'LAX', city: 'Los Angeles', country: 'USA', type: 'international' },
    { code: 'JFK', city: 'New York', country: 'USA', type: 'international' },
    { code: 'SFO', city: 'San Francisco', country: 'USA', type: 'international' },
    { code: 'LHR', city: 'London', country: 'UK', type: 'international' },
    { code: 'SYD', city: 'Sydney', country: 'Australia', type: 'international' },
    { code: 'SIN', city: 'Singapore', country: 'Singapore', type: 'international' }
  ],
  'DXB': [
    { code: 'LHR', city: 'London', country: 'UK', type: 'international' },
    { code: 'JFK', city: 'New York', country: 'USA', type: 'international' },
    { code: 'SYD', city: 'Sydney', country: 'Australia', type: 'international' },
    { code: 'SIN', city: 'Singapore', country: 'Singapore', type: 'international' },
    { code: 'FCO', city: 'Rome', country: 'Italy', type: 'international' },
    { code: 'NRT', city: 'Tokyo', country: 'Japan', type: 'international' }
  ],
  'SYD': [
    { code: 'LAX', city: 'Los Angeles', country: 'USA', type: 'international' },
    { code: 'NRT', city: 'Tokyo', country: 'Japan', type: 'international' },
    { code: 'LHR', city: 'London', country: 'UK', type: 'international' },
    { code: 'SIN', city: 'Singapore', country: 'Singapore', type: 'international' },
    { code: 'DXB', city: 'Dubai', country: 'UAE', type: 'international' },
    { code: 'SFO', city: 'San Francisco', country: 'USA', type: 'international' }
  ],
  'SFO': [
    { code: 'LAX', city: 'Los Angeles', country: 'USA', type: 'domestic' },
    { code: 'JFK', city: 'New York', country: 'USA', type: 'domestic' },
    { code: 'NRT', city: 'Tokyo', country: 'Japan', type: 'international' },
    { code: 'LHR', city: 'London', country: 'UK', type: 'international' },
    { code: 'ORD', city: 'Chicago', country: 'USA', type: 'domestic' },
    { code: 'SYD', city: 'Sydney', country: 'Australia', type: 'international' }
  ],
  'ORD': [
    { code: 'LAX', city: 'Los Angeles', country: 'USA', type: 'domestic' },
    { code: 'JFK', city: 'New York', country: 'USA', type: 'domestic' },
    { code: 'SFO', city: 'San Francisco', country: 'USA', type: 'domestic' },
    { code: 'LHR', city: 'London', country: 'UK', type: 'international' },
    { code: 'NRT', city: 'Tokyo', country: 'Japan', type: 'international' },
    { code: 'MIA', city: 'Miami', country: 'USA', type: 'domestic' }
  ],
  'MIA': [
    { code: 'JFK', city: 'New York', country: 'USA', type: 'domestic' },
    { code: 'LAX', city: 'Los Angeles', country: 'USA', type: 'domestic' },
    { code: 'LHR', city: 'London', country: 'UK', type: 'international' },
    { code: 'CDG', city: 'Paris', country: 'France', type: 'international' },
    { code: 'SFO', city: 'San Francisco', country: 'USA', type: 'domestic' },
    { code: 'ORD', city: 'Chicago', country: 'USA', type: 'domestic' }
  ],
  'FCO': [
    { code: 'LHR', city: 'London', country: 'UK', type: 'international' },
    { code: 'CDG', city: 'Paris', country: 'France', type: 'international' },
    { code: 'JFK', city: 'New York', country: 'USA', type: 'international' },
    { code: 'AMS', city: 'Amsterdam', country: 'Netherlands', type: 'international' },
    { code: 'DXB', city: 'Dubai', country: 'UAE', type: 'international' },
    { code: 'LAX', city: 'Los Angeles', country: 'USA', type: 'international' }
  ],
  'AMS': [
    { code: 'LHR', city: 'London', country: 'UK', type: 'international' },
    { code: 'CDG', city: 'Paris', country: 'France', type: 'international' },
    { code: 'JFK', city: 'New York', country: 'USA', type: 'international' },
    { code: 'FCO', city: 'Rome', country: 'Italy', type: 'international' },
    { code: 'NRT', city: 'Tokyo', country: 'Japan', type: 'international' },
    { code: 'LAX', city: 'Los Angeles', country: 'USA', type: 'international' }
  ]
};

// Airport names for display
export const AIRPORT_NAMES: { [key: string]: string } = {
  'JFK': 'John F. Kennedy International',
  'LAX': 'Los Angeles International',
  'LHR': 'London Heathrow',
  'CDG': 'Charles de Gaulle',
  'NRT': 'Tokyo Narita International',
  'DXB': 'Dubai International',
  'SYD': 'Sydney Kingsford Smith',
  'SFO': 'San Francisco International',
  'ORD': "Chicago O'Hare International",
  'MIA': 'Miami International',
  'FCO': 'Leonardo da Vinci–Fiumicino',
  'AMS': 'Amsterdam Airport Schiphol',
};

// Get popular destinations for a given airport
export const getPopularDestinations = (originCode: string, limit: number = 6) => {
  const destinations = POPULAR_ROUTES[originCode] || [];
  return destinations.slice(0, limit);
};

// Get suggestions for same-airport error
export const getSameAirportSuggestions = (airportCode: string) => {
  const destinations = getPopularDestinations(airportCode, 4);
  const airportName = AIRPORT_NAMES[airportCode] || airportCode;
  
  return {
    airportName,
    suggestions: destinations,
    message: `Flights cannot depart from and arrive at the same airport (${airportName}). Here are popular destinations from ${airportCode}:`
  };
};

// Check if two airport codes are the same
export const isSameAirport = (origin: string, destination: string): boolean => {
  return origin === destination && origin !== '' && destination !== '';
};