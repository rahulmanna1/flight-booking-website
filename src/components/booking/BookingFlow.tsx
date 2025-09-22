'use client';

import React, { useState, useCallback } from 'react';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import SeatSelection from './SeatSelection';
import PassengerDetails from './PassengerDetails';
import PaymentForm from './PaymentForm';
import BookingConfirmation from './BookingConfirmation';
import { useAuth } from '@/contexts/AuthContext';

type BookingStep = 'seats' | 'passengers' | 'payment' | 'confirmation';

interface Flight {
  id: string;
  airline: string;
  flightNumber: string;
  origin: string;
  destination: string;
  departTime: string;
  arriveTime: string;
  departDate: string;
  arriveDate: string;
  duration: string;
  price: number;
  aircraft: string;
  travelClass?: string;
  stops?: number;
}

interface BookingFlowProps {
  flight: Flight;
  passengers: number;
  children: number;
  infants: number;
  onClose: () => void;
  onComplete?: (bookingReference: string) => void;
}

interface Seat {
  id: string;
  row: number;
  letter: string;
  type: 'economy' | 'premium-economy' | 'business' | 'first';
  status: 'available' | 'occupied' | 'selected' | 'blocked';
  price: number;
}

interface Passenger {
  id: string;
  type: 'adult' | 'child' | 'infant';
  firstName: string;
  lastName: string;
  gender: 'male' | 'female' | 'other';
  dateOfBirth: string;
  nationality: string;
  passportNumber: string;
  passportExpiry: string;
  issuingCountry: string;
  email?: string;
  phone?: string;
  specialRequests?: string;
  frequentFlyerNumber?: string;
  knownTravelerNumber?: string;
  redressNumber?: string;
}

interface ContactInfo {
  email: string;
  phone: string;
  alternatePhone?: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelation: string;
}

interface PaymentInfo {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardholderName: string;
  billingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  saveCard: boolean;
  paymentMethod: 'credit' | 'debit' | 'paypal' | 'applepay' | 'googlepay';
}

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

// Generate booking reference
const generateBookingReference = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Calculate taxes and fees
const calculatePricing = (flight: Flight, passengers: number, seatFees: number) => {
  const subtotal = flight.price * passengers;
  const taxRate = 0.12; // 12% tax rate
  const baseFee = 25; // Base booking fee
  const taxes = Math.round(subtotal * taxRate);
  const fees = baseFee * passengers;
  
  return {
    subtotal,
    taxes,
    fees,
    seatFees,
    total: subtotal + taxes + fees + seatFees
  };
};

export default function BookingFlow({ flight, passengers, children, infants, onClose, onComplete }: BookingFlowProps) {
  const { user, isAuthenticated } = useAuth();
  const [currentStep, setCurrentStep] = useState<BookingStep>('seats');
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
  const [passengerData, setPassengerData] = useState<Passenger[]>([]);
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null);
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);
  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const totalPassengers = passengers + children + infants;

  const steps = [
    { id: 'seats', title: 'Select Seats', completed: currentStep !== 'seats' },
    { id: 'passengers', title: 'Passenger Details', completed: ['payment', 'confirmation'].includes(currentStep) },
    { id: 'payment', title: 'Payment', completed: currentStep === 'confirmation' },
    { id: 'confirmation', title: 'Confirmation', completed: false }
  ];

  const handleSeatSelection = useCallback((seats: Seat[]) => {
    setSelectedSeats(seats);
    setCurrentStep('passengers');
  }, []);

  const handlePassengerDetails = useCallback((passengers: Passenger[], contact: ContactInfo) => {
    setPassengerData(passengers);
    setContactInfo(contact);
    setCurrentStep('payment');
  }, []);

  const handlePayment = useCallback(async (payment: PaymentInfo) => {
    if (!isAuthenticated || !user) {
      console.error('User must be authenticated to create booking');
      return;
    }

    setPaymentInfo(payment);
    setIsProcessingPayment(true);

    try {
      // Calculate final pricing
      const seatFees = selectedSeats.reduce((total, seat) => total + seat.price, 0);
      const pricing = calculatePricing(flight, totalPassengers, seatFees);

      // Prepare booking request data
      const bookingRequest = {
        flightData: {
          id: flight.id,
          airline: flight.airline,
          flightNumber: flight.flightNumber,
          origin: flight.origin,
          destination: flight.destination,
          departDate: flight.departDate || new Date().toISOString().split('T')[0],
          departTime: flight.departTime,
          arriveDate: flight.arriveDate || flight.departDate || new Date().toISOString().split('T')[0],
          arriveTime: flight.arriveTime,
          duration: flight.duration,
          aircraft: flight.aircraft || 'Unknown Aircraft',
          terminal: 'A', // Default terminal
          gate: Math.random() > 0.5 ? `A${Math.floor(Math.random() * 20) + 1}` : undefined
        },
        passengers: passengerData.map((passenger, index) => ({
          id: passenger.id,
          firstName: passenger.firstName,
          lastName: passenger.lastName,
          type: passenger.type,
          gender: passenger.gender,
          dateOfBirth: passenger.dateOfBirth,
          nationality: passenger.nationality,
          passportNumber: passenger.passportNumber,
          passportExpiry: passenger.passportExpiry,
          issuingCountry: passenger.issuingCountry,
          email: passenger.email,
          phone: passenger.phone,
          specialRequests: passenger.specialRequests,
          frequentFlyerNumber: passenger.frequentFlyerNumber,
          knownTravelerNumber: passenger.knownTravelerNumber,
          redressNumber: passenger.redressNumber,
          seatNumber: selectedSeats[index]?.id
        })),
        contactInfo,
        pricing,
        paymentInfo: {
          method: payment.paymentMethod === 'credit' ? 'Credit Card' : 'Debit Card',
          lastFourDigits: payment.cardNumber.slice(-4).replace(/\D/g, ''),
          amount: pricing.total,
          cardholderName: payment.cardholderName,
          billingAddress: payment.billingAddress,
          transactionId: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          paymentStatus: 'completed' // Mock successful payment for now
        }
      };

      // Get auth token
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      // Create booking via API
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(bookingRequest)
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to create booking');
      }

      const apiBooking = result.data;

      // Transform API response to BookingData format
      const newBookingData: BookingData = {
        bookingReference: apiBooking.bookingReference,
        confirmationNumber: apiBooking.confirmationNumber,
        status: apiBooking.status.toLowerCase(),
        bookingDate: apiBooking.bookingDate,
        flight: apiBooking.flight,
        passengers: apiBooking.passengers,
        pricing: apiBooking.pricing,
        contact: apiBooking.contact,
        payment: apiBooking.payment
      };

      setBookingData(newBookingData);
      setCurrentStep('confirmation');

      console.log('✅ Booking created successfully:', apiBooking.bookingReference);

      // Notify parent component
      if (onComplete) {
        onComplete(apiBooking.bookingReference);
      }

    } catch (error) {
      console.error('Booking creation failed:', error);
      // Handle error - you might want to show an error message to user
      alert(`Booking failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsProcessingPayment(false);
    }
  }, [flight, totalPassengers, selectedSeats, passengerData, contactInfo, onComplete, isAuthenticated, user]);

  const handleNewSearch = useCallback(() => {
    onClose();
  }, [onClose]);

  const goBackToStep = (step: BookingStep) => {
    setCurrentStep(step);
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center space-x-4 mb-8">
      {steps.map((step, index) => (
        <React.Fragment key={step.id}>
          <div className="flex items-center">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
              step.id === currentStep 
                ? 'bg-blue-600 text-white' 
                : step.completed
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-300 text-gray-600'
            }`}>
              {step.completed ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <span className="text-sm font-medium">{index + 1}</span>
              )}
            </div>
            <span className={`ml-2 text-sm font-medium ${
              step.id === currentStep ? 'text-blue-600' : 
              step.completed ? 'text-green-600' : 'text-gray-500'
            }`}>
              {step.title}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div className={`w-8 h-0.5 ${
              steps[index + 1].completed ? 'bg-green-600' : 'bg-gray-300'
            }`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'seats':
        return (
          <SeatSelection
            flight={flight}
            passengers={totalPassengers}
            onSeatSelect={handleSeatSelection}
            onClose={onClose}
          />
        );

      case 'passengers':
        return (
          <PassengerDetails
            passengers={passengers}
            children={children}
            infants={infants}
            onSubmit={handlePassengerDetails}
            onBack={() => goBackToStep('seats')}
          />
        );

      case 'payment':
        const seatFees = selectedSeats.reduce((total, seat) => total + seat.price, 0);
        const pricing = calculatePricing(flight, totalPassengers, seatFees);
        
        return (
          <PaymentForm
            bookingDetails={{
              flightPrice: flight.price * totalPassengers,
              seatFees,
              taxes: pricing.taxes,
              totalAmount: pricing.total,
              passengers: totalPassengers,
              flightInfo: {
                airline: flight.airline,
                flightNumber: flight.flightNumber,
                origin: flight.origin,
                destination: flight.destination,
                departDate: flight.departDate,
                departTime: flight.departTime
              }
            }}
            onSubmit={handlePayment}
            onBack={() => goBackToStep('passengers')}
            isProcessing={isProcessingPayment}
          />
        );

      case 'confirmation':
        return bookingData ? (
          <BookingConfirmation
            bookingData={bookingData}
            onNewSearch={handleNewSearch}
          />
        ) : null;

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Complete Your Booking</h1>
                <p className="text-sm text-gray-600">
                  {flight.airline} {flight.flightNumber} • {flight.origin} → {flight.destination}
                </p>
              </div>
            </div>
            
            {/* Step indicator for non-modal steps */}
            {currentStep !== 'seats' && renderStepIndicator()}
          </div>
        </div>
      </div>

      {/* Step Content */}
      <div className="py-6">
        {renderCurrentStep()}
      </div>
    </div>
  );
}