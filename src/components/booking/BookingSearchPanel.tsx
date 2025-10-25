// Booking Search Panel Component
// Advanced search and filtering capabilities for booking management

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Calendar, 
  X, 
  ChevronDown,
  SlidersHorizontal,
  MapPin,
  Plane,
  Users,
  CreditCard,
  RefreshCw
} from 'lucide-react';
import { format, subDays, subWeeks, subMonths, startOfDay, endOfDay } from 'date-fns';

export interface BookingSearchFilters {
  searchTerm: string;
  status: string[];
  dateRange: {
    from: Date | null;
    to: Date | null;
    preset: string | null;
  };
  priceRange: {
    min: number | null;
    max: number | null;
  };
  passengerCount: {
    min: number | null;
    max: number | null;
  };
  airlines: string[];
  routes: string[];
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

interface BookingSearchPanelProps {
  filters: BookingSearchFilters;
  onFiltersChange: (filters: BookingSearchFilters) => void;
  onReset: () => void;
  availableAirlines?: string[];
  availableRoutes?: string[];
  totalResults?: number;
  className?: string;
}

const statusOptions = [
  { value: 'confirmed', label: 'Confirmed', color: 'bg-green-100 text-green-800' },
  { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800' },
  { value: 'completed', label: 'Completed', color: 'bg-blue-100 text-blue-800' },
  { value: 'refunded', label: 'Refunded', color: 'bg-gray-100 text-gray-800' },
];

const datePresets = [
  { value: 'today', label: 'Today', getDates: () => ({ from: new Date(), to: new Date() }) },
  { value: 'yesterday', label: 'Yesterday', getDates: () => { const date = subDays(new Date(), 1); return { from: date, to: date }; } },
  { value: 'last7days', label: 'Last 7 days', getDates: () => ({ from: subDays(new Date(), 7), to: new Date() }) },
  { value: 'last30days', label: 'Last 30 days', getDates: () => ({ from: subDays(new Date(), 30), to: new Date() }) },
  { value: 'last3months', label: 'Last 3 months', getDates: () => ({ from: subMonths(new Date(), 3), to: new Date() }) },
  { value: 'last6months', label: 'Last 6 months', getDates: () => ({ from: subMonths(new Date(), 6), to: new Date() }) },
  { value: 'custom', label: 'Custom Range', getDates: () => ({ from: null, to: null }) },
];

const sortOptions = [
  { value: 'bookingDate', label: 'Booking Date' },
  { value: 'departureDate', label: 'Departure Date' },
  { value: 'totalPrice', label: 'Total Price' },
  { value: 'passengerCount', label: 'Passengers' },
  { value: 'bookingReference', label: 'Booking Reference' },
  { value: 'status', label: 'Status' },
];

export function BookingSearchPanel({
  filters,
  onFiltersChange,
  onReset,
  availableAirlines = [],
  availableRoutes = [],
  totalResults,
  className = ''
}: BookingSearchPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Update filters
  const updateFilters = (updates: Partial<BookingSearchFilters>) => {
    onFiltersChange({ ...filters, ...updates });
  };

  // Handle search term change
  const handleSearchChange = (searchTerm: string) => {
    updateFilters({ searchTerm });
  };

  // Handle status toggle
  const toggleStatus = (status: string) => {
    const newStatus = filters.status.includes(status)
      ? filters.status.filter(s => s !== status)
      : [...filters.status, status];
    updateFilters({ status: newStatus });
  };

  // Handle date preset selection
  const handleDatePresetChange = (presetValue: string) => {
    const preset = datePresets.find(p => p.value === presetValue);
    if (preset) {
      const dates = preset.getDates();
      updateFilters({
        dateRange: {
          from: dates.from,
          to: dates.to,
          preset: presetValue === 'custom' ? null : presetValue
        }
      });
      if (presetValue !== 'custom') {
        setShowDatePicker(false);
      }
    }
  };

  // Handle custom date range
  const handleCustomDateChange = (field: 'from' | 'to', date: string) => {
    const dateValue = date ? new Date(date) : null;
    updateFilters({
      dateRange: {
        ...filters.dateRange,
        [field]: dateValue,
        preset: null
      }
    });
  };

  // Handle price range change
  const handlePriceRangeChange = (field: 'min' | 'max', value: string) => {
    const numValue = value ? parseFloat(value) : null;
    updateFilters({
      priceRange: {
        ...filters.priceRange,
        [field]: numValue
      }
    });
  };

  // Handle passenger count change
  const handlePassengerCountChange = (field: 'min' | 'max', value: string) => {
    const numValue = value ? parseInt(value, 10) : null;
    updateFilters({
      passengerCount: {
        ...filters.passengerCount,
        [field]: numValue
      }
    });
  };

  // Handle airline toggle
  const toggleAirline = (airline: string) => {
    const newAirlines = filters.airlines.includes(airline)
      ? filters.airlines.filter(a => a !== airline)
      : [...filters.airlines, airline];
    updateFilters({ airlines: newAirlines });
  };

  // Handle route toggle
  const toggleRoute = (route: string) => {
    const newRoutes = filters.routes.includes(route)
      ? filters.routes.filter(r => r !== route)
      : [...filters.routes, route];
    updateFilters({ routes: newRoutes });
  };

  // Handle sort change
  const handleSortChange = (sortBy: string) => {
    const sortOrder = filters.sortBy === sortBy && filters.sortOrder === 'asc' ? 'desc' : 'asc';
    updateFilters({ sortBy, sortOrder });
  };

  // Get active filters count
  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.status.length > 0) count++;
    if (filters.dateRange.from || filters.dateRange.to) count++;
    if (filters.priceRange.min !== null || filters.priceRange.max !== null) count++;
    if (filters.passengerCount.min !== null || filters.passengerCount.max !== null) count++;
    if (filters.airlines.length > 0) count++;
    if (filters.routes.length > 0) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 ${className}`}>
      {/* Search Bar */}
      <div className="p-6">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-600" />
            <input
              type="text"
              placeholder="Search by booking reference, passenger name, flight number, or route..."
              value={filters.searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`flex items-center space-x-2 px-4 py-3 border rounded-lg transition-colors ${
              activeFiltersCount > 0
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-300 hover:bg-gray-50'
            }`}
          >
            <SlidersHorizontal className="w-5 h-5" />
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <span className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
            <ChevronDown className={`w-4 h-4 transform transition-transform ${
              isExpanded ? 'rotate-180' : ''
            }`} />
          </button>

          {totalResults !== undefined && (
            <div className="text-sm text-gray-600 whitespace-nowrap">
              {totalResults} {totalResults === 1 ? 'result' : 'results'}
            </div>
          )}

          {activeFiltersCount > 0 && (
            <button
              onClick={onReset}
              className="flex items-center space-x-1 px-3 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Expanded Filters */}
      {isExpanded && (
        <div className="border-t border-gray-200 p-6 space-y-6">
          {/* Status Filters */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">Status</h3>
            <div className="flex flex-wrap gap-2">
              {statusOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => toggleStatus(option.value)}
                  className={`px-3 py-2 rounded-full text-sm font-medium transition-all ${
                    filters.status.includes(option.value)
                      ? `${option.color} ring-2 ring-offset-2 ring-blue-500`
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {option.label}
                  {filters.status.includes(option.value) && (
                    <X className="w-3 h-3 ml-1 inline" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Date Range */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                Date Range
              </h3>
              <div className="space-y-2">
                <select
                  value={filters.dateRange.preset || 'custom'}
                  onChange={(e) => handleDatePresetChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {datePresets.map((preset) => (
                    <option key={preset.value} value={preset.value}>
                      {preset.label}
                    </option>
                  ))}
                </select>
                
                {(!filters.dateRange.preset || filters.dateRange.preset === 'custom') && (
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="date"
                      value={filters.dateRange.from ? format(filters.dateRange.from, 'yyyy-MM-dd') : ''}
                      onChange={(e) => handleCustomDateChange('from', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="From"
                    />
                    <input
                      type="date"
                      value={filters.dateRange.to ? format(filters.dateRange.to, 'yyyy-MM-dd') : ''}
                      onChange={(e) => handleCustomDateChange('to', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="To"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                <CreditCard className="w-4 h-4 mr-2" />
                Price Range
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Min ($)"
                  value={filters.priceRange.min || ''}
                  onChange={(e) => handlePriceRangeChange('min', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <input
                  type="number"
                  placeholder="Max ($)"
                  value={filters.priceRange.max || ''}
                  onChange={(e) => handlePriceRangeChange('max', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            </div>

            {/* Passenger Count */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                <Users className="w-4 h-4 mr-2" />
                Passengers
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.passengerCount.min || ''}
                  onChange={(e) => handlePassengerCountChange('min', e.target.value)}
                  min="1"
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.passengerCount.max || ''}
                  onChange={(e) => handlePassengerCountChange('max', e.target.value)}
                  min="1"
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Airlines and Routes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Airlines */}
            {availableAirlines.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                  <Plane className="w-4 h-4 mr-2" />
                  Airlines
                </h3>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {availableAirlines.map((airline) => (
                    <label key={airline} className="flex items-center space-x-2 text-sm">
                      <input
                        type="checkbox"
                        checked={filters.airlines.includes(airline)}
                        onChange={() => toggleAirline(airline)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span>{airline}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Routes */}
            {availableRoutes.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                  <MapPin className="w-4 h-4 mr-2" />
                  Routes
                </h3>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {availableRoutes.map((route) => (
                    <label key={route} className="flex items-center space-x-2 text-sm">
                      <input
                        type="checkbox"
                        checked={filters.routes.includes(route)}
                        onChange={() => toggleRoute(route)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span>{route}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sort Options */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">Sort by</h3>
            <div className="flex flex-wrap gap-2">
              {sortOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleSortChange(option.value)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filters.sortBy === option.value
                      ? 'bg-blue-100 text-blue-800 ring-2 ring-blue-500'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {option.label}
                  {filters.sortBy === option.value && (
                    <span className="ml-1">
                      {filters.sortOrder === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BookingSearchPanel;