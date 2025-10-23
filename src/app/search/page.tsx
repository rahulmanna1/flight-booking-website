'use client';

import { useState } from 'react';
import { useCurrency } from '@/contexts/CurrencyContext';
import Header from '@/components/ui/Header';
import SearchForm from '@/components/forms/SearchForm';
import FlightResults from '@/components/FlightResults';
import RecentSearches from '@/components/RecentSearches';
import { useRecentSearches } from '@/hooks/useRecentSearches';
import RecentSearchesSkeleton from '@/components/skeletons/RecentSearchesSkeleton';
import { Plane, TrendingUp, Clock } from 'lucide-react';

interface SearchData {
  from: string;
  to: string;
  departDate: string;
  returnDate?: string;
  passengers: number;
  tripType: 'roundtrip' | 'oneway';
  travelClass?: string;
}

export default function SearchPage() {
  const [searchData, setSearchData] = useState<SearchData | null>(null);
  const [showResults, setShowResults] = useState(false);
  const { formatPrice } = useCurrency();
  const { 
    recentSearches, 
    addRecentSearch, 
    removeRecentSearch, 
    clearRecentSearches,
    getPopularRoutes,
    getPopularDestinations,
    isClient,
    isLoading 
  } = useRecentSearches();

  const handleSearch = (data: SearchData) => {
    setSearchData(data);
    setShowResults(true);
    
    // Add to recent searches
    addRecentSearch({
      from: data.from,
      to: data.to,
      departDate: data.departDate,
      returnDate: data.returnDate,
      passengers: data.passengers,
      tripType: data.tripType,
      travelClass: data.travelClass
    });
  };

  const handleBackToSearch = () => {
    setShowResults(false);
  };
  
  const handleSelectRecentSearch = (search: any) => {
    const data: SearchData = {
      from: search.from,
      to: search.to,
      departDate: search.departDate,
      returnDate: search.returnDate || '',
      passengers: search.passengers,
      tripType: search.tripType,
      travelClass: search.travelClass
    };
    handleSearch(data);
  };

  const handleSelectDestination = (destinationCode: string) => {
    const data: SearchData = {
      from: 'JFK', // Default origin
      to: destinationCode,
      departDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      passengers: 1,
      tripType: 'roundtrip',
      travelClass: 'economy'
    };
    handleSearch(data);
  };

  // Popular routes for search suggestions
  const popularRoutes = [
    { from: 'JFK', to: 'LAX', route: 'New York → Los Angeles', price: 299 },
    { from: 'JFK', to: 'LHR', route: 'New York → London', price: 549 },
    { from: 'LAX', to: 'NRT', route: 'Los Angeles → Tokyo', price: 649 },
    { from: 'JFK', to: 'CDG', route: 'New York → Paris', price: 519 },
    { from: 'LAX', to: 'SYD', route: 'Los Angeles → Sydney', price: 849 },
    { from: 'JFK', to: 'DXB', route: 'New York → Dubai', price: 779 },
  ];

  if (showResults && searchData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <FlightResults searchData={searchData} onBack={handleBackToSearch} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <Plane className="w-12 h-12 mr-3" />
            <h1 className="text-4xl md:text-5xl font-bold">
              Search Flights
            </h1>
          </div>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Find and compare flights from hundreds of airlines to destinations worldwide. 
            Get the best deals on your next trip.
          </p>
        </div>
      </section>

      {/* Search Form Section */}
      <section className="py-12 -mt-8 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SearchForm onSearch={handleSearch} />
          
          {/* Recent Searches */}
          {isClient && (
            <div className="mt-8">
              {isLoading ? (
                <RecentSearchesSkeleton />
              ) : (recentSearches.length > 0 || getPopularRoutes().length > 0 || getPopularDestinations().length > 0) ? (
                <div className="animate-fade-in">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center gap-2 mb-6">
                      <Clock className="w-5 h-5 text-blue-600" />
                      <h2 className="text-lg font-semibold text-gray-900">Recent & Popular Searches</h2>
                    </div>
                    <RecentSearches
                      searches={recentSearches}
                      onSelectSearch={handleSelectRecentSearch}
                      onRemoveSearch={removeRecentSearch}
                      onClearAll={clearRecentSearches}
                      popularRoutes={getPopularRoutes()}
                      popularDestinations={getPopularDestinations()}
                      onSelectDestination={handleSelectDestination}
                    />
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </section>

      {/* Popular Routes Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <TrendingUp className="w-8 h-8 text-blue-600 mr-2" />
              <h2 className="text-3xl font-bold text-gray-900">
                Popular Routes
              </h2>
            </div>
            <p className="text-lg text-gray-600">
              Discover trending destinations and great deals
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularRoutes.map((route, index) => (
              <div 
                key={index}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border border-gray-200"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">
                      {route.route}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {route.from} • {route.to}
                    </p>
                  </div>
                  <Plane className="w-6 h-6 text-blue-600" />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Starting from</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {formatPrice(route.price)}
                    </p>
                  </div>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm">
                    Search Flights
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Search Tips Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Flight Search Tips
            </h2>
            <p className="text-lg text-gray-600">
              Get the best deals with these helpful tips
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📅</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Book in Advance
              </h3>
              <p className="text-gray-600">
                Book domestic flights 1-3 months ahead and international flights 2-8 months ahead for better prices.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📈</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Flexible Dates
              </h3>
              <p className="text-gray-600">
                Flying on weekdays (Tuesday-Thursday) is often cheaper than weekends. Avoid major holidays.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⏰</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Off-Peak Hours
              </h3>
              <p className="text-gray-600">
                Early morning and late evening flights are often cheaper than prime time departures.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
