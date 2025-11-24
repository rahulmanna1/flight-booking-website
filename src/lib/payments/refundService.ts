// Refund Service for Flight Booking Platform
// Handles full refunds, partial refunds, and Stripe webhook integration

import Stripe from 'stripe';
import { prisma } from '@/lib/db';

// Initialize Stripe
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripe = stripeSecretKey ? new Stripe(stripeSecretKey, {
  apiVersion: '2025-02-24.acacia',
  appInfo: {
    name: 'Flight Booking Website',
    version: '1.0.0',
  },
  maxNetworkRetries: 3,
  timeout: 10000,
}) : null;

export interface RefundOptions {
  bookingId: string;
  reason?: string;
  refundType: 'full' | 'partial';
  amount?: number; // Required for partial refunds
  notifyUser?: boolean;
}

export interface RefundResult {
  success: boolean;
  refundId: string;
  refundReference?: string;
  amount: number;
  status: string;
  error?: string;
}

/**
 * Create a full refund for a booking
 */
export async function createFullRefund(
  bookingId: string,
  reason?: string,
  adminId?: string
): Promise<RefundResult> {
  try {
    console.log(`💰 Creating full refund for booking: ${bookingId}`);

    // Get booking with payment info and user details
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { user: true },
    });

    if (!booking) {
      return {
        success: false,
        refundId: '',
        amount: 0,
        status: 'failed',
        error: 'Booking not found',
      };
    }

    // Check if booking is already cancelled or refunded
    if (booking.status === 'CANCELLED' || booking.status === 'REFUNDED') {
      return {
        success: false,
        refundId: '',
        amount: 0,
        status: 'failed',
        error: `Booking already ${booking.status.toLowerCase()}`,
      };
    }

    // Extract payment intent ID from payment info
    const paymentInfo = JSON.parse(booking.paymentInfo);
    const paymentIntentId = paymentInfo.paymentIntentId;

    if (!paymentIntentId) {
      return {
        success: false,
        refundId: '',
        amount: 0,
        status: 'failed',
        error: 'Payment intent ID not found in booking',
      };
    }

    if (!stripe) {
      return {
        success: false,
        refundId: '',
        amount: 0,
        status: 'failed',
        error: 'Stripe not configured',
      };
    }

    // Create Stripe refund
    const stripeRefund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      reason: 'requested_by_customer',
      metadata: {
        bookingId,
        bookingReference: booking.bookingReference,
        refundReason: reason || 'Full refund',
        refundType: 'FULL',
        processedBy: adminId || 'system',
      },
    });

    // Generate unique refund reference
    const refundReference = `REF-${booking.bookingReference}-${Date.now()}`;

    // Create refund record in database
    const refund = await prisma.refund.create({
      data: {
        refundReference,
        bookingId,
        userId: booking.userId,
        status: stripeRefund.status === 'succeeded' ? 'COMPLETED' : 'PROCESSING',
        reason: reason || 'Full refund requested',
        refundType: 'FULL',
        requestedAmount: booking.totalAmount || 0,
        approvedAmount: stripeRefund.amount / 100, // Convert cents to dollars
        netRefundAmount: stripeRefund.amount / 100,
        transactionId: stripeRefund.id,
        originalPaymentMethod: paymentInfo.paymentMethod || 'card',
        refundMethod: 'ORIGINAL_METHOD',
        processedBy: adminId,
        processedAt: new Date(),
        completedAt: stripeRefund.status === 'succeeded' ? new Date() : null,
        metadata: JSON.stringify({
          stripeRefundId: stripeRefund.id,
          stripeStatus: stripeRefund.status,
          currency: stripeRefund.currency,
        }),
      },
    });

    // Update booking status
    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: stripeRefund.status === 'succeeded' ? 'REFUNDED' : 'CANCELLED',
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'FULL_REFUND_CREATED',
        category: 'REFUND',
        severity: 'INFO',
        userId: adminId,
        details: JSON.stringify({
          bookingId,
          bookingReference: booking.bookingReference,
          refundId: stripeRefund.id,
          refundReference,
          amount: stripeRefund.amount / 100,
          reason,
        }),
      },
    });

    console.log(`✅ Full refund created: ${stripeRefund.id}`);

    // Send email notification (import dynamically to avoid circular dependencies)
    try {
      const { sendRefundConfirmationEmail } = await import('@/lib/services/emailService');
      if (booking.user?.email) {
        await sendRefundConfirmationEmail(
          booking.user.email,
          booking.bookingReference,
          stripeRefund.amount / 100,
          stripeRefund.currency.toUpperCase(),
          'FULL'
        );
      }
    } catch (emailError) {
      console.warn('⚠️ Failed to send refund email:', emailError);
      // Don't fail the refund if email fails
    }

    return {
      success: true,
      refundId: stripeRefund.id,
      refundReference,
      amount: stripeRefund.amount / 100,
      status: stripeRefund.status,
    };
  } catch (error: any) {
    console.error('❌ Full refund error:', error);
    
    // Log error in audit log
    try {
      await prisma.auditLog.create({
        data: {
          action: 'FULL_REFUND_FAILED',
          category: 'REFUND',
          severity: 'ERROR',
          details: JSON.stringify({
            bookingId,
            error: error.message,
            stack: error.stack,
          }),
        },
      });
    } catch (logError) {
      console.error('Failed to log audit:', logError);
    }

    return {
      success: false,
      refundId: '',
      amount: 0,
      status: 'failed',
      error: error.message || 'Failed to create refund',
    };
  }
}

/**
 * Create a partial refund for a booking
 */
export async function createPartialRefund(
  bookingId: string,
  refundAmount: number,
  reason?: string,
  adminId?: string
): Promise<RefundResult> {
  try {
    console.log(`💰 Creating partial refund for booking: ${bookingId}, amount: ${refundAmount}`);

    // Validate refund amount
    if (refundAmount <= 0) {
      return {
        success: false,
        refundId: '',
        amount: 0,
        status: 'failed',
        error: 'Refund amount must be greater than zero',
      };
    }

    // Get booking with payment info
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { user: true },
    });

    if (!booking) {
      return {
        success: false,
        refundId: '',
        amount: 0,
        status: 'failed',
        error: 'Booking not found',
      };
    }

    // Check total booking amount
    if (refundAmount > (booking.totalAmount || 0)) {
      return {
        success: false,
        refundId: '',
        amount: 0,
        status: 'failed',
        error: 'Refund amount exceeds booking total',
      };
    }

    // Check existing refunds
    const existingRefunds = await prisma.refund.findMany({
      where: {
        bookingId,
        status: { in: ['COMPLETED', 'PROCESSING', 'APPROVED'] },
      },
    });

    const totalRefunded = existingRefunds.reduce(
      (sum, r) => sum + (r.approvedAmount || 0),
      0
    );

    if (totalRefunded + refundAmount > (booking.totalAmount || 0)) {
      return {
        success: false,
        refundId: '',
        amount: 0,
        status: 'failed',
        error: `Refund would exceed available balance. Already refunded: $${totalRefunded}`,
      };
    }

    // Extract payment intent ID
    const paymentInfo = JSON.parse(booking.paymentInfo);
    const paymentIntentId = paymentInfo.paymentIntentId;

    if (!paymentIntentId) {
      return {
        success: false,
        refundId: '',
        amount: 0,
        status: 'failed',
        error: 'Payment intent ID not found',
      };
    }

    if (!stripe) {
      return {
        success: false,
        refundId: '',
        amount: 0,
        status: 'failed',
        error: 'Stripe not configured',
      };
    }

    // Create Stripe partial refund
    const stripeRefund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: Math.round(refundAmount * 100), // Convert to cents
      reason: 'requested_by_customer',
      metadata: {
        bookingId,
        bookingReference: booking.bookingReference,
        refundReason: reason || 'Partial refund',
        refundType: 'PARTIAL',
        processedBy: adminId || 'system',
      },
    });

    // Generate refund reference
    const refundReference = `REF-${booking.bookingReference}-${Date.now()}`;

    // Create refund record
    const refund = await prisma.refund.create({
      data: {
        refundReference,
        bookingId,
        userId: booking.userId,
        status: stripeRefund.status === 'succeeded' ? 'COMPLETED' : 'PROCESSING',
        reason: reason || 'Partial refund requested',
        refundType: 'PARTIAL',
        requestedAmount: refundAmount,
        approvedAmount: stripeRefund.amount / 100,
        netRefundAmount: stripeRefund.amount / 100,
        transactionId: stripeRefund.id,
        originalPaymentMethod: paymentInfo.paymentMethod || 'card',
        refundMethod: 'ORIGINAL_METHOD',
        processedBy: adminId,
        processedAt: new Date(),
        completedAt: stripeRefund.status === 'succeeded' ? new Date() : null,
        metadata: JSON.stringify({
          stripeRefundId: stripeRefund.id,
          stripeStatus: stripeRefund.status,
          currency: stripeRefund.currency,
        }),
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'PARTIAL_REFUND_CREATED',
        category: 'REFUND',
        severity: 'INFO',
        userId: adminId,
        details: JSON.stringify({
          bookingId,
          bookingReference: booking.bookingReference,
          refundId: stripeRefund.id,
          refundReference,
          amount: stripeRefund.amount / 100,
          reason,
        }),
      },
    });

    console.log(`✅ Partial refund created: ${stripeRefund.id}`);

    // Send email notification
    try {
      const { sendRefundConfirmationEmail } = await import('@/lib/services/emailService');
      if (booking.user?.email) {
        await sendRefundConfirmationEmail(
          booking.user.email,
          booking.bookingReference,
          stripeRefund.amount / 100,
          stripeRefund.currency.toUpperCase(),
          'PARTIAL'
        );
      }
    } catch (emailError) {
      console.warn('⚠️ Failed to send refund email:', emailError);
    }

    return {
      success: true,
      refundId: stripeRefund.id,
      refundReference,
      amount: stripeRefund.amount / 100,
      status: stripeRefund.status,
    };
  } catch (error: any) {
    console.error('❌ Partial refund error:', error);

    // Log error
    try {
      await prisma.auditLog.create({
        data: {
          action: 'PARTIAL_REFUND_FAILED',
          category: 'REFUND',
          severity: 'ERROR',
          details: JSON.stringify({
            bookingId,
            amount: refundAmount,
            error: error.message,
          }),
        },
      });
    } catch (logError) {
      console.error('Failed to log audit:', logError);
    }

    return {
      success: false,
      refundId: '',
      amount: 0,
      status: 'failed',
      error: error.message || 'Failed to create partial refund',
    };
  }
}

/**
 * Handle Stripe refund webhook events
 */
export async function handleRefundWebhook(event: Stripe.Event): Promise<void> {
  try {
    const refund = event.data.object as Stripe.Refund;
    const refundId = refund.id;
    const bookingId = refund.metadata?.bookingId;

    console.log(`📨 Processing refund webhook: ${event.type} for ${refundId}`);

    if (!bookingId) {
      console.error('⚠️ No booking ID in refund metadata');
      return;
    }

    // Find the refund record by transaction ID (Stripe refund ID)
    const refundRecord = await prisma.refund.findFirst({
      where: { transactionId: refundId },
    });

    if (!refundRecord) {
      console.warn(`⚠️ Refund record not found for Stripe refund ${refundId}`);
      return;
    }

    // Map Stripe status to our status
    let newStatus = refundRecord.status;
    let completedAt = refundRecord.completedAt;

    switch (refund.status) {
      case 'succeeded':
        newStatus = 'COMPLETED';
        completedAt = new Date();
        break;
      case 'pending':
        newStatus = 'PROCESSING';
        break;
      case 'failed':
      case 'canceled':
        newStatus = 'REJECTED';
        break;
    }

    // Update refund status
    await prisma.refund.update({
      where: { id: refundRecord.id },
      data: {
        status: newStatus,
        completedAt,
        metadata: JSON.stringify({
          ...(refundRecord.metadata ? JSON.parse(refundRecord.metadata as string) : {}),
          stripeStatus: refund.status,
          webhookProcessedAt: new Date().toISOString(),
        }),
      },
    });

    // If refund succeeded and it was a full refund, update booking status
    if (refund.status === 'succeeded' && refundRecord.refundType === 'FULL') {
      await prisma.booking.update({
        where: { id: bookingId },
        data: { status: 'REFUNDED' },
      });
    }

    // Log the webhook event
    await prisma.auditLog.create({
      data: {
        action: 'REFUND_WEBHOOK_PROCESSED',
        category: 'REFUND',
        severity: 'INFO',
        details: JSON.stringify({
          eventType: event.type,
          refundId,
          bookingId,
          status: refund.status,
          amount: refund.amount / 100,
        }),
      },
    });

    console.log(`✅ Refund webhook processed: ${refundId} -> ${newStatus}`);
  } catch (error: any) {
    console.error('❌ Refund webhook error:', error);

    // Log error
    try {
      await prisma.auditLog.create({
        data: {
          action: 'REFUND_WEBHOOK_FAILED',
          category: 'REFUND',
          severity: 'ERROR',
          details: JSON.stringify({
            eventType: event.type,
            error: error.message,
            eventId: event.id,
          }),
        },
      });
    } catch (logError) {
      console.error('Failed to log webhook error:', logError);
    }

    throw error;
  }
}

/**
 * Get refund history for a booking
 */
export async function getRefundHistory(bookingId: string) {
  return await prisma.refund.findMany({
    where: { bookingId },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Calculate available refund amount for a booking
 */
export async function calculateAvailableRefundAmount(
  bookingId: string
): Promise<{ available: number; totalRefunded: number; bookingTotal: number }> {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
  });

  if (!booking) {
    throw new Error('Booking not found');
  }

  const bookingTotal = booking.totalAmount || 0;

  // Get all successful refunds
  const existingRefunds = await prisma.refund.findMany({
    where: {
      bookingId,
      status: { in: ['COMPLETED', 'PROCESSING', 'APPROVED'] },
    },
  });

  const totalRefunded = existingRefunds.reduce(
    (sum, r) => sum + (r.approvedAmount || 0),
    0
  );

  return {
    available: Math.max(0, bookingTotal - totalRefunded),
    totalRefunded,
    bookingTotal,
  };
}

/**
 * Get refund details by reference
 */
export async function getRefundByReference(refundReference: string) {
  return await prisma.refund.findUnique({
    where: { refundReference },
    include: {
      booking: {
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      },
    },
  });
}

/**
 * Cancel a pending refund request
 */
export async function cancelRefundRequest(
  refundId: string,
  reason: string,
  adminId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const refund = await prisma.refund.findUnique({
      where: { id: refundId },
    });

    if (!refund) {
      return { success: false, error: 'Refund not found' };
    }

    if (refund.status !== 'PENDING' && refund.status !== 'UNDER_REVIEW') {
      return {
        success: false,
        error: `Cannot cancel refund with status ${refund.status}`,
      };
    }

    await prisma.refund.update({
      where: { id: refundId },
      data: {
        status: 'CANCELLED',
        adminNotes: reason,
        processedBy: adminId,
        processedAt: new Date(),
      },
    });

    // Log the cancellation
    await prisma.auditLog.create({
      data: {
        action: 'REFUND_CANCELLED',
        category: 'REFUND',
        severity: 'INFO',
        userId: adminId,
        details: JSON.stringify({
          refundId,
          refundReference: refund.refundReference,
          reason,
        }),
      },
    });

    return { success: true };
  } catch (error: any) {
    console.error('❌ Cancel refund error:', error);
    return { success: false, error: error.message };
  }
}
