// Advanced Filters Component
// Comprehensive filtering interface for flight search with real-time filtering

'use client';

import React, { useState } from 'react';
import {
  Filter,
  X,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Clock,
  Plane,
  Leaf,
  Star,
  Wifi,
  Utensils,
  Zap,
  Briefcase,
  Users,
  ShieldCheck,
  DollarSign,
} from 'lucide-react';
import { useAdvancedSearch, AdvancedSearchFilters } from '../../contexts/AdvancedSearchContext';
import { useCurrency } from '../../contexts/CurrencyContext';

interface AdvancedFiltersProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

const AIRLINE_LIST = [
  'American Airlines', 'Delta Air Lines', 'United Airlines', 'Southwest Airlines',
  'British Airways', 'Lufthansa', 'Air France', 'KLM', 'Emirates', 'Qatar Airways',
  'Singapore Airlines', 'Cathay Pacific', 'Japan Airlines', 'Korean Air',
  'Turkish Airlines', 'Etihad Airways', 'Virgin Atlantic', 'Air Canada',
];

const AIRCRAFT_TYPES = [
  'Boeing 737', 'Boeing 777', 'Boeing 787', 'Airbus A320', 'Airbus A330',
  'Airbus A350', 'Airbus A380', 'Boeing 747', 'Boeing 767', 'Embraer E-Jets',
];

const AIRLINE_ALLIANCES = [
  { id: 'star', name: 'Star Alliance' },
  { id: 'oneworld', name: 'Oneworld' },
  { id: 'skyteam', name: 'SkyTeam' },
];

export default function AdvancedFilters({ isOpen, onClose, className = '' }: AdvancedFiltersProps) {
  const { state, updateFilters, resetFilters, applyQuickFilter } = useAdvancedSearch();
  const { formatPrice } = useCurrency();
  
  const [expandedSections, setExpandedSections] = useState({
    price: true,
    stops: true,
    airlines: false,
    times: false,
    aircraft: false,
    amenities: false,
    baggage: false,
    environmental: false,
    special: false,
  });

  const [localFilters, setLocalFilters] = useState<AdvancedSearchFilters>(state.filters);

  if (!isOpen) return null;

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleFilterChange = (key: keyof AdvancedSearchFilters, value: any) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    updateFilters({ [key]: value });
  };

  const handleArrayToggle = (key: keyof AdvancedSearchFilters, value: string) => {
    const currentArray = localFilters[key] as string[];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    
    handleFilterChange(key, newArray);
  };

  const handleReset = () => {
    setLocalFilters(state.filters);
    resetFilters();
  };

  const getActiveFiltersCount = (): number => {
    let count = 0;
    
    // Price range (not default)
    if (localFilters.priceRange[0] !== 0 || localFilters.priceRange[1] !== 10000) count++;
    
    // Max stops (not default)
    if (localFilters.maxStops !== 3) count++;
    
    // Airlines selected
    if (localFilters.airlines.length > 0) count++;
    
    // Time restrictions
    if (localFilters.departureTimeRange[0] !== '00:00' || localFilters.departureTimeRange[1] !== '23:59') count++;
    
    // Amenities
    if (localFilters.wifiRequired) count++;
    if (localFilters.mealsRequired) count++;
    if (localFilters.entertainmentRequired) count++;
    if (localFilters.powerOutletsRequired) count++;
    
    // Environmental
    if (localFilters.lowCarbonOnly) count++;
    if (localFilters.sustainableAirlinesOnly) count++;
    
    return count;
  };

  const quickFilters = [
    { id: 'direct-only', label: 'Direct Only', icon: Plane },
    { id: 'under-300', label: 'Under $300', icon: DollarSign },
    { id: 'morning-departure', label: 'Morning', icon: Clock },
    { id: 'wifi-required', label: 'WiFi', icon: Wifi },
    { id: 'low-carbon', label: 'Eco-Friendly', icon: Leaf },
  ];

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 ${className}`}>
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Filter className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Advanced Filters</h2>
            {getActiveFiltersCount() > 0 && (
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-medium">
                {getActiveFiltersCount()} active
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleReset}
              className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Filters */}
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Quick Filters</h3>
          <div className="flex flex-wrap gap-2">
            {quickFilters.map(filter => (
              <button
                key={filter.id}
                onClick={() => applyQuickFilter(filter.id)}
                className="flex items-center space-x-2 px-3 py-2 bg-gray-100 hover:bg-blue-100 text-gray-700 hover:text-blue-700 rounded-full transition-colors text-sm"
              >
                <filter.icon className="w-4 h-4" />
                <span>{filter.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto max-h-[60vh] p-6 space-y-6">
          
          {/* Price Range */}
          <FilterSection
            title="Price Range"
            icon={DollarSign}
            expanded={expandedSections.price}
            onToggle={() => toggleSection('price')}
          >
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <label className="block text-sm text-gray-600 mb-1">Min Price</label>
                  <input
                    type="range"
                    min={0}
                    max={10000}
                    value={localFilters.priceRange[0]}
                    onChange={(e) => handleFilterChange('priceRange', [parseInt(e.target.value), localFilters.priceRange[1]])}
                    className="w-full"
                  />
                  <div className="text-center text-sm font-medium text-gray-900 mt-1">
                    {formatPrice(localFilters.priceRange[0])}
                  </div>
                </div>
                <div className="flex-1">
                  <label className="block text-sm text-gray-600 mb-1">Max Price</label>
                  <input
                    type="range"
                    min={0}
                    max={10000}
                    value={localFilters.priceRange[1]}
                    onChange={(e) => handleFilterChange('priceRange', [localFilters.priceRange[0], parseInt(e.target.value)])}
                    className="w-full"
                  />
                  <div className="text-center text-sm font-medium text-gray-900 mt-1">
                    {formatPrice(localFilters.priceRange[1])}
                  </div>
                </div>
              </div>
            </div>
          </FilterSection>

          {/* Stops */}
          <FilterSection
            title="Stops"
            icon={Plane}
            expanded={expandedSections.stops}
            onToggle={() => toggleSection('stops')}
          >
            <div className="grid grid-cols-4 gap-2">
              {[0, 1, 2, 3].map(stops => (
                <button
                  key={stops}
                  onClick={() => handleFilterChange('maxStops', stops)}
                  className={`p-3 text-center rounded-lg border transition-colors ${
                    localFilters.maxStops === stops
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-semibold">
                    {stops === 0 ? 'Direct' : stops === 3 ? '3+' : stops}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {stops === 0 ? 'Non-stop' : `${stops} stop${stops > 1 ? 's' : ''}`}
                  </div>
                </button>
              ))}
            </div>
          </FilterSection>

          {/* Airlines */}
          <FilterSection
            title="Airlines"
            icon={Star}
            expanded={expandedSections.airlines}
            onToggle={() => toggleSection('airlines')}
          >
            <div className="space-y-4">
              {/* Alliances */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Alliances</h4>
                <div className="grid grid-cols-3 gap-2">
                  {AIRLINE_ALLIANCES.map(alliance => (
                    <button
                      key={alliance.id}
                      onClick={() => handleArrayToggle('alliances', alliance.id)}
                      className={`p-2 text-sm text-center rounded border transition-colors ${
                        localFilters.alliances.includes(alliance.id)
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {alliance.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Individual Airlines */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Preferred Airlines</h4>
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {AIRLINE_LIST.map(airline => (
                    <label key={airline} className="flex items-center space-x-2 text-sm">
                      <input
                        type="checkbox"
                        checked={localFilters.airlines.includes(airline)}
                        onChange={() => handleArrayToggle('airlines', airline)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span>{airline}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </FilterSection>

          {/* Departure Times */}
          <FilterSection
            title="Departure Times"
            icon={Clock}
            expanded={expandedSections.times}
            onToggle={() => toggleSection('times')}
          >
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-2">Earliest Departure</label>
                  <input
                    type="time"
                    value={localFilters.departureTimeRange[0]}
                    onChange={(e) => handleFilterChange('departureTimeRange', [e.target.value, localFilters.departureTimeRange[1]])}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-2">Latest Departure</label>
                  <input
                    type="time"
                    value={localFilters.departureTimeRange[1]}
                    onChange={(e) => handleFilterChange('departureTimeRange', [localFilters.departureTimeRange[0], e.target.value])}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm text-gray-600 mb-2">
                  Max Layover Duration: {Math.floor(localFilters.maxLayoverDuration / 60)}h {localFilters.maxLayoverDuration % 60}m
                </label>
                <input
                  type="range"
                  min={30}
                  max={1440}
                  step={30}
                  value={localFilters.maxLayoverDuration}
                  onChange={(e) => handleFilterChange('maxLayoverDuration', parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          </FilterSection>

          {/* Aircraft */}
          <FilterSection
            title="Aircraft"
            icon={Plane}
            expanded={expandedSections.aircraft}
            onToggle={() => toggleSection('aircraft')}
          >
            <div className="max-h-40 overflow-y-auto space-y-1">
              {AIRCRAFT_TYPES.map(aircraft => (
                <label key={aircraft} className="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    checked={localFilters.aircraft.includes(aircraft)}
                    onChange={() => handleArrayToggle('aircraft', aircraft)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>{aircraft}</span>
                </label>
              ))}
            </div>
          </FilterSection>

          {/* Amenities */}
          <FilterSection
            title="Amenities"
            icon={Star}
            expanded={expandedSections.amenities}
            onToggle={() => toggleSection('amenities')}
          >
            <div className="grid grid-cols-2 gap-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={localFilters.wifiRequired}
                  onChange={(e) => handleFilterChange('wifiRequired', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <Wifi className="w-4 h-4" />
                <span className="text-sm">WiFi Required</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={localFilters.mealsRequired}
                  onChange={(e) => handleFilterChange('mealsRequired', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <Utensils className="w-4 h-4" />
                <span className="text-sm">Meals Included</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={localFilters.entertainmentRequired}
                  onChange={(e) => handleFilterChange('entertainmentRequired', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm">Entertainment</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={localFilters.powerOutletsRequired}
                  onChange={(e) => handleFilterChange('powerOutletsRequired', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <Zap className="w-4 h-4" />
                <span className="text-sm">Power Outlets</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={localFilters.extraLegroomRequired}
                  onChange={(e) => handleFilterChange('extraLegroomRequired', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm">Extra Legroom</span>
              </label>
            </div>
          </FilterSection>

          {/* Baggage */}
          <FilterSection
            title="Baggage"
            icon={Briefcase}
            expanded={expandedSections.baggage}
            onToggle={() => toggleSection('baggage')}
          >
            <div className="space-y-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={localFilters.includedBaggageOnly}
                  onChange={(e) => handleFilterChange('includedBaggageOnly', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm">Include only flights with free checked bags</span>
              </label>
              
              <div>
                <label className="block text-sm text-gray-600 mb-2">
                  Max Baggage Fee: {formatPrice(localFilters.maxBaggageFee)}
                </label>
                <input
                  type="range"
                  min={0}
                  max={500}
                  step={25}
                  value={localFilters.maxBaggageFee}
                  onChange={(e) => handleFilterChange('maxBaggageFee', parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          </FilterSection>

          {/* Environmental */}
          <FilterSection
            title="Environmental"
            icon={Leaf}
            expanded={expandedSections.environmental}
            onToggle={() => toggleSection('environmental')}
          >
            <div className="space-y-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={localFilters.lowCarbonOnly}
                  onChange={(e) => handleFilterChange('lowCarbonOnly', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm">Low carbon flights only</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={localFilters.sustainableAirlinesOnly}
                  onChange={(e) => handleFilterChange('sustainableAirlinesOnly', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm">Sustainable airlines only</span>
              </label>
              
              <div>
                <label className="block text-sm text-gray-600 mb-2">
                  Max CO₂ Emissions: {localFilters.maxCarbonEmissions}kg
                </label>
                <input
                  type="range"
                  min={50}
                  max={1000}
                  step={25}
                  value={localFilters.maxCarbonEmissions}
                  onChange={(e) => handleFilterChange('maxCarbonEmissions', parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          </FilterSection>

          {/* Special Requirements */}
          <FilterSection
            title="Special Requirements"
            icon={ShieldCheck}
            expanded={expandedSections.special}
            onToggle={() => toggleSection('special')}
          >
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={localFilters.wheelchairAccessible}
                  onChange={(e) => handleFilterChange('wheelchairAccessible', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm">Wheelchair accessible</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={localFilters.petFriendly}
                  onChange={(e) => handleFilterChange('petFriendly', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm">Pet-friendly</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={localFilters.unaccompaniedMinor}
                  onChange={(e) => handleFilterChange('unaccompaniedMinor', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm">Unaccompanied minor service</span>
              </label>
            </div>
          </FilterSection>

        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            {state.filteredFlights.length} of {state.flights.length} flights match your filters
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Filter Section Component
interface FilterSectionProps {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function FilterSection({ title, icon: Icon, expanded, onToggle, children }: FilterSectionProps) {
  return (
    <div className="border border-gray-200 rounded-lg">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center space-x-3">
          <Icon className="w-5 h-5 text-gray-600" />
          <span className="font-medium text-gray-900">{title}</span>
        </div>
        {expanded ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </button>
      {expanded && (
        <div className="px-4 pb-4 border-t border-gray-100">
          {children}
        </div>
      )}
    </div>
  );
}