// API endpoint for creating Stripe payment intents
// Handles secure payment intent creation with validation

import { NextRequest, NextResponse } from 'next/server';
import StripePaymentService, { CreatePaymentIntentRequest } from '@/lib/payments/stripeService';
import { verifyAuth } from '@/lib/auth-prisma';
import rateLimit from '@/lib/security/rateLimit';
import CaptchaService from '@/lib/security/captcha';
import { getClientIP } from '@/lib/utils/network';
import { logSecurityEvent } from '@/lib/security/audit';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // =============================================================================
    // 🚧 DEVELOPMENT MODE - SECURITY DISABLED FOR TESTING
    // =============================================================================
    // TODO: Re-enable for production by setting DEVELOPMENT_MODE=false
    const DEVELOPMENT_MODE = process.env.NODE_ENV === 'development';
    
    let userId = 'dev_user';
    
    // Get client IP (needed for both dev and production)
    const clientIP = getClientIP({
      headers: {
        get: (name: string) => request.headers.get(name)
      }
    } as any);
    
    if (!DEVELOPMENT_MODE) {
      // PRODUCTION: Full security enabled
      
      const rateLimitResult = await rateLimit({
        key: `payment_intent_${clientIP}`,
        limit: 10, // 10 payment intent creations per hour per IP
        window: 60 * 60 * 1000 // 1 hour
      });
      
      if (!rateLimitResult.allowed) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Too many payment attempts. Please try again later.',
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

      userId = authResult.userId;
    } else {
      console.log('🚧 DEVELOPMENT MODE: Authentication and rate limiting bypassed');
    }

    // Parse and validate request body
    let requestBody: any;
    try {
      const bodyText = await request.text();
      
      if (bodyText.length > 10240) { // 10KB limit for payment requests
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

    // CAPTCHA verification for payment creation (highest security)
    if (!DEVELOPMENT_MODE) {
      // PRODUCTION: CAPTCHA required
      const captchaToken = requestBody.captchaToken || 
                          request.headers.get('x-captcha-token');
      
      if (!captchaToken) {
        await logSecurityEvent({
          type: 'CAPTCHA_TOKEN_MISSING',
          severity: 'high',
          details: {
            action: 'payment',
            endpoint: '/api/payments/create-intent',
            clientIP,
            userId,
            amount: requestBody.amount,
            currency: requestBody.currency,
            method: 'POST'
          },
          metadata: {
            userAgent: request.headers.get('user-agent'),
            endpoint: '/api/payments/create-intent'
          }
        });
        
        return NextResponse.json(
          { 
            success: false, 
            error: 'CAPTCHA verification required for payment processing',
            code: 'CAPTCHA_REQUIRED'
          },
          { status: 400 }
        );
      }
      
      console.log('🔐 Verifying CAPTCHA for payment creation...');
      
      const captchaResult = await CaptchaService.verifyToken(
        captchaToken,
        'payment', // Most strict CAPTCHA threshold (0.2)
        clientIP
      );
      
      if (!captchaResult.success) {
        console.warn('⚠️ CAPTCHA verification failed for payment:', captchaResult.error);
        
        await logSecurityEvent({
          type: 'CAPTCHA_VERIFICATION_FAILED',
          severity: 'high', // Always high severity for payment failures
          details: {
            action: 'payment',
            score: captchaResult.score,
            riskLevel: captchaResult.riskLevel,
            clientIP,
            userId,
            amount: requestBody.amount,
            currency: requestBody.currency,
            error: captchaResult.error
          },
          metadata: {
            userAgent: request.headers.get('user-agent'),
            endpoint: '/api/payments/create-intent'
          }
        });
        
        return NextResponse.json(
          {
            success: false,
            error: 'Payment security verification failed. Please try again.',
            code: 'CAPTCHA_VERIFICATION_FAILED',
            score: captchaResult.score,
            riskLevel: captchaResult.riskLevel,
            shouldRetry: captchaResult.shouldChallenge
          },
          { status: 403 }
        );
      }
      
      console.log(`✅ CAPTCHA verification successful for payment, score: ${captchaResult.score}`);
      
      await logSecurityEvent({
        type: 'CAPTCHA_VERIFICATION_SUCCESS',
        severity: 'low',
        details: {
          action: 'payment',
          score: captchaResult.score,
          riskLevel: captchaResult.riskLevel,
          clientIP: 'dev',
          userId,
          amount: requestBody.amount,
          currency: requestBody.currency
        },
        metadata: {
          userAgent: request.headers.get('user-agent'),
          endpoint: '/api/payments/create-intent'
        }
      });
    } else {
      console.log('🚧 DEVELOPMENT MODE: CAPTCHA verification bypassed');
    }

    // Validate required fields
    const { amount, currency, description, bookingId, metadata } = requestBody;
    
    if (!amount || typeof amount !== 'number') {
      return NextResponse.json(
        { success: false, error: 'Valid amount is required' },
        { status: 400 }
      );
    }

    if (!currency || typeof currency !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Valid currency is required' },
        { status: 400 }
      );
    }

    if (!description || typeof description !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Description is required' },
        { status: 400 }
      );
    }

    // Validate payment amount and currency
    const amountValidation = StripePaymentService.validatePaymentAmount(amount, currency);
    if (!amountValidation.isValid) {
      return NextResponse.json(
        { success: false, error: amountValidation.error },
        { status: 400 }
      );
    }

    console.log('💳 Creating payment intent...', {
      userId,
      amount,
      currency,
      bookingId,
      description: description.substring(0, 50) + '...'
    });

    // Create payment intent request
    const paymentIntentRequest: CreatePaymentIntentRequest = {
      amount,
      currency,
      userId,
      description,
      bookingId,
      metadata: {
        ...metadata,
        userId,
        createdBy: 'flight_booking_api',
        ipAddress: clientIP,
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    };

    // Create payment intent with Stripe
    const result = await StripePaymentService.createPaymentIntent(paymentIntentRequest);
    
    if (!result.success) {
      console.error('❌ Payment intent creation failed:', result.error);
      return NextResponse.json(
        { 
          success: false, 
          error: result.error?.message || 'Failed to create payment intent',
          errorType: result.error?.type,
          errorCode: result.error?.code
        },
        { status: 400 }
      );
    }

    const processingTime = Date.now() - startTime;

    console.log(`✅ Payment intent created successfully: ${result.paymentIntent?.id} in ${processingTime}ms`);

    // Return success response with client secret
    return NextResponse.json({
      success: true,
      paymentIntent: {
        id: result.paymentIntent?.id,
        clientSecret: result.paymentIntent?.clientSecret,
        amount: result.paymentIntent?.amount,
        currency: result.paymentIntent?.currency,
        status: result.paymentIntent?.status
      },
      metadata: {
        processingTime,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error: any) {
    const processingTime = Date.now() - startTime;
    console.error('❌ Payment intent API error:', {
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

// GET endpoint to retrieve payment intent status
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

    // Get payment intent ID from query params
    const { searchParams } = new URL(request.url);
    const paymentIntentId = searchParams.get('payment_intent_id');
    
    if (!paymentIntentId) {
      return NextResponse.json(
        { success: false, error: 'Payment intent ID is required' },
        { status: 400 }
      );
    }

    console.log('🔍 Retrieving payment intent:', paymentIntentId);

    // Retrieve payment intent from Stripe
    const result = await StripePaymentService.getPaymentIntent(paymentIntentId);
    
    if (!result.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: result.error?.message || 'Failed to retrieve payment intent'
        },
        { status: 400 }
      );
    }

    const processingTime = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      paymentIntent: result.paymentIntent,
      metadata: {
        processingTime,
        timestamp: new Date().toISOString(),
        captcha: {
          verified: false // No captcha verification in GET endpoint
        }
      }
    });

  } catch (error: any) {
    const processingTime = Date.now() - startTime;
    console.error('❌ Get payment intent error:', error);
    
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