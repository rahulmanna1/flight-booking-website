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
  travelClass: z.enum(['economy', 'premium-economy', 'business', 'first']).default('economy'),
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
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 px-6 py-6">
        {/* Trip Type Toggle */}
        <div className="flex justify-center">
          <div className="bg-white/10 backdrop-blur rounded-lg p-1 inline-flex">
            <button
              type="button"
              onClick={() => {
                setTripType('roundtrip');
                setValue('tripType', 'roundtrip');
              }}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                tripType === 'roundtrip' 
                  ? 'bg-white text-blue-700 shadow-lg' 
                  : 'text-white/90 hover:text-white'
              }`}
            >
              <ArrowLeftRight className="inline w-4 h-4 mr-2" />
              Round Trip
            </button>
            <button
              type="button"
              onClick={() => {
                setTripType('oneway');
                setValue('tripType', 'oneway');
              }}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                tripType === 'oneway' 
                  ? 'bg-white text-blue-700 shadow-lg' 
                  : 'text-white/90 hover:text-white'
              }`}
            >
              <ArrowRight className="inline w-4 h-4 mr-2" />
              One Way
            </button>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
        {/* Airport Selection */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative">
          {/* From Airport */}
          <div className="relative">
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
              <MapPin className="inline w-3 h-3 mr-1 text-blue-600" />
              FROM
            </label>
            <AirportSearchInput
              label=""
              placeholder="City or airport"
              value={watchedFrom || ''}
              onChange={handleFromAirportChange}
              error={errors.from?.message}
            />
          </div>

          {/* Professional Swap Button */}
          <div className="hidden lg:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30">
            <button
              type="button"
              onClick={handleSwapAirports}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-110 mt-4"
              title="Swap airports"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </button>
          </div>
          
          {/* Mobile Swap Button */}
          <div className="lg:hidden flex justify-center -my-2">
            <button
              type="button"
              onClick={handleSwapAirports}
              className="bg-blue-600 text-white rounded-full p-2 shadow-md"
            >
              <ArrowLeftRight className="w-4 h-4" />
            </button>
          </div>

          {/* To Airport */}
          <div className="relative">
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
              <MapPin className="inline w-3 h-3 mr-1 text-blue-600" />
              TO
            </label>
            <AirportSearchInput
              label=""
              placeholder="City or airport"
              value={watchedTo || ''}
              onChange={handleToAirportChange}
              error={errors.to?.message}
            />
          </div>
        </div>

        {/* Date and Details Section */}
        <div className="bg-gray-50 rounded-2xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Departure Date */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                <Calendar className="inline w-3 h-3 mr-1 text-green-600" />
                DEPARTURE
              </label>
              <input
                {...register('departDate')}
                type="date"
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900 font-medium"
              />
              {errors.departDate && (
                <p className="text-red-500 text-xs mt-1 font-medium">{errors.departDate.message}</p>
              )}
            </div>

            {/* Return Date */}
            {tripType === 'roundtrip' && (
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                  <Calendar className="inline w-3 h-3 mr-1 text-green-600" />
                  RETURN
                </label>
                <input
                  {...register('returnDate')}
                  type="date"
                  min={watch('departDate') || new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900 font-medium"
                />
                {errors.returnDate && (
                  <p className="text-red-500 text-xs mt-1 font-medium">{errors.returnDate.message}</p>
                )}
              </div>
            )}

            {/* Passengers */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                <Users className="inline w-3 h-3 mr-1 text-purple-600" />
                PASSENGERS
              </label>
              <select
                {...register('passengers', { valueAsNumber: true })}
                className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-medium bg-white"
              >
                {[1,2,3,4,5,6,7,8,9].map(num => (
                  <option key={num} value={num}>
                    {num} {num === 1 ? 'Passenger' : 'Passengers'}
                  </option>
                ))}
              </select>
            </div>

            {/* Travel Class */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                <Plane className="inline w-3 h-3 mr-1 text-blue-600" />
                CLASS
              </label>
              <select
                {...register('travelClass')}
                className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-medium bg-white"
              >
                <option value="economy">Economy</option>
                <option value="premium-economy">Premium Economy</option>
                <option value="business">Business</option>
                <option value="first">First</option>
              </select>
            </div>
          </div>
        </div>

        {/* Search Button */}
        <div className="pt-2">
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 hover:from-blue-700 hover:via-blue-800 hover:to-blue-900 text-white font-bold py-5 px-8 rounded-2xl shadow-2xl hover:shadow-blue-500/25 transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center space-x-3 text-lg"
          >
            <Search className="w-6 h-6" />
            <span>Search Flights</span>
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </div>
      </form>

      {/* Popular Destinations */}
      <div className="border-t bg-gray-50 px-8 py-6">
        <PopularDestinations onDestinationSelect={(airport) => handleToAirportChange(airport.iataCode, airport)} />
      </div>
    </div>
  );
}