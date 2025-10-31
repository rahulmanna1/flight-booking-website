'use client';

import { Plane, MapPin, TrendingUp, Leaf, DollarSign, Calendar } from 'lucide-react';
import { TravelStats } from '@/lib/services/travelStatsService';

interface TravelStatsWidgetsProps {
  stats: TravelStats;
  growth?: {
    bookingGrowth: number;
    spendingGrowth: number;
  };
}

export default function TravelStatsWidgets({ stats, growth }: TravelStatsWidgetsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Total Flights */}
      <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Flights</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalFlights}</p>
            <div className="flex items-center mt-2 space-x-2">
              <span className="text-xs text-gray-500">{stats.upcomingFlights} upcoming</span>
              <span className="text-xs text-gray-400">•</span>
              <span className="text-xs text-gray-500">{stats.completedFlights} completed</span>
            </div>
          </div>
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <Plane className="w-6 h-6 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Destinations */}
      <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Destinations</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{stats.citiesVisited}</p>
            <p className="text-xs text-gray-500 mt-2">
              {stats.countriesVisited} {stats.countriesVisited === 1 ? 'country' : 'countries'}
            </p>
          </div>
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <MapPin className="w-6 h-6 text-green-600" />
          </div>
        </div>
      </div>

      {/* Total Spent */}
      <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Spent</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              ${stats.totalSpent.toLocaleString()}
            </p>
            {growth && (
              <div className="flex items-center mt-2">
                <TrendingUp className={`w-4 h-4 ${growth.spendingGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                <span className={`text-xs ml-1 ${growth.spendingGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {growth.spendingGrowth >= 0 ? '+' : ''}{growth.spendingGrowth}% vs last year
                </span>
              </div>
            )}
          </div>
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
            <DollarSign className="w-6 h-6 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Carbon Footprint */}
      <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Carbon Footprint</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {(stats.carbonFootprint / 1000).toFixed(1)}t
            </p>
            <p className="text-xs text-gray-500 mt-2">
              CO₂ from {stats.milesFlown.toLocaleString()} miles
            </p>
          </div>
          <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
            <Leaf className="w-6 h-6 text-emerald-600" />
          </div>
        </div>
      </div>

      {/* Average Cost */}
      <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Avg. Flight Cost</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              ${stats.averageFlightCost.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Based on {stats.totalBookings} {stats.totalBookings === 1 ? 'booking' : 'bookings'}
            </p>
          </div>
          <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
            <Calendar className="w-6 h-6 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Favorite Destination */}
      {stats.favoriteDestination && (
        <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg shadow-md p-6 text-white col-span-1 md:col-span-2 lg:col-span-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-100">Favorite Destination</p>
              <p className="text-3xl font-bold mt-2">{stats.favoriteDestination}</p>
              {stats.mostUsedAirline && (
                <p className="text-sm text-blue-100 mt-2">
                  Most used airline: <span className="font-semibold">{stats.mostUsedAirline}</span>
                </p>
              )}
            </div>
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <MapPin className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
