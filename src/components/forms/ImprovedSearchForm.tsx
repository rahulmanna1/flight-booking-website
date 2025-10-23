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

      {/* Form - Spacious Two-Row Layout */}
      <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
        {/* Row 1: Where - Route Selection with Clear Visual Separation */}
        <div className="bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-2xl p-6 border-2 border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <Plane className="w-5 h-5 text-blue-600" />
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Route</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-end">
            {/* FROM */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-500" />
                From
              </label>
              <AirportSearchInput
                label=""
                placeholder="Departure city"
                value={watchedFrom || ''}
                onChange={handleFromAirportChange}
                error={errors.from?.message}
                className="bg-white"
              />
            </div>
            
            {/* SWAP BUTTON - Styled Circle */}
            <div className="flex items-end pb-3 md:pb-4">
              <button
                type="button"
                onClick={handleSwapAirports}
                className="bg-white hover:bg-blue-600 border-2 border-gray-300 hover:border-blue-600 text-gray-600 hover:text-white rounded-full p-3 transition-all duration-200 shadow-sm hover:shadow-md group"
                title="Swap airports"
              >
                <ArrowLeftRight className="w-5 h-5" />
              </button>
            </div>
            
            {/* TO */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-500" />
                To
              </label>
              <AirportSearchInput
                label=""
                placeholder="Arrival city"
                value={watchedTo || ''}
                onChange={handleToAirportChange}
                error={errors.to?.message}
                className="bg-white"
              />
            </div>
          </div>
        </div>
        
        {/* Row 2: When & Who - Travel Details with Search Button */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-10 gap-4">
          {/* DATES SECTION - Grouped */}
          <div className="lg:col-span-4 bg-gradient-to-br from-purple-50 to-blue-50/30 rounded-2xl p-6 border-2 border-purple-200/50">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-purple-600" />
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Travel Dates</h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* DEPARTURE */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Departure
                </label>
                <input
                  {...register('departDate')}
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all text-gray-900 font-medium hover:border-gray-300 bg-white cursor-pointer"
                />
              </div>
              
              {/* RETURN */}
              {tripType === 'roundtrip' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Return
                  </label>
                  <input
                    {...register('returnDate')}
                    type="date"
                    min={watch('departDate') || new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all text-gray-900 font-medium hover:border-gray-300 bg-white cursor-pointer"
                  />
                </div>
              )}
            </div>
          </div>
          
          {/* PASSENGERS & CLASS SECTION - Grouped */}
          <div className="lg:col-span-3 bg-gradient-to-br from-green-50 to-blue-50/30 rounded-2xl p-6 border-2 border-green-200/50">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-green-600" />
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Passengers</h3>
            </div>
            
            <div className="space-y-3">
              {/* TRAVELERS */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Travelers
                </label>
                <div className="relative">
                  <select
                    {...register('passengers', { valueAsNumber: true })}
                    className="w-full pl-4 pr-10 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 font-medium bg-white appearance-none hover:border-gray-300 transition-all cursor-pointer"
                  >
                    {[1,2,3,4,5,6,7,8,9].map(num => (
                      <option key={num} value={num}>
                        {num} {num === 1 ? 'Adult' : 'Adults'}
                      </option>
                    ))}
                  </select>
                  <Users className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>
              
              {/* CLASS */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Class
                </label>
                <div className="relative">
                  <select
                    {...register('travelClass')}
                    className="w-full pl-4 pr-10 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 font-medium bg-white appearance-none hover:border-gray-300 transition-all cursor-pointer"
                  >
                    <option value="economy">Economy</option>
                    <option value="premium-economy">Premium Economy</option>
                    <option value="business">Business</option>
                    <option value="first">First Class</option>
                  </select>
                  <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
          
          {/* SEARCH BUTTON - Large & Prominent */}
          <div className="lg:col-span-3 flex items-end">
            <button
              type="submit"
              disabled={!watchedFrom || !watchedTo || watchedFrom === watchedTo}
              className={`w-full h-full min-h-[140px] rounded-2xl font-bold text-lg transition-all duration-200 flex flex-col items-center justify-center gap-3 ${
                !watchedFrom || !watchedTo || watchedFrom === watchedTo
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 shadow-xl hover:shadow-2xl transform hover:scale-[1.02] active:scale-[0.98]'
              }`}
            >
              <Search className="w-8 h-8" />
              <span className="text-center px-4">
                {!watchedFrom || !watchedTo 
                  ? 'Select Airports' 
                  : watchedFrom === watchedTo
                  ? 'Choose Different Cities'
                  : 'Search Flights'
                }
              </span>
            </button>
          </div>
        </div>
        
        {/* Error Messages - Compact */}
        {(errors.from || errors.to || errors.departDate || errors.returnDate) && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="space-y-1">
              {errors.from && <p className="text-red-600 text-sm">• {errors.from.message}</p>}
              {errors.to && <p className="text-red-600 text-sm">• {errors.to.message}</p>}
              {errors.departDate && <p className="text-red-600 text-sm">• {errors.departDate.message}</p>}
              {errors.returnDate && <p className="text-red-600 text-sm">• {errors.returnDate.message}</p>}
            </div>
          </div>
        )}
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