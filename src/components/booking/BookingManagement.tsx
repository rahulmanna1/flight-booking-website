'use client';

import React, { useState, useEffect } from 'react';
import { Search, Calendar, MapPin, Plane, Users, CreditCard, Mail, Phone, Edit, Trash2, Download, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { useCurrency } from '@/contexts/CurrencyContext';

interface Booking {
  id: string;
  bookingReference: string;
  confirmationNumber: string;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  bookingDate: string;
  flight: {
    airline: string;
    flightNumber: string;
    origin: string;
    destination: string;
    departDate: string;
    departTime: string;
    arriveTime: string;
    duration: string;
  };
  passengers: Array<{
    firstName: string;
    lastName: string;
    type: 'adult' | 'child' | 'infant';
    seatNumber?: string;
  }>;
  pricing: {
    total: number;
  };
  contact: {
    email: string;
    phone: string;
  };
}

interface BookingManagementProps {
  onBookingSelect?: (booking: Booking) => void;
  className?: string;
}

// Mock bookings data - in a real app, this would come from an API
const generateMockBookings = (): Booking[] => {
  const airlines = ['Emirates', 'British Airways', 'Lufthansa', 'Air France', 'United Airlines'];
  const origins = ['JFK', 'LAX', 'LHR', 'CDG', 'FRA'];
  const destinations = ['DXB', 'SYD', 'NRT', 'SIN', 'HKG'];
  const statuses: ('confirmed' | 'pending' | 'cancelled' | 'completed')[] = ['confirmed', 'pending', 'cancelled', 'completed'];

  return Array.from({ length: 6 }, (_, index) => ({
    id: `booking-${index + 1}`,
    bookingReference: `FB${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
    confirmationNumber: `CNF${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
    status: statuses[Math.floor(Math.random() * statuses.length)],
    bookingDate: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
    flight: {
      airline: airlines[Math.floor(Math.random() * airlines.length)],
      flightNumber: `${['EK', 'BA', 'LH', 'AF', 'UA'][Math.floor(Math.random() * 5)]}${Math.floor(Math.random() * 9000) + 1000}`,
      origin: origins[Math.floor(Math.random() * origins.length)],
      destination: destinations[Math.floor(Math.random() * destinations.length)],
      departDate: new Date(Date.now() + Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString(),
      departTime: `${Math.floor(Math.random() * 24).toString().padStart(2, '0')}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`,
      arriveTime: `${Math.floor(Math.random() * 24).toString().padStart(2, '0')}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`,
      duration: `${Math.floor(Math.random() * 12) + 2}h ${Math.floor(Math.random() * 60)}m`
    },
    passengers: [
      {
        firstName: ['John', 'Jane', 'Michael', 'Sarah', 'David'][Math.floor(Math.random() * 5)],
        lastName: ['Smith', 'Johnson', 'Brown', 'Davis', 'Wilson'][Math.floor(Math.random() * 5)],
        type: 'adult',
        seatNumber: `${Math.floor(Math.random() * 30) + 1}${'ABCDEF'[Math.floor(Math.random() * 6)]}`
      }
    ],
    pricing: {
      total: Math.floor(Math.random() * 2000) + 300
    },
    contact: {
      email: 'passenger@example.com',
      phone: '+1 (555) 123-4567'
    }
  }));
};

export default function BookingManagement({ onBookingSelect, className = '' }: BookingManagementProps) {
  const { formatPrice } = useCurrency();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setBookings(generateMockBookings());
      setLoading(false);
    }, 1000);
  }, []);

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = searchTerm === '' || 
      booking.bookingReference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.flight.airline.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.flight.flightNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.passengers.some(p => 
        `${p.firstName} ${p.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'pending':
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-blue-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'text-green-600 bg-green-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'cancelled':
        return 'text-red-600 bg-red-100';
      case 'completed':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleCancelBooking = (bookingId: string) => {
    setBookings(prev => prev.map(booking => 
      booking.id === bookingId 
        ? { ...booking, status: 'cancelled' as const }
        : booking
    ));
  };

  const handleDownloadTicket = (booking: Booking) => {
    // In a real app, this would generate and download a PDF ticket
    console.log('Downloading ticket for booking:', booking.bookingReference);
    alert(`Downloading ticket for booking ${booking.bookingReference}`);
  };

  if (loading) {
    return (
      <div className={`${className}`}>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading bookings...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Bookings</h2>
          <p className="text-gray-600">Manage your flight reservations</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search Input */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by booking reference, flight, or passenger name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Status Filter */}
          <div className="md:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-200">
          <Plane className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No bookings found</h3>
          <p className="text-gray-600">
            {searchTerm || statusFilter !== 'all' 
              ? 'Try adjusting your search criteria or filters.'
              : 'You haven\'t made any flight bookings yet.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <div key={booking.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              
              {/* Header Row */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{booking.bookingReference}</h3>
                    <p className="text-sm text-gray-500">Booked on {formatDate(booking.bookingDate)}</p>
                  </div>
                  <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                    {getStatusIcon(booking.status)}
                    <span className="capitalize">{booking.status}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">{formatPrice(booking.pricing.total)}</p>
                  <p className="text-sm text-gray-500">Total paid</p>
                </div>
              </div>

              {/* Flight Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Flight Details</p>
                  <div className="space-y-1">
                    <p className="font-semibold">{booking.flight.airline}</p>
                    <p className="text-sm text-gray-600">{booking.flight.flightNumber}</p>
                    <p className="text-xs text-gray-500">{booking.flight.duration}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Route</p>
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold">{booking.flight.origin}</span>
                    <Plane className="w-4 h-4 text-gray-400 transform rotate-90" />
                    <span className="font-semibold">{booking.flight.destination}</span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                    <span>{booking.flight.departTime}</span>
                    <span>→</span>
                    <span>{booking.flight.arriveTime}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDate(booking.flight.departDate)}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Passengers</p>
                  <div className="space-y-1">
                    {booking.passengers.map((passenger, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm">{passenger.firstName} {passenger.lastName}</span>
                        {passenger.seatNumber && (
                          <span className="text-xs text-gray-500">{passenger.seatNumber}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-700 mb-2">Contact Information</p>
                <div className="flex flex-col md:flex-row md:items-center md:space-x-6 space-y-2 md:space-y-0">
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{booking.contact.email}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{booking.contact.phone}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200">
                <button
                  onClick={() => handleDownloadTicket(booking)}
                  disabled={booking.status === 'cancelled'}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Ticket</span>
                </button>

                {onBookingSelect && (
                  <button
                    onClick={() => onBookingSelect(booking)}
                    className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    <span>View Details</span>
                  </button>
                )}

                {booking.status === 'confirmed' && (
                  <button
                    onClick={() => handleCancelBooking(booking.id)}
                    className="flex items-center space-x-2 px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Cancel Booking</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary Stats */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{bookings.filter(b => b.status === 'confirmed').length}</p>
            <p className="text-sm text-gray-600">Confirmed</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-600">{bookings.filter(b => b.status === 'pending').length}</p>
            <p className="text-sm text-gray-600">Pending</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{bookings.filter(b => b.status === 'completed').length}</p>
            <p className="text-sm text-gray-600">Completed</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600">{bookings.filter(b => b.status === 'cancelled').length}</p>
            <p className="text-sm text-gray-600">Cancelled</p>
          </div>
        </div>
      </div>
    </div>
  );
}