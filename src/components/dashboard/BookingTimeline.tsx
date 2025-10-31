'use client';

import { Plane, Calendar, MapPin, Clock, CheckCircle } from 'lucide-react';
import Link from 'next/link';

interface Booking {
  id: string;
  bookingReference: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  flightData: {
    departure: string;
    arrival: string;
    departureTime: string;
    arrivalTime: string;
    airline?: string;
    flightNumber?: string;
  };
}

interface BookingTimelineProps {
  bookings: Booking[];
  title?: string;
  emptyMessage?: string;
}

export default function BookingTimeline({ 
  bookings, 
  title = 'Recent Bookings',
  emptyMessage = 'No bookings found'
}: BookingTimelineProps) {
  
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return <CheckCircle className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  if (bookings.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <Plane className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <Link href="/bookings" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
          View all →
        </Link>
      </div>

      <div className="space-y-4">
        {bookings.map((booking, index) => (
          <div 
            key={booking.id} 
            className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-sm transition-all"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(booking.status)}`}>
                    {getStatusIcon(booking.status)}
                    <span className="ml-1 capitalize">{booking.status}</span>
                  </span>
                  <span className="text-xs text-gray-500">
                    Ref: {booking.bookingReference}
                  </span>
                </div>

                <div className="flex items-center space-x-3 mb-3">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="font-semibold text-gray-900">{booking.flightData.departure}</span>
                  </div>
                  <Plane className="w-4 h-4 text-blue-500 transform rotate-90" />
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="font-semibold text-gray-900">{booking.flightData.arrival}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  {booking.flightData.airline && (
                    <span className="flex items-center">
                      <Plane className="w-3 h-3 mr-1" />
                      {booking.flightData.airline}
                      {booking.flightData.flightNumber && ` ${booking.flightData.flightNumber}`}
                    </span>
                  )}
                  <span className="flex items-center">
                    <Calendar className="w-3 h-3 mr-1" />
                    {new Date(booking.flightData.departureTime).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                </div>
              </div>

              <div className="text-right ml-4">
                <p className="text-lg font-bold text-gray-900">
                  ${booking.totalAmount.toLocaleString()}
                </p>
                <Link 
                  href={`/bookings/${booking.id}`}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium mt-1 inline-block"
                >
                  View details →
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
