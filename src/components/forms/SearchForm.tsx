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
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Airport Selection Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Plane className="w-5 h-5 mr-2 text-blue-600" />
                Flight Route
              </h3>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* From Airport - Takes 5 columns */}
              <div className="lg:col-span-5">
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                      <span className="text-blue-600 font-semibold text-sm">FROM</span>
                    </div>
                    Origin
                  </label>
                  <AirportSearchInput
                    label=""
                    placeholder="City or airport"
                    value={watchedFrom || ''}
                    onChange={handleFromAirportChange}
                    error={errors.from?.message}
                  />
                </div>
              </div>
              
              {/* Swap Button - Takes 2 columns */}
              <div className="lg:col-span-2 flex items-end justify-center pb-4">
                <div className="relative">
                  <button
                    type="button"
                    onClick={handleSwapAirports}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-full p-3 shadow-lg transition-all duration-300 transform hover:scale-110 active:scale-95 hover:rotate-180 hover:shadow-xl group relative"
                    title="Swap origin and destination"
                  >
                    <ArrowUpDown className="w-5 h-5 transition-transform duration-300 group-hover:rotate-180" />
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full border-2 border-blue-600 flex items-center justify-center">
                      <span className="text-blue-600 text-xs font-bold">⇄</span>
                    </div>
                  </button>
                </div>
              </div>
              
              {/* To Airport - Takes 5 columns */}
              <div className="lg:col-span-5">
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-2">
                      <span className="text-green-600 font-semibold text-sm">TO</span>
                    </div>
                    Destination
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
            </div>
            
            {/* Enhanced Same Airport Error */}
            {hasSameAirportError && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg animate-in slide-in-from-top-1 duration-200">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">!</span>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-red-800 text-sm font-semibold mb-1">Airport Selection Error</h4>
                    <p className="text-red-700 text-sm">
                      Please select different airports for your departure and arrival destinations.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Travel Details Section */}
          <div className="bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-2xl p-8 border border-gray-200/50">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center mb-2">
                <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                Travel Details
              </h3>
              <p className="text-sm text-gray-600">Select your travel dates and preferences</p>
            </div>
            
            {/* Date and Passenger Selection */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-6">
              {/* Left Side - Dates */}
              <div className="space-y-6">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <h4 className="text-base font-medium text-gray-900 mb-4 flex items-center">
                    <Calendar className="w-4 h-4 mr-2 text-blue-600" />
                    Travel Dates
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Departure Date */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        🛫 Departure
                      </label>
                      <input
                        {...register('departDate')}
                        type="date"
                        min={new Date().toISOString().split('T')[0]}
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 font-medium ${
                          errors.departDate 
                            ? 'border-red-300 bg-red-50 focus:ring-red-500 focus:border-red-500' 
                            : watch('departDate') 
                            ? 'border-green-300 bg-green-50 focus:ring-green-500 focus:border-green-500' 
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      />
                      {errors.departDate && (
                        <p className="text-red-600 text-xs flex items-center mt-1">
                          <span className="w-3 h-3 bg-red-500 rounded-full mr-2 flex items-center justify-center">
                            <span className="text-white text-xs">!</span>
                          </span>
                          {errors.departDate.message}
                        </p>
                      )}
                    </div>
                    
                    {/* Return Date */}
                    {tripType === 'roundtrip' && (
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          🛬 Return
                        </label>
                        <input
                          {...register('returnDate')}
                          type="date"
                          min={watch('departDate') || new Date().toISOString().split('T')[0]}
                          className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 font-medium ${
                            errors.returnDate 
                              ? 'border-red-300 bg-red-50 focus:ring-red-500 focus:border-red-500' 
                              : watch('returnDate') 
                              ? 'border-green-300 bg-green-50 focus:ring-green-500 focus:border-green-500' 
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                        />
                        {errors.returnDate && (
                          <p className="text-red-600 text-xs flex items-center mt-1">
                            <span className="w-3 h-3 bg-red-500 rounded-full mr-2 flex items-center justify-center">
                              <span className="text-white text-xs">!</span>
                            </span>
                            {errors.returnDate.message}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Right Side - Passengers & Class */}
              <div className="space-y-6">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <h4 className="text-base font-medium text-gray-900 mb-4 flex items-center">
                    <Users className="w-4 h-4 mr-2 text-blue-600" />
                    Travelers & Preferences
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Passengers */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        👥 Passengers
                      </label>
                      <div className="relative">
                        <select
                          {...register('passengers', { valueAsNumber: true })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white text-gray-900 font-medium hover:border-gray-400 transition-all duration-200"
                        >
                          {[1,2,3,4,5,6,7,8,9].map(num => (
                            <option key={num} value={num}>
                              {num} Passenger{num > 1 ? 's' : ''}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      </div>
                    </div>
                    
                    {/* Travel Class */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        ✈️ Class
                      </label>
                      <div className="relative">
                        <select
                          {...register('travelClass')}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white text-gray-900 font-medium hover:border-gray-400 transition-all duration-200"
                        >
                          <option value="economy">💺 Economy</option>
                          <option value="premium-economy">✈️ Premium</option>
                          <option value="business">🥂 Business</option>
                          <option value="first">👑 First</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      </div>
                      {errors.travelClass && (
                        <p className="text-red-600 text-xs mt-1">{errors.travelClass.message}</p>
                      )}
                    </div>
                  </div>
                </div>
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

          {/* Search Button Section */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
            <button
              type="submit"
              disabled={hasSameAirportError || !watchedFrom || !watchedTo}
              className={`w-full py-5 px-8 rounded-2xl flex items-center justify-center space-x-4 transition-all duration-300 font-bold text-lg group relative overflow-hidden ${
                hasSameAirportError || !watchedFrom || !watchedTo
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 shadow-xl hover:shadow-2xl transform hover:scale-[1.02] hover:-translate-y-1 active:scale-[0.98] active:translate-y-0'
              }`}
            >
              {/* Animated background */}
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-out"></div>
              
              <div className={`p-3 rounded-full transition-all duration-300 relative z-10 ${
                hasSameAirportError || !watchedFrom || !watchedTo
                  ? 'bg-gray-400' 
                  : 'bg-white/20 group-hover:bg-white/30 group-hover:scale-110 group-hover:rotate-12'
              }`}>
                <Plane className="w-6 h-6 transition-all duration-300 group-hover:translate-x-2" />
              </div>
              
              <span className="relative z-10 text-xl">
                {hasSameAirportError 
                  ? 'Select Different Airports' 
                  : !watchedFrom || !watchedTo
                  ? 'Select Departure & Destination'
                  : 'Search Flights'
                }
              </span>
              
              {/* Success arrow */}
              {watchedFrom && watchedTo && !hasSameAirportError && (
                <div className="p-2 rounded-full bg-white/20 group-hover:bg-white/30 transition-all duration-300 relative z-10">
                  <span className="text-white font-bold">→</span>
                </div>
              )}
            </button>
            
            {/* Flight Route Preview */}
            {(watchedFrom && watchedTo && selectedFromAirport && selectedToAirport && !hasSameAirportError) && (
              <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                <div className="flex items-center justify-center space-x-4 text-sm">
                  <div className="text-center">
                    <div className="font-bold text-blue-900">{selectedFromAirport.iataCode}</div>
                    <div className="text-blue-700 text-xs">{selectedFromAirport.city}</div>
                  </div>
                  <div className="flex items-center space-x-2 text-blue-600">
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                    <div className="w-8 h-0.5 bg-blue-600"></div>
                    <Plane className="w-4 h-4 text-blue-600" />
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
      </div>
    </div>
  );
}