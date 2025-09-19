'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, Star, Sun, Snowflake, Leaf, Plane, MapPin, Cloud } from 'lucide-react';
import { Airport } from '@/app/api/airports/search/route';

interface PopularDestinationsProps {
  onDestinationSelect: (airport: Airport) => void;
  userLocation?: GeolocationPosition;
  className?: string;
}

// Popular destinations inspired by top travel platforms
const POPULAR_DESTINATIONS = {
  trending: [
    { iataCode: 'LHR', city: 'London', country: 'United Kingdom', countryCode: 'GB', name: 'Heathrow Airport', type: 'airport' as const, description: 'Europe\'s busiest hub' },
    { iataCode: 'DXB', city: 'Dubai', country: 'United Arab Emirates', countryCode: 'AE', name: 'Dubai International Airport', type: 'airport' as const, description: 'Luxury shopping & dining' },
    { iataCode: 'CDG', city: 'Paris', country: 'France', countryCode: 'FR', name: 'Charles de Gaulle Airport', type: 'airport' as const, description: 'City of lights & romance' },
    { iataCode: 'JFK', city: 'New York', country: 'United States', countryCode: 'US', name: 'John F. Kennedy International Airport', type: 'airport' as const, description: 'The city that never sleeps' },
    { iataCode: 'NRT', city: 'Tokyo', country: 'Japan', countryCode: 'JP', name: 'Narita International Airport', type: 'airport' as const, description: 'Modern culture meets tradition' },
    { iataCode: 'SIN', city: 'Singapore', country: 'Singapore', countryCode: 'SG', name: 'Singapore Changi Airport', type: 'airport' as const, description: 'Garden city of Asia' }
  ],
  
  summer: [
    { iataCode: 'BCN', city: 'Barcelona', country: 'Spain', countryCode: 'ES', name: 'Barcelona-El Prat Airport', type: 'airport' as const, description: 'Beaches & Gaudí architecture' },
    { iataCode: 'FCO', city: 'Rome', country: 'Italy', countryCode: 'IT', name: 'Leonardo da Vinci International Airport', type: 'airport' as const, description: 'Eternal city of history' },
    { iataCode: 'ATH', city: 'Athens', country: 'Greece', countryCode: 'GR', name: 'Athens International Airport', type: 'airport' as const, description: 'Ancient wonders & islands' },
    { iataCode: 'CPH', city: 'Copenhagen', country: 'Denmark', countryCode: 'DK', name: 'Copenhagen Airport', type: 'airport' as const, description: 'Scandinavian design hub' },
    { iataCode: 'LIS', city: 'Lisbon', country: 'Portugal', countryCode: 'PT', name: 'Humberto Delgado Airport', type: 'airport' as const, description: 'Coastal charm & pastéis' },
    { iataCode: 'IST', city: 'Istanbul', country: 'Turkey', countryCode: 'TR', name: 'Istanbul Airport', type: 'airport' as const, description: 'Where East meets West' }
  ],
  
  winter: [
    { iataCode: 'BKK', city: 'Bangkok', country: 'Thailand', countryCode: 'TH', name: 'Suvarnabhumi Airport', type: 'airport' as const, description: 'Street food & temples' },
    { iataCode: 'DEL', city: 'Delhi', country: 'India', countryCode: 'IN', name: 'Indira Gandhi International Airport', type: 'airport' as const, description: 'Capital city & history' },
    { iataCode: 'CAI', city: 'Cairo', country: 'Egypt', countryCode: 'EG', name: 'Cairo International Airport', type: 'airport' as const, description: 'Pyramids & Nile cruises' },
    { iataCode: 'HKG', city: 'Hong Kong', country: 'Hong Kong', countryCode: 'HK', name: 'Hong Kong International Airport', type: 'airport' as const, description: 'Skyline & dim sum' },
    { iataCode: 'MEL', city: 'Melbourne', country: 'Australia', countryCode: 'AU', name: 'Melbourne Airport', type: 'airport' as const, description: 'Coffee culture capital' },
    { iataCode: 'SYD', city: 'Sydney', country: 'Australia', countryCode: 'AU', name: 'Kingsford Smith Airport', type: 'airport' as const, description: 'Harbor views & beaches' }
  ],
  
  spring: [
    { iataCode: 'AMS', city: 'Amsterdam', country: 'Netherlands', countryCode: 'NL', name: 'Amsterdam Airport Schiphol', type: 'airport' as const, description: 'Tulips & canal cruises' },
    { iataCode: 'VIE', city: 'Vienna', country: 'Austria', countryCode: 'AT', name: 'Vienna International Airport', type: 'airport' as const, description: 'Imperial palaces & music' },
    { iataCode: 'PRG', city: 'Prague', country: 'Czech Republic', countryCode: 'CZ', name: 'Václav Havel Airport Prague', type: 'airport' as const, description: 'Fairytale architecture' },
    { iataCode: 'ZUR', city: 'Zurich', country: 'Switzerland', countryCode: 'CH', name: 'Zurich Airport', type: 'airport' as const, description: 'Alpine beauty & precision' },
    { iataCode: 'MUC', city: 'Munich', country: 'Germany', countryCode: 'DE', name: 'Munich Airport', type: 'airport' as const, description: 'Bavarian culture & beer' },
    { iataCode: 'SEA', city: 'Seattle', country: 'United States', countryCode: 'US', name: 'Seattle-Tacoma International Airport', type: 'airport' as const, description: 'Tech hub & coffee scene' }
  ]
};

// Get country flag emoji with fallback
const getCountryFlag = (countryCode: string): string => {
  // Map of country codes to flag emojis for better compatibility
  const flags: { [key: string]: string } = {
    'GB': '🇬🇧', 'AE': '🇦🇪', 'FR': '🇫🇷', 'US': '🇺🇸', 'JP': '🇯🇵', 'SG': '🇸🇬',
    'ES': '🇪🇸', 'IT': '🇮🇹', 'GR': '🇬🇷', 'DK': '🇩🇰', 'PT': '🇵🇹', 'TR': '🇹🇷',
    'TH': '🇹🇭', 'IN': '🇮🇳', 'EG': '🇪🇬', 'HK': '🇭🇰', 'AU': '🇦🇺', 'NL': '🇳🇱',
    'AT': '🇦🇹', 'CZ': '🇨🇿', 'CH': '🇨🇭', 'DE': '🇩🇪'
  };
  
  return flags[countryCode] || '🌍';
};

// Get current season based on month
const getCurrentSeason = (): 'spring' | 'summer' | 'winter' => {
  const month = new Date().getMonth();
  
  // Northern hemisphere seasons (default)
  if (month >= 2 && month <= 4) return 'spring';  // Mar-May
  if (month >= 5 && month <= 7) return 'summer';  // Jun-Aug
  return 'winter'; // Sep-Feb
};

// Season icons
const getSeasonIcon = (season: string) => {
  switch (season) {
    case 'spring': return <Leaf className="w-4 h-4" />;
    case 'summer': return <Sun className="w-4 h-4" />;
    case 'winter': return <Snowflake className="w-4 h-4" />;
    default: return <Cloud className="w-4 h-4" />;
  }
};

export default function PopularDestinations({ 
  onDestinationSelect, 
  userLocation,
  className = ''
}: PopularDestinationsProps) {
  const [selectedCategory, setSelectedCategory] = useState<'trending' | 'spring' | 'summer' | 'winter'>('trending');
  const [currentSeason] = useState(getCurrentSeason());

  // Auto-select current season on mount
  useEffect(() => {
    setSelectedCategory(currentSeason);
  }, [currentSeason]);

  const handleDestinationClick = (destination: Airport) => {
    onDestinationSelect(destination);
  };

  const categories = [
    { 
      id: 'trending' as const, 
      label: 'Trending Now', 
      icon: <TrendingUp className="w-4 h-4" />,
      color: 'bg-gradient-to-r from-red-500 to-pink-500 text-white',
      hoverColor: 'hover:from-red-600 hover:to-pink-600'
    },
    { 
      id: 'summer' as const, 
      label: 'Summer Escapes', 
      icon: <Sun className="w-4 h-4" />,
      color: 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white',
      hoverColor: 'hover:from-yellow-500 hover:to-orange-600'
    },
    { 
      id: 'winter' as const, 
      label: 'Winter Warmth', 
      icon: <Snowflake className="w-4 h-4" />,
      color: 'bg-gradient-to-r from-blue-500 to-teal-500 text-white',
      hoverColor: 'hover:from-blue-600 hover:to-teal-600'
    },
    { 
      id: 'spring' as const, 
      label: 'Spring Adventures', 
      icon: <Leaf className="w-4 h-4" />,
      color: 'bg-gradient-to-r from-green-400 to-emerald-500 text-white',
      hoverColor: 'hover:from-green-500 hover:to-emerald-600'
    }
  ];

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden ${className}`}>
      {/* Header with better styling */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-900 flex items-center">
              <div className="p-2 bg-white rounded-full shadow-sm mr-3">
                <MapPin className="w-5 h-5 text-blue-600" />
              </div>
              Popular Destinations
            </h3>
            <p className="text-sm text-gray-600 mt-1">Discover trending travel spots worldwide</p>
          </div>
          <Plane className="w-8 h-8 text-blue-400 opacity-60" />
        </div>
      </div>

      <div className="p-6">
        {/* Enhanced Category Tabs */}
        <div className="flex flex-wrap gap-3 mb-6">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`group relative flex items-center px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 transform hover:scale-105 ${
                selectedCategory === category.id
                  ? `${category.color} shadow-lg`
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <div className="flex items-center">
                {category.icon}
                <span className="ml-2">{category.label}</span>
              </div>
              
              {selectedCategory === category.id && (
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white rounded-full shadow-sm" />
              )}
              
              {category.id === currentSeason && selectedCategory !== category.id && (
                <div className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              )}
            </button>
          ))}
        </div>

        {/* Enhanced Destinations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {POPULAR_DESTINATIONS[selectedCategory].map((destination, index) => (
            <button
              key={`${selectedCategory}-${destination.iataCode}-${index}`}
              onClick={() => handleDestinationClick(destination)}
              className="group relative bg-white border border-gray-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-md transition-all duration-200 text-left transform hover:scale-[1.02]"
              style={{
                animationDelay: `${index * 50}ms`,
                animation: 'fadeInUp 0.4s ease-out forwards'
              }}
            >
              <div className="flex items-start space-x-4">
                {/* Enhanced Flag Display */}
                <div className="relative">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-xl font-semibold shadow-sm">
                    {getCountryFlag(destination.countryCode)}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shadow-sm">
                    <Plane className="w-3 h-3 text-white" />
                  </div>
                </div>
                
                {/* Enhanced Destination Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors text-lg">
                      {destination.city}
                    </h4>
                    <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded text-gray-600">
                      {destination.iataCode}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-2">
                    {destination.country}
                  </p>
                  
                  {destination.description && (
                    <p className="text-xs text-gray-500 italic">
                      {destination.description}
                    </p>
                  )}
                </div>

                {/* Enhanced Arrow */}
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 group-hover:bg-blue-100 transition-colors">
                  <span className="text-blue-600 group-hover:translate-x-0.5 transition-transform text-lg">→</span>
                </div>
              </div>
              
              {/* Subtle gradient overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </button>
          ))}
        </div>

        {/* Enhanced Footer */}
        <div className="mt-6 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
            <Star className="w-4 h-4 text-yellow-500" />
            <span>
              {selectedCategory === 'trending' && 'Most searched destinations this month'}
              {selectedCategory === currentSeason && selectedCategory !== 'trending' && `Perfect for ${selectedCategory} travel`}
              {selectedCategory !== currentSeason && selectedCategory !== 'trending' && `Great destinations for ${selectedCategory}`}
            </span>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}