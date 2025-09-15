'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Header from '@/components/ui/Header';
import BookingForm from '@/components/forms/BookingForm';
import FlightCard from '@/components/cards/FlightCard';
import { ArrowLeft, Check } from 'lucide-react';

// Mock flight data (in real app, this would come from an API)
const getFlightById = (id: string) => {
  const flights = {
    '1': {
      id: '1',
      airline: 'American Airlines',
      flightNumber: 'AA 123',
      origin: 'NYC',
      destination: 'LAX',
      departTime: '08:30',
      arriveTime: '11:45',
      duration: '6h 15m',
      price: 299,
      stops: 0,
      aircraft: 'Boeing 737-800'
    },
    '2': {
      id: '2',
      airline: 'Delta Airlines',
      flightNumber: 'DL 456',
      origin: 'NYC',
      destination: 'LAX',
      departTime: '14:20',
      arriveTime: '17:55',
      duration: '6h 35m',
      price: 349,
      stops: 0,
      aircraft: 'Airbus A320'
    },
    // Add other flights as needed
  };
  return flights[id as keyof typeof flights];
};

export default function BookingPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Booking Form, 2: Confirmation
  
  const flightId = params.id as string;
  const flight = getFlightById(flightId);

  if (!flight) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Flight Not Found</h1>
            <p className="text-gray-600 mb-8">The flight you're looking for doesn't exist.</p>
            <button
              onClick={() => router.push('/search')}
              className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700"
            >
              Back to Search
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleBookingSubmit = async (data: any) => {
    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setLoading(false);
    setStep(2);
  };

  const totalPrice = flight.price; // In real app, calculate with taxes, fees, etc.

  if (step === 2) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Booking Confirmed!
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              Your flight has been successfully booked. You will receive a confirmation email shortly.
            </p>
            
            <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left max-w-md mx-auto">
              <h3 className="font-semibold text-gray-900 mb-4">Booking Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Confirmation Code:</span>
                  <span className="font-semibold">ABC123XYZ</span>
                </div>
                <div className="flex justify-between">
                  <span>Flight:</span>
                  <span>{flight.flightNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span>Route:</span>
                  <span>{flight.origin} → {flight.destination}</span>
                </div>
                <div className="flex justify-between">
                  <span>Date:</span>
                  <span>Dec 25, 2024</span>
                </div>
                <div className="flex justify-between">
                  <span>Time:</span>
                  <span>{flight.departTime} - {flight.arriveTime}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Total Paid:</span>
                  <span>${totalPrice}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => router.push('/bookings')}
                className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700"
              >
                View My Bookings
              </button>
              <button
                onClick={() => router.push('/')}
                className="bg-gray-200 text-gray-800 px-6 py-3 rounded-md hover:bg-gray-300"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Back Button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <button
          onClick={() => router.back()}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Search Results</span>
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Flight Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Flight Summary</h2>
              
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <FlightCard 
                  flight={flight} 
                  onSelect={() => {}} 
                />
              </div>

              {/* Price Breakdown */}
              <div className="mt-6 space-y-3">
                <h3 className="font-semibold text-gray-900">Price Breakdown</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Base Fare:</span>
                    <span>${flight.price}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Taxes & Fees:</span>
                    <span>$0</span>
                  </div>
                  <div className="border-t pt-2 font-semibold flex justify-between">
                    <span>Total:</span>
                    <span>${totalPrice}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Form */}
          <div className="lg:col-span-2">
            <BookingForm 
              onSubmit={handleBookingSubmit}
              totalPrice={totalPrice}
              loading={loading}
            />
          </div>
        </div>
      </div>
    </div>
  );
}