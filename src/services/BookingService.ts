import { prisma } from '@/lib/prisma';
import { BookingStatus } from '@/generated/prisma';
import { BookingSecurityValidator } from '@/lib/security/bookingValidation';

export interface CreateBookingRequest {
  userId: string;
  flightData: {
    id: string;
    airline: string;
    flightNumber: string;
    origin: string;
    destination: string;
    departDate: string;
    departTime: string;
    arriveDate: string;
    arriveTime: string;
    duration: string;
    aircraft: string;
    terminal?: string;
    gate?: string;
  };
  passengers: Array<{
    id: string;
    firstName: string;
    lastName: string;
    type: 'adult' | 'child' | 'infant';
    gender?: 'male' | 'female' | 'other';
    dateOfBirth?: string;
    nationality?: string;
    passportNumber?: string;
    passportExpiry?: string;
    issuingCountry?: string;
    email?: string;
    phone?: string;
    specialRequests?: string;
    frequentFlyerNumber?: string;
    knownTravelerNumber?: string;
    redressNumber?: string;
    seatNumber?: string;
  }>;
  contactInfo: {
    email: string;
    phone: string;
    alternatePhone?: string;
    emergencyContactName: string;
    emergencyContactPhone: string;
    emergencyContactRelation: string;
  };
  pricing: {
    subtotal: number;
    taxes: number;
    fees: number;
    seatFees: number;
    total: number;
  };
  paymentInfo: {
    method: string;
    lastFourDigits: string;
    amount: number;
    cardholderName?: string;
    billingAddress?: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
    transactionId?: string;
    paymentStatus: 'pending' | 'completed' | 'failed';
  };
  selectedSeats?: Array<{
    id: string;
    row: number;
    letter: string;
    type: string;
    price: number;
  }>;
}

export interface BookingResponse {
  id: string;
  bookingReference: string;
  confirmationNumber: string;
  status: BookingStatus;
  bookingDate: string;
  flight: any;
  passengers: any[];
  pricing: any;
  contact: any;
  payment: any;
  createdAt: string;
  updatedAt: string;
}

export class BookingService {
  // Generate unique booking reference
  static generateBookingReference(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // Generate confirmation number
  static generateConfirmationNumber(): string {
    return 'CNF' + Math.random().toString(36).substr(2, 9).toUpperCase();
  }

  // Calculate pricing with fees and taxes
  static calculatePricing(flightPrice: number, passengers: number, seatFees: number = 0) {
    const subtotal = flightPrice * passengers;
    const taxRate = 0.12; // 12% tax rate
    const baseFee = 25; // Base booking fee per passenger
    const taxes = Math.round(subtotal * taxRate);
    const fees = baseFee * passengers;
    
    return {
      subtotal,
      taxes,
      fees,
      seatFees,
      total: subtotal + taxes + fees + seatFees
    };
  }

  // Create new booking
  static async createBooking(request: CreateBookingRequest): Promise<BookingResponse> {
    try {
      // Generate unique identifiers
      const bookingReference = this.generateBookingReference();
      const confirmationNumber = this.generateConfirmationNumber();

      // Ensure booking reference is unique
      let attempts = 0;
      let uniqueReference = bookingReference;
      while (attempts < 5) {
        const existingBooking = await prisma.booking.findUnique({
          where: { bookingReference: uniqueReference }
        });
        
        if (!existingBooking) break;
        
        uniqueReference = this.generateBookingReference();
        attempts++;
      }

      if (attempts >= 5) {
        throw new Error('Could not generate unique booking reference');
      }

      // Create booking in database
      const booking = await prisma.booking.create({
        data: {
          bookingReference: uniqueReference,
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
            // Don't store sensitive payment details
          }),
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

      console.log(`✅ Booking created: ${booking.bookingReference} for user ${request.userId}`);
      return response;

    } catch (error) {
      console.error('Error creating booking:', error);
      throw new Error(`Failed to create booking: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get booking by ID or reference
  static async getBooking(identifier: string, userId?: string): Promise<BookingResponse | null> {
    try {
      const booking = await prisma.booking.findFirst({
        where: {
          OR: [
            { id: identifier },
            { bookingReference: identifier.toUpperCase() },
            { confirmationNumber: identifier.toUpperCase() }
          ],
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
        return null;
      }

      return {
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
    } catch (error) {
      console.error('Error fetching booking:', error);
      return null;
    }
  }

  // Get user's bookings
  static async getUserBookings(userId: string, limit: number = 20, offset: number = 0): Promise<{
    bookings: BookingResponse[];
    total: number;
    hasMore: boolean;
  }> {
    try {
      const [bookings, total] = await Promise.all([
        prisma.booking.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          take: limit,
          skip: offset,
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
        }),
        prisma.booking.count({
          where: { userId }
        })
      ]);

      const formattedBookings: BookingResponse[] = bookings.map(booking => ({
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
      }));

      return {
        bookings: formattedBookings,
        total,
        hasMore: offset + limit < total
      };
    } catch (error) {
      console.error('Error fetching user bookings:', error);
      return {
        bookings: [],
        total: 0,
        hasMore: false
      };
    }
  }

  // Update booking status
  static async updateBookingStatus(bookingId: string, status: BookingStatus, userId?: string): Promise<BookingResponse | null> {
    try {
      const booking = await prisma.booking.update({
        where: {
          id: bookingId,
          ...(userId && { userId })
        },
        data: {
          status,
          updatedAt: new Date()
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

      return {
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
    } catch (error) {
      console.error('Error updating booking status:', error);
      return null;
    }
  }

  // Cancel booking
  static async cancelBooking(bookingId: string, userId?: string): Promise<boolean> {
    try {
      await prisma.booking.update({
        where: {
          id: bookingId,
          ...(userId && { userId })
        },
        data: {
          status: 'CANCELLED',
          updatedAt: new Date()
        }
      });

      console.log(`✅ Booking cancelled: ${bookingId}`);
      return true;
    } catch (error) {
      console.error('Error cancelling booking:', error);
      return false;
    }
  }

  // Get booking statistics
  static async getBookingStats(userId?: string) {
    try {
      const whereClause = userId ? { userId } : {};
      
      const [total, confirmed, pending, cancelled] = await Promise.all([
        prisma.booking.count({ where: whereClause }),
        prisma.booking.count({ where: { ...whereClause, status: 'CONFIRMED' } }),
        prisma.booking.count({ where: { ...whereClause, status: 'PENDING' } }),
        prisma.booking.count({ where: { ...whereClause, status: 'CANCELLED' } })
      ]);

      return {
        total,
        confirmed,
        pending,
        cancelled,
        completed: confirmed // Alias for confirmed
      };
    } catch (error) {
      console.error('Error fetching booking stats:', error);
      return {
        total: 0,
        confirmed: 0,
        pending: 0,
        cancelled: 0,
        completed: 0
      };
    }
  }

  // Enhanced validation using security validator (backward compatible)
  static validateBookingRequest(request: CreateBookingRequest): { isValid: boolean; errors: string[]; warnings?: string[]; riskScore?: number } {
    // Use the enhanced security validator for comprehensive checks
    const securityValidation = BookingSecurityValidator.validateBookingRequest(request);
    
    return {
      isValid: securityValidation.isValid,
      errors: securityValidation.errors,
      warnings: securityValidation.warnings,
      riskScore: securityValidation.riskScore
    };
  }
  
  // Legacy validation method for backward compatibility
  static validateBookingRequestBasic(request: CreateBookingRequest): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validate required fields
    if (!request.userId) {
      errors.push('User ID is required');
    }

    if (!request.flightData || !request.flightData.id) {
      errors.push('Flight data is required');
    }

    if (!request.passengers || request.passengers.length === 0) {
      errors.push('At least one passenger is required');
    }

    if (!request.contactInfo || !request.contactInfo.email) {
      errors.push('Contact email is required');
    }

    if (!request.pricing || request.pricing.total <= 0) {
      errors.push('Valid pricing information is required');
    }

    if (!request.paymentInfo || !request.paymentInfo.method) {
      errors.push('Payment information is required');
    }

    // Validate passenger data
    if (request.passengers) {
      request.passengers.forEach((passenger, index) => {
        if (!passenger.firstName || !passenger.lastName) {
          errors.push(`Passenger ${index + 1}: First name and last name are required`);
        }
        if (!passenger.type || !['adult', 'child', 'infant'].includes(passenger.type)) {
          errors.push(`Passenger ${index + 1}: Valid passenger type is required`);
        }
      });
    }

    // Validate email format
    if (request.contactInfo && request.contactInfo.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(request.contactInfo.email)) {
        errors.push('Invalid email format');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}