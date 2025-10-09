'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plane, Calendar, Users, ArrowRight, ArrowLeftRight, MapPin, Search } from 'lucide-react';
import AirportSearchInput from './AirportSearchInput';
import PopularDestinations from './PopularDestinations';
import { Airport } from '@/app/api/airports/search/route';

const searchSchema = z.object({
  from: z.string().min(1, 'Origin is required'),
  to: z.string().min(1, 'Destination is required'),
  departDate: z.string().min(1, 'Departure date is required')
    .refine((date) => {
      const today = new Date();
      const depDate = new Date(date);
      today.setHours(0, 0, 0, 0);
      depDate.setHours(0, 0, 0, 0);
      return depDate >= today;
    }, 'Departure date cannot be in the past'),
  returnDate: z.string().optional(),
  passengers: z.number().min(1, 'At least 1 passenger required'),
  tripType: z.enum(['roundtrip', 'oneway']),
  travelClass: z.enum(['economy', 'premium-economy', 'business', 'first']),
}).refine((data) => {
  if (data.tripType === 'roundtrip' && data.returnDate) {
    const depDate = new Date(data.departDate);
    const retDate = new Date(data.returnDate);
    return retDate > depDate;
  }
  return true;
}, {
  message: 'Return date must be after departure date',
  path: ['returnDate'],
}).refine((data) => {
  return data.from !== data.to;
}, {
  message: 'Origin and destination must be different',
  path: ['to'],
});

type SearchFormData = z.infer<typeof searchSchema>;

interface ImprovedSearchFormProps {
  onSearch?: (data: SearchFormData) => void;
}

export default function ImprovedSearchForm({ onSearch }: ImprovedSearchFormProps) {
  const [tripType, setTripType] = useState<'roundtrip' | 'oneway'>('roundtrip');
  const [selectedFromAirport, setSelectedFromAirport] = useState<Airport | null>(null);
  const [selectedToAirport, setSelectedToAirport] = useState<Airport | null>(null);
  
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<SearchFormData>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      tripType: 'roundtrip',
      passengers: 1,
      travelClass: 'economy',
    }
  });

  const watchedFrom = watch('from');
  const watchedTo = watch('to');
  
  const onSubmit = (data: SearchFormData) => {
    if (onSearch) {
      onSearch(data);
    }
  };

  const handleFromAirportChange = (airportCode: string, airport?: Airport) => {
    setValue('from', airportCode);
    setSelectedFromAirport(airport || null);
  };

  const handleToAirportChange = (airportCode: string, airport?: Airport) => {
    setValue('to', airportCode);
    setSelectedToAirport(airport || null);
  };

  const handleSwapAirports = () => {
    const currentFrom = watchedFrom;
    const currentTo = watchedTo;
    setValue('from', currentTo);
    setValue('to', currentFrom);
    const tempAirport = selectedFromAirport;
    setSelectedFromAirport(selectedToAirport);
    setSelectedToAirport(tempAirport);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-7xl mx-auto border border-gray-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">
              Book Your Perfect Flight
            </h2>
            <p className="text-blue-100">
              Search and compare flights from top airlines worldwide
            </p>
          </div>
          
          {/* Trip Type Toggle - Compact */}
          <div className="bg-white/15 backdrop-blur-sm rounded-xl p-1 inline-flex gap-1">
            <button
              type="button"
              onClick={() => {
                setTripType('roundtrip');
                setValue('tripType', 'roundtrip');
              }}
              className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
                tripType === 'roundtrip' 
                  ? 'bg-white text-blue-700 shadow-md' 
                  : 'text-white/90 hover:text-white hover:bg-white/10'
              }`}
            >
              <ArrowLeftRight className="w-4 h-4" />
              Round Trip
            </button>
            <button
              type="button"
              onClick={() => {
                setTripType('oneway');
                setValue('tripType', 'oneway');
              }}
              className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
                tripType === 'oneway' 
                  ? 'bg-white text-blue-700 shadow-md' 
                  : 'text-white/90 hover:text-white hover:bg-white/10'
              }`}
            >
              <ArrowRight className="w-4 h-4" />
              One Way
            </button>
          </div>
        </div>
      </div>

      {/* Form - Single Row Industry Standard Layout */}
      <form onSubmit={handleSubmit(onSubmit)} className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
          {/* FROM - 3 columns */}
          <div className="lg:col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              From
            </label>
            <AirportSearchInput
              label=""
              placeholder="City or airport"
              value={watchedFrom || ''}
              onChange={handleFromAirportChange}
              error={errors.from?.message}
            />
          </div>
          
          {/* SWAP - 1 column */}
          <div className="lg:col-span-1 flex justify-center items-end pb-3">
            <button
              type="button"
              onClick={handleSwapAirports}
              className="bg-gray-100 hover:bg-blue-50 border border-gray-300 hover:border-blue-400 text-gray-600 hover:text-blue-600 rounded-full p-2.5 transition-all duration-200"
              title="Swap airports"
            >
              <ArrowLeftRight className="w-4 h-4" />
            </button>
          </div>
          
          {/* TO - 3 columns */}
          <div className="lg:col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              To
            </label>
            <AirportSearchInput
              label=""
              placeholder="City or airport"
              value={watchedTo || ''}
              onChange={handleToAirportChange}
              error={errors.to?.message}
            />
          </div>
          
          {/* DEPARTURE DATE - 2 columns */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Departure
            </label>
            <input
              {...register('departDate')}
              type="date"
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900 font-medium hover:border-gray-300"
            />
          </div>
          
          {/* RETURN DATE - 2 columns (conditional) */}
          {tripType === 'roundtrip' && (
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Return
              </label>
              <input
                {...register('returnDate')}
                type="date"
                min={watch('departDate') || new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900 font-medium hover:border-gray-300"
              />
            </div>
          )}
          
          {/* TRAVELERS - 1 column */}
          <div className={tripType === 'roundtrip' ? 'lg:col-span-1' : 'lg:col-span-2'}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Travelers
            </label>
            <div className="relative">
              <select
                {...register('passengers', { valueAsNumber: true })}
                className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-medium bg-white appearance-none hover:border-gray-300 transition-all"
              >
                {[1,2,3,4,5,6,7,8,9].map(num => (
                  <option key={num} value={num}>
                    {num}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
          
          {/* CLASS - 1 column */}
          <div className={tripType === 'roundtrip' ? 'lg:col-span-1' : 'lg:col-span-1'}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Class
            </label>
            <div className="relative">
              <select
                {...register('travelClass')}
                className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-medium bg-white appearance-none hover:border-gray-300 transition-all"
              >
                <option value="economy">Economy</option>
                <option value="premium-economy">Premium</option>
                <option value="business">Business</option>
                <option value="first">First</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>
        
        {/* Error Messages */}
        {(errors.from || errors.to || errors.departDate || errors.returnDate) && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="space-y-1">
              {errors.from && <p className="text-red-600 text-sm">• {errors.from.message}</p>}
              {errors.to && <p className="text-red-600 text-sm">• {errors.to.message}</p>}
              {errors.departDate && <p className="text-red-600 text-sm">• {errors.departDate.message}</p>}
              {errors.returnDate && <p className="text-red-600 text-sm">• {errors.returnDate.message}</p>}
            </div>
          </div>
        )}

        {/* Search Button */}
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
          <button
            type="submit"
            disabled={!watchedFrom || !watchedTo || watchedFrom === watchedTo}
            className={`w-full py-6 px-8 rounded-2xl font-bold text-xl transition-all duration-300 flex items-center justify-center gap-4 relative overflow-hidden group ${
              !watchedFrom || !watchedTo || watchedFrom === watchedTo
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 shadow-xl hover:shadow-2xl transform hover:scale-[1.02] hover:-translate-y-1 active:scale-[0.98]'
            }`}
          >
            {/* Animated background shimmer */}
            {watchedFrom && watchedTo && watchedFrom !== watchedTo && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-out"></div>
            )}
            
            <div className="p-3 rounded-full bg-white/20 group-hover:bg-white/30 transition-all relative z-10">
              <Search className="w-6 h-6" />
            </div>
            
            <span className="relative z-10">
              {!watchedFrom || !watchedTo 
                ? 'Please Select Airports' 
                : watchedFrom === watchedTo
                ? 'Select Different Airports'
                : 'Search Flights'
              }
            </span>
            
            {watchedFrom && watchedTo && watchedFrom !== watchedTo && (
              <div className="p-2 rounded-full bg-white/20 group-hover:bg-white/30 transition-all relative z-10">
                <ArrowRight className="w-5 h-5" />
              </div>
            )}
          </button>
          
          {/* Route preview */}
          {watchedFrom && watchedTo && selectedFromAirport && selectedToAirport && watchedFrom !== watchedTo && (
            <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
              <div className="flex items-center justify-center gap-6 text-sm">
                <div className="text-center">
                  <div className="font-bold text-blue-900">{selectedFromAirport.iataCode}</div>
                  <div className="text-blue-700 text-xs">{selectedFromAirport.city}</div>
                </div>
                <div className="flex items-center gap-2 text-blue-600">
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                  <div className="w-8 h-0.5 bg-blue-600"></div>
                  <Plane className="w-4 h-4" />
                  <div className="w-8 h-0.5 bg-blue-600"></div>
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-blue-900">{selectedToAirport.iataCode}</div>
                  <div className="text-blue-700 text-xs">{selectedToAirport.city}</div>
                </div>
              </div>
              <div className="text-center mt-2">
                <span className="text-blue-700 text-xs font-medium">Ready to search flights</span>
              </div>
            </div>
          )}
        </div>
      </form>

      {/* Popular Destinations - Enhanced */}
      <div className="border-t bg-gradient-to-br from-gray-50 to-blue-50/20 px-8 py-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-green-100 rounded-lg">
            <MapPin className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Popular Destinations</h3>
            <p className="text-sm text-gray-600">Quick selection for popular routes</p>
          </div>
        </div>
        <PopularDestinations onDestinationSelect={(airport) => handleToAirportChange(airport.iataCode, airport)} />
      </div>
    </div>
  );
}