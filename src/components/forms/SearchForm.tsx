'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { Plane, Calendar, Users, ChevronDown, Star, ArrowUpDown } from 'lucide-react';
import AirportSearchInput from './AirportSearchInput';
import PopularDestinations from './PopularDestinations';
import RecentSearches, { type SearchHistory } from './RecentSearches';
import { useSearchHistory } from '@/hooks/useSearchHistory';
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
  message: 'Origin and destination airports must be different',
  path: ['to'],
});

type SearchFormData = z.infer<typeof searchSchema>;

interface SearchFormProps {
  onSearch?: (data: SearchFormData) => void;
}

export default function SearchForm({ onSearch }: SearchFormProps) {
  const [tripType, setTripType] = useState<'roundtrip' | 'oneway'>('roundtrip');
  const [showPopularDestinations, setShowPopularDestinations] = useState(false);
  const [showRecentSearches, setShowRecentSearches] = useState(true);
  const [userLocation, setUserLocation] = useState<GeolocationPosition | null>(null);
  const [selectedFromAirport, setSelectedFromAirport] = useState<Airport | null>(null);
  const [selectedToAirport, setSelectedToAirport] = useState<Airport | null>(null);
  
  const { addSearchToHistory } = useSearchHistory();
  
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<SearchFormData>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      tripType: 'roundtrip',
      passengers: 1,
      travelClass: 'economy',
    }
  });

  // Watch form values for real-time validation
  const watchedFrom = watch('from');
  const watchedTo = watch('to');
  const hasSameAirportError = watchedFrom === watchedTo && watchedFrom !== '';

  // Control visibility of suggestions based on form state
  useEffect(() => {
    const hasOrigin = watchedFrom && watchedFrom !== '';
    const hasDestination = watchedTo && watchedTo !== '';
    
    // Show recent searches when form is empty or partially filled
    setShowRecentSearches(!hasOrigin || !hasDestination);
    
    // Show popular destinations when no destination is selected
    setShowPopularDestinations(!hasDestination);
  }, [watchedFrom, watchedTo]);

  const onSubmit = (data: SearchFormData) => {
    console.log('Search data:', data);
    
    // Save to recent searches if we have full airport objects
    if (selectedFromAirport && selectedToAirport) {
      addSearchToHistory(
        selectedFromAirport,
        selectedToAirport,
        data.departDate,
        data.returnDate,
        data.tripType,
        data.travelClass,
        data.passengers
      );
    }
    
    if (onSearch) {
      onSearch(data);
    }
  };

  // Handle airport selection from enhanced search inputs
  const handleFromAirportChange = (airportCode: string, airport?: Airport) => {
    setValue('from', airportCode);
    setSelectedFromAirport(airport || null);
    
    // Clear form errors
    if (airportCode) {
      setValue('from', airportCode, { shouldValidate: true });
    }
  };

  const handleToAirportChange = (airportCode: string, airport?: Airport) => {
    setValue('to', airportCode);
    setSelectedToAirport(airport || null);
    
    // Clear form errors and hide suggestions
    if (airportCode && airport) {
      setValue('to', airportCode, { shouldValidate: true });
      setShowPopularDestinations(false);
    }
  };

  // Handle popular destination selection
  const handlePopularDestinationSelect = (airport: Airport) => {
    setValue('to', airport.iataCode);
    setSelectedToAirport(airport);
    setShowPopularDestinations(false);
  };

  // Handle recent search selection
  const handleRecentSearchSelect = (search: SearchHistory) => {
    // Populate form with search data
    setValue('from', search.from.iataCode);
    setValue('to', search.to.iataCode);
    setValue('departDate', search.departDate);
    setValue('returnDate', search.returnDate || '');
    setValue('tripType', search.tripType);
    setValue('travelClass', search.travelClass as any);
    setValue('passengers', search.passengers);
    
    // Update trip type state
    setTripType(search.tripType);
    
    // Update selected airports
    setSelectedFromAirport(search.from);
    setSelectedToAirport(search.to);
    
    // Hide suggestions
    setShowRecentSearches(false);
    setShowPopularDestinations(false);
  };

  // Swap origin and destination
  const handleSwapAirports = () => {
    const currentFrom = watchedFrom;
    const currentTo = watchedTo;
    
    setValue('from', currentTo);
    setValue('to', currentFrom);
    
    // Swap selected airport objects
    const tempAirport = selectedFromAirport;
    setSelectedFromAirport(selectedToAirport);
    setSelectedToAirport(tempAirport);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden max-w-5xl mx-auto">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-white mb-2">Find Your Perfect Flight</h1>
          <p className="text-blue-100">Search from thousands of airports worldwide</p>
        </div>
        
        {/* Trip Type Selector */}
        <div className="flex justify-center space-x-1 bg-white/10 rounded-lg p-1 max-w-sm mx-auto">
          <button
            type="button"
            onClick={() => {
              setTripType('roundtrip');
              setValue('tripType', 'roundtrip');
            }}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-semibold transition-all ${
              tripType === 'roundtrip' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-white hover:bg-white/10'
            }`}
          >
            ↔ Round Trip
          </button>
          <button
            type="button"
            onClick={() => {
              setTripType('oneway');
              setValue('tripType', 'oneway');
            }}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-semibold transition-all ${
              tripType === 'oneway' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-white hover:bg-white/10'
            }`}
          >
            → One Way
          </button>
        </div>
      </div>
      
      {/* Form Section */}
      <div className="p-6">

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-4">
          {/* Airport Search Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 relative">
            {/* From Airport */}
            <div className="flex-1">
              <AirportSearchInput
                label="From"
                placeholder="Search origin city or airport"
                value={watchedFrom || ''}
                onChange={handleFromAirportChange}
                error={errors.from?.message}
              />
            </div>
            
            {/* Swap Button */}
            <div className="absolute left-1/2 top-12 transform -translate-x-1/2 z-10 lg:relative lg:left-0 lg:top-0 lg:transform-none lg:flex lg:items-center lg:justify-center lg:w-auto lg:px-2">
              <button
                type="button"
                onClick={handleSwapAirports}
                className="bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50 rounded-full p-2 shadow-md transition-all duration-200 hover:scale-105"
                title="Swap origin and destination"
              >
                <ArrowUpDown className="w-4 h-4" />
              </button>
            </div>
            
            {/* To Airport */}
            <div className="flex-1">
              <AirportSearchInput
                label="To"
                placeholder="Search destination city or airport"
                value={watchedTo || ''}
                onChange={handleToAirportChange}
                error={errors.to?.message}
              />
            </div>
          </div>
          
          {/* Same Airport Error */}
          {hasSameAirportError && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-red-600 text-sm font-medium">
                ⚠️ Origin and destination airports must be different
              </p>
            </div>
          )}
        </div>

        {/* Travel Details Section */}
        <div className="bg-gray-50 rounded-xl p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-blue-600" />
            Travel Details
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="inline w-4 h-4 mr-1" />
                Departure Date
              </label>
              <input
                {...register('departDate')}
                type="date"
                min={new Date().toISOString().split('T')[0]}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900 ${
                  errors.departDate ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.departDate && <p className="text-red-500 text-sm mt-1">{errors.departDate.message}</p>}
            </div>

            {tripType === 'roundtrip' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="inline w-4 h-4 mr-1" />
                  Return Date
                </label>
                <input
                  {...register('returnDate')}
                  type="date"
                  min={watch('departDate') || new Date().toISOString().split('T')[0]}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900 ${
                    errors.returnDate ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.returnDate && <p className="text-red-500 text-sm mt-1">{errors.returnDate.message}</p>}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Users className="inline w-4 h-4 mr-1" />
                Passengers
              </label>
              <select
                {...register('passengers', { valueAsNumber: true })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              >
                {[1,2,3,4,5,6,7,8,9].map(num => (
                  <option key={num} value={num}>{num} Passenger{num > 1 ? 's' : ''}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Star className="inline w-4 h-4 mr-1" />
                Travel Class
              </label>
              <div className="relative">
                <select
                  {...register('travelClass')}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white pr-10 text-gray-900"
                >
                  <option value="economy">💺 Economy - Best value</option>
                  <option value="premium-economy">✈️ Premium Economy - Extra comfort</option>
                  <option value="business">🥂 Business - Premium service</option>
                  <option value="first">👑 First Class - Ultimate luxury</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
              {errors.travelClass && <p className="text-red-500 text-sm mt-1">{errors.travelClass.message}</p>}
            </div>
          </div>
        </div>

        {/* Suggestions Section */}
        <div className="space-y-6">
          {/* Recent Searches */}
          {showRecentSearches && (
            <RecentSearches
              onSearchSelect={handleRecentSearchSelect}
              className=""
              maxItems={3}
            />
          )}
          
          {/* Popular Destinations */}
          {showPopularDestinations && (
            <PopularDestinations
              onDestinationSelect={handlePopularDestinationSelect}
              userLocation={userLocation}
              className=""
            />
          )}
        </div>

        {/* Search Button */}
        <div className="bg-gray-50 rounded-xl p-6">
          <button
            type="submit"
            disabled={hasSameAirportError || !watchedFrom || !watchedTo}
            className={`w-full py-4 px-8 rounded-xl flex items-center justify-center space-x-3 transition-all duration-200 font-bold text-lg transform hover:scale-[1.02] ${
              hasSameAirportError || !watchedFrom || !watchedTo
                ? 'bg-gray-400 text-gray-600 cursor-not-allowed scale-100' 
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl'
            }`}
          >
            <div className={`p-2 rounded-full ${
              hasSameAirportError || !watchedFrom || !watchedTo
                ? 'bg-gray-500' 
                : 'bg-white/20'
            }`}>
              <Plane className="w-5 h-5" />
            </div>
            <span>
              {hasSameAirportError 
                ? 'Please Select Different Airports' 
                : !watchedFrom || !watchedTo
                ? 'Please Select Both Airports'
                : 'Search Flights'
              }
            </span>
          </button>
          
          {(watchedFrom && watchedTo && selectedFromAirport && selectedToAirport) && (
            <div className="mt-3 text-center text-sm text-gray-600">
              Flying from <span className="font-semibold">{selectedFromAirport.city}</span> to <span className="font-semibold">{selectedToAirport.city}</span>
            </div>
          )}
        </div>
      </form>
      </div>
    </div>
  );
}