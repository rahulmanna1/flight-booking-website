// Booking Management Component
// Main page component that brings together all booking functionality

import React from 'react';
import { BookingList } from './BookingList';
import { BookingDetailsModal } from './BookingDetailsModal';
import BookingCancellationModal from './BookingCancellationModal';
import CheckInModal from './CheckInModal';
import { useBooking } from '../../contexts/BookingContext';

interface BookingManagementProps {
  className?: string;
}

export function BookingManagement({ className = '' }: BookingManagementProps) {
  const { state, hideBookingDetails, hideCancellationModal, hideCheckInModal } = useBooking();

  return (
    <div className={`container mx-auto px-4 py-8 ${className}`}>
      {/* Main Booking List */}
      <BookingList />

      {/* Booking Details Modal */}
      <BookingDetailsModal
        isOpen={state.ui.showBookingDetails}
        onClose={hideBookingDetails}
        bookingId={state.ui.selectedBookingId}
      />

      {/* Booking Cancellation Modal */}
      <BookingCancellationModal
        isOpen={state.ui.showCancellationModal}
        onClose={hideCancellationModal}
        bookingId={state.ui.selectedBookingId}
      />

      {/* Check-in Modal */}
      <CheckInModal
        isOpen={state.ui.showCheckInModal}
        onClose={hideCheckInModal}
        bookingId={state.ui.selectedBookingId}
      />
    </div>
  );
}

export default BookingManagement;
