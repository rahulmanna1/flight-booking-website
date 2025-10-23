// Booking Types and Interfaces
// Comprehensive data structures for flight booking management

// Passenger information
export interface PassengerInfo {
  id: string;
  type: 'adult' | 'child' | 'infant';
  title: 'Mr' | 'Ms' | 'Mrs' | 'Dr' | 'Prof';
  firstName: string;
  lastName: string;
  middleName?: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  nationality: string;
  
  // Travel documents
  passport?: {
    number: string;
    expiryDate: string;
    issuingCountry: string;
  };
  
  // Contact information
  email?: string;
  phone?: string;
  
  // Seat assignment (for backward compatibility)
  seatNumber?: string;
  
  // Special requirements
  specialRequests?: string[];
  medicalRequirements?: string[];
  dietaryRequirements?: ('vegetarian' | 'vegan' | 'halal' | 'kosher' | 'gluten-free' | 'diabetic')[];
  
  // Seat preferences
  seatPreference?: {
    seatType: 'window' | 'aisle' | 'middle' | 'any';
    location: 'front' | 'middle' | 'back' | 'exit-row' | 'any';
    extraLegroom?: boolean;
  };
  
  // Frequent flyer information
  frequentFlyer?: {
    airline: string;
    membershipNumber: string;
    tier: 'basic' | 'silver' | 'gold' | 'platinum';
  };
}

// Flight segment information
export interface FlightSegment {
  id: string;
  flightNumber: string;
  airline: {
    code: string;
    name: string;
    logo?: string;
  };
  aircraft: {
    type: string;
    model: string;
    configuration?: string;
  };
  
  // Departure information
  departure: {
    airport: {
      code: string;
      name: string;
      city: string;
      country: string;
      terminal?: string;
      gate?: string;
    };
    dateTime: string;
    timezone: string;
    actualDateTime?: string; // For real-time updates
    status: 'scheduled' | 'delayed' | 'cancelled' | 'boarding' | 'departed';
  };
  
  // Arrival information
  arrival: {
    airport: {
      code: string;
      name: string;
      city: string;
      country: string;
      terminal?: string;
      gate?: string;
    };
    dateTime: string;
    timezone: string;
    actualDateTime?: string;
    status: 'scheduled' | 'delayed' | 'cancelled' | 'landed';
  };
  
  // Flight details
  duration: string; // in minutes
  distance?: number; // in miles/km
  stops: number;
  layoverDuration?: string; // for connecting flights
  operatedBy?: string; // for codeshare flights
  
  // Service class and amenities
  serviceClass: 'economy' | 'premium-economy' | 'business' | 'first';
  amenities: string[];
  entertainment?: boolean;
  wifi?: boolean;
  meals?: string[];
  
  // Seat assignments
  seatAssignments?: {
    [passengerId: string]: {
      seatNumber: string;
      seatType: 'window' | 'middle' | 'aisle';
      extraLegroom: boolean;
      cost?: number;
    };
  };
  
  // Baggage information
  baggage: {
    carryOn: {
      included: number;
      weight: string;
      dimensions: string;
    };
    checked: {
      included: number;
      weight: string;
      additionalCost?: number;
    };
    personal: {
      included: boolean;
      dimensions: string;
    };
  };
}

// Pricing breakdown
export interface BookingPricing {
  basePrice: number;
  baseFare?: number; // Alias for backward compatibility
  taxes: number;
  fees: {
    bookingFee: number;
    serviceFee: number;
    paymentFee?: number;
    securityFee: number;
    facilityFee: number;
  };
  servicesFee?: number; // For backward compatibility
  
  // Additional services
  addOns: {
    seatSelection?: number;
    extraBaggage?: number;
    meals?: number;
    insurance?: number;
    priorityBoarding?: number;
    loungeAccess?: number;
  };
  
  // Discounts
  discounts: {
    promoCode?: {
      code: string;
      discount: number;
      description: string;
    };
    loyaltyDiscount?: number;
    memberDiscount?: number;
  };
  
  subtotal: number;
  total: number;
  currency: string;
  
  // Price breakdown per passenger
  passengerPricing: {
    [passengerId: string]: {
      basePrice: number;
      taxes: number;
      fees: number;
      total: number;
    };
  };
}

// Payment information
export interface BookingPayment {
  paymentIntentId: string;
  transactionId?: string;
  method: 'card' | 'bank_transfer' | 'wallet' | 'bnpl';
  status: 'pending' | 'completed' | 'failed' | 'refunded' | 'partially_refunded';
  amount: number;
  currency: string;
  paidAt?: string;
  refunds?: {
    id: string;
    amount: number;
    reason: string;
    processedAt: string;
    status: 'pending' | 'completed' | 'failed';
  }[];
}

// Booking modification history
export interface BookingModification {
  id: string;
  type: 'creation' | 'update' | 'cancellation' | 'refund' | 'seat_change' | 'passenger_update';
  description: string;
  timestamp: string;
  performedBy: {
    userId?: string;
    userType: 'customer' | 'agent' | 'system';
    name: string;
  };
  changes: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
  cost?: number; // Any additional cost for the modification
}

// Booking status and workflow
export type BookingStatus = 
  | 'PENDING_PAYMENT'
  | 'PAYMENT_FAILED'
  | 'CONFIRMED'
  | 'TICKETED'
  | 'CHECKED_IN'
  | 'BOARDING'
  | 'DEPARTED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'REFUNDED'
  | 'EXPIRED';

// Main booking interface
export interface FlightBooking {
  // Basic information
  id: string;
  bookingReference: string;
  confirmationNumber?: string; // For backward compatibility
  pnr?: string; // Passenger Name Record from airline
  status: BookingStatus;
  createdAt: string;
  updatedAt: string;
  bookingDate?: string; // For backward compatibility
  expiresAt?: string; // For pending bookings
  
  // User information
  userId: string;
  bookedBy: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  
  // Trip information
  tripType: 'one-way' | 'round-trip' | 'multi-city';
  passengers: PassengerInfo[];
  flightSegments: FlightSegment[];
  
  // Simplified flight details for backward compatibility
  flightDetails?: {
    airline: string;
    flightNumber: string;
    origin: string;
    destination: string;
    departureDate: string;
    departureTime: string;
    arrivalDate?: string;
    arrivalTime: string;
    duration: string;
    aircraft?: string;
    departureTerminal?: string;
    arrivalTerminal?: string;
    gate?: string;
  };
  
  // Contact info for backward compatibility
  contactInfo?: {
    email: string;
    phone: string;
  };
  
  // Payment info for backward compatibility
  paymentInfo?: {
    method: string;
    lastFourDigits: string;
  };
  
  // Pricing and payment
  pricing: BookingPricing;
  payment?: BookingPayment;
  
  // Additional services
  selectedServices: {
    seatSelection: boolean;
    extraBaggage: boolean;
    meals: boolean;
    insurance: boolean;
    priorityBoarding: boolean;
    loungeAccess: boolean;
  };
  
  // Insurance information
  travelInsurance?: {
    provider: string;
    policyNumber: string;
    coverage: string[];
    premium: number;
  };
  
  // Special requests and notes
  specialRequests: string[];
  internalNotes?: string[]; // For customer service
  
  // Booking modifications
  modifications: BookingModification[];
  
  // Check-in information
  checkIn?: {
    [segmentId: string]: {
      status: 'available' | 'completed' | 'closed';
      checkInTime?: string;
      boardingPass?: {
        url: string;
        format: 'pdf' | 'wallet';
      };
      seatAssignments: {
        [passengerId: string]: string;
      };
    };
  };
  
  // Contact preferences
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
    flightUpdates: boolean;
    promotions: boolean;
  };
  
  // Cancellation information
  cancellation?: {
    reason: string;
    cancelledAt: string;
    cancelledBy: {
      userId?: string;
      userType: 'customer' | 'agent' | 'airline' | 'system';
      name: string;
    };
    refundAmount?: number;
    refundStatus?: 'pending' | 'processed' | 'declined';
    cancellationFees?: number;
  };
  
  // External system references
  external: {
    airlineBookingRef?: string;
    gdsRecordLocator?: string;
    paymentGatewayId?: string;
  };
}

// Booking search and filter types
export interface BookingSearchFilters {
  status?: BookingStatus[];
  dateRange?: {
    start: string;
    end: string;
    type: 'created' | 'travel' | 'modified';
  };
  passengers?: {
    min?: number;
    max?: number;
  };
  airlines?: string[];
  routes?: {
    from?: string;
    to?: string;
  };
  priceRange?: {
    min: number;
    max: number;
    currency: string;
  };
  tripType?: ('one-way' | 'round-trip' | 'multi-city')[];
  services?: {
    seatSelection?: boolean;
    extraBaggage?: boolean;
    meals?: boolean;
    insurance?: boolean;
  };
}

export interface BookingSearchOptions {
  filters: BookingSearchFilters;
  sortBy: 'createdAt' | 'travelDate' | 'status' | 'total' | 'bookingReference';
  sortOrder: 'asc' | 'desc';
  page: number;
  limit: number;
}

export interface BookingSearchResults {
  bookings: FlightBooking[];
  total: number;
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// Booking creation request
export interface CreateBookingRequest {
  flightSegments: {
    outbound: string; // flight selection ID
    return?: string; // for round-trip
    connecting?: string[]; // for multi-city
  };
  passengers: Omit<PassengerInfo, 'id'>[];
  contactInfo: {
    email: string;
    phone: string;
  };
  selectedServices: {
    seatSelection?: boolean;
    extraBaggage?: boolean;
    meals?: boolean;
    insurance?: boolean;
    priorityBoarding?: boolean;
    loungeAccess?: boolean;
  };
  specialRequests?: string[];
  promoCode?: string;
  paymentMethodId?: string;
  notifications: {
    email: boolean;
    sms: boolean;
    flightUpdates: boolean;
  };
}

// Booking update request
export interface UpdateBookingRequest {
  passengers?: Partial<PassengerInfo>[];
  contactInfo?: {
    email?: string;
    phone?: string;
  };
  specialRequests?: string[];
  notifications?: {
    email?: boolean;
    sms?: boolean;
    flightUpdates?: boolean;
  };
  seatSelections?: {
    [passengerId: string]: {
      [segmentId: string]: string; // seat number
    };
  };
}

// Booking cancellation request
export interface CancelBookingRequest {
  reason: string;
  requestRefund: boolean;
  cancellationFees: number;
}

// Booking statistics for dashboard
export interface BookingStats {
  totalBookings: number;
  totalRevenue: number;
  statusBreakdown: {
    [key in BookingStatus]: number;
  };
  recentBookings: FlightBooking[];
  topRoutes: {
    route: string;
    count: number;
  }[];
  monthlyRevenue: {
    month: string;
    revenue: number;
  }[];
}

// ============================================
// ADVANCED BOOKING FEATURES
// ============================================

// Multi-City Search Types
export interface MultiCitySearchForm {
  segments: {
    from: string;
    to: string;
    departDate: string;
  }[];
  passengers: number;
  travelClass: 'economy' | 'premium-economy' | 'business' | 'first';
}

// Enhanced Seat Selection Types
export interface SeatMap {
  segmentId: string;
  flightNumber: string;
  aircraft: string;
  rows: number;
  columns: string[];
  layout: 'narrow-body' | 'wide-body'; // narrow: 3-3, wide: 2-4-2 or 3-4-3
  seats: SeatInfo[];
  exitRows: number[];
}

export interface SeatInfo {
  row: number;
  column: string;
  seatNumber: string; // e.g., "12A"
  type: 'standard' | 'extra-legroom' | 'preferred' | 'emergency-exit' | 'bassinet';
  status: 'available' | 'occupied' | 'selected' | 'blocked' | 'reserved';
  price: number; // Additional price for this seat
  features: ('window' | 'aisle' | 'middle' | 'extra-legroom' | 'recline-limited' | 'near-lavatory' | 'near-galley')[];
}

export interface PassengerSeatSelection {
  passengerId: string;
  passengerName: string;
  segmentId: string;
  flightNumber: string;
  seatNumber: string;
  seatType: SeatInfo['type'];
  additionalCost: number;
}

// Enhanced Meal Service Types
export interface MealService {
  segmentId: string;
  flightNumber: string;
  serviceType: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'refreshment';
  availableMeals: MealOption[];
}

export interface MealOption {
  id: string;
  code: string; // e.g., "VGML" for vegetarian
  name: string;
  description: string;
  ingredients: string[];
  category: 'standard' | 'vegetarian' | 'vegan' | 'kosher' | 'halal' | 'gluten-free' | 'child' | 'special-diet' | 'diabetic' | 'low-salt';
  allergens?: string[];
  price: number;
  available: boolean;
  imageUrl?: string;
  nutritionInfo?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

export interface PassengerMealSelection {
  passengerId: string;
  passengerName: string;
  segmentId: string;
  flightNumber: string;
  mealId: string;
  mealCode: string;
  mealName: string;
  price: number;
  dietaryRestrictions: string[];
  allergens: string[];
}

// Enhanced Baggage Types
export interface BaggageAllowance {
  segmentId: string;
  cabinClass: string;
  carryOn: {
    pieces: number;
    weight: number; // kg
    dimensions: string; // e.g., "55x40x20 cm"
  };
  checked: {
    pieces: number;
    weight: number; // kg per piece
    maxPieces: number;
    additionalPiecePrice: number;
  };
  personal: {
    allowed: boolean;
    dimensions: string;
  };
}

export interface ExtraBaggageOption {
  id: string;
  type: 'checked' | 'overweight' | 'oversized' | 'sports-equipment' | 'musical-instrument' | 'pet';
  description: string;
  weight?: number;
  price: number;
  available: boolean;
}

export interface PassengerBaggageSelection {
  passengerId: string;
  passengerName: string;
  checkedBags: {
    count: number;
    totalWeight: number;
    price: number;
  };
  extraBaggage: {
    type: ExtraBaggageOption['type'];
    description: string;
    price: number;
  }[];
  specialItems: {
    type: string;
    description: string;
    price: number;
  }[];
  totalCost: number;
}

// Travel Insurance Types
export interface TravelInsuranceOption {
  id: string;
  provider: string;
  providerLogo?: string;
  planName: string;
  description: string;
  coverage: InsuranceCoverage;
  price: number;
  pricePerPassenger: number;
  recommended: boolean;
  popular: boolean;
  termsUrl: string;
  policyDocument?: string;
}

export interface InsuranceCoverage {
  tripCancellation: {
    covered: boolean;
    maxAmount: number;
    reasons: string[];
  };
  tripInterruption: {
    covered: boolean;
    maxAmount: number;
  };
  tripDelay: {
    covered: boolean;
    minimumDelay: number; // hours
    compensation: number;
  };
  medicalExpenses: {
    covered: boolean;
    maxAmount: number;
    emergencyEvacuation: boolean;
  };
  baggageLoss: {
    covered: boolean;
    maxAmount: number;
  };
  baggageDelay: {
    covered: boolean;
    minimumDelay: number; // hours
    compensation: number;
  };
  flightAccident: {
    covered: boolean;
    maxAmount: number;
  };
  covid19: {
    covered: boolean;
    maxAmount: number;
  };
}

export interface BookingInsurance {
  insuranceId: string;
  provider: string;
  planName: string;
  policyNumber?: string;
  totalCost: number;
  costPerPassenger: number;
  coverage: InsuranceCoverage;
  coveredPassengers: string[]; // Array of passenger IDs
  termsAccepted: boolean;
  termsAcceptedAt?: string;
}

// Group Booking Types
export interface GroupBookingInfo {
  isGroupBooking: boolean;
  groupSize: number;
  groupName?: string;
  coordinator: {
    id?: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    company?: string;
  };
  groupType: 'family' | 'corporate' | 'tour' | 'event' | 'sports-team' | 'school' | 'other';
  specialRequests: string;
  paymentMethod: 'single-payment' | 'split-payment' | 'individual-payment';
  discount?: {
    type: 'percentage' | 'fixed';
    value: number;
    reason: string;
  };
}

export interface BulkPassengerImport {
  format: 'csv' | 'excel' | 'json';
  passengers: Omit<PassengerInfo, 'id'>[];
  validationErrors: {
    row: number;
    field: string;
    error: string;
  }[];
}

// Booking Steps and Progress
export interface BookingProgress {
  currentStep: number;
  totalSteps: number;
  completedSteps: string[];
  steps: BookingStepInfo[];
}

export interface BookingStepInfo {
  id: string;
  title: string;
  description: string;
  icon: string;
  status: 'pending' | 'in-progress' | 'completed' | 'skipped';
  required: boolean;
  order: number;
}

// Price Breakdown for Advanced Features
export interface EnhancedPricingBreakdown extends BookingPricing {
  seatSelectionCosts: {
    [passengerId: string]: number;
  };
  mealCosts: {
    [passengerId: string]: number;
  };
  baggageCosts: {
    [passengerId: string]: number;
  };
  insuranceCost: number;
  groupDiscount?: number;
  totalBeforeAddons: number;
  totalAddons: number;
}

// Complete Enhanced Booking
export interface EnhancedFlightBooking extends FlightBooking {
  // Seat selections per segment
  seatSelections?: {
    [segmentId: string]: PassengerSeatSelection[];
  };
  
  // Meal preferences per segment
  mealSelections?: {
    [segmentId: string]: PassengerMealSelection[];
  };
  
  // Baggage for all passengers
  baggageSelections?: PassengerBaggageSelection[];
  
  // Travel insurance
  insurance?: BookingInsurance;
  
  // Group booking details
  groupBooking?: GroupBookingInfo;
  
  // Enhanced pricing
  enhancedPricing?: EnhancedPricingBreakdown;
}

// API Request/Response Types
export interface GetSeatMapRequest {
  segmentId: string;
  flightNumber: string;
  date: string;
}

export interface GetMealOptionsRequest {
  segmentId: string;
  flightNumber: string;
  cabinClass: string;
}

export interface GetInsuranceQuoteRequest {
  passengerCount: number;
  tripCost: number;
  tripType: 'one-way' | 'round-trip' | 'multi-city';
  departureDate: string;
  returnDate?: string;
}

export interface CreateEnhancedBookingRequest extends CreateBookingRequest {
  seatSelections?: PassengerSeatSelection[];
  mealSelections?: PassengerMealSelection[];
  baggageSelections?: PassengerBaggageSelection[];
  insurance?: {
    insuranceId: string;
    coveredPassengers: string[];
  };
  groupBooking?: GroupBookingInfo;
}

// Note: All types are already exported individually above
