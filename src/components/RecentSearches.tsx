'use client';

import { Clock, TrendingUp, X, Calendar, Users, Plane } from 'lucide-react';
import { RecentSearch } from '@/hooks/useRecentSearches';

interface RecentSearchesProps {
  searches: RecentSearch[];
  onSelectSearch: (search: RecentSearch) => void;
  onRemoveSearch: (id: string) => void;
  onClearAll: () => void;
  popularRoutes: Array<{
    from: string;
    to: string;
    fromName?: string;
    toName?: string;
    count: number;
  }>;
  popularDestinations?: Array<{
    code: string;
    count: number;
    name?: string;
    city?: string;
  }>;
  onSelectDestination?: (destination: string) => void;
}

export default function RecentSearches({
  searches,
  onSelectSearch,
  onRemoveSearch,
  onClearAll,
  popularRoutes,
  popularDestinations = [],
  onSelectDestination
}: RecentSearchesProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    });
  };

  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    const weeks = Math.floor(days / 7);
    if (weeks < 4) return `${weeks}w ago`;
    const months = Math.floor(days / 30);
    return `${months}mo ago`;
  };

  const getTravelClassDisplay = (travelClass?: string) => {
    switch (travelClass) {
      case 'economy': return 'Economy';
      case 'premium-economy': return 'Premium';
      case 'business': return 'Business';
      case 'first': return 'First';
      default: return 'Economy';
    }
  };

  if (searches.length === 0 && popularRoutes.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Recent Searches */}
      {searches.length > 0 && (
        <>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <Clock className="w-5 h-5 text-gray-500" />
              <span>Recent Searches</span>
            </h3>
            {searches.length > 2 && (
              <button
                onClick={onClearAll}
                className="text-xs text-gray-500 hover:text-red-600 transition-colors"
              >
                Clear all
              </button>
            )}
          </div>

          <div className="space-y-2">
            {searches.slice(0, 5).map((search) => (
              <div
                key={search.id}
                className="group flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => onSelectSearch(search)}
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-medium text-gray-900">
                      {search.from}
                    </span>
                    <Plane className="w-4 h-4 text-gray-400 transform rotate-90" />
                    <span className="font-medium text-gray-900">
                      {search.to}
                    </span>
                    {search.tripType === 'roundtrip' && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                        Round trip
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-4 text-xs text-gray-600">
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>
                        {formatDate(search.departDate)}
                        {search.returnDate && ` - ${formatDate(search.returnDate)}`}
                      </span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Users className="w-3 h-3" />
                      <span>{search.passengers} {search.passengers === 1 ? 'passenger' : 'passengers'}</span>
                    </span>
                    {search.travelClass && search.travelClass !== 'economy' && (
                      <span className="bg-gray-100 px-2 py-0.5 rounded">
                        {getTravelClassDisplay(search.travelClass)}
                      </span>
                    )}
                  </div>
                  
                  {(search.fromName || search.toName) && (
                    <div className="text-xs text-gray-500 mt-1">
                      {search.fromName && <span>{search.fromName}</span>}
                      {search.fromName && search.toName && <span> → </span>}
                      {search.toName && <span>{search.toName}</span>}
                    </div>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500">
                    {formatTimeAgo(search.timestamp)}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveSearch(search.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded transition-all"
                  >
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Popular Routes */}
      {popularRoutes.length > 0 && (
        <>
          {searches.length > 0 && <div className="border-t my-4"></div>}
          
          <div className="mb-3">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span>Your Popular Routes</span>
            </h3>
          </div>

          <div className="flex flex-wrap gap-2">
            {popularRoutes.map((route) => (
              <button
                key={`${route.from}-${route.to}`}
                onClick={() => {
                  const mostRecentSearch = searches.find(
                    s => s.from === route.from && s.to === route.to
                  );
                  if (mostRecentSearch) {
                    onSelectSearch(mostRecentSearch);
                  }
                }}
                className="inline-flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg hover:from-blue-100 hover:to-indigo-100 transition-colors"
              >
                <span className="text-sm font-medium text-blue-700">
                  {route.from} → {route.to}
                </span>
                {route.count > 1 && (
                  <span className="text-xs bg-white px-1.5 py-0.5 rounded text-blue-600">
                    {route.count}x
                  </span>
                )}
              </button>
            ))}
          </div>
        </>
      )}
      
      {/* Popular Destinations */}
      {popularDestinations.length > 0 && (
        <>
          {(searches.length > 0 || popularRoutes.length > 0) && <div className="border-t my-4"></div>}
          
          <div className="mb-3">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center space-x-2">
              <span className="text-purple-500">✈️</span>
              <span>Popular Destinations</span>
            </h3>
            <p className="text-xs text-gray-500 mt-1">Places you search for most often</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {popularDestinations.map((destination) => (
              <button
                key={destination.code}
                onClick={() => onSelectDestination?.(destination.code)}
                className="group p-3 bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-lg hover:from-purple-100 hover:to-pink-100 transition-all duration-200 text-left"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="font-bold text-purple-700 text-lg">{destination.code}</div>
                  <span className="text-xs bg-purple-200 text-purple-700 px-2 py-1 rounded-full font-medium">
                    {destination.count}x
                  </span>
                </div>
                <div className="text-sm text-gray-700 font-medium mb-1">
                  {destination.city || destination.code}
                </div>
                {destination.name && (
                  <div className="text-xs text-gray-500 truncate">
                    {destination.name}
                  </div>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
