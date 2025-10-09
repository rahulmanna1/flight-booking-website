// Advanced Search Context
// Manages comprehensive flight search state, filters, sorting, and real-time updates

'use client';

import React, { createContext, useContext, useReducer, useEffect, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCurrency } from './CurrencyContext';

// Enhanced Flight Interface with additional metadata
export interface EnhancedFlight {
  id: string;
  airline: string;
  flightNumber: string;
  origin: {
    code: string;
    name: string;
    city: string;
    country: string;
    terminal?: string;
  };
  destination: {
    code: string;
    name: string;
    city: string;
    country: string;
    terminal?: string;
  };
  departure: {
    dateTime: string;
    localTime: string;
    timezone: string;
  };
  arrival: {
    dateTime: string;
    localTime: string;
    timezone: string;
  };
  duration: string;
  stops: number;
  layovers?: {
    airport: string;
    duration: string;
    city: string;
  }[];
  aircraft: {
    type: string;
    model: string;
    configuration?: string;
  };
  price: {
    amount: number;
    currency: string;
    fareType: string;
    lastUpdated: string;
  };
  amenities: {
    wifi: boolean;
    powerOutlets: boolean;
    entertainment: boolean;
    meals: boolean;
    beverages: boolean;
    extraLegroom: boolean;
  };
  baggage: {
    carryOn: {
      included: boolean;
      weight?: number;
      dimensions?: string;
    };
    checked: {
      included: boolean;
      weight?: number;
      fee?: number;
    };
  };
  booking: {
    available: boolean;
    seatsLeft?: number;
    fareBasis: string;
    cancellationPolicy: string;
    changePolicy: string;
  };
  environmental: {
    carbonEmissions: number;
    fuelEfficiency: string;
    sustainabilityScore: number;
  };
  metadata: {
    source: string;
    lastUpdated: string;
    priceHistory?: { price: number; timestamp: string }[];
    reliability: number;
  };
}

// Enhanced Search Filters
export interface AdvancedSearchFilters {
  // Basic filters
  priceRange: [number, number];
  maxStops: number;
  airlines: string[];
  avoidAirlines: string[];
  
  // Time filters
  departureTimeRange: [string, string]; // "HH:MM" format
  arrivalTimeRange: [string, string];
  maxLayoverDuration: number; // minutes
  
  // Advanced filters
  aircraft: string[];
  avoidAircraft: string[];
  alliances: string[];
  
  // Amenities
  wifiRequired: boolean;
  mealsRequired: boolean;
  entertainmentRequired: boolean;
  powerOutletsRequired: boolean;
  extraLegroomRequired: boolean;
  
  // Baggage
  includedBaggageOnly: boolean;
  maxBaggageFee: number;
  
  // Environmental
  lowCarbonOnly: boolean;
  maxCarbonEmissions: number;
  sustainableAirlinesOnly: boolean;
  
  // Flexibility
  flexibleDates: boolean;
  dateRange: number; // days +/-
  nearbyAirports: boolean;
  
  // Special requirements
  wheelchairAccessible: boolean;
  petFriendly: boolean;
  unaccompaniedMinor: boolean;
}

// Sort Options
export type SortOption = 
  | 'price-asc' 
  | 'price-desc' 
  | 'duration-asc' 
  | 'duration-desc'
  | 'departure-asc' 
  | 'departure-desc'
  | 'arrival-asc'
  | 'arrival-desc'
  | 'stops-asc'
  | 'stops-desc'
  | 'airline'
  | 'environmental'
  | 'popularity'
  | 'best-value';

// Search State
export interface AdvancedSearchState {
  // Search parameters
  searchParams: {
    from: string;
    to: string;
    departDate: string;
    returnDate?: string;
    passengers: number;
    tripType: 'roundtrip' | 'oneway';
    travelClass: 'economy' | 'premium-economy' | 'business' | 'first';
  } | null;
  
  // Results
  flights: EnhancedFlight[];
  filteredFlights: EnhancedFlight[];
  totalResults: number;
  
  // UI State
  loading: boolean;
  error: string | null;
  lastSearchTime: string | null;
  
  // Filters and sorting
  filters: AdvancedSearchFilters;
  sorting: SortOption;
  
  // Pagination
  currentPage: number;
  pageSize: number;
  
  // Real-time updates
  priceAlerts: boolean;
  autoRefresh: boolean;
  refreshInterval: number; // seconds
  
  // View preferences
  viewMode: 'list' | 'grid' | 'compare';
  comparisonFlights: string[]; // flight IDs
  
  // Search history and favorites
  recentSearches: any[];
  favoriteFlights: string[];
  priceWatchers: string[];
}

// Action Types
type AdvancedSearchAction =
  | { type: 'SET_SEARCH_PARAMS'; payload: AdvancedSearchState['searchParams'] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_FLIGHTS'; payload: { flights: EnhancedFlight[]; totalResults: number } }
  | { type: 'UPDATE_FILTERS'; payload: Partial<AdvancedSearchFilters> }
  | { type: 'SET_SORTING'; payload: SortOption }
  | { type: 'SET_PAGE'; payload: number }
  | { type: 'SET_VIEW_MODE'; payload: 'list' | 'grid' | 'compare' }
  | { type: 'TOGGLE_COMPARISON'; payload: string }
  | { type: 'CLEAR_COMPARISON' }
  | { type: 'TOGGLE_FAVORITE'; payload: string }
  | { type: 'TOGGLE_PRICE_WATCHER'; payload: string }
  | { type: 'UPDATE_FLIGHT_PRICE'; payload: { flightId: string; newPrice: number } }
  | { type: 'RESET_FILTERS' }
  | { type: 'APPLY_QUICK_FILTER'; payload: string };

// Default state
const defaultFilters: AdvancedSearchFilters = {
  priceRange: [0, 10000],
  maxStops: 3,
  airlines: [],
  avoidAirlines: [],
  departureTimeRange: ['00:00', '23:59'],
  arrivalTimeRange: ['00:00', '23:59'],
  maxLayoverDuration: 720, // 12 hours
  aircraft: [],
  avoidAircraft: [],
  alliances: [],
  wifiRequired: false,
  mealsRequired: false,
  entertainmentRequired: false,
  powerOutletsRequired: false,
  extraLegroomRequired: false,
  includedBaggageOnly: false,
  maxBaggageFee: 200,
  lowCarbonOnly: false,
  maxCarbonEmissions: 1000,
  sustainableAirlinesOnly: false,
  flexibleDates: false,
  dateRange: 3,
  nearbyAirports: false,
  wheelchairAccessible: false,
  petFriendly: false,
  unaccompaniedMinor: false,
};

const initialState: AdvancedSearchState = {
  searchParams: null,
  flights: [],
  filteredFlights: [],
  totalResults: 0,
  loading: false,
  error: null,
  lastSearchTime: null,
  filters: defaultFilters,
  sorting: 'best-value',
  currentPage: 1,
  pageSize: 20,
  priceAlerts: false,
  autoRefresh: false,
  refreshInterval: 300, // 5 minutes
  viewMode: 'list',
  comparisonFlights: [],
  recentSearches: [],
  favoriteFlights: [],
  priceWatchers: [],
};

// Reducer
function advancedSearchReducer(
  state: AdvancedSearchState,
  action: AdvancedSearchAction
): AdvancedSearchState {
  switch (action.type) {
    case 'SET_SEARCH_PARAMS':
      return {
        ...state,
        searchParams: action.payload,
        currentPage: 1,
        comparisonFlights: [],
      };

    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
        error: action.payload ? null : state.error,
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false,
      };

    case 'SET_FLIGHTS':
      return {
        ...state,
        flights: action.payload.flights,
        filteredFlights: action.payload.flights,
        totalResults: action.payload.totalResults,
        loading: false,
        error: null,
        lastSearchTime: new Date().toISOString(),
      };

    case 'UPDATE_FILTERS':
      const newFilters = { ...state.filters, ...action.payload };
      return {
        ...state,
        filters: newFilters,
        filteredFlights: applyFilters(state.flights, newFilters),
        currentPage: 1,
      };

    case 'SET_SORTING':
      return {
        ...state,
        sorting: action.payload,
        filteredFlights: applySorting(state.filteredFlights, action.payload),
        currentPage: 1,
      };

    case 'SET_PAGE':
      return {
        ...state,
        currentPage: action.payload,
      };

    case 'SET_VIEW_MODE':
      return {
        ...state,
        viewMode: action.payload,
        comparisonFlights: action.payload !== 'compare' ? [] : state.comparisonFlights,
      };

    case 'TOGGLE_COMPARISON':
      const flightId = action.payload;
      const isInComparison = state.comparisonFlights.includes(flightId);
      return {
        ...state,
        comparisonFlights: isInComparison
          ? state.comparisonFlights.filter(id => id !== flightId)
          : state.comparisonFlights.length < 4
          ? [...state.comparisonFlights, flightId]
          : state.comparisonFlights,
      };

    case 'CLEAR_COMPARISON':
      return {
        ...state,
        comparisonFlights: [],
      };

    case 'TOGGLE_FAVORITE':
      const favoriteFlightId = action.payload;
      return {
        ...state,
        favoriteFlights: state.favoriteFlights.includes(favoriteFlightId)
          ? state.favoriteFlights.filter(id => id !== favoriteFlightId)
          : [...state.favoriteFlights, favoriteFlightId],
      };

    case 'TOGGLE_PRICE_WATCHER':
      const watcherFlightId = action.payload;
      return {
        ...state,
        priceWatchers: state.priceWatchers.includes(watcherFlightId)
          ? state.priceWatchers.filter(id => id !== watcherFlightId)
          : [...state.priceWatchers, watcherFlightId],
      };

    case 'UPDATE_FLIGHT_PRICE':
      const updatedFlights = state.flights.map(flight =>
        flight.id === action.payload.flightId
          ? {
              ...flight,
              price: {
                ...flight.price,
                amount: action.payload.newPrice,
                lastUpdated: new Date().toISOString(),
              },
              metadata: {
                ...flight.metadata,
                priceHistory: [
                  ...(flight.metadata.priceHistory || []),
                  {
                    price: action.payload.newPrice,
                    timestamp: new Date().toISOString(),
                  },
                ],
              },
            }
          : flight
      );
      return {
        ...state,
        flights: updatedFlights,
        filteredFlights: applyFilters(updatedFlights, state.filters),
      };

    case 'RESET_FILTERS':
      return {
        ...state,
        filters: defaultFilters,
        filteredFlights: state.flights,
        currentPage: 1,
      };

    case 'APPLY_QUICK_FILTER':
      const quickFilter = action.payload;
      let quickFilters: Partial<AdvancedSearchFilters> = {};

      switch (quickFilter) {
        case 'direct-only':
          quickFilters.maxStops = 0;
          break;
        case 'under-300':
          quickFilters.priceRange = [0, 300];
          break;
        case 'morning-departure':
          quickFilters.departureTimeRange = ['06:00', '12:00'];
          break;
        case 'wifi-required':
          quickFilters.wifiRequired = true;
          break;
        case 'low-carbon':
          quickFilters.lowCarbonOnly = true;
          break;
        default:
          break;
      }

      const appliedFilters = { ...state.filters, ...quickFilters };
      return {
        ...state,
        filters: appliedFilters,
        filteredFlights: applyFilters(state.flights, appliedFilters),
        currentPage: 1,
      };

    default:
      return state;
  }
}

// Filter and sort functions
function applyFilters(flights: EnhancedFlight[], filters: AdvancedSearchFilters): EnhancedFlight[] {
  return flights.filter(flight => {
    // Price range
    if (flight.price.amount < filters.priceRange[0] || flight.price.amount > filters.priceRange[1]) {
      return false;
    }

    // Max stops
    if (flight.stops > filters.maxStops) {
      return false;
    }

    // Airlines
    if (filters.airlines.length > 0 && !filters.airlines.includes(flight.airline)) {
      return false;
    }
    
    if (filters.avoidAirlines.includes(flight.airline)) {
      return false;
    }

    // Time filters
    const departTime = flight.departure.localTime;
    const arrivalTime = flight.arrival.localTime;
    if (departTime < filters.departureTimeRange[0] || departTime > filters.departureTimeRange[1]) {
      return false;
    }
    if (arrivalTime < filters.arrivalTimeRange[0] || arrivalTime > filters.arrivalTimeRange[1]) {
      return false;
    }

    // Amenities
    if (filters.wifiRequired && !flight.amenities.wifi) return false;
    if (filters.mealsRequired && !flight.amenities.meals) return false;
    if (filters.entertainmentRequired && !flight.amenities.entertainment) return false;
    if (filters.powerOutletsRequired && !flight.amenities.powerOutlets) return false;
    if (filters.extraLegroomRequired && !flight.amenities.extraLegroom) return false;

    // Environmental filters
    if (filters.lowCarbonOnly && flight.environmental.carbonEmissions > 200) return false;
    if (flight.environmental.carbonEmissions > filters.maxCarbonEmissions) return false;

    return true;
  });
}

function applySorting(flights: EnhancedFlight[], sortOption: SortOption): EnhancedFlight[] {
  const sortedFlights = [...flights];

  switch (sortOption) {
    case 'price-asc':
      return sortedFlights.sort((a, b) => a.price.amount - b.price.amount);
    case 'price-desc':
      return sortedFlights.sort((a, b) => b.price.amount - a.price.amount);
    case 'duration-asc':
      return sortedFlights.sort((a, b) => parseDuration(a.duration) - parseDuration(b.duration));
    case 'duration-desc':
      return sortedFlights.sort((a, b) => parseDuration(b.duration) - parseDuration(a.duration));
    case 'departure-asc':
      return sortedFlights.sort((a, b) => a.departure.dateTime.localeCompare(b.departure.dateTime));
    case 'departure-desc':
      return sortedFlights.sort((a, b) => b.departure.dateTime.localeCompare(a.departure.dateTime));
    case 'stops-asc':
      return sortedFlights.sort((a, b) => a.stops - b.stops);
    case 'environmental':
      return sortedFlights.sort((a, b) => a.environmental.carbonEmissions - b.environmental.carbonEmissions);
    case 'best-value':
      return sortedFlights.sort((a, b) => {
        const aScore = (a.price.amount / 1000) + (a.stops * 0.5) + (parseDuration(a.duration) / 60);
        const bScore = (b.price.amount / 1000) + (b.stops * 0.5) + (parseDuration(b.duration) / 60);
        return aScore - bScore;
      });
    default:
      return sortedFlights;
  }
}

function parseDuration(duration: string): number {
  const hours = duration.match(/(\d+)h/)?.[1] || '0';
  const minutes = duration.match(/(\d+)m/)?.[1] || '0';
  return parseInt(hours) * 60 + parseInt(minutes);
}

// Context
interface AdvancedSearchContextValue {
  state: AdvancedSearchState;
  searchFlights: (params: AdvancedSearchState['searchParams']) => Promise<void>;
  updateFilters: (filters: Partial<AdvancedSearchFilters>) => void;
  setSorting: (sorting: SortOption) => void;
  setPage: (page: number) => void;
  setViewMode: (mode: 'list' | 'grid' | 'compare') => void;
  toggleComparison: (flightId: string) => void;
  clearComparison: () => void;
  toggleFavorite: (flightId: string) => void;
  togglePriceWatcher: (flightId: string) => void;
  resetFilters: () => void;
  applyQuickFilter: (filter: string) => void;
  refreshPrices: () => Promise<void>;
}

const AdvancedSearchContext = createContext<AdvancedSearchContextValue | undefined>(undefined);

// Provider component
export function AdvancedSearchProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(advancedSearchReducer, initialState);
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { currency } = useCurrency();

  // Search flights function
  const searchFlights = useCallback(async (params: AdvancedSearchState['searchParams']) => {
    if (!params) return;

    dispatch({ type: 'SET_SEARCH_PARAMS', payload: params });
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      const response = await fetch('/api/flights/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        // Transform flights to enhanced format
        const enhancedFlights = data.flights.map(transformToEnhancedFlight);
        
        dispatch({
          type: 'SET_FLIGHTS',
          payload: {
            flights: enhancedFlights,
            totalResults: data.count,
          },
        });
      } else {
        throw new Error(data.error || 'Search failed');
      }
    } catch (error: any) {
      console.error('Search error:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  }, []);

  // Auto-refresh functionality
  useEffect(() => {
    if (state.autoRefresh && state.priceWatchers.length > 0) {
      refreshTimeoutRef.current = setTimeout(async () => {
        await refreshPrices();
      }, state.refreshInterval * 1000);

      return () => {
        if (refreshTimeoutRef.current) {
          clearTimeout(refreshTimeoutRef.current);
        }
      };
    }
  }, [state.autoRefresh, state.priceWatchers, state.refreshInterval]);

  // Refresh prices for watched flights
  const refreshPrices = useCallback(async () => {
    if (state.priceWatchers.length === 0) return;

    try {
      // This would typically call a specific price refresh API
      console.log('🔄 Refreshing prices for watched flights...');
      
      // Simulate price updates (in real app, call actual API)
      state.priceWatchers.forEach(flightId => {
        const currentFlight = state.flights.find(f => f.id === flightId);
        if (currentFlight) {
          const priceChange = (Math.random() - 0.5) * 100; // ±$50 random change
          const newPrice = Math.max(50, currentFlight.price.amount + priceChange);
          
          dispatch({
            type: 'UPDATE_FLIGHT_PRICE',
            payload: { flightId, newPrice: Math.round(newPrice) },
          });
        }
      });
    } catch (error) {
      console.error('Price refresh error:', error);
    }
  }, [state.priceWatchers, state.flights]);

  // Context value
  const contextValue: AdvancedSearchContextValue = {
    state,
    searchFlights,
    updateFilters: (filters) => dispatch({ type: 'UPDATE_FILTERS', payload: filters }),
    setSorting: (sorting) => dispatch({ type: 'SET_SORTING', payload: sorting }),
    setPage: (page) => dispatch({ type: 'SET_PAGE', payload: page }),
    setViewMode: (mode) => dispatch({ type: 'SET_VIEW_MODE', payload: mode }),
    toggleComparison: (flightId) => dispatch({ type: 'TOGGLE_COMPARISON', payload: flightId }),
    clearComparison: () => dispatch({ type: 'CLEAR_COMPARISON' }),
    toggleFavorite: (flightId) => dispatch({ type: 'TOGGLE_FAVORITE', payload: flightId }),
    togglePriceWatcher: (flightId) => dispatch({ type: 'TOGGLE_PRICE_WATCHER', payload: flightId }),
    resetFilters: () => dispatch({ type: 'RESET_FILTERS' }),
    applyQuickFilter: (filter) => dispatch({ type: 'APPLY_QUICK_FILTER', payload: filter }),
    refreshPrices,
  };

  return (
    <AdvancedSearchContext.Provider value={contextValue}>
      {children}
    </AdvancedSearchContext.Provider>
  );
}

// Hook to use the context
export function useAdvancedSearch() {
  const context = useContext(AdvancedSearchContext);
  if (context === undefined) {
    throw new Error('useAdvancedSearch must be used within an AdvancedSearchProvider');
  }
  return context;
}

// Transform function (placeholder - would map from your existing flight format)
function transformToEnhancedFlight(flight: any): EnhancedFlight {
  return {
    id: flight.id || `flight_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    airline: flight.airline || 'Unknown Airline',
    flightNumber: flight.flightNumber || 'XX000',
    origin: {
      code: flight.origin || flight.from,
      name: flight.originName || 'Unknown Airport',
      city: flight.originCity || '',
      country: flight.originCountry || '',
      terminal: flight.originTerminal,
    },
    destination: {
      code: flight.destination || flight.to,
      name: flight.destinationName || 'Unknown Airport',
      city: flight.destinationCity || '',
      country: flight.destinationCountry || '',
      terminal: flight.destinationTerminal,
    },
    departure: {
      dateTime: flight.departureTime || flight.departure,
      localTime: flight.departureTime?.split('T')[1]?.substr(0, 5) || '00:00',
      timezone: flight.departureTimezone || 'UTC',
    },
    arrival: {
      dateTime: flight.arrivalTime || flight.arrival,
      localTime: flight.arrivalTime?.split('T')[1]?.substr(0, 5) || '00:00',
      timezone: flight.arrivalTimezone || 'UTC',
    },
    duration: flight.duration || '0h 0m',
    stops: flight.stops || 0,
    layovers: flight.layovers || [],
    aircraft: {
      type: flight.aircraft || 'Unknown',
      model: flight.aircraftModel || '',
      configuration: flight.aircraftConfig,
    },
    price: {
      amount: flight.price || 0,
      currency: flight.currency || 'USD',
      fareType: flight.fareType || 'Economy',
      lastUpdated: new Date().toISOString(),
    },
    amenities: {
      wifi: flight.amenities?.wifi || false,
      powerOutlets: flight.amenities?.power || false,
      entertainment: flight.amenities?.entertainment || false,
      meals: flight.amenities?.meals || false,
      beverages: flight.amenities?.beverages || false,
      extraLegroom: flight.amenities?.extraLegroom || false,
    },
    baggage: {
      carryOn: {
        included: flight.baggage?.carryOn?.included || true,
        weight: flight.baggage?.carryOn?.weight,
      },
      checked: {
        included: flight.baggage?.checked?.included || false,
        weight: flight.baggage?.checked?.weight,
        fee: flight.baggage?.checked?.fee,
      },
    },
    booking: {
      available: flight.available || true,
      seatsLeft: flight.seatsLeft,
      fareBasis: flight.fareBasis || '',
      cancellationPolicy: flight.cancellationPolicy || 'Standard',
      changePolicy: flight.changePolicy || 'Standard',
    },
    environmental: {
      carbonEmissions: flight.carbonEmissions || Math.floor(Math.random() * 500 + 100),
      fuelEfficiency: flight.fuelEfficiency || 'Standard',
      sustainabilityScore: flight.sustainabilityScore || Math.floor(Math.random() * 100),
    },
    metadata: {
      source: flight.source || 'API',
      lastUpdated: new Date().toISOString(),
      priceHistory: [],
      reliability: flight.reliability || 0.95,
    },
  };
}

export default AdvancedSearchContext;