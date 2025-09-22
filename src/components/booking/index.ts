// Booking Flow Components
export { default as BookingFlow } from './BookingFlow';
export { default as SeatSelection } from './SeatSelection';
export { default as PassengerDetails } from './PassengerDetails';
export { default as PaymentForm } from './PaymentForm';
export { default as BookingConfirmation } from './BookingConfirmation';
export { default as BookingManagement } from './BookingManagement';

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