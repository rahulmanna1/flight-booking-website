'use client';

import { useState, useEffect } from 'react';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/ui/Header';
import { Plane, Calendar, Clock, MapPin, User, Download, Mail, Phone, AlertCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface Booking {
  id: string;
  bookingReference: string;
  status: 'confirmed' | 'cancelled' | 'completed' | 'pending';
  flightId: string;
  flight: {
    airline: string;
    flightNumber: string;
    origin: string;
    destination: string;
    departureTime: string;
    arrivalTime: string;
    departureDate: string;
    duration: string;
    aircraft?: string;
    class: string;
  };
  passenger: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dateOfBirth?: string;
    nationality?: string;
    passportNumber?: string;
  };
  totalPrice: number;
  seatNumber?: string;
  mealPreference?: string;
  specialRequests?: string;
  paymentMethod: string;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  createdAt: string;
  updatedAt: string;
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [filter, setFilter] = useState<'all' | 'confirmed' | 'completed' | 'cancelled' | 'pending'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { formatPrice } = useCurrency();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  // Fetch bookings from API
  const fetchBookings = async () => {
    if (!isAuthenticated || !user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/bookings', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Please log in to view your bookings');
        }
        throw new Error('Failed to fetch bookings');
      }

      const data = await response.json();
      setBookings(data.data?.bookings || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Fetch bookings when component mounts or user changes
  useEffect(() => {
    if (!authLoading) {
      fetchBookings();
    }
  }, [isAuthenticated, user, authLoading]);

  const filteredBookings = bookings.filter(booking => 
    filter === 'all' || booking.status === filter
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'text-green-600 bg-green-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      case 'completed': return 'text-blue-600 bg-blue-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const handleDownloadTicket = async (booking: Booking) => {
    try {
      console.log('Downloading ticket for booking:', booking.bookingReference);
      
      const ticketContent = [
        'Flight Booking Confirmation',
        '',
        `Booking Reference: ${booking.bookingReference}`,
        `Passenger: ${booking.passenger.firstName} ${booking.passenger.lastName}`,
        `Flight: ${booking.flight.flightNumber} - ${booking.flight.airline}`,
        `Route: ${booking.flight.origin} → ${booking.flight.destination}`,
        `Departure: ${booking.flight.departureTime} on ${new Date(booking.flight.departureDate).toDateString()}`,
        `Seat: ${booking.seatNumber || 'Not assigned'}`,
        `Class: ${booking.flight.class}`,
        `Total Paid: ${formatPrice(booking.totalPrice)}`,
        `Status: ${booking.status.toUpperCase()}`,
        '',
        'Thank you for choosing our airline!'
      ].join('\n');
      
      const blob = new Blob([ticketContent], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ticket-${booking.bookingReference}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      alert(`E-ticket for booking ${booking.bookingReference} downloaded successfully!`);
    } catch (error) {
      console.error('Error downloading ticket:', error);
      alert('Failed to download ticket. Please try again.');
    }
  };

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Loading...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show login message if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-12 h-12 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Authentication Required</h3>
            <p className="text-gray-600 mb-4">
              Please log in to view your flight bookings.
            </p>
            <a
              href="/login"
              className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 active:bg-blue-700 transition-colors inline-block"
            >
              Sign In
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Plane className="w-8 h-8 text-blue-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
          </div>
          <p className="text-gray-600">
            Manage your flight bookings, download tickets, and view travel details.
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
              <span className="text-red-700">{error}</span>
              <button
                onClick={fetchBookings}
                className="ml-auto text-red-600 hover:text-red-800 text-sm font-medium"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Loading your bookings...</p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex space-x-4 mb-6 overflow-x-auto">
              {[
                { key: 'all', label: 'All Bookings', count: bookings.length },
                { key: 'confirmed', label: 'Confirmed', count: bookings.filter(b => b.status === 'confirmed').length },
                { key: 'pending', label: 'Pending', count: bookings.filter(b => b.status === 'pending').length },
                { key: 'completed', label: 'Completed', count: bookings.filter(b => b.status === 'completed').length },
                { key: 'cancelled', label: 'Cancelled', count: bookings.filter(b => b.status === 'cancelled').length }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key as typeof filter)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                    filter === tab.key
                      ? 'bg-blue-500 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </div>

            <div className="space-y-6">
              {filteredBookings.length > 0 ? (
                filteredBookings.map((booking) => (
                  <div key={booking.id} className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
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
                            Booked on {new Date(booking.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-gray-900">
                            {formatPrice(booking.totalPrice)}
                          </p>
                          <p className="text-gray-500 text-sm">Total paid</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                                <MapPin className="w-4 h-4 text-gray-600" />
                                <span className="font-semibold text-gray-900">{booking.flight.origin}</span>
                              </div>
                              <p className="text-lg font-bold text-gray-900">{booking.flight.departureTime}</p>
                              <p className="text-sm text-gray-500">Departure</p>
                            </div>

                            <div className="text-center">
                              <div className="flex items-center justify-center space-x-2 mb-1">
                                <Clock className="w-4 h-4 text-gray-600" />
                                <span className="text-sm text-gray-600">{booking.flight.duration}</span>
                              </div>
                              <div className="flex items-center justify-center">
                                <div className="w-8 h-0.5 bg-gray-300"></div>
                                <div className="w-2 h-2 bg-gray-600 rounded-full mx-1"></div>
                                <div className="w-8 h-0.5 bg-gray-300"></div>
                              </div>
                              <p className="text-xs text-gray-500 mt-1">Direct</p>
                            </div>

                            <div className="text-center">
                              <div className="flex items-center justify-center space-x-1 mb-1">
                                <MapPin className="w-4 h-4 text-gray-600" />
                                <span className="font-semibold text-gray-900">{booking.flight.destination}</span>
                              </div>
                              <p className="text-lg font-bold text-gray-900">{booking.flight.arrivalTime}</p>
                              <p className="text-sm text-gray-500">Arrival</p>
                            </div>
                          </div>
                        </div>

                        <div>
                          <div className="mb-6">
                            <div className="flex items-center space-x-2 mb-2">
                              <Calendar className="w-4 h-4 text-gray-600" />
                              <span className="text-sm text-gray-600">Travel Date</span>
                            </div>
                            <p className="font-semibold text-gray-900">
                              {new Date(booking.flight.departureDate).toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </p>
                            <p className="text-sm text-gray-600">
                              Seat: {booking.seatNumber || 'Not assigned'}
                            </p>
                            <p className="text-sm text-gray-600">
                              Class: {booking.flight.class}
                            </p>
                          </div>

                          {booking.status === 'confirmed' && (
                            <div className="space-y-2">
                              <button
                                onClick={() => handleDownloadTicket(booking)}
                                className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 active:bg-blue-700 transition-colors flex items-center justify-center space-x-2 text-sm"
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

                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <h5 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                          <User className="w-4 h-4 mr-2" />
                          Passenger Information
                        </h5>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Name:</span> {booking.passenger.firstName} {booking.passenger.lastName}
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
                    <Plane className="w-12 h-12 text-gray-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No bookings found</h3>
                  <p className="text-gray-600 mb-4">
                    {filter === 'all' 
                      ? "You have not made any flight bookings yet." 
                      : "No " + filter + " bookings found."}
                  </p>
                  <Link
                    href="/"
                    className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 active:bg-blue-700 transition-colors inline-block"
                  >
                    Search Flights
                  </Link>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}