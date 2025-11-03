/**
 * API Provider Abstraction Layer Types
 * Defines interfaces for multiple flight API providers (Amadeus, Skyscanner, Kiwi, etc.)
 */

export interface FlightSearchParams {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  adults: number;
  children?: number;
  infants?: number;
  cabinClass?: 'ECONOMY' | 'PREMIUM_ECONOMY' | 'BUSINESS' | 'FIRST';
  directFlightsOnly?: boolean;
  maxStops?: number;
  currency?: string;
  maxResults?: number;
}

export interface FlightOffer {
  id: string;
  provider: string;
  
  // Price information
  price: {
    total: number;
    base: number;
    taxes: number;
    fees: number;
    currency: string;
  };
  
  // Flight segments (outbound and return)
  itineraries: FlightItinerary[];
  
  // Booking information
  availableSeats: number;
  validatingAirline: string;
  
  // Additional metadata
  fareClass: string;
  bookingClass: string;
  lastTicketingDate?: string;
}

export interface FlightItinerary {
  duration: string; // ISO 8601 duration (e.g., "PT5H30M")
  segments: FlightSegment[];
}

export interface FlightSegment {
  departure: {
    iataCode: string;
    terminal?: string;
    at: string; // ISO 8601 datetime
  };
  arrival: {
    iataCode: string;
    terminal?: string;
    at: string;
  };
  carrierCode: string;
  flightNumber: string;
  aircraft?: {
    code: string;
  };
  duration: string;
  numberOfStops: number;
  operatingCarrier?: string;
}

export interface AirportSearchParams {
  keyword: string;
  countryCode?: string;
  limit?: number;
}

export interface Airport {
  iataCode: string;
  name: string;
  city: string;
  country: string;
  countryCode: string;
}

export interface ProviderCredentials {
  clientId?: string;
  clientSecret?: string;
  apiKey?: string;
  environment?: 'test' | 'production';
  [key: string]: any; // Allow additional provider-specific fields
}

export interface ProviderHealth {
  isHealthy: boolean;
  latency?: number;
  lastChecked: Date;
  errorCount: number;
  successRate: number;
  message?: string;
}

export interface ProviderMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageLatency: number;
  lastUsed?: Date;
}

/**
 * Base interface that all flight API providers must implement
 */
export interface IFlightProvider {
  // Provider identification
  readonly name: string;
  readonly providerType: 'AMADEUS' | 'SKYSCANNER' | 'KIWI' | 'SABRE' | 'TRAVELPORT' | 'CUSTOM';
  
  // Core functionality
  searchFlights(params: FlightSearchParams): Promise<FlightOffer[]>;
  searchAirports(params: AirportSearchParams): Promise<Airport[]>;
  
  // Provider management
  initialize(credentials: ProviderCredentials): Promise<void>;
  checkHealth(): Promise<ProviderHealth>;
  getMetrics(): ProviderMetrics;
  
  // Optional features
  getFlightDetails?(offerId: string): Promise<FlightOffer>;
  createBooking?(offer: FlightOffer, passengers: any[]): Promise<any>;
}

/**
 * Provider configuration from database
 */
export interface ProviderConfig {
  id: string;
  name: string;
  displayName: string;
  provider: 'AMADEUS' | 'SKYSCANNER' | 'KIWI' | 'SABRE' | 'TRAVELPORT' | 'CUSTOM';
  credentials: ProviderCredentials;
  environment: string;
  isActive: boolean;
  isPrimary: boolean;
  priority: number;
  supportedFeatures: string[];
}

/**
 * Result wrapper for provider operations
 */
export interface ProviderResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  provider: string;
  timestamp: Date;
  metrics?: {
    duration: number;
    cached: boolean;
  };
}
