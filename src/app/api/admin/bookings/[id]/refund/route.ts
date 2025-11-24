// Admin API: Process Full Refund for Booking
// POST /api/admin/bookings/[id]/refund

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, logAdminAction } from '@/lib/middleware/adminAuth';
import { createFullRefund } from '@/lib/payments/refundService';
import { prisma } from '@/lib/db';

/**
 * POST /api/admin/bookings/[id]/refund
 * Process a full refund for a booking
 * 
 * @requires Admin authentication
 * @body { reason?: string }
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
          { success: false, error: 'Booking already refunded' },
          { status: 400 }
        );
      }

      if (booking.status === 'PAYMENT_FAILED') {
        return NextResponse.json(
          { success: false, error: 'Cannot refund a booking with failed payment' },
          { status: 400 }
        );
      }

      // Get optional reason from request body
      const body = await request.json().catch(() => ({}));
      const reason = body.reason || 'Full refund processed by admin';

      // Process the refund
      const result = await createFullRefund(bookingId, reason, admin.userId);

      if (!result.success) {
        return NextResponse.json(
          { success: false, error: result.error },
          { status: 400 }
        );
      }

      // Log admin action
      await logAdminAction({
        userId: admin.userId,
        action: 'BOOKING_REFUND_FULL',
        category: 'REFUND',
        details: {
          bookingId,
          bookingReference: booking.bookingReference,
          refundId: result.refundId,
          refundReference: result.refundReference,
          amount: result.amount,
          reason,
          customerEmail: booking.user?.email,
        },
        ipAddress: request.headers.get('x-forwarded-for') || undefined,
        userAgent: request.headers.get('user-agent') || undefined,
      });

      return NextResponse.json({
        success: true,
        message: 'Full refund processed successfully',
        data: {
          refundId: result.refundId,
          refundReference: result.refundReference,
          amount: result.amount,
          status: result.status,
          bookingReference: booking.bookingReference,
        },
      });
    } catch (error: any) {
      console.error('Full refund API error:', error);

      return NextResponse.json(
        {
          success: false,
          error: 'Failed to process refund',
          message: error.message,
        },
        { status: 500 }
      );
    }
  });
}

/**
 * GET /api/admin/bookings/[id]/refund
 * Get refund eligibility and available amount for a booking
 * 
 * @requires Admin authentication
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return requireAdmin(request, async (req, admin) => {
    try {
      const bookingId = params.id;

      // Get booking details
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        select: {
          id: true,
          bookingReference: true,
          status: true,
          totalAmount: true,
          refunds: {
            select: {
              id: true,
              refundReference: true,
              refundType: true,
              status: true,
              approvedAmount: true,
              createdAt: true,
            },
            orderBy: {
              createdAt: 'desc',
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

      // Calculate refunded amount
      const totalRefunded = booking.refunds
        .filter((r) => r.status === 'COMPLETED' || r.status === 'PROCESSING')
        .reduce((sum, r) => sum + (r.approvedAmount || 0), 0);

      const availableAmount = (booking.totalAmount || 0) - totalRefunded;

      // Determine eligibility
      const canRefund =
        booking.status !== 'REFUNDED' &&
        booking.status !== 'PAYMENT_FAILED' &&
        availableAmount > 0;

      return NextResponse.json({
        success: true,
        data: {
          bookingId: booking.id,
          bookingReference: booking.bookingReference,
          status: booking.status,
          totalAmount: booking.totalAmount,
          totalRefunded,
          availableAmount,
          canRefund,
          refundHistory: booking.refunds,
        },
      });
    } catch (error: any) {
      console.error('Get refund info error:', error);

      return NextResponse.json(
        {
          success: false,
          error: 'Failed to get refund information',
          message: error.message,
        },
        { status: 500 }
      );
    }
  });
}
