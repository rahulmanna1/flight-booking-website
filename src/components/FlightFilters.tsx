'use client';

import { useState, useEffect } from 'react';
import { 
  Filter, 
  X, 
  Clock, 
  Plane, 
  DollarSign, 
  Star, 
  Wifi, 
  Coffee,
  ChevronDown,
  ChevronUp,
  RotateCcw
} from 'lucide-react';
import { useCurrency } from '@/contexts/CurrencyContext';

// Flight interface for type safety
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
}

// Filter interface
export interface FlightFilters {
  priceRange: [number, number];
  airlines: string[];
  stops: number[];
  departureTime: string[];
  travelClass: string[];
  aircraftTypes: string[];
  duration: [number, number]; // in minutes
  amenities: string[];
}

interface FlightFiltersProps {
  flights: Flight[];
  onFiltersChange: (filters: FlightFilters) => void;
  isVisible: boolean;
  onToggleVisibility: () => void;
  userTravelClass?: string; // User's original search travel class
}

// Time periods for departure filtering
const TIME_PERIODS = [
  { id: 'early-morning', label: 'Early Morning', time: '5:00 AM - 8:00 AM', icon: '🌅' },
  { id: 'morning', label: 'Morning', time: '8:00 AM - 12:00 PM', icon: '☀️' },
  { id: 'afternoon', label: 'Afternoon', time: '12:00 PM - 6:00 PM', icon: '🌤️' },
  { id: 'evening', label: 'Evening', time: '6:00 PM - 10:00 PM', icon: '🌆' },
  { id: 'night', label: 'Night', time: '10:00 PM - 5:00 AM', icon: '🌙' },
];

// Travel class options
const TRAVEL_CLASSES = [
  { id: 'economy', label: 'Economy', description: 'Best value', icon: '💺' },
  { id: 'premium-economy', label: 'Premium Economy', description: 'Extra comfort', icon: '✈️' },
  { id: 'business', label: 'Business', description: 'Premium service', icon: '🥂' },
  { id: 'first', label: 'First Class', description: 'Ultimate luxury', icon: '👑' },
];

// Amenities options
const AMENITIES = [
  { id: 'wifi', label: 'Wi-Fi', icon: <Wifi className="w-4 h-4" /> },
  { id: 'entertainment', label: 'Entertainment', icon: '📺' },
  { id: 'meals', label: 'Meals Included', icon: <Coffee className="w-4 h-4" /> },
  { id: 'power', label: 'Power Outlets', icon: '🔌' },
  { id: 'extra-legroom', label: 'Extra Legroom', icon: '📏' },
];

export default function FlightFilters({ 
  flights, 
  onFiltersChange, 
  isVisible, 
  onToggleVisibility,
  userTravelClass
}: FlightFiltersProps) {
  const { formatPrice } = useCurrency();
  
  // Get price range from flights
  const minPrice = flights.length > 0 ? Math.min(...flights.map(f => f.price)) : 0;
  const maxPrice = flights.length > 0 ? Math.max(...flights.map(f => f.price)) : 5000;
  
  // Get unique airlines
  const uniqueAirlines = Array.from(new Set(flights.map(f => f.airline))).sort();
  
  // Get duration range in minutes
  const getDurationInMinutes = (duration: string) => {
    const match = duration.match(/(\d+)h\s*(\d+)m/);
    if (match) {
      return parseInt(match[1]) * 60 + parseInt(match[2]);
    }
    return 0;
  };
  
  const minDuration = flights.length > 0 ? Math.min(...flights.map(f => getDurationInMinutes(f.duration))) : 0;
  const maxDuration = flights.length > 0 ? Math.max(...flights.map(f => getDurationInMinutes(f.duration))) : 1440;
  
  // Get available travel classes from actual flight data
  const availableTravelClasses = flights.length > 0 
    ? Array.from(new Set(flights.map(f => f.travelClass || 'economy')))
    : ['economy'];
    
  // Filter state - use user's search travel class or show all if no user preference
  const initialTravelClass = userTravelClass 
    ? [userTravelClass] 
    : availableTravelClasses.length > 1 
      ? [] // Show all classes if multiple are available
      : ['economy']; // Default to economy if only one class available
      
  const [filters, setFilters] = useState<FlightFilters>({
    priceRange: [minPrice, maxPrice],
    airlines: [],
    stops: [],
    departureTime: [],
    travelClass: initialTravelClass,
    aircraftTypes: [],
    duration: [minDuration, maxDuration],
    amenities: [],
  });
  
  // Expanded sections state
  const [expandedSections, setExpandedSections] = useState({
    price: true,
    stops: true,
    airlines: true,
    departure: false,
    class: true,
    duration: false,
    amenities: false,
  });
  
  // Update filters when flights change - preserve user's travel class selection
  useEffect(() => {
    const currentTravelClass = userTravelClass ? [userTravelClass] : ['economy'];
    setFilters(prev => ({
      ...prev,
      priceRange: [minPrice, maxPrice],
      duration: [minDuration, maxDuration],
      // Preserve user's travel class selection when flights data changes
      travelClass: prev.travelClass.length > 0 ? prev.travelClass : currentTravelClass,
    }));
  }, [flights, userTravelClass]);
  
  // Apply filters
  useEffect(() => {
    onFiltersChange(filters);
  }, [filters, onFiltersChange]);
  
  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };
  
  const handlePriceChange = (index: number, value: number) => {
    const newRange: [number, number] = [...filters.priceRange] as [number, number];
    newRange[index] = value;
    setFilters(prev => ({ ...prev, priceRange: newRange }));
  };
  
  const handleDurationChange = (index: number, value: number) => {
    const newRange: [number, number] = [...filters.duration] as [number, number];
    newRange[index] = value;
    setFilters(prev => ({ ...prev, duration: newRange }));
  };
  
  const toggleArrayFilter = (filterType: keyof FlightFilters, value: string | number) => {
    setFilters(prev => {
      const currentArray = prev[filterType] as (string | number)[];
      const newArray = currentArray.includes(value)
        ? currentArray.filter(item => item !== value)
        : [...currentArray, value];
      return { ...prev, [filterType]: newArray };
    });
  };
  
  const resetFilters = () => {
    const resetTravelClass = userTravelClass 
      ? [userTravelClass] 
      : availableTravelClasses.length > 1 
        ? [] // Show all classes if multiple are available
        : ['economy']; // Default to economy if only one class available
        
    setFilters({
      priceRange: [minPrice, maxPrice],
      airlines: [],
      stops: [],
      departureTime: [],
      travelClass: resetTravelClass,
      aircraftTypes: [],
      duration: [minDuration, maxDuration],
      amenities: [],
    });
  };
  
  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.priceRange[0] > minPrice || filters.priceRange[1] < maxPrice) count++;
    if (filters.airlines.length > 0) count++;
    if (filters.stops.length > 0) count++;
    if (filters.departureTime.length > 0) count++;
    
    // Only count as active filter if different from user's original search
    const originalClass = userTravelClass || 'economy';
    if (filters.travelClass.length !== 1 || filters.travelClass[0] !== originalClass) count++;
    
    if (filters.aircraftTypes.length > 0) count++;
    if (filters.duration[0] > minDuration || filters.duration[1] < maxDuration) count++;
    if (filters.amenities.length > 0) count++;
    return count;
  };
  
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };
  
  if (!isVisible) {
    return (
      <button
        onClick={onToggleVisibility}
        className="fixed top-4 left-4 z-50 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors md:hidden"
      >
        <Filter className="w-5 h-5" />
        {getActiveFiltersCount() > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center">
            {getActiveFiltersCount()}
          </span>
        )}
      </button>
    );
  }
  
  return (
    <div className="bg-white border-r border-gray-200 h-full overflow-y-auto">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-blue-600" />
            <h2 className="font-semibold text-lg text-gray-900">Filters</h2>
            {getActiveFiltersCount() > 0 && (
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                {getActiveFiltersCount()}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={resetFilters}
              className="text-gray-500 hover:text-gray-700 p-1"
              title="Reset all filters"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={onToggleVisibility}
              className="text-gray-500 hover:text-gray-700 p-1 md:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
      
      <div className="p-4 space-y-6">
        {/* Price Range */}
        <div className="filter-section">
          <button
            onClick={() => toggleSection('price')}
            className="flex items-center justify-between w-full text-left"
          >
            <div className="flex items-center space-x-2">
              <DollarSign className="w-4 h-4 text-gray-600" />
              <h3 className="font-medium text-gray-900">Price Range</h3>
            </div>
            {expandedSections.price ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          
          {expandedSections.price && (
            <div className="mt-3 space-y-3">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>{formatPrice(filters.priceRange[0])}</span>
                <span>{formatPrice(filters.priceRange[1])}</span>
              </div>
              <div className="space-y-2">
                <input
                  type="range"
                  min={minPrice}
                  max={maxPrice}
                  step={50}
                  value={filters.priceRange[0]}
                  onChange={(e) => handlePriceChange(0, parseInt(e.target.value))}
                  className="w-full accent-blue-600"
                />
                <input
                  type="range"
                  min={minPrice}
                  max={maxPrice}
                  step={50}
                  value={filters.priceRange[1]}
                  onChange={(e) => handlePriceChange(1, parseInt(e.target.value))}
                  className="w-full accent-blue-600"
                />
              </div>
            </div>
          )}
        </div>
        
        {/* Stops */}
        <div className="filter-section">
          <button
            onClick={() => toggleSection('stops')}
            className="flex items-center justify-between w-full text-left"
          >
            <div className="flex items-center space-x-2">
              <Plane className="w-4 h-4 text-gray-600" />
              <h3 className="font-medium text-gray-900">Stops</h3>
            </div>
            {expandedSections.stops ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          
          {expandedSections.stops && (
            <div className="mt-3 space-y-2">
              {[
                { value: 0, label: 'Direct flights only', badge: 'Fastest' },
                { value: 1, label: '1 stop', badge: 'Common' },
                { value: 2, label: '2+ stops', badge: 'Cheapest' },
              ].map((stop) => (
                <label key={stop.value} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.stops.includes(stop.value)}
                    onChange={() => toggleArrayFilter('stops', stop.value)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="flex-1 text-sm text-gray-700">{stop.label}</span>
                  <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                    {stop.badge}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>
        
        {/* Travel Class */}
        <div className="filter-section">
          <button
            onClick={() => toggleSection('class')}
            className="flex items-center justify-between w-full text-left"
          >
            <div className="flex items-center space-x-2">
              <Star className="w-4 h-4 text-gray-600" />
              <h3 className="font-medium text-gray-900">Travel Class</h3>
            </div>
            {expandedSections.class ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          
          {expandedSections.class && (
            <div className="mt-3 space-y-2">
              {TRAVEL_CLASSES.map((travelClass) => (
                <label key={travelClass.id} className="flex items-center space-x-3 cursor-pointer p-2 rounded hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={filters.travelClass.includes(travelClass.id)}
                    onChange={() => toggleArrayFilter('travelClass', travelClass.id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-lg">{travelClass.icon}</span>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-700">{travelClass.label}</div>
                    <div className="text-xs text-gray-500">{travelClass.description}</div>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>
        
        {/* Airlines */}
        <div className="filter-section">
          <button
            onClick={() => toggleSection('airlines')}
            className="flex items-center justify-between w-full text-left"
          >
            <div className="flex items-center space-x-2">
              <Plane className="w-4 h-4 text-gray-600" />
              <h3 className="font-medium text-gray-900">Airlines</h3>
            </div>
            {expandedSections.airlines ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          
          {expandedSections.airlines && (
            <div className="mt-3 space-y-2 max-h-48 overflow-y-auto">
              {uniqueAirlines.map((airline) => {
                const flightCount = flights.filter(f => f.airline === airline).length;
                return (
                  <label key={airline} className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.airlines.includes(airline)}
                      onChange={() => toggleArrayFilter('airlines', airline)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="flex-1 text-sm text-gray-700">{airline}</span>
                    <span className="text-xs text-gray-500">({flightCount})</span>
                  </label>
                );
              })}
            </div>
          )}
        </div>
        
        {/* Departure Time */}
        <div className="filter-section">
          <button
            onClick={() => toggleSection('departure')}
            className="flex items-center justify-between w-full text-left"
          >
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-gray-600" />
              <h3 className="font-medium text-gray-900">Departure Time</h3>
            </div>
            {expandedSections.departure ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          
          {expandedSections.departure && (
            <div className="mt-3 space-y-2">
              {TIME_PERIODS.map((period) => (
                <label key={period.id} className="flex items-center space-x-3 cursor-pointer p-2 rounded hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={filters.departureTime.includes(period.id)}
                    onChange={() => toggleArrayFilter('departureTime', period.id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-lg">{period.icon}</span>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-700">{period.label}</div>
                    <div className="text-xs text-gray-500">{period.time}</div>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>
        
        {/* Flight Duration */}
        <div className="filter-section">
          <button
            onClick={() => toggleSection('duration')}
            className="flex items-center justify-between w-full text-left"
          >
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-gray-600" />
              <h3 className="font-medium text-gray-900">Flight Duration</h3>
            </div>
            {expandedSections.duration ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          
          {expandedSections.duration && (
            <div className="mt-3 space-y-3">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>{formatDuration(filters.duration[0])}</span>
                <span>{formatDuration(filters.duration[1])}</span>
              </div>
              <input
                type="range"
                min={minDuration}
                max={maxDuration}
                step={30}
                value={filters.duration[1]}
                onChange={(e) => handleDurationChange(1, parseInt(e.target.value))}
                className="w-full accent-blue-600"
              />
            </div>
          )}
        </div>
        
        {/* Amenities */}
        <div className="filter-section">
          <button
            onClick={() => toggleSection('amenities')}
            className="flex items-center justify-between w-full text-left"
          >
            <div className="flex items-center space-x-2">
              <Wifi className="w-4 h-4 text-gray-600" />
              <h3 className="font-medium text-gray-900">Amenities</h3>
            </div>
            {expandedSections.amenities ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          
          {expandedSections.amenities && (
            <div className="mt-3 space-y-2">
              {AMENITIES.map((amenity) => (
                <label key={amenity.id} className="flex items-center space-x-3 cursor-pointer p-2 rounded hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={filters.amenities.includes(amenity.id)}
                    onChange={() => toggleArrayFilter('amenities', amenity.id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-gray-600">{amenity.icon}</span>
                  <span className="text-sm text-gray-700">{amenity.label}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}