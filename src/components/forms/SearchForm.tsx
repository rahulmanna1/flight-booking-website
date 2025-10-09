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
  const [userLocation, setUserLocation] = useState<GeolocationPosition | undefined>(undefined);
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
    // Additional validation: ensure origin and destination are different
    if (data.from === data.to) {
      console.error('❌ SearchForm: Same airport validation failed', { from: data.from, to: data.to });
      return; // Prevent form submission
    }
    
    console.log('✅ SearchForm: Submitting valid search data', {
      from: data.from,
      to: data.to,
      departDate: data.departDate,
      tripType: data.tripType,
      passengers: data.passengers
    });
    
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
      <div className="p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Unified Search Form - Industry Standard Single Row Layout */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            {/* Form Header */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Plane className="w-5 h-5 mr-2 text-blue-600" />
                Search Flights
              </h3>
              <p className="text-sm text-gray-600 mt-1">Find and compare flights from top airlines worldwide</p>
            </div>
            
            {/* Main Search Row */}
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
                {/* FROM Airport - 3 columns */}
                <div className="lg:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    From
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-bold text-xs">🛫</span>
                      </div>
                    </div>
                    <AirportSearchInput
                      label=""
                      placeholder="Departure city"
                      value={watchedFrom || ''}
                      onChange={handleFromAirportChange}
                      error={errors.from?.message}
                      className="pl-12"
                    />
                  </div>
                </div>
                
                {/* Swap Button - 1 column */}
                <div className="lg:col-span-1 flex justify-center">
                  <button
                    type="button"
                    onClick={handleSwapAirports}
                    className="mt-6 bg-gray-100 hover:bg-blue-50 border border-gray-300 hover:border-blue-300 text-gray-600 hover:text-blue-600 rounded-full p-2 transition-all duration-200 transform hover:scale-105"
                    title="Swap airports"
                  >
                    <ArrowUpDown className="w-4 h-4" />
                  </button>
                </div>
                
                {/* TO Airport - 3 columns */}
                <div className="lg:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    To
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-green-600 font-bold text-xs">🛬</span>
                      </div>
                    </div>
                    <AirportSearchInput
                      label=""
                      placeholder="Arrival city"
                      value={watchedTo || ''}
                      onChange={handleToAirportChange}
                      error={errors.to?.message}
                      className="pl-12"
                    />
                  </div>
                </div>
                
                {/* Departure Date - 2 columns */}
                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Departure
                  </label>
                  <input
                    {...register('departDate')}
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 font-medium ${
                      errors.departDate 
                        ? 'border-red-300 bg-red-50' 
                        : watch('departDate') 
                        ? 'border-green-300 bg-green-50' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  />
                </div>
                
                {/* Return Date - 2 columns (conditional) */}
                {tripType === 'roundtrip' && (
                  <div className="lg:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Return
                    </label>
                    <input
                      {...register('returnDate')}
                      type="date"
                      min={watch('departDate') || new Date().toISOString().split('T')[0]}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 font-medium ${
                        errors.returnDate 
                          ? 'border-red-300 bg-red-50' 
                          : watch('returnDate') 
                          ? 'border-green-300 bg-green-50' 
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    />
                  </div>
                )}
                
                {/* Passengers - 1 column */}
                <div className={tripType === 'roundtrip' ? 'lg:col-span-1' : 'lg:col-span-2'}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Travelers
                  </label>
                  <div className="relative">
                    <select
                      {...register('passengers', { valueAsNumber: true })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white text-gray-900 font-medium hover:border-gray-400 transition-all duration-200"
                    >
                      {[1,2,3,4,5,6,7,8,9].map(num => (
                        <option key={num} value={num}>
                          {num} {num === 1 ? 'Adult' : 'Adults'}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                
                {/* Travel Class - 1 column */}
                <div className={tripType === 'roundtrip' ? 'lg:col-span-1' : 'lg:col-span-1'}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Class
                  </label>
                  <div className="relative">
                    <select
                      {...register('travelClass')}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white text-gray-900 font-medium hover:border-gray-400 transition-all duration-200"
                    >
                      <option value="economy">Economy</option>
                      <option value="premium-economy">Premium</option>
                      <option value="business">Business</option>
                      <option value="first">First</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>
              
              {/* Error Messages */}
              {(errors.from || errors.to || errors.departDate || errors.returnDate || hasSameAirportError) && (
                <div className="mt-4 space-y-2">
                  {errors.from && (
                    <p className="text-red-600 text-sm flex items-center">
                      <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                      {errors.from.message}
                    </p>
                  )}
                  {errors.to && (
                    <p className="text-red-600 text-sm flex items-center">
                      <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                      {errors.to.message}
                    </p>
                  )}
                  {errors.departDate && (
                    <p className="text-red-600 text-sm flex items-center">
                      <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                      {errors.departDate.message}
                    </p>
                  )}
                  {errors.returnDate && (
                    <p className="text-red-600 text-sm flex items-center">
                      <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                      {errors.returnDate.message}
                    </p>
                  )}
                  {hasSameAirportError && (
                    <p className="text-red-600 text-sm flex items-center">
                      <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                      Please select different departure and arrival airports
                    </p>
                  )}
                </div>
              )}
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

          {/* Search Button Section */}
          <div className="text-center">
            <button
              type="submit"
              disabled={hasSameAirportError || !watchedFrom || !watchedTo}
              className={`inline-flex items-center justify-center space-x-3 py-4 px-12 rounded-2xl transition-all duration-300 font-bold text-lg group relative overflow-hidden min-w-[300px] ${
                hasSameAirportError || !watchedFrom || !watchedTo
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 shadow-xl hover:shadow-2xl transform hover:scale-105 active:scale-95'
              }`}
            >
              {/* Animated background */}
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-out"></div>
              
              <div className={`p-2 rounded-full transition-all duration-300 relative z-10 ${
                hasSameAirportError || !watchedFrom || !watchedTo
                  ? 'bg-gray-400' 
                  : 'bg-white/20 group-hover:bg-white/30 group-hover:scale-110'
              }`}>
                <Plane className="w-5 h-5 transition-all duration-300 group-hover:translate-x-1" />
              </div>
              
              <span className="relative z-10">
                {hasSameAirportError 
                  ? 'Select Different Airports' 
                  : !watchedFrom || !watchedTo
                  ? 'Please Select Airports'
                  : 'Search Flights'
                }
              </span>
              
              {/* Success arrow */}
              {watchedFrom && watchedTo && !hasSameAirportError && (
                <div className="relative z-10">
                  <span className="text-white font-bold text-xl">→</span>
                </div>
              )}
            </button>
            
            {/* Flight Route Preview - Compact */}
            {(watchedFrom && watchedTo && selectedFromAirport && selectedToAirport && !hasSameAirportError) && (
              <div className="mt-4 inline-flex items-center space-x-3 bg-blue-50 px-6 py-3 rounded-full border border-blue-200">
                <div className="text-center">
                  <span className="font-bold text-blue-900 text-sm">{selectedFromAirport.iataCode}</span>
                </div>
                <div className="flex items-center space-x-1 text-blue-600">
                  <div className="w-1 h-1 bg-blue-600 rounded-full"></div>
                  <div className="w-6 h-px bg-blue-600"></div>
                  <Plane className="w-3 h-3 text-blue-600" />
                  <div className="w-6 h-px bg-blue-600"></div>
                  <div className="w-1 h-1 bg-blue-600 rounded-full"></div>
                </div>
                <div className="text-center">
                  <span className="font-bold text-blue-900 text-sm">{selectedToAirport.iataCode}</span>
                </div>
              </div>
            )}
          </div>
      </form>
      </div>
    </div>
  );
}