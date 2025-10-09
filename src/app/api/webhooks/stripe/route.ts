// Stripe Webhook Handler (Standard Location)
// Processes Stripe webhook events following Stripe conventions
// This endpoint follows the standard /api/webhooks/stripe pattern

import { NextRequest, NextResponse } from 'next/server';
import EnhancedStripeService from '@/lib/payments/enhancedStripeService';
import { logSecurityEvent } from '@/lib/security/audit';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    console.log('🎣 Received Stripe webhook at /api/webhooks/stripe');

    // Get raw body and signature
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');
    
    if (!signature) {
      console.error('❌ Missing Stripe signature header');
      
      await logSecurityEvent({
        type: 'WEBHOOK_SIGNATURE_MISSING',
        severity: 'high',
        details: {
          provider: 'stripe',
          endpoint: '/api/webhooks/stripe',
          bodyLength: body.length,
        },
        metadata: {
          userAgent: request.headers.get('user-agent'),
          timestamp: new Date().toISOString(),
        },
      });
      
      return NextResponse.json(
        { error: 'Missing signature header' },
        { status: 400 }
      );
    }

    // Verify webhook signature and process event
    const result = await EnhancedStripeService.handleWebhook(body, signature);
    
    if (!result.success) {
      console.error('❌ Webhook processing failed:', result.error);
      
      await logSecurityEvent({
        type: 'WEBHOOK_PROCESSING_FAILED',
        severity: 'high',
        details: {
          provider: 'stripe',
          endpoint: '/api/webhooks/stripe',
          error: result.error,
          signatureLength: signature.length,
        },
        metadata: {
          userAgent: request.headers.get('user-agent'),
          timestamp: new Date().toISOString(),
        },
      });
      
      // Return 400 for signature verification failures
      // Return 500 for processing failures (to trigger Stripe retries)
      const statusCode = result.error?.includes('signature') ? 400 : 500;
      
      return NextResponse.json(
        { error: result.error || 'Webhook processing failed' },
        { status: statusCode }
      );
    }

    const processingTime = Date.now() - startTime;
    
    console.log(`✅ Webhook processed successfully in ${processingTime}ms`);

    // Log successful webhook processing
    await logSecurityEvent({
      type: 'WEBHOOK_PROCESSED',
      severity: 'low',
      details: {
        provider: 'stripe',
        endpoint: '/api/webhooks/stripe',
        eventType: result.event?.type,
        eventId: result.event?.id,
        processingTime,
      },
      metadata: {
        userAgent: request.headers.get('user-agent'),
        timestamp: new Date().toISOString(),
      },
    });
    
    return NextResponse.json({ 
      received: true,
      eventId: result.event?.id,
      eventType: result.event?.type,
      processingTime,
    });

  } catch (error: any) {
    const processingTime = Date.now() - startTime;
    
    console.error('❌ Webhook handler error:', {
      message: error.message,
      processingTime,
      stack: error.stack?.substring(0, 500),
    });

    await logSecurityEvent({
      type: 'WEBHOOK_HANDLER_ERROR',
      severity: 'high',
      details: {
        provider: 'stripe',
        endpoint: '/api/webhooks/stripe',
        error: error.message,
        processingTime,
      },
      metadata: {
        userAgent: request.headers.get('user-agent'),
        timestamp: new Date().toISOString(),
        stack: error.stack?.substring(0, 200),
      },
    });
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Ensure only POST requests are allowed
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Only POST requests are accepted for webhooks.' },
    { 
      status: 405,
      headers: { 'Allow': 'POST' }
    }
  );
}

export async function PUT() {
  return NextResponse.json(
    { error: 'Method not allowed. Only POST requests are accepted for webhooks.' },
    { 
      status: 405,
      headers: { 'Allow': 'POST' }
    }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Method not allowed. Only POST requests are accepted for webhooks.' },
    { 
      status: 405,
      headers: { 'Allow': 'POST' }
    }
  );
}

export async function PATCH() {
  return NextResponse.json(
    { error: 'Method not allowed. Only POST requests are accepted for webhooks.' },
    { 
      status: 405,
      headers: { 'Allow': 'POST' }
    }
  );
}