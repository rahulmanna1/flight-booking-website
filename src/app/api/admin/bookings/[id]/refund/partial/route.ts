// Admin API: Process Partial Refund for Booking
// POST /api/admin/bookings/[id]/refund/partial

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, logAdminAction } from '@/lib/middleware/adminAuth';
import { createPartialRefund, calculateAvailableRefundAmount } from '@/lib/payments/refundService';
import { prisma } from '@/lib/db';

/**
 * POST /api/admin/bookings/[id]/refund/partial
 * Process a partial refund for a booking
 * 
 * @requires Admin authentication
 * @body { amount: number, reason?: string }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return requireAdmin(request, async (req, admin) => {
    try {
      const bookingId = params.id;

      // Validate booking exists
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        select: {
          id: true,
          bookingReference: true,
          status: true,
          totalAmount: true,
          user: {
            select: {
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      if (!booking) {
        return NextResponse.json(
          { success: false, error: 'Booking not found' },
          { status: 404 }
        );
      }

      // Check if booking can be refunded
      if (booking.status === 'REFUNDED') {
        return NextResponse.json(
          { success: false, error: 'Booking already fully refunded' },
          { status: 400 }
        );
      }

      if (booking.status === 'PAYMENT_FAILED') {
        return NextResponse.json(
          { success: false, error: 'Cannot refund a booking with failed payment' },
          { status: 400 }
        );
      }

      // Parse request body
      const body = await request.json();
      const { amount, reason } = body;

      // Validate amount
      if (!amount || typeof amount !== 'number' || amount <= 0) {
        return NextResponse.json(
          { success: false, error: 'Valid refund amount is required' },
          { status: 400 }
        );
      }

      // Check available refund amount
      const availableInfo = await calculateAvailableRefundAmount(bookingId);

      if (amount > availableInfo.available) {
        return NextResponse.json(
          {
            success: false,
            error: `Refund amount exceeds available balance. Available: $${availableInfo.available}`,
            data: {
              requestedAmount: amount,
              availableAmount: availableInfo.available,
              totalRefunded: availableInfo.totalRefunded,
              bookingTotal: availableInfo.bookingTotal,
            },
          },
          { status: 400 }
        );
      }

      // Process the partial refund
      const result = await createPartialRefund(
        bookingId,
        amount,
        reason || 'Partial refund processed by admin',
        admin.userId
      );

      if (!result.success) {
        return NextResponse.json(
          { success: false, error: result.error },
          { status: 400 }
        );
      }

      // Log admin action
      await logAdminAction({
        userId: admin.userId,
        action: 'BOOKING_REFUND_PARTIAL',
        category: 'REFUND',
        details: {
          bookingId,
          bookingReference: booking.bookingReference,
          refundId: result.refundId,
          refundReference: result.refundReference,
          amount: result.amount,
          availableAfterRefund: availableInfo.available - result.amount,
          reason: reason || 'Partial refund processed by admin',
          customerEmail: booking.user?.email,
        },
        ipAddress: request.headers.get('x-forwarded-for') || undefined,
        userAgent: request.headers.get('user-agent') || undefined,
      });

      return NextResponse.json({
        success: true,
        message: 'Partial refund processed successfully',
        data: {
          refundId: result.refundId,
          refundReference: result.refundReference,
          amount: result.amount,
          status: result.status,
          bookingReference: booking.bookingReference,
          remainingRefundable: availableInfo.available - result.amount,
        },
      });
    } catch (error: any) {
      console.error('Partial refund API error:', error);

      return NextResponse.json(
        {
          success: false,
          error: 'Failed to process partial refund',
          message: error.message,
        },
        { status: 500 }
      );
    }
  });
}
