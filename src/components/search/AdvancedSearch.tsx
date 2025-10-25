'use client';

import { useState, useEffect } from 'react';
import { 
  Search, 
  X, 
  Settings,
  Calendar,
  Users,
  MapPin,
  Plane,
  Clock,
  Star,
  Filter,
  Plus,
  Minus,
  ChevronDown,
  ChevronUp,
  RotateCcw
} from 'lucide-react';

interface AdvancedSearchFilters {
  // Time preferences
  preferredDepartureTime: string;
  preferredArrivalTime: string;
  maxLayoverDuration: number;
  allowOvernight: boolean;
  
  // Aircraft preferences
  preferredAircraft: string[];
  avoidAircraft: string[];
  minSeatWidth: number;
  
  // Airline preferences
  preferredAirlines: string[];
  avoidAirlines: string[];
  alliancePreference: string;
  
  // Route preferences
  maxStops: number;
  preferredRoutes: string[];
  avoidAirports: string[];
  
  // Flexible dates
  flexibleDates: boolean;
  dateRange: number; // days plus/minus
  weekendOnly: boolean;
  
  // Price preferences
  priceAlerts: boolean;
  budgetLimit: number;
  showBundleDeals: boolean;
  
  // Accessibility & Special needs
  wheelchairAccessible: boolean;
  assistanceRequired: boolean;
  dietaryRestrictions: string[];
  
  // Baggage preferences
  includeBaggage: boolean;
  baggageWeight: number;
  carryOnOnly: boolean;
  
  // Environmental preferences
  lowCarbonOnly: boolean;
  sustainableAirlines: boolean;
  offsetCarbon: boolean;
}

interface AdvancedSearchProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: AdvancedSearchFilters) => void;
  initialFilters?: Partial<AdvancedSearchFilters>;
}

const AIRLINE_ALLIANCES = [
  { id: 'star', name: 'Star Alliance', airlines: ['United', 'Lufthansa', 'Singapore Airlines', 'Thai Airways'] },
  { id: 'oneworld', name: 'Oneworld', airlines: ['American Airlines', 'British Airways', 'Cathay Pacific', 'Qatar Airways'] },
  { id: 'skyteam', name: 'SkyTeam', airlines: ['Delta', 'Air France', 'KLM', 'Korean Air'] }
];

const AIRCRAFT_TYPES = [
  { id: 'boeing-737', name: 'Boeing 737', category: 'narrow-body' },
  { id: 'boeing-777', name: 'Boeing 777', category: 'wide-body' },
  { id: 'boeing-787', name: 'Boeing 787 Dreamliner', category: 'wide-body' },
  { id: 'airbus-a320', name: 'Airbus A320', category: 'narrow-body' },
  { id: 'airbus-a330', name: 'Airbus A330', category: 'wide-body' },
  { id: 'airbus-a350', name: 'Airbus A350', category: 'wide-body' },
  { id: 'airbus-a380', name: 'Airbus A380', category: 'wide-body' },
];

const MAJOR_AIRLINES = [
  'American Airlines', 'Delta Air Lines', 'United Airlines', 'Southwest Airlines',
  'British Airways', 'Lufthansa', 'Air France', 'KLM', 'Emirates', 'Qatar Airways',
  'Singapore Airlines', 'Cathay Pacific', 'Japan Airlines', 'Korean Air'
];

const DIETARY_OPTIONS = [
  'Vegetarian', 'Vegan', 'Kosher', 'Halal', 'Gluten-free', 'Diabetic', 'Low sodium'
];

const TIME_PREFERENCES = [
  { id: 'early-morning', label: 'Early Morning', time: '5:00 AM - 8:00 AM' },
  { id: 'morning', label: 'Morning', time: '8:00 AM - 12:00 PM' },
  { id: 'afternoon', label: 'Afternoon', time: '12:00 PM - 6:00 PM' },
  { id: 'evening', label: 'Evening', time: '6:00 PM - 10:00 PM' },
  { id: 'night', label: 'Night', time: '10:00 PM - 5:00 AM' },
];

export default function AdvancedSearch({ isOpen, onClose, onApply, initialFilters }: AdvancedSearchProps) {
  const [filters, setFilters] = useState<AdvancedSearchFilters>({
    preferredDepartureTime: '',
    preferredArrivalTime: '',
    maxLayoverDuration: 480, // 8 hours
    allowOvernight: true,
    preferredAircraft: [],
    avoidAircraft: [],
    minSeatWidth: 17,
    preferredAirlines: [],
    avoidAirlines: [],
    alliancePreference: '',
    maxStops: 2,
    preferredRoutes: [],
    avoidAirports: [],
    flexibleDates: false,
    dateRange: 3,
    weekendOnly: false,
    priceAlerts: false,
    budgetLimit: 2000,
    showBundleDeals: true,
    wheelchairAccessible: false,
    assistanceRequired: false,
    dietaryRestrictions: [],
    includeBaggage: false,
    baggageWeight: 23,
    carryOnOnly: false,
    lowCarbonOnly: false,
    sustainableAirlines: false,
    offsetCarbon: false,
    ...initialFilters
  });

  const [expandedSections, setExpandedSections] = useState({
    time: true,
    aircraft: false,
    airlines: false,
    route: false,
    dates: false,
    price: false,
    accessibility: false,
    baggage: false,
    environmental: false,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleArrayToggle = (field: keyof AdvancedSearchFilters, value: string) => {
    setFilters(prev => {
      const currentArray = prev[field] as string[];
      const newArray = currentArray.includes(value)
        ? currentArray.filter(item => item !== value)
        : [...currentArray, value];
      return { ...prev, [field]: newArray };
    });
  };

  const resetFilters = () => {
    setFilters({
      preferredDepartureTime: '',
      preferredArrivalTime: '',
      maxLayoverDuration: 480,
      allowOvernight: true,
      preferredAircraft: [],
      avoidAircraft: [],
      minSeatWidth: 17,
      preferredAirlines: [],
      avoidAirlines: [],
      alliancePreference: '',
      maxStops: 2,
      preferredRoutes: [],
      avoidAirports: [],
      flexibleDates: false,
      dateRange: 3,
      weekendOnly: false,
      priceAlerts: false,
      budgetLimit: 2000,
      showBundleDeals: true,
      wheelchairAccessible: false,
      assistanceRequired: false,
      dietaryRestrictions: [],
      includeBaggage: false,
      baggageWeight: 23,
      carryOnOnly: false,
      lowCarbonOnly: false,
      sustainableAirlines: false,
      offsetCarbon: false,
    });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.preferredDepartureTime) count++;
    if (filters.preferredArrivalTime) count++;
    if (filters.maxLayoverDuration < 480) count++;
    if (!filters.allowOvernight) count++;
    if (filters.preferredAircraft.length > 0) count++;
    if (filters.avoidAircraft.length > 0) count++;
    if (filters.minSeatWidth > 17) count++;
    if (filters.preferredAirlines.length > 0) count++;
    if (filters.avoidAirlines.length > 0) count++;
    if (filters.alliancePreference) count++;
    if (filters.maxStops < 2) count++;
    if (filters.avoidAirports.length > 0) count++;
    if (filters.flexibleDates) count++;
    if (filters.weekendOnly) count++;
    if (filters.priceAlerts) count++;
    if (filters.budgetLimit < 2000) count++;
    if (!filters.showBundleDeals) count++;
    if (filters.wheelchairAccessible) count++;
    if (filters.assistanceRequired) count++;
    if (filters.dietaryRestrictions.length > 0) count++;
    if (filters.includeBaggage) count++;
    if (filters.carryOnOnly) count++;
    if (filters.lowCarbonOnly) count++;
    if (filters.sustainableAirlines) count++;
    if (filters.offsetCarbon) count++;
    return count;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Settings className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Advanced Search</h2>
            {getActiveFiltersCount() > 0 && (
              <span className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
                {getActiveFiltersCount()} filters active
              </span>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={resetFilters}
              className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100"
              title="Reset all filters"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-8">
          {/* Time Preferences */}
          <div className="border rounded-lg p-4">
            <button
              onClick={() => toggleSection('time')}
              className="flex items-center justify-between w-full text-left"
            >
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">Time Preferences</h3>
              </div>
              {expandedSections.time ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
            
            {expandedSections.time && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Departure Time
                  </label>
                  <select
                    value={filters.preferredDepartureTime}
                    onChange={(e) => setFilters(prev => ({ ...prev, preferredDepartureTime: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Any time</option>
                    {TIME_PREFERENCES.map(time => (
                      <option key={time.id} value={time.id}>{time.label} ({time.time})</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Arrival Time
                  </label>
                  <select
                    value={filters.preferredArrivalTime}
                    onChange={(e) => setFilters(prev => ({ ...prev, preferredArrivalTime: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Any time</option>
                    {TIME_PREFERENCES.map(time => (
                      <option key={time.id} value={time.id}>{time.label} ({time.time})</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Layover Duration: {Math.floor(filters.maxLayoverDuration / 60)}h {filters.maxLayoverDuration % 60}m
                  </label>
                  <input
                    type="range"
                    min={60}
                    max={720}
                    step={30}
                    value={filters.maxLayoverDuration}
                    onChange={(e) => setFilters(prev => ({ ...prev, maxLayoverDuration: parseInt(e.target.value) }))}
                    className="w-full accent-blue-600"
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="allowOvernight"
                    checked={filters.allowOvernight}
                    onChange={(e) => setFilters(prev => ({ ...prev, allowOvernight: e.target.checked }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="allowOvernight" className="text-sm text-gray-700">
                    Allow overnight layovers
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Aircraft Preferences */}
          <div className="border rounded-lg p-4">
            <button
              onClick={() => toggleSection('aircraft')}
              className="flex items-center justify-between w-full text-left"
            >
              <div className="flex items-center space-x-3">
                <Plane className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">Aircraft Preferences</h3>
              </div>
              {expandedSections.aircraft ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
            
            {expandedSections.aircraft && (
              <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Aircraft
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {AIRCRAFT_TYPES.map(aircraft => (
                      <label key={aircraft.id} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.preferredAircraft.includes(aircraft.id)}
                          onChange={() => handleArrayToggle('preferredAircraft', aircraft.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{aircraft.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Seat Width: {filters.minSeatWidth}"
                  </label>
                  <input
                    type="range"
                    min={15}
                    max={22}
                    step={0.5}
                    value={filters.minSeatWidth}
                    onChange={(e) => setFilters(prev => ({ ...prev, minSeatWidth: parseFloat(e.target.value) }))}
                    className="w-full accent-blue-600"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Airlines & Alliances */}
          <div className="border rounded-lg p-4">
            <button
              onClick={() => toggleSection('airlines')}
              className="flex items-center justify-between w-full text-left"
            >
              <div className="flex items-center space-x-3">
                <Star className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">Airlines & Alliances</h3>
              </div>
              {expandedSections.airlines ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
            
            {expandedSections.airlines && (
              <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Alliance Preference
                  </label>
                  <select
                    value={filters.alliancePreference}
                    onChange={(e) => setFilters(prev => ({ ...prev, alliancePreference: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">No preference</option>
                    {AIRLINE_ALLIANCES.map(alliance => (
                      <option key={alliance.id} value={alliance.id}>
                        {alliance.name} ({alliance.airlines.join(', ')})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preferred Airlines
                    </label>
                    <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-md p-2">
                      {MAJOR_AIRLINES.map(airline => (
                        <label key={airline} className="flex items-center space-x-2 cursor-pointer py-1">
                          <input
                            type="checkbox"
                            checked={filters.preferredAirlines.includes(airline)}
                            onChange={() => handleArrayToggle('preferredAirlines', airline)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">{airline}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Airlines to Avoid
                    </label>
                    <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-md p-2">
                      {MAJOR_AIRLINES.map(airline => (
                        <label key={airline} className="flex items-center space-x-2 cursor-pointer py-1">
                          <input
                            type="checkbox"
                            checked={filters.avoidAirlines.includes(airline)}
                            onChange={() => handleArrayToggle('avoidAirlines', airline)}
                            className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                          />
                          <span className="text-sm text-gray-700">{airline}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Environmental Preferences */}
          <div className="border rounded-lg p-4">
            <button
              onClick={() => toggleSection('environmental')}
              className="flex items-center justify-between w-full text-left"
            >
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 flex items-center justify-center">🌱</div>
                <h3 className="text-lg font-semibold text-gray-900">Environmental Impact</h3>
              </div>
              {expandedSections.environmental ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
            
            {expandedSections.environmental && (
              <div className="mt-4 space-y-3">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.lowCarbonOnly}
                    onChange={(e) => setFilters(prev => ({ ...prev, lowCarbonOnly: e.target.checked }))}
                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700">Show only low-carbon flights</span>
                </label>
                
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.sustainableAirlines}
                    onChange={(e) => setFilters(prev => ({ ...prev, sustainableAirlines: e.target.checked }))}
                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700">Prefer sustainable airlines</span>
                </label>
                
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.offsetCarbon}
                    onChange={(e) => setFilters(prev => ({ ...prev, offsetCarbon: e.target.checked }))}
                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700">Include carbon offset options</span>
                </label>
              </div>
            )}
          </div>

          {/* Accessibility */}
          <div className="border rounded-lg p-4">
            <button
              onClick={() => toggleSection('accessibility')}
              className="flex items-center justify-between w-full text-left"
            >
              <div className="flex items-center space-x-3">
                <Users className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">Accessibility & Special Needs</h3>
              </div>
              {expandedSections.accessibility ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
            
            {expandedSections.accessibility && (
              <div className="mt-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.wheelchairAccessible}
                      onChange={(e) => setFilters(prev => ({ ...prev, wheelchairAccessible: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Wheelchair accessible</span>
                  </label>
                  
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.assistanceRequired}
                      onChange={(e) => setFilters(prev => ({ ...prev, assistanceRequired: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Special assistance required</span>
                  </label>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dietary Restrictions
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {DIETARY_OPTIONS.map(diet => (
                      <label key={diet} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.dietaryRestrictions.includes(diet)}
                          onChange={() => handleArrayToggle('dietaryRestrictions', diet)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{diet}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-between">
          <button
            onClick={resetFilters}
            className="text-gray-600 hover:text-gray-800 font-medium"
          >
            Reset All Filters
          </button>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={() => onApply(filters)}
              className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 active:bg-blue-700 flex items-center space-x-2"
            >
              <Filter className="w-4 h-4" />
              <span>Apply Filters ({getActiveFiltersCount()})</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}