'use client';

import React, { useState, useEffect } from 'react';
import { CreditCard, Lock, Shield, AlertCircle, Check, Loader2 } from 'lucide-react';
import { useCurrency } from '@/contexts/CurrencyContext';
import StripeProvider from '../payment/StripeProvider';
import StripePaymentForm from '../payment/StripePaymentForm';

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

interface PaymentFormProps {
  bookingDetails: {
    flightPrice: number;
    seatFees: number;
    taxes: number;
    totalAmount: number;
    passengers: number;
    flightInfo: {
      airline: string;
      flightNumber: string;
      origin: string;
      destination: string;
      departDate: string;
      departTime: string;
    };
  };
  onSubmit: (paymentInfo: PaymentInfo) => void;
  onBack: () => void;
  isProcessing?: boolean;
}

const countries = [
  'United States', 'Canada', 'United Kingdom', 'Germany', 'France', 'Italy', 'Spain',
  'Australia', 'Japan', 'China', 'India', 'Brazil', 'Mexico', 'Russia', 'South Korea',
  'Netherlands', 'Switzerland', 'Sweden', 'Norway', 'Denmark', 'Belgium', 'Austria'
];

export default function PaymentForm({ bookingDetails, onSubmit, onBack, isProcessing: externalIsProcessing }: PaymentFormProps) {
  const { formatPrice } = useCurrency();
  const [paymentIntent, setPaymentIntent] = useState<any>(null);
  const [isCreatingPaymentIntent, setIsCreatingPaymentIntent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isProcessing = externalIsProcessing || false;

  // Create payment intent when component mounts
  useEffect(() => {
    createPaymentIntent();
  }, []);

  const createPaymentIntent = async () => {
    setIsCreatingPaymentIntent(true);
    setError(null);
    
    try {
      const response = await fetch('/api/payments/create-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: Math.round(bookingDetails.totalAmount * 100), // Convert to cents
          currency: 'usd',
          description: `Flight booking: ${bookingDetails.flightInfo.flightNumber} from ${bookingDetails.flightInfo.origin} to ${bookingDetails.flightInfo.destination}`,
          bookingId: `flight_${bookingDetails.flightInfo.flightNumber}_${Date.now()}`,
          metadata: {
            flightNumber: bookingDetails.flightInfo.flightNumber,
            origin: bookingDetails.flightInfo.origin,
            destination: bookingDetails.flightInfo.destination,
            passengers: bookingDetails.passengers.toString(),
            departDate: bookingDetails.flightInfo.departDate,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create payment intent');
      }

      const data = await response.json();
      
      if (data.success && data.paymentIntent) {
        setPaymentIntent(data.paymentIntent);
      } else {
        throw new Error(data.error || 'Invalid response from payment service');
      }
    } catch (error: any) {
      console.error('Payment intent creation failed:', error);
      setError(`Payment setup failed: ${error.message}`);
    } finally {
      setIsCreatingPaymentIntent(false);
    }
  };

  const handleStripePaymentSuccess = (stripePaymentIntent: any) => {
    console.log('Stripe payment successful:', stripePaymentIntent);
    
    // Create mock payment info to match expected interface
    const mockPaymentInfo: PaymentInfo = {
      cardNumber: '****',
      expiryDate: '',
      cvv: '',
      cardholderName: '',
      billingAddress: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'United States'
      },
      saveCard: false,
      paymentMethod: 'credit'
    };
    
    // Call the original onSubmit with successful result
    onSubmit(mockPaymentInfo);
  };

  const handleStripePaymentError = (error: string) => {
    console.error('Stripe payment failed:', error);
    setError(error);
  };

  const handlePaymentCancel = () => {
    setPaymentIntent(null);
    onBack();
  };

  // Show loading state during payment intent creation
  if (isCreatingPaymentIntent) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mr-3" />
          <span className="text-lg text-gray-600">Setting up secure payment...</span>
        </div>
      </div>
    );
  }

  // Show error state if payment intent creation fails
  if (error && !paymentIntent) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <AlertCircle className="w-6 h-6 text-red-600 mr-2" />
            <h3 className="text-lg font-semibold text-red-800">Payment Setup Failed</h3>
          </div>
          <p className="text-red-700 mb-4">{error}</p>
          <div className="flex space-x-3">
            <button
              onClick={onBack}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Go Back
            </button>
            <button
              onClick={createPaymentIntent}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 active:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render Stripe payment form with order summary
  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Stripe Payment Form */}
        <div className="lg:col-span-2">
          {paymentIntent && (
            <StripeProvider clientSecret={paymentIntent.client_secret}>
              <StripePaymentForm
                clientSecret={paymentIntent.client_secret}
                amount={Math.round(bookingDetails.totalAmount * 100)}
                currency="usd"
                onSuccess={handleStripePaymentSuccess}
                onError={handleStripePaymentError}
                onCancel={handlePaymentCancel}
                bookingDetails={{
                  flightInfo: bookingDetails.flightInfo,
                  totalAmount: bookingDetails.totalAmount
                }}
              />
            </StripeProvider>
          )}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-200 rounded-xl p-6 sticky top-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Order Summary</h3>

            {/* Flight Info */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">{bookingDetails.flightInfo.airline}</span>
                <span className="text-sm text-gray-600">{bookingDetails.flightInfo.flightNumber}</span>
              </div>
              <div className="text-sm text-gray-600">
                <p>{bookingDetails.flightInfo.origin} → {bookingDetails.flightInfo.destination}</p>
                <p>{bookingDetails.flightInfo.departDate} at {bookingDetails.flightInfo.departTime}</p>
                <p>{bookingDetails.passengers} passenger{bookingDetails.passengers > 1 ? 's' : ''}</p>
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Flight tickets</span>
                <span>{formatPrice(bookingDetails.flightPrice)}</span>
              </div>
              {bookingDetails.seatFees > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Seat selection</span>
                  <span>{formatPrice(bookingDetails.seatFees)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Taxes & fees</span>
                <span>{formatPrice(bookingDetails.taxes)}</span>
              </div>
              <div className="pt-3 border-t border-gray-200">
                <div className="flex justify-between">
                  <span className="text-lg font-semibold">Total</span>
                  <span className="text-lg font-bold text-blue-600">{formatPrice(bookingDetails.totalAmount)}</span>
                </div>
              </div>
            </div>

            {/* Payment methods accepted */}
            <div className="pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center mb-2">Secure payments powered by</p>
              <div className="flex justify-center items-center space-x-2">
                <Shield className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-600">Stripe</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}