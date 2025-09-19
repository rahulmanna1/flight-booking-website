'use client';

import { useState } from 'react';
import ImprovedSearchForm from '@/components/forms/ImprovedSearchForm';
import Header from '@/components/ui/Header';
import FlightResults from '@/components/FlightResults';
import RecentSearches from '@/components/RecentSearches';
import { useRecentSearches } from '@/hooks/useRecentSearches';
import { Plane, Clock, Shield, Globe } from 'lucide-react';
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
  const { formatPrice } = useCurrency();
  const { 
    recentSearches, 
    addRecentSearch, 
    removeRecentSearch, 
    clearRecentSearches,
    getPopularRoutes,
    isClient 
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
          {isClient && (recentSearches.length > 0 || getPopularRoutes().length > 0) && (
            <div className="mt-8">
              <RecentSearches
                searches={recentSearches}
                onSelectSearch={handleSelectRecentSearch}
                onRemoveSearch={removeRecentSearch}
                onClearAll={clearRecentSearches}
                popularRoutes={getPopularRoutes()}
              />
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
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plane className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Wide Selection
              </h3>
              <p className="text-gray-600">
                Access to hundreds of airlines and thousands of destinations worldwide
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Quick Booking
              </h3>
              <p className="text-gray-600">
                Book your flights in just a few clicks with our streamlined process
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Secure Payment
              </h3>
              <p className="text-gray-600">
                Your payment information is protected with bank-level security
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                24/7 Support
              </h3>
              <p className="text-gray-600">
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
              <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-48 bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center">
                  <span className="text-white text-6xl font-bold opacity-20">
                    {destination.city.charAt(0)}
                  </span>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">
                    {destination.city}
                  </h3>
                  <p className="text-gray-600 mb-3">{destination.country}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-blue-600">
                      {formatPrice(destination.price)}
                    </span>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                      View Flights
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
