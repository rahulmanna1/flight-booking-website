// API endpoint for processing refunds
// Handles secure refund processing with validation and audit trails

import { NextRequest, NextResponse } from 'next/server';
import StripePaymentService, { RefundRequest } from '@/lib/payments/stripeService';
import { verifyAuth } from '@/lib/auth-prisma';
import { BookingService } from '@/services/BookingService';
import rateLimit from '@/lib/security/rateLimit';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Rate limiting for refund requests
    const clientIP = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    
    const rateLimitResult = await rateLimit({
      key: `refund_${clientIP}`,
      limit: 5, // 5 refund requests per hour per IP
      window: 60 * 60 * 1000 // 1 hour
    });
    
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Too many refund requests. Please try again later.',
          retryAfter: rateLimitResult.resetTime 
        },
        { status: 429 }
      );
    }

    // Verify authentication
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const authResult = verifyAuth(token);
    
    if (!authResult) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const userId = authResult.userId;

    // Parse request body
    let requestBody: any;
    try {
      const bodyText = await request.text();
      
      if (bodyText.length > 5120) { // 5KB limit for refund requests
        return NextResponse.json(
          { success: false, error: 'Request payload too large' },
          { status: 413 }
        );
      }
      
      requestBody = JSON.parse(bodyText);
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    // Validate required fields
    const { 
      bookingId, 
      paymentIntentId, 
      amount, 
      reason, 
      reasonDescription 
    } = requestBody;
    
    if (!bookingId) {
      return NextResponse.json(
        { success: false, error: 'Booking ID is required' },
        { status: 400 }
      );
    }

    if (!paymentIntentId) {
      return NextResponse.json(
        { success: false, error: 'Payment intent ID is required' },
        { status: 400 }
      );
    }

    // Validate refund reason
    const validReasons = ['duplicate', 'fraudulent', 'requested_by_customer'];
    if (reason && !validReasons.includes(reason)) {
      return NextResponse.json(
        { success: false, error: 'Invalid refund reason' },
        { status: 400 }
      );
    }

    console.log('💸 Processing refund request...', {
      userId,
      bookingId,
      paymentIntentId,
      amount,
      reason
    });

    // Verify user owns the booking
    const booking = await BookingService.getBooking(bookingId, userId);
    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found or access denied' },
        { status: 404 }
      );
    }

    // Check if booking is eligible for refund
    const bookingStatus = booking.status;
    const eligibleStatuses = ['CONFIRMED', 'PENDING'];
    
    if (!eligibleStatuses.includes(bookingStatus)) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Refund not available for bookings with status: ${bookingStatus}` 
        },
        { status: 400 }
      );
    }

    // Validate refund amount if provided
    let refundAmount = amount;
    if (refundAmount !== undefined) {
      if (typeof refundAmount !== 'number' || refundAmount <= 0) {
        return NextResponse.json(
          { success: false, error: 'Invalid refund amount' },
          { status: 400 }
        );
      }

      // Ensure refund amount doesn't exceed original payment
      const originalAmount = booking.pricing?.total * 100; // Convert to cents
      if (refundAmount > originalAmount) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Refund amount cannot exceed original payment amount' 
          },
          { status: 400 }
        );
      }
    }

    // Create refund request
    const refundRequest: RefundRequest = {
      paymentIntentId,
      amount: refundAmount,
      reason: reason || 'requested_by_customer',
      metadata: {
        bookingId,
        userId,
        requestedBy: 'customer',
        reasonDescription: reasonDescription || 'Customer requested refund',
        timestamp: new Date().toISOString()
      }
    };

    // Process refund with Stripe
    const refundResult = await StripePaymentService.processRefund(refundRequest);
    
    if (!refundResult.success) {
      console.error('❌ Refund processing failed:', refundResult.error);
      return NextResponse.json(
        { 
          success: false, 
          error: refundResult.error?.message || 'Failed to process refund'
        },
        { status: 400 }
      );
    }

    // Update booking status
    const updatedBooking = await BookingService.updateBookingStatus(
      bookingId, 
      'CANCELLED', 
      userId
    );

    if (!updatedBooking) {
      console.warn('⚠️ Refund processed but failed to update booking status');
    }

    const processingTime = Date.now() - startTime;

    console.log(`✅ Refund processed successfully: ${refundResult.refund?.id} in ${processingTime}ms`);

    // Log refund for audit trail
    console.log('📊 Refund audit trail:', {
      refundId: refundResult.refund?.id,
      bookingId,
      userId,
      amount: refundResult.refund?.amount,
      reason: refundResult.refund?.reason,
      status: refundResult.refund?.status,
      processingTime,
      timestamp: new Date().toISOString()
    });

    // Return success response
    return NextResponse.json({
      success: true,
      refund: {
        id: refundResult.refund?.id,
        amount: refundResult.refund?.amount,
        status: refundResult.refund?.status,
        reason: refundResult.refund?.reason
      },
      booking: {
        id: bookingId,
        status: 'CANCELLED'
      },
      metadata: {
        processingTime,
        timestamp: new Date().toISOString(),
        expectedRefundTime: '5-10 business days'
      }
    });

  } catch (error: any) {
    const processingTime = Date.now() - startTime;
    console.error('❌ Refund API error:', {
      message: error.message,
      processingTime,
      stack: error.stack?.substring(0, 500)
    });
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        timestamp: new Date().toISOString(),
        metadata: {
          processingTime
        }
      },
      { status: 500 }
    );
  }
}

// GET endpoint to check refund status
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const authResult = verifyAuth(token);
    
    if (!authResult) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const userId = authResult.userId;

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get('booking_id');
    
    if (!bookingId) {
      return NextResponse.json(
        { success: false, error: 'Booking ID is required' },
        { status: 400 }
      );
    }

    // Verify user owns the booking
    const booking = await BookingService.getBooking(bookingId, userId);
    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found or access denied' },
        { status: 404 }
      );
    }

    const processingTime = Date.now() - startTime;

    // Return refund eligibility and status
    return NextResponse.json({
      success: true,
      booking: {
        id: bookingId,
        status: booking.status,
        totalAmount: booking.pricing?.total
      },
      refundEligibility: {
        eligible: ['CONFIRMED', 'PENDING'].includes(booking.status),
        reason: booking.status === 'CANCELLED' ? 'Booking already cancelled' :
                booking.status === 'COMPLETED' ? 'Flight already completed' :
                'Eligible for refund'
      },
      metadata: {
        processingTime,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error: any) {
    const processingTime = Date.now() - startTime;
    console.error('❌ Refund status API error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        metadata: { processingTime }
      },
      { status: 500 }
    );
  }
}