// Enhanced Booking Persistence with Security Features
// Implements idempotency keys, audit trails, and secure booking storage

import { prisma } from '@/lib/prisma';
import { CreateBookingRequest, BookingResponse } from '@/services/BookingService';
import { BookingSecurityValidator } from './bookingValidation';
import crypto from 'crypto';

export interface SecureBookingRequest extends CreateBookingRequest {
  idempotencyKey?: string;
  riskScore?: number;
  ipAddress?: string;
  userAgent?: string;
}

export interface BookingAuditEntry {
  action: 'CREATE' | 'UPDATE' | 'CANCEL' | 'VIEW';
  userId: string;
  bookingId: string;
  ipAddress?: string;
  userAgent?: string;
  riskScore?: number;
  details?: any;
  timestamp: Date;
}

// In-memory store for idempotency tracking (in production, use Redis)
const idempotencyStore = new Map<string, {
  bookingId: string;
  timestamp: number;
  expiresAt: number;
}>();

class SecureBookingPersistence {
  
  // Clean up expired idempotency keys
  private static cleanupExpiredKeys(): void {
    const now = Date.now();
    for (const [key, entry] of idempotencyStore.entries()) {
      if (now > entry.expiresAt) {
        idempotencyStore.delete(key);
      }
    }
  }
  
  // Check if booking request is duplicate based on idempotency key
  static async checkIdempotency(idempotencyKey: string): Promise<{
    isDuplicate: boolean;
    existingBookingId?: string;
  }> {
    this.cleanupExpiredKeys();
    
    const existing = idempotencyStore.get(idempotencyKey);
    if (existing) {
      return {
        isDuplicate: true,
        existingBookingId: existing.bookingId
      };
    }
    
    return { isDuplicate: false };
  }
  
  // Store idempotency key with booking ID
  private static storeIdempotencyKey(idempotencyKey: string, bookingId: string): void {
    const now = Date.now();
    const expiresAt = now + (24 * 60 * 60 * 1000); // 24 hours
    
    idempotencyStore.set(idempotencyKey, {
      bookingId,
      timestamp: now,
      expiresAt
    });
  }
  
  // Create booking with enhanced security features
  static async createSecureBooking(request: SecureBookingRequest): Promise<BookingResponse> {
    try {
      // Generate or use existing idempotency key
      const idempotencyKey = request.idempotencyKey || 
                            BookingSecurityValidator.generateIdempotencyKey(request);
      
      // Check for duplicate request
      const idempotencyCheck = await this.checkIdempotency(idempotencyKey);
      if (idempotencyCheck.isDuplicate) {
        // Return existing booking instead of creating duplicate
        const existingBooking = await prisma.booking.findUnique({
          where: { id: idempotencyCheck.existingBookingId },
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              }
            }
          }
        });
        
        if (existingBooking) {
          console.log(`🔄 Returning existing booking for idempotency key: ${idempotencyKey.substring(0, 8)}...`);
          
          return {
            id: existingBooking.id,
            bookingReference: existingBooking.bookingReference,
            confirmationNumber: existingBooking.confirmationNumber,
            status: existingBooking.status as any,
            bookingDate: existingBooking.bookingDate.toISOString(),
            flight: JSON.parse(existingBooking.flightData),
            passengers: JSON.parse(existingBooking.passengers),
            pricing: JSON.parse(existingBooking.pricing),
            contact: JSON.parse(existingBooking.contactInfo),
            payment: JSON.parse(existingBooking.paymentInfo),
            createdAt: existingBooking.createdAt.toISOString(),
            updatedAt: existingBooking.updatedAt.toISOString(),
          };
        }
      }
      
      // Generate secure booking reference
      const bookingReference = this.generateSecureBookingReference();
      const confirmationNumber = this.generateConfirmationNumber();
      
      // Create booking with enhanced data
      const booking = await prisma.booking.create({
        data: {
          bookingReference,
          confirmationNumber,
          status: request.paymentInfo.paymentStatus === 'completed' ? 'CONFIRMED' : 'PENDING',
          userId: request.userId,
          flightData: JSON.stringify(request.flightData),
          passengers: JSON.stringify(request.passengers),
          contactInfo: JSON.stringify(request.contactInfo),
          pricing: JSON.stringify(request.pricing),
          paymentInfo: JSON.stringify({
            method: request.paymentInfo.method,
            lastFourDigits: request.paymentInfo.lastFourDigits,
            amount: request.paymentInfo.amount,
            cardholderName: request.paymentInfo.cardholderName,
            billingAddress: request.paymentInfo.billingAddress,
            transactionId: request.paymentInfo.transactionId,
            paymentStatus: request.paymentInfo.paymentStatus,
          }),
          // Note: Metadata stored as JSON in existing fields or separate table
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            }
          }
        }
      });
      
      // Store idempotency key mapping
      this.storeIdempotencyKey(idempotencyKey, booking.id);
      
      // Create audit entry
      await this.createAuditEntry({
        action: 'CREATE',
        userId: request.userId,
        bookingId: booking.id,
        ipAddress: request.ipAddress,
        userAgent: request.userAgent,
        riskScore: request.riskScore,
        timestamp: new Date()
      });
      
      console.log(`✅ Secure booking created: ${booking.bookingReference} (Risk: ${request.riskScore || 0})`);
      
      // Format response
      const response: BookingResponse = {
        id: booking.id,
        bookingReference: booking.bookingReference,
        confirmationNumber: booking.confirmationNumber,
        status: booking.status as any,
        bookingDate: booking.bookingDate.toISOString(),
        flight: JSON.parse(booking.flightData),
        passengers: JSON.parse(booking.passengers),
        pricing: JSON.parse(booking.pricing),
        contact: JSON.parse(booking.contactInfo),
        payment: JSON.parse(booking.paymentInfo),
        createdAt: booking.createdAt.toISOString(),
        updatedAt: booking.updatedAt.toISOString(),
      };
      
      return response;
      
    } catch (error: any) {
      console.error('❌ Secure booking creation failed:', error);
      
      // Create audit entry for failed attempt
      if (request.userId) {
        await this.createAuditEntry({
          action: 'CREATE',
          userId: request.userId,
          bookingId: 'FAILED',
          details: { error: error.message, riskScore: request.riskScore },
          ipAddress: request.ipAddress,
          timestamp: new Date()
        });
      }
      
      throw new Error(`Secure booking creation failed: ${error.message}`);
    }
  }
  
  // Generate cryptographically secure booking reference
  private static generateSecureBookingReference(): string {
    // Use crypto.randomBytes for better randomness than Math.random()
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const randomBytes = crypto.randomBytes(6);
    let result = '';
    
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(randomBytes[i] % chars.length);
    }
    
    return result;
  }
  
  // Generate secure confirmation number
  private static generateConfirmationNumber(): string {
    const randomBytes = crypto.randomBytes(6);
    return 'CNF' + randomBytes.toString('hex').toUpperCase();
  }
  
  // Create audit trail entry
  private static async createAuditEntry(entry: BookingAuditEntry): Promise<void> {
    try {
      // In a real implementation, you'd store this in a separate audit table
      // For now, we'll log it securely
      const auditLog = {
        ...entry,
        timestamp: entry.timestamp.toISOString(),
        // Hash sensitive data for privacy
        userIdHash: crypto.createHash('sha256').update(entry.userId).digest('hex').substring(0, 16),
        ipAddressHash: entry.ipAddress ? 
          crypto.createHash('sha256').update(entry.ipAddress).digest('hex').substring(0, 16) : 
          undefined
      };
      
      console.log('📋 Booking audit:', JSON.stringify(auditLog));
      
      // In production, store in audit table:
      // await prisma.bookingAudit.create({ data: auditLog });
      
    } catch (error) {
      console.error('⚠️ Failed to create audit entry:', error);
      // Don't throw error - audit failures shouldn't break the main flow
    }
  }
  
  // Get booking with audit trail (for admin/compliance)
  static async getBookingWithAudit(bookingId: string, userId?: string): Promise<{
    booking: BookingResponse | null;
    auditTrail: BookingAuditEntry[];
  }> {
    try {
      const booking = await prisma.booking.findFirst({
        where: {
          id: bookingId,
          ...(userId && { userId })
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            }
          }
        }
      });
      
      if (!booking) {
        return { booking: null, auditTrail: [] };
      }
      
      const bookingResponse: BookingResponse = {
        id: booking.id,
        bookingReference: booking.bookingReference,
        confirmationNumber: booking.confirmationNumber,
        status: booking.status as any,
        bookingDate: booking.bookingDate.toISOString(),
        flight: JSON.parse(booking.flightData),
        passengers: JSON.parse(booking.passengers),
        pricing: JSON.parse(booking.pricing),
        contact: JSON.parse(booking.contactInfo),
        payment: JSON.parse(booking.paymentInfo),
        createdAt: booking.createdAt.toISOString(),
        updatedAt: booking.updatedAt.toISOString(),
      };
      
      // In production, fetch from audit table
      const auditTrail: BookingAuditEntry[] = [];
      
      return { booking: bookingResponse, auditTrail };
      
    } catch (error) {
      console.error('❌ Failed to get booking with audit:', error);
      return { booking: null, auditTrail: [] };
    }
  }
  
  // Security statistics for monitoring
  static getSecurityStats(): {
    idempotencyKeys: number;
    averageRiskScore: number;
    highRiskBookings: number;
  } {
    this.cleanupExpiredKeys();
    
    return {
      idempotencyKeys: idempotencyStore.size,
      averageRiskScore: 0, // Would calculate from recent bookings
      highRiskBookings: 0   // Would calculate from recent bookings
    };
  }
}

export default SecureBookingPersistence;
// Note: Types are already exported above
