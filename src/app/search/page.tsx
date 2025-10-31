'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCurrency } from '@/contexts/CurrencyContext';
import Header from '@/components/ui/Header';
import EnhancedSearchForm from '@/components/forms/EnhancedSearchForm';
import FlightResults from '@/components/FlightResults';
import RecentSearches from '@/components/RecentSearches';
import { useRecentSearches } from '@/hooks/useRecentSearches';
import RecentSearchesSkeleton from '@/components/skeletons/RecentSearchesSkeleton';
import { Plane, TrendingUp, Clock, MapPin, Sparkles } from 'lucide-react';

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
  const router = useRouter();
  const searchParams = useSearchParams();
  const { formatPrice } = useCurrency();
  
  // Derive showResults from URL params - URL is source of truth
  const showResults = searchParams?.get('results') === 'true' && searchData !== null;
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
  
  // Reset search data when navigating away from results
  useEffect(() => {
    const hasResultsParam = searchParams?.get('results') === 'true';
    
    // If URL doesn't have results param, clear search data
    if (!hasResultsParam && searchData !== null) {
      console.log('⚠️ SearchPage: URL changed - clearing search data');
      setSearchData(null);
    }
  }, [searchParams, searchData]);

  const handleSearch = (data: SearchData) => {
    console.log('🔍 SearchPage: handleSearch called with data:', data);
    
    // Set search data first
    setSearchData(data);
    console.log('✅ SearchPage: searchData state updated');
    
    // Update URL - showResults will be derived from URL param
    router.push('/search?results=true', { scroll: false });
    console.log('✅ SearchPage: Router pushed to /search?results=true');
    
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

  const handleMultiCitySearch = async (data: any) => {
    console.log('🔍 Multi-city search:', data);
    // TODO: Implement multi-city search results
    // For now, just log the data
    alert('Multi-city search coming soon! Your search: ' + JSON.stringify(data, null, 2));
  };

  const handleFlexibleSearch = async (data: any) => {
    console.log('🔍 Flexible date search:', data);
    // TODO: Implement flexible date search results
    alert('Flexible date search coming soon! Your search: ' + JSON.stringify(data, null, 2));
  };

  const handleBackToSearch = () => {
    // Clear search data and navigate back - showResults derived from URL
    setSearchData(null);
    router.push('/search', { scroll: true });
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

  // Combined popular routes and destinations
  const popularOptions = [
    { type: 'route', from: 'JFK', to: 'LAX', label: 'New York → Los Angeles', city: 'Los Angeles', price: 299 },
    { type: 'route', from: 'JFK', to: 'LHR', label: 'New York → London', city: 'London', price: 549 },
    { type: 'route', from: 'LAX', to: 'NRT', label: 'Los Angeles → Tokyo', city: 'Tokyo', price: 649 },
    { type: 'route', from: 'JFK', to: 'CDG', label: 'New York → Paris', city: 'Paris', price: 519 },
    { type: 'route', from: 'LAX', to: 'SYD', label: 'Los Angeles → Sydney', city: 'Sydney', price: 849 },
    { type: 'route', from: 'JFK', to: 'DXB', label: 'New York → Dubai', city: 'Dubai', price: 779 },
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Header />
      
      {/* Hero Section - Compact & Clean */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white pt-12 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-3 flex items-center justify-center gap-3">
              <Plane className="w-10 h-10" />
              Search Flights
            </h1>
            <p className="text-lg text-blue-100 max-w-2xl mx-auto">
              Compare prices from hundreds of airlines and find the best deals
            </p>
          </div>
        </div>
      </section>

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 pb-16">
        
        {/* Search Form Card - Elevated & Prominent */}
        <div className="relative z-10 mb-8">
          <EnhancedSearchForm 
            onSearch={handleSearch}
            onMultiCitySearch={handleMultiCitySearch}
            onFlexibleSearch={handleFlexibleSearch}
          />
        </div>

        {/* Recent Searches - Directly Below Search Form */}
        {isClient && recentSearches.length > 0 && (
          <div className="mb-8">
            {isLoading ? (
              <RecentSearchesSkeleton />
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-fade-in">
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <h2 className="text-lg font-semibold text-gray-900">Recent Searches</h2>
                  {recentSearches.length > 0 && (
                    <button
                      onClick={clearRecentSearches}
                      className="ml-auto text-sm text-gray-500 hover:text-red-600 transition-colors"
                    >
                      Clear all
                    </button>
                  )}
                </div>
                <div className="space-y-2">
                  {recentSearches.slice(0, 3).map((search, index) => (
                    <button
                      key={index}
                      onClick={() => handleSelectRecentSearch(search)}
                      className="w-full flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-gray-900 font-medium">
                          <MapPin className="w-4 h-4 text-gray-600" />
                          <span>{search.from}</span>
                          <Plane className="w-4 h-4 text-gray-600 transform rotate-90" />
                          <span>{search.to}</span>
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(search.departDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          {search.returnDate && ` - ${new Date(search.returnDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                        </span>
                        <span className="text-sm text-gray-500">
                          {search.passengers} {search.passengers === 1 ? 'passenger' : 'passengers'}
                        </span>
                      </div>
                      <div className="text-blue-600 group-hover:translate-x-1 transition-transform">
                        →
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Popular Routes & Destinations - Combined Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-6 h-6 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">Popular Destinations & Routes</h2>
          </div>
          <p className="text-gray-600 mb-6">
            Discover trending destinations with the best flight deals
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {popularOptions.map((option, index) => (
              <button
                key={index}
                onClick={() => {
                  const data: SearchData = {
                    from: option.from,
                    to: option.to,
                    departDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    returnDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    passengers: 1,
                    tripType: 'roundtrip',
                    travelClass: 'economy'
                  };
                  handleSearch(data);
                }}
                className="group relative overflow-hidden rounded-xl border-2 border-gray-200 hover:border-blue-500 transition-all p-5 text-left hover:shadow-lg bg-gradient-to-br from-white to-gray-50"
              >
                {/* Background Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/0 to-blue-50/50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                
                <div className="relative">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg mb-1 group-hover:text-blue-600 transition-colors">
                        {option.city}
                      </h3>
                      <p className="text-sm text-gray-600 flex items-center gap-2">
                        <span className="font-medium">{option.from}</span>
                        <Plane className="w-3 h-3 transform rotate-90" />
                        <span className="font-medium">{option.to}</span>
                      </p>
                    </div>
                    <div className="p-2 rounded-full bg-blue-100 group-hover:bg-blue-500 transition-colors">
                      <Plane className="w-4 h-4 text-blue-600 group-hover:text-white transition-colors" />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">From</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {formatPrice(option.price)}
                      </p>
                    </div>
                    <div className="text-blue-600 group-hover:translate-x-2 transition-transform">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Travel Tips - Compact Cards */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-8 border border-blue-100">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Tips for Better Deals</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg p-5 border border-blue-100 shadow-sm">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                <span className="text-2xl">📅</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Book in Advance</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Domestic flights: 1-3 months ahead. International: 2-8 months ahead for best prices.
              </p>
            </div>

            <div className="bg-white rounded-lg p-5 border border-blue-100 shadow-sm">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
                <span className="text-2xl">📈</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Flexible Dates</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Tuesday-Thursday flights are often cheaper. Avoid peak holiday travel times.
              </p>
            </div>

            <div className="bg-white rounded-lg p-5 border border-blue-100 shadow-sm">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-3">
                <span className="text-2xl">⏰</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Off-Peak Hours</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Early morning and late evening flights typically offer lower fares.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
