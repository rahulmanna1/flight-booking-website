'use client';

import { useState } from 'react';
import { EnhancedFlightCard } from '@/components/booking';

// Test data
const mockFlight = {
  id: 'test-flight-1',
  airline: 'Emirates',
  flightNumber: 'EK203',
  origin: 'JFK',
  destination: 'DXB',
  departTime: '14:30',
  arriveTime: '06:45+1',
  departDate: '2025-09-25',
  arriveDate: '2025-09-26',
  duration: '12h 15m',
  price: 899,
  stops: 0,
  aircraft: 'Boeing 777-300ER',
  travelClass: 'economy'
};

const mockSearchParams = {
  passengers: 2,
  children: 1,
  infants: 0,
  departDate: '2025-09-25',
  returnDate: '2025-10-05'
};

export default function TestBookingPage() {
  const [bookingCompleted, setBookingCompleted] = useState<string | null>(null);

  const handleBookingComplete = (bookingReference: string) => {
    setBookingCompleted(bookingReference);
    console.log('Booking completed with reference:', bookingReference);
  };

  if (bookingCompleted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl p-8 shadow-lg text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            ✅
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Test Completed!</h2>
          <p className="text-gray-600 mb-4">
            Booking Reference: <strong>{bookingCompleted}</strong>
          </p>
          <button
            onClick={() => setBookingCompleted(null)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Test Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🧪 Booking Flow Test
          </h1>
          <p className="text-gray-600">
            Click "Book This Flight" to test the complete booking flow
          </p>
        </div>

        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">Test Scenario:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Flight: {mockFlight.airline} {mockFlight.flightNumber}</li>
            <li>• Route: {mockFlight.origin} → {mockFlight.destination}</li>
            <li>• Passengers: {mockSearchParams.passengers} Adults, {mockSearchParams.children} Child</li>
            <li>• Travel Class: {mockFlight.travelClass}</li>
            <li>• Date: {mockSearchParams.departDate}</li>
          </ul>
        </div>

        <EnhancedFlightCard
          flight={mockFlight}
          searchParams={mockSearchParams}
          onBookingComplete={handleBookingComplete}
        />

        <div className="mt-8 p-4 bg-yellow-50 rounded-lg">
          <h3 className="font-semibold text-yellow-900 mb-2">What will be tested:</h3>
          <ol className="text-sm text-yellow-800 space-y-1 list-decimal list-inside">
            <li>Interactive seat selection with aircraft map</li>
            <li>Passenger details form with validation</li>
            <li>Payment processing with multiple methods</li>
            <li>Booking confirmation with QR code</li>
            <li>Email confirmation and ticket download</li>
          </ol>
        </div>
      </div>
    </div>
  );
}