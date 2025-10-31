'use client';

import React, { useState } from 'react';
import { 
  SlidersHorizontal, 
  X, 
  Clock, 
  DollarSign, 
  Plane, 
  Luggage,
  MapPin,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export interface FlightFilters {
  priceRange: [number, number];
  maxStops: number | null;
  airlines: string[];
  departureTimeRange: [number, number]; // hours in 24h format
  arrivalTimeRange: [number, number]; // hours in 24h format
  maxDuration: number | null; // in minutes
  minLayoverDuration: number | null; // in minutes
  maxLayoverDuration: number | null; // in minutes
  baggageIncluded: boolean | null;
  refundable: boolean | null;
  directFlightsOnly: boolean;
}

interface AdvancedFiltersPanelProps {
  filters: FlightFilters;
  onChange: (filters: FlightFilters) => void;
  availableAirlines?: string[];
  priceRange?: [number, number];
  onReset?: () => void;
}

export default function AdvancedFiltersPanel({
  filters,
  onChange,
  availableAirlines = [],
  priceRange = [0, 5000],
  onReset,
}: AdvancedFiltersPanelProps) {
  const [expandedSections, setExpandedSections] = useState({
    price: true,
    stops: true,
    airlines: true,
    times: false,
    duration: false,
    layover: false,
    amenities: false,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const updateFilter = <K extends keyof FlightFilters>(
    key: K,
    value: FlightFilters[K]
  ) => {
    onChange({ ...filters, [key]: value });
  };

  const formatTime = (hour: number) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:00 ${period}`;
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const activeFilterCount = () => {
    let count = 0;
    if (filters.maxStops !== null) count++;
    if (filters.airlines.length > 0) count++;
    if (filters.departureTimeRange[0] !== 0 || filters.departureTimeRange[1] !== 24) count++;
    if (filters.arrivalTimeRange[0] !== 0 || filters.arrivalTimeRange[1] !== 24) count++;
    if (filters.maxDuration !== null) count++;
    if (filters.minLayoverDuration !== null || filters.maxLayoverDuration !== null) count++;
    if (filters.baggageIncluded !== null) count++;
    if (filters.refundable !== null) count++;
    if (filters.directFlightsOnly) count++;
    return count;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">Filters</h3>
          {activeFilterCount() > 0 && (
            <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-1 rounded-full">
              {activeFilterCount()}
            </span>
          )}
        </div>
        {onReset && activeFilterCount() > 0 && (
          <button
            onClick={onReset}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Reset All
          </button>
        )}
      </div>

      <div className="divide-y divide-gray-200">
        {/* Price Range */}
        <FilterSection
          title="Price Range"
          icon={<DollarSign className="w-4 h-4" />}
          expanded={expandedSections.price}
          onToggle={() => toggleSection('price')}
        >
          <div className="space-y-4">
            <div>
              <input
                type="range"
                min={priceRange[0]}
                max={priceRange[1]}
                value={filters.priceRange[1]}
                onChange={(e) =>
                  updateFilter('priceRange', [filters.priceRange[0], parseInt(e.target.value)])
                }
                className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">${filters.priceRange[0]}</span>
              <span className="font-semibold text-gray-900">${filters.priceRange[1]}</span>
            </div>
          </div>
        </FilterSection>

        {/* Stops */}
        <FilterSection
          title="Number of Stops"
          icon={<MapPin className="w-4 h-4" />}
          expanded={expandedSections.stops}
          onToggle={() => toggleSection('stops')}
        >
          <div className="space-y-2">
            {[
              { label: 'Any number of stops', value: null },
              { label: 'Non-stop only', value: 0 },
              { label: 'Up to 1 stop', value: 1 },
              { label: 'Up to 2 stops', value: 2 },
            ].map((option) => (
              <label
                key={option.label}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="radio"
                  checked={filters.maxStops === option.value}
                  onChange={() => updateFilter('maxStops', option.value)}
                  className="w-4 h-4 text-blue-600 cursor-pointer"
                />
                <span className="text-sm text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
        </FilterSection>

        {/* Airlines */}
        {availableAirlines.length > 0 && (
          <FilterSection
            title="Airlines"
            icon={<Plane className="w-4 h-4" />}
            expanded={expandedSections.airlines}
            onToggle={() => toggleSection('airlines')}
          >
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {availableAirlines.map((airline) => (
                <label
                  key={airline}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={filters.airlines.includes(airline)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        updateFilter('airlines', [...filters.airlines, airline]);
                      } else {
                        updateFilter('airlines', filters.airlines.filter(a => a !== airline));
                      }
                    }}
                    className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                  />
                  <span className="text-sm text-gray-700">{airline}</span>
                </label>
              ))}
            </div>
          </FilterSection>
        )}

        {/* Departure Time */}
        <FilterSection
          title="Departure Time"
          icon={<Clock className="w-4 h-4" />}
          expanded={expandedSections.times}
          onToggle={() => toggleSection('times')}
        >
          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-600 mb-2 block">From</label>
              <input
                type="range"
                min={0}
                max={24}
                value={filters.departureTimeRange[0]}
                onChange={(e) =>
                  updateFilter('departureTimeRange', [parseInt(e.target.value), filters.departureTimeRange[1]])
                }
                className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>
            <div>
              <label className="text-xs text-gray-600 mb-2 block">To</label>
              <input
                type="range"
                min={0}
                max={24}
                value={filters.departureTimeRange[1]}
                onChange={(e) =>
                  updateFilter('departureTimeRange', [filters.departureTimeRange[0], parseInt(e.target.value)])
                }
                className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">{formatTime(filters.departureTimeRange[0])}</span>
              <span className="font-semibold text-gray-900">{formatTime(filters.departureTimeRange[1])}</span>
            </div>
          </div>
        </FilterSection>

        {/* Arrival Time */}
        <FilterSection
          title="Arrival Time"
          icon={<Clock className="w-4 h-4" />}
          expanded={expandedSections.times}
          onToggle={() => toggleSection('times')}
        >
          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-600 mb-2 block">From</label>
              <input
                type="range"
                min={0}
                max={24}
                value={filters.arrivalTimeRange[0]}
                onChange={(e) =>
                  updateFilter('arrivalTimeRange', [parseInt(e.target.value), filters.arrivalTimeRange[1]])
                }
                className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>
            <div>
              <label className="text-xs text-gray-600 mb-2 block">To</label>
              <input
                type="range"
                min={0}
                max={24}
                value={filters.arrivalTimeRange[1]}
                onChange={(e) =>
                  updateFilter('arrivalTimeRange', [filters.arrivalTimeRange[0], parseInt(e.target.value)])
                }
                className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">{formatTime(filters.arrivalTimeRange[0])}</span>
              <span className="font-semibold text-gray-900">{formatTime(filters.arrivalTimeRange[1])}</span>
            </div>
          </div>
        </FilterSection>

        {/* Flight Duration */}
        <FilterSection
          title="Maximum Flight Duration"
          icon={<Clock className="w-4 h-4" />}
          expanded={expandedSections.duration}
          onToggle={() => toggleSection('duration')}
        >
          <div className="space-y-2">
            {[
              { label: 'Any duration', value: null },
              { label: 'Up to 3 hours', value: 180 },
              { label: 'Up to 6 hours', value: 360 },
              { label: 'Up to 12 hours', value: 720 },
              { label: 'Up to 24 hours', value: 1440 },
            ].map((option) => (
              <label
                key={option.label}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="radio"
                  checked={filters.maxDuration === option.value}
                  onChange={() => updateFilter('maxDuration', option.value)}
                  className="w-4 h-4 text-blue-600 cursor-pointer"
                />
                <span className="text-sm text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
        </FilterSection>

        {/* Layover Duration */}
        <FilterSection
          title="Layover Duration"
          icon={<Clock className="w-4 h-4" />}
          expanded={expandedSections.layover}
          onToggle={() => toggleSection('layover')}
        >
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-600 mb-2 block">Minimum (minutes)</label>
              <input
                type="number"
                min={0}
                step={30}
                value={filters.minLayoverDuration || ''}
                onChange={(e) =>
                  updateFilter('minLayoverDuration', e.target.value ? parseInt(e.target.value) : null)
                }
                placeholder="No minimum"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-xs text-gray-600 mb-2 block">Maximum (minutes)</label>
              <input
                type="number"
                min={0}
                step={30}
                value={filters.maxLayoverDuration || ''}
                onChange={(e) =>
                  updateFilter('maxLayoverDuration', e.target.value ? parseInt(e.target.value) : null)
                }
                placeholder="No maximum"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </FilterSection>

        {/* Amenities & Policies */}
        <FilterSection
          title="Amenities & Policies"
          icon={<Luggage className="w-4 h-4" />}
          expanded={expandedSections.amenities}
          onToggle={() => toggleSection('amenities')}
        >
          <div className="space-y-2">
            <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.baggageIncluded === true}
                onChange={(e) =>
                  updateFilter('baggageIncluded', e.target.checked ? true : null)
                }
                className="w-4 h-4 text-blue-600 rounded cursor-pointer"
              />
              <span className="text-sm text-gray-700">Checked baggage included</span>
            </label>
            <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.refundable === true}
                onChange={(e) =>
                  updateFilter('refundable', e.target.checked ? true : null)
                }
                className="w-4 h-4 text-blue-600 rounded cursor-pointer"
              />
              <span className="text-sm text-gray-700">Refundable tickets</span>
            </label>
          </div>
        </FilterSection>
      </div>
    </div>
  );
}

interface FilterSectionProps {
  title: string;
  icon: React.ReactNode;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function FilterSection({ title, icon, expanded, onToggle, children }: FilterSectionProps) {
  return (
    <div className="p-4">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full mb-3 hover:text-blue-600 transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className="text-gray-600">{icon}</div>
          <h4 className="font-medium text-gray-900">{title}</h4>
        </div>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        )}
      </button>
      {expanded && <div>{children}</div>}
    </div>
  );
}
