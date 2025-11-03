'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import FlightCard from './cards/FlightCard';
import BookingForm from './forms/BookingForm';
import FlightFilters, { FlightFilters as FilterType } from './FlightFilters';
import FlightResultsSkeleton from './FlightResultsSkeleton';
import { ArrowLeft, Filter, X, Loader2, Plane, RefreshCw, AlertCircle, Settings, Calendar, GitCompare } from 'lucide-react';
import { useCurrency } from '@/contexts/CurrencyContext';
import { hasAmenity } from '@/lib/aircraftDatabase';
import AdvancedSearch from './search/AdvancedSearch';
import FlexibleDateSearch from './search/FlexibleDateSearch';
import EnhancedSorting, { EnhancedSortOptions } from './search/EnhancedSorting';
import FlightComparison from './search/FlightComparison';
import KeyboardNavigationHelp from './accessibility/KeyboardNavigationHelp';
import AdvancedFiltersPanel, { FlightFilters as AdvancedFilterType } from './filters/AdvancedFiltersPanel';
import FlightFilterChips from './filters/FlightFilterChips';
import FilterSortBar, { SortOption, ViewMode } from './filters/FilterSortBar';
import CompareFlightButton from './comparison/CompareFlightButton';
import FlightComparisonModal, { FlightForComparison } from './comparison/FlightComparisonModal';

// Airport display component
interface AirportDisplayProps {
  code: string;
  showFullName?: boolean;
  className?: string;
}

const AirportDisplay = ({ code, showFullName = false, className = '' }: AirportDisplayProps) => {
  const [airportData, setAirportData] = useState<{ name: string, city: string, country: string } | null>(null);
  
  useEffect(() => {
    const loadData = async () => {
      if (airportCache[code]) {
        setAirportData(airportCache[code]);
      } else {
        const data = await fetchAirportDetails(code);
        if (data) {
          setAirportData(data);
        }
      }
    };
    loadData();
  }, [code]);
  
  if (showFullName && airportData) {
    return (
      <span className={className}>
        <span className="font-bold">{airportData.name}</span>
        <span className="text-gray-500 ml-1">({code})</span>
        <br />
        <span className="text-sm text-gray-600">{airportData.city}, {airportData.country}</span>
      </span>
    );
  }
  
  if (!airportData) {
    return (
      <span className={className}>
        <span className="font-bold">{code}</span>
      </span>
    );
  }
  
  return (
    <span className={className}>
      <span className="font-bold">{code}</span>
      <span className="text-gray-600 ml-1">- {airportData.city}</span>
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
  amenities?: string[] | {
    wifi?: boolean;
    meals?: boolean;
    entertainment?: boolean;
    powerOutlets?: boolean;
  };
  layovers?: Array<{
    airport: string;
    duration: string;
  }>;
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
  const router = useRouter();
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [sortBy, setSortBy] = useState<string>('price-asc');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [flights, setFlights] = useState<Flight[]>([]);
  const [filteredFlights, setFilteredFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<string>('loading');
  const [showFilters, setShowFilters] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [enhancedSortOptions, setEnhancedSortOptions] = useState<EnhancedSortOptions>({
    primary: { field: 'price', direction: 'asc', weight: 10 }
  });
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [showFlexibleDates, setShowFlexibleDates] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [selectedFlightsForComparison, setSelectedFlightsForComparison] = useState<string[]>([]);
  const { formatPrice, convertPrice } = useCurrency();
  
  // New advanced filters state
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilterType>({
    priceRange: [0, 5000],
    maxStops: null,
    airlines: [],
    departureTimeRange: [0, 24],
    arrivalTimeRange: [0, 24],
    maxDuration: null,
    minLayoverDuration: null,
    maxLayoverDuration: null,
    baggageIncluded: null,
    refundable: null,
    directFlightsOnly: false,
  });
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [newSortBy, setNewSortBy] = useState<SortOption>('best');
  const [showComparisonModal, setShowComparisonModal] = useState(false);
  const [availableAirlines, setAvailableAirlines] = useState<string[]>([]);
  
  // Sync newSortBy with sortBy when FilterSortBar changes
  useEffect(() => {
    if (newSortBy !== 'best') {
      setSortBy(newSortBy);
    }
  }, [newSortBy]);
  
  // Sync sortBy with newSortBy when old dropdown changes
  const handleOldSortChange = (value: string) => {
    setSortBy(value);
    setNewSortBy(value as SortOption);
  };

  // Fetch flights and airport details from APIs
  const fetchFlights = useCallback(async (isRetry = false) => {
    let controller: AbortController | null = null;
    let timeoutId: NodeJS.Timeout | null = null;
    
    try {
      if (isRetry) {
        setIsRetrying(true);
      } else {
        setLoading(true);
      }
      setError(null);
      
      // Debug: Log search data to understand what's being passed
      console.log('🔍 FlightResults search data:', {
        from: searchData.from,
        to: searchData.to,
        departDate: searchData.departDate,
        passengers: searchData.passengers,
        tripType: searchData.tripType
      });
      
      // Client-side validation: Check if origin and destination are the same
      if (searchData.from === searchData.to) {
        console.error('❌ Same airport error:', { from: searchData.from, to: searchData.to });
        throw new Error('Origin and destination airports must be different. Please select different airports.');
      }
      
      // Validate required fields
      if (!searchData.from || !searchData.to || !searchData.departDate) {
        console.error('❌ Missing required fields:', {
          from: searchData.from,
          to: searchData.to,
          departDate: searchData.departDate
        });
        throw new Error('Missing required search parameters. Please check your search criteria.');
      }
      
      // Add timeout for long requests
      controller = new AbortController();
      timeoutId = setTimeout(() => {
        if (controller) {
          controller.abort(new Error('Request timeout'));
        }
      }, 30000); // 30 second timeout
      
      // Fetch flight data
      const response = await fetch('/api/flights/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(searchData),
        signal: controller.signal
      });
      
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      
      const data = await response.json();
      
      if (!response.ok) {
        if (response.status === 400 && data.error) {
          throw new Error(data.error);
        }
        if (response.status === 429) {
          throw new Error('Too many requests. Please wait a moment and try again.');
        }
        if (response.status >= 500) {
          throw new Error('Server error. Please try again later.');
        }
        throw new Error(data.error || 'Failed to search flights');
      }
      
      if (data.success) {
        setFlights(data.flights);
        setDataSource(data.source);
        setRetryCount(0); // Reset retry count on success
        console.log(`Loaded ${data.flights.length} flights from ${data.source}`);
        
        // Extract available airlines
        const airlines = Array.from(new Set(data.flights.map((f: Flight) => f.airline))) as string[];
        setAvailableAirlines(airlines);
        
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
      
      // Handle timeout error
      if (err.name === 'AbortError') {
        setError('Request timed out. Please try again.');
      } else {
        setError(err.message || 'Failed to load flights');
      }
      
      setFlights([]);
      
      // Increment retry count for display purposes
      if (isRetry) {
        setRetryCount(prev => prev + 1);
      }
    } finally {
      setLoading(false);
      setIsRetrying(false);
    }
  }, [searchData]);
  
  useEffect(() => {
    fetchFlights();
  }, []);
  
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
  
  // Apply advanced filters to flights
  useEffect(() => {
    let filtered = [...flights];
    
    // Price range filter
    filtered = filtered.filter(flight => 
      flight.price >= advancedFilters.priceRange[0] && 
      flight.price <= advancedFilters.priceRange[1]
    );
    
    // Max stops filter
    if (advancedFilters.maxStops !== null) {
      filtered = filtered.filter(flight => 
        (flight.stops ?? 0) <= advancedFilters.maxStops!
      );
    }
    
    // Direct flights only filter
    if (advancedFilters.directFlightsOnly) {
      filtered = filtered.filter(flight => (flight.stops ?? 0) === 0);
    }
    
    // Airlines filter
    if (advancedFilters.airlines.length > 0) {
      filtered = filtered.filter(flight => 
        advancedFilters.airlines.includes(flight.airline)
      );
    }
    
    // Departure time range filter
    if (advancedFilters.departureTimeRange[0] !== 0 || advancedFilters.departureTimeRange[1] !== 24) {
      filtered = filtered.filter(flight => {
        const departHour = parseInt(flight.departTime.split(':')[0]);
        return departHour >= advancedFilters.departureTimeRange[0] && 
               departHour <= advancedFilters.departureTimeRange[1];
      });
    }
    
    // Arrival time range filter
    if (advancedFilters.arrivalTimeRange[0] !== 0 || advancedFilters.arrivalTimeRange[1] !== 24) {
      filtered = filtered.filter(flight => {
        const arriveHour = parseInt(flight.arriveTime.split(':')[0]);
        return arriveHour >= advancedFilters.arrivalTimeRange[0] && 
               arriveHour <= advancedFilters.arrivalTimeRange[1];
      });
    }
    
    // Max duration filter
    if (advancedFilters.maxDuration !== null) {
      filtered = filtered.filter(flight => {
        const match = flight.duration.match(/(\d+)h\s*(\d+)m/);
        if (match) {
          const durationMinutes = parseInt(match[1]) * 60 + parseInt(match[2]);
          return durationMinutes <= advancedFilters.maxDuration!;
        }
        return true;
      });
    }
    
    // Layover duration filters (if flight has layovers)
    if (advancedFilters.minLayoverDuration !== null || advancedFilters.maxLayoverDuration !== null) {
      filtered = filtered.filter(flight => {
        if (!flight.layovers || flight.layovers.length === 0) return true;
        
        // Check layover durations
        return flight.layovers.every(layover => {
          const match = layover.duration.match(/(\d+)h\s*(\d+)m/);
          if (match) {
            const layoverMinutes = parseInt(match[1]) * 60 + parseInt(match[2]);
            if (advancedFilters.minLayoverDuration !== null && layoverMinutes < advancedFilters.minLayoverDuration) return false;
            if (advancedFilters.maxLayoverDuration !== null && layoverMinutes > advancedFilters.maxLayoverDuration) return false;
          }
          return true;
        });
      });
    }
    
    // Note: Baggage included and refundable filters would need backend data
    // For now, we'll skip these as they're not in the current flight data structure
    
    setFilteredFlights(filtered);
  }, [flights, advancedFilters]);

  const handleFlightSelect = (flightId: string) => {
    const flight = filteredFlights.find(f => f.id === flightId);
    if (flight) {
      console.log('✈️ Flight selected, navigating to booking page:', {
        flightId: flight.id,
        flightNumber: flight.flightNumber,
        airline: flight.airline,
        price: flight.price
      });
      
      // Prepare booking data with all necessary information
      const bookingData = {
        flight: {
          id: flight.id,
          airline: flight.airline,
          flightNumber: flight.flightNumber,
          origin: flight.origin,
          destination: flight.destination,
          departTime: flight.departTime,
          arriveTime: flight.arriveTime,
          duration: flight.duration,
          price: flight.price,
          stops: flight.stops || 0,
          aircraft: flight.aircraft,
          travelClass: flight.travelClass || searchData.travelClass || 'economy',
          amenities: flight.amenities,
          layovers: flight.layovers
        },
        searchData: {
          from: searchData.from,
          to: searchData.to,
          departDate: searchData.departDate,
          returnDate: searchData.returnDate,
          passengers: searchData.passengers,
          tripType: searchData.tripType,
          travelClass: searchData.travelClass || 'economy'
        },
        timestamp: new Date().toISOString()
      };
      
      // Store in localStorage so booking page can access it
      try {
        localStorage.setItem('pendingBooking', JSON.stringify(bookingData));
        console.log('✅ Booking data stored in localStorage');
        
        // Navigate to booking page with flight ID in URL
        router.push(`/booking/new?flight=${flight.id}`);
      } catch (error) {
        console.error('❌ Error storing booking data:', error);
        // Fallback: still navigate but data might not be available
        router.push(`/booking/new?flight=${flight.id}`);
      }
    } else {
      console.error('❌ Flight not found:', flightId);
    }
  };

  const handleBookingSubmit = async (bookingData: any) => {
    setBookingLoading(true);
    
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        alert('Please log in to complete your booking.');
        return;
      }

      const bookingRequest = {
        flightId: selectedFlight?.id,
        flightData: {
          airline: selectedFlight?.airline,
          flightNumber: selectedFlight?.flightNumber,
          origin: selectedFlight?.origin || searchData.from,
          destination: selectedFlight?.destination || searchData.to,
          departureTime: selectedFlight?.departTime,
          arrivalTime: selectedFlight?.arriveTime,
          departureDate: searchData.departDate,
          duration: selectedFlight?.duration,
          aircraft: selectedFlight?.aircraft,
          class: selectedFlight?.travelClass || searchData.travelClass || 'economy'
        },
        passengers: [bookingData],
        pricing: {
          basePrice: selectedFlight?.price || 0,
          totalPrice: (selectedFlight?.price || 0) * searchData.passengers,
          currency: 'USD',
          passengers: searchData.passengers
        },
        contactInfo: {
          email: bookingData.email,
          phone: bookingData.phone
        },
        paymentInfo: {
          method: bookingData.paymentMethod || 'card',
          // Don't store sensitive payment info in real implementation
        }
      };

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(bookingRequest),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        alert(`Booking confirmed! Confirmation number: ${result.data.bookingReference}. Flight ${selectedFlight?.flightNumber} has been booked successfully.`);
        setShowBookingModal(false);
        setSelectedFlight(null);
        
        // Optionally redirect to bookings page
        // window.location.href = '/bookings';
      } else {
        throw new Error(result.error || 'Failed to create booking');
      }
    } catch (error) {
      console.error('Booking error:', error);
      alert(`Booking failed: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`);
    } finally {
      setBookingLoading(false);
    }
  };

  const handleCloseBooking = () => {
    setShowBookingModal(false);
    setSelectedFlight(null);
  };

  const sortedFlights = [...filteredFlights].sort((a, b) => {
    // Use newSortBy (from FilterSortBar) if set, otherwise fallback to old sortBy
    const activeSortOption = newSortBy !== 'best' ? newSortBy : sortBy;
    const [sortField, sortOrder] = activeSortOption.split('-');
    const isAsc = sortOrder === 'asc';
    
    // Helper function to parse duration
    const parseDuration = (duration: string) => {
      const hoursMatch = duration.match(/(\d+)h/);
      const minutesMatch = duration.match(/(\d+)m/);
      const hours = hoursMatch ? parseInt(hoursMatch[1]) : 0;
      const minutes = minutesMatch ? parseInt(minutesMatch[1]) : 0;
      return hours * 60 + minutes;
    };
    
    let compareResult = 0;
    
    // Handle 'best' sort option (combination of price and duration)
    if (activeSortOption === 'best') {
      // Best = lowest price + shortest duration combination
      // Weighted: 60% price, 40% duration
      const aPriceScore = a.price / Math.max(...filteredFlights.map(f => f.price));
      const bPriceScore = b.price / Math.max(...filteredFlights.map(f => f.price));
      const aDurationScore = parseDuration(a.duration) / Math.max(...filteredFlights.map(f => parseDuration(f.duration)));
      const bDurationScore = parseDuration(b.duration) / Math.max(...filteredFlights.map(f => parseDuration(f.duration)));
      
      const aScore = (aPriceScore * 0.6) + (aDurationScore * 0.4);
      const bScore = (bPriceScore * 0.6) + (bDurationScore * 0.4);
      
      return aScore - bScore;
    }
    
    switch (sortField) {
      case 'price':
        compareResult = a.price - b.price;
        break;
      case 'duration':
        compareResult = parseDuration(a.duration) - parseDuration(b.duration);
        break;
      case 'departure':
        compareResult = a.departTime.localeCompare(b.departTime);
        break;
      case 'arrival':
        compareResult = a.arriveTime.localeCompare(b.arriveTime);
        break;
      case 'stops':
        compareResult = (a.stops || 0) - (b.stops || 0);
        break;
      default:
        return 0;
    }
    
    return isAsc ? compareResult : -compareResult;
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

  // Handlers for advanced search components
  const handleAdvancedSearchApply = (filters: any) => {
    console.log('Advanced search filters:', filters);
    setShowAdvancedSearch(false);
  };
  
  const handleFlexibleDateSelect = (departDate: string, returnDate?: string) => {
    console.log('🗓️ Flexible dates selected:', { departDate, returnDate });
    
    // Update search data with new dates
    const newSearchData = {
      ...searchData,
      departDate,
      returnDate: returnDate || searchData.returnDate
    };
    
    // Close the modal
    setShowFlexibleDates(false);
    
    // Trigger new flight search with updated dates
    // This will cause the parent component to re-search or we can trigger fetch here
    console.log('🔄 Triggering new search with dates:', newSearchData);
    
    // Reset and fetch new flights with updated dates
    setLoading(true);
    setError(null);
    
    // Call fetchFlights with the updated search data
    // Since we can't modify searchData directly (it's a prop), we need to fetch with new params
    fetch('/api/flights/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newSearchData),
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          setFlights(data.flights);
          setDataSource(data.source);
          console.log(`✅ Loaded ${data.flights.length} flights with new dates`);
          
          // Update available airlines
          const airlines = Array.from(new Set(data.flights.map((f: Flight) => f.airline))) as string[];
          setAvailableAirlines(airlines);
        } else {
          throw new Error(data.error || 'Failed to load flights');
        }
      })
      .catch(err => {
        console.error('❌ Error fetching flights with new dates:', err);
        setError(err instanceof Error ? err.message : 'Failed to load flights with new dates');
      })
      .finally(() => {
        setLoading(false);
      });
  };
  
  const handleEnhancedSortChange = (sortOptions: EnhancedSortOptions) => {
    setEnhancedSortOptions(sortOptions);
    setSortBy(''); // Clear simple sort when using enhanced sort
  };
  
  const toggleFlightForComparison = (flightId: string) => {
    setSelectedFlightsForComparison(prev => {
      if (prev.includes(flightId)) {
        return prev.filter(id => id !== flightId);
      } else if (prev.length < 4) { // Max 4 flights for comparison
        return [...prev, flightId];
      }
      return prev;
    });
  };
  
  // New handlers for advanced filters
  const handleAdvancedFiltersChange = (filters: AdvancedFilterType) => {
    setAdvancedFilters(filters);
  };
  
  const handleRemoveFilter = (filterKey: keyof AdvancedFilterType, value?: any) => {
    const newFilters = { ...advancedFilters };
    
    switch (filterKey) {
      case 'airlines':
        if (value) {
          newFilters.airlines = newFilters.airlines.filter(a => a !== value);
        }
        break;
      case 'priceRange':
        newFilters.priceRange = [0, 5000];
        break;
      case 'maxStops':
        newFilters.maxStops = null;
        break;
      case 'directFlightsOnly':
        newFilters.directFlightsOnly = false;
        break;
      case 'departureTimeRange':
        newFilters.departureTimeRange = [0, 24];
        break;
      case 'arrivalTimeRange':
        newFilters.arrivalTimeRange = [0, 24];
        break;
      case 'maxDuration':
        newFilters.maxDuration = null;
        break;
      case 'minLayoverDuration':
        newFilters.minLayoverDuration = null;
        break;
      case 'maxLayoverDuration':
        newFilters.maxLayoverDuration = null;
        break;
      case 'baggageIncluded':
        newFilters.baggageIncluded = null;
        break;
      case 'refundable':
        newFilters.refundable = null;
        break;
    }
    
    setAdvancedFilters(newFilters);
  };
  
  const handleClearAllFilters = () => {
    setAdvancedFilters({
      priceRange: [0, 5000],
      maxStops: null,
      airlines: [],
      departureTimeRange: [0, 24],
      arrivalTimeRange: [0, 24],
      maxDuration: null,
      minLayoverDuration: null,
      maxLayoverDuration: null,
      baggageIncluded: null,
      refundable: null,
      directFlightsOnly: false,
    });
  };
  
  const handleResetFilters = () => {
    handleClearAllFilters();
  };
  
  const getActiveFilterCount = () => {
    let count = 0;
    // Price range filter (check if different from default [0, 5000])
    if (advancedFilters.priceRange[0] !== 0 || advancedFilters.priceRange[1] !== 5000) count++;
    // Stops filters
    if (advancedFilters.maxStops !== null) count++;
    if (advancedFilters.directFlightsOnly) count++;
    // Airlines filter
    if (advancedFilters.airlines.length > 0) count++;
    // Time range filters
    if (advancedFilters.departureTimeRange[0] !== 0 || advancedFilters.departureTimeRange[1] !== 24) count++;
    if (advancedFilters.arrivalTimeRange[0] !== 0 || advancedFilters.arrivalTimeRange[1] !== 24) count++;
    // Duration filter
    if (advancedFilters.maxDuration !== null) count++;
    // Layover filters
    if (advancedFilters.minLayoverDuration !== null || advancedFilters.maxLayoverDuration !== null) count++;
    // Other filters
    if (advancedFilters.baggageIncluded !== null) count++;
    if (advancedFilters.refundable !== null) count++;
    return count;
  };
  
  // Comparison modal handlers
  const handleOpenComparison = () => {
    try {
      const flightsToCompare = getFlightsForComparison();
      if (flightsToCompare.length < 2) {
        alert('Please select at least 2 flights to compare');
        return;
      }
      setShowComparisonModal(true);
    } catch (error) {
      console.error('Error opening comparison modal:', error);
      alert('Unable to open comparison. Please try again.');
    }
  };
  
  const handleCloseComparison = () => {
    setShowComparisonModal(false);
  };
  
  const handleRemoveFromComparison = (flightId: string) => {
    setSelectedFlightsForComparison(prev => prev.filter(id => id !== flightId));
  };
  
  const handleClearComparison = () => {
    setSelectedFlightsForComparison([]);
  };
  
  const handleSelectFlightFromComparison = (flight: FlightForComparison) => {
    handleFlightSelect(flight.id);
  };
  
  // Get flights for comparison modal
  const getFlightsForComparison = (): FlightForComparison[] => {
    return selectedFlightsForComparison
      .map(id => {
        const flight = flights.find(f => f.id === id);
        if (!flight) return null;
        
        // Safe amenities checking
        const getAmenityValue = (amenityType: string): boolean => {
          try {
            if (!flight.aircraft && !flight.airline) return false;
            return hasAmenity(flight.aircraft || '', flight.airline, amenityType);
          } catch (error) {
            console.warn(`Error checking amenity ${amenityType}:`, error);
            return false;
          }
        };
        
        return {
          id: flight.id,
          airline: flight.airline,
          flightNumber: flight.flightNumber,
          price: flight.price,
          currency: 'USD',
          origin: flight.origin,
          destination: flight.destination,
          departureTime: flight.departTime,
          arrivalTime: flight.arriveTime,
          duration: flight.duration,
          stops: flight.stops || 0,
          cabinClass: flight.travelClass || 'Economy',
          baggage: {
            carryOn: '1 personal item',
            checked: '1 bag (23kg)',
          },
          amenities: {
            wifi: getAmenityValue('wifi'),
            meals: getAmenityValue('meals'),
            entertainment: getAmenityValue('entertainment'),
            powerOutlets: getAmenityValue('power'),
          },
          cancellationPolicy: 'Refundable within 24 hours',
          layoverDuration: flight.layovers?.[0]?.duration,
        } as FlightForComparison;
      })
      .filter((f): f is FlightForComparison => f !== null);
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

      {/* Advanced Search Modal */}
      {showAdvancedSearch && (
        <AdvancedSearch
          isOpen={showAdvancedSearch}
          onClose={() => setShowAdvancedSearch(false)}
          onApply={handleAdvancedSearchApply}
        />
      )}
      
      {/* Flexible Date Search Modal */}
      {showFlexibleDates && (
        <FlexibleDateSearch
          origin={searchData.from}
          destination={searchData.to}
          initialDepartDate={searchData.departDate}
          initialReturnDate={searchData.returnDate}
          tripType={searchData.tripType as 'oneway' | 'roundtrip'}
          passengers={searchData.passengers}
          travelClass={searchData.travelClass || 'economy'}
          onDateSelect={handleFlexibleDateSelect}
          onClose={() => setShowFlexibleDates(false)}
        />
      )}
      
      {/* Flight Comparison Modal */}
      {showComparison && (
        <FlightComparison
          flights={flights}
          selectedFlightIds={selectedFlightsForComparison}
          onClose={() => setShowComparison(false)}
          onSelectFlight={(flightId) => {
            handleFlightSelect(flightId);
            setShowComparison(false);
          }}
        />
      )}
      
      {/* New Flight Comparison Modal */}
      {showComparisonModal && (() => {
        try {
          const comparisonFlights = getFlightsForComparison();
          return (
            <FlightComparisonModal
              flights={comparisonFlights}
              onClose={handleCloseComparison}
              onRemoveFlight={handleRemoveFromComparison}
              onSelectFlight={handleSelectFlightFromComparison}
            />
          );
        } catch (error) {
          console.error('Error rendering comparison modal:', error);
          setShowComparisonModal(false);
          return (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-lg p-6 max-w-md">
                <h3 className="text-lg font-bold text-red-600 mb-2">Comparison Error</h3>
                <p className="text-gray-700 mb-4">Unable to load flight comparison. Please try selecting flights again.</p>
                <button
                  onClick={handleCloseComparison}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Close
                </button>
              </div>
            </div>
          );
        }
      })()}
      

      {/* Main Layout with Sidebar */}
      <div className="flex">
        {/* Filter Sidebar */}
        <div className={`${showFilters ? 'w-80' : 'w-0'} transition-all duration-300 overflow-hidden md:block ${showFilters ? '' : 'hidden'} sticky top-0 h-screen overflow-y-auto bg-white border-r border-gray-200`}>
          <div className="p-4">
            <AdvancedFiltersPanel
              filters={advancedFilters}
              onChange={handleAdvancedFiltersChange}
              availableAirlines={availableAirlines}
              priceRange={[0, Math.max(...flights.map(f => f.price), 5000)]}
              onReset={handleResetFilters}
            />
          </div>
        </div>
        
        {/* Main Content */}
        <div className="flex-1">
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
                
                {/* Mobile Filter Toggle - Enhanced touch target */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="md:hidden flex items-center space-x-2 bg-blue-500 text-white px-4 py-3 rounded-lg hover:bg-blue-600 active:bg-blue-700 transition-all duration-200 transform active:scale-95 min-w-[48px] min-h-[48px] justify-center touch-manipulation"
                >
                  <Filter className="w-4 h-4" />
                  <span className="font-medium">Filters</span>
                  {showFilters && (
                    <div className="w-2 h-2 bg-white rounded-full ml-1"></div>
                  )}
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
                  <div className="text-center text-gray-600 my-1">to</div>
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

            {/* Filter Sort Bar */}
            {!loading && !error && flights.length > 0 && (
              <div className="mb-6">
                <FilterSortBar
                  resultCount={filteredFlights.length}
                  activeFilterCount={getActiveFilterCount()}
                  sortBy={newSortBy}
                  viewMode={viewMode}
                  onSortChange={setNewSortBy}
                  onViewModeChange={setViewMode}
                  onToggleFilters={() => setShowFilters(!showFilters)}
                  filtersVisible={showFilters}
                />
              </div>
            )}
            
            {/* Flight Filter Chips */}
            {!loading && !error && getActiveFilterCount() > 0 && (
              <div className="mb-6">
                <FlightFilterChips
                  filters={advancedFilters}
                  onRemoveFilter={handleRemoveFilter}
                  onClearAll={handleClearAllFilters}
                />
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
                {/* Advanced Search Tools */}
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <button
                    onClick={() => setShowAdvancedSearch(true)}
                    className="flex items-center space-x-2 px-3 py-2 text-sm font-medium border-2 border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 text-gray-700 hover:text-blue-600 transition-all duration-200 transform hover:scale-105 min-w-[44px] min-h-[44px] justify-center"
                  >
                    <Settings className="w-4 h-4" />
                    <span className="hidden sm:inline">Advanced</span>
                  </button>
                  
                  <button
                    onClick={() => setShowFlexibleDates(true)}
                    className="flex items-center space-x-2 px-3 py-2 text-sm font-medium border-2 border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 text-gray-700 hover:text-green-600 transition-all duration-200 transform hover:scale-105 min-w-[44px] min-h-[44px] justify-center"
                  >
                    <Calendar className="w-4 h-4" />
                    <span className="hidden sm:inline">Flexible Dates</span>
                  </button>
                  
                  <button
                    onClick={() => setShowComparison(true)}
                    disabled={selectedFlightsForComparison.length < 2}
                    className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium border-2 rounded-lg transition-all duration-200 transform min-w-[44px] min-h-[44px] justify-center ${
                      selectedFlightsForComparison.length >= 2 
                        ? 'border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:border-blue-400 hover:scale-105' 
                        : 'border-gray-200 text-gray-500 cursor-not-allowed bg-gray-50'
                    }`}
                  >
                    <GitCompare className="w-4 h-4" />
                    <span className="hidden sm:inline">Compare ({selectedFlightsForComparison.length})</span>
                    <span className="sm:hidden">({selectedFlightsForComparison.length})</span>
                  </button>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Filter className="w-4 h-4" />
                    <span className="text-sm font-medium">Sort by:</span>
                  </div>
                  <div className="relative">
                    <select
                      value={sortBy}
                      onChange={(e) => handleOldSortChange(e.target.value)}
                      className="appearance-none bg-white border-2 border-gray-200 rounded-lg px-4 py-2 pr-8 text-sm font-medium text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-300 transition-colors cursor-pointer min-w-[180px]"
                    >
                    <optgroup label="Price">
                      <option value="price-asc">Price: Low to High</option>
                      <option value="price-desc">Price: High to Low</option>
                    </optgroup>
                    <optgroup label="Duration">
                      <option value="duration-asc">Duration: Shortest First</option>
                      <option value="duration-desc">Duration: Longest First</option>
                    </optgroup>
                    <optgroup label="Time">
                      <option value="departure-asc">Departure: Earliest First</option>
                      <option value="departure-desc">Departure: Latest First</option>
                      <option value="arrival-asc">Arrival: Earliest First</option>
                      <option value="arrival-desc">Arrival: Latest First</option>
                    </optgroup>
                    <optgroup label="Stops">
                      <option value="stops-asc">Stops: Non-stop First</option>
                      <option value="stops-desc">Stops: Most Connections</option>
                    </optgroup>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Loading State */}
            {loading && !isRetrying && (
              <>
                <div className="text-center mb-6">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
                  <p className="text-gray-600 text-lg">Searching for the best flights...</p>
                  <p className="text-sm text-gray-500 mt-2">
                    This may take a few moments while we check live prices
                  </p>
                </div>
                <FlightResultsSkeleton />
              </>
            )}

            {/* Error State */}
            {error && !loading && (
              <div className="text-center py-12">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-lg mx-auto">
                  <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                  <p className="text-red-600 text-lg font-semibold mb-2">
                    {error.includes('timeout') ? 'Request Timed Out' : 
                     error.includes('airports must be different') ? 'Invalid Airport Selection' :
                     'Search Error'}
                  </p>
                  <p className="text-red-700 mb-4">{error}</p>
                  
                  {/* Special handling for same airport error */}
                  {error.includes('airports must be different') && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 text-left">
                      <h4 className="font-semibold text-blue-800 mb-2">How to fix this:</h4>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>• Make sure your origin and destination cities are different</li>
                        <li>• Double-check the airport codes you selected</li>
                        <li>• Use the search suggestions to select valid airports</li>
                      </ul>
                    </div>
                  )}
                  
                  {retryCount > 0 && (
                    <p className="text-sm text-red-600 mb-4">
                      Retry attempt {retryCount} failed
                    </p>
                  )}
                  
                  <div className="flex justify-center space-x-3">
                    {error.includes('airports must be different') ? (
                      // Show only "Go Back" button for airport validation errors
                      <button
                        onClick={onBack}
                        className="bg-blue-500 text-white px-8 py-3 rounded-md hover:bg-blue-600 active:bg-blue-700 transition-colors flex items-center space-x-2 font-semibold"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Go Back to Search</span>
                      </button>
                    ) : (
                      // Show retry and modify buttons for other errors
                      <>
                        <button
                          onClick={() => fetchFlights(true)}
                          disabled={isRetrying}
                          className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                        >
                          {isRetrying ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>Retrying...</span>
                            </>
                          ) : (
                            <>
                              <RefreshCw className="w-4 h-4" />
                              <span>Try Again</span>
                            </>
                          )}
                        </button>
                        <button
                          onClick={onBack}
                          className="bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-gray-700 transition-colors"
                        >
                          Modify Search
                        </button>
                      </>
                    )}
                  </div>
                  
                  <div className="mt-4 text-xs text-gray-600">
                    <p>Tips:</p>
                    <ul className="text-left mt-2 space-y-1">
                      <li>• Check your internet connection</li>
                      <li>• Try searching for different dates or routes</li>
                      <li>• If the problem persists, contact support</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Enhanced Sorting Component */}
            {!loading && !error && flights.length > 0 && (
              <div className="mb-6">
                <EnhancedSorting
                  onSortChange={handleEnhancedSortChange}
                  initialSort={enhancedSortOptions}
                  className="mb-4"
                />
              </div>
            )}

            {/* Flight Results */}
            {!loading && !error && flights.length > 0 && (
              <div className="space-y-4">
                {sortedFlights.map((flight) => (
                  <div key={flight.id} className="relative mb-4">
                    <FlightCard
                      flight={flight}
                      onSelect={handleFlightSelect}
                      searchData={searchData}
                    />
                    
                    {/* Compare Button - positioned at top-right corner */}
                    <div className="absolute top-4 right-4 z-10">
                      <CompareFlightButton
                        flightId={flight.id}
                        isSelected={selectedFlightsForComparison.includes(flight.id)}
                        onToggle={toggleFlightForComparison}
                        maxReached={selectedFlightsForComparison.length >= 4}
                      />
                    </div>
                  </div>
                ))}
                
                {/* Comparison Summary */}
                {selectedFlightsForComparison.length > 0 && (
                  <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40">
                    <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-4 py-3 flex items-center space-x-4">
                      <span className="text-sm text-gray-600">
                        {selectedFlightsForComparison.length} flight{selectedFlightsForComparison.length !== 1 ? 's' : ''} selected for comparison
                      </span>
                      <button
                        onClick={() => setSelectedFlightsForComparison([])}
                        className="text-sm text-red-600 hover:text-red-800"
                      >
                        Clear
                      </button>
                      <button
                        onClick={() => setShowComparison(true)}
                        disabled={selectedFlightsForComparison.length < 2}
                        className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 active:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Compare Now
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* No Results */}
            {!loading && !error && flights.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No flights found for your search criteria.</p>
                <p className="text-sm text-gray-600 mt-2">
                  Try adjusting your search dates or destinations
                </p>
                <button
                  onClick={onBack}
                  className="mt-4 bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 active:bg-blue-700 transition-colors"
                >
                  Modify Search
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Keyboard Navigation Help */}
      <KeyboardNavigationHelp />
    </div>
  );
}
