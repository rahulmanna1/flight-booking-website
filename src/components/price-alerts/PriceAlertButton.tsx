'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usePriceAlerts } from '@/contexts/PriceAlertContext';
import { CreatePriceAlertRequest } from '@/types/priceAlert';
import { Bell, BellPlus, Loader, Check, X } from 'lucide-react';

interface PriceAlertButtonProps {
  flightData: {
    origin: string;
    destination: string;
    departTime: string;
    price: number;
    airline: string;
    flightNumber: string;
    travelClass?: string;
  };
  searchData: {
    from: string;
    to: string;
    departDate: string;
    returnDate?: string;
    passengers: number;
    tripType: 'roundtrip' | 'oneway';
    travelClass?: string;
  };
}

export default function PriceAlertButton({ flightData, searchData }: PriceAlertButtonProps) {
  const { user } = useAuth();
  const { createAlert } = usePriceAlerts();
  const [isCreating, setIsCreating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateAlert = async () => {
    if (!user) {
      // Could redirect to login or show login modal
      alert('Please sign in to create price alerts');
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      // Create alert data from flight and search information
      const alertData: CreatePriceAlertRequest = {
        origin: flightData.origin,
        destination: flightData.destination,
        departureDate: searchData.departDate,
        returnDate: searchData.tripType === 'roundtrip' ? searchData.returnDate : undefined,
        tripType: searchData.tripType === 'roundtrip' ? 'round-trip' : 'one-way',
        passengers: {
          adults: searchData.passengers,
          children: 0,
          infants: 0
        },
        cabinClass: (flightData.travelClass || searchData.travelClass || 'economy') as any,
        targetPrice: flightData.price * 0.9, // Set target 10% below current price
        currency: 'USD',
        alertType: 'price-below',
        frequency: 'daily',
        emailNotifications: true,
        pushNotifications: true
      };

      const result = await createAlert(alertData);
      
      if (result.success) {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      } else {
        setError(result.error || 'Failed to create price alert');
        setTimeout(() => setError(null), 5000);
      }
    } catch (err) {
      setError('An unexpected error occurred');
      setTimeout(() => setError(null), 5000);
    } finally {
      setIsCreating(false);
    }
  };

  if (!user) {
    return null; // Don't show button if user is not logged in
  }

  if (showSuccess) {
    return (
      <button
        className="inline-flex items-center space-x-2 px-3 py-2 text-sm font-medium text-green-700 bg-green-100 border border-green-300 rounded-lg transition-colors"
        disabled
      >
        <Check className="w-4 h-4" />
        <span>Alert Created!</span>
      </button>
    );
  }

  if (error) {
    return (
      <button
        className="inline-flex items-center space-x-2 px-3 py-2 text-sm font-medium text-red-700 bg-red-100 border border-red-300 rounded-lg transition-colors"
        disabled
      >
        <X className="w-4 h-4" />
        <span>Error</span>
      </button>
    );
  }

  return (
    <button
      onClick={handleCreateAlert}
      disabled={isCreating}
      className="inline-flex items-center space-x-2 px-3 py-2 text-sm font-medium text-blue-700 bg-blue-100 border border-blue-300 rounded-lg hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      title="Create price alert for this route"
    >
      {isCreating ? (
        <>
          <Loader className="w-4 h-4 animate-spin" />
          <span>Creating...</span>
        </>
      ) : (
        <>
          <BellPlus className="w-4 h-4" />
          <span>Price Alert</span>
        </>
      )}
    </button>
  );
}