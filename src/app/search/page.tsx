'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/ui/Header';
import SearchForm from '@/components/forms/SearchForm';
import FlightCard from '@/components/cards/FlightCard';
import { Filter, SortAsc } from 'lucide-react';

// Mock flight data
const mockFlights = [
  {
    id: '1',
    airline: 'American Airlines',
    flightNumber: 'AA 123',
    origin: 'NYC',
    destination: 'LAX',
    departTime: '08:30',
    arriveTime: '11:45',
    duration: '6h 15m',
    price: 299,
    stops: 0,
    aircraft: 'Boeing 737-800'
  },
  {
    id: '2',
    airline: 'Delta Airlines',
    flightNumber: 'DL 456',
    origin: 'NYC',
    destination: 'LAX',
    departTime: '14:20',
    arriveTime: '17:55',
    duration: '6h 35m',
    price: 349,
    stops: 0,
    aircraft: 'Airbus A320'
  },
  {
    id: '3',
    airline: 'United Airlines',
    flightNumber: 'UA 789',
    origin: 'NYC',
    destination: 'LAX',
    departTime: '10:15',
    arriveTime: '15:30',
    duration: '8h 15m',
    price: 279,
    stops: 1,
    aircraft: 'Boeing 737-900'
  },
  {
    id: '4',
    airline: 'JetBlue Airways',
    flightNumber: 'B6 321',
    origin: 'NYC',
    destination: 'LAX',
    departTime: '18:45',
    arriveTime: '22:10',
    duration: '6h 25m',
    price: 329,
    stops: 0,
    aircraft: 'Airbus A321'
  },
];

export default function SearchPage() {
  const [flights, setFlights] = useState(mockFlights);
  const [sortBy, setSortBy] = useState('price');
  const [filterOpen, setFilterOpen] = useState(false);
  const router = useRouter();

  const handleFlightSelect = (flightId: string) => {
    router.push(`/booking/${flightId}`);
  };

  const sortFlights = (criteria: string) => {
    const sorted = [...flights].sort((a, b) => {
      switch (criteria) {
        case 'price':
          return a.price - b.price;
        case 'duration':
          return parseInt(a.duration) - parseInt(b.duration);
        case 'departure':
          return a.departTime.localeCompare(b.departTime);
        default:
          return 0;
      }
    });
    setFlights(sorted);
    setSortBy(criteria);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Search Form */}
      <section className="py-8 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SearchForm />
        </div>
      </section>

      {/* Results Section */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Results Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Flight Results</h1>
              <p className="text-gray-600">NYC to LAX • {flights.length} flights found</p>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Sort Options */}
              <div className="flex items-center space-x-2">
                <SortAsc className="w-4 h-4 text-gray-400" />
                <select
                  value={sortBy}
                  onChange={(e) => sortFlights(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="price">Sort by Price</option>
                  <option value="duration">Sort by Duration</option>
                  <option value="departure">Sort by Departure</option>
                </select>
              </div>
              
              {/* Filter Button */}
              <button
                onClick={() => setFilterOpen(!filterOpen)}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                <Filter className="w-4 h-4" />
                <span>Filters</span>
              </button>
            </div>
          </div>

          {/* Filter Panel */}
          {filterOpen && (
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter Options</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price Range
                  </label>
                  <div className="space-y-2">
                    <input type="range" min="0" max="500" className="w-full" />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>$0</span>
                      <span>$500+</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Airlines
                  </label>
                  <div className="space-y-2">
                    {['American Airlines', 'Delta Airlines', 'United Airlines', 'JetBlue Airways'].map(airline => (
                      <label key={airline} className="flex items-center">
                        <input type="checkbox" className="mr-2" />
                        <span className="text-sm text-gray-700">{airline}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stops
                  </label>
                  <div className="space-y-2">
                    {['Direct flights only', '1 stop', '2+ stops'].map(option => (
                      <label key={option} className="flex items-center">
                        <input type="checkbox" className="mr-2" />
                        <span className="text-sm text-gray-700">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Flight Results */}
          <div className="space-y-4">
            {flights.map(flight => (
              <FlightCard
                key={flight.id}
                flight={flight}
                onSelect={handleFlightSelect}
              />
            ))}
          </div>

          {/* No Results */}
          {flights.length === 0 && (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No flights found</h3>
              <p className="text-gray-600">Try adjusting your search criteria or filters.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}