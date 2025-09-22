'use client';

import { useState, useEffect } from 'react';
import { Clock, X, RotateCcw } from 'lucide-react';
import { Airport } from '@/app/api/airports/search/route';

interface SearchHistory {
  id: string;
  from: Airport;
  to: Airport;
  departDate: string;
  returnDate?: string;
  tripType: 'roundtrip' | 'oneway';
  travelClass: string;
  passengers: number;
  searchedAt: string;
}

interface RecentSearchesProps {
  onSearchSelect: (search: SearchHistory) => void;
  className?: string;
  maxItems?: number;
}

// Get country flag emoji
const getCountryFlag = (countryCode: string): string => {
  if (countryCode.length !== 2) return '🌍';
  
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 0x1F1E6 + char.charCodeAt(0) - 'A'.charCodeAt(0));
  
  return String.fromCodePoint(...codePoints);
};

// Format date for display
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffTime / (1000 * 60));

  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString();
};

// Format travel details
const formatTravelDetails = (search: SearchHistory): string => {
  const details = [];
  
  if (search.tripType === 'roundtrip') {
    details.push('Round trip');
  } else {
    details.push('One way');
  }
  
  details.push(`${search.passengers} passenger${search.passengers > 1 ? 's' : ''}`);
  
  const classMap: Record<string, string> = {
    'economy': 'Economy',
    'premium-economy': 'Premium Econ',
    'business': 'Business',
    'first': 'First'
  };
  
  details.push(classMap[search.travelClass] || search.travelClass);
  
  return details.join(' • ');
};

const STORAGE_KEY = 'flight_search_history';

export default function RecentSearches({ 
  onSearchSelect, 
  className = '',
  maxItems = 5 
}: RecentSearchesProps) {
  const [recentSearches, setRecentSearches] = useState<SearchHistory[]>([]);

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const searches = JSON.parse(stored) as SearchHistory[];
        setRecentSearches(searches.slice(0, maxItems));
      }
    } catch (error) {
      console.error('Failed to load recent searches:', error);
    }
  }, [maxItems]);

  // Add a new search to history
  const addSearch = (search: Omit<SearchHistory, 'id' | 'searchedAt'>) => {
    const newSearch: SearchHistory = {
      ...search,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      searchedAt: new Date().toISOString()
    };

    setRecentSearches(prev => {
      // Remove duplicates based on route
      const filtered = prev.filter(s => 
        !(s.from.iataCode === newSearch.from.iataCode && 
          s.to.iataCode === newSearch.to.iataCode &&
          s.departDate === newSearch.departDate &&
          s.returnDate === newSearch.returnDate)
      );
      
      const updated = [newSearch, ...filtered].slice(0, maxItems);
      
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (error) {
        console.error('Failed to save search history:', error);
      }
      
      return updated;
    });
  };

  // Remove a search from history
  const removeSearch = (id: string) => {
    setRecentSearches(prev => {
      const updated = prev.filter(search => search.id !== id);
      
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (error) {
        console.error('Failed to update search history:', error);
      }
      
      return updated;
    });
  };

  // Clear all searches
  const clearAllSearches = () => {
    setRecentSearches([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear search history:', error);
    }
  };

  // Handle search selection
  const handleSearchSelect = (search: SearchHistory) => {
    onSearchSelect(search);
  };

  if (recentSearches.length === 0) {
    return null;
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Clock className="w-5 h-5 mr-2 text-gray-500" />
          Recent Searches
        </h3>
        
        <button
          onClick={clearAllSearches}
          className="text-sm text-gray-500 hover:text-red-600 transition-colors"
          title="Clear all searches"
        >
          Clear all
        </button>
      </div>

      {/* Recent Searches List */}
      <div className="space-y-3">
        {recentSearches.map((search, index) => (
          <div
            key={search.id}
            className="group flex items-center p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:scale-[1.02] hover:-translate-y-1 hover:bg-gradient-to-r hover:from-blue-25 hover:to-white active:scale-[0.98] active:translate-y-0"
            onClick={() => handleSearchSelect(search)}
            style={{
              animationDelay: `${index * 100}ms`,
              animation: 'fadeInScale 0.5s ease-out forwards'
            }}
          >
            {/* Route Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-3 mb-1">
                {/* From */}
                <div className="flex items-center">
                  <span className="text-lg mr-1">
                    {getCountryFlag(search.from.countryCode)}
                  </span>
                  <span className="font-semibold text-gray-900">
                    {search.from.iataCode}
                  </span>
                  <span className="text-sm text-gray-500 ml-1 hidden sm:inline">
                    {search.from.city}
                  </span>
                </div>
                
                {/* Arrow */}
                <div className="text-gray-400">
                  {search.tripType === 'roundtrip' ? '↔' : '→'}
                </div>
                
                {/* To */}
                <div className="flex items-center">
                  <span className="text-lg mr-1">
                    {getCountryFlag(search.to.countryCode)}
                  </span>
                  <span className="font-semibold text-gray-900">
                    {search.to.iataCode}
                  </span>
                  <span className="text-sm text-gray-500 ml-1 hidden sm:inline">
                    {search.to.city}
                  </span>
                </div>
              </div>
              
              {/* Trip Details */}
              <div className="text-xs text-gray-500 space-x-2">
                <span>{formatTravelDetails(search)}</span>
                <span>•</span>
                <span>{formatDate(search.searchedAt)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2 ml-4">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSearchSelect(search);
                }}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100 transform hover:scale-110 active:scale-95 hover:rotate-12"
                title="Search again"
              >
                <RotateCcw className="w-4 h-4 transition-transform group-hover:rotate-180" />
              </button>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeSearch(search.id);
                }}
                className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100 transform hover:scale-110 active:scale-95"
                title="Remove from history"
              >
                <X className="w-4 h-4 transition-transform hover:rotate-90" />
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {/* Footer Note */}
      <div className="mt-4 text-xs text-gray-500 text-center">
        Click any search to use it again
      </div>
      
      <style jsx>{`
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

// Export the addSearch function for use in parent components
export { type SearchHistory };