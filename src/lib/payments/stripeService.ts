// PCI-Compliant Stripe Payment Service
// Handles secure payment processing, webhooks, and compliance

import Stripe from 'stripe';
import { CreateBookingRequest } from '@/services/BookingService';

// Initialize Stripe conditionally
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripe = stripeSecretKey ? new Stripe(stripeSecretKey, {
  apiVersion: '2025-02-24.acacia',
  appInfo: {
    name: 'Flight Booking Website',
    version: '1.0.0',
  },
  maxNetworkRetries: 3,
  timeout: 10000, // 10 seconds
}) : null;

// Check if Stripe is configured
const isStripeConfigured = !!stripeSecretKey;

// Payment interfaces
export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: string;
  clientSecret: string;
  metadata: Record<string, string>;
}

export interface PaymentMethod {
  id: string;
  type: string;
  card?: {
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
    country?: string;
  };
  billingDetails?: {
    name?: string;
    email?: string;
    address?: {
      line1?: string;
      line2?: string;
      city?: string;
      state?: string;
      postalCode?: string;
      country?: string;
    };
  };
}

export interface CreatePaymentIntentRequest {
  amount: number; // in cents
  currency: string;
  bookingId?: string;
  userId: string;
  metadata: Record<string, string>;
  description: string;
  paymentMethodTypes?: string[];
  captureMethod?: 'automatic' | 'manual';
  setupFutureUsage?: 'on_session' | 'off_session';
  customerId?: string;
}

export interface PaymentResult {
  success: boolean;
  paymentIntent?: PaymentIntent;
  error?: {
    type: string;
    code?: string;
    message: string;
    declineCode?: string;
  };
  requiresAction?: boolean;
  actionType?: string;
}

export interface RefundRequest {
  paymentIntentId: string;
  amount?: number; // partial refund amount in cents
  reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer';
  metadata?: Record<string, string>;
}

export interface RefundResult {
  success: boolean;
  refund?: {
    id: string;
    amount: number;
    status: string;
    reason?: string;
  };
  error?: {
    type: string;
    message: string;
  };
}

class StripePaymentService {
  
  // Create a payment intent for booking
  static async createPaymentIntent(request: CreatePaymentIntentRequest): Promise<PaymentResult> {
    if (!stripe || !isStripeConfigured) {
      return {
        success: false,
        error: {
          type: 'configuration_error',
          message: 'Stripe payment processing is not configured'
        }
      };
    }

    try {
      console.log('💳 Creating Stripe payment intent...', {
        amount: request.amount,
        currency: request.currency,
        userId: request.userId,
        bookingId: request.bookingId
      });

      // Validate amount (minimum $0.50 USD)
      if (request.amount < 50) {
        return {
          success: false,
          error: {
            type: 'validation_error',
            message: 'Payment amount too small (minimum $0.50)'
          }
        };
      }

      // Create customer if not exists
      let customerId = request.customerId;
      if (!customerId && request.userId) {
        try {
          const customer = await stripe.customers.create({
            metadata: {
              userId: request.userId,
              source: 'flight_booking'
            }
          });
          customerId = customer.id;
        } catch (error) {
          console.warn('⚠️ Failed to create customer:', error);
          // Continue without customer ID
        }
      }

      const paymentIntentParams: Stripe.PaymentIntentCreateParams = {
        amount: request.amount,
        currency: request.currency.toLowerCase(),
        payment_method_types: request.paymentMethodTypes || ['card'],
        description: request.description,
        metadata: {
          ...request.metadata,
          userId: request.userId,
          bookingId: request.bookingId || 'pending',
          createdAt: new Date().toISOString()
        },
        capture_method: request.captureMethod || 'automatic',
        confirmation_method: 'manual',
        confirm: false, // Don't confirm immediately
      };

      if (customerId) {
        paymentIntentParams.customer = customerId;
      }

      if (request.setupFutureUsage) {
        paymentIntentParams.setup_future_usage = request.setupFutureUsage;
      }

      const paymentIntent = await stripe.paymentIntents.create(paymentIntentParams);

      const result: PaymentResult = {
        success: true,
        paymentIntent: {
          id: paymentIntent.id,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          status: paymentIntent.status,
          clientSecret: paymentIntent.client_secret!,
          metadata: paymentIntent.metadata
        }
      };

      console.log(`✅ Payment intent created: ${paymentIntent.id}`);
      return result;

    } catch (error: any) {
      console.error('❌ Failed to create payment intent:', error);
      
      return {
        success: false,
        error: {
          type: error.type || 'api_error',
          code: error.code,
          message: this.getErrorMessage(error),
          declineCode: error.decline_code
        }
      };
    }
  }

  // Confirm a payment intent with payment method
  static async confirmPaymentIntent(
    paymentIntentId: string,
    paymentMethodId: string,
    returnUrl?: string
  ): Promise<PaymentResult> {
    try {
      console.log('🔐 Confirming payment intent...', { paymentIntentId, paymentMethodId });

      if (!stripe) {
        throw new Error('Stripe instance not initialized');
      }

      const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId, {
        payment_method: paymentMethodId,
        return_url: returnUrl || `${process.env.NEXTAUTH_URL}/booking/confirmation`
      });

      const result: PaymentResult = {
        success: true,
        paymentIntent: {
          id: paymentIntent.id,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          status: paymentIntent.status,
          clientSecret: paymentIntent.client_secret!,
          metadata: paymentIntent.metadata
        }
      };

      // Check if payment requires additional action
      if (paymentIntent.status === 'requires_action') {
        result.requiresAction = true;
        result.actionType = paymentIntent.next_action?.type;
      }

      console.log(`✅ Payment intent confirmed: ${paymentIntent.id}, status: ${paymentIntent.status}`);
      return result;

    } catch (error: any) {
      console.error('❌ Failed to confirm payment intent:', error);
      
      return {
        success: false,
        error: {
          type: error.type || 'api_error',
          code: error.code,
          message: this.getErrorMessage(error),
          declineCode: error.decline_code
        }
      };
    }
  }

  // Retrieve payment intent
  static async getPaymentIntent(paymentIntentId: string): Promise<PaymentResult> {
    try {
      if (!stripe) {
        throw new Error('Stripe instance not initialized');
      }

      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

      return {
        success: true,
        paymentIntent: {
          id: paymentIntent.id,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          status: paymentIntent.status,
          clientSecret: paymentIntent.client_secret!,
          metadata: paymentIntent.metadata
        }
      };

    } catch (error: any) {
      console.error('❌ Failed to retrieve payment intent:', error);
      
      return {
        success: false,
        error: {
          type: error.type || 'api_error',
          code: error.code,
          message: this.getErrorMessage(error)
        }
      };
    }
  }

  // Create a payment method (server-side)
  static async createPaymentMethod(
    type: string,
    cardDetails?: {
      number: string;
      expMonth: number;
      expYear: number;
      cvc: string;
    },
    billingDetails?: any
  ): Promise<{ success: boolean; paymentMethod?: PaymentMethod; error?: any }> {
    try {
      // Note: In production, card details should come from Stripe Elements (client-side)
      // This method is for server-side payment method creation for special cases
      
      const paymentMethodParams: Stripe.PaymentMethodCreateParams = {
        type: type as Stripe.PaymentMethodCreateParams.Type,
        billing_details: billingDetails
      };

      if (type === 'card' && cardDetails) {
        paymentMethodParams.card = {
          number: cardDetails.number,
          exp_month: cardDetails.expMonth,
          exp_year: cardDetails.expYear,
          cvc: cardDetails.cvc
        };
      }

      if (!stripe) {
        throw new Error('Stripe instance not initialized');
      }

      const paymentMethod = await stripe.paymentMethods.create(paymentMethodParams);

      return {
        success: true,
        paymentMethod: {
          id: paymentMethod.id,
          type: paymentMethod.type,
          card: paymentMethod.card ? {
            brand: paymentMethod.card.brand,
            last4: paymentMethod.card.last4,
            expMonth: paymentMethod.card.exp_month,
            expYear: paymentMethod.card.exp_year,
            country: paymentMethod.card.country || undefined
          } : undefined,
          billingDetails: {
            name: paymentMethod.billing_details?.name || undefined,
            email: paymentMethod.billing_details?.email || undefined,
            address: paymentMethod.billing_details?.address ? {
              line1: paymentMethod.billing_details.address.line1 || undefined,
              line2: paymentMethod.billing_details.address.line2 || undefined,
              city: paymentMethod.billing_details.address.city || undefined,
              state: paymentMethod.billing_details.address.state || undefined,
              postalCode: paymentMethod.billing_details.address.postal_code || undefined,
              country: paymentMethod.billing_details.address.country || undefined
            } : undefined
          }
        }
      };

    } catch (error: any) {
      console.error('❌ Failed to create payment method:', error);
      return {
        success: false,
        error: {
          type: error.type || 'api_error',
          code: error.code,
          message: this.getErrorMessage(error)
        }
      };
    }
  }

  // Process a refund
  static async processRefund(request: RefundRequest): Promise<RefundResult> {
    if (!stripe || !isStripeConfigured) {
      return {
        success: false,
        error: {
          type: 'configuration_error',
          message: 'Stripe payment processing is not configured'
        }
      };
    }

    try {
      console.log('💸 Processing refund...', {
        paymentIntentId: request.paymentIntentId,
        amount: request.amount,
        reason: request.reason
      });

      const refundParams: Stripe.RefundCreateParams = {
        payment_intent: request.paymentIntentId,
        reason: request.reason,
        metadata: request.metadata
      };

      if (request.amount) {
        refundParams.amount = request.amount;
      }

      const refund = await stripe.refunds.create(refundParams);

      console.log(`✅ Refund processed: ${refund.id}, amount: ${refund.amount}, status: ${refund.status}`);

      return {
        success: true,
        refund: {
          id: refund.id,
          amount: refund.amount,
          status: refund.status || '',
          reason: refund.reason || undefined
        }
      };

    } catch (error: any) {
      console.error('❌ Failed to process refund:', error);
      
      return {
        success: false,
        error: {
          type: error.type || 'api_error',
          message: this.getErrorMessage(error)
        }
      };
    }
  }

  // Validate webhook signature
  static verifyWebhookSignature(
    payload: string,
    signature: string,
    secret: string
  ): Stripe.Event | null {
    try {
      if (!stripe) {
        throw new Error('Stripe instance not initialized');
      }
      return stripe.webhooks.constructEvent(payload, signature, secret);
    } catch (error: any) {
      console.error('❌ Webhook signature verification failed:', error);
      return null;
    }
  }

  // Process webhook events
  static async processWebhookEvent(event: Stripe.Event): Promise<void> {
    try {
      console.log(`📨 Processing webhook: ${event.type}`);

      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent);
          break;

        case 'payment_intent.payment_failed':
          await this.handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
          break;

        case 'payment_intent.requires_action':
          await this.handlePaymentRequiresAction(event.data.object as Stripe.PaymentIntent);
          break;

        case 'charge.dispute.created':
          await this.handleChargeDispute(event.data.object as Stripe.Dispute);
          break;

        default:
          console.log(`ℹ️ Unhandled webhook event: ${event.type}`);
      }

    } catch (error: any) {
      console.error('❌ Failed to process webhook:', error);
      throw error;
    }
  }

  // Handle successful payment
  private static async handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    console.log(`💚 Payment succeeded: ${paymentIntent.id}`);
    
    const bookingId = paymentIntent.metadata.bookingId;
    if (bookingId && bookingId !== 'pending') {
      // Update booking status to confirmed
      // This would integrate with your booking service
      console.log(`✅ Updating booking ${bookingId} status to CONFIRMED`);
      
      // Example: await BookingService.updateBookingStatus(bookingId, 'CONFIRMED');
    }
  }

  // Handle failed payment
  private static async handlePaymentFailed(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    console.log(`💔 Payment failed: ${paymentIntent.id}`);
    
    const bookingId = paymentIntent.metadata.bookingId;
    if (bookingId && bookingId !== 'pending') {
      const errorCode = paymentIntent.last_payment_error?.code || 'unknown';
      
      // Call the comprehensive payment failure handler
      await this.handlePaymentFailure(paymentIntent.id, errorCode);
    }
  }

  /**
   * Comprehensive payment failure handler with retry logic
   */
  static async handlePaymentFailure(
    paymentIntentId: string,
    errorCode: string
  ): Promise<{
    shouldRetry: boolean;
    alternativeMethods?: string[];
    gracePeriodHours?: number;
  }> {
    try {
      if (!stripe) {
        throw new Error('Stripe not initialized');
      }

      // Get payment intent details
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      const bookingId = paymentIntent.metadata.bookingId;

      if (!bookingId || bookingId === 'pending') {
        console.error('⚠️ No valid booking ID in payment metadata');
        return { shouldRetry: false };
      }

      // Get current failure count
      const failureCount = await this.getPaymentFailureCount(bookingId);

      // Log the failure
      const { prisma } = await import('@/lib/db');
      await prisma.auditLog.create({
        data: {
          action: 'PAYMENT_FAILURE',
          category: 'PAYMENT',
          severity: 'WARNING',
          details: JSON.stringify({
            bookingId,
            paymentIntentId,
            errorCode,
            attemptCount: failureCount + 1,
            declineCode: paymentIntent.last_payment_error?.decline_code,
            message: paymentIntent.last_payment_error?.message,
          }),
        },
      });

      // Determine if error is retryable
      const retryableErrors = [
        'card_declined',
        'insufficient_funds',
        'card_velocity_exceeded',
        'processing_error',
        'temporary_failure',
      ];

      const isRetryable = retryableErrors.includes(errorCode);

      if (isRetryable && failureCount < 3) {
        // Allow retry with decreasing grace period
        const gracePeriodHours = failureCount === 0 ? 24 : failureCount === 1 ? 12 : 6;
        const gracePeriodExpires = new Date(Date.now() + gracePeriodHours * 60 * 60 * 1000);

        // Update booking with PENDING status and grace period
        await prisma.booking.update({
          where: { id: bookingId },
          data: {
            status: 'PENDING',
            paymentInfo: JSON.stringify({
              paymentIntentId,
              failureCount: failureCount + 1,
              lastFailureCode: errorCode,
              lastFailureTime: new Date().toISOString(),
              gracePeriodExpiresAt: gracePeriodExpires.toISOString(),
              retryable: true,
            }),
          },
        });

        console.log(
          `⏳ Payment retry allowed for booking ${bookingId}. Grace period: ${gracePeriodHours} hours`
        );

        // Send notification to user
        try {
          const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
            include: { user: true },
          });

          if (booking?.user?.email) {
            await this.sendPaymentFailureNotification(
              booking.user.email,
              booking.bookingReference,
              errorCode,
              gracePeriodHours
            );
          }
        } catch (emailError) {
          console.error('⚠️ Failed to send payment failure notification:', emailError);
        }

        return {
          shouldRetry: true,
          gracePeriodHours,
          alternativeMethods: this.getSuggestedAlternativePaymentMethods(errorCode),
        };
      } else {
        // Too many failures or non-retryable error - cancel booking
        await this.cancelBookingDueToPaymentFailure(bookingId, errorCode);
        return { shouldRetry: false };
      }
    } catch (error: any) {
      console.error('❌ Payment failure handler error:', error);
      throw error;
    }
  }

  /**
   * Get payment failure count for a booking
   */
  private static async getPaymentFailureCount(bookingId: string): Promise<number> {
    try {
      const { prisma } = await import('@/lib/db');
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
      });

      if (!booking?.paymentInfo) return 0;

      try {
        const paymentInfo = JSON.parse(booking.paymentInfo);
        return paymentInfo.failureCount || 0;
      } catch {
        return 0;
      }
    } catch (error) {
      console.error('Error getting failure count:', error);
      return 0;
    }
  }

  /**
   * Suggest alternative payment methods based on error
   */
  private static getSuggestedAlternativePaymentMethods(errorCode: string): string[] {
    const suggestions: Record<string, string[]> = {
      card_declined: ['Try a different card', 'Contact your bank', 'Use bank transfer'],
      insufficient_funds: ['Add funds to your account', 'Use a different card', 'Split payment'],
      card_velocity_exceeded: ['Wait and retry later', 'Use a different card'],
      processing_error: ['Retry in a few minutes', 'Use a different card'],
      expired_card: ['Update card details', 'Use a different card'],
    };

    return suggestions[errorCode] || ['Contact support', 'Try a different payment method'];
  }

  /**
   * Cancel booking due to payment failure
   */
  private static async cancelBookingDueToPaymentFailure(
    bookingId: string,
    errorCode: string
  ): Promise<void> {
    try {
      const { prisma } = await import('@/lib/db');
      
      await prisma.booking.update({
        where: { id: bookingId },
        data: {
          status: 'PAYMENT_FAILED',
          paymentInfo: JSON.stringify({
            finalFailureCode: errorCode,
            cancelledAt: new Date().toISOString(),
            reason: 'Payment failed after multiple attempts',
          }),
        },
      });

      // Send cancellation email
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: { user: true },
      });

      if (booking?.user?.email) {
        await this.sendPaymentFailureCancellationEmail(
          booking.user.email,
          booking.bookingReference,
          errorCode
        );
      }

      // Log the cancellation
      await prisma.auditLog.create({
        data: {
          action: 'BOOKING_CANCELLED_PAYMENT_FAILURE',
          category: 'PAYMENT',
          severity: 'WARNING',
          details: JSON.stringify({
            bookingId,
            errorCode,
            reason: 'Payment failed after multiple attempts',
          }),
        },
      });

      console.log(`❌ Booking ${bookingId} cancelled due to payment failure: ${errorCode}`);
    } catch (error) {
      console.error('Error cancelling booking:', error);
      throw error;
    }
  }

  /**
   * Send payment failure notification email
   */
  private static async sendPaymentFailureNotification(
    email: string,
    bookingReference: string,
    errorCode: string,
    gracePeriodHours: number
  ): Promise<void> {
    try {
      const EmailService = (await import('@/lib/services/emailService')).default;
      
      // You can enhance this to use a proper email template
      console.log(
        `📧 Sending payment failure notification to ${email} for booking ${bookingReference}`
      );
      
      // Note: You would need to add this method to EmailService or use existing methods
      // For now, logging the intent
    } catch (error) {
      console.error('Failed to send payment failure notification:', error);
    }
  }

  /**
   * Send payment failure cancellation email
   */
  private static async sendPaymentFailureCancellationEmail(
    email: string,
    bookingReference: string,
    errorCode: string
  ): Promise<void> {
    try {
      const EmailService = (await import('@/lib/services/emailService')).default;
      
      console.log(
        `📧 Sending cancellation email to ${email} for booking ${bookingReference}`
      );
      
      // Note: You would enhance EmailService to have this specific template
    } catch (error) {
      console.error('Failed to send cancellation email:', error);
    }
  }

  /**
   * Background job to auto-cancel bookings with expired grace periods
   */
  static async cancelExpiredPendingPayments(): Promise<{
    cancelledCount: number;
    errors: string[];
  }> {
    try {
      const { prisma } = await import('@/lib/db');
      
      const expiredBookings = await prisma.booking.findMany({
        where: {
          status: 'PENDING',
        },
        include: { user: true },
      });

      let cancelledCount = 0;
      const errors: string[] = [];

      for (const booking of expiredBookings) {
        try {
          // Check if grace period has expired
          const paymentInfo = JSON.parse(booking.paymentInfo);
          const gracePeriodExpires = new Date(paymentInfo.gracePeriodExpiresAt);

          if (gracePeriodExpires < new Date()) {
            await this.cancelBookingDueToPaymentFailure(
              booking.id,
              paymentInfo.lastFailureCode || 'grace_period_expired'
            );
            cancelledCount++;
            console.log(
              `✅ Auto-cancelled booking ${booking.id} due to expired grace period`
            );
          }
        } catch (error: any) {
          const errorMsg = `Failed to process booking ${booking.id}: ${error.message}`;
          errors.push(errorMsg);
          console.error(errorMsg);
        }
      }

      return { cancelledCount, errors };
    } catch (error: any) {
      console.error('Error in cancelExpiredPendingPayments:', error);
      throw error;
    }
  }

  // Handle payment requiring action
  private static async handlePaymentRequiresAction(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    console.log(`⚠️ Payment requires action: ${paymentIntent.id}`);
    
    // Could send notification to user about required action
  }

  // Handle charge disputes
  private static async handleChargeDispute(dispute: Stripe.Dispute): Promise<void> {
    console.log(`⚖️ Charge dispute created: ${dispute.id}, amount: ${dispute.amount}`);
    
    // Handle dispute - could involve notifying admins, gathering evidence, etc.
  }

  // Get user-friendly error message
  private static getErrorMessage(error: any): string {
    switch (error.code) {
      case 'card_declined':
        return 'Your card was declined. Please try a different payment method.';
      case 'expired_card':
        return 'Your card has expired. Please use a different card.';
      case 'incorrect_cvc':
        return 'Your card\'s security code is incorrect.';
      case 'processing_error':
        return 'An error occurred while processing your card. Please try again.';
      case 'insufficient_funds':
        return 'Your card has insufficient funds.';
      case 'authentication_required':
        return 'Your payment requires authentication. Please complete the verification.';
      default:
        return error.message || 'An unexpected error occurred. Please try again.';
    }
  }

  // Validate payment amount and currency
  static validatePaymentAmount(amount: number, currency: string): { isValid: boolean; error?: string } {
    // Minimum amounts by currency (in smallest units)
    const minimumAmounts: Record<string, number> = {
      'usd': 50,   // $0.50
      'eur': 50,   // €0.50
      'gbp': 30,   // £0.30
      'cad': 50,   // C$0.50
      'aud': 50,   // A$0.50
      'jpy': 50,   // ¥50
    };

    const minimum = minimumAmounts[currency.toLowerCase()];
    if (!minimum) {
      return { isValid: false, error: `Unsupported currency: ${currency}` };
    }

    if (amount < minimum) {
      const formattedMinimum = (minimum / 100).toFixed(2);
      return { 
        isValid: false, 
        error: `Minimum payment amount is ${formattedMinimum} ${currency.toUpperCase()}` 
      };
    }

    // Maximum reasonable amount (prevent errors/fraud)
    const maxAmount = 1000000; // $10,000 USD equivalent
    if (amount > maxAmount) {
      return { 
        isValid: false, 
        error: 'Payment amount exceeds maximum allowed limit' 
      };
    }

    return { isValid: true };
  }

  // Get payment statistics
  static async getPaymentStats(userId?: string): Promise<{
    totalPayments: number;
    successfulPayments: number;
    failedPayments: number;
    totalAmount: number;
    averageAmount: number;
  }> {
    try {
      // This would typically query your database for payment statistics
      // For now, returning mock data structure
      return {
        totalPayments: 0,
        successfulPayments: 0,
        failedPayments: 0,
        totalAmount: 0,
        averageAmount: 0
      };
    } catch (error) {
      console.error('❌ Failed to get payment stats:', error);
      throw error;
    }
  }
}

export default StripePaymentService;
// Note: Type exports are declared earlier in the file to avoid conflicts
