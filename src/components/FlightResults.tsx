'use client';

import { useState, useEffect, useCallback } from 'react';
import FlightCard from './cards/FlightCard';
import BookingForm from './forms/BookingForm';
import FlightFilters, { FlightFilters as FilterType } from './FlightFilters';
import { ArrowLeft, Filter, X, Loader2, Plane } from 'lucide-react';
import { useCurrency } from '@/contexts/CurrencyContext';
import { hasAmenity } from '@/lib/aircraftDatabase';

// Airport display component
interface AirportDisplayProps {
  code: string;
  showFullName?: boolean;
  className?: string;
}

const AirportDisplay = ({ code, showFullName = false, className = '' }: AirportDisplayProps) => {
  const cached = airportCache[code];
  
  if (showFullName && cached) {
    return (
      <span className={className}>
        <span className="font-bold">{cached.name}</span>
        <span className="text-gray-500 ml-1">({code})</span>
        <br />
        <span className="text-sm text-gray-600">{cached.city}, {cached.country}</span>
      </span>
    );
  }
  
  return (
    <span className={className}>
      <span className="font-bold">{code}</span>
      {cached && (
        <span className="text-gray-600 ml-1">- {cached.city}</span>
      )}
    </span>
  );
};

// Global airport name resolution
interface AirportCache {
  [key: string]: { name: string, city: string, country: string };
}

const airportCache: AirportCache = {};

// Fetch airport details from our dedicated API
const fetchAirportDetails = async (code: string): Promise<{ name: string, city: string, country: string } | null> => {
  if (airportCache[code]) {
    return airportCache[code];
  }
  
  try {
    const response = await fetch(`/api/airports/details?codes=${code}`);
    const data = await response.json();
    
    if (data.success && data.airports[code]) {
      const airportInfo = data.airports[code];
      
      // Cache the result
      airportCache[code] = airportInfo;
      return airportInfo;
    }
  } catch (error) {
    console.error(`Failed to fetch airport details for ${code}:`, error);
  }
  
  return null;
};

// Batch fetch multiple airport details
const fetchMultipleAirportDetails = async (codes: string[]): Promise<void> => {
  const uncachedCodes = codes.filter(code => !airportCache[code]);
  
  if (uncachedCodes.length === 0) return;
  
  try {
    const response = await fetch(`/api/airports/details?codes=${uncachedCodes.join(',')}`);
    const data = await response.json();
    
    if (data.success) {
      // Cache all results
      Object.entries(data.airports).forEach(([code, info]: [string, any]) => {
        airportCache[code] = info;
      });
    }
  } catch (error) {
    console.error(`Failed to batch fetch airport details:`, error);
  }
};

// Get airport name with fallback
const getAirportName = (code: string) => {
  const cached = airportCache[code];
  return cached ? cached.name : `${code} Airport`;
};

// Get full airport display text
const getAirportDisplayText = (code: string) => {
  const cached = airportCache[code];
  if (cached) {
    return `${cached.name} (${code}) - ${cached.city}, ${cached.country}`;
  }
  return `${code} Airport`;
};

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
}

interface FlightResultsProps {
  searchData: {
    from: string;
    to: string;
    departDate: string;
    returnDate?: string;
    passengers: number;
    tripType: 'roundtrip' | 'oneway';
    travelClass?: string;
  };
  onBack: () => void;
}

export default function FlightResults({ searchData, onBack }: FlightResultsProps) {
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [sortBy, setSortBy] = useState<'price' | 'duration' | 'departure'>('price');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [flights, setFlights] = useState<Flight[]>([]);
  const [filteredFlights, setFilteredFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<string>('loading');
  const [showFilters, setShowFilters] = useState(true);
  const { formatPrice, convertPrice } = useCurrency();

  // Fetch flights and airport details from APIs
  useEffect(() => {
    const fetchFlights = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch flight data
        const response = await fetch('/api/flights/search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(searchData)
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          if (response.status === 400 && data.error) {
            throw new Error(data.error);
          }
          throw new Error(data.error || 'Failed to search flights');
        }
        
        if (data.success) {
          setFlights(data.flights);
          setDataSource(data.source);
          console.log(`Loaded ${data.flights.length} flights from ${data.source}`);
          
          // Batch load airport names for all unique airports in the results
          const uniqueAirportCodes = new Set<string>();
          uniqueAirportCodes.add(searchData.from);
          uniqueAirportCodes.add(searchData.to);
          
          // Add any airports found in flight data
          data.flights.forEach((flight: any) => {
            if (flight.origin) uniqueAirportCodes.add(flight.origin);
            if (flight.destination) uniqueAirportCodes.add(flight.destination);
          });
          
          // Batch fetch all airport details
          await fetchMultipleAirportDetails(Array.from(uniqueAirportCodes));
        } else {
          throw new Error(data.error || 'Failed to load flights');
        }
        
      } catch (err: any) {
        console.error('Flight search error:', err);
        setError(err.message || 'Failed to load flights');
        setFlights([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchFlights();
  }, [searchData]);
  
  // Filter flights based on active filters
  const handleFiltersChange = useCallback((filters: FilterType) => {
    let filtered = [...flights];
    
    // Price range filter
    filtered = filtered.filter(flight => 
      flight.price >= filters.priceRange[0] && flight.price <= filters.priceRange[1]
    );
    
    // Airlines filter
    if (filters.airlines.length > 0) {
      filtered = filtered.filter(flight => 
        filters.airlines.includes(flight.airline)
      );
    }
    
    // Stops filter
    if (filters.stops.length > 0) {
      filtered = filtered.filter(flight => {
        const flightStops = flight.stops ?? 0;
        return filters.stops.some(stopFilter => {
          if (stopFilter === 2) {
            return flightStops >= 2; // 2+ stops
          }
          return flightStops === stopFilter;
        });
      });
    }
    
    // Departure time filter
    if (filters.departureTime.length > 0) {
      filtered = filtered.filter(flight => {
        const departHour = parseInt(flight.departTime.split(':')[0]);
        
        return filters.departureTime.some(period => {
          switch (period) {
            case 'early-morning': return departHour >= 5 && departHour < 8;
            case 'morning': return departHour >= 8 && departHour < 12;
            case 'afternoon': return departHour >= 12 && departHour < 18;
            case 'evening': return departHour >= 18 && departHour < 22;
            case 'night': return departHour >= 22 || departHour < 5;
            default: return false;
          }
        });
      });
    }
    
    // Duration filter
    const getDurationInMinutes = (duration: string) => {
      const match = duration.match(/(\d+)h\s*(\d+)m/);
      if (match) {
        return parseInt(match[1]) * 60 + parseInt(match[2]);
      }
      return 0;
    };
    
    filtered = filtered.filter(flight => {
      const durationMinutes = getDurationInMinutes(flight.duration);
      return durationMinutes >= filters.duration[0] && durationMinutes <= filters.duration[1];
    });
    
    // Travel class filter - if empty array, show all classes
    if (filters.travelClass.length > 0) {
      filtered = filtered.filter(flight => {
        const flightClass = flight.travelClass || 'economy';
        return filters.travelClass.includes(flightClass);
      });
    }
    // If travelClass array is empty, don't filter by travel class (show all)
    
    // Amenities filter using aircraft database
    if (filters.amenities.length > 0) {
      filtered = filtered.filter(flight => {
        return filters.amenities.every(amenity => {
          return hasAmenity(flight.aircraft || '', flight.airline, amenity);
        });
      });
    }
    
    setFilteredFlights(filtered);
  }, [flights]);
  
  // Update filtered flights when flights change - let filter sidebar handle all filtering
  useEffect(() => {
    // Don't apply initial filtering here - let the filter sidebar handle it
    // This prevents conflicts between initial filtering and sidebar filtering
    setFilteredFlights(flights);
  }, [flights]);

  const handleFlightSelect = (flightId: string) => {
    const flight = filteredFlights.find(f => f.id === flightId);
    if (flight) {
      setSelectedFlight(flight);
      setShowBookingModal(true);
    }
  };

  const handleBookingSubmit = async (bookingData: any) => {
    setBookingLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('Booking submitted:', {
      flight: selectedFlight,
      passenger: bookingData,
      searchData
    });
    
    alert(`Booking confirmed! Flight ${selectedFlight?.flightNumber} has been booked successfully.`);
    setBookingLoading(false);
    setShowBookingModal(false);
    setSelectedFlight(null);
  };

  const handleCloseBooking = () => {
    setShowBookingModal(false);
    setSelectedFlight(null);
  };

  const sortedFlights = [...filteredFlights].sort((a, b) => {
    switch (sortBy) {
      case 'price':
        return a.price - b.price;
      case 'duration':
        return parseInt(a.duration) - parseInt(b.duration);
      case 'departure':
        return a.departTime.localeCompare(b.departTime);
      default:
        return 0;
    }
  });

  const getFlightCountText = () => {
    if (loading) return 'Searching flights...';
    if (filteredFlights.length !== flights.length) {
      return `${filteredFlights.length} of ${flights.length} flights match your filters`;
    }
    return `${flights.length} flights found`;
  };
  
  // Check if we have flights in user's preferred travel class
  const hasUserClassFlights = () => {
    if (!searchData.travelClass || searchData.travelClass === 'economy') return true;
    return flights.some(f => f.travelClass === searchData.travelClass);
  };
  
  const getTravelClassDisplayName = (travelClass: string) => {
    switch (travelClass) {
      case 'economy': return 'Economy';
      case 'premium-economy': return 'Premium Economy';
      case 'business': return 'Business Class';
      case 'first': return 'First Class';
      default: return travelClass;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Booking Modal */}
      {showBookingModal && selectedFlight && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Complete Your Booking</h2>
                <p className="text-gray-600 mt-1">
                  {selectedFlight.airline} {selectedFlight.flightNumber} • 
                  {searchData.from} → {searchData.to} • 
                  {formatPrice(selectedFlight.price)}
                </p>
              </div>
              <button
                onClick={handleCloseBooking}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>
            <div className="p-6">
              <BookingForm 
                onSubmit={handleBookingSubmit} 
                totalPrice={convertPrice(selectedFlight.price * searchData.passengers)}
                loading={bookingLoading}
              />
            </div>
          </div>
        </div>
      )}

      {/* Main Layout with Sidebar */}
      <div className="flex h-screen">
        {/* Filter Sidebar */}
        <div className={`${showFilters ? 'w-80' : 'w-0'} transition-all duration-300 overflow-hidden md:block ${showFilters ? '' : 'hidden'}`}>
          <FlightFilters
            flights={flights}
            onFiltersChange={handleFiltersChange}
            isVisible={showFilters}
            onToggleVisibility={() => setShowFilters(!showFilters)}
            userTravelClass={searchData.travelClass}
          />
        </div>
        
        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <button
                  onClick={onBack}
                  className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span>Back to Search</span>
                </button>
                
                {/* Mobile Filter Toggle */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="md:hidden flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  <Filter className="w-4 h-4" />
                  <span>Filters</span>
                </button>
              </div>
              
              <div className="text-right">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center justify-end space-x-3">
                  <AirportDisplay code={searchData.from} />
                  <Plane className="w-6 h-6 text-blue-600 transform rotate-90" />
                  <AirportDisplay code={searchData.to} />
                </h1>
                <div className="text-sm text-gray-600 mt-2">
                  <AirportDisplay code={searchData.from} showFullName={true} className="block" />
                  <div className="text-center text-gray-400 my-1">to</div>
                  <AirportDisplay code={searchData.to} showFullName={true} className="block" />
                </div>
              </div>
            </div>

            {/* Search Summary */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 mb-6">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-sm">
                <div>
                  <span className="text-gray-500 block mb-1">Route</span>
                  <span className="font-semibold text-gray-900">{searchData.from} → {searchData.to}</span>
                </div>
                <div>
                  <span className="text-gray-500 block mb-1">Departure</span>
                  <span className="font-semibold text-gray-900">
                    {new Date(searchData.departDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </span>
                </div>
                {searchData.returnDate && (
                  <div>
                    <span className="text-gray-500 block mb-1">Return</span>
                    <span className="font-semibold text-gray-900">
                      {new Date(searchData.returnDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                )}
                <div>
                  <span className="text-gray-500 block mb-1">Passengers</span>
                  <span className="font-semibold text-gray-900">
                    {searchData.passengers} {searchData.passengers === 1 ? 'Adult' : 'Adults'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 block mb-1">Trip Type</span>
                  <span className="font-semibold text-gray-900">
                    {searchData.tripType === 'roundtrip' ? 'Round Trip' : 'One Way'}
                  </span>
                </div>
                {searchData.travelClass && (
                  <div>
                    <span className="text-gray-500 block mb-1">Class</span>
                    <span className="font-semibold text-gray-900">
                      {getTravelClassDisplayName(searchData.travelClass)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Travel Class Notice */}
            {!loading && !error && flights.length > 0 && searchData.travelClass && searchData.travelClass !== 'economy' && !hasUserClassFlights() && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <span className="text-yellow-600 text-lg">⚠️</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-yellow-800 mb-1">
                      No {getTravelClassDisplayName(searchData.travelClass)} flights found
                    </h3>
                    <p className="text-sm text-yellow-700">
                      We're showing all available flights for your route. Use the travel class filter to explore other cabin options, or try different dates for more {getTravelClassDisplayName(searchData.travelClass)} availability.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <p className="text-gray-600">
                  {getFlightCountText()}
                </p>
                {dataSource && !loading && (
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    dataSource === 'amadeus' ? 'bg-green-100 text-green-800' :
                    dataSource === 'mock_fallback' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {dataSource === 'amadeus' ? 'Live Data' :
                     dataSource === 'mock_fallback' ? 'Demo Data (API Error)' :
                     'Demo Data'}
                  </span>
                )}
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-700">Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'price' | 'duration' | 'departure')}
                    className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                  >
                    <option value="price">Price (Low to High)</option>
                    <option value="duration">Duration</option>
                    <option value="departure">Departure Time</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="text-center py-12">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
                <p className="text-gray-600 text-lg">Searching for the best flights...</p>
                <p className="text-sm text-gray-500 mt-2">
                  This may take a few moments while we check live prices
                </p>
              </div>
            )}

            {/* Error State */}
            {error && !loading && (
              <div className="text-center py-12">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
                  <p className="text-red-600 text-lg font-semibold mb-2">Search Error</p>
                  <p className="text-red-700 mb-4">{error}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 transition-colors mr-3"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={onBack}
                    className="bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-gray-700 transition-colors"
                  >
                    Modify Search
                  </button>
                </div>
              </div>
            )}

            {/* Flight Results */}
            {!loading && !error && flights.length > 0 && (
              <div className="space-y-4">
                {sortedFlights.map((flight) => (
                  <FlightCard
                    key={flight.id}
                    flight={flight}
                    onSelect={handleFlightSelect}
                  />
                ))}
              </div>
            )}

            {/* No Results */}
            {!loading && !error && flights.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No flights found for your search criteria.</p>
                <p className="text-sm text-gray-400 mt-2">
                  Try adjusting your search dates or destinations
                </p>
                <button
                  onClick={onBack}
                  className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Modify Search
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}