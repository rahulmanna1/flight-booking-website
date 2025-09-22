import { NextRequest, NextResponse } from 'next/server';
import { BookingService, CreateBookingRequest } from '@/services/BookingService';
import { EnhancedBookingService, RealBookingRequest } from '@/lib/bookingProviders';
import { PrismaAuthService as AuthService, verifyAuth } from '@/lib/auth-prisma';

// POST - Create new booking
export async function POST(request: NextRequest) {
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
    
    // Parse request body
    const requestBody = await request.json();
    
    console.log('🎯 Enhanced booking request received:', { userId, ...requestBody });
    
    // Create enhanced booking request object
    const enhancedBookingRequest: RealBookingRequest = {
      userId,
      ...requestBody
    };

    // Validate the booking request
    const validation = BookingService.validateBookingRequest(enhancedBookingRequest);
    if (!validation.isValid) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid booking data',
          details: validation.errors 
        },
        { status: 400 }
      );
    }

    try {
      // Create the enhanced booking with real airline integration
      const enhancedBooking = await EnhancedBookingService.createEnhancedBooking(enhancedBookingRequest);
      
      console.log(`✅ Enhanced booking created: ${enhancedBooking.bookingReference}`);
      
      // Prepare enhanced response
      const response = {
        success: true,
        data: enhancedBooking,
        message: 'Booking created successfully',
        features: {
          realTimeData: !!enhancedBooking.airlineBookingReference,
          eTickets: enhancedBooking.eTicketNumbers?.length || 0,
          checkInAvailable: enhancedBooking.checkInStatus?.available || false,
          flightStatus: enhancedBooking.realTimeStatus?.flightStatus || 'unknown',
          refundPolicy: {
            refundable: enhancedBooking.cancellationPolicy?.refundable || false,
            changeable: enhancedBooking.modificationPolicy?.changeable || false
          }
        }
      };
      
      return NextResponse.json(response);
      
    } catch (enhancedError: any) {
      console.error('❌ Enhanced booking creation failed:', enhancedError.message);
      
      // Fallback to standard booking if enhanced booking fails
      console.log('🔄 Falling back to standard booking creation...');
      const fallbackBooking = await BookingService.createBooking(enhancedBookingRequest);
      
      return NextResponse.json({
        success: true,
        data: fallbackBooking,
        message: 'Booking created successfully (standard mode)',
        warning: 'Enhanced features temporarily unavailable'
      });
    }

  } catch (error: any) {
    console.error('Booking creation error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to create booking' 
      },
      { status: 500 }
    );
  }
}

// GET - Get user's bookings
export async function GET(request: NextRequest) {
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
    const { searchParams } = new URL(request.url);
    
    // Parse pagination parameters
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    
    // Get user's enhanced bookings with real-time data
    const result = await BookingService.getUserBookings(userId, limit, offset);
    
    // Enhance bookings with real-time status if available
    const enhancedBookings = await Promise.all(
      result.bookings.map(async (booking) => {
        try {
          const flightStatus = await EnhancedBookingService.getFlightStatus(booking.id);
          return {
            ...booking,
            realTimeStatus: flightStatus,
            enhanced: true
          };
        } catch (error) {
          return {
            ...booking,
            enhanced: false
          };
        }
      })
    );
    
    return NextResponse.json({
      success: true,
      data: {
        ...result,
        bookings: enhancedBookings
      },
      metadata: {
        enhancedFeatures: {
          realTimeStatus: true,
          flightUpdates: true,
          checkInStatus: true
        }
      }
    });

  } catch (error: any) {
    console.error('Get bookings error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to fetch bookings' 
      },
      { status: 500 }
    );
  }
}