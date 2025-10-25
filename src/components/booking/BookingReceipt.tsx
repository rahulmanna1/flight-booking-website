// Booking Receipt Component
// Standalone component for generating email receipts and PDF tickets

import React from 'react';
import { Plane, Users, CreditCard, Calendar, MapPin, Clock } from 'lucide-react';
import { useCurrency } from '../../contexts/CurrencyContext';
import type { FlightBooking as Booking } from '../../types/booking';

interface BookingReceiptProps {
  booking: Booking;
  includeHeader?: boolean;
  format?: 'email' | 'pdf' | 'print';
  className?: string;
}

export function BookingReceipt({ 
  booking, 
  includeHeader = true,
  format = 'email',
  className = '' 
}: BookingReceiptProps) {
  const { formatPrice, currency } = useCurrency();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStyles = () => {
    if (format === 'email') {
      return {
        container: 'max-w-2xl mx-auto bg-white',
        section: 'margin: 20px 0; padding: 16px; border: 1px solid #e5e7eb; border-radius: 8px;',
        header: 'text-align: center; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 2px solid #3b82f6;',
        title: 'font-size: 24px; font-weight: bold; color: #1f2937; margin-bottom: 8px;',
        subtitle: 'font-size: 16px; color: #6b7280;'
      };
    }
    return {
      container: `max-w-4xl mx-auto bg-white ${className}`,
      section: 'mb-6 p-4 border border-gray-200 rounded-lg',
      header: 'text-center mb-6 pb-4 border-b-2 border-blue-600',
      title: 'text-2xl font-bold text-gray-900 mb-2',
      subtitle: 'text-gray-600'
    };
  };

  const styles = getStyles();

  if (format === 'email') {
    // Return HTML string for email templates
    return (
      <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '600px', margin: '0 auto', backgroundColor: '#ffffff' }}>
        {includeHeader && (
          <div style={{ textAlign: 'center', marginBottom: '24px', paddingBottom: '16px', borderBottom: '2px solid #3b82f6' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937', marginBottom: '8px' }}>
              Booking Confirmation
            </h1>
            <p style={{ fontSize: '16px', color: '#6b7280', margin: 0 }}>
              Thank you for choosing our service
            </p>
          </div>
        )}

        {/* Booking Reference */}
        <div style={{ margin: '20px 0', padding: '16px', backgroundColor: '#eff6ff', borderRadius: '8px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1f2937', marginBottom: '12px' }}>
            Booking Details
          </h2>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tr>
              <td style={{ padding: '8px 0', fontWeight: 'bold', color: '#374151' }}>Booking Reference:</td>
              <td style={{ padding: '8px 0', color: '#1f2937', fontSize: '18px', fontWeight: 'bold' }}>{booking.bookingReference}</td>
            </tr>
            <tr>
              <td style={{ padding: '8px 0', fontWeight: 'bold', color: '#374151' }}>Confirmation:</td>
              <td style={{ padding: '8px 0', color: '#1f2937' }}>{booking.confirmationNumber || booking.bookingReference}</td>
            </tr>
            <tr>
              <td style={{ padding: '8px 0', fontWeight: 'bold', color: '#374151' }}>Status:</td>
              <td style={{ padding: '8px 0', color: '#059669', textTransform: 'capitalize', fontWeight: 'bold' }}>{booking.status}</td>
            </tr>
          </table>
        </div>

        {/* Flight Information */}
        <div style={{ margin: '20px 0', padding: '16px', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1f2937', marginBottom: '12px' }}>
            ✈️ Flight Information
          </h2>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tr>
              <td style={{ padding: '8px 0', fontWeight: 'bold', color: '#374151' }}>Flight:</td>
              <td style={{ padding: '8px 0', color: '#1f2937', fontWeight: 'bold' }}>
                {booking.flightDetails?.airline || 'N/A'} {booking.flightDetails?.flightNumber || 'N/A'}
              </td>
            </tr>
            <tr>
              <td style={{ padding: '8px 0', fontWeight: 'bold', color: '#374151' }}>Route:</td>
              <td style={{ padding: '8px 0', color: '#1f2937' }}>
                {booking.flightDetails?.origin || 'N/A'} → {booking.flightDetails?.destination || 'N/A'}
              </td>
            </tr>
            <tr>
              <td style={{ padding: '8px 0', fontWeight: 'bold', color: '#374151' }}>Date:</td>
              <td style={{ padding: '8px 0', color: '#1f2937' }}>{booking.flightDetails?.departureDate ? formatDate(booking.flightDetails.departureDate) : 'N/A'}</td>
            </tr>
            <tr>
              <td style={{ padding: '8px 0', fontWeight: 'bold', color: '#374151' }}>Departure:</td>
              <td style={{ padding: '8px 0', color: '#1f2937' }}>{booking.flightDetails?.departureTime ? formatTime(booking.flightDetails.departureTime) : 'N/A'}</td>
            </tr>
            <tr>
              <td style={{ padding: '8px 0', fontWeight: 'bold', color: '#374151' }}>Arrival:</td>
              <td style={{ padding: '8px 0', color: '#1f2937' }}>{booking.flightDetails?.arrivalTime ? formatTime(booking.flightDetails.arrivalTime) : 'N/A'}</td>
            </tr>
            <tr>
              <td style={{ padding: '8px 0', fontWeight: 'bold', color: '#374151' }}>Duration:</td>
              <td style={{ padding: '8px 0', color: '#1f2937' }}>{booking.flightDetails?.duration || 'N/A'}</td>
            </tr>
          </table>
        </div>

        {/* Passengers */}
        <div style={{ margin: '20px 0', padding: '16px', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1f2937', marginBottom: '12px' }}>
            👥 Passengers
          </h2>
          {booking.passengers.map((passenger, index) => (
            <div key={index} style={{ padding: '8px 0', borderBottom: index < booking.passengers.length - 1 ? '1px solid #e5e7eb' : 'none' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 'bold', color: '#1f2937' }}>
                    {passenger.firstName} {passenger.lastName}
                  </div>
                  <div style={{ fontSize: '14px', color: '#6b7280', textTransform: 'capitalize' }}>
                    {passenger.type}
                  </div>
                </div>
                {passenger.seatNumber && (
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 'bold', color: '#1f2937' }}>
                      Seat {passenger.seatNumber}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Pricing */}
        <div style={{ margin: '20px 0', padding: '16px', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1f2937', marginBottom: '12px' }}>
            💳 Payment Summary
          </h2>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tr>
              <td style={{ padding: '4px 0', color: '#6b7280' }}>Base Fare:</td>
              <td style={{ padding: '4px 0', textAlign: 'right', color: '#1f2937' }}>{formatPrice(booking.pricing.basePrice || booking.pricing.baseFare || 0)}</td>
            </tr>
            {(booking.pricing.servicesFee || 0) > 0 && (
              <tr>
                <td style={{ padding: '4px 0', color: '#6b7280' }}>Services:</td>
                <td style={{ padding: '4px 0', textAlign: 'right', color: '#1f2937' }}>{formatPrice(booking.pricing.servicesFee || 0)}</td>
              </tr>
            )}
            <tr>
              <td style={{ padding: '4px 0', color: '#6b7280' }}>Taxes & Fees:</td>
              <td style={{ padding: '4px 0', textAlign: 'right', color: '#1f2937' }}>{formatPrice(booking.pricing.taxes)}</td>
            </tr>
            <tr style={{ borderTop: '2px solid #e5e7eb' }}>
              <td style={{ padding: '12px 0 4px 0', fontSize: '18px', fontWeight: 'bold', color: '#1f2937' }}>Total:</td>
              <td style={{ padding: '12px 0 4px 0', textAlign: 'right', fontSize: '18px', fontWeight: 'bold', color: '#059669' }}>
                {formatPrice(booking.pricing.total)}
              </td>
            </tr>
          </table>
        </div>

        {/* Contact Information */}
        <div style={{ margin: '20px 0', padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1f2937', marginBottom: '12px' }}>
            Contact Information
          </h2>
          <p style={{ margin: '4px 0', color: '#374151' }}>
            <strong>Email:</strong> {booking.contactInfo?.email || booking.bookedBy?.email || 'N/A'}
          </p>
          <p style={{ margin: '4px 0', color: '#374151' }}>
            <strong>Phone:</strong> {booking.contactInfo?.phone || booking.bookedBy?.phone || 'N/A'}
          </p>
        </div>

        {/* Important Information */}
        <div style={{ margin: '20px 0', padding: '16px', backgroundColor: '#fef3c7', border: '1px solid #fbbf24', borderRadius: '8px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 'bold', color: '#92400e', marginBottom: '8px' }}>
            ⚠️ Important Information
          </h2>
          <ul style={{ margin: 0, paddingLeft: '20px', color: '#92400e', fontSize: '14px', lineHeight: '1.5' }}>
            <li>Please arrive at the airport at least 2 hours before domestic flights and 3 hours before international flights</li>
            <li>Keep your booking reference handy for check-in and security</li>
            <li>Check airline baggage policies and restrictions</li>
            <li>Ensure all passenger documents are valid for travel</li>
            <li>Online check-in opens 24 hours before departure</li>
          </ul>
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', margin: '32px 0', padding: '16px 0', borderTop: '1px solid #e5e7eb', fontSize: '14px', color: '#6b7280' }}>
          <p>Thank you for choosing our flight booking service!</p>
          <p>For any questions or changes, please contact our support team.</p>
        </div>
      </div>
    );
  }

  // Return JSX for React components
  return (
    <div className={styles.container}>
      {includeHeader && (
        <div className={styles.header}>
          <h1 className={styles.title}>Flight Booking Receipt</h1>
          <p className={styles.subtitle}>Booking Confirmation</p>
        </div>
      )}

      {/* Booking Reference */}
      <div className={styles.section}>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Booking Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span className="text-sm font-medium text-gray-500">Booking Reference</span>
            <p className="text-xl font-bold text-gray-900">{booking.bookingReference}</p>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-500">Confirmation Number</span>
            <p className="text-lg font-semibold text-gray-900">{booking.confirmationNumber || booking.bookingReference}</p>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-500">Status</span>
            <p className="text-lg font-semibold text-green-600 capitalize">{booking.status}</p>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-500">Booking Date</span>
            <p className="text-lg font-medium text-gray-900">{booking.bookingDate ? formatDate(booking.bookingDate) : formatDate(booking.createdAt)}</p>
          </div>
        </div>
      </div>

      {/* Flight Information */}
      <div className={styles.section}>
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Plane className="w-5 h-5 mr-2 text-blue-600" />
          Flight Information
        </h2>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-sm font-medium text-gray-500">Flight</span>
              <p className="text-lg font-bold text-gray-900">
                {booking.flightDetails?.airline || 'N/A'} {booking.flightDetails?.flightNumber || 'N/A'}
              </p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">Duration</span>
              <p className="text-lg font-medium text-gray-900">{booking.flightDetails?.duration || 'N/A'}</p>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="text-center">
              <div className="flex items-center space-x-1 justify-center">
                <MapPin className="w-4 h-4 text-green-600" />
                <span className="text-2xl font-bold text-gray-900">{booking.flightDetails?.origin || 'N/A'}</span>
              </div>
              <p className="text-sm text-gray-600">Departure</p>
              <p className="font-semibold">{booking.flightDetails?.departureTime ? formatTime(booking.flightDetails.departureTime) : 'N/A'}</p>
              <p className="text-xs text-gray-500">{booking.flightDetails?.departureDate ? formatDate(booking.flightDetails.departureDate) : 'N/A'}</p>
            </div>
            
            <div className="flex items-center">
              <div className="w-16 h-px bg-gray-300"></div>
              <Plane className="w-5 h-5 text-gray-600 mx-2" />
              <div className="w-16 h-px bg-gray-300"></div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center space-x-1 justify-center">
                <MapPin className="w-4 h-4 text-red-600" />
                <span className="text-2xl font-bold text-gray-900">{booking.flightDetails?.destination || 'N/A'}</span>
              </div>
              <p className="text-sm text-gray-600">Arrival</p>
              <p className="font-semibold">{booking.flightDetails?.arrivalTime ? formatTime(booking.flightDetails.arrivalTime) : 'N/A'}</p>
              <p className="text-xs text-gray-500">{booking.flightDetails?.arrivalDate ? formatDate(booking.flightDetails.arrivalDate) : 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Passengers */}
      <div className={styles.section}>
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Users className="w-5 h-5 mr-2 text-blue-600" />
          Passengers
        </h2>
        <div className="space-y-3">
          {booking.passengers.map((passenger, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-semibold text-gray-900">
                  {passenger.firstName} {passenger.lastName}
                </p>
                <p className="text-sm text-gray-600 capitalize">{passenger.type}</p>
              </div>
              {passenger.seatNumber && (
                <div className="text-right">
                  <p className="font-semibold text-gray-900">Seat {passenger.seatNumber}</p>
                  <p className="text-sm text-gray-600">Assigned</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Payment Summary */}
      <div className={styles.section}>
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <CreditCard className="w-5 h-5 mr-2 text-blue-600" />
          Payment Summary
        </h2>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Base Fare</span>
            <span className="text-gray-900">{formatPrice(booking.pricing.basePrice || booking.pricing.baseFare || 0)}</span>
          </div>
          {(booking.pricing.servicesFee || 0) > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">Services</span>
              <span className="text-gray-900">{formatPrice(booking.pricing.servicesFee || 0)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-gray-600">Taxes & Fees</span>
            <span className="text-gray-900">{formatPrice(booking.pricing.taxes)}</span>
          </div>
          <div className="flex justify-between pt-2 border-t border-gray-200">
            <span className="text-lg font-semibold text-gray-900">Total</span>
            <span className="text-lg font-bold text-green-600">{formatPrice(booking.pricing.total)}</span>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className={styles.section}>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
        <div className="space-y-2">
          <p className="text-gray-700">
            <strong>Email:</strong> {booking.contactInfo?.email || booking.bookedBy?.email || 'N/A'}
          </p>
          <p className="text-gray-700">
            <strong>Phone:</strong> {booking.contactInfo?.phone || booking.bookedBy?.phone || 'N/A'}
          </p>
        </div>
      </div>

      {format === 'print' && (
        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg print:hidden">
          <h3 className="font-semibold text-yellow-800 mb-2">Important Travel Information</h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• Please arrive at the airport at least 2 hours before domestic flights and 3 hours before international flights</li>
            <li>• Keep your booking reference handy for check-in and security</li>
            <li>• Check airline baggage policies and restrictions</li>
            <li>• Ensure all passenger documents are valid for travel</li>
            <li>• Online check-in opens 24 hours before departure</li>
          </ul>
        </div>
      )}
    </div>
  );
}

export default BookingReceipt;