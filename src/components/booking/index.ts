// Booking Flow Components
export { default as BookingFlow } from './BookingFlow';
export { default as SeatSelection } from './SeatSelection';
export { default as PassengerDetails } from './PassengerDetails';
export { default as PaymentForm } from './PaymentForm';

// Main booking management components
export { default as BookingManagement } from './BookingManagement';
export { BookingList } from './BookingList';
export { BookingCard } from './BookingCard';
export { BookingDetailsModal } from './BookingDetailsModal';

// Booking process components
export { default as BookingConfirmation } from './BookingConfirmation';
export { BookingReceipt } from './BookingReceipt';

// Booking actions and modals
export { default as BookingCancellationModal } from './BookingCancellationModal';
export { default as CheckInModal } from './CheckInModal';

// Search and filtering
export { BookingSearchPanel } from './BookingSearchPanel';
export type { BookingSearchFilters } from './BookingSearchPanel';

// Enhanced Flight Card with integrated booking
export { default as EnhancedFlightCard } from '../cards/EnhancedFlightCard';

// Types (you might want to create a separate types file later)
export interface BookingFlowData {
  flight: {
    id: string;
    airline: string;
    flightNumber: string;
    origin: string;
    destination: string;
    departTime: string;
    arriveTime: string;
    departDate: string;
    arriveDate?: string;
    duration: string;
    price: number;
    aircraft: string;
    travelClass?: string;
    stops?: number;
  };
  searchParams: {
    passengers: number;
    children: number;
    infants: number;
    departDate: string;
    returnDate?: string;
  };
}