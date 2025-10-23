'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { MapPin, Plane, X, Loader2, Search, Navigation } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import { useLocationPermission } from '@/hooks/useLocationPermission';
import { Airport } from '@/app/api/airports/search/route';

interface AirportSearchInputProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (airportCode: string, airport?: Airport) => void;
  error?: string;
  disabled?: boolean;
  className?: string;
}

// Get country flag emoji from country code
const getCountryFlag = (countryCode: string): string => {
  if (countryCode.length !== 2) return '🌍';
  
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 0x1F1E6 + char.charCodeAt(0) - 'A'.charCodeAt(0));
  
  return String.fromCodePoint(...codePoints);
};

// Format distance display
const formatDistance = (distance?: number): string => {
  if (!distance) return '';
  if (distance < 10) return `${distance}km`;
  if (distance < 100) return `${distance}km`;
  return `${Math.round(distance)}km`;
};

export default function AirportSearchInput({ 
  label, 
  placeholder, 
  value, 
  onChange, 
  error,
  disabled = false,
  className = ''
}: AirportSearchInputProps) {
  const [query, setQuery] = useState('');
  const [displayValue, setDisplayValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [airports, setAirports] = useState<Airport[]>([]);
  const [nearbyAirports, setNearbyAirports] = useState<Airport[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedAirport, setSelectedAirport] = useState<Airport | null>(null);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [hasSearched, setHasSearched] = useState(false);
  
  // Use the location permission hook
  const { location: savedLocation, requestLocation, hasValidLocation } = useLocationPermission();
  
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Debounce search query
  const [debouncedQuery] = useDebounce(query, 300);
  
  // Sync display value with external value changes
  useEffect(() => {
    if (value && !selectedAirport) {
      setDisplayValue(value);
    }
  }, [value, selectedAirport]);

  // Search airports when debounced query changes
  useEffect(() => {
    if (debouncedQuery.length >= 2) {
      searchAirports(debouncedQuery);
      setHasSearched(true);
    } else {
      setAirports([]);
      if (debouncedQuery.length === 0) {
        setHasSearched(false);
      }
    }
  }, [debouncedQuery]);

  // Don't auto-request location on mount - wait for user action

  // Handle clicking outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Detect user's current location - only when requested
  const detectUserLocation = useCallback(async () => {
    setLoading(true);
    
    try {
      // Use the location permission hook to get location
      const position = await requestLocation();
      
      if (!position) {
        console.log('Could not get location');
        setLoading(false);
        return;
      }
      
      // Get nearby airports
      const response = await fetch('/api/airports/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          radius: 100,
          limit: 5
        })
      });
      
      const data = await response.json();
      if (data.success) {
        setNearbyAirports(data.airports);
        setIsOpen(true); // Open dropdown to show nearby airports
        setQuery(''); // Clear query to show nearby airports
      }
    } catch (error) {
      console.log('Error getting nearby airports:', error);
    } finally {
      setLoading(false);
    }
  }, [requestLocation]);

  // Search airports using API
  const searchAirports = useCallback(async (searchQuery: string) => {
    if (!searchQuery || searchQuery.length < 2) return;
    
    setLoading(true);
    
    try {
      const params = new URLSearchParams({
        q: searchQuery,
        limit: '10'
      });
      
      // Include user location for distance sorting if available
      if (savedLocation) {
        params.append('lat', savedLocation.latitude.toString());
        params.append('lng', savedLocation.longitude.toString());
      }
      
      const response = await fetch(`/api/airports/search?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setAirports(data.airports);
      } else {
        console.error('Airport search failed:', data.error);
        setAirports([]);
      }
    } catch (error) {
      console.error('Airport search error:', error);
      setAirports([]);
    } finally {
      setLoading(false);
    }
  }, [savedLocation]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    setDisplayValue(newQuery);
    setIsOpen(true);
    setHighlightedIndex(-1);
    
    // If input is cleared, reset selection
    if (newQuery === '') {
      setSelectedAirport(null);
      onChange('');
      setHasSearched(false);
    } else {
      // Clear previous selection when typing
      if (selectedAirport && newQuery !== `${selectedAirport.iataCode} - ${selectedAirport.city}`) {
        setSelectedAirport(null);
      }
    }
  };

  // Handle airport selection
  const handleAirportSelect = (airport: Airport) => {
    setSelectedAirport(airport);
    const displayText = `${airport.iataCode} - ${airport.city}`;
    setQuery(displayText);
    setDisplayValue(displayText);
    setIsOpen(false);
    setHighlightedIndex(-1);
    setHasSearched(false);
    onChange(airport.iataCode, airport);
  };

  // Clear selection
  const handleClearSelection = () => {
    setSelectedAirport(null);
    setQuery('');
    setDisplayValue('');
    setIsOpen(false);
    setHighlightedIndex(-1);
    setHasSearched(false);
    onChange('');
    inputRef.current?.focus();
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const allResults = nearbyAirports.length > 0 && query.length < 2 
      ? nearbyAirports 
      : airports;
      
    if (!isOpen || allResults.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < allResults.length - 1 ? prev + 1 : 0
        );
        break;
        
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : allResults.length - 1
        );
        break;
        
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0) {
          handleAirportSelect(allResults[highlightedIndex]);
        }
        break;
        
      case 'Escape':
        setIsOpen(false);
        setHighlightedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  // Handle focus
  const handleFocus = () => {
    setIsOpen(true);
  };

  // Current location handler
  const handleCurrentLocation = () => {
    if (nearbyAirports.length > 0) {
      handleAirportSelect(nearbyAirports[0]);
    } else {
      detectUserLocation();
    }
  };

  // Determine what to show in dropdown
  const showNearbyAirports = nearbyAirports.length > 0 && query.length < 2;
  const displayAirports = showNearbyAirports ? nearbyAirports : airports;

  return (
    <div className="relative w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <MapPin className="inline w-4 h-4 mr-1" />
          {label}
        </label>
      )}
      
      <div className="relative w-full">
        {/* Input Field */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          
          <input
            ref={inputRef}
            type="text"
            value={displayValue}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            autoComplete="off"
            className={`w-full pl-10 pr-20 py-4 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-gray-900 font-medium hover:border-gray-300 ${
              error 
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                : selectedAirport 
                  ? 'border-green-300 focus:border-green-500 focus:ring-green-500'
                  : 'border-gray-200'
            } ${disabled ? 'bg-gray-50 cursor-not-allowed text-gray-500' : 'bg-white'} ${className}`}
          />
          
          {/* Right side buttons */}
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 space-x-1">
            {/* Clear button */}
            {selectedAirport && (
              <button
                type="button"
                onClick={handleClearSelection}
                className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors duration-200"
                title="Clear selection"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            
            {/* Current Location Button */}
            {nearbyAirports.length > 0 && !loading && (
              <button
                type="button"
                onClick={handleCurrentLocation}
                className="p-1 text-blue-500 hover:text-blue-600 rounded transition-colors duration-200"
                title="Use current location"
              >
                <Navigation className="w-4 h-4" />
              </button>
            )}
            
            {/* Loading Spinner */}
            {loading && (
              <div className="p-1">
                <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Enhanced Error Message */}
      {error && (
        <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg animate-in slide-in-from-top-1 duration-200">
          <div className="flex items-start space-x-2">
            <div className="flex-shrink-0">
              <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center mt-0.5">
                <span className="text-white text-xs font-bold">!</span>
              </div>
            </div>
            <div>
              <p className="text-red-700 text-sm font-medium mb-1">Airport Selection Required</p>
              <p className="text-red-600 text-xs">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Dropdown */}
      {isOpen && (displayAirports.length > 0 || loading || (hasSearched && query.length >= 2)) && (
        <div 
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 bg-white shadow-2xl rounded-xl mt-2 max-h-80 overflow-y-auto border border-gray-100 backdrop-blur-sm"
          style={{
            zIndex: 9999,
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(59, 130, 246, 0.05)'
          }}
        >
          {/* Nearby Airports Section */}
          {showNearbyAirports && (
            <div className="sticky top-0 bg-blue-50 px-4 py-3 border-b border-blue-100">
              <h4 className="text-sm font-semibold text-blue-800 flex items-center">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                  <Navigation className="w-3 h-3 text-blue-500" />
                </div>
                📍 Nearby Airports
              </h4>
            </div>
          )}
          
          {/* Airport Results */}
          {displayAirports.map((airport, index) => (
            <div
              key={`${airport.iataCode}-${index}`}
              onClick={() => handleAirportSelect(airport)}
              className={`group flex items-center p-4 cursor-pointer transition-colors duration-200 ${
                index === highlightedIndex 
                  ? 'bg-blue-50 border-l-4 border-blue-500' 
                  : 'hover:bg-gray-50 border-l-4 border-transparent hover:border-blue-200'
              }`}
            >
              {/* Country Flag */}
              <div className="mr-4">
                <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-xl shadow-sm border border-gray-100 transition-shadow duration-200">
                  {getCountryFlag(airport.countryCode)}
                </div>
              </div>
              
              {/* Airport Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="font-bold text-lg text-gray-900 group-hover:text-blue-500 transition-colors duration-200">
                    {airport.iataCode}
                  </span>
                  <span className="px-2 py-1 bg-gray-100 rounded text-xs font-medium text-gray-600">
                    {airport.type === 'airport' ? 'Airport' : 'City'}
                  </span>
                  {airport.distance && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                      {formatDistance(airport.distance)}
                    </span>
                  )}
                </div>
                
                <div className="text-sm text-gray-600 truncate mb-1">
                  {airport.name}
                </div>
                
                <div className="text-xs text-gray-500">
                  {airport.city}, {airport.country}
                </div>
              </div>
              
              {/* Arrow */}
              <div className="ml-4">
                <div className="w-10 h-10 rounded-lg bg-gray-100 group-hover:bg-blue-500 flex items-center justify-center shadow-sm transition-colors duration-200">
                  <span className="text-lg text-gray-600 group-hover:text-white font-bold transition-colors duration-200">→</span>
                </div>
              </div>
            </div>
          ))}
          
          {/* No Results */}
          {!loading && displayAirports.length === 0 && hasSearched && query.length >= 2 && (
            <div className="p-6 text-center text-gray-500">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <Plane className="w-8 h-8 text-gray-400" />
              </div>
              <p className="font-medium mb-1">No airports found</p>
              <p className="text-sm">Try searching by city name, airport name, or IATA code</p>
              <div className="mt-3 text-xs text-gray-400">
                Search examples: "London", "LHR", or "Heathrow"
              </div>
            </div>
          )}
          
          {/* Loading State */}
          {loading && (
            <div className="p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-blue-50 rounded-full flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              </div>
              <p className="font-medium text-gray-700 mb-1">Searching airports...</p>
              <p className="text-sm text-gray-500">Finding the best matches for "{query}"</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}