// Payment Modal Component
// Multi-step payment flow with security features and Stripe integration

import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription 
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Alert, AlertDescription } from '../ui/alert';
import { Checkbox } from '../ui/checkbox';
import { 
  CreditCard, 
  Shield, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Lock,
  MapPin,
  Mail,
  Phone,
  Plus,
  Trash2,
  Star
} from 'lucide-react';
import { usePayment } from '../../contexts/PaymentContext';
import { useAuth } from '../../contexts/AuthContext';
import { PaymentMethod } from '../../lib/payments/enhancedStripeService';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount?: number;
  currency?: string;
  description?: string;
  bookingId?: string;
}

export function PaymentModal({
  isOpen,
  onClose,
  amount,
  currency = 'USD',
  description = 'Flight booking payment',
  bookingId
}: PaymentModalProps) {
  const { user } = useAuth();
  const {
    state,
    processPayment,
    confirmPayment,
    cancelPayment,
    loadPaymentMethods,
    selectPaymentMethod,
    setPaymentStep,
    formatAmount,
    validateBillingInfo,
    getPaymentMethodDisplayName,
    updateBillingInfo,
  } = usePayment();

  // Local state for payment form
  const [paymentFormData, setPaymentFormData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    nameOnCard: '',
    saveCard: true,
  });

  const [billingFormData, setBillingFormData] = useState({
    name: user?.profile?.firstName + ' ' + user?.profile?.lastName || '',
    email: user?.email || '',
    phone: user?.profile?.phone || '',
    address: {
      line1: '',
      line2: '',
      city: '',
      state: '',
      country: 'US',
      postal_code: '',
    },
  });

  const [captchaToken, setCaptchaToken] = useState('');

  // Load payment methods when modal opens
  useEffect(() => {
    if (isOpen && user) {
      loadPaymentMethods();
    }
  }, [isOpen, user, loadPaymentMethods]);

  // Initialize billing info from user profile
  useEffect(() => {
    if (user && user.profile) {
      setBillingFormData(prev => ({
        ...prev,
        name: `${user.profile?.firstName || ''} ${user.profile?.lastName || ''}`.trim(),
        email: user.email || '',
        phone: user.profile?.phone || '',
      }));
    }
  }, [user]);

  const handleClose = () => {
    cancelPayment();
    onClose();
  };

  const handlePaymentMethodSelect = (method: PaymentMethod) => {
    selectPaymentMethod(method);
    setPaymentStep('billing');
  };

  const handleNewCardSelect = () => {
    selectPaymentMethod(null);
    setPaymentStep('billing');
  };

  const handleBillingContinue = () => {
    const validation = validateBillingInfo(billingFormData);
    if (!validation.isValid) {
      // Handle validation errors
      return;
    }
    
    updateBillingInfo(billingFormData);
    setPaymentStep('confirmation');
  };

  const handleConfirmPayment = async () => {
    if (!amount) return;

    try {
      setPaymentStep('processing');

      const paymentRequest = {
        amount,
        currency,
        description,
        bookingId,
        captchaToken: captchaToken || 'mock-captcha-token', // In production, get from reCAPTCHA
        paymentMethodId: state.selectedPaymentMethod?.id,
        savePaymentMethod: paymentFormData.saveCard,
        billingDetails: billingFormData,
        metadata: {
          source: 'flight-booking-modal',
          bookingId: bookingId || '',
        },
      };

      const result = await processPayment(paymentRequest);

      if (result.success) {
        if (result.requiresAction) {
          // Handle 3D Secure or other authentication
          setPaymentStep('confirmation');
        } else {
          setPaymentStep('success');
        }
      } else {
        setPaymentStep('error');
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      setPaymentStep('error');
    }
  };

  const renderPaymentMethodStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Choose Payment Method</h3>
        <p className="text-sm text-muted-foreground">
          Select a saved payment method or add a new one
        </p>
      </div>

      {/* Saved Payment Methods */}
      {state.paymentMethods.length > 0 && (
        <div className="space-y-3">
          <Label className="text-sm font-medium">Saved Payment Methods</Label>
          {state.paymentMethods.map((method) => (
            <Card 
              key={method.id} 
              className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                state.selectedPaymentMethod?.id === method.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => handlePaymentMethodSelect(method)}
            >
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center space-x-3">
                  <CreditCard className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{getPaymentMethodDisplayName(method)}</p>
                    <p className="text-sm text-muted-foreground">
                      Expires {method.expiryMonth}/{method.expiryYear}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {method.isDefault && (
                    <Badge variant="secondary">
                      <Star className="h-3 w-3 mr-1" />
                      Default
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-xs">
                    {method.brand?.toUpperCase()}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add New Payment Method */}
      <Card 
        className="cursor-pointer border-dashed border-2 hover:border-primary/50"
        onClick={handleNewCardSelect}
      >
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center space-y-2">
            <Plus className="h-8 w-8 text-muted-foreground mx-auto" />
            <p className="font-medium">Add New Payment Method</p>
            <p className="text-sm text-muted-foreground">
              Credit or debit card
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Security Notice */}
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          Your payment information is secured with industry-standard encryption and 
          never stored on our servers.
        </AlertDescription>
      </Alert>
    </div>
  );

  const renderBillingStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Billing Information</h3>
        <p className="text-sm text-muted-foreground">
          Enter your billing details for this payment
        </p>
      </div>

      {/* New Card Form (if no payment method selected) */}
      {!state.selectedPaymentMethod && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center">
              <CreditCard className="h-4 w-4 mr-2" />
              Payment Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="cardNumber">Card Number</Label>
                <Input
                  id="cardNumber"
                  placeholder="1234 5678 9012 3456"
                  value={paymentFormData.cardNumber}
                  onChange={(e) => setPaymentFormData(prev => ({
                    ...prev,
                    cardNumber: e.target.value
                  }))}
                  maxLength={19}
                />
              </div>
              <div>
                <Label htmlFor="expiryDate">Expiry Date</Label>
                <Input
                  id="expiryDate"
                  placeholder="MM/YY"
                  value={paymentFormData.expiryDate}
                  onChange={(e) => setPaymentFormData(prev => ({
                    ...prev,
                    expiryDate: e.target.value
                  }))}
                  maxLength={5}
                />
              </div>
              <div>
                <Label htmlFor="cvv">CVV</Label>
                <Input
                  id="cvv"
                  placeholder="123"
                  value={paymentFormData.cvv}
                  onChange={(e) => setPaymentFormData(prev => ({
                    ...prev,
                    cvv: e.target.value
                  }))}
                  maxLength={4}
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="nameOnCard">Name on Card</Label>
                <Input
                  id="nameOnCard"
                  placeholder="John Doe"
                  value={paymentFormData.nameOnCard}
                  onChange={(e) => setPaymentFormData(prev => ({
                    ...prev,
                    nameOnCard: e.target.value
                  }))}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="saveCard"
                checked={paymentFormData.saveCard}
                onCheckedChange={(checked) => setPaymentFormData(prev => ({
                  ...prev,
                  saveCard: checked as boolean
                }))}
              />
              <Label htmlFor="saveCard" className="text-sm">
                Save this card for future payments
              </Label>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Billing Address Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center">
            <MapPin className="h-4 w-4 mr-2" />
            Billing Address
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="billingName">Full Name</Label>
              <Input
                id="billingName"
                value={billingFormData.name}
                onChange={(e) => setBillingFormData(prev => ({
                  ...prev,
                  name: e.target.value
                }))}
              />
            </div>
            <div>
              <Label htmlFor="billingEmail">Email</Label>
              <Input
                id="billingEmail"
                type="email"
                value={billingFormData.email}
                onChange={(e) => setBillingFormData(prev => ({
                  ...prev,
                  email: e.target.value
                }))}
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="phone">Phone (Optional)</Label>
              <Input
                id="phone"
                type="tel"
                value={billingFormData.phone}
                onChange={(e) => setBillingFormData(prev => ({
                  ...prev,
                  phone: e.target.value
                }))}
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="address1">Address Line 1</Label>
              <Input
                id="address1"
                value={billingFormData.address.line1}
                onChange={(e) => setBillingFormData(prev => ({
                  ...prev,
                  address: { ...prev.address, line1: e.target.value }
                }))}
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="address2">Address Line 2 (Optional)</Label>
              <Input
                id="address2"
                value={billingFormData.address.line2}
                onChange={(e) => setBillingFormData(prev => ({
                  ...prev,
                  address: { ...prev.address, line2: e.target.value }
                }))}
              />
            </div>
            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={billingFormData.address.city}
                onChange={(e) => setBillingFormData(prev => ({
                  ...prev,
                  address: { ...prev.address, city: e.target.value }
                }))}
              />
            </div>
            <div>
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                value={billingFormData.address.state}
                onChange={(e) => setBillingFormData(prev => ({
                  ...prev,
                  address: { ...prev.address, state: e.target.value }
                }))}
              />
            </div>
            <div>
              <Label htmlFor="postalCode">Postal Code</Label>
              <Input
                id="postalCode"
                value={billingFormData.address.postal_code}
                onChange={(e) => setBillingFormData(prev => ({
                  ...prev,
                  address: { ...prev.address, postal_code: e.target.value }
                }))}
              />
            </div>
            <div>
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={billingFormData.address.country}
                onChange={(e) => setBillingFormData(prev => ({
                  ...prev,
                  address: { ...prev.address, country: e.target.value }
                }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setPaymentStep('method')}>
          Back
        </Button>
        <Button onClick={handleBillingContinue}>
          Continue to Payment
        </Button>
      </div>
    </div>
  );

  const renderConfirmationStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Confirm Payment</h3>
        <p className="text-sm text-muted-foreground">
          Review your payment details before confirming
        </p>
      </div>

      {/* Payment Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Payment Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="font-medium">Amount</span>
            <span className="text-xl font-bold">
              {amount && formatAmount(amount, currency)}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span>Description</span>
            <span>{description}</span>
          </div>
          {bookingId && (
            <div className="flex justify-between items-center text-sm">
              <span>Booking ID</span>
              <span className="font-mono">{bookingId}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Method Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Payment Method</CardTitle>
        </CardHeader>
        <CardContent>
          {state.selectedPaymentMethod ? (
            <div className="flex items-center space-x-3">
              <CreditCard className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">
                  {getPaymentMethodDisplayName(state.selectedPaymentMethod)}
                </p>
                <p className="text-sm text-muted-foreground">
                  Saved payment method
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <CreditCard className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">
                  {paymentFormData.cardNumber.slice(-4) ? 
                    `****${paymentFormData.cardNumber.slice(-4)}` : 
                    'New card'
                  }
                </p>
                <p className="text-sm text-muted-foreground">
                  {paymentFormData.nameOnCard || 'New payment method'}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Security Notice */}
      <Alert>
        <Lock className="h-4 w-4" />
        <AlertDescription>
          This payment is secured with 256-bit SSL encryption and may require 
          additional authentication for your security.
        </AlertDescription>
      </Alert>

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setPaymentStep('billing')}>
          Back
        </Button>
        <Button onClick={handleConfirmPayment} className="bg-green-600 hover:bg-green-700">
          <Lock className="h-4 w-4 mr-2" />
          Confirm Payment
        </Button>
      </div>
    </div>
  );

  const renderProcessingStep = () => (
    <div className="text-center space-y-6 py-8">
      <Loader2 className="h-16 w-16 animate-spin mx-auto text-primary" />
      <div>
        <h3 className="text-lg font-semibold mb-2">Processing Payment</h3>
        <p className="text-sm text-muted-foreground">
          Please wait while we securely process your payment...
        </p>
      </div>
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Do not close this window or refresh the page while processing.
        </AlertDescription>
      </Alert>
    </div>
  );

  const renderSuccessStep = () => (
    <div className="text-center space-y-6 py-8">
      <CheckCircle className="h-16 w-16 mx-auto text-green-600" />
      <div>
        <h3 className="text-lg font-semibold mb-2 text-green-700">Payment Successful!</h3>
        <p className="text-sm text-muted-foreground">
          Your payment has been processed successfully
        </p>
      </div>
      
      {state.currentPayment && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Amount Paid</span>
                <span className="font-medium">
                  {formatAmount(state.currentPayment.amount, state.currentPayment.currency)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Transaction ID</span>
                <span className="font-mono text-xs">
                  {state.currentPayment.paymentIntentId}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Button onClick={handleClose} className="w-full">
        Close
      </Button>
    </div>
  );

  const renderErrorStep = () => (
    <div className="text-center space-y-6 py-8">
      <AlertCircle className="h-16 w-16 mx-auto text-red-600" />
      <div>
        <h3 className="text-lg font-semibold mb-2 text-red-700">Payment Failed</h3>
        <p className="text-sm text-muted-foreground">
          We couldn't process your payment. Please try again.
        </p>
      </div>

      {state.paymentErrors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {state.paymentErrors[0].message}
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Button 
          onClick={() => setPaymentStep('confirmation')} 
          className="w-full"
        >
          Try Again
        </Button>
        <Button variant="outline" onClick={handleClose} className="w-full">
          Cancel
        </Button>
      </div>
    </div>
  );

  const getStepContent = () => {
    switch (state.ui.activePaymentStep) {
      case 'method':
        return renderPaymentMethodStep();
      case 'billing':
        return renderBillingStep();
      case 'confirmation':
        return renderConfirmationStep();
      case 'processing':
        return renderProcessingStep();
      case 'success':
        return renderSuccessStep();
      case 'error':
        return renderErrorStep();
      default:
        return renderPaymentMethodStep();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <CreditCard className="h-5 w-5 mr-2" />
            Secure Payment
          </DialogTitle>
          <DialogDescription>
            Complete your flight booking payment securely
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6">
          {getStepContent()}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default PaymentModal;