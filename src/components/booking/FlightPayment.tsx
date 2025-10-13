'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  CreditCard, 
  Lock, 
  Plane, 
  Calendar,
  Clock,
  Users,
  Shield,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import StripePaymentForm from '../payment/StripePaymentForm';

interface FlightDetails {
  id: string;
  airline: string;
  flightNumber: string;
  from: {
    code: string;
    name: string;
    city: string;
  };
  to: {
    code: string;
    name: string;
    city: string;
  };
  departure: {
    date: string;
    time: string;
  };
  arrival: {
    date: string;
    time: string;
  };
  duration: string;
  passengers: number;
  class: string;
  price: {
    base: number;
    taxes: number;
    fees: number;
    total: number;
    currency: string;
  };
}

interface FlightPaymentProps {
  flightDetails: FlightDetails;
  onPaymentSuccess: (paymentResult: any) => void;
  onPaymentError: (error: string) => void;
}

export function FlightPayment({ 
  flightDetails, 
  onPaymentSuccess, 
  onPaymentError 
}: FlightPaymentProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'details' | 'payment' | 'confirmation'>('details');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [paymentIntent, setPaymentIntent] = useState<any>(null);
  const [isCreatingPaymentIntent, setIsCreatingPaymentIntent] = useState(false);

  // Passenger details
  const [passengerDetails, setPassengerDetails] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
  });

  // Note: Payment details are now handled by Stripe Elements
  // Billing address is collected within the Stripe payment form

  // Create payment intent when moving to payment step
  const createPaymentIntent = async () => {
    setIsCreatingPaymentIntent(true);
    
    try {
      const response = await fetch('/api/payments/create-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: Math.round(flightDetails.price.total * 100), // Convert to cents
          currency: flightDetails.price.currency.toLowerCase(),
          description: `Flight booking: ${flightDetails.flightNumber} from ${flightDetails.from.code} to ${flightDetails.to.code}`,
          bookingId: `flight_${flightDetails.id}_${Date.now()}`,
          metadata: {
            flightId: flightDetails.id,
            flightNumber: flightDetails.flightNumber,
            passengerName: `${passengerDetails.firstName} ${passengerDetails.lastName}`,
            route: `${flightDetails.from.code}-${flightDetails.to.code}`,
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
        return true;
      } else {
        throw new Error(data.error || 'Invalid response from payment service');
      }
    } catch (error: any) {
      console.error('Payment intent creation failed:', error);
      onPaymentError(`Payment setup failed: ${error.message}`);
      return false;
    } finally {
      setIsCreatingPaymentIntent(false);
    }
  };

  const handlePassengerDetailsSubmit = async () => {
    const newErrors: Record<string, string> = {};
    
    if (!passengerDetails.firstName) newErrors.firstName = 'First name is required';
    if (!passengerDetails.lastName) newErrors.lastName = 'Last name is required';
    if (!passengerDetails.email) newErrors.email = 'Email is required';
    if (!passengerDetails.phone) newErrors.phone = 'Phone is required';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    
    // Create payment intent before proceeding to payment step
    const success = await createPaymentIntent();
    if (success) {
      setPaymentStep('payment');
    }
  };

  // Handle successful Stripe payment
  const handleStripePaymentSuccess = (paymentIntent: any) => {
    console.log('Stripe payment successful:', paymentIntent);
    
    const paymentResult = {
      id: paymentIntent.id,
      status: paymentIntent.status,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      bookingReference: `FL${Date.now()}`,
      confirmationNumber: `CNF${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
      paymentIntent,
    };
    
    setPaymentStep('confirmation');
    onPaymentSuccess(paymentResult);
  };

  // Handle Stripe payment errors
  const handleStripePaymentError = (error: string) => {
    console.error('Stripe payment failed:', error);
    onPaymentError(error);
  };

  // Handle payment cancellation
  const handlePaymentCancel = () => {
    setPaymentIntent(null);
    setPaymentStep('details');
  };

  const formatPrice = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Flight Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plane className="h-5 w-5" />
            Flight Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="font-semibold text-lg">{flightDetails.from.code}</div>
                  <div className="text-sm text-muted-foreground">{flightDetails.from.city}</div>
                  <div className="text-sm font-medium">{flightDetails.departure.time}</div>
                </div>
                <div className="flex-1 text-center">
                  <div className="text-sm text-muted-foreground mb-1">{flightDetails.duration}</div>
                  <div className="border-t border-dashed border-gray-300 relative">
                    <Plane className="h-4 w-4 absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 text-blue-500" />
                  </div>
                  <div className="text-sm font-medium mt-1">{flightDetails.flightNumber}</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-lg">{flightDetails.to.code}</div>
                  <div className="text-sm text-muted-foreground">{flightDetails.to.city}</div>
                  <div className="text-sm font-medium">{flightDetails.arrival.time}</div>
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div className="flex justify-between text-sm">
              <span>Flight Date:</span>
              <span>{formatDate(flightDetails.departure.date)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Passengers:</span>
              <span>{flightDetails.passengers} Adult{flightDetails.passengers > 1 ? 's' : ''}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Class:</span>
              <span className="capitalize">{flightDetails.class}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Steps */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {paymentStep === 'details' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Passenger Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={passengerDetails.firstName}
                      onChange={(e) => setPassengerDetails(prev => ({ ...prev, firstName: e.target.value }))}
                      className={errors.firstName ? 'border-red-500' : ''}
                    />
                    {errors.firstName && <span className="text-sm text-red-500">{errors.firstName}</span>}
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={passengerDetails.lastName}
                      onChange={(e) => setPassengerDetails(prev => ({ ...prev, lastName: e.target.value }))}
                      className={errors.lastName ? 'border-red-500' : ''}
                    />
                    {errors.lastName && <span className="text-sm text-red-500">{errors.lastName}</span>}
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={passengerDetails.email}
                      onChange={(e) => setPassengerDetails(prev => ({ ...prev, email: e.target.value }))}
                      className={errors.email ? 'border-red-500' : ''}
                    />
                    {errors.email && <span className="text-sm text-red-500">{errors.email}</span>}
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone *</Label>
                    <Input
                      id="phone"
                      value={passengerDetails.phone}
                      onChange={(e) => setPassengerDetails(prev => ({ ...prev, phone: e.target.value }))}
                      className={errors.phone ? 'border-red-500' : ''}
                    />
                    {errors.phone && <span className="text-sm text-red-500">{errors.phone}</span>}
                  </div>
                  <div>
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={passengerDetails.dateOfBirth}
                      onChange={(e) => setPassengerDetails(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                    />
                  </div>
                </div>
                
                <Button 
                  onClick={handlePassengerDetailsSubmit} 
                  disabled={isCreatingPaymentIntent}
                  className="w-full"
                >
                  {isCreatingPaymentIntent ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Setting up payment...
                    </>
                  ) : (
                    'Continue to Payment'
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

          {paymentStep === 'payment' && paymentIntent && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Complete Your Payment
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Pay securely with Stripe. Your payment information is encrypted and secure.
                </p>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Flight:</span>
                    <span>{flightDetails.flightNumber}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Route:</span>
                    <span>{flightDetails.from.code} → {flightDetails.to.code}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Passenger:</span>
                    <span>{passengerDetails.firstName} {passengerDetails.lastName}</span>
                  </div>
                </div>
                
                <Separator className="mb-4" />
                
                <StripePaymentForm
                  clientSecret={paymentIntent.clientSecret}
                  amount={flightDetails.price.total}
                  currency={flightDetails.price.currency}
                  onSuccess={handleStripePaymentSuccess}
                  onError={handleStripePaymentError}
                  onCancel={handlePaymentCancel}
                  bookingDetails={{
                    flightInfo: {
                      flightNumber: flightDetails.flightNumber,
                      origin: flightDetails.from.code,
                      destination: flightDetails.to.code
                    },
                    totalAmount: flightDetails.price.total
                  }}
                />
              </CardContent>
            </Card>
          )}

          {paymentStep === 'payment' && !paymentIntent && (
            <Card>
              <CardContent className="flex items-center justify-center py-8">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                  <p className="text-muted-foreground">Setting up secure payment...</p>
                </div>
              </CardContent>
            </Card>
          )}

          {paymentStep === 'confirmation' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  Payment Successful
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Alert>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription>
                    Your flight has been booked successfully! A confirmation email has been sent to {passengerDetails.email}.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Price Breakdown */}
        <div>
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Price Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span>Base Fare ({flightDetails.passengers}x)</span>
                <span>{formatPrice(flightDetails.price.base, flightDetails.price.currency)}</span>
              </div>
              <div className="flex justify-between">
                <span>Taxes & Fees</span>
                <span>{formatPrice(flightDetails.price.taxes + flightDetails.price.fees, flightDetails.price.currency)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span>{formatPrice(flightDetails.price.total, flightDetails.price.currency)}</span>
              </div>
              
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-blue-700">
                  <Shield className="h-4 w-4" />
                  <span>Secure Payment</span>
                </div>
                <div className="text-xs text-blue-600 mt-1">
                  Your payment is protected by 256-bit SSL encryption
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default FlightPayment;