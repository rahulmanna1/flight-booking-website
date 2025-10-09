// Booking Cancellation Modal Component
// Handle booking cancellation with refund calculation

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Separator } from '../ui/separator';
import { Textarea } from '../ui/textarea';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';
import { Checkbox } from '../ui/checkbox';
import {
  XCircle,
  AlertTriangle,
  DollarSign,
  Calendar,
  Clock,
  FileText,
  RefreshCw,
  CreditCard,
  Info,
} from 'lucide-react';
import { FlightBooking, CancelBookingRequest } from '../../types/booking';
import { useBooking } from '../../contexts/BookingContext';
import { useCurrency } from '../../contexts/CurrencyContext';

interface BookingCancellationModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId?: string;
}

export function BookingCancellationModal({
  isOpen,
  onClose,
  bookingId,
}: BookingCancellationModalProps) {
  const {
    state,
    getBooking,
    cancelBooking,
    calculateRefundAmount,
    formatBookingReference,
  } = useBooking();

  const { formatAmount } = useCurrency();
  const [booking, setBooking] = useState<FlightBooking | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');
  const [selectedReason, setSelectedReason] = useState('');
  const [requestRefund, setRequestRefund] = useState(true);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [step, setStep] = useState<'details' | 'confirmation' | 'processing' | 'success' | 'error'>('details');
  const [cancellationFees, setCancellationFees] = useState(0);

  // Predefined cancellation reasons
  const cancellationReasons = [
    { value: 'change_of_plans', label: 'Change of plans' },
    { value: 'medical_emergency', label: 'Medical emergency' },
    { value: 'flight_cancelled', label: 'Flight was cancelled by airline' },
    { value: 'travel_restrictions', label: 'Travel restrictions' },
    { value: 'work_related', label: 'Work/business related' },
    { value: 'family_emergency', label: 'Family emergency' },
    { value: 'other', label: 'Other' },
  ];

  // Load booking details when modal opens
  useEffect(() => {
    if (isOpen && bookingId) {
      loadBookingDetails();
    }
  }, [isOpen, bookingId]);

  // Calculate cancellation fees when booking loads
  useEffect(() => {
    if (booking) {
      calculateCancellationFees();
    }
  }, [booking]);

  const loadBookingDetails = async () => {
    if (!bookingId) return;
    
    setIsLoading(true);
    try {
      const bookingData = await getBooking(bookingId);
      setBooking(bookingData);
    } catch (error) {
      console.error('Failed to load booking details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateCancellationFees = () => {
    if (!booking) return;

    // Simple cancellation fee calculation
    // In reality, this would be based on airline policies, fare rules, etc.
    const departureDate = new Date(booking.flightSegments[0].departure.dateTime);
    const now = new Date();
    const hoursUntilDeparture = (departureDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    let feePercentage = 0;
    
    if (hoursUntilDeparture < 24) {
      feePercentage = 0.8; // 80% fee for cancellations within 24 hours
    } else if (hoursUntilDeparture < 48) {
      feePercentage = 0.5; // 50% fee for cancellations within 48 hours
    } else if (hoursUntilDeparture < 168) { // 7 days
      feePercentage = 0.3; // 30% fee for cancellations within 7 days
    } else {
      feePercentage = 0.1; // 10% fee for early cancellations
    }

    const totalAmount = booking.pricing.total;
    const fees = totalAmount * feePercentage;
    setCancellationFees(fees);
  };

  const handleCancel = async () => {
    if (!booking || !acceptTerms) return;

    setIsCancelling(true);
    setStep('processing');

    try {
      const request: CancelBookingRequest = {
        reason: selectedReason === 'other' ? cancellationReason : selectedReason,
        requestRefund: requestRefund,
        cancellationFees: cancellationFees,
      };

      const result = await cancelBooking(booking.id, request);

      if (result) {
        setStep('success');
      } else {
        setStep('error');
      }
    } catch (error) {
      console.error('Cancellation failed:', error);
      setStep('error');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleClose = () => {
    if (step === 'success') {
      // Refresh the booking list when closing after successful cancellation
      onClose();
      setStep('details');
    } else if (!isCancelling) {
      onClose();
      setStep('details');
    }
  };

  const refundAmount = booking ? calculateRefundAmount(booking) - cancellationFees : 0;
  const canProceed = selectedReason && acceptTerms && (selectedReason !== 'other' || cancellationReason.trim());

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-center space-y-2">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto" />
              <p>Loading booking details...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!booking) {
    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Booking Not Found</DialogTitle>
            <DialogDescription>
              Could not find the booking for cancellation.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <Button onClick={handleClose}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <XCircle className="h-5 w-5 text-red-600" />
            <span>Cancel Booking</span>
          </DialogTitle>
          <DialogDescription>
            Cancel booking {formatBookingReference(booking.bookingReference)}
          </DialogDescription>
        </DialogHeader>

        {step === 'details' && (
          <div className="space-y-6">
            {/* Booking Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="font-medium">Route</div>
                    <div className="text-muted-foreground">
                      {booking.flightSegments[0].departure.airport.code} → {booking.flightSegments[0].arrival.airport.code}
                      {booking.tripType === 'round-trip' && booking.flightSegments[1] && 
                        ` → ${booking.flightSegments[1].arrival.airport.code}`
                      }
                    </div>
                  </div>
                  <div>
                    <div className="font-medium">Departure</div>
                    <div className="text-muted-foreground">
                      {new Date(booking.flightSegments[0].departure.dateTime).toLocaleDateString('en-US', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </div>
                  </div>
                  <div>
                    <div className="font-medium">Passengers</div>
                    <div className="text-muted-foreground">{booking.passengers.length}</div>
                  </div>
                  <div>
                    <div className="font-medium">Total Paid</div>
                    <div className="text-muted-foreground font-bold">
                      {formatAmount(booking.pricing.total)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Refund Calculation */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Refund Calculation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>Original Amount</span>
                  <span>{formatAmount(booking.pricing.total)}</span>
                </div>
                <div className="flex justify-between text-red-600">
                  <span>Cancellation Fees</span>
                  <span>-{formatAmount(cancellationFees)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Refund Amount</span>
                  <span className="text-green-600">{formatAmount(refundAmount)}</span>
                </div>
                
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Refund will be processed to your original payment method within 5-10 business days.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            {/* Cancellation Reason */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Reason for Cancellation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <RadioGroup value={selectedReason} onValueChange={setSelectedReason}>
                  {cancellationReasons.map((reason) => (
                    <div key={reason.value} className="flex items-center space-x-2">
                      <RadioGroupItem value={reason.value} id={reason.value} />
                      <Label htmlFor={reason.value}>{reason.label}</Label>
                    </div>
                  ))}
                </RadioGroup>

                {selectedReason === 'other' && (
                  <div className="mt-4">
                    <Label htmlFor="customReason">Please specify:</Label>
                    <Textarea
                      id="customReason"
                      placeholder="Please provide details about your cancellation reason..."
                      value={cancellationReason}
                      onChange={(e) => setCancellationReason(e.target.value)}
                      className="mt-2"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Refund Option */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="requestRefund"
                    checked={requestRefund}
                    onCheckedChange={(checked) => setRequestRefund(checked as boolean)}
                  />
                  <Label htmlFor="requestRefund" className="text-sm">
                    Request refund to original payment method
                  </Label>
                </div>
              </CardContent>
            </Card>

            {/* Terms and Conditions */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="acceptTerms"
                    checked={acceptTerms}
                    onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
                  />
                  <Label htmlFor="acceptTerms" className="text-sm leading-relaxed">
                    I understand that by cancelling this booking:
                    <ul className="mt-2 ml-4 space-y-1 text-muted-foreground">
                      <li>• Cancellation fees will be deducted from the refund</li>
                      <li>• The refund process may take 5-10 business days</li>
                      <li>• This action cannot be undone</li>
                      <li>• I may lose any special promotions or discounts</li>
                    </ul>
                  </Label>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {step === 'confirmation' && (
          <div className="space-y-6">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Final Confirmation Required</strong>
                <br />
                You are about to cancel booking {formatBookingReference(booking.bookingReference)}.
                This action cannot be undone.
              </AlertDescription>
            </Alert>

            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="font-medium">Refund Amount</div>
                    <div className="text-2xl font-bold text-green-600">
                      {formatAmount(refundAmount)}
                    </div>
                  </div>
                  <div>
                    <div className="font-medium">Processing Time</div>
                    <div className="text-muted-foreground">5-10 business days</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {step === 'processing' && (
          <div className="text-center space-y-6 py-8">
            <RefreshCw className="h-16 w-16 animate-spin mx-auto text-primary" />
            <div>
              <h3 className="text-lg font-semibold mb-2">Processing Cancellation</h3>
              <p className="text-sm text-muted-foreground">
                Please wait while we process your booking cancellation...
              </p>
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className="text-center space-y-6 py-8">
            <XCircle className="h-16 w-16 mx-auto text-green-600" />
            <div>
              <h3 className="text-lg font-semibold mb-2 text-green-700">Booking Cancelled Successfully</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Your booking has been cancelled and refund has been initiated.
              </p>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Booking Reference</span>
                      <span className="font-mono">{formatBookingReference(booking.bookingReference)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Refund Amount</span>
                      <span className="font-bold text-green-600">
                        {formatAmount(refundAmount)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Expected in Account</span>
                      <span>5-10 business days</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  A confirmation email has been sent to your registered email address with cancellation details.
                </AlertDescription>
              </Alert>
            </div>
          </div>
        )}

        {step === 'error' && (
          <div className="text-center space-y-6 py-8">
            <AlertTriangle className="h-16 w-16 mx-auto text-red-600" />
            <div>
              <h3 className="text-lg font-semibold mb-2 text-red-700">Cancellation Failed</h3>
              <p className="text-sm text-muted-foreground">
                We encountered an error while processing your cancellation. Please try again or contact support.
              </p>
            </div>

            {state.errors.length > 0 && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  {state.errors[0].message}
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between pt-4 border-t">
          {step === 'details' && (
            <>
              <Button variant="outline" onClick={handleClose}>
                Keep Booking
              </Button>
              <Button
                variant="destructive"
                onClick={() => setStep('confirmation')}
                disabled={!canProceed}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Cancel Booking
              </Button>
            </>
          )}

          {step === 'confirmation' && (
            <>
              <Button variant="outline" onClick={() => setStep('details')}>
                Back
              </Button>
              <Button
                variant="destructive"
                onClick={handleCancel}
                disabled={isCancelling}
              >
                {isCancelling && <RefreshCw className="h-4 w-4 mr-2 animate-spin" />}
                Confirm Cancellation
              </Button>
            </>
          )}

          {(step === 'success' || step === 'error') && (
            <div className="flex space-x-2 ml-auto">
              {step === 'error' && (
                <Button variant="outline" onClick={() => setStep('details')}>
                  Try Again
                </Button>
              )}
              <Button onClick={handleClose}>Close</Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default BookingCancellationModal;