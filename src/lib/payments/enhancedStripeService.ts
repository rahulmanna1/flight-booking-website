// Enhanced Stripe Payment Service
// Comprehensive payment processing with multiple methods, security, and advanced features

import Stripe from 'stripe';
import { logSecurityEvent } from '../security/audit';
import { getClientIP } from '../utils/network';

// Initialize Stripe conditionally
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripe = stripeSecretKey ? new Stripe(stripeSecretKey, {
  apiVersion: '2025-02-24.acacia',
  typescript: true,
}) : null;

// Check if Stripe is configured
const isStripeConfigured = !!stripeSecretKey;

// Payment interfaces
export interface PaymentMethod {
  id: string;
  type: 'card' | 'bank_account' | 'wallet' | 'buy_now_pay_later';
  subtype?: string;
  brand?: string;
  last4?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
  billingAddress?: {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
  metadata: {
    addedAt: string;
    lastUsed?: string;
    verified: boolean;
  };
}

export interface PaymentRequest {
  amount: number;
  currency: string;
  userId: string;
  bookingId?: string;
  description: string;
  paymentMethodId?: string;
  savePaymentMethod?: boolean;
  customerId?: string;
  metadata?: Record<string, string>;
  
  // Security and compliance
  captchaToken: string;
  ipAddress?: string;
  userAgent?: string;
  deviceFingerprint?: string;
  
  // Billing details
  billingDetails: {
    name: string;
    email: string;
    phone?: string;
    address: {
      line1: string;
      line2?: string;
      city: string;
      state: string;
      country: string;
      postal_code: string;
    };
  };
  
  // Additional options
  confirmationMethod?: 'automatic' | 'manual';
  returnUrl?: string;
  setupFutureUsage?: 'on_session' | 'off_session';
  statementDescriptor?: string;
}

export interface PaymentResult {
  success: boolean;
  paymentIntent?: Stripe.PaymentIntent;
  paymentMethod?: PaymentMethod;
  clientSecret?: string;
  status?: string;
  error?: {
    type: string;
    code: string;
    message: string;
    param?: string;
  };
  requiresAction?: boolean;
  nextAction?: any;
  metadata: {
    processingTime: number;
    timestamp: string;
    provider: 'stripe';
    securityScore: number;
  };
}

export interface RefundRequest {
  paymentIntentId: string;
  amount?: number;
  reason: 'duplicate' | 'fraudulent' | 'requested_by_customer';
  metadata?: Record<string, string>;
  reverseTransfer?: boolean;
  refundApplicationFee?: boolean;
}

export interface RefundResult {
  success: boolean;
  refund?: Stripe.Refund;
  error?: {
    type: string;
    code: string;
    message: string;
  };
  metadata: {
    processingTime: number;
    timestamp: string;
    originalAmount: number;
    refundedAmount: number;
  };
}

class EnhancedStripeService {
  
  // Check if Stripe is properly configured
  static isConfigured(): boolean {
    return isStripeConfigured;
  }
  
  // Create or retrieve customer
  static async getOrCreateCustomer(
    userId: string,
    email: string,
    name: string,
    metadata?: Record<string, string>
  ): Promise<Stripe.Customer> {
    if (!stripe || !isStripeConfigured) {
      throw new Error('Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.');
    }

    try {
      // First, try to find existing customer
      const existingCustomers = await stripe.customers.list({
        email: email,
        limit: 1,
      });

      if (existingCustomers.data.length > 0) {
        console.log(`📋 Found existing Stripe customer: ${existingCustomers.data[0].id}`);
        return existingCustomers.data[0];
      }

      // Create new customer
      const customer = await stripe.customers.create({
        email,
        name,
        metadata: {
          userId,
          createdAt: new Date().toISOString(),
          ...metadata,
        },
      });

      console.log(`✅ Created new Stripe customer: ${customer.id}`);
      
      await logSecurityEvent({
        type: 'STRIPE_CUSTOMER_CREATED',
        severity: 'low',
        details: {
          customerId: customer.id,
          userId,
          email,
        },
        metadata: {
          provider: 'stripe',
          endpoint: 'customers.create',
        },
      });

      return customer;
    } catch (error: any) {
      console.error('❌ Failed to create/retrieve Stripe customer:', error);
      throw new Error(`Customer creation failed: ${error.message}`);
    }
  }

  // Create payment intent with enhanced security
  static async createPaymentIntent(request: PaymentRequest): Promise<PaymentResult> {
    const startTime = Date.now();
    
    if (!stripe || !isStripeConfigured) {
      return {
        success: false,
        error: {
          type: 'configuration_error',
          code: 'stripe_not_configured',
          message: 'Stripe payment processing is not configured',
        },
        metadata: {
          processingTime: Date.now() - startTime,
          timestamp: new Date().toISOString(),
          provider: 'stripe',
          securityScore: 0,
        },
      };
    }
    
    try {
      console.log(`💳 Creating payment intent: ${request.amount} ${request.currency.toUpperCase()}`);

      // Validate request
      const validation = this.validatePaymentRequest(request);
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }

      // Get or create customer
      const customer = await this.getOrCreateCustomer(
        request.userId,
        request.billingDetails.email,
        request.billingDetails.name,
        {
          source: 'flight-booking',
          ipAddress: request.ipAddress || 'unknown',
        }
      );

      // Prepare payment intent parameters
      const paymentIntentParams: Stripe.PaymentIntentCreateParams = {
        amount: Math.round(request.amount * 100), // Convert to cents
        currency: request.currency.toLowerCase(),
        customer: customer.id,
        description: request.description,
        receipt_email: request.billingDetails.email,
        statement_descriptor: request.statementDescriptor?.substring(0, 22),
        
        // Security and compliance
        metadata: {
          userId: request.userId,
          bookingId: request.bookingId || '',
          captchaToken: request.captchaToken.substring(0, 50), // Truncate for storage
          ipAddress: request.ipAddress || 'unknown',
          createdAt: new Date().toISOString(),
          ...request.metadata,
        },

        // Payment method options
        payment_method_options: {
          card: {
            capture_method: 'manual',
            setup_future_usage: request.savePaymentMethod ? 'off_session' : undefined,
          },
        },

        // Confirmation method
        confirmation_method: request.confirmationMethod || 'automatic',
        confirm: request.confirmationMethod !== 'manual',
      };

      // Add payment method if provided
      if (request.paymentMethodId) {
        paymentIntentParams.payment_method = request.paymentMethodId;
      }

      // Add return URL for redirects
      if (request.returnUrl) {
        paymentIntentParams.return_url = request.returnUrl;
      }

      // Create payment intent
      const paymentIntent = await stripe.paymentIntents.create(paymentIntentParams);

      // Calculate security score based on various factors
      const securityScore = this.calculateSecurityScore(request, customer);

      // Log payment attempt
      await logSecurityEvent({
        type: 'PAYMENT_INTENT_CREATED',
        severity: securityScore < 0.5 ? 'high' : 'low',
        details: {
          paymentIntentId: paymentIntent.id,
          customerId: customer.id,
          userId: request.userId,
          amount: request.amount,
          currency: request.currency,
          securityScore,
          ipAddress: request.ipAddress,
        },
        metadata: {
          provider: 'stripe',
          endpoint: 'payment_intents.create',
          userAgent: request.userAgent,
        },
      });

      const processingTime = Date.now() - startTime;
      
      console.log(`✅ Payment intent created: ${paymentIntent.id} (${processingTime}ms)`);

      return {
        success: true,
        paymentIntent,
        clientSecret: paymentIntent.client_secret || undefined,
        status: paymentIntent.status,
        requiresAction: paymentIntent.status === 'requires_action',
        nextAction: paymentIntent.next_action,
        metadata: {
          processingTime,
          timestamp: new Date().toISOString(),
          provider: 'stripe',
          securityScore,
        },
      };

    } catch (error: any) {
      const processingTime = Date.now() - startTime;
      
      console.error('❌ Payment intent creation failed:', error);

      await logSecurityEvent({
        type: 'PAYMENT_INTENT_FAILED',
        severity: 'high',
        details: {
          userId: request.userId,
          amount: request.amount,
          currency: request.currency,
          error: error.message,
          errorType: error.type,
          errorCode: error.code,
          ipAddress: request.ipAddress,
        },
        metadata: {
          provider: 'stripe',
          endpoint: 'payment_intents.create',
          userAgent: request.userAgent,
        },
      });

      return {
        success: false,
        error: {
          type: error.type || 'api_error',
          code: error.code || 'unknown',
          message: error.message || 'Payment failed',
          param: error.param,
        },
        metadata: {
          processingTime,
          timestamp: new Date().toISOString(),
          provider: 'stripe',
          securityScore: 0,
        },
      };
    }
  }

  // Confirm payment intent
  static async confirmPaymentIntent(
    paymentIntentId: string,
    paymentMethodId?: string
  ): Promise<PaymentResult> {
    const startTime = Date.now();

    try {
      console.log(`🔄 Confirming payment intent: ${paymentIntentId}`);

      const confirmParams: Stripe.PaymentIntentConfirmParams = {};
      
      if (paymentMethodId) {
        confirmParams.payment_method = paymentMethodId;
      }

      if (!stripe) {
        throw new Error('Stripe instance not initialized');
      }

      const paymentIntent = await stripe.paymentIntents.confirm(
        paymentIntentId,
        confirmParams
      );

      const processingTime = Date.now() - startTime;

      await logSecurityEvent({
        type: 'PAYMENT_INTENT_CONFIRMED',
        severity: 'low',
        details: {
          paymentIntentId: paymentIntent.id,
          status: paymentIntent.status,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
        },
        metadata: {
          provider: 'stripe',
          endpoint: 'payment_intents.confirm',
        },
      });

      console.log(`✅ Payment intent confirmed: ${paymentIntent.status} (${processingTime}ms)`);

      return {
        success: paymentIntent.status === 'succeeded',
        paymentIntent,
        clientSecret: paymentIntent.client_secret || undefined,
        status: paymentIntent.status,
        requiresAction: paymentIntent.status === 'requires_action',
        nextAction: paymentIntent.next_action,
        metadata: {
          processingTime,
          timestamp: new Date().toISOString(),
          provider: 'stripe',
          securityScore: 0.8, // Confirmed payments get higher score
        },
      };

    } catch (error: any) {
      const processingTime = Date.now() - startTime;
      
      console.error('❌ Payment intent confirmation failed:', error);

      return {
        success: false,
        error: {
          type: error.type || 'api_error',
          code: error.code || 'unknown',
          message: error.message || 'Payment confirmation failed',
        },
        metadata: {
          processingTime,
          timestamp: new Date().toISOString(),
          provider: 'stripe',
          securityScore: 0,
        },
      };
    }
  }

  // Process refund
  static async processRefund(request: RefundRequest): Promise<RefundResult> {
    const startTime = Date.now();

    try {
      console.log(`🔄 Processing refund for payment: ${request.paymentIntentId}`);

      if (!stripe) {
        throw new Error('Stripe instance not initialized');
      }

      // Get original payment intent
      const paymentIntent = await stripe.paymentIntents.retrieve(request.paymentIntentId);
      
      if (!paymentIntent || paymentIntent.status !== 'succeeded') {
        throw new Error('Payment intent not found or not succeeded');
      }

      // Create refund
      const refundParams: Stripe.RefundCreateParams = {
        payment_intent: request.paymentIntentId,
        reason: request.reason,
        metadata: {
          refundedAt: new Date().toISOString(),
          ...request.metadata,
        },
      };

      if (request.amount) {
        refundParams.amount = Math.round(request.amount * 100); // Convert to cents
      }

      const refund = await stripe.refunds.create(refundParams);

      const processingTime = Date.now() - startTime;

      await logSecurityEvent({
        type: 'PAYMENT_REFUNDED',
        severity: 'low',
        details: {
          refundId: refund.id,
          paymentIntentId: request.paymentIntentId,
          amount: refund.amount,
          currency: refund.currency,
          reason: request.reason,
        },
        metadata: {
          provider: 'stripe',
          endpoint: 'refunds.create',
        },
      });

      console.log(`✅ Refund processed: ${refund.id} (${processingTime}ms)`);

      return {
        success: true,
        refund,
        metadata: {
          processingTime,
          timestamp: new Date().toISOString(),
          originalAmount: paymentIntent.amount / 100,
          refundedAmount: refund.amount / 100,
        },
      };

    } catch (error: any) {
      const processingTime = Date.now() - startTime;
      
      console.error('❌ Refund processing failed:', error);

      return {
        success: false,
        error: {
          type: error.type || 'api_error',
          code: error.code || 'unknown',
          message: error.message || 'Refund failed',
        },
        metadata: {
          processingTime,
          timestamp: new Date().toISOString(),
          originalAmount: 0,
          refundedAmount: 0,
        },
      };
    }
  }

  // Get payment methods for customer
  static async getPaymentMethods(customerId: string): Promise<PaymentMethod[]> {
    try {
      if (!stripe) {
        throw new Error('Stripe instance not initialized');
      }

      const paymentMethods = await stripe.paymentMethods.list({
        customer: customerId,
        type: 'card',
      });

      return paymentMethods.data.map(pm => this.formatPaymentMethod(pm));
    } catch (error: any) {
      console.error('❌ Failed to retrieve payment methods:', error);
      return [];
    }
  }

  // Add payment method to customer
  static async addPaymentMethod(
    customerId: string,
    paymentMethodId: string
  ): Promise<PaymentMethod | null> {
    try {
      if (!stripe) {
        throw new Error('Stripe instance not initialized');
      }

      const paymentMethod = await stripe.paymentMethods.attach(paymentMethodId, {
        customer: customerId,
      });

      return this.formatPaymentMethod(paymentMethod);
    } catch (error: any) {
      console.error('❌ Failed to attach payment method:', error);
      return null;
    }
  }

  // Remove payment method
  static async removePaymentMethod(paymentMethodId: string): Promise<boolean> {
    try {
      if (!stripe) {
        throw new Error('Stripe instance not initialized');
      }

      await stripe.paymentMethods.detach(paymentMethodId);
      return true;
    } catch (error: any) {
      console.error('❌ Failed to detach payment method:', error);
      return false;
    }
  }

  // Get payment intent details
  static async getPaymentIntent(paymentIntentId: string): Promise<PaymentResult> {
    try {
      if (!stripe) {
        throw new Error('Stripe instance not initialized');
      }

      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

      return {
        success: true,
        paymentIntent,
        clientSecret: paymentIntent.client_secret || undefined,
        status: paymentIntent.status,
        metadata: {
          processingTime: 0,
          timestamp: new Date().toISOString(),
          provider: 'stripe',
          securityScore: 1.0,
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: {
          type: error.type || 'api_error',
          code: error.code || 'unknown',
          message: error.message || 'Failed to retrieve payment intent',
        },
        metadata: {
          processingTime: 0,
          timestamp: new Date().toISOString(),
          provider: 'stripe',
          securityScore: 0,
        },
      };
    }
  }

  // Private helper methods
  private static validatePaymentRequest(request: PaymentRequest): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!request.amount || request.amount <= 0) {
      errors.push('Invalid amount');
    }

    if (!request.currency || request.currency.length !== 3) {
      errors.push('Invalid currency');
    }

    if (!request.userId) {
      errors.push('User ID is required');
    }

    if (!request.captchaToken) {
      errors.push('CAPTCHA token is required');
    }

    if (!request.billingDetails.email) {
      errors.push('Email is required');
    }

    if (!request.billingDetails.name) {
      errors.push('Name is required');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  private static calculateSecurityScore(
    request: PaymentRequest,
    customer: Stripe.Customer
  ): number {
    let score = 0.5; // Base score

    // Customer history
    if (customer.created && (Date.now() - customer.created * 1000) > 30 * 24 * 60 * 60 * 1000) {
      score += 0.2; // Customer older than 30 days
    }

    // Payment method provided
    if (request.paymentMethodId) {
      score += 0.1;
    }

    // Billing address provided
    if (request.billingDetails.address.line1) {
      score += 0.1;
    }

    // CAPTCHA token provided
    if (request.captchaToken) {
      score += 0.1;
    }

    return Math.min(score, 1.0);
  }

  private static formatPaymentMethod(pm: Stripe.PaymentMethod): PaymentMethod {
    return {
      id: pm.id,
      type: pm.type as 'card' | 'bank_account' | 'wallet' | 'buy_now_pay_later',
      subtype: pm.card?.brand,
      brand: pm.card?.brand,
      last4: pm.card?.last4,
      expiryMonth: pm.card?.exp_month,
      expiryYear: pm.card?.exp_year,
      isDefault: false, // Would need to check customer default
      billingAddress: pm.billing_details.address ? {
        street: pm.billing_details.address.line1 || '',
        city: pm.billing_details.address.city || '',
        state: pm.billing_details.address.state || '',
        country: pm.billing_details.address.country || '',
        postalCode: pm.billing_details.address.postal_code || '',
      } : undefined,
      metadata: {
        addedAt: new Date(pm.created * 1000).toISOString(),
        verified: true,
      },
    };
  }

  // Webhook handling
  static async handleWebhook(
    payload: string | Buffer,
    signature: string
  ): Promise<{ success: boolean; event?: Stripe.Event; error?: string }> {
    if (!stripe || !isStripeConfigured || !process.env.STRIPE_WEBHOOK_SECRET) {
      return { success: false, error: 'Stripe webhook handling is not configured' };
    }
    
    try {
      const event = stripe.webhooks.constructEvent(
        payload,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );

      console.log(`🎣 Received Stripe webhook: ${event.type}`);

      // Handle different event types
      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent);
          break;
        
        case 'payment_intent.payment_failed':
          await this.handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
          break;

        case 'charge.dispute.created':
          await this.handleChargeDispute(event.data.object as any);
          break;

        default:
          console.log(`ℹ️ Unhandled event type: ${event.type}`);
      }

      return { success: true, event };
    } catch (error: any) {
      console.error('❌ Webhook handling failed:', error);
      return { success: false, error: error.message };
    }
  }

  private static async handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    await logSecurityEvent({
      type: 'PAYMENT_SUCCEEDED',
      severity: 'low',
      details: {
        paymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        customerId: paymentIntent.customer,
      },
      metadata: {
        provider: 'stripe',
        webhook: true,
      },
    });
  }

  private static async handlePaymentFailed(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    await logSecurityEvent({
      type: 'PAYMENT_FAILED',
      severity: 'medium',
      details: {
        paymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        customerId: paymentIntent.customer,
        lastPaymentError: paymentIntent.last_payment_error?.message,
      },
      metadata: {
        provider: 'stripe',
        webhook: true,
      },
    });
  }

  private static async handleChargeDispute(charge: Stripe.Charge): Promise<void> {
    await logSecurityEvent({
      type: 'CHARGE_DISPUTED',
      severity: 'high',
      details: {
        chargeId: charge.id,
        amount: charge.amount,
        currency: charge.currency,
        customerId: charge.customer,
      },
      metadata: {
        provider: 'stripe',
        webhook: true,
      },
    });
  }
}

export default EnhancedStripeService;