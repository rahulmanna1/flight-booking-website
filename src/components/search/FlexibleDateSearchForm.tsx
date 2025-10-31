'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Calendar, DollarSign, TrendingDown, Sparkles } from 'lucide-react';
import AirportSearchInput from '../forms/AirportSearchInput';
import { Airport } from '@/app/api/airports/search/route';

const flexibleSearchSchema = z.object({
  from: z.string().min(1, 'Origin is required'),
  to: z.string().min(1, 'Destination is required'),
  month: z.string().min(1, 'Month is required'),
  passengers: z.number().min(1, 'At least 1 passenger required'),
  tripType: z.enum(['roundtrip', 'oneway']),
  travelClass: z.enum(['economy', 'premium-economy', 'business', 'first']),
  flexibleDays: z.number().min(1).max(7).default(3),
});

type FlexibleSearchData = z.infer<typeof flexibleSearchSchema>;

interface FlexibleDateSearchFormProps {
  onSearch?: (data: FlexibleSearchData) => void;
}

export default function FlexibleDateSearchForm({ onSearch }: FlexibleDateSearchFormProps) {
  const [selectedFromAirport, setSelectedFromAirport] = useState<Airport | null>(null);
  const [selectedToAirport, setSelectedToAirport] = useState<Airport | null>(null);

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<FlexibleSearchData>({
    resolver: zodResolver(flexibleSearchSchema),
    defaultValues: {
      tripType: 'roundtrip',
      passengers: 1,
      travelClass: 'economy',
      flexibleDays: 3,
    }
  });

  const tripType = watch('tripType');
  const flexibleDays = watch('flexibleDays');

  const onSubmit = (data: FlexibleSearchData) => {
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

  // Get next 12 months
  const getMonthOptions = () => {
    const months = [];
    const today = new Date();
    for (let i = 0; i < 12; i++) {
      const date = new Date(today.getFullYear(), today.getMonth() + i, 1);
      months.push({
        value: date.toISOString().substring(0, 7), // YYYY-MM format
        label: date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      });
    }
    return months;
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-700 px-6 py-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
              <Calendar className="w-6 h-6" />
              Flexible Date Search
            </h2>
            <p className="text-green-100">
              Compare prices across multiple dates to find the best deal
            </p>
          </div>
          
          <div className="bg-white/15 backdrop-blur-sm rounded-xl px-4 py-2">
            <div className="flex items-center gap-2 text-white">
              <TrendingDown className="w-5 h-5" />
              <span className="font-semibold text-sm">Save up to 40%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
        
        {/* Trip Type */}
        <div className="flex gap-4 pb-4 border-b border-gray-200">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              {...register('tripType')}
              value="roundtrip"
              className="w-4 h-4 text-blue-600"
            />
            <span className="text-sm font-medium text-gray-700">Round Trip</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              {...register('tripType')}
              value="oneway"
              className="w-4 h-4 text-blue-600"
            />
            <span className="text-sm font-medium text-gray-700">One Way</span>
          </label>
        </div>

        {/* Route Selection */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* From */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              From
            </label>
            <AirportSearchInput
              label=""
              placeholder="City or airport"
              value={watch('from') || ''}
              onChange={handleFromAirportChange}
              error={errors.from?.message}
            />
          </div>

          {/* To */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              To
            </label>
            <AirportSearchInput
              label=""
              placeholder="City or airport"
              value={watch('to') || ''}
              onChange={handleToAirportChange}
              error={errors.to?.message}
            />
          </div>
        </div>

        {/* Month & Flexibility */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Month Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Travel Month
            </label>
            <select
              {...register('month')}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">Select month</option>
              {getMonthOptions().map(month => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>
            {errors.month && (
              <p className="text-red-500 text-sm mt-1">{errors.month.message}</p>
            )}
          </div>

          {/* Flexible Days */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date Flexibility (±{flexibleDays} days)
            </label>
            <input
              type="range"
              {...register('flexibleDays', { valueAsNumber: true })}
              min="1"
              max="7"
              className="w-full h-2 bg-green-200 rounded-lg appearance-none cursor-pointer accent-green-600"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>1 day</span>
              <span>7 days</span>
            </div>
          </div>
        </div>

        {/* Passengers & Class */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Passengers */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Passengers
            </label>
            <select
              {...register('passengers', { valueAsNumber: true })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                <option key={num} value={num}>
                  {num} {num === 1 ? 'Passenger' : 'Passengers'}
                </option>
              ))}
            </select>
          </div>

          {/* Travel Class */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Travel Class
            </label>
            <select
              {...register('travelClass')}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="economy">Economy</option>
              <option value="premium-economy">Premium Economy</option>
              <option value="business">Business</option>
              <option value="first">First Class</option>
            </select>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-green-800">
              <p className="font-semibold mb-1">How it works:</p>
              <ul className="space-y-1">
                <li>• We'll show you prices for multiple dates around your selected month</li>
                <li>• Compare prices for ±{flexibleDays} days to find the best deal</li>
                <li>• Green prices indicate the cheapest options</li>
                <li>• Perfect for travelers with flexible schedules</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-green-600 to-emerald-700 text-white py-4 px-6 rounded-xl font-semibold hover:from-green-700 hover:to-emerald-800 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 group"
        >
          <DollarSign className="w-5 h-5 group-hover:scale-110 transition-transform" />
          Compare Prices
        </button>
      </form>
    </div>
  );
}
