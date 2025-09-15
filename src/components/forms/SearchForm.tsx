'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { Plane, Calendar, MapPin, Users } from 'lucide-react';

const searchSchema = z.object({
  from: z.string().min(1, 'Origin is required'),
  to: z.string().min(1, 'Destination is required'),
  departDate: z.string().min(1, 'Departure date is required'),
  returnDate: z.string().optional(),
  passengers: z.number().min(1, 'At least 1 passenger required'),
  tripType: z.enum(['roundtrip', 'oneway']),
});

type SearchFormData = z.infer<typeof searchSchema>;

export default function SearchForm() {
  const [tripType, setTripType] = useState<'roundtrip' | 'oneway'>('roundtrip');
  
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<SearchFormData>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      tripType: 'roundtrip',
      passengers: 1,
    }
  });

  const onSubmit = (data: SearchFormData) => {
    console.log('Search data:', data);
    // TODO: Implement search logic
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
      <div className="flex space-x-4 mb-6">
        <button
          type="button"
          onClick={() => {
            setTripType('roundtrip');
            setValue('tripType', 'roundtrip');
          }}
          className={`px-4 py-2 rounded-md ${
            tripType === 'roundtrip' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-100 text-gray-700'
          }`}
        >
          Round Trip
        </button>
        <button
          type="button"
          onClick={() => {
            setTripType('oneway');
            setValue('tripType', 'oneway');
          }}
          className={`px-4 py-2 rounded-md ${
            tripType === 'oneway' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-100 text-gray-700'
          }`}
        >
          One Way
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="inline w-4 h-4 mr-1" />
              From
            </label>
            <input
              {...register('from')}
              placeholder="Origin city"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errors.from && <p className="text-red-500 text-sm mt-1">{errors.from.message}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="inline w-4 h-4 mr-1" />
              To
            </label>
            <input
              {...register('to')}
              placeholder="Destination city"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errors.to && <p className="text-red-500 text-sm mt-1">{errors.to.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="inline w-4 h-4 mr-1" />
              Departure Date
            </label>
            <input
              {...register('departDate')}
              type="date"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {[1,2,3,4,5,6,7,8,9].map(num => (
                <option key={num} value={num}>{num} Passenger{num > 1 ? 's' : ''}</option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
        >
          <Plane className="w-5 h-5" />
          <span>Search Flights</span>
        </button>
      </form>
    </div>
  );
}