// Admin Refund Modal Component
// Handles full and partial refund processing for bookings

'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import {
  DollarSign,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  CreditCard,
} from 'lucide-react';

interface RefundModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: {
    id: string;
    bookingReference: string;
    totalAmount: number;
    currency: string;
    status: string;
  } | null;
  onRefundSuccess?: () => void;
}

interface RefundInfo {
  bookingId: string;
  bookingReference: string;
  status: string;
  totalAmount: number;
  totalRefunded: number;
  availableAmount: number;
  canRefund: boolean;
  refundHistory: Array<{
    id: string;
    refundReference: string;
    refundType: string;
    status: string;
    approvedAmount: number;
    createdAt: string;
  }>;
}

export function RefundModal({
  isOpen,
  onClose,
  booking,
  onRefundSuccess,
}: RefundModalProps) {
  const [refundType, setRefundType] = useState<'full' | 'partial'>('full');
  const [refundAmount, setRefundAmount] = useState('');
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [refundInfo, setRefundInfo] = useState<RefundInfo | null>(null);
  const [refundResult, setRefundResult] = useState<any>(null);

  // Load refund information when modal opens
  useEffect(() => {
    if (isOpen && booking) {
      loadRefundInfo();
    } else {
      // Reset state when modal closes
      resetForm();
    }
  }, [isOpen, booking]);

  const loadRefundInfo = async () => {
    if (!booking) return;

    setIsLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/admin/bookings/${booking.id}/refund`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load refund information');
      }

      setRefundInfo(data.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefund = async () => {
    if (!booking || !refundInfo) return;

    // Validation
    if (refundType === 'partial') {
      const amount = parseFloat(refundAmount);
      if (!amount || amount <= 0) {
        setError('Please enter a valid refund amount');
        return;
      }
      if (amount > refundInfo.availableAmount) {
        setError(`Amount cannot exceed available refund amount: $${refundInfo.availableAmount.toFixed(2)}`);
        return;
      }
    }

    setIsProcessing(true);
    setError('');

    try {
      const token = localStorage.getItem('authToken');
      const endpoint =
        refundType === 'full'
          ? `/api/admin/bookings/${booking.id}/refund`
          : `/api/admin/bookings/${booking.id}/refund/partial`;

      const body = {
        ...(refundType === 'partial' ? { amount: parseFloat(refundAmount) } : {}),
        ...(reason ? { reason } : {}),
      };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process refund');
      }

      setRefundResult(data.data);
      setSuccess(true);
      
      // Call success callback
      if (onRefundSuccess) {
        onRefundSuccess();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const resetForm = () => {
    setRefundType('full');
    setRefundAmount('');
    setReason('');
    setError('');
    setSuccess(false);
    setRefundInfo(null);
    setRefundResult(null);
  };

  const handleClose = () => {
    if (!isProcessing) {
      onClose();
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: booking?.currency || 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[600px]">
          <div className="flex items-center justify-center py-8">
            <div className="text-center space-y-2">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto text-blue-600" />
              <p className="text-gray-600">Loading refund information...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Success state
  if (success && refundResult) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <DialogTitle>Refund Processed Successfully</DialogTitle>
            </div>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Booking Reference</span>
                    <span className="font-semibold">{refundResult.bookingReference}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Refund Reference</span>
                    <span className="font-mono text-sm">{refundResult.refundReference}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Refund Amount</span>
                    <span className="text-2xl font-bold text-green-600">
                      {formatCurrency(refundResult.amount)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status</span>
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      {refundResult.status}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                The refund will be processed to the original payment method within 5-10 business days.
                The customer will receive an email confirmation shortly.
              </AlertDescription>
            </Alert>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleClose}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Main refund form
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Process Refund</DialogTitle>
          <DialogDescription>
            {booking && `Process a refund for booking ${booking.bookingReference}`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Refund Information Card */}
          {refundInfo && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Refund Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Booking Total</p>
                    <p className="font-semibold">{formatCurrency(refundInfo.totalAmount)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Already Refunded</p>
                    <p className="font-semibold text-red-600">
                      {formatCurrency(refundInfo.totalRefunded)}
                    </p>
                  </div>
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-gray-600">Available for Refund</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(refundInfo.availableAmount)}
                  </p>
                </div>

                {!refundInfo.canRefund && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      This booking cannot be refunded. Status: {refundInfo.status}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}

          {/* Refund History */}
          {refundInfo && refundInfo.refundHistory.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Previous Refunds</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {refundInfo.refundHistory.map((refund) => (
                    <div
                      key={refund.id}
                      className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{formatCurrency(refund.approvedAmount)}</p>
                        <p className="text-xs text-gray-600">{formatDate(refund.createdAt)}</p>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant={refund.status === 'COMPLETED' ? 'default' : 'secondary'}
                          className="mb-1"
                        >
                          {refund.refundType}
                        </Badge>
                        <p className="text-xs text-gray-600">{refund.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Refund Type Selection */}
          {refundInfo?.canRefund && (
            <>
              <div className="space-y-4">
                <Label>Refund Type</Label>
                <RadioGroup
                  value={refundType}
                  onValueChange={(value: 'full' | 'partial') => {
                    setRefundType(value);
                    setError('');
                  }}
                  className="grid grid-cols-2 gap-4"
                >
                  <div>
                    <RadioGroupItem value="full" id="full" className="peer sr-only" />
                    <Label
                      htmlFor="full"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-gray-200 bg-white p-4 hover:bg-gray-50 peer-data-[state=checked]:border-blue-600 peer-data-[state=checked]:bg-blue-50 cursor-pointer"
                    >
                      <CreditCard className="mb-3 h-6 w-6" />
                      <span className="font-semibold">Full Refund</span>
                      <span className="text-sm text-gray-600 text-center mt-1">
                        Refund entire available amount
                      </span>
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem value="partial" id="partial" className="peer sr-only" />
                    <Label
                      htmlFor="partial"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-gray-200 bg-white p-4 hover:bg-gray-50 peer-data-[state=checked]:border-blue-600 peer-data-[state=checked]:bg-blue-50 cursor-pointer"
                    >
                      <DollarSign className="mb-3 h-6 w-6" />
                      <span className="font-semibold">Partial Refund</span>
                      <span className="text-sm text-gray-600 text-center mt-1">
                        Refund a specific amount
                      </span>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Partial Refund Amount */}
              {refundType === 'partial' && (
                <div className="space-y-2">
                  <Label htmlFor="amount">
                    Refund Amount ({booking?.currency || 'USD'})
                  </Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    max={refundInfo.availableAmount}
                    value={refundAmount}
                    onChange={(e) => {
                      setRefundAmount(e.target.value);
                      setError('');
                    }}
                    placeholder="0.00"
                    className="text-lg"
                  />
                  <p className="text-sm text-gray-600">
                    Maximum: {formatCurrency(refundInfo.availableAmount)}
                  </p>
                </div>
              )}

              {/* Reason */}
              <div className="space-y-2">
                <Label htmlFor="reason">Reason (Optional)</Label>
                <Textarea
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Enter reason for refund..."
                  rows={3}
                  className="resize-none"
                />
              </div>

              {/* Error Alert */}
              {error && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Refund Summary */}
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Amount to be refunded:</span>
                    <span className="text-2xl font-bold text-blue-600">
                      {refundType === 'full'
                        ? formatCurrency(refundInfo.availableAmount)
                        : refundAmount
                        ? formatCurrency(parseFloat(refundAmount))
                        : formatCurrency(0)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={handleClose} disabled={isProcessing}>
            Cancel
          </Button>
          <Button
            onClick={handleRefund}
            disabled={
              !refundInfo?.canRefund ||
              isProcessing ||
              (refundType === 'partial' && (!refundAmount || parseFloat(refundAmount) <= 0))
            }
            className="min-w-[120px]"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              'Process Refund'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
