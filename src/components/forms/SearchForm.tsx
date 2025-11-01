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
  directFlightsOnly: z.boolean().optional(),
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
  // Only validate if both fields are filled
  if (!data.from || !data.to) return true;
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
      directFlightsOnly: false,
    }
  });

  // Watch form values for real-time validation
  const watchedFrom = watch('from');
  const watchedTo = watch('to');
  // Only show same airport error if both fields have values and they match
  const hasSameAirportError = watchedFrom && watchedTo && watchedFrom === watchedTo && watchedFrom !== '' && watchedTo !== '';

  // Control visibility of suggestions based on form state
  useEffect(() => {
    const hasOrigin = watchedFrom && watchedFrom !== '';
    const hasDestination = watchedTo && watchedTo !== '';
    
    // Show recent searches when form is empty or partially filled
    setShowRecentSearches(!hasOrigin || !hasDestination);
    
    // Show popular destinations when no destination is selected
    setShowPopularDestinations(!hasDestination);
  }, [watchedFrom, watchedTo]);

  const onSubmit = (data: SearchFormData, e?: React.BaseSyntheticEvent) => {
    // Prevent default form behavior
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    // Additional validation: ensure origin and destination are different
    if (data.from === data.to) {
      console.error('❌ SearchForm: Same airport validation failed', { from: data.from, to: data.to });
      return; // Prevent form submission
    }
    
    // Additional validation: ensure both fields are filled
    if (!data.from || !data.to) {
      console.error('❌ SearchForm: Missing required fields', { from: data.from, to: data.to });
      return; // Prevent form submission
    }
    
    console.log('✅ SearchForm: Submitting valid search data', {
      from: data.from,
      to: data.to,
      departDate: data.departDate,
      tripType: data.tripType,
      passengers: data.passengers,
      onSearchExists: !!onSearch
    });
    
    // Save to recent searches if we have full airport objects
    if (selectedFromAirport && selectedToAirport) {
      try {
        addSearchToHistory(
          selectedFromAirport,
          selectedToAirport,
          data.departDate,
          data.returnDate,
          data.tripType,
          data.travelClass,
          data.passengers
        );
      } catch (error) {
        console.warn('Failed to save to search history:', error);
      }
    }
    
    if (onSearch) {
      console.log('🚀 SearchForm: Calling onSearch callback');
      try {
        onSearch(data);
        console.log('✅ SearchForm: onSearch callback completed');
      } catch (error) {
        console.error('❌ Error in onSearch callback:', error);
      }
    } else {
      console.warn('⚠️ SearchForm: onSearch callback is not defined!');
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
    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 max-w-6xl mx-auto">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-6 rounded-t-2xl">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
              <Plane className="w-7 h-7" />
              Search Flights
            </h2>
            <p className="text-blue-100">
              Compare flights from hundreds of airlines worldwide
            </p>
          </div>
          
          {/* Trip Type Toggle - Modern Style */}
          <div className="bg-white/15 backdrop-blur-sm rounded-xl p-1 inline-flex gap-1">
            <button
              type="button"
              onClick={() => {
                setTripType('roundtrip');
                setValue('tripType', 'roundtrip');
                // Clear return date error when switching to round trip
                setValue('returnDate', watch('returnDate') || '', { shouldValidate: false });
              }}
              className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                tripType === 'roundtrip' 
                  ? 'bg-white text-blue-700 shadow-md' 
                  : 'text-white/90 hover:text-white hover:bg-white/10'
              }`}
            >
              ↔ Round Trip
            </button>
            <button
              type="button"
              onClick={() => {
                setTripType('oneway');
                setValue('tripType', 'oneway');
                // Clear return date when switching to one way
                setValue('returnDate', '', { shouldValidate: false });
              }}
              className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                tripType === 'oneway' 
                  ? 'bg-white text-blue-700 shadow-md' 
                  : 'text-white/90 hover:text-white hover:bg-white/10'
              }`}
            >
              → One Way
            </button>
          </div>
        </div>
      </div>
      
      {/* Form Section - Three Row Layout */}
      <form 
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit(onSubmit)(e);
        }} 
        className="p-6 space-y-4"
      >
        {/* Row 1: Route - From and To */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-end">
          {/* FROM */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              From
            </label>
            <AirportSearchInput
              label=""
              placeholder="Departure city"
              value={watchedFrom || ''}
              onChange={handleFromAirportChange}
              error={errors.from?.message}
              className="h-[52px]"
            />
          </div>
          
          {/* SWAP BUTTON */}
          <div className="flex items-end pb-3">
            <button
              type="button"
              onClick={handleSwapAirports}
              className="bg-gray-100 hover:bg-blue-500 border-2 border-gray-200 hover:border-blue-500 text-gray-600 hover:text-white rounded-full p-3 transition-all duration-200 shadow-sm hover:shadow-md"
              title="Swap airports"
            >
              <ArrowUpDown className="w-5 h-5" />
            </button>
          </div>
          
          {/* TO */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              To
            </label>
            <AirportSearchInput
              label=""
              placeholder="Arrival city"
              value={watchedTo || ''}
              onChange={handleToAirportChange}
              error={errors.to?.message}
              className="h-[52px]"
            />
          </div>
        </div>
        
        {/* Row 2: Travel Details */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* DIRECT FLIGHTS TOGGLE */}
          <div className="col-span-2 md:col-span-4">
            <label className="flex items-center gap-3 p-3 bg-blue-50 border-2 border-blue-200 rounded-xl hover:bg-blue-100 transition-colors cursor-pointer">
              <input
                {...register('directFlightsOnly')}
                type="checkbox"
                className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
              />
              <div>
                <span className="text-sm font-semibold text-gray-900">Direct flights only</span>
                <p className="text-xs text-gray-600">Show flights without layovers</p>
              </div>
            </label>
          </div>
          
          {/* DEPARTURE DATE */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Departure
            </label>
            <input
              {...register('departDate')}
              type="date"
              min={new Date().toISOString().split('T')[0]}
              className="w-full h-[52px] px-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900 font-medium hover:border-gray-300 bg-white cursor-pointer"
            />
          </div>
          
          {/* RETURN DATE */}
          {tripType === 'roundtrip' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Return
              </label>
              <input
                {...register('returnDate')}
                type="date"
                min={watch('departDate') || new Date().toISOString().split('T')[0]}
                className="w-full h-[52px] px-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900 font-medium hover:border-gray-300 bg-white cursor-pointer"
              />
            </div>
          )}
          
          {/* TRAVELERS */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Travelers
            </label>
            <div className="relative">
              <select
                {...register('passengers', { valueAsNumber: true })}
                className="w-full h-[52px] pl-4 pr-10 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-medium bg-white appearance-none hover:border-gray-300 transition-all cursor-pointer"
              >
                {[1,2,3,4,5,6,7,8,9].map(num => (
                  <option key={num} value={num}>
                    {num} {num === 1 ? 'Adult' : 'Adults'}
                  </option>
                ))}
              </select>
              <Users className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600 pointer-events-none" />
            </div>
          </div>
          
          {/* CLASS */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Class</label>
            <div className="relative">
              <select
                {...register('travelClass')}
                className="w-full h-[52px] pl-4 pr-10 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-medium bg-white appearance-none hover:border-gray-300 transition-all cursor-pointer"
              >
                <option value="economy">Economy</option>
                <option value="premium-economy">Premium Economy</option>
                <option value="business">Business</option>
                <option value="first">First Class</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600 pointer-events-none" />
            </div>
          </div>
        </div>
        
        {/* Row 3: Search Button - Full Width */}
        <div>
          <button
            type="submit"
            disabled={!watchedFrom || !watchedTo || watchedFrom === watchedTo}
            className={`w-full h-[56px] px-6 rounded-xl font-bold text-base transition-all duration-200 flex items-center justify-center gap-2 ${
              !watchedFrom || !watchedTo || watchedFrom === watchedTo
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 shadow-lg hover:shadow-xl transform hover:scale-[1.01]'
            }`}
          >
            <Plane className="w-5 h-5" />
            <span>
              {!watchedFrom || !watchedTo 
                ? 'Select Airports' 
                : watchedFrom === watchedTo
                ? 'Choose Different Cities'
                : 'Search Flights'
              }
            </span>
          </button>
        </div>
        
        {/* Error Messages */}
        {(errors.from || errors.to || errors.departDate || errors.returnDate || hasSameAirportError) && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="space-y-1">
              {errors.from && <p className="text-red-600 text-sm">• {errors.from.message}</p>}
              {errors.to && <p className="text-red-600 text-sm">• {errors.to.message}</p>}
              {errors.departDate && <p className="text-red-600 text-sm">• {errors.departDate.message}</p>}
              {errors.returnDate && <p className="text-red-600 text-sm">• {errors.returnDate.message}</p>}
              {hasSameAirportError && <p className="text-red-600 text-sm">• Origin and destination must be different</p>}
            </div>
          </div>
        )}
      </form>
      
      {/* Popular Destinations Section */}
      {showPopularDestinations && (
        <div className="border-t bg-gradient-to-br from-gray-50 to-blue-50/20 px-8 py-8">
          <PopularDestinations 
            onDestinationSelect={handlePopularDestinationSelect}
          />
        </div>
      )}
      
      {/* Show Popular Destinations Toggle (when hidden) */}
      {!showPopularDestinations && (
        <div className="border-t bg-gray-50 px-8 py-4">
          <button
            type="button"
            onClick={() => setShowPopularDestinations(true)}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 border-2 border-blue-200 hover:border-blue-300 transition-all duration-200 hover:shadow-md"
          >
            <Star className="w-4 h-4" />
            <span>Show Popular Destinations</span>
          </button>
        </div>
      )}
    </div>
  );
}
