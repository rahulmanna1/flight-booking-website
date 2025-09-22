'use client';

import { useState } from 'react';
import ImprovedSearchForm from '@/components/forms/ImprovedSearchForm';
import Header from '@/components/ui/Header';
import FlightResults from '@/components/FlightResults';
import RecentSearches from '@/components/RecentSearches';
import { useRecentSearches } from '@/hooks/useRecentSearches';
import RecentSearchesSkeleton from '@/components/skeletons/RecentSearchesSkeleton';
import KeyboardNavigationHelp from '@/components/accessibility/KeyboardNavigationHelp';
import { Plane, Clock, Shield, Globe, Loader2 } from 'lucide-react';
import { useCurrency } from '@/contexts/CurrencyContext';

interface SearchData {
  from: string;
  to: string;
  departDate: string;
  returnDate?: string;
  passengers: number;
  tripType: 'roundtrip' | 'oneway';
  travelClass?: string;
}

export default function Home() {
  const [searchData, setSearchData] = useState<SearchData | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [loadingDestination, setLoadingDestination] = useState<string | null>(null);
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
    // Pre-fill destination in search form
    // You could implement this by passing the destination to the search form component
    // For now, we'll create a basic search with common defaults
    const data: SearchData = {
      from: 'JFK', // Default origin, could be user's location or most common origin
      to: destinationCode,
      departDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
      passengers: 1,
      tripType: 'roundtrip',
      travelClass: 'economy'
    };
    handleSearch(data);
  };

  // Map city names to airport codes for destination cards
  const getCityAirportCode = (city: string) => {
    const cityToAirport: { [key: string]: string } = {
      'New York': 'JFK',
      'Paris': 'CDG',
      'Tokyo': 'NRT',
      'London': 'LHR',
      'Dubai': 'DXB',
      'Sydney': 'SYD'
    };
    return cityToAirport[city] || 'JFK';
  };

  const handleDestinationClick = async (city: string, price: number) => {
    setLoadingDestination(city);
    
    // Simulate a brief loading delay for better UX
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const destinationCode = getCityAirportCode(city);
    const data: SearchData = {
      from: 'JFK', // Default origin - could be enhanced with user's location
      to: destinationCode,
      departDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 weeks from now
      returnDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 3 weeks from now
      passengers: 1,
      tripType: 'roundtrip',
      travelClass: 'economy'
    };
    
    handleSearch(data);
    setLoadingDestination(null);
  };

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
      <section className="relative bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">
            Find Your Perfect Flight
          </h1>
          <p className="text-lg md:text-xl mb-6 text-blue-100">
            Search, compare, and book flights to destinations worldwide
          </p>
        </div>
      </section>

      {/* Search Form Section */}
      <section className="py-8 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ImprovedSearchForm onSearch={handleSearch} />
          
          {/* Recent Searches */}
          {isClient && (
            <div className="mt-8">
              {isLoading ? (
                <RecentSearchesSkeleton />
              ) : (recentSearches.length > 0 || getPopularRoutes().length > 0 || getPopularDestinations().length > 0) ? (
                <div className="animate-fade-in">
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
              ) : null}
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose FlightBooker?
            </h2>
            <p className="text-lg text-gray-600">
              We make flight booking simple, fast, and secure
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center group cursor-pointer">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 transition-all duration-300 group-hover:scale-110 group-hover:bg-blue-200 group-hover:shadow-lg">
                <Plane className="w-8 h-8 text-blue-600 transition-all duration-300 group-hover:scale-110 group-hover:text-blue-700" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2 transition-colors group-hover:text-blue-600">
                Wide Selection
              </h3>
              <p className="text-gray-600 transition-colors group-hover:text-gray-700">
                Access to hundreds of airlines and thousands of destinations worldwide
              </p>
            </div>
            
            <div className="text-center group cursor-pointer">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 transition-all duration-300 group-hover:scale-110 group-hover:bg-green-200 group-hover:shadow-lg">
                <Clock className="w-8 h-8 text-green-600 transition-all duration-300 group-hover:scale-110 group-hover:text-green-700" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2 transition-colors group-hover:text-green-600">
                Quick Booking
              </h3>
              <p className="text-gray-600 transition-colors group-hover:text-gray-700">
                Book your flights in just a few clicks with our streamlined process
              </p>
            </div>
            
            <div className="text-center group cursor-pointer">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 transition-all duration-300 group-hover:scale-110 group-hover:bg-purple-200 group-hover:shadow-lg">
                <Shield className="w-8 h-8 text-purple-600 transition-all duration-300 group-hover:scale-110 group-hover:text-purple-700" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2 transition-colors group-hover:text-purple-600">
                Secure Payment
              </h3>
              <p className="text-gray-600 transition-colors group-hover:text-gray-700">
                Your payment information is protected with bank-level security
              </p>
            </div>
            
            <div className="text-center group cursor-pointer">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 transition-all duration-300 group-hover:scale-110 group-hover:bg-orange-200 group-hover:shadow-lg">
                <Globe className="w-8 h-8 text-orange-600 transition-all duration-300 group-hover:scale-110 group-hover:text-orange-700" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2 transition-colors group-hover:text-orange-600">
                24/7 Support
              </h3>
              <p className="text-gray-600 transition-colors group-hover:text-gray-700">
                Get help whenever you need it with our round-the-clock customer support
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Destinations */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Popular Destinations
            </h2>
            <p className="text-lg text-gray-600">
              Discover amazing places around the world
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { city: 'New York', country: 'USA', price: 299, image: 'ny' },
              { city: 'Paris', country: 'France', price: 599, image: 'paris' },
              { city: 'Tokyo', country: 'Japan', price: 899, image: 'tokyo' },
              { city: 'London', country: 'UK', price: 459, image: 'london' },
              { city: 'Dubai', country: 'UAE', price: 799, image: 'dubai' },
              { city: 'Sydney', country: 'Australia', price: 1299, image: 'sydney' },
            ].map((destination, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:scale-105 cursor-pointer group">
                <div className="h-48 bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center relative overflow-hidden">
                  <span className="text-white text-6xl font-bold opacity-20 group-hover:opacity-30 transition-opacity">
                    {destination.city.charAt(0)}
                  </span>
                  <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity"></div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                    {destination.city}
                  </h3>
                  <p className="text-gray-600 mb-3">{destination.country}</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-2xl font-bold text-blue-600">
                        {formatPrice(destination.price)}
                      </span>
                      <p className="text-xs text-gray-500">from</p>
                    </div>
                    <button 
                      onClick={() => handleDestinationClick(destination.city, destination.price)}
                      disabled={loadingDestination === destination.city}
                      className={`px-4 py-2 rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center space-x-2 min-w-[120px] justify-center ${
                        loadingDestination === destination.city
                          ? 'bg-blue-500 cursor-not-allowed' 
                          : 'bg-blue-600 text-white hover:bg-blue-700 transform hover:scale-105'
                      }`}
                    >
                      {loadingDestination === destination.city ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Searching...</span>
                        </>
                      ) : (
                        <span>View Flights</span>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Keyboard Navigation Help */}
      <KeyboardNavigationHelp />
    </div>
  );
}
