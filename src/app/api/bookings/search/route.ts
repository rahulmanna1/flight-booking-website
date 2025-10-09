import { NextRequest, NextResponse } from 'next/server';
import { BookingService } from '@/services/BookingService';
import { verifyAuth } from '@/lib/auth-prisma';
import rateLimit from '@/lib/security/rateLimit';
import { getClientIP } from '@/lib/utils/network';

// GET - Search bookings with filters
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Rate limiting for GET requests
    const clientIP = getClientIP({
      headers: {
        get: (name: string) => request.headers.get(name)
      }
    } as any);
    
    const rateLimitResult = await rateLimit({
      key: `booking_search_${clientIP}`,
      limit: 30, // 30 requests per hour for searching bookings
      window: 60 * 60 * 1000 // 1 hour
    });
    
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Too many requests. Please try again later.',
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
    const { searchParams } = new URL(request.url);
    
    // Parse pagination parameters
    const page = Math.max(parseInt(searchParams.get('page') || '1'), 1);
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '10'), 1), 50);
    const offset = (page - 1) * limit;
    
    // Parse sorting parameters
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    
    // Get the user's bookings (for now, we'll use the existing getUserBookings method)
    // In the future, this could be enhanced to support more complex filtering
    const result = await BookingService.getUserBookings(userId, limit, offset);
    
    const processingTime = Date.now() - startTime;
    
    return NextResponse.json({
      success: true,
      data: {
        bookings: result.bookings,
        total: result.total,
        page,
        totalPages: Math.ceil(result.total / limit),
        hasNext: result.hasMore,
        hasPrevious: page > 1,
        hasMore: result.hasMore
      },
      metadata: {
        processingTime,
        pagination: {
          page,
          limit,
          offset,
          total: result.total,
          hasMore: result.hasMore
        },
        sorting: {
          sortBy,
          sortOrder
        }
      }
    });

  } catch (error: any) {
    const processingTime = Date.now() - startTime;
    console.error('❌ Booking search error:', {
      message: error.message,
      processingTime,
      userId: 'hidden' // Don't log sensitive data
    });
    
    let statusCode = 500;
    let errorMessage = 'Failed to search bookings';
    
    if (error.message.includes('authentication') || error.message.includes('unauthorized')) {
      statusCode = 401;
      errorMessage = 'Authentication required';
    } else if (error.message.includes('not found')) {
      statusCode = 404;
      errorMessage = 'Bookings not found';
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage,
        timestamp: new Date().toISOString(),
        metadata: {
          processingTime
        }
      },
      { status: statusCode }
    );
  }
}