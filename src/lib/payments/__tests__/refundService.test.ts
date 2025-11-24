/**
 * Unit Tests - Refund Service
 * 
 * Tests for the refund processing service including full refunds,
 * partial refunds, webhook handling, and amount calculations
 */

import { PrismaClient } from '@prisma/client';
import Stripe from 'stripe';
import {
  createFullRefund,
  createPartialRefund,
  handleRefundWebhook,
  getRefundHistory,
  calculateAvailableRefundAmount,
  getRefundByReference,
  cancelRefundRequest,
} from '../refundService';
import * as emailService from '../../services/emailService';

// Mock dependencies
jest.mock('@prisma/client');
jest.mock('stripe');
jest.mock('../../services/emailService');

describe('Refund Service', () => {
  let mockPrisma: jest.Mocked<PrismaClient>;
  let mockStripe: jest.Mocked<Stripe>;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Setup Prisma mock
    mockPrisma = {
      booking: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      refund: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      auditLog: {
        create: jest.fn(),
      },
      $transaction: jest.fn((callback) => callback(mockPrisma)),
    } as any;

    // Setup Stripe mock
    mockStripe = {
      refunds: {
        create: jest.fn(),
        retrieve: jest.fn(),
      },
      paymentIntents: {
        retrieve: jest.fn(),
      },
    } as any;

    // Mock environment variables
    process.env.STRIPE_SECRET_KEY = 'sk_test_mock';
  });

  describe('createFullRefund', () => {
    const mockBooking = {
      id: 'booking-123',
      bookingReference: 'BK123456',
      userId: 'user-123',
      status: 'CONFIRMED',
      totalAmount: 500,
      currency: 'USD',
      stripePaymentIntentId: 'pi_test_123',
      user: {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
      },
    };

    const mockStripeRefund = {
      id: 'ref_test_123',
      amount: 50000,
      status: 'succeeded',
      charge: 'ch_test_123',
    };

    it('should create a full refund successfully', async () => {
      mockPrisma.booking.findUnique.mockResolvedValue(mockBooking as any);
      mockStripe.refunds.create.mockResolvedValue(mockStripeRefund as any);
      mockPrisma.refund.create.mockResolvedValue({
        id: 'refund-123',
        refundReference: 'REF123456',
        approvedAmount: 500,
        status: 'COMPLETED',
      } as any);
      
      const emailSpy = jest.spyOn(emailService, 'sendRefundConfirmationEmail').mockResolvedValue();

      const result = await createFullRefund({
        bookingId: 'booking-123',
        adminId: 'admin-123',
        reason: 'Customer request',
      });

      expect(mockPrisma.booking.findUnique).toHaveBeenCalledWith({
        where: { id: 'booking-123' },
        include: { user: true },
      });

      expect(mockStripe.refunds.create).toHaveBeenCalledWith({
        payment_intent: 'pi_test_123',
        reason: 'requested_by_customer',
        metadata: expect.objectContaining({
          bookingId: 'booking-123',
          bookingReference: 'BK123456',
          refundType: 'FULL',
        }),
      });

      expect(mockPrisma.refund.create).toHaveBeenCalled();
      expect(mockPrisma.booking.update).toHaveBeenCalledWith({
        where: { id: 'booking-123' },
        data: { status: 'REFUNDED' },
      });

      expect(emailSpy).toHaveBeenCalled();
      expect(result.success).toBe(true);
      expect(result.refund).toBeDefined();
    });

    it('should reject refund if booking not found', async () => {
      mockPrisma.booking.findUnique.mockResolvedValue(null);

      const result = await createFullRefund({
        bookingId: 'non-existent',
        adminId: 'admin-123',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
    });

    it('should reject refund if booking already refunded', async () => {
      mockPrisma.booking.findUnique.mockResolvedValue({
        ...mockBooking,
        status: 'REFUNDED',
      } as any);

      const result = await createFullRefund({
        bookingId: 'booking-123',
        adminId: 'admin-123',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('already refunded');
    });

    it('should reject refund if no payment intent', async () => {
      mockPrisma.booking.findUnique.mockResolvedValue({
        ...mockBooking,
        stripePaymentIntentId: null,
      } as any);

      const result = await createFullRefund({
        bookingId: 'booking-123',
        adminId: 'admin-123',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('No payment intent');
    });

    it('should handle Stripe API errors', async () => {
      mockPrisma.booking.findUnique.mockResolvedValue(mockBooking as any);
      mockStripe.refunds.create.mockRejectedValue(new Error('Stripe error'));

      const result = await createFullRefund({
        bookingId: 'booking-123',
        adminId: 'admin-123',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Failed to process refund');
    });
  });

  describe('createPartialRefund', () => {
    const mockBooking = {
      id: 'booking-123',
      bookingReference: 'BK123456',
      userId: 'user-123',
      status: 'CONFIRMED',
      totalAmount: 500,
      currency: 'USD',
      stripePaymentIntentId: 'pi_test_123',
      user: {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
      },
    };

    it('should create a partial refund successfully', async () => {
      mockPrisma.booking.findUnique.mockResolvedValue(mockBooking as any);
      mockPrisma.refund.findMany.mockResolvedValue([]);
      mockStripe.refunds.create.mockResolvedValue({
        id: 'ref_test_123',
        amount: 20000,
        status: 'succeeded',
      } as any);
      mockPrisma.refund.create.mockResolvedValue({
        id: 'refund-123',
        refundReference: 'REF123456',
        approvedAmount: 200,
        status: 'COMPLETED',
      } as any);

      const result = await createPartialRefund({
        bookingId: 'booking-123',
        amount: 200,
        adminId: 'admin-123',
        reason: 'Service issue',
      });

      expect(mockStripe.refunds.create).toHaveBeenCalledWith({
        payment_intent: 'pi_test_123',
        amount: 20000, // Amount in cents
        reason: 'requested_by_customer',
        metadata: expect.objectContaining({
          refundType: 'PARTIAL',
        }),
      });

      expect(result.success).toBe(true);
      expect(result.refund).toBeDefined();
    });

    it('should reject if amount is zero or negative', async () => {
      const result = await createPartialRefund({
        bookingId: 'booking-123',
        amount: 0,
        adminId: 'admin-123',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('greater than 0');
    });

    it('should reject if amount exceeds available refund', async () => {
      mockPrisma.booking.findUnique.mockResolvedValue(mockBooking as any);
      mockPrisma.refund.findMany.mockResolvedValue([
        { approvedAmount: 300, status: 'COMPLETED' },
      ] as any);

      const result = await createPartialRefund({
        bookingId: 'booking-123',
        amount: 300, // Total would exceed booking amount
        adminId: 'admin-123',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('exceeds available');
    });

    it('should handle multiple partial refunds correctly', async () => {
      mockPrisma.booking.findUnique.mockResolvedValue(mockBooking as any);
      mockPrisma.refund.findMany.mockResolvedValue([
        { approvedAmount: 100, status: 'COMPLETED' },
        { approvedAmount: 150, status: 'COMPLETED' },
      ] as any);

      const result = await createPartialRefund({
        bookingId: 'booking-123',
        amount: 200,
        adminId: 'admin-123',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('exceeds available');
    });
  });

  describe('calculateAvailableRefundAmount', () => {
    it('should calculate correct available amount with no refunds', async () => {
      mockPrisma.booking.findUnique.mockResolvedValue({
        totalAmount: 500,
      } as any);
      mockPrisma.refund.findMany.mockResolvedValue([]);

      const available = await calculateAvailableRefundAmount('booking-123');

      expect(available).toBe(500);
    });

    it('should calculate correct available amount with completed refunds', async () => {
      mockPrisma.booking.findUnique.mockResolvedValue({
        totalAmount: 500,
      } as any);
      mockPrisma.refund.findMany.mockResolvedValue([
        { approvedAmount: 100, status: 'COMPLETED' },
        { approvedAmount: 50, status: 'COMPLETED' },
      ] as any);

      const available = await calculateAvailableRefundAmount('booking-123');

      expect(available).toBe(350);
    });

    it('should ignore pending refunds', async () => {
      mockPrisma.booking.findUnique.mockResolvedValue({
        totalAmount: 500,
      } as any);
      mockPrisma.refund.findMany.mockResolvedValue([
        { approvedAmount: 100, status: 'COMPLETED' },
        { approvedAmount: 50, status: 'PENDING' },
      ] as any);

      const available = await calculateAvailableRefundAmount('booking-123');

      expect(available).toBe(400);
    });

    it('should return 0 if booking not found', async () => {
      mockPrisma.booking.findUnique.mockResolvedValue(null);

      const available = await calculateAvailableRefundAmount('non-existent');

      expect(available).toBe(0);
    });
  });

  describe('handleRefundWebhook', () => {
    const mockRefund = {
      id: 'refund-123',
      bookingId: 'booking-123',
      status: 'PROCESSING',
      refundReference: 'REF123456',
      booking: {
        user: {
          email: 'test@example.com',
          firstName: 'John',
        },
        bookingReference: 'BK123456',
      },
    };

    it('should handle refund.succeeded webhook', async () => {
      mockPrisma.refund.findUnique.mockResolvedValue(mockRefund as any);
      mockPrisma.refund.update.mockResolvedValue({
        ...mockRefund,
        status: 'COMPLETED',
      } as any);

      const result = await handleRefundWebhook({
        type: 'refund.succeeded',
        data: {
          object: {
            id: 'ref_stripe_123',
            metadata: { refundId: 'refund-123' },
          },
        },
      } as any);

      expect(mockPrisma.refund.update).toHaveBeenCalledWith({
        where: { id: 'refund-123' },
        data: expect.objectContaining({
          status: 'COMPLETED',
        }),
      });

      expect(result.success).toBe(true);
    });

    it('should handle refund.failed webhook', async () => {
      mockPrisma.refund.findUnique.mockResolvedValue(mockRefund as any);
      mockPrisma.refund.update.mockResolvedValue({
        ...mockRefund,
        status: 'REJECTED',
      } as any);

      const result = await handleRefundWebhook({
        type: 'refund.failed',
        data: {
          object: {
            id: 'ref_stripe_123',
            metadata: { refundId: 'refund-123' },
            failure_reason: 'insufficient_funds',
          },
        },
      } as any);

      expect(mockPrisma.refund.update).toHaveBeenCalledWith({
        where: { id: 'refund-123' },
        data: expect.objectContaining({
          status: 'REJECTED',
        }),
      });

      expect(result.success).toBe(true);
    });

    it('should ignore webhook if refund not found', async () => {
      mockPrisma.refund.findUnique.mockResolvedValue(null);

      const result = await handleRefundWebhook({
        type: 'refund.succeeded',
        data: {
          object: {
            id: 'ref_stripe_123',
            metadata: { refundId: 'non-existent' },
          },
        },
      } as any);

      expect(result.success).toBe(false);
    });
  });

  describe('getRefundHistory', () => {
    const mockRefunds = [
      {
        id: 'refund-1',
        refundReference: 'REF001',
        status: 'COMPLETED',
        approvedAmount: 100,
        createdAt: new Date('2024-01-01'),
      },
      {
        id: 'refund-2',
        refundReference: 'REF002',
        status: 'COMPLETED',
        approvedAmount: 50,
        createdAt: new Date('2024-01-02'),
      },
    ];

    it('should return refund history for a booking', async () => {
      mockPrisma.refund.findMany.mockResolvedValue(mockRefunds as any);

      const result = await getRefundHistory('booking-123');

      expect(mockPrisma.refund.findMany).toHaveBeenCalledWith({
        where: { bookingId: 'booking-123' },
        orderBy: { createdAt: 'desc' },
      });

      expect(result).toHaveLength(2);
      expect(result[0].refundReference).toBe('REF001');
    });

    it('should return empty array if no refunds', async () => {
      mockPrisma.refund.findMany.mockResolvedValue([]);

      const result = await getRefundHistory('booking-123');

      expect(result).toEqual([]);
    });
  });

  describe('getRefundByReference', () => {
    it('should find refund by reference', async () => {
      const mockRefund = {
        id: 'refund-123',
        refundReference: 'REF123456',
        status: 'COMPLETED',
      };

      mockPrisma.refund.findUnique.mockResolvedValue(mockRefund as any);

      const result = await getRefundByReference('REF123456');

      expect(mockPrisma.refund.findUnique).toHaveBeenCalledWith({
        where: { refundReference: 'REF123456' },
        include: expect.any(Object),
      });

      expect(result).toEqual(mockRefund);
    });

    it('should return null if not found', async () => {
      mockPrisma.refund.findUnique.mockResolvedValue(null);

      const result = await getRefundByReference('NON-EXISTENT');

      expect(result).toBeNull();
    });
  });

  describe('cancelRefundRequest', () => {
    it('should cancel a pending refund', async () => {
      mockPrisma.refund.findUnique.mockResolvedValue({
        id: 'refund-123',
        status: 'PENDING',
      } as any);

      mockPrisma.refund.update.mockResolvedValue({
        id: 'refund-123',
        status: 'CANCELLED',
      } as any);

      const result = await cancelRefundRequest('refund-123', 'admin-123');

      expect(mockPrisma.refund.update).toHaveBeenCalledWith({
        where: { id: 'refund-123' },
        data: { status: 'CANCELLED' },
      });

      expect(result.success).toBe(true);
    });

    it('should reject cancellation of completed refund', async () => {
      mockPrisma.refund.findUnique.mockResolvedValue({
        id: 'refund-123',
        status: 'COMPLETED',
      } as any);

      const result = await cancelRefundRequest('refund-123', 'admin-123');

      expect(result.success).toBe(false);
      expect(result.error).toContain('cannot be cancelled');
    });
  });

  describe('Error handling', () => {
    it('should handle database errors gracefully', async () => {
      mockPrisma.booking.findUnique.mockRejectedValue(new Error('Database error'));

      const result = await createFullRefund({
        bookingId: 'booking-123',
        adminId: 'admin-123',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should handle email sending failures gracefully', async () => {
      mockPrisma.booking.findUnique.mockResolvedValue({
        id: 'booking-123',
        status: 'CONFIRMED',
        totalAmount: 500,
        stripePaymentIntentId: 'pi_test_123',
        user: { email: 'test@example.com' },
      } as any);
      
      mockStripe.refunds.create.mockResolvedValue({
        id: 'ref_test_123',
        status: 'succeeded',
      } as any);

      mockPrisma.refund.create.mockResolvedValue({
        id: 'refund-123',
        refundReference: 'REF123456',
      } as any);

      jest.spyOn(emailService, 'sendRefundConfirmationEmail').mockRejectedValue(
        new Error('Email service error')
      );

      // Should still succeed even if email fails
      const result = await createFullRefund({
        bookingId: 'booking-123',
        adminId: 'admin-123',
      });

      expect(result.success).toBe(true);
    });
  });
});
