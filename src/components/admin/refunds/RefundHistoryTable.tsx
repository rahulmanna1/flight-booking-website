// Refund History Table Component
// Displays a comprehensive table of refund history for a booking or user

'use client';

import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { RefundStatusBadge, getRefundStatusDescription } from './RefundStatusBadge';
import { Eye, Copy, Check } from 'lucide-react';

interface Refund {
  id: string;
  refundReference: string;
  bookingId: string;
  bookingReference?: string;
  userId: string;
  status: string;
  reason?: string;
  refundType: 'FULL' | 'PARTIAL' | 'CANCELLATION_FEE';
  requestedAmount?: number;
  approvedAmount?: number;
  processingFee?: number;
  netRefundAmount?: number;
  transactionId?: string;
  processedBy?: string;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

interface RefundHistoryTableProps {
  refunds: Refund[];
  currency?: string;
  isLoading?: boolean;
  showBookingReference?: boolean;
  emptyMessage?: string;
}

export function RefundHistoryTable({
  refunds,
  currency = 'USD',
  isLoading = false,
  showBookingReference = false,
  emptyMessage = 'No refunds found',
}: RefundHistoryTableProps) {
  const [selectedRefund, setSelectedRefund] = useState<Refund | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const formatCurrency = (amount: number | undefined) => {
    if (amount === undefined || amount === null) return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
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

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const getRefundTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      FULL: 'Full Refund',
      PARTIAL: 'Partial Refund',
      CANCELLATION_FEE: 'Cancellation Fee',
    };
    return labels[type] || type;
  };

  const getRefundTypeBadgeClass = (type: string) => {
    const classes: Record<string, string> = {
      FULL: 'bg-blue-100 text-blue-800 border-blue-200',
      PARTIAL: 'bg-purple-100 text-purple-800 border-purple-200',
      CANCELLATION_FEE: 'bg-orange-100 text-orange-800 border-orange-200',
    };
    return classes[type] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Refund History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-center space-y-2">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600 mx-auto" />
              <p className="text-gray-600">Loading refund history...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (refunds.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Refund History</CardTitle>
          <CardDescription>View all refund transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <svg
              className="h-12 w-12 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="text-sm">{emptyMessage}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Refund History</CardTitle>
          <CardDescription>
            {refunds.length} {refunds.length === 1 ? 'refund' : 'refunds'} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reference</TableHead>
                  {showBookingReference && <TableHead>Booking</TableHead>}
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {refunds.map((refund) => (
                  <TableRow key={refund.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {refund.refundReference}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() =>
                            copyToClipboard(refund.refundReference, refund.id)
                          }
                        >
                          {copiedId === refund.id ? (
                            <Check className="h-3 w-3 text-green-600" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                    {showBookingReference && (
                      <TableCell>
                        <code className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                          {refund.bookingReference || refund.bookingId}
                        </code>
                      </TableCell>
                    )}
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`${getRefundTypeBadgeClass(
                          refund.refundType
                        )} text-xs`}
                      >
                        {getRefundTypeLabel(refund.refundType)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-semibold">
                          {formatCurrency(refund.approvedAmount || refund.requestedAmount)}
                        </p>
                        {refund.netRefundAmount &&
                          refund.netRefundAmount !== refund.approvedAmount && (
                            <p className="text-xs text-gray-500">
                              Net: {formatCurrency(refund.netRefundAmount)}
                            </p>
                          )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <RefundStatusBadge
                        status={refund.status as any}
                        size="sm"
                      />
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>{formatDate(refund.createdAt)}</p>
                        {refund.completedAt && (
                          <p className="text-xs text-gray-500">
                            Completed: {formatDate(refund.completedAt)}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedRefund(refund)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Refund Details Modal */}
      <Dialog
        open={!!selectedRefund}
        onOpenChange={(open) => !open && setSelectedRefund(null)}
      >
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Refund Details</DialogTitle>
            <DialogDescription>
              View complete information about this refund
            </DialogDescription>
          </DialogHeader>

          {selectedRefund && (
            <div className="space-y-4 py-4">
              {/* Header Info */}
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm text-gray-600">Refund Reference</p>
                        <div className="flex items-center gap-2 mt-1">
                          <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                            {selectedRefund.refundReference}
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() =>
                              copyToClipboard(
                                selectedRefund.refundReference,
                                'modal-ref'
                              )
                            }
                          >
                            {copiedId === 'modal-ref' ? (
                              <Check className="h-3 w-3 text-green-600" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                      </div>
                      <RefundStatusBadge status={selectedRefund.status as any} />
                    </div>

                    <Separator />

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Refund Type</p>
                        <Badge
                          variant="outline"
                          className={`${getRefundTypeBadgeClass(
                            selectedRefund.refundType
                          )} mt-1`}
                        >
                          {getRefundTypeLabel(selectedRefund.refundType)}
                        </Badge>
                      </div>
                      {showBookingReference && (
                        <div>
                          <p className="text-sm text-gray-600">Booking Reference</p>
                          <code className="text-sm bg-blue-50 text-blue-700 px-2 py-1 rounded inline-block mt-1">
                            {selectedRefund.bookingReference ||
                              selectedRefund.bookingId}
                          </code>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Financial Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Financial Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {selectedRefund.requestedAmount && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Requested Amount</span>
                      <span className="font-semibold">
                        {formatCurrency(selectedRefund.requestedAmount)}
                      </span>
                    </div>
                  )}
                  {selectedRefund.approvedAmount && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Approved Amount</span>
                      <span className="font-semibold">
                        {formatCurrency(selectedRefund.approvedAmount)}
                      </span>
                    </div>
                  )}
                  {selectedRefund.processingFee && (
                    <div className="flex justify-between text-red-600">
                      <span>Processing Fee</span>
                      <span>-{formatCurrency(selectedRefund.processingFee)}</span>
                    </div>
                  )}
                  {selectedRefund.netRefundAmount && (
                    <>
                      <Separator />
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 font-medium">
                          Net Refund Amount
                        </span>
                        <span className="text-xl font-bold text-green-600">
                          {formatCurrency(selectedRefund.netRefundAmount)}
                        </span>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Additional Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Additional Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Status Description</p>
                    <p className="text-sm">
                      {getRefundStatusDescription(selectedRefund.status as any)}
                    </p>
                  </div>

                  {selectedRefund.reason && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Reason</p>
                      <p className="text-sm bg-gray-50 p-3 rounded">
                        {selectedRefund.reason}
                      </p>
                    </div>
                  )}

                  {selectedRefund.adminNotes && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Admin Notes</p>
                      <p className="text-sm bg-yellow-50 p-3 rounded border border-yellow-200">
                        {selectedRefund.adminNotes}
                      </p>
                    </div>
                  )}

                  {selectedRefund.transactionId && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Transaction ID</p>
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {selectedRefund.transactionId}
                      </code>
                    </div>
                  )}

                  <Separator />

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Created</p>
                      <p className="font-medium">
                        {formatDate(selectedRefund.createdAt)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Last Updated</p>
                      <p className="font-medium">
                        {formatDate(selectedRefund.updatedAt)}
                      </p>
                    </div>
                    {selectedRefund.completedAt && (
                      <div>
                        <p className="text-gray-600">Completed</p>
                        <p className="font-medium">
                          {formatDate(selectedRefund.completedAt)}
                        </p>
                      </div>
                    )}
                    {selectedRefund.processedBy && (
                      <div>
                        <p className="text-gray-600">Processed By</p>
                        <p className="font-medium">{selectedRefund.processedBy}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="flex justify-end">
            <Button onClick={() => setSelectedRefund(null)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
