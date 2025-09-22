'use client';

import React, { useState } from 'react';
import { CreditCard, Lock, Shield, AlertCircle, Check, Calendar, User, MapPin } from 'lucide-react';
import { useCurrency } from '@/contexts/CurrencyContext';

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
}

const countries = [
  'United States', 'Canada', 'United Kingdom', 'Germany', 'France', 'Italy', 'Spain',
  'Australia', 'Japan', 'China', 'India', 'Brazil', 'Mexico', 'Russia', 'South Korea',
  'Netherlands', 'Switzerland', 'Sweden', 'Norway', 'Denmark', 'Belgium', 'Austria'
];

export default function PaymentForm({ bookingDetails, onSubmit, onBack }: PaymentFormProps) {
  const { formatPrice } = useCurrency();
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>({
    cardNumber: '',
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
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);

  const formatCardNumber = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    
    // Add spaces every 4 digits
    const formatted = digits.replace(/(\d{4})(?=\d)/g, '$1 ');
    
    // Limit to 19 characters (16 digits + 3 spaces)
    return formatted.slice(0, 19);
  };

  const formatExpiryDate = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    
    // Add slash after first 2 digits
    if (digits.length >= 2) {
      return digits.slice(0, 2) + '/' + digits.slice(2, 4);
    }
    return digits;
  };

  const getCardType = (cardNumber: string) => {
    const digits = cardNumber.replace(/\D/g, '');
    
    if (digits.startsWith('4')) return 'visa';
    if (digits.startsWith('5') || digits.startsWith('2')) return 'mastercard';
    if (digits.startsWith('3')) return 'amex';
    if (digits.startsWith('6')) return 'discover';
    
    return 'unknown';
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Card number validation
    const cardDigits = paymentInfo.cardNumber.replace(/\D/g, '');
    if (!cardDigits) {
      newErrors.cardNumber = 'Card number is required';
    } else if (cardDigits.length < 13 || cardDigits.length > 19) {
      newErrors.cardNumber = 'Invalid card number';
    }

    // Expiry date validation
    if (!paymentInfo.expiryDate) {
      newErrors.expiryDate = 'Expiry date is required';
    } else {
      const [month, year] = paymentInfo.expiryDate.split('/');
      const currentYear = new Date().getFullYear() % 100;
      const currentMonth = new Date().getMonth() + 1;
      
      if (!month || !year || parseInt(month) < 1 || parseInt(month) > 12) {
        newErrors.expiryDate = 'Invalid expiry date';
      } else if (parseInt(year) < currentYear || (parseInt(year) === currentYear && parseInt(month) < currentMonth)) {
        newErrors.expiryDate = 'Card has expired';
      }
    }

    // CVV validation
    if (!paymentInfo.cvv) {
      newErrors.cvv = 'CVV is required';
    } else if (paymentInfo.cvv.length < 3 || paymentInfo.cvv.length > 4) {
      newErrors.cvv = 'Invalid CVV';
    }

    // Cardholder name validation
    if (!paymentInfo.cardholderName.trim()) {
      newErrors.cardholderName = 'Cardholder name is required';
    }

    // Billing address validation
    if (!paymentInfo.billingAddress.street.trim()) {
      newErrors.street = 'Street address is required';
    }
    if (!paymentInfo.billingAddress.city.trim()) {
      newErrors.city = 'City is required';
    }
    if (!paymentInfo.billingAddress.state.trim()) {
      newErrors.state = 'State/Province is required';
    }
    if (!paymentInfo.billingAddress.zipCode.trim()) {
      newErrors.zipCode = 'ZIP/Postal code is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsProcessing(true);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    setIsProcessing(false);
    onSubmit(paymentInfo);
  };

  const updatePaymentInfo = (field: string, value: any) => {
    setPaymentInfo(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const updateBillingAddress = (field: string, value: string) => {
    setPaymentInfo(prev => ({
      ...prev,
      billingAddress: {
        ...prev.billingAddress,
        [field]: value
      }
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Payment Form */}
        <div className="lg:col-span-2 space-y-8">
          {/* Header */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Payment Details</h2>
            <p className="text-gray-600 mt-2">Secure payment processing</p>
          </div>

          {/* Payment Methods */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Payment Method</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
              <button
                onClick={() => updatePaymentInfo('paymentMethod', 'credit')}
                className={`p-3 rounded-lg border-2 transition-all ${
                  paymentInfo.paymentMethod === 'credit'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <CreditCard className="w-6 h-6 mx-auto mb-1" />
                <span className="text-xs">Credit Card</span>
              </button>
              
              <button
                onClick={() => updatePaymentInfo('paymentMethod', 'debit')}
                className={`p-3 rounded-lg border-2 transition-all ${
                  paymentInfo.paymentMethod === 'debit'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <CreditCard className="w-6 h-6 mx-auto mb-1" />
                <span className="text-xs">Debit Card</span>
              </button>
              
              <button
                onClick={() => updatePaymentInfo('paymentMethod', 'paypal')}
                className={`p-3 rounded-lg border-2 transition-all ${
                  paymentInfo.paymentMethod === 'paypal'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="w-6 h-6 mx-auto mb-1 bg-blue-600 rounded text-white text-xs flex items-center justify-center">PP</div>
                <span className="text-xs">PayPal</span>
              </button>
              
              <button
                onClick={() => updatePaymentInfo('paymentMethod', 'applepay')}
                className={`p-3 rounded-lg border-2 transition-all ${
                  paymentInfo.paymentMethod === 'applepay'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="w-6 h-6 mx-auto mb-1 bg-black rounded text-white text-xs flex items-center justify-center">🍎</div>
                <span className="text-xs">Apple Pay</span>
              </button>
              
              <button
                onClick={() => updatePaymentInfo('paymentMethod', 'googlepay')}
                className={`p-3 rounded-lg border-2 transition-all ${
                  paymentInfo.paymentMethod === 'googlepay'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="w-6 h-6 mx-auto mb-1 bg-green-600 rounded text-white text-xs flex items-center justify-center">G</div>
                <span className="text-xs">Google Pay</span>
              </button>
            </div>

            {/* Card Details */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Card Number *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={paymentInfo.cardNumber}
                    onChange={(e) => updatePaymentInfo('cardNumber', formatCardNumber(e.target.value))}
                    className={`w-full px-4 py-3 pl-12 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.cardNumber ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                  />
                  <CreditCard className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  {getCardType(paymentInfo.cardNumber) !== 'unknown' && (
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                      <span className="text-xs font-medium text-gray-600">
                        {getCardType(paymentInfo.cardNumber).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                {errors.cardNumber && (
                  <p className="text-red-600 text-xs mt-1">{errors.cardNumber}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expiry Date *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={paymentInfo.expiryDate}
                      onChange={(e) => updatePaymentInfo('expiryDate', formatExpiryDate(e.target.value))}
                      className={`w-full px-4 py-3 pl-12 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.expiryDate ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="MM/YY"
                      maxLength={5}
                    />
                    <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  </div>
                  {errors.expiryDate && (
                    <p className="text-red-600 text-xs mt-1">{errors.expiryDate}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CVV *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={paymentInfo.cvv}
                      onChange={(e) => updatePaymentInfo('cvv', e.target.value.replace(/\D/g, '').slice(0, 4))}
                      className={`w-full px-4 py-3 pl-12 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.cvv ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="123"
                      maxLength={4}
                    />
                    <Shield className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  </div>
                  {errors.cvv && (
                    <p className="text-red-600 text-xs mt-1">{errors.cvv}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cardholder Name *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={paymentInfo.cardholderName}
                    onChange={(e) => updatePaymentInfo('cardholderName', e.target.value)}
                    className={`w-full px-4 py-3 pl-12 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.cardholderName ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="John Doe"
                  />
                  <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
                {errors.cardholderName && (
                  <p className="text-red-600 text-xs mt-1">{errors.cardholderName}</p>
                )}
              </div>
            </div>
          </div>

          {/* Billing Address */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              Billing Address
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Street Address *
                </label>
                <input
                  type="text"
                  value={paymentInfo.billingAddress.street}
                  onChange={(e) => updateBillingAddress('street', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.street ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="123 Main Street"
                />
                {errors.street && (
                  <p className="text-red-600 text-xs mt-1">{errors.street}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    value={paymentInfo.billingAddress.city}
                    onChange={(e) => updateBillingAddress('city', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.city ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="New York"
                  />
                  {errors.city && (
                    <p className="text-red-600 text-xs mt-1">{errors.city}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State/Province *
                  </label>
                  <input
                    type="text"
                    value={paymentInfo.billingAddress.state}
                    onChange={(e) => updateBillingAddress('state', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.state ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="NY"
                  />
                  {errors.state && (
                    <p className="text-red-600 text-xs mt-1">{errors.state}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ZIP/Postal Code *
                  </label>
                  <input
                    type="text"
                    value={paymentInfo.billingAddress.zipCode}
                    onChange={(e) => updateBillingAddress('zipCode', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.zipCode ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="10001"
                  />
                  {errors.zipCode && (
                    <p className="text-red-600 text-xs mt-1">{errors.zipCode}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country *
                  </label>
                  <select
                    value={paymentInfo.billingAddress.country}
                    onChange={(e) => updateBillingAddress('country', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {countries.map(country => (
                      <option key={country} value={country}>{country}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Save Card Option */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={paymentInfo.saveCard}
                  onChange={(e) => updatePaymentInfo('saveCard', e.target.checked)}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Save this card for future bookings</span>
              </label>
            </div>
          </div>

          {/* Security Notice */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <Lock className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-green-800">
                <p className="font-medium mb-1">Your payment is secure</p>
                <p>We use industry-standard SSL encryption to protect your payment information. Your data is encrypted and never stored on our servers.</p>
              </div>
            </div>
          </div>
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

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={onBack}
                className="w-full px-6 py-3 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                Back to Passenger Details
              </button>
              <button
                onClick={handleSubmit}
                disabled={isProcessing}
                className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center space-x-2"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Processing Payment...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Complete Payment</span>
                  </>
                )}
              </button>
            </div>

            {/* Payment methods accepted */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center mb-2">We accept:</p>
              <div className="flex justify-center space-x-2 opacity-60">
                <div className="w-8 h-5 bg-blue-600 rounded text-white text-xs flex items-center justify-center">VISA</div>
                <div className="w-8 h-5 bg-red-600 rounded text-white text-xs flex items-center justify-center">MC</div>
                <div className="w-8 h-5 bg-blue-400 rounded text-white text-xs flex items-center justify-center">AMEX</div>
                <div className="w-8 h-5 bg-orange-600 rounded text-white text-xs flex items-center justify-center">DISC</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}