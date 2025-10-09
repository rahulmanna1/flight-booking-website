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
      // Update booking status to payment failed
      console.log(`❌ Updating booking ${bookingId} status to PAYMENT_FAILED`);
      
      // Example: await BookingService.updateBookingStatus(bookingId, 'PAYMENT_FAILED');
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
