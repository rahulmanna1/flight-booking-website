'use client';

import { useState, useEffect } from 'react';
import { 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown,
  Star,
  DollarSign,
  Clock,
  Plane,
  Calendar,
  MapPin,
  Zap,
  Heart,
  TrendingUp,
  Leaf,
  Shield,
  X,
  Plus
} from 'lucide-react';

export interface SortCriteria {
  field: string;
  direction: 'asc' | 'desc';
  weight: number; // 1-10 for multi-criteria sorting
}

export interface EnhancedSortOptions {
  primary: SortCriteria;
  secondary?: SortCriteria;
  tertiary?: SortCriteria;
  customWeights?: {
    price: number;
    duration: number;
    stops: number;
    departure: number;
    arrival: number;
    airline: number;
    aircraft: number;
    environmental: number;
    reliability: number;
  };
}

interface EnhancedSortingProps {
  onSortChange: (sortOptions: EnhancedSortOptions) => void;
  initialSort?: EnhancedSortOptions;
  className?: string;
}

const SORT_OPTIONS = [
  { 
    id: 'price', 
    label: 'Price', 
    icon: <DollarSign className="w-4 h-4" />,
    description: 'Total cost including taxes and fees'
  },
  { 
    id: 'duration', 
    label: 'Flight Duration', 
    icon: <Clock className="w-4 h-4" />,
    description: 'Total travel time including layovers'
  },
  { 
    id: 'stops', 
    label: 'Number of Stops', 
    icon: <MapPin className="w-4 h-4" />,
    description: 'Fewer stops = more convenient'
  },
  { 
    id: 'departure', 
    label: 'Departure Time', 
    icon: <Calendar className="w-4 h-4" />,
    description: 'Time of departure from origin'
  },
  { 
    id: 'arrival', 
    label: 'Arrival Time', 
    icon: <Calendar className="w-4 h-4" />,
    description: 'Time of arrival at destination'
  },
  { 
    id: 'airline', 
    label: 'Airline Rating', 
    icon: <Star className="w-4 h-4" />,
    description: 'Based on customer reviews and ratings'
  },
  { 
    id: 'aircraft', 
    label: 'Aircraft Comfort', 
    icon: <Plane className="w-4 h-4" />,
    description: 'Newer aircraft and better amenities'
  },
  { 
    id: 'environmental', 
    label: 'Carbon Footprint', 
    icon: <Leaf className="w-4 h-4" />,
    description: 'Environmental impact score'
  },
  { 
    id: 'reliability', 
    label: 'On-time Performance', 
    icon: <Shield className="w-4 h-4" />,
    description: 'Historical punctuality data'
  },
  { 
    id: 'value', 
    label: 'Best Value', 
    icon: <TrendingUp className="w-4 h-4" />,
    description: 'Price vs. quality ratio'
  }
];

const QUICK_SORT_PRESETS = [
  {
    id: 'cheapest',
    name: 'Cheapest First',
    icon: <DollarSign className="w-4 h-4" />,
    description: 'Lowest price, then shortest duration',
    config: {
      primary: { field: 'price', direction: 'asc' as const, weight: 10 },
      secondary: { field: 'duration', direction: 'asc' as const, weight: 3 }
    }
  },
  {
    id: 'fastest',
    name: 'Fastest First',
    icon: <Zap className="w-4 h-4" />,
    description: 'Shortest duration, fewest stops',
    config: {
      primary: { field: 'duration', direction: 'asc' as const, weight: 10 },
      secondary: { field: 'stops', direction: 'asc' as const, weight: 7 }
    }
  },
  {
    id: 'best',
    name: 'Best Overall',
    icon: <Star className="w-4 h-4" />,
    description: 'Balanced price, time, and quality',
    config: {
      primary: { field: 'value', direction: 'desc' as const, weight: 10 },
      secondary: { field: 'reliability', direction: 'desc' as const, weight: 5 }
    }
  },
  {
    id: 'convenient',
    name: 'Most Convenient',
    icon: <Clock className="w-4 h-4" />,
    description: 'Non-stop flights, good timing',
    config: {
      primary: { field: 'stops', direction: 'asc' as const, weight: 10 },
      secondary: { field: 'departure', direction: 'asc' as const, weight: 6 }
    }
  },
  {
    id: 'comfortable',
    name: 'Most Comfortable',
    icon: <Heart className="w-4 h-4" />,
    description: 'Best airlines and aircraft',
    config: {
      primary: { field: 'airline', direction: 'desc' as const, weight: 10 },
      secondary: { field: 'aircraft', direction: 'desc' as const, weight: 8 }
    }
  },
  {
    id: 'green',
    name: 'Most Eco-Friendly',
    icon: <Leaf className="w-4 h-4" />,
    description: 'Lowest environmental impact',
    config: {
      primary: { field: 'environmental', direction: 'asc' as const, weight: 10 },
      secondary: { field: 'duration', direction: 'asc' as const, weight: 4 }
    }
  }
];

export default function EnhancedSorting({ onSortChange, initialSort, className }: EnhancedSortingProps) {
  const [sortOptions, setSortOptions] = useState<EnhancedSortOptions>(
    initialSort || {
      primary: { field: 'price', direction: 'asc', weight: 10 }
    }
  );
  
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string>('');

  useEffect(() => {
    onSortChange(sortOptions);
  }, [sortOptions, onSortChange]);

  const handlePresetSelect = (preset: typeof QUICK_SORT_PRESETS[0]) => {
    setSortOptions({
      primary: preset.config.primary,
      secondary: preset.config.secondary,
      tertiary: undefined
    });
    setSelectedPreset(preset.id);
    setShowAdvanced(false);
  };

  const handleCriteriaChange = (
    level: 'primary' | 'secondary' | 'tertiary',
    field: string,
    direction: 'asc' | 'desc',
    weight: number
  ) => {
    setSortOptions(prev => ({
      ...prev,
      [level]: { field, direction, weight }
    }));
    setSelectedPreset(''); // Clear preset when manually changing
  };

  const removeCriteria = (level: 'secondary' | 'tertiary') => {
    setSortOptions(prev => {
      const newOptions = { ...prev };
      delete newOptions[level];
      return newOptions;
    });
  };

  const addCriteria = () => {
    if (!sortOptions.secondary) {
      setSortOptions(prev => ({
        ...prev,
        secondary: { field: 'duration', direction: 'asc', weight: 5 }
      }));
    } else if (!sortOptions.tertiary) {
      setSortOptions(prev => ({
        ...prev,
        tertiary: { field: 'stops', direction: 'asc', weight: 3 }
      }));
    }
  };

  const renderSortCriteria = (
    level: 'primary' | 'secondary' | 'tertiary',
    criteria: SortCriteria,
    canRemove: boolean = false
  ) => {
    const option = SORT_OPTIONS.find(opt => opt.id === criteria.field);
    
    return (
      <div key={level} className="flex items-center space-x-3 p-3 border rounded-lg bg-gray-50">
        <div className="flex items-center space-x-2 flex-1">
          {option?.icon}
          <select
            value={criteria.field}
            onChange={(e) => handleCriteriaChange(level, e.target.value, criteria.direction, criteria.weight)}
            className="border border-gray-300 rounded px-2 py-1 text-sm bg-white"
          >
            {SORT_OPTIONS.map(opt => (
              <option key={opt.id} value={opt.id}>{opt.label}</option>
            ))}
          </select>
        </div>
        
        <button
          onClick={() => handleCriteriaChange(level, criteria.field, 
            criteria.direction === 'asc' ? 'desc' : 'asc', criteria.weight)}
          className="flex items-center space-x-1 px-2 py-1 text-sm border rounded hover:bg-white"
        >
          {criteria.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
          <span>{criteria.direction === 'asc' ? 'Low to High' : 'High to Low'}</span>
        </button>
        
        {showAdvanced && (
          <div className="flex items-center space-x-1">
            <span className="text-xs text-gray-500">Weight:</span>
            <input
              type="range"
              min="1"
              max="10"
              value={criteria.weight}
              onChange={(e) => handleCriteriaChange(level, criteria.field, criteria.direction, parseInt(e.target.value))}
              className="w-16 accent-blue-600"
            />
            <span className="text-xs text-gray-600 w-6">{criteria.weight}</span>
          </div>
        )}
        
        {canRemove && (
          <button
            onClick={() => removeCriteria(level as 'secondary' | 'tertiary')}
            className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    );
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <ArrowUpDown className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">Sort Flights</h3>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            {showAdvanced ? 'Simple' : 'Advanced'}
          </button>
        </div>
      </div>

      {!showAdvanced ? (
        /* Quick Sort Presets */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {QUICK_SORT_PRESETS.map(preset => (
            <button
              key={preset.id}
              onClick={() => handlePresetSelect(preset)}
              className={`text-left p-3 border rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors ${
                selectedPreset === preset.id ? 'bg-blue-50 border-blue-300' : 'border-gray-200'
              }`}
            >
              <div className="flex items-center space-x-2 mb-1">
                {preset.icon}
                <span className="font-medium text-gray-900">{preset.name}</span>
              </div>
              <p className="text-xs text-gray-600">{preset.description}</p>
            </button>
          ))}
        </div>
      ) : (
        /* Advanced Multi-Criteria Sorting */
        <div className="space-y-4">
          <div className="text-sm text-gray-600 mb-3">
            Create custom sorting with up to 3 criteria. Higher weight = more important.
          </div>
          
          <div className="space-y-3">
            {/* Primary Criteria */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Primary Sort (Most Important)
              </label>
              {renderSortCriteria('primary', sortOptions.primary)}
            </div>

            {/* Secondary Criteria */}
            {sortOptions.secondary && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Secondary Sort
                </label>
                {renderSortCriteria('secondary', sortOptions.secondary, true)}
              </div>
            )}

            {/* Tertiary Criteria */}
            {sortOptions.tertiary && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tertiary Sort
                </label>
                {renderSortCriteria('tertiary', sortOptions.tertiary, true)}
              </div>
            )}

            {/* Add More Criteria */}
            {(!sortOptions.secondary || !sortOptions.tertiary) && (
              <button
                onClick={addCriteria}
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 text-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add {!sortOptions.secondary ? 'Secondary' : 'Tertiary'} Sort Criteria</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Sort Summary */}
      {(sortOptions.secondary || sortOptions.tertiary) && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="text-sm text-blue-800">
            <strong>Active Sort:</strong> {' '}
            {SORT_OPTIONS.find(opt => opt.id === sortOptions.primary.field)?.label} 
            ({sortOptions.primary.direction === 'asc' ? 'Low to High' : 'High to Low'})
            {sortOptions.secondary && (
              <> → {SORT_OPTIONS.find(opt => opt.id === sortOptions.secondary!.field)?.label}
              ({sortOptions.secondary.direction === 'asc' ? 'Low to High' : 'High to Low'})</>
            )}
            {sortOptions.tertiary && (
              <> → {SORT_OPTIONS.find(opt => opt.id === sortOptions.tertiary!.field)?.label}
              ({sortOptions.tertiary.direction === 'asc' ? 'Low to High' : 'High to Low'})</>
            )}
          </div>
        </div>
      )}
    </div>
  );
}