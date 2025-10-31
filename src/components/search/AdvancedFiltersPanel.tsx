'use client';

import { useState } from 'react';
import { 
  SlidersHorizontal, 
  X, 
  Plane, 
  Clock, 
  DollarSign, 
  Briefcase,
  Calendar,
  MapPin,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export interface FlightFilters {
  // Price
  priceRange: [number, number];
  
  // Stops
  directOnly: boolean;
  maxStops: number | null;
  
  // Airlines
  selectedAirlines: string[];
  excludedAirlines: string[];
  
  // Times
  departureTimeRange: [number, number]; // Hours in 24h format
  arrivalTimeRange: [number, number];
  
  // Duration
  maxDuration: number | null; // in hours
  
  // Baggage
  checkedBaggage: boolean;
  carryOnOnly: boolean;
  
  // Layover
  minLayoverTime: number; // in minutes
  maxLayoverTime: number; // in minutes
  
  // Cabin class
  cabinClass: string[];
  
  // Other
  refundable: boolean;
  changeable: boolean;
}

interface AdvancedFiltersPanelProps {
  filters: FlightFilters;
  onFiltersChange: (filters: FlightFilters) => void;
  availableAirlines?: string[];
  priceRange?: [number, number];
}

export default function AdvancedFiltersPanel({
  filters,
  onFiltersChange,
  availableAirlines = ['AA', 'DL', 'UA', 'BA', 'LH', 'AF', 'EK', 'QR'],
  priceRange = [0, 2000]
}: AdvancedFiltersPanelProps) {
  const [expandedSections, setExpandedSections] = useState({
    price: true,
    stops: true,
    airlines: false,
    times: false,
    duration: false,
    baggage: false,
    other: false,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const updateFilter = (key: keyof FlightFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const resetFilters = () => {
    onFiltersChange({
      priceRange: priceRange,
      directOnly: false,
      maxStops: null,
      selectedAirlines: [],
      excludedAirlines: [],
      departureTimeRange: [0, 24],
      arrivalTimeRange: [0, 24],
      maxDuration: null,
      checkedBaggage: false,
      carryOnOnly: false,
      minLayoverTime: 0,
      maxLayoverTime: 1440,
      cabinClass: [],
      refundable: false,
      changeable: false,
    });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.directOnly) count++;
    if (filters.maxStops !== null) count++;
    if (filters.selectedAirlines.length > 0) count++;
    if (filters.priceRange[0] !== priceRange[0] || filters.priceRange[1] !== priceRange[1]) count++;
    if (filters.departureTimeRange[0] !== 0 || filters.departureTimeRange[1] !== 24) count++;
    if (filters.maxDuration !== null) count++;
    if (filters.checkedBaggage || filters.carryOnOnly) count++;
    if (filters.refundable || filters.changeable) count++;
    return count;
  };

  const formatTime = (hour: number) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:00 ${period}`;
  };

  const FilterSection = ({ 
    title, 
    icon: Icon, 
    section, 
    children 
  }: { 
    title: string; 
    icon: any; 
    section: keyof typeof expandedSections; 
    children: React.ReactNode 
  }) => (
    <div className="border-b border-gray-200 last:border-b-0">
      <button
        onClick={() => toggleSection(section)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Icon className="w-5 h-5 text-gray-600" />
          <span className="font-semibold text-gray-900">{title}</span>
        </div>
        {expandedSections[section] ? (
          <ChevronUp className="w-5 h-5 text-gray-500" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-500" />
        )}
      </button>
      {expandedSections[section] && (
        <div className="px-4 pb-4">
          {children}
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-white">
            <SlidersHorizontal className="w-5 h-5" />
            <h3 className="font-semibold">Filters</h3>
            {getActiveFiltersCount() > 0 && (
              <span className="bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-full text-xs">
                {getActiveFiltersCount()}
              </span>
            )}
          </div>
          <button
            onClick={resetFilters}
            className="text-white hover:text-blue-100 text-sm font-medium transition-colors"
          >
            Reset All
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
        {/* Price Range */}
        <FilterSection title="Price Range" icon={DollarSign} section="price">
          <div className="space-y-3">
            <div className="flex justify-between text-sm text-gray-600">
              <span>${filters.priceRange[0]}</span>
              <span>${filters.priceRange[1]}</span>
            </div>
            <input
              type="range"
              min={priceRange[0]}
              max={priceRange[1]}
              value={filters.priceRange[1]}
              onChange={(e) => updateFilter('priceRange', [filters.priceRange[0], parseInt(e.target.value)])}
              className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>
        </FilterSection>

        {/* Stops */}
        <FilterSection title="Stops" icon={Plane} section="stops">
          <div className="space-y-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.directOnly}
                onChange={(e) => updateFilter('directOnly', e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span className="text-sm text-gray-700">Direct flights only</span>
            </label>
            
            {!filters.directOnly && (
              <div>
                <label className="block text-sm text-gray-700 mb-2">Max stops</label>
                <select
                  value={filters.maxStops || ''}
                  onChange={(e) => updateFilter('maxStops', e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="">Any</option>
                  <option value="1">1 stop max</option>
                  <option value="2">2 stops max</option>
                </select>
              </div>
            )}
          </div>
        </FilterSection>

        {/* Airlines */}
        <FilterSection title="Airlines" icon={Plane} section="airlines">
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {availableAirlines.map(airline => (
              <label key={airline} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                <input
                  type="checkbox"
                  checked={filters.selectedAirlines.includes(airline)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      updateFilter('selectedAirlines', [...filters.selectedAirlines, airline]);
                    } else {
                      updateFilter('selectedAirlines', filters.selectedAirlines.filter(a => a !== airline));
                    }
                  }}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span className="text-sm text-gray-700">{airline}</span>
              </label>
            ))}
          </div>
        </FilterSection>

        {/* Departure Time */}
        <FilterSection title="Departure Time" icon={Clock} section="times">
          <div className="space-y-3">
            <div className="flex justify-between text-sm text-gray-600">
              <span>{formatTime(filters.departureTimeRange[0])}</span>
              <span>{formatTime(filters.departureTimeRange[1])}</span>
            </div>
            <div className="space-y-2">
              <input
                type="range"
                min="0"
                max="24"
                value={filters.departureTimeRange[0]}
                onChange={(e) => updateFilter('departureTimeRange', [parseInt(e.target.value), filters.departureTimeRange[1]])}
                className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <input
                type="range"
                min="0"
                max="24"
                value={filters.departureTimeRange[1]}
                onChange={(e) => updateFilter('departureTimeRange', [filters.departureTimeRange[0], parseInt(e.target.value)])}
                className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>
          </div>
        </FilterSection>

        {/* Duration */}
        <FilterSection title="Flight Duration" icon={Calendar} section="duration">
          <div className="space-y-3">
            <label className="block text-sm text-gray-700">Max duration (hours)</label>
            <input
              type="number"
              value={filters.maxDuration || ''}
              onChange={(e) => updateFilter('maxDuration', e.target.value ? parseInt(e.target.value) : null)}
              placeholder="Any"
              min="1"
              max="24"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>
        </FilterSection>

        {/* Baggage */}
        <FilterSection title="Baggage" icon={Briefcase} section="baggage">
          <div className="space-y-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.checkedBaggage}
                onChange={(e) => updateFilter('checkedBaggage', e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span className="text-sm text-gray-700">Checked baggage included</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.carryOnOnly}
                onChange={(e) => updateFilter('carryOnOnly', e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span className="text-sm text-gray-700">Carry-on only</span>
            </label>
          </div>
        </FilterSection>

        {/* Other Options */}
        <FilterSection title="Other Options" icon={MapPin} section="other">
          <div className="space-y-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.refundable}
                onChange={(e) => updateFilter('refundable', e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span className="text-sm text-gray-700">Refundable</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.changeable}
                onChange={(e) => updateFilter('changeable', e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span className="text-sm text-gray-700">Changeable</span>
            </label>
          </div>
        </FilterSection>
      </div>
    </div>
  );
}
