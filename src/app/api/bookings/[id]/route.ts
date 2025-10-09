import { NextRequest, NextResponse } from 'next/server';
import { BookingService } from '@/services/BookingService';
import { EnhancedBookingService } from '@/lib/bookingProviders';
import { BookingStatus } from '@/types/booking';
import { verifyAuth } from '@/lib/auth-prisma';

// GET - Get specific booking
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const bookingId = (await params).id;
    
    if (!bookingId) {
      return NextResponse.json(
        { success: false, error: 'Booking ID is required' },
        { status: 400 }
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
    
    // Get enhanced booking with real-time data
    const enhancedBooking = await EnhancedBookingService.getEnhancedBooking(bookingId, userId);

    if (!enhancedBooking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found or access denied' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: enhancedBooking,
      features: {
        realTimeStatus: !!enhancedBooking.realTimeStatus,
        airlineConfirmation: !!enhancedBooking.airlineBookingReference,
        eTickets: enhancedBooking.eTicketNumbers?.length || 0,
        checkInAvailable: enhancedBooking.checkInStatus?.available || false,
        boardingPasses: enhancedBooking.boardingPasses?.length || 0,
        cancellationPolicy: enhancedBooking.cancellationPolicy,
        modificationPolicy: enhancedBooking.modificationPolicy
      }
    });

  } catch (error: any) {
    console.error('Get booking error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to fetch booking' 
      },
      { status: 500 }
    );
  }
}

// PUT - Update booking status
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const bookingId = (await params).id;
    
    if (!bookingId) {
      return NextResponse.json(
        { success: false, error: 'Booking ID is required' },
        { status: 400 }
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
    const { status } = await request.json();
    
    // Validate status
    const validStatuses: BookingStatus[] = ['PENDING_PAYMENT', 'PAYMENT_FAILED', 'CONFIRMED', 'TICKETED', 'CHECKED_IN', 'BOARDING', 'DEPARTED', 'COMPLETED', 'CANCELLED', 'REFUNDED', 'EXPIRED'];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid status. Valid options: ' + validStatuses.join(', ')
        },
        { status: 400 }
      );
    }

    // Update booking status
    const updatedBooking = await BookingService.updateBookingStatus(bookingId, status, userId);

    if (!updatedBooking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found or access denied' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedBooking,
      message: 'Booking status updated successfully'
    });

  } catch (error: any) {
    console.error('Update booking error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to update booking' 
      },
      { status: 500 }
    );
  }
}

// DELETE - Cancel booking
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const bookingId = (await params).id;
    
    if (!bookingId) {
      return NextResponse.json(
        { success: false, error: 'Booking ID is required' },
        { status: 400 }
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
    
    console.log(`❌ Enhanced booking cancellation request for ${bookingId}`);
    
    // Cancel booking with enhanced system (includes real airline cancellation if possible)
    const cancellationResult = await EnhancedBookingService.cancelEnhancedBooking(bookingId, userId);

    if (!cancellationResult.success) {
      return NextResponse.json(
        { success: false, error: 'Booking not found or could not be cancelled' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Booking cancelled successfully',
      data: {
        bookingId,
        refundAmount: cancellationResult.refundAmount || 0,
        cancellationFee: cancellationResult.cancellationFee || 0,
        refundTimeframe: cancellationResult.refundTimeframe || 'Not specified',
        refundMethod: 'Original payment method'
      }
    });

  } catch (error: any) {
    console.error('Cancel booking error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to cancel booking' 
      },
      { status: 500 }
    );
  }
}