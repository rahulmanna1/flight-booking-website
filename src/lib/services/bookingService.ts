// Booking Service Layer
// Comprehensive booking management with CRUD operations and integrations

import { 
  FlightBooking, 
  BookingStatus, 
  CreateBookingRequest, 
  UpdateBookingRequest, 
  CancelBookingRequest,
  BookingSearchOptions,
  BookingSearchResults,
  BookingStats,
  PassengerInfo,
  FlightSegment,
  BookingModification
} from '../../types/booking';
import { PaymentResult } from '../payments/enhancedStripeService';

// API response types
interface BookingServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  metadata?: {
    timestamp: string;
    requestId: string;
    processingTime: number;
  };
}

// Booking reference generation
class BookingReferenceGenerator {
  private static readonly CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  
  static generate(): string {
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += this.CHARS.charAt(Math.floor(Math.random() * this.CHARS.length));
    }
    return result;
  }
  
  static isValid(reference: string): boolean {
    return /^[A-Z0-9]{6}$/.test(reference);
  }
}

// Main booking service class
class BookingService {
  private static readonly BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '/api';
  
  // Create a new booking
  static async createBooking(
    request: CreateBookingRequest,
    userId: string
  ): Promise<BookingServiceResponse<FlightBooking>> {
    const startTime = Date.now();
    
    try {
      console.log(`📝 Creating booking for user: ${userId}`);
      
      // Generate booking reference
      const bookingReference = BookingReferenceGenerator.generate();
      
      // Validate passenger information
      const validationResult = this.validatePassengers(request.passengers);
      if (!validationResult.isValid) {
        return {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Passenger information is invalid',
            details: validationResult.errors
          }
        };
      }
      
      // Create booking payload
      const bookingPayload = {
        ...request,
        userId,
        bookingReference,
        status: 'pending_payment' as BookingStatus,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      // Make API call to create booking
      const response = await fetch(`${this.BASE_URL}/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getAuthToken()}`,
        },
        body: JSON.stringify(bookingPayload),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const booking: FlightBooking = await response.json();
      
      console.log(`✅ Booking created: ${booking.bookingReference}`);
      
      return {
        success: true,
        data: booking,
        metadata: {
          timestamp: new Date().toISOString(),
          requestId: bookingReference,
          processingTime: Date.now() - startTime,
        },
      };
      
    } catch (error: any) {
      console.error('❌ Booking creation failed:', error);
      
      return {
        success: false,
        error: {
          code: 'BOOKING_CREATION_FAILED',
          message: error.message || 'Failed to create booking',
        },
        metadata: {
          timestamp: new Date().toISOString(),
          requestId: 'unknown',
          processingTime: Date.now() - startTime,
        },
      };
    }
  }
  
  // Retrieve booking by ID
  static async getBooking(bookingId: string): Promise<BookingServiceResponse<FlightBooking>> {
    try {
      console.log(`📖 Retrieving booking: ${bookingId}`);
      
      const response = await fetch(`${this.BASE_URL}/bookings/${bookingId}`, {
        headers: {
          'Authorization': `Bearer ${await this.getAuthToken()}`,
        },
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          return {
            success: false,
            error: {
              code: 'BOOKING_NOT_FOUND',
              message: 'Booking not found',
            },
          };
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const booking: FlightBooking = await response.json();
      
      console.log(`✅ Booking retrieved: ${booking.bookingReference}`);
      
      return {
        success: true,
        data: booking,
      };
      
    } catch (error: any) {
      console.error('❌ Failed to retrieve booking:', error);
      
      return {
        success: false,
        error: {
          code: 'BOOKING_RETRIEVAL_FAILED',
          message: error.message || 'Failed to retrieve booking',
        },
      };
    }
  }
  
  // Retrieve booking by reference
  static async getBookingByReference(
    bookingReference: string
  ): Promise<BookingServiceResponse<FlightBooking>> {
    try {
      if (!BookingReferenceGenerator.isValid(bookingReference)) {
        return {
          success: false,
          error: {
            code: 'INVALID_REFERENCE',
            message: 'Invalid booking reference format',
          },
        };
      }
      
      console.log(`📖 Retrieving booking by reference: ${bookingReference}`);
      
      const response = await fetch(`${this.BASE_URL}/bookings/reference/${bookingReference}`, {
        headers: {
          'Authorization': `Bearer ${await this.getAuthToken()}`,
        },
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          return {
            success: false,
            error: {
              code: 'BOOKING_NOT_FOUND',
              message: 'Booking not found',
            },
          };
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const booking: FlightBooking = await response.json();
      
      return {
        success: true,
        data: booking,
      };
      
    } catch (error: any) {
      console.error('❌ Failed to retrieve booking by reference:', error);
      
      return {
        success: false,
        error: {
          code: 'BOOKING_RETRIEVAL_FAILED',
          message: error.message || 'Failed to retrieve booking',
        },
      };
    }
  }
  
  // Update booking
  static async updateBooking(
    bookingId: string,
    updates: UpdateBookingRequest,
    userId: string
  ): Promise<BookingServiceResponse<FlightBooking>> {
    const startTime = Date.now();
    
    try {
      console.log(`📝 Updating booking: ${bookingId}`);
      
      // Create update payload with modification tracking
      const updatePayload = {
        ...updates,
        updatedAt: new Date().toISOString(),
        modification: {
          type: 'update',
          timestamp: new Date().toISOString(),
          performedBy: {
            userId,
            userType: 'customer' as const,
            name: 'Customer Update',
          },
          description: 'Booking updated by customer',
        },
      };
      
      const response = await fetch(`${this.BASE_URL}/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getAuthToken()}`,
        },
        body: JSON.stringify(updatePayload),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const updatedBooking: FlightBooking = await response.json();
      
      console.log(`✅ Booking updated: ${updatedBooking.bookingReference}`);
      
      return {
        success: true,
        data: updatedBooking,
        metadata: {
          timestamp: new Date().toISOString(),
          requestId: bookingId,
          processingTime: Date.now() - startTime,
        },
      };
      
    } catch (error: any) {
      console.error('❌ Booking update failed:', error);
      
      return {
        success: false,
        error: {
          code: 'BOOKING_UPDATE_FAILED',
          message: error.message || 'Failed to update booking',
        },
        metadata: {
          timestamp: new Date().toISOString(),
          requestId: bookingId,
          processingTime: Date.now() - startTime,
        },
      };
    }
  }
  
  // Cancel booking
  static async cancelBooking(
    bookingId: string,
    cancellationRequest: CancelBookingRequest,
    userId: string
  ): Promise<BookingServiceResponse<FlightBooking>> {
    const startTime = Date.now();
    
    try {
      console.log(`🚫 Cancelling booking: ${bookingId}`);
      
      const cancellationPayload = {
        ...cancellationRequest,
        cancelledAt: new Date().toISOString(),
        cancelledBy: {
          userId,
          userType: 'customer' as const,
          name: 'Customer Cancellation',
        },
      };
      
      const response = await fetch(`${this.BASE_URL}/bookings/${bookingId}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getAuthToken()}`,
        },
        body: JSON.stringify(cancellationPayload),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const cancelledBooking: FlightBooking = await response.json();
      
      console.log(`✅ Booking cancelled: ${cancelledBooking.bookingReference}`);
      
      return {
        success: true,
        data: cancelledBooking,
        metadata: {
          timestamp: new Date().toISOString(),
          requestId: bookingId,
          processingTime: Date.now() - startTime,
        },
      };
      
    } catch (error: any) {
      console.error('❌ Booking cancellation failed:', error);
      
      return {
        success: false,
        error: {
          code: 'BOOKING_CANCELLATION_FAILED',
          message: error.message || 'Failed to cancel booking',
        },
        metadata: {
          timestamp: new Date().toISOString(),
          requestId: bookingId,
          processingTime: Date.now() - startTime,
        },
      };
    }
  }
  
  // Search bookings
  static async searchBookings(
    options: BookingSearchOptions,
    userId?: string
  ): Promise<BookingServiceResponse<BookingSearchResults>> {
    try {
      console.log('🔍 Searching bookings with filters:', options.filters);
      
      const queryParams = new URLSearchParams({
        page: options.page.toString(),
        limit: options.limit.toString(),
        sortBy: options.sortBy,
        sortOrder: options.sortOrder,
      });
      
      if (userId) {
        queryParams.append('userId', userId);
      }
      
      // Add filter parameters
      if (options.filters.status?.length) {
        queryParams.append('status', options.filters.status.join(','));
      }
      
      if (options.filters.dateRange) {
        queryParams.append('dateStart', options.filters.dateRange.start);
        queryParams.append('dateEnd', options.filters.dateRange.end);
        queryParams.append('dateType', options.filters.dateRange.type);
      }
      
      if (options.filters.airlines?.length) {
        queryParams.append('airlines', options.filters.airlines.join(','));
      }
      
      if (options.filters.tripType?.length) {
        queryParams.append('tripType', options.filters.tripType.join(','));
      }
      
      const response = await fetch(`${this.BASE_URL}/bookings/search?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${await this.getAuthToken()}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const results: BookingSearchResults = await response.json();
      
      console.log(`✅ Found ${results.total} bookings`);
      
      return {
        success: true,
        data: results,
      };
      
    } catch (error: any) {
      console.error('❌ Booking search failed:', error);
      
      return {
        success: false,
        error: {
          code: 'BOOKING_SEARCH_FAILED',
          message: error.message || 'Failed to search bookings',
        },
      };
    }
  }
  
  // Get user bookings
  static async getUserBookings(
    userId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<BookingServiceResponse<BookingSearchResults>> {
    return this.searchBookings({
      filters: {},
      sortBy: 'createdAt',
      sortOrder: 'desc',
      page,
      limit,
    }, userId);
  }
  
  // Update booking status
  static async updateBookingStatus(
    bookingId: string,
    status: BookingStatus,
    userId: string,
    notes?: string
  ): Promise<BookingServiceResponse<FlightBooking>> {
    try {
      console.log(`📊 Updating booking status: ${bookingId} -> ${status}`);
      
      const statusUpdate = {
        status,
        updatedAt: new Date().toISOString(),
        modification: {
          type: 'update',
          timestamp: new Date().toISOString(),
          performedBy: {
            userId,
            userType: 'system' as const,
            name: 'Status Update',
          },
          description: `Booking status changed to ${status}`,
          changes: [{
            field: 'status',
            oldValue: null, // Would need current status
            newValue: status,
          }],
        },
        ...(notes && { internalNotes: [notes] }),
      };
      
      const response = await fetch(`${this.BASE_URL}/bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getAuthToken()}`,
        },
        body: JSON.stringify(statusUpdate),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const updatedBooking: FlightBooking = await response.json();
      
      console.log(`✅ Booking status updated: ${updatedBooking.bookingReference}`);
      
      return {
        success: true,
        data: updatedBooking,
      };
      
    } catch (error: any) {
      console.error('❌ Status update failed:', error);
      
      return {
        success: false,
        error: {
          code: 'STATUS_UPDATE_FAILED',
          message: error.message || 'Failed to update booking status',
        },
      };
    }
  }
  
  // Process payment for booking
  static async processBookingPayment(
    bookingId: string,
    paymentResult: PaymentResult
  ): Promise<BookingServiceResponse<FlightBooking>> {
    try {
      console.log(`💳 Processing payment for booking: ${bookingId}`);
      
      const paymentPayload = {
        paymentIntentId: paymentResult.paymentIntent?.id,
        status: paymentResult.success ? 'completed' : 'failed',
        amount: paymentResult.paymentIntent?.amount ? paymentResult.paymentIntent.amount / 100 : 0,
        currency: paymentResult.paymentIntent?.currency || 'USD',
        paidAt: paymentResult.success ? new Date().toISOString() : undefined,
      };
      
      const response = await fetch(`${this.BASE_URL}/bookings/${bookingId}/payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getAuthToken()}`,
        },
        body: JSON.stringify(paymentPayload),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const updatedBooking: FlightBooking = await response.json();
      
      console.log(`✅ Payment processed for booking: ${updatedBooking.bookingReference}`);
      
      return {
        success: true,
        data: updatedBooking,
      };
      
    } catch (error: any) {
      console.error('❌ Payment processing failed:', error);
      
      return {
        success: false,
        error: {
          code: 'PAYMENT_PROCESSING_FAILED',
          message: error.message || 'Failed to process payment',
        },
      };
    }
  }
  
  // Get booking statistics
  static async getBookingStats(
    userId?: string,
    dateRange?: { start: string; end: string }
  ): Promise<BookingServiceResponse<BookingStats>> {
    try {
      console.log('📊 Retrieving booking statistics');
      
      const queryParams = new URLSearchParams();
      
      if (userId) {
        queryParams.append('userId', userId);
      }
      
      if (dateRange) {
        queryParams.append('dateStart', dateRange.start);
        queryParams.append('dateEnd', dateRange.end);
      }
      
      const response = await fetch(`${this.BASE_URL}/bookings/stats?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${await this.getAuthToken()}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const stats: BookingStats = await response.json();
      
      console.log(`✅ Retrieved booking statistics`);
      
      return {
        success: true,
        data: stats,
      };
      
    } catch (error: any) {
      console.error('❌ Failed to retrieve booking statistics:', error);
      
      return {
        success: false,
        error: {
          code: 'STATS_RETRIEVAL_FAILED',
          message: error.message || 'Failed to retrieve statistics',
        },
      };
    }
  }
  
  // Check-in passenger for flight segment
  static async checkInPassenger(
    bookingId: string,
    passengerId: string,
    segmentId: string,
    seatNumber?: string
  ): Promise<BookingServiceResponse<{ boardingPass: string; seatAssignment: string }>> {
    try {
      console.log(`✈️ Checking in passenger for booking: ${bookingId}`);
      
      const checkInPayload = {
        passengerId,
        segmentId,
        seatNumber,
        checkInTime: new Date().toISOString(),
      };
      
      const response = await fetch(`${this.BASE_URL}/bookings/${bookingId}/checkin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getAuthToken()}`,
        },
        body: JSON.stringify(checkInPayload),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const checkInResult = await response.json();
      
      console.log(`✅ Passenger checked in successfully`);
      
      return {
        success: true,
        data: checkInResult,
      };
      
    } catch (error: any) {
      console.error('❌ Check-in failed:', error);
      
      return {
        success: false,
        error: {
          code: 'CHECKIN_FAILED',
          message: error.message || 'Failed to check in passenger',
        },
      };
    }
  }
  
  // Generate booking confirmation email
  static async sendBookingConfirmation(
    bookingId: string
  ): Promise<BookingServiceResponse<{ emailSent: boolean }>> {
    try {
      console.log(`📧 Sending booking confirmation: ${bookingId}`);
      
      const response = await fetch(`${this.BASE_URL}/bookings/${bookingId}/confirmation`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await this.getAuthToken()}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      console.log(`✅ Booking confirmation sent`);
      
      return {
        success: true,
        data: result,
      };
      
    } catch (error: any) {
      console.error('❌ Failed to send confirmation:', error);
      
      return {
        success: false,
        error: {
          code: 'CONFIRMATION_FAILED',
          message: error.message || 'Failed to send confirmation',
        },
      };
    }
  }
  
  // Private helper methods
  private static validatePassengers(passengers: Partial<PassengerInfo>[]): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    
    if (!passengers || passengers.length === 0) {
      errors.push('At least one passenger is required');
      return { isValid: false, errors };
    }
    
    passengers.forEach((passenger, index) => {
      if (!passenger.firstName?.trim()) {
        errors.push(`Passenger ${index + 1}: First name is required`);
      }
      
      if (!passenger.lastName?.trim()) {
        errors.push(`Passenger ${index + 1}: Last name is required`);
      }
      
      if (!passenger.dateOfBirth) {
        errors.push(`Passenger ${index + 1}: Date of birth is required`);
      }
      
      if (!passenger.nationality) {
        errors.push(`Passenger ${index + 1}: Nationality is required`);
      }
    });
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  }
  
  private static async getAuthToken(): Promise<string> {
    // Get the JWT token from localStorage
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      return token || '';
    }
    return '';
  }
}

export default BookingService;
export { BookingReferenceGenerator };
export type { BookingServiceResponse };