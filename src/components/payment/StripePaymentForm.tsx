'use client';

import React, { useState, useEffect } from 'react';
import {
  PaymentElement,
  useStripe,
  useElements,
  AddressElement,
} from '@stripe/react-stripe-js';
import { 
  CreditCard, 
  Lock, 
  Shield, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  ArrowLeft 
} from 'lucide-react';

interface StripePaymentFormProps {
  clientSecret: string;
  amount: number;
  currency: string;
  onSuccess: (paymentIntent: any) => void;
  onError: (error: string) => void;
  onCancel: () => void;
  bookingDetails: {
    flightInfo: {
      flightNumber: string;
      origin: string;
      destination: string;
    };
    totalAmount: number;
  };
}

export default function StripePaymentForm({
  clientSecret,
  amount,
  currency,
  onSuccess,
  onError,
  onCancel,
  bookingDetails
}: StripePaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentSucceeded, setPaymentSucceeded] = useState(false);
  const [isElementsReady, setIsElementsReady] = useState(false);

  useEffect(() => {
    if (!stripe || !elements) return;
    
    // Check if payment has already succeeded
    const clientSecretFromUrl = new URLSearchParams(window.location.search).get(
      'payment_intent_client_secret'
    );
    
    if (clientSecretFromUrl) {
      stripe.retrievePaymentIntent(clientSecretFromUrl).then(({ paymentIntent }) => {
        if (paymentIntent) {
          switch (paymentIntent.status) {
            case 'succeeded':
              setPaymentSucceeded(true);
              onSuccess(paymentIntent);
              break;
            case 'processing':
              setIsProcessing(true);
              break;
            case 'requires_payment_method':
              setPaymentError('Payment failed. Please try another payment method.');
              break;
            default:
              setPaymentError('Something went wrong with your payment.');
              break;
          }
        }
      });
    }
    
    setIsElementsReady(true);
  }, [stripe, elements, onSuccess]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!stripe || !elements || isProcessing) {
      return;
    }

    setIsProcessing(true);
    setPaymentError(null);

    try {
      // Confirm the payment
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: 'if_required',
        confirmParams: {
          return_url: `${window.location.origin}/booking-confirmation`,
        },
      });

      if (error) {
        console.error('Payment confirmation error:', error);
        setPaymentError(error.message || 'Payment failed. Please try again.');
        onError(error.message || 'Payment failed');
      } else if (paymentIntent) {
        console.log('Payment succeeded:', paymentIntent);
        setPaymentSucceeded(true);
        onSuccess(paymentIntent);
      }
    } catch (err: any) {
      console.error('Payment processing error:', err);
      setPaymentError('An unexpected error occurred. Please try again.');
      onError('An unexpected error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  if (paymentSucceeded) {
    return (
      <div className="max-w-md mx-auto">
        <div className="text-center p-8">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Payment Successful!</h3>
          <p className="text-gray-600">
            Your payment of {formatAmount(amount, currency)} has been processed successfully.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Complete Your Payment</h2>
          <div className="flex items-center space-x-2 text-green-600">
            <Shield className="w-5 h-5" />
            <span className="text-sm font-medium">Secured by Stripe</span>
          </div>
        </div>
        
        {/* Booking Summary */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">
                {bookingDetails.flightInfo.origin} → {bookingDetails.flightInfo.destination}
              </p>
              <p className="text-sm text-gray-600">
                Flight {bookingDetails.flightInfo.flightNumber}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-blue-600">
                {formatAmount(amount, currency)}
              </p>
              <p className="text-xs text-gray-500">Total Amount</p>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          {/* Payment Methods */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <CreditCard className="w-5 h-5 mr-2" />
              Payment Information
            </h3>
            
            {isElementsReady ? (
              <div className="space-y-4">
                <PaymentElement 
                  options={{
                    layout: 'tabs',
                    paymentMethodOrder: ['card', 'apple_pay', 'google_pay'],
                  }}
                />
              </div>
            ) : (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                <span className="ml-2 text-gray-600">Loading payment form...</span>
              </div>
            )}
          </div>

          {/* Billing Address */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Billing Address
            </h3>
            
            {isElementsReady && (
              <AddressElement 
                options={{
                  mode: 'billing',
                  allowedCountries: ['US', 'CA', 'GB', 'AU', 'DE', 'FR', 'IT', 'ES', 'NL', 'SE', 'NO', 'DK'],
                }}
              />
            )}
          </div>
        </div>

        {/* Error Message */}
        {paymentError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0" />
              <p className="text-red-800">{paymentError}</p>
            </div>
          </div>
        )}

        {/* Security Notice */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <Lock className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-gray-700">
              <p className="font-medium mb-1">Your payment is secure</p>
              <p className="text-xs">
                Your payment information is encrypted and processed securely by Stripe. 
                We never store your card details on our servers.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isProcessing}
            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
          
          <button
            type="submit"
            disabled={!stripe || !elements || isProcessing || !isElementsReady}
            className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center space-x-2"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing Payment...</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>Pay {formatAmount(amount, currency)}</span>
              </>
            )}
          </button>
        </div>

        {/* Accepted Payment Methods */}
        <div className="text-center pt-4">
          <p className="text-xs text-gray-500 mb-2">We accept</p>
          <div className="flex justify-center space-x-2 opacity-60">
            <div className="w-10 h-6 bg-blue-600 rounded text-white text-xs flex items-center justify-center font-bold">
              VISA
            </div>
            <div className="w-10 h-6 bg-red-600 rounded text-white text-xs flex items-center justify-center font-bold">
              MC
            </div>
            <div className="w-10 h-6 bg-blue-400 rounded text-white text-xs flex items-center justify-center font-bold">
              AMEX
            </div>
            <div className="w-10 h-6 bg-orange-600 rounded text-white text-xs flex items-center justify-center font-bold">
              DISC
            </div>
            <div className="w-10 h-6 bg-gray-800 rounded text-white text-xs flex items-center justify-center font-bold">
              🍎
            </div>
            <div className="w-10 h-6 bg-green-600 rounded text-white text-xs flex items-center justify-center font-bold">
              G
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
