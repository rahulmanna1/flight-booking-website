import { NextRequest, NextResponse } from 'next/server';
import { BookingService, CreateBookingRequest } from '@/services/BookingService';
import { EnhancedBookingService, RealBookingRequest } from '@/lib/bookingProviders';
import { PrismaAuthService as AuthService, verifyAuth } from '@/lib/auth-prisma';
import { BookingSecurityValidator } from '@/lib/security/bookingValidation';
import rateLimit from '@/lib/security/rateLimit';
import CaptchaService from '@/lib/security/captcha';
import { getClientIP } from '@/lib/utils/network';
import { logSecurityEvent } from '@/lib/security/audit';

// POST - Create new booking with enhanced security
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Get client IP
    const clientIP = getClientIP({
      headers: {
        get: (name: string) => request.headers.get(name)
      }
    } as any);
    
    const rateLimitResult = await rateLimit({
      key: `booking_${clientIP}`,
      limit: 5, // 5 booking attempts per hour per IP
      window: 60 * 60 * 1000 // 1 hour
    });
    
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Too many booking attempts. Please try again later.',
          retryAfter: rateLimitResult.resetTime 
        },
        { status: 429 }
      );
    }

    // Verify authentication
    // Skip authentication in development mode when DISABLE_CAPTCHA_DEV=true
    const isDevelopment = process.env.NODE_ENV === 'development';
    const skipAuth = isDevelopment && process.env.DISABLE_CAPTCHA_DEV === 'true';
    
    let userId: string;
    
    if (skipAuth) {
      // Use a mock user ID for development
      userId = 'cmfvdnjlz0001jp04aithzvql'; // Your demo user ID
      console.log('🔓 Authentication disabled in development mode for booking');
    } else {
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

      userId = authResult.userId;
    }
    
    // Parse request body with size limits
    let requestBody: any;
    try {
      const bodyText = await request.text();
      
      // Check request size (max 1MB)
      if (bodyText.length > 1024 * 1024) {
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
    
    // CAPTCHA verification for booking creation
    // Skip CAPTCHA in development mode when DISABLE_CAPTCHA_DEV=true
    const skipCaptcha = isDevelopment && process.env.DISABLE_CAPTCHA_DEV === 'true';
    
    let captchaResult: {
      success: boolean;
      score?: number;
      riskLevel?: 'low' | 'medium' | 'high';
      action?: string;
      hostname?: string;
      error?: string;
      shouldChallenge?: boolean;
    } = { 
      success: true, 
      score: 0.9, 
      riskLevel: 'low',
      action: 'booking',
      hostname: 'localhost'
    };
    
    if (skipCaptcha) {
      console.log('🔓 CAPTCHA disabled in development mode for booking');
    } else {
      const captchaToken = requestBody.captchaToken || 
                          request.headers.get('x-captcha-token');
      
      if (!captchaToken) {
        await logSecurityEvent({
          type: 'CAPTCHA_TOKEN_MISSING',
          severity: 'medium',
          details: {
            action: 'booking',
            endpoint: '/api/bookings',
            clientIP,
            userId,
            method: 'POST'
          },
          metadata: {
            userAgent: request.headers.get('user-agent'),
            endpoint: '/api/bookings'
          }
        });
        
        return NextResponse.json(
          { 
            success: false, 
            error: 'CAPTCHA verification required for booking creation',
            code: 'CAPTCHA_REQUIRED'
          },
          { status: 400 }
        );
      }
      
      console.log('🔐 Verifying CAPTCHA for booking creation...');
      
      captchaResult = await CaptchaService.verifyToken(
        captchaToken,
        'booking',
        clientIP
      );
      
      if (!captchaResult.success) {
        console.warn('⚠️ CAPTCHA verification failed for booking:', captchaResult.error);
        
        await logSecurityEvent({
          type: 'CAPTCHA_VERIFICATION_FAILED',
          severity: captchaResult.riskLevel === 'high' ? 'high' : 'medium',
          details: {
            action: 'booking',
            score: captchaResult.score,
            riskLevel: captchaResult.riskLevel,
            clientIP,
            userId,
            error: captchaResult.error
          },
          metadata: {
            userAgent: request.headers.get('user-agent'),
            endpoint: '/api/bookings'
          }
        });
        
        return NextResponse.json(
          {
            success: false,
            error: captchaResult.error || 'CAPTCHA verification failed',
            code: 'CAPTCHA_VERIFICATION_FAILED',
            score: captchaResult.score,
            riskLevel: captchaResult.riskLevel,
            shouldRetry: captchaResult.shouldChallenge
          },
          { status: 403 }
        );
      }
    }
    
    console.log(`✅ CAPTCHA verification successful for booking, score: ${captchaResult.score}`);
    
    await logSecurityEvent({
      type: 'CAPTCHA_VERIFICATION_SUCCESS',
      severity: 'low',
      details: {
        action: 'booking',
        score: captchaResult.score,
        riskLevel: captchaResult.riskLevel,
        clientIP,
        userId
      },
      metadata: {
        userAgent: request.headers.get('user-agent'),
        endpoint: '/api/bookings'
      }
    });
    
    console.log('🎯 Secure booking request received:', { 
      userId, 
      passengerCount: requestBody.passengers?.length,
      flightId: requestBody.flightData?.id,
      totalAmount: requestBody.pricing?.total
    });
    
    // Create enhanced booking request object
    const enhancedBookingRequest: RealBookingRequest = {
      userId,
      ...requestBody
    };

    // Enhanced security validation
    const securityValidation = BookingSecurityValidator.validateBookingRequest(enhancedBookingRequest);
    
    if (!securityValidation.isValid) {
      console.warn('🚨 Booking security validation failed:', {
        userId,
        errors: securityValidation.errors.length,
        riskScore: securityValidation.riskScore
      });
      
      return NextResponse.json(
        { 
          success: false, 
          error: 'Booking validation failed',
          errors: securityValidation.errors,
          warnings: securityValidation.warnings
        },
        { status: 400 }
      );
    }
    
    // Check for high-risk bookings
    if (securityValidation.requiresAdditionalVerification) {
      console.warn('⚠️ High-risk booking detected:', {
        userId,
        riskScore: securityValidation.riskScore,
        requiresVerification: true
      });
      
      // In production, you might:
      // 1. Queue booking for manual review
      // 2. Request additional verification from user
      // 3. Apply additional fraud checks
      // For now, we'll log and continue with warnings
    }
    
    // Use sanitized data for booking creation
    const sanitizedRequest = securityValidation.sanitizedData!;
    
    // Check for idempotency (duplicate booking attempts)
    const idempotencyKey = BookingSecurityValidator.generateIdempotencyKey(sanitizedRequest);
    console.log('🔑 Idempotency key generated:', idempotencyKey.substring(0, 8) + '...');

    try {
      // Create the enhanced booking with real airline integration using sanitized data
      const enhancedBooking = await EnhancedBookingService.createEnhancedBooking(sanitizedRequest);
      
      console.log(`✅ Enhanced booking created: ${enhancedBooking.bookingReference}`);
      
      // Prepare enhanced response with security metadata
      const processingTime = Date.now() - startTime;
      
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
        },
        metadata: {
          processingTime,
          riskScore: securityValidation.riskScore,
          requiresVerification: securityValidation.requiresAdditionalVerification,
          warnings: securityValidation.warnings,
          idempotencyKey,
          captcha: {
            score: captchaResult.score,
            riskLevel: captchaResult.riskLevel,
            verified: true
          }
        }
      };
      
      return NextResponse.json(response);
      
    } catch (enhancedError: any) {
      console.error('❌ Enhanced booking creation failed:', enhancedError.message);
      
      // Check if error is due to duplicate booking attempt
      if (enhancedError.message.includes('duplicate') || enhancedError.message.includes('already exists')) {
        return NextResponse.json({
          success: false,
          error: 'Booking already exists or duplicate request detected',
          code: 'DUPLICATE_BOOKING'
        }, { status: 409 });
      }
      
      // Fallback to standard booking if enhanced booking fails
      console.log('🔄 Falling back to standard booking creation...');
      try {
        const fallbackBooking = await BookingService.createBooking(sanitizedRequest);
        
        return NextResponse.json({
          success: true,
          data: fallbackBooking,
          message: 'Booking created successfully (standard mode)',
          warning: 'Enhanced features temporarily unavailable',
          metadata: {
            processingTime: Date.now() - startTime,
            riskScore: securityValidation.riskScore,
            fallbackMode: true
          }
        });
      } catch (fallbackError: any) {
        console.error('❌ Fallback booking also failed:', fallbackError.message);
        
        return NextResponse.json({
          success: false,
          error: 'Booking creation failed',
          details: 'Both enhanced and standard booking methods failed'
        }, { status: 500 });
      }
    }

  } catch (error: any) {
    const processingTime = Date.now() - startTime;
    console.error('❌ Booking creation error:', {
      message: error.message,
      processingTime,
      stack: error.stack?.substring(0, 500) // Truncated stack trace
    });
    
    // Determine appropriate error response based on error type
    let statusCode = 500;
    let errorMessage = 'Internal server error';
    
    if (error.message.includes('authentication') || error.message.includes('unauthorized')) {
      statusCode = 401;
      errorMessage = 'Authentication required';
    } else if (error.message.includes('validation') || error.message.includes('invalid')) {
      statusCode = 400;
      errorMessage = 'Invalid request data';
    } else if (error.message.includes('rate limit') || error.message.includes('too many')) {
      statusCode = 429;
      errorMessage = 'Rate limit exceeded';
    } else if (error.message.includes('timeout')) {
      statusCode = 504;
      errorMessage = 'Request timeout';
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage,
        timestamp: new Date().toISOString(),
        metadata: {
          processingTime,
          errorCode: error.code || 'UNKNOWN_ERROR'
        }
      },
      { status: statusCode }
    );
  }
}

// GET - Get user's bookings with enhanced security
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Rate limiting for GET requests (more lenient)
    const clientIP = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    
    const rateLimitResult = await rateLimit({
      key: `booking_get_${clientIP}`,
      limit: 30, // 30 requests per hour for reading bookings
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
    
    // Parse and validate pagination parameters
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '20'), 1), 50); // Max 50 results
    const offset = Math.max(parseInt(searchParams.get('offset') || '0'), 0); // Non-negative offset
    
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
    
    const processingTime = Date.now() - startTime;
    
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
        },
        processingTime,
        pagination: {
          limit,
          offset,
          total: result.total,
          hasMore: result.hasMore
        }
      }
    });

  } catch (error: any) {
    const processingTime = Date.now() - startTime;
    console.error('❌ Get bookings error:', {
      message: error.message,
      processingTime,
      userId: 'hidden' // Don't log sensitive data
    });
    
    let statusCode = 500;
    let errorMessage = 'Failed to fetch bookings';
    
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
