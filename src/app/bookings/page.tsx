'use client';

import { useState } from 'react';
import { useCurrency } from '@/contexts/CurrencyContext';
import Header from '@/components/ui/Header';
import { Plane, Calendar, Clock, MapPin, User, Download, Mail, Phone } from 'lucide-react';

interface Booking {
  id: string;
  bookingReference: string;
  status: 'confirmed' | 'cancelled' | 'completed';
  flight: {
    airline: string;
    flightNumber: string;
    origin: string;
    destination: string;
    departTime: string;
    arriveTime: string;
    date: string;
    duration: string;
    aircraft: string;
  };
  passenger: {
    name: string;
    email: string;
    phone: string;
  };
  price: number;
  bookingDate: string;
  seats: string[];
}

// Mock booking data
const mockBookings: Booking[] = [
  {
    id: '1',
    bookingReference: 'FB2024001',
    status: 'confirmed',
    flight: {
      airline: 'American Airlines',
      flightNumber: 'AA 1234',
      origin: 'JFK',
      destination: 'LAX',
      departTime: '08:30',
      arriveTime: '11:45',
      date: '2024-02-15',
      duration: '5h 15m',
      aircraft: 'Boeing 737-800'
    },
    passenger: {
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+1 (555) 123-4567'
    },
    price: 299,
    bookingDate: '2024-01-15',
    seats: ['12A']
  },
  {
    id: '2',
    bookingReference: 'FB2024002',
    status: 'completed',
    flight: {
      airline: 'Delta Air Lines',
      flightNumber: 'DL 5678',
      origin: 'LAX',
      destination: 'LHR',
      departTime: '22:15',
      arriveTime: '17:30',
      date: '2024-01-10',
      duration: '10h 15m',
      aircraft: 'Boeing 777-200'
    },
    passenger: {
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+1 (555) 123-4567'
    },
    price: 649,
    bookingDate: '2023-12-10',
    seats: ['8C']
  },
  {
    id: '3',
    bookingReference: 'FB2024003',
    status: 'cancelled',
    flight: {
      airline: 'United Airlines',
      flightNumber: 'UA 9012',
      origin: 'SFO',
      destination: 'NRT',
      departTime: '14:20',
      arriveTime: '18:45',
      date: '2024-03-20',
      duration: '11h 25m',
      aircraft: 'Boeing 787-9'
    },
    passenger: {
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+1 (555) 123-4567'
    },
    price: 789,
    bookingDate: '2024-01-20',
    seats: ['15F']
  }
];

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>(mockBookings);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [filter, setFilter] = useState<'all' | 'confirmed' | 'completed' | 'cancelled'>('all');
  const { formatPrice } = useCurrency();

  const filteredBookings = bookings.filter(booking => 
    filter === 'all' || booking.status === filter
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'text-green-600 bg-green-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      case 'completed': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const handleDownloadTicket = (booking: Booking) => {
    // Simulate ticket download
    console.log('Downloading ticket for booking:', booking.bookingReference);
    alert(`Downloading e-ticket for booking ${booking.bookingReference}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Plane className="w-8 h-8 text-blue-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
          </div>
          <p className="text-gray-600">
            Manage your flight bookings, download tickets, and view travel details.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-4 mb-6">
          {[
            { key: 'all', label: 'All Bookings', count: bookings.length },
            { key: 'confirmed', label: 'Confirmed', count: bookings.filter(b => b.status === 'confirmed').length },
            { key: 'completed', label: 'Completed', count: bookings.filter(b => b.status === 'completed').length },
            { key: 'cancelled', label: 'Cancelled', count: bookings.filter(b => b.status === 'cancelled').length }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === tab.key
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Bookings List */}
        <div className="space-y-6">
          {filteredBookings.length > 0 ? (
            filteredBookings.map((booking) => (
              <div key={booking.id} className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                {/* Booking Header */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {booking.bookingReference}
                        </h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(booking.status)}`}>
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm">
                        Booked on {new Date(booking.bookingDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">
                        {formatPrice(booking.price)}
                      </p>
                      <p className="text-gray-500 text-sm">Total paid</p>
                    </div>
                  </div>
                </div>

                {/* Flight Details */}
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Flight Info */}
                    <div className="md:col-span-2">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <Plane className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{booking.flight.airline}</h4>
                            <p className="text-gray-600 text-sm">{booking.flight.flightNumber}</p>
                          </div>
                        </div>
                        <p className="text-gray-600 text-sm">{booking.flight.aircraft}</p>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                          <div className="flex items-center justify-center space-x-1 mb-1">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span className="font-semibold text-gray-900">{booking.flight.origin}</span>
                          </div>
                          <p className="text-lg font-bold text-gray-900">{booking.flight.departTime}</p>
                          <p className="text-sm text-gray-500">Departure</p>
                        </div>

                        <div className="text-center">
                          <div className="flex items-center justify-center space-x-2 mb-1">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">{booking.flight.duration}</span>
                          </div>
                          <div className="flex items-center justify-center">
                            <div className="w-8 h-0.5 bg-gray-300"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full mx-1"></div>
                            <div className="w-8 h-0.5 bg-gray-300"></div>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">Direct</p>
                        </div>

                        <div className="text-center">
                          <div className="flex items-center justify-center space-x-1 mb-1">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span className="font-semibold text-gray-900">{booking.flight.destination}</span>
                          </div>
                          <p className="text-lg font-bold text-gray-900">{booking.flight.arriveTime}</p>
                          <p className="text-sm text-gray-500">Arrival</p>
                        </div>
                      </div>
                    </div>

                    {/* Travel Date & Actions */}
                    <div>
                      <div className="mb-6">
                        <div className="flex items-center space-x-2 mb-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">Travel Date</span>
                        </div>
                        <p className="font-semibold text-gray-900">
                          {new Date(booking.flight.date).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                        <p className="text-sm text-gray-600">Seat: {booking.seats.join(', ')}</p>
                      </div>

                      {booking.status === 'confirmed' && (
                        <div className="space-y-2">
                          <button
                            onClick={() => handleDownloadTicket(booking)}
                            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 text-sm"
                          >
                            <Download className="w-4 h-4" />
                            <span>Download E-Ticket</span>
                          </button>
                          <button className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors text-sm">
                            Manage Booking
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Passenger Info */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h5 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                      <User className="w-4 h-4 mr-2" />
                      Passenger Information
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Name:</span> {booking.passenger.name}
                      </div>
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 mr-1" />
                        {booking.passenger.email}
                      </div>
                      <div className="flex items-center">
                        <Phone className="w-4 h-4 mr-1" />
                        {booking.passenger.phone}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plane className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No bookings found</h3>
              <p className="text-gray-600 mb-4">
                {filter === 'all' 
                  ? "You haven't made any flight bookings yet." 
                  : `No ${filter} bookings found.`}
              </p>
              <button className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors">
                Search Flights
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}