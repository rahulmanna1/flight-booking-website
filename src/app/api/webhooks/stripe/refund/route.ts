// Stripe Webhook: Refund Events Handler
// POST /api/webhooks/stripe/refund

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { handleRefundWebhook } from '@/lib/payments/refundService';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
});

/**
 * POST /api/webhooks/stripe/refund
 * Handle Stripe webhook events for refund updates
 * 
 * Events handled:
 * - refund.created
 * - refund.updated
 * - charge.refunded
 * 
 * @security Verified using Stripe webhook signature
 */
export async function POST(request: NextRequest) {
  try {
    // Get raw body for signature verification
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      console.error('❌ No Stripe signature found in webhook request');
      return NextResponse.json(
        { error: 'No signature provided' },
        { status: 400 }
      );
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    
    if (!webhookSecret) {
      console.error('❌ STRIPE_WEBHOOK_SECRET not configured');
      return NextResponse.json(
        { error: 'Webhook not configured' },
        { status: 500 }
      );
    }

    // Verify webhook signature
    let event: Stripe.Event;
    
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        webhookSecret
      );
    } catch (err: any) {
      console.error('❌ Webhook signature verification failed:', err.message);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    console.log(`📨 Received Stripe webhook: ${event.type}`);

    // Handle refund events
    switch (event.type) {
      case 'refund.created':
      case 'refund.updated':
        await handleRefundWebhook(event);
        break;

      case 'charge.refunded':
        // Handle charge.refunded event
        // This fires when a charge is refunded (may include multiple refunds)
        const charge = event.data.object as Stripe.Charge;
        console.log(`💰 Charge refunded: ${charge.id}, amount: ${charge.amount_refunded}`);
        
        // Note: refund.created/updated events already handle this,
        // but we log it for monitoring purposes
        break;

      default:
        console.log(`ℹ️ Unhandled refund webhook event: ${event.type}`);
    }

    return NextResponse.json({
      received: true,
      eventType: event.type,
      eventId: event.id,
    });
  } catch (error: any) {
    console.error('❌ Refund webhook error:', error);

    return NextResponse.json(
      {
        error: 'Webhook processing failed',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint for webhook health check
 * Useful for testing webhook endpoint availability
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    endpoint: '/api/webhooks/stripe/refund',
    events: ['refund.created', 'refund.updated', 'charge.refunded'],
    timestamp: new Date().toISOString(),
  });
}
