'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, X, Calendar, Users, Search, Plane } from 'lucide-react';
import AirportSearchInput from './AirportSearchInput';
import { Airport } from '@/app/api/airports/search/route';
import { Button } from '../ui/button';

const multiCitySchema = z.object({
  segments: z.array(z.object({
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
  })).min(2, 'At least 2 flight segments required').max(6, 'Maximum 6 segments allowed'),
  passengers: z.number().min(1, 'At least 1 passenger required').max(9, 'Maximum 9 passengers allowed'),
  travelClass: z.enum(['economy', 'premium-economy', 'business', 'first']),
  directFlightsOnly: z.boolean().optional(),
}).refine((data) => {
  // Validate that each segment's dates are in order
  for (let i = 1; i < data.segments.length; i++) {
    const prevDate = new Date(data.segments[i - 1].departDate);
    const currDate = new Date(data.segments[i].departDate);
    if (currDate < prevDate) {
      return false;
    }
  }
  return true;
}, {
  message: 'Flight segments must be in chronological order',
  path: ['segments'],
}).refine((data) => {
  // Validate that destinations don't loop back incorrectly
  for (let i = 0; i < data.segments.length; i++) {
    if (data.segments[i].from === data.segments[i].to) {
      return false;
    }
  }
  return true;
}, {
  message: 'Origin and destination cannot be the same',
  path: ['segments'],
});

type MultiCityFormData = z.infer<typeof multiCitySchema>;

interface MultiCitySearchFormProps {
  onSearch?: (data: MultiCityFormData) => void;
}

export default function MultiCitySearchForm({ onSearch }: MultiCitySearchFormProps) {
  const [selectedAirports, setSelectedAirports] = useState<{ [key: string]: Airport | null }>({});

  const { register, control, handleSubmit, formState: { errors }, setValue, watch } = useForm<MultiCityFormData>({
    resolver: zodResolver(multiCitySchema),
    defaultValues: {
      segments: [
        { from: '', to: '', departDate: '' },
        { from: '', to: '', departDate: '' },
      ],
      passengers: 1,
      travelClass: 'economy',
      directFlightsOnly: false,
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'segments',
  });

  const segments = watch('segments');

  const onSubmit = (data: MultiCityFormData) => {
    if (onSearch) {
      onSearch(data);
    }
  };

  const handleAirportChange = (index: number, field: 'from' | 'to', airportCode: string, airport?: Airport) => {
    setValue(`segments.${index}.${field}`, airportCode);
    setSelectedAirports(prev => ({
      ...prev,
      [`${index}-${field}`]: airport || null
    }));
  };

  const addSegment = () => {
    if (fields.length < 6) {
      // Auto-fill the 'from' with the previous segment's 'to'
      const lastSegment = segments[segments.length - 1];
      append({ 
        from: lastSegment?.to || '', 
        to: '', 
        departDate: lastSegment?.departDate || '' 
      });
    }
  };

  const removeSegment = (index: number) => {
    if (fields.length > 2) {
      remove(index);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-7xl mx-auto border border-gray-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-700 px-6 py-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
              <Plane className="w-6 h-6" />
              Multi-City Flight Search
            </h2>
            <p className="text-purple-100">
              Build your custom itinerary with multiple destinations
            </p>
          </div>
          
          <div className="bg-white/15 backdrop-blur-sm rounded-xl px-4 py-2">
            <span className="text-white font-semibold text-sm">
              {fields.length} {fields.length === 1 ? 'Segment' : 'Segments'}
            </span>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
        {/* Flight Segments */}
        <div className="space-y-4">
          {fields.map((field, index) => (
            <div key={field.id} className="relative">
              {/* Segment Header */}
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <span className="bg-indigo-100 text-indigo-700 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </span>
                  Flight {index + 1}
                </h3>
                {fields.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeSegment(index)}
                    className="text-red-500 hover:text-red-700 transition-colors duration-200"
                    title="Remove flight"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Segment Fields */}
              <div className="grid grid-cols-1 lg:grid-cols-7 gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                {/* From */}
                <div className="lg:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    From
                  </label>
                  <AirportSearchInput
                    label=""
                    placeholder="City or airport"
                    value={segments[index]?.from || ''}
                    onChange={(code, airport) => handleAirportChange(index, 'from', code, airport)}
                    error={errors.segments?.[index]?.from?.message}
                  />
                </div>

                {/* To */}
                <div className="lg:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    To
                  </label>
                  <AirportSearchInput
                    label=""
                    placeholder="City or airport"
                    value={segments[index]?.to || ''}
                    onChange={(code, airport) => handleAirportChange(index, 'to', code, airport)}
                    error={errors.segments?.[index]?.to?.message}
                  />
                </div>

                {/* Departure Date */}
                <div className="lg:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date
                  </label>
                  <input
                    {...register(`segments.${index}.departDate`)}
                    type="date"
                    min={index === 0 ? new Date().toISOString().split('T')[0] : segments[index - 1]?.departDate || new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-[11px] border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-gray-900 font-medium hover:border-gray-300 bg-white text-sm"
                  />
                  {errors.segments?.[index]?.departDate && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.segments[index]?.departDate?.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Add Segment Button */}
          {fields.length < 6 && (
            <button
              type="button"
              onClick={addSegment}
              className="w-full py-3 border-2 border-dashed border-indigo-300 hover:border-indigo-500 rounded-xl text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 transition-all duration-200 flex items-center justify-center gap-2 font-semibold"
            >
              <Plus className="w-5 h-5" />
              Add Another Flight
            </button>
          )}

          {errors.segments && typeof errors.segments.message === 'string' && (
            <p className="text-red-500 text-sm">{errors.segments.message}</p>
          )}
        </div>

        {/* Passengers and Class */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
          {/* Direct Flights Toggle */}
          <div className="md:col-span-2">
            <label className="flex items-center gap-3 p-3 bg-indigo-50 border-2 border-indigo-200 rounded-xl hover:bg-indigo-100 transition-colors cursor-pointer">
              <input
                {...register('directFlightsOnly')}
                type="checkbox"
                className="w-5 h-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              />
              <div>
                <span className="text-sm font-semibold text-gray-900">Direct flights only</span>
                <p className="text-xs text-gray-600">Show flights without layovers for each segment</p>
              </div>
            </label>
          </div>
          
          {/* Passengers */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Passengers
            </label>
            <div className="relative">
              <Users className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-600 w-5 h-5" />
              <select
                {...register('passengers', { valueAsNumber: true })}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-gray-900 font-medium hover:border-gray-300 bg-white appearance-none"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                  <option key={num} value={num}>
                    {num} {num === 1 ? 'Passenger' : 'Passengers'}
                  </option>
                ))}
              </select>
            </div>
            {errors.passengers && (
              <p className="text-red-500 text-xs mt-1">{errors.passengers.message}</p>
            )}
          </div>

          {/* Travel Class */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Travel Class
            </label>
            <select
              {...register('travelClass')}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-gray-900 font-medium hover:border-gray-300 bg-white appearance-none"
            >
              <option value="economy">Economy</option>
              <option value="premium-economy">Premium Economy</option>
              <option value="business">Business Class</option>
              <option value="first">First Class</option>
            </select>
            {errors.travelClass && (
              <p className="text-red-500 text-xs mt-1">{errors.travelClass.message}</p>
            )}
          </div>
        </div>

        {/* Search Button */}
        <Button
          type="submit"
          className="w-full h-14 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-3"
        >
          <Search className="w-5 h-5" />
          Search Multi-City Flights
        </Button>
      </form>
    </div>
  );
}
