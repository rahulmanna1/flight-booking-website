'use client';

import React, { useState, useRef } from 'react';
import { CheckCircle, Download, Mail, Calendar, MapPin, Plane, Clock, Users, CreditCard, Phone, AlertCircle, Share2, Smartphone } from 'lucide-react';
import { useCurrency } from '@/contexts/CurrencyContext';

interface BookingData {
  bookingReference: string;
  confirmationNumber: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  bookingDate: string;
  flight: {
    id: string;
    airline: string;
    flightNumber: string;
    origin: string;
    destination: string;
    departDate: string;
    departTime: string;
    arriveDate: string;
    arriveTime: string;
    duration: string;
    aircraft: string;
    terminal: string;
    gate?: string;
  };
  passengers: Array<{
    id: string;
    firstName: string;
    lastName: string;
    type: 'adult' | 'child' | 'infant';
    seatNumber?: string;
  }>;
  pricing: {
    subtotal: number;
    taxes: number;
    fees: number;
    seatFees: number;
    total: number;
  };
  contact: {
    email: string;
    phone: string;
  };
  payment: {
    method: string;
    lastFourDigits: string;
    amount: number;
  };
}

interface BookingConfirmationProps {
  bookingData: BookingData;
  onNewSearch: () => void;
}

// Generate QR code data (simplified - in real app would use proper QR library)
const generateQRCode = (data: string) => {
  // This would integrate with a QR code library like 'qrcode' in a real implementation
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(data)}`;
};

export default function BookingConfirmation({ bookingData, onNewSearch }: BookingConfirmationProps) {
  const { formatPrice } = useCurrency();
  const [emailSent, setEmailSent] = useState(false);
  const confirmationRef = useRef<HTMLDivElement>(null);

  const qrCodeData = JSON.stringify({
    bookingReference: bookingData.bookingReference,
    flight: bookingData.flight.flightNumber,
    passenger: bookingData.passengers[0]?.firstName + ' ' + bookingData.passengers[0]?.lastName,
    date: bookingData.flight.departDate,
    route: `${bookingData.flight.origin}-${bookingData.flight.destination}`
  });

  const handleDownloadTicket = () => {
    // In a real implementation, this would generate a PDF
    if (confirmationRef.current) {
      const element = confirmationRef.current;
      
      // Simple download implementation - in real app would use jsPDF or similar
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Flight Ticket - ${bookingData.bookingReference}</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .ticket { max-width: 600px; margin: 0 auto; }
                .header { text-align: center; margin-bottom: 30px; }
                .section { margin-bottom: 20px; padding: 15px; border: 1px solid #ddd; }
                .qr-code { text-align: center; margin: 20px 0; }
                .important { background-color: #fff3cd; padding: 15px; border-radius: 5px; }
              </style>
            </head>
            <body>
              ${element.innerHTML}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  const handleResendEmail = async () => {
    // Simulate email sending
    setEmailSent(true);
    setTimeout(() => setEmailSent(false), 3000);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'text-green-600';
      case 'pending': return 'text-yellow-600';
      case 'cancelled': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Success Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
        <p className="text-lg text-gray-600">Your flight has been successfully booked</p>
        <p className="text-sm text-gray-500 mt-2">
          Confirmation sent to {bookingData.contact.email}
        </p>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap justify-center gap-4">
        <button
          onClick={handleDownloadTicket}
          className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>Download Ticket</span>
        </button>
        <button
          onClick={handleResendEmail}
          disabled={emailSent}
          className="flex items-center space-x-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Mail className="w-4 h-4" />
          <span>{emailSent ? 'Email Sent!' : 'Resend Email'}</span>
        </button>
        <button
          onClick={() => navigator.share && navigator.share({
            title: 'Flight Booking Confirmation',
            text: `Flight booking confirmed! Reference: ${bookingData.bookingReference}`,
            url: window.location.href
          })}
          className="flex items-center space-x-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Share2 className="w-4 h-4" />
          <span>Share</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Confirmation Details */}
        <div className="lg:col-span-2 space-y-6" ref={confirmationRef}>
          
          {/* Booking Information */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Booking Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Booking Reference</label>
                <p className="text-lg font-bold text-gray-900">{bookingData.bookingReference}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Confirmation Number</label>
                <p className="text-lg font-bold text-gray-900">{bookingData.confirmationNumber}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Status</label>
                <p className={`text-lg font-semibold ${getStatusColor(bookingData.status)} capitalize`}>
                  {bookingData.status}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Booking Date</label>
                <p className="text-lg font-medium text-gray-900">
                  {formatDate(bookingData.bookingDate)}
                </p>
              </div>
            </div>
          </div>

          {/* Flight Information */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Plane className="w-5 h-5 mr-2" />
              Flight Information
            </h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Airline & Flight</label>
                  <p className="text-lg font-bold text-gray-900">
                    {bookingData.flight.airline} {bookingData.flight.flightNumber}
                  </p>
                  <p className="text-sm text-gray-600">{bookingData.flight.aircraft}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Duration</label>
                  <p className="text-lg font-medium text-gray-900">{bookingData.flight.duration}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-500">Departure</label>
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-green-600" />
                    <span className="font-bold text-lg">{bookingData.flight.origin}</span>
                  </div>
                  <p className="text-lg font-medium">{bookingData.flight.departTime}</p>
                  <p className="text-sm text-gray-600">{formatDate(bookingData.flight.departDate)}</p>
                  <p className="text-xs text-gray-500">Terminal {bookingData.flight.terminal}</p>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-500">Arrival</label>
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-red-600" />
                    <span className="font-bold text-lg">{bookingData.flight.destination}</span>
                  </div>
                  <p className="text-lg font-medium">{bookingData.flight.arriveTime}</p>
                  <p className="text-sm text-gray-600">{formatDate(bookingData.flight.arriveDate)}</p>
                  {bookingData.flight.gate && (
                    <p className="text-xs text-gray-500">Gate {bookingData.flight.gate}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Passenger Information */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Passenger Information
            </h2>
            
            <div className="space-y-4">
              {bookingData.passengers.map((passenger, index) => (
                <div key={passenger.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">
                      {passenger.firstName} {passenger.lastName}
                    </p>
                    <p className="text-sm text-gray-600 capitalize">{passenger.type}</p>
                  </div>
                  <div className="text-right">
                    {passenger.seatNumber && (
                      <p className="font-medium text-gray-900">Seat {passenger.seatNumber}</p>
                    )}
                    <p className="text-sm text-gray-600">Passenger {index + 1}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Information */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <CreditCard className="w-5 h-5 mr-2" />
              Payment Summary
            </h2>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span>{formatPrice(bookingData.pricing.subtotal)}</span>
              </div>
              {bookingData.pricing.seatFees > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Seat Selection</span>
                  <span>{formatPrice(bookingData.pricing.seatFees)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Taxes & Fees</span>
                <span>{formatPrice(bookingData.pricing.taxes + bookingData.pricing.fees)}</span>
              </div>
              <div className="flex justify-between pt-3 border-t border-gray-200">
                <span className="text-lg font-semibold">Total Paid</span>
                <span className="text-lg font-bold text-green-600">{formatPrice(bookingData.pricing.total)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Paid with {bookingData.payment.method}</span>
                <span>****{bookingData.payment.lastFourDigits}</span>
              </div>
            </div>
          </div>

          {/* Important Information */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-amber-800">
                <p className="font-medium mb-2">Important Reminders:</p>
                <ul className="space-y-1">
                  <li>• Arrive at the airport at least 2 hours before domestic flights, 3 hours for international</li>
                  <li>• Check-in online 24 hours before departure</li>
                  <li>• Ensure your identification matches the name on your ticket exactly</li>
                  <li>• Check baggage allowances and restrictions on the airline's website</li>
                  <li>• Keep your booking reference handy for check-in and baggage drop</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar - QR Code and Actions */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Mobile Ticket QR Code */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center justify-center">
              <Smartphone className="w-5 h-5 mr-2" />
              Mobile Ticket
            </h3>
            
            <div className="qr-code mb-4">
              <img 
                src={generateQRCode(qrCodeData)}
                alt="Boarding pass QR code"
                className="w-48 h-48 mx-auto border border-gray-200 rounded"
              />
            </div>
            
            <p className="text-sm text-gray-600 mb-4">
              Scan this QR code at the airport for faster check-in and boarding
            </p>
            
            <button
              onClick={() => {
                // In a real app, this would save the QR code to device
                navigator.clipboard?.writeText(bookingData.bookingReference);
              }}
              className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
            >
              Copy Booking Reference
            </button>
          </div>

          {/* Contact Information */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">{bookingData.contact.email}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">{bookingData.contact.phone}</span>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">What's Next?</h3>
            
            <div className="space-y-3 text-sm">
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <p className="font-medium">Check-in opens 24 hours before departure</p>
                  <p className="text-gray-600">You'll receive a reminder email</p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <p className="font-medium">Add to calendar</p>
                  <p className="text-gray-600">Set reminders for your flight</p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <p className="font-medium">Track your flight status</p>
                  <p className="text-gray-600">Get updates on delays and gate changes</p>
                </div>
              </div>
            </div>
          </div>

          {/* Book Another Flight */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Need Another Flight?</h3>
            <button
              onClick={onNewSearch}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all"
            >
              Book New Flight
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}