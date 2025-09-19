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
    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 px-8 py-10">
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Find Your Perfect Flight
          </h1>
          <p className="text-blue-100 text-lg">
            Search from thousands of airports worldwide
          </p>
        </div>

        {/* Trip Type Toggle */}
        <div className="flex justify-center mt-8">
          <div className="bg-black/20 backdrop-blur rounded-xl p-1 inline-flex">
            <button
              type="button"
              onClick={() => {
                setTripType('roundtrip');
                setValue('tripType', 'roundtrip');
              }}
              className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
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
              className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 relative">
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
              <MapPin className="inline w-3 h-3 mr-1" />
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

          <button
            type="button"
            onClick={handleSwapAirports}
            className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30 bg-white border-2 border-gray-300 hover:border-blue-500 rounded-full p-3 hover:shadow-lg transition-all group"
            title="Swap locations"
          >
            <ArrowLeftRight className="w-5 h-5 text-gray-600 group-hover:text-blue-600 transition-colors" />
          </button>

          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
              <MapPin className="inline w-3 h-3 mr-1" />
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
        </div>

        {/* Date and Details */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
              <Calendar className="inline w-3 h-3 mr-1" />
              Departure
            </label>
            <input
              {...register('departDate')}
              type="date"
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900"
            />
            {errors.departDate && (
              <p className="text-red-500 text-xs mt-1">{errors.departDate.message}</p>
            )}
          </div>

          {tripType === 'roundtrip' && (
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                <Calendar className="inline w-3 h-3 mr-1" />
                Return
              </label>
              <input
                {...register('returnDate')}
                type="date"
                min={watch('departDate') || new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900"
              />
              {errors.returnDate && (
                <p className="text-red-500 text-xs mt-1">{errors.returnDate.message}</p>
              )}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
              <Users className="inline w-3 h-3 mr-1" />
              Passengers
            </label>
            <select
              {...register('passengers', { valueAsNumber: true })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            >
              {[1,2,3,4,5,6,7,8,9].map(num => (
                <option key={num} value={num}>
                  {num} {num === 1 ? 'Passenger' : 'Passengers'}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
              <Plane className="inline w-3 h-3 mr-1" />
              Class
            </label>
            <select
              {...register('travelClass')}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            >
              <option value="economy">Economy</option>
              <option value="premium-economy">Premium Economy</option>
              <option value="business">Business</option>
              <option value="first">First</option>
            </select>
          </div>
        </div>

        {/* Search Button */}
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all flex items-center justify-center space-x-3"
        >
          <Search className="w-5 h-5" />
          <span className="text-lg">Search Flights</span>
        </button>
      </form>

      {/* Popular Destinations */}
      <div className="border-t bg-gray-50 px-8 py-6">
        <PopularDestinations onSelectDestination={handleToAirportChange} />
      </div>
    </div>
  );
}