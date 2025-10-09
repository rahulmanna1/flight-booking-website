// Enhanced Booking Security & Validation System
// Provides comprehensive server-side validation and security for booking flows

import { CreateBookingRequest } from '@/services/BookingService';
import crypto from 'crypto';

// Enhanced validation result interface
export interface BookingValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  riskScore: number; // 0-100, higher means more risky
  requiresAdditionalVerification: boolean;
  sanitizedData?: CreateBookingRequest;
}

// Risk assessment factors
interface RiskFactors {
  rapidBookings: boolean;
  highValueTransaction: boolean;
  internationalTravel: boolean;
  mismatchedNames: boolean;
  invalidPaymentPattern: boolean;
  suspiciousEmail: boolean;
  blockedCountries: boolean;
}

// Security configuration
const SECURITY_CONFIG = {
  MAX_PASSENGER_COUNT: 9,
  MIN_ADVANCE_BOOKING_HOURS: 2,
  MAX_ADVANCE_BOOKING_DAYS: 365,
  HIGH_VALUE_THRESHOLD: 5000,
  RAPID_BOOKING_WINDOW_MINUTES: 5,
  BLOCKED_COUNTRIES: ['XX'], // Add actual blocked country codes if needed
  ALLOWED_CARD_TYPES: ['visa', 'mastercard', 'amex', 'discover'],
  EMAIL_DOMAIN_BLOCKLIST: ['temp-mail.org', '10minutemail.com', 'guerrillamail.com'],
  NAME_PATTERN: /^[a-zA-Z\s\-\'\.]{2,50}$/,
  PHONE_PATTERN: /^\+?[\d\s\-\(\)]{7,20}$/,
  PASSPORT_PATTERN: /^[A-Z0-9]{6,12}$/
};

// Idempotency key management
const bookingAttempts = new Map<string, { count: number; lastAttempt: number }>();

class BookingSecurityValidator {
  
  // Generate idempotency key for booking requests
  static generateIdempotencyKey(request: CreateBookingRequest): string {
    const keyData = {
      userId: request.userId,
      flightId: request.flightData.id,
      totalAmount: request.pricing.total,
      passengers: request.passengers.length,
      contactEmail: request.contactInfo.email
    };
    
    return crypto
      .createHash('sha256')
      .update(JSON.stringify(keyData))
      .digest('hex')
      .substring(0, 32);
  }
  
  // Check for duplicate bookings within timeframe
  static checkDuplicateAttempts(idempotencyKey: string): boolean {
    const now = Date.now();
    const existing = bookingAttempts.get(idempotencyKey);
    
    if (!existing) {
      bookingAttempts.set(idempotencyKey, { count: 1, lastAttempt: now });
      return false;
    }
    
    // Clean up old entries (older than 1 hour)
    if (now - existing.lastAttempt > 60 * 60 * 1000) {
      bookingAttempts.delete(idempotencyKey);
      return false;
    }
    
    // Check if within rapid booking window
    if (now - existing.lastAttempt < SECURITY_CONFIG.RAPID_BOOKING_WINDOW_MINUTES * 60 * 1000) {
      existing.count++;
      existing.lastAttempt = now;
      return existing.count > 3; // Allow max 3 attempts in 5 minutes
    }
    
    return false;
  }
  
  // Comprehensive input sanitization
  static sanitizeInput(input: string): string {
    if (typeof input !== 'string') return '';
    
    return input
      .trim()
      .replace(/[<>\"']/g, '') // Remove potential XSS characters
      .replace(/\s+/g, ' ') // Normalize whitespace
      .substring(0, 1000); // Limit length
  }
  
  // Validate passenger data with enhanced security checks
  static validatePassengerData(passengers: CreateBookingRequest['passengers']): { isValid: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    if (!Array.isArray(passengers) || passengers.length === 0) {
      errors.push('At least one passenger is required');
      return { isValid: false, errors, warnings };
    }
    
    if (passengers.length > SECURITY_CONFIG.MAX_PASSENGER_COUNT) {
      errors.push(`Maximum ${SECURITY_CONFIG.MAX_PASSENGER_COUNT} passengers allowed`);
    }
    
    passengers.forEach((passenger, index) => {
      const passengerIndex = index + 1;
      
      // Name validation
      if (!passenger.firstName || !SECURITY_CONFIG.NAME_PATTERN.test(passenger.firstName)) {
        errors.push(`Passenger ${passengerIndex}: Invalid first name`);
      }
      if (!passenger.lastName || !SECURITY_CONFIG.NAME_PATTERN.test(passenger.lastName)) {
        errors.push(`Passenger ${passengerIndex}: Invalid last name`);
      }
      
      // Type validation
      if (!['adult', 'child', 'infant'].includes(passenger.type)) {
        errors.push(`Passenger ${passengerIndex}: Invalid passenger type`);
      }
      
      // Age validation for children and infants
      if (passenger.dateOfBirth) {
        const age = this.calculateAge(passenger.dateOfBirth);
        if (passenger.type === 'child' && (age < 2 || age >= 12)) {
          errors.push(`Passenger ${passengerIndex}: Child passenger age must be 2-11 years`);
        }
        if (passenger.type === 'infant' && age >= 2) {
          errors.push(`Passenger ${passengerIndex}: Infant passenger age must be under 2 years`);
        }
        if (passenger.type === 'adult' && age < 18) {
          warnings.push(`Passenger ${passengerIndex}: Adult passenger appears to be under 18`);
        }
      }
      
      // International travel document validation
      if (passenger.passportNumber) {
        if (!SECURITY_CONFIG.PASSPORT_PATTERN.test(passenger.passportNumber)) {
          errors.push(`Passenger ${passengerIndex}: Invalid passport number format`);
        }
        if (passenger.passportExpiry) {
          const expiryDate = new Date(passenger.passportExpiry);
          const futureDate = new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000); // 6 months from now
          if (expiryDate < futureDate) {
            warnings.push(`Passenger ${passengerIndex}: Passport expires within 6 months`);
          }
        }
      }
      
      // Email validation (if provided)
      if (passenger.email) {
        if (!this.isValidEmail(passenger.email)) {
          errors.push(`Passenger ${passengerIndex}: Invalid email format`);
        }
        if (this.isSuspiciousEmail(passenger.email)) {
          warnings.push(`Passenger ${passengerIndex}: Email from suspicious domain`);
        }
      }
      
      // Phone validation (if provided)
      if (passenger.phone && !SECURITY_CONFIG.PHONE_PATTERN.test(passenger.phone)) {
        errors.push(`Passenger ${passengerIndex}: Invalid phone number format`);
      }
    });
    
    return { isValid: errors.length === 0, errors, warnings };
  }
  
  // Validate flight data and booking window
  static validateFlightData(flightData: CreateBookingRequest['flightData']): { isValid: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    if (!flightData) {
      errors.push('Flight data is required');
      return { isValid: false, errors, warnings };
    }
    
    // Required fields validation
    const requiredFields = ['id', 'airline', 'flightNumber', 'origin', 'destination', 'departDate', 'departTime'];
    for (const field of requiredFields) {
      if (!flightData[field as keyof typeof flightData]) {
        errors.push(`Flight data missing required field: ${field}`);
      }
    }
    
    // Date and time validation
    if (flightData.departDate && flightData.departTime) {
      try {
        const departureDateTime = new Date(`${flightData.departDate}T${flightData.departTime}`);
        const now = new Date();
        const minBookingTime = new Date(now.getTime() + SECURITY_CONFIG.MIN_ADVANCE_BOOKING_HOURS * 60 * 60 * 1000);
        const maxBookingTime = new Date(now.getTime() + SECURITY_CONFIG.MAX_ADVANCE_BOOKING_DAYS * 24 * 60 * 60 * 1000);
        
        if (departureDateTime < minBookingTime) {
          errors.push(`Flight must be booked at least ${SECURITY_CONFIG.MIN_ADVANCE_BOOKING_HOURS} hours in advance`);
        }
        
        if (departureDateTime > maxBookingTime) {
          errors.push(`Flight booking cannot be more than ${SECURITY_CONFIG.MAX_ADVANCE_BOOKING_DAYS} days in advance`);
        }
        
        // Check for past dates
        if (departureDateTime < now) {
          errors.push('Cannot book flights for past dates');
        }
      } catch {
        errors.push('Invalid departure date or time format');
      }
    }
    
    // Airport code validation
    if (flightData.origin && flightData.origin.length !== 3) {
      errors.push('Invalid origin airport code');
    }
    if (flightData.destination && flightData.destination.length !== 3) {
      errors.push('Invalid destination airport code');
    }
    if (flightData.origin === flightData.destination) {
      errors.push('Origin and destination cannot be the same');
    }
    
    return { isValid: errors.length === 0, errors, warnings };
  }
  
  // Validate contact information
  static validateContactInfo(contactInfo: CreateBookingRequest['contactInfo']): { isValid: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    if (!contactInfo) {
      errors.push('Contact information is required');
      return { isValid: false, errors, warnings };
    }
    
    // Email validation
    if (!this.isValidEmail(contactInfo.email)) {
      errors.push('Valid contact email is required');
    } else if (this.isSuspiciousEmail(contactInfo.email)) {
      warnings.push('Contact email from suspicious domain');
    }
    
    // Phone validation
    if (!SECURITY_CONFIG.PHONE_PATTERN.test(contactInfo.phone)) {
      errors.push('Valid phone number is required');
    }
    
    // Emergency contact validation
    if (!contactInfo.emergencyContactName || !SECURITY_CONFIG.NAME_PATTERN.test(contactInfo.emergencyContactName)) {
      errors.push('Valid emergency contact name is required');
    }
    
    if (!SECURITY_CONFIG.PHONE_PATTERN.test(contactInfo.emergencyContactPhone)) {
      errors.push('Valid emergency contact phone is required');
    }
    
    if (!contactInfo.emergencyContactRelation || contactInfo.emergencyContactRelation.length < 2) {
      errors.push('Emergency contact relationship is required');
    }
    
    return { isValid: errors.length === 0, errors, warnings };
  }
  
  // Validate pricing and detect anomalies
  static validatePricing(pricing: CreateBookingRequest['pricing']): { isValid: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    if (!pricing) {
      errors.push('Pricing information is required');
      return { isValid: false, errors, warnings };
    }
    
    // Validate numeric values
    const numericFields = ['subtotal', 'taxes', 'fees', 'seatFees', 'total'];
    for (const field of numericFields) {
      const value = pricing[field as keyof typeof pricing];
      if (typeof value !== 'number' || value < 0 || !isFinite(value)) {
        errors.push(`Invalid ${field} amount`);
      }
    }
    
    // Validate pricing logic
    if (pricing.subtotal && pricing.taxes && pricing.fees && pricing.seatFees && pricing.total) {
      const calculatedTotal = pricing.subtotal + pricing.taxes + pricing.fees + pricing.seatFees;
      const tolerance = 0.01; // Allow 1 cent difference for rounding
      
      if (Math.abs(calculatedTotal - pricing.total) > tolerance) {
        errors.push('Pricing calculation mismatch');
      }
    }
    
    // Check for suspiciously low or high prices
    if (pricing.total < 50) {
      warnings.push('Unusually low ticket price - please verify');
    }
    if (pricing.total > SECURITY_CONFIG.HIGH_VALUE_THRESHOLD) {
      warnings.push('High value transaction - additional verification may be required');
    }
    
    // Tax validation (reasonable percentage)
    if (pricing.subtotal > 0 && pricing.taxes > 0) {
      const taxRate = pricing.taxes / pricing.subtotal;
      if (taxRate > 0.5) {
        warnings.push('Unusually high tax rate');
      }
    }
    
    return { isValid: errors.length === 0, errors, warnings };
  }
  
  // Validate payment information
  static validatePaymentInfo(paymentInfo: CreateBookingRequest['paymentInfo']): { isValid: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    if (!paymentInfo) {
      errors.push('Payment information is required');
      return { isValid: false, errors, warnings };
    }
    
    // Payment method validation
    if (!paymentInfo.method || !SECURITY_CONFIG.ALLOWED_CARD_TYPES.includes(paymentInfo.method.toLowerCase())) {
      errors.push('Invalid payment method');
    }
    
    // Amount validation
    if (typeof paymentInfo.amount !== 'number' || paymentInfo.amount <= 0) {
      errors.push('Invalid payment amount');
    }
    
    // Last four digits validation
    if (!paymentInfo.lastFourDigits || !/^\d{4}$/.test(paymentInfo.lastFourDigits)) {
      errors.push('Invalid card last four digits');
    }
    
    // Cardholder name validation
    if (paymentInfo.cardholderName && !SECURITY_CONFIG.NAME_PATTERN.test(paymentInfo.cardholderName)) {
      errors.push('Invalid cardholder name');
    }
    
    // Billing address validation (if provided)
    if (paymentInfo.billingAddress) {
      const addr = paymentInfo.billingAddress;
      if (!addr.street || addr.street.length < 5) {
        errors.push('Invalid billing address street');
      }
      if (!addr.city || addr.city.length < 2) {
        errors.push('Invalid billing address city');
      }
      if (!addr.zipCode || addr.zipCode.length < 3) {
        errors.push('Invalid billing address postal code');
      }
      if (!addr.country || addr.country.length !== 2) {
        errors.push('Invalid billing address country code');
      }
    }
    
    return { isValid: errors.length === 0, errors, warnings };
  }
  
  // Calculate risk score based on various factors
  static calculateRiskScore(request: CreateBookingRequest): { score: number; factors: RiskFactors } {
    const factors: RiskFactors = {
      rapidBookings: false,
      highValueTransaction: request.pricing.total > SECURITY_CONFIG.HIGH_VALUE_THRESHOLD,
      internationalTravel: this.isInternationalTravel(request.flightData.origin, request.flightData.destination),
      mismatchedNames: this.detectNameMismatch(request),
      invalidPaymentPattern: this.detectSuspiciousPaymentPattern(request.paymentInfo),
      suspiciousEmail: this.isSuspiciousEmail(request.contactInfo.email),
      blockedCountries: this.hasBlockedCountryConnection(request)
    };
    
    // Check rapid booking attempts
    const idempotencyKey = this.generateIdempotencyKey(request);
    factors.rapidBookings = this.checkDuplicateAttempts(idempotencyKey);
    
    // Calculate score (0-100)
    let score = 0;
    if (factors.rapidBookings) score += 30;
    if (factors.highValueTransaction) score += 20;
    if (factors.internationalTravel) score += 10;
    if (factors.mismatchedNames) score += 25;
    if (factors.invalidPaymentPattern) score += 35;
    if (factors.suspiciousEmail) score += 15;
    if (factors.blockedCountries) score += 50;
    
    return { score: Math.min(score, 100), factors };
  }
  
  // Main validation function
  static validateBookingRequest(request: CreateBookingRequest): BookingValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Basic structure validation
    if (!request) {
      return {
        isValid: false,
        errors: ['Invalid request structure'],
        warnings: [],
        riskScore: 100,
        requiresAdditionalVerification: true
      };
    }
    
    // User ID validation
    if (!request.userId || typeof request.userId !== 'string') {
      errors.push('Valid user ID is required');
    }
    
    // Validate each section
    const flightValidation = this.validateFlightData(request.flightData);
    errors.push(...flightValidation.errors);
    warnings.push(...flightValidation.warnings);
    
    const passengerValidation = this.validatePassengerData(request.passengers);
    errors.push(...passengerValidation.errors);
    warnings.push(...passengerValidation.warnings);
    
    const contactValidation = this.validateContactInfo(request.contactInfo);
    errors.push(...contactValidation.errors);
    warnings.push(...contactValidation.warnings);
    
    const pricingValidation = this.validatePricing(request.pricing);
    errors.push(...pricingValidation.errors);
    warnings.push(...pricingValidation.warnings);
    
    const paymentValidation = this.validatePaymentInfo(request.paymentInfo);
    errors.push(...paymentValidation.errors);
    warnings.push(...paymentValidation.warnings);
    
    // Calculate risk score
    const riskAssessment = this.calculateRiskScore(request);
    
    // Sanitize data if validation passes
    let sanitizedData: CreateBookingRequest | undefined;
    if (errors.length === 0) {
      sanitizedData = this.sanitizeBookingRequest(request);
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      riskScore: riskAssessment.score,
      requiresAdditionalVerification: riskAssessment.score > 50,
      sanitizedData
    };
  }
  
  // Helper methods
  private static calculateAge(dateOfBirth: string): number {
    const today = new Date();
    const birth = new Date(dateOfBirth);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  }
  
  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 254;
  }
  
  private static isSuspiciousEmail(email: string): boolean {
    const domain = email.split('@')[1]?.toLowerCase();
    return SECURITY_CONFIG.EMAIL_DOMAIN_BLOCKLIST.includes(domain);
  }
  
  private static isInternationalTravel(origin: string, destination: string): boolean {
    // Simplified check - in production, you'd use a proper country mapping
    const usAirports = ['JFK', 'LAX', 'ORD', 'DFW', 'ATL', 'SFO', 'MIA', 'SEA'];
    const originUS = usAirports.includes(origin);
    const destinationUS = usAirports.includes(destination);
    return originUS !== destinationUS;
  }
  
  private static detectNameMismatch(request: CreateBookingRequest): boolean {
    const firstPassenger = request.passengers[0];
    if (!firstPassenger || !request.paymentInfo.cardholderName) return false;
    
    const passengerName = `${firstPassenger.firstName} ${firstPassenger.lastName}`.toLowerCase();
    const cardholderName = request.paymentInfo.cardholderName.toLowerCase();
    
    // Simple name similarity check
    return !passengerName.includes(firstPassenger.firstName.toLowerCase()) || 
           !cardholderName.includes(firstPassenger.firstName.toLowerCase());
  }
  
  private static detectSuspiciousPaymentPattern(paymentInfo: CreateBookingRequest['paymentInfo']): boolean {
    // Check for common test card patterns
    const testCardPatterns = ['4111', '4000', '5555', '3782'];
    return testCardPatterns.some(pattern => paymentInfo.lastFourDigits?.startsWith(pattern));
  }
  
  private static hasBlockedCountryConnection(request: CreateBookingRequest): boolean {
    // Check if any passenger nationality or travel route involves blocked countries
    return request.passengers.some(p => 
      SECURITY_CONFIG.BLOCKED_COUNTRIES.includes(p.nationality || '')
    );
  }
  
  private static sanitizeBookingRequest(request: CreateBookingRequest): CreateBookingRequest {
    return {
      ...request,
      passengers: request.passengers.map(p => ({
        ...p,
        firstName: this.sanitizeInput(p.firstName),
        lastName: this.sanitizeInput(p.lastName),
        email: p.email ? this.sanitizeInput(p.email) : undefined,
        specialRequests: p.specialRequests ? this.sanitizeInput(p.specialRequests) : undefined,
      })),
      contactInfo: {
        ...request.contactInfo,
        email: this.sanitizeInput(request.contactInfo.email),
        phone: this.sanitizeInput(request.contactInfo.phone),
        emergencyContactName: this.sanitizeInput(request.contactInfo.emergencyContactName),
        emergencyContactPhone: this.sanitizeInput(request.contactInfo.emergencyContactPhone),
        emergencyContactRelation: this.sanitizeInput(request.contactInfo.emergencyContactRelation),
      }
    };
  }
}

export { BookingSecurityValidator };
export default BookingSecurityValidator;