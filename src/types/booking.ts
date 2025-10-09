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

// Note: All types are already exported individually above
