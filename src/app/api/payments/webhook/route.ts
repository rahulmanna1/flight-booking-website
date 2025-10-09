// Stripe Webhook Handler
// Processes Stripe webhook events securely with signature verification

import { NextRequest, NextResponse } from 'next/server';
import StripePaymentService from '@/lib/payments/stripeService';
import { BookingService } from '@/services/BookingService';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Verify webhook signature
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');
    
    if (!signature) {
      console.error('❌ Missing Stripe signature header');
      return NextResponse.json(
        { error: 'Missing signature header' },
        { status: 400 }
      );
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('❌ Stripe webhook secret not configured');
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      );
    }

    console.log('📨 Processing Stripe webhook...');

    // Verify the webhook signature
    const event = StripePaymentService.verifyWebhookSignature(
      body,
      signature,
      webhookSecret
    );

    if (!event) {
      console.error('❌ Invalid webhook signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    console.log(`✅ Webhook verified: ${event.type}, ID: ${event.id}`);

    // Process the webhook event
    try {
      await processWebhookEvent(event);
    } catch (processError: any) {
      console.error('❌ Error processing webhook event:', processError);
      
      // Return 500 to trigger Stripe retry mechanism
      return NextResponse.json(
        { error: 'Error processing event' },
        { status: 500 }
      );
    }

    const processingTime = Date.now() - startTime;
    console.log(`✅ Webhook processed successfully in ${processingTime}ms`);

    // Return success response
    return NextResponse.json({ 
      received: true,
      eventId: event.id,
      eventType: event.type,
      processingTime
    });

  } catch (error: any) {
    const processingTime = Date.now() - startTime;
    console.error('❌ Webhook handler error:', {
      message: error.message,
      processingTime,
      stack: error.stack?.substring(0, 500)
    });
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Process individual webhook events
async function processWebhookEvent(event: any): Promise<void> {
  const eventType = event.type;
  const eventData = event.data.object;

  console.log(`🔄 Processing ${eventType} event for ${eventData.id}`);

  switch (eventType) {
    case 'payment_intent.succeeded':
      await handlePaymentSucceeded(eventData);
      break;

    case 'payment_intent.payment_failed':
      await handlePaymentFailed(eventData);
      break;

    case 'payment_intent.requires_action':
      await handlePaymentRequiresAction(eventData);
      break;

    case 'payment_intent.canceled':
      await handlePaymentCanceled(eventData);
      break;

    case 'charge.dispute.created':
      await handleChargeDispute(eventData);
      break;

    case 'invoice.payment_succeeded':
      await handleInvoicePaymentSucceeded(eventData);
      break;

    case 'customer.subscription.created':
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted':
      await handleSubscriptionEvent(eventData, eventType);
      break;

    default:
      console.log(`ℹ️ Unhandled webhook event type: ${eventType}`);
  }
}

// Handle successful payment
async function handlePaymentSucceeded(paymentIntent: any): Promise<void> {
  try {
    console.log(`💚 Payment succeeded: ${paymentIntent.id}, amount: ${paymentIntent.amount}`);
    
    const bookingId = paymentIntent.metadata?.bookingId;
    const userId = paymentIntent.metadata?.userId;

    if (bookingId && bookingId !== 'pending') {
      console.log(`✅ Updating booking ${bookingId} status to CONFIRMED`);
      
      // Update booking status to confirmed
      const updated = await BookingService.updateBookingStatus(bookingId, 'CONFIRMED', userId);
      
      if (updated) {
        console.log(`✅ Booking ${bookingId} successfully confirmed`);
        
        // TODO: Send confirmation email
        // await sendBookingConfirmationEmail(bookingId);
        
        // TODO: Send SMS notification if phone number available
        // await sendBookingConfirmationSMS(bookingId);
        
      } else {
        console.error(`❌ Failed to update booking ${bookingId} status`);
      }
    } else {
      console.warn('⚠️ No booking ID found in payment intent metadata');
    }

    // Log successful payment for analytics
    console.log('📊 Payment analytics:', {
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      bookingId,
      userId,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('❌ Error handling payment success:', error);
    throw error;
  }
}

// Handle failed payment
async function handlePaymentFailed(paymentIntent: any): Promise<void> {
  try {
    console.log(`💔 Payment failed: ${paymentIntent.id}`);
    
    const bookingId = paymentIntent.metadata?.bookingId;
    const userId = paymentIntent.metadata?.userId;
    const failureReason = paymentIntent.last_payment_error?.message || 'Unknown error';

    if (bookingId && bookingId !== 'pending') {
      console.log(`❌ Updating booking ${bookingId} status to PAYMENT_FAILED`);
      
      // Update booking status to payment failed
      const updated = await BookingService.updateBookingStatus(bookingId, 'PAYMENT_FAILED' as any, userId);
      
      if (updated) {
        console.log(`✅ Booking ${bookingId} status updated to PAYMENT_FAILED`);
        
        // TODO: Send payment failure notification
        // await sendPaymentFailureEmail(bookingId, failureReason);
        
      } else {
        console.error(`❌ Failed to update booking ${bookingId} status`);
      }
    }

    // Log failed payment for analysis
    console.log('📊 Payment failure analytics:', {
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      failureReason,
      bookingId,
      userId,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('❌ Error handling payment failure:', error);
    throw error;
  }
}

// Handle payment requiring action (3D Secure, etc.)
async function handlePaymentRequiresAction(paymentIntent: any): Promise<void> {
  try {
    console.log(`⚠️ Payment requires action: ${paymentIntent.id}`);
    
    const bookingId = paymentIntent.metadata?.bookingId;
    const actionType = paymentIntent.next_action?.type;

    console.log(`📋 Action required: ${actionType} for booking ${bookingId}`);
    
    // TODO: Send notification to user about required action
    // await sendPaymentActionRequiredNotification(bookingId, actionType);

  } catch (error: any) {
    console.error('❌ Error handling payment action required:', error);
    throw error;
  }
}

// Handle canceled payment
async function handlePaymentCanceled(paymentIntent: any): Promise<void> {
  try {
    console.log(`🚫 Payment canceled: ${paymentIntent.id}`);
    
    const bookingId = paymentIntent.metadata?.bookingId;
    const userId = paymentIntent.metadata?.userId;

    if (bookingId && bookingId !== 'pending') {
      console.log(`🚫 Updating booking ${bookingId} status to CANCELLED`);
      
      // Update booking status to cancelled
      const updated = await BookingService.updateBookingStatus(bookingId, 'CANCELLED', userId);
      
      if (updated) {
        console.log(`✅ Booking ${bookingId} successfully cancelled`);
      }
    }

  } catch (error: any) {
    console.error('❌ Error handling payment cancellation:', error);
    throw error;
  }
}

// Handle charge disputes
async function handleChargeDispute(dispute: any): Promise<void> {
  try {
    console.log(`⚖️ Charge dispute created: ${dispute.id}, amount: ${dispute.amount}, reason: ${dispute.reason}`);
    
    // TODO: Implement dispute handling logic
    // - Gather evidence
    // - Notify admin team
    // - Update booking status if needed
    // - Send dispute notification

    console.log('📧 Notifying admin team about dispute...');
    
    // For now, just log the dispute details
    console.log('📊 Dispute details:', {
      disputeId: dispute.id,
      amount: dispute.amount,
      currency: dispute.currency,
      reason: dispute.reason,
      status: dispute.status,
      chargeId: dispute.charge,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('❌ Error handling charge dispute:', error);
    throw error;
  }
}

// Handle invoice payment succeeded (for subscriptions/recurring payments)
async function handleInvoicePaymentSucceeded(invoice: any): Promise<void> {
  try {
    console.log(`📄 Invoice payment succeeded: ${invoice.id}, amount: ${invoice.amount_paid}`);
    
    // TODO: Handle subscription/recurring payment logic if applicable
    
  } catch (error: any) {
    console.error('❌ Error handling invoice payment:', error);
    throw error;
  }
}

// Handle subscription events (for future features)
async function handleSubscriptionEvent(subscription: any, eventType: string): Promise<void> {
  try {
    console.log(`📋 Subscription event: ${eventType}, subscription: ${subscription.id}`);
    
    // TODO: Handle subscription logic for premium features, loyalty programs, etc.
    
  } catch (error: any) {
    console.error('❌ Error handling subscription event:', error);
    throw error;
  }
}

// Ensure only POST requests are allowed
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}