/**
 * Amadeus API Provider Implementation
 * Implements IFlightProvider interface for Amadeus Travel API
 */

import Amadeus from 'amadeus';
import {
  IFlightProvider,
  FlightSearchParams,
  FlightOffer,
  AirportSearchParams,
  Airport,
  ProviderCredentials,
  ProviderHealth,
  ProviderMetrics,
} from './types';

export class AmadeusProvider implements IFlightProvider {
  readonly name = 'Amadeus';
  readonly providerType = 'AMADEUS' as const;

  private client: any;
  private metrics: ProviderMetrics = {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    averageLatency: 0,
    lastUsed: undefined,
  };
  private latencies: number[] = [];

  async initialize(credentials: ProviderCredentials): Promise<void> {
    try {
      this.client = new Amadeus({
        clientId: credentials.clientId,
        clientSecret: credentials.clientSecret,
        hostname: credentials.environment === 'production' ? 'production' : 'test',
      });
      console.log(`✅ ${this.name} provider initialized successfully`);
    } catch (error) {
      console.error(`❌ Failed to initialize ${this.name} provider:`, error);
      throw new Error(`Failed to initialize ${this.name} provider`);
    }
  }

  async searchFlights(params: FlightSearchParams): Promise<FlightOffer[]> {
    const startTime = Date.now();
    this.metrics.totalRequests++;
    this.metrics.lastUsed = new Date();

    try {
      if (!this.client) {
        throw new Error('Provider not initialized');
      }

      const searchParams: any = {
        originLocationCode: params.origin,
        destinationLocationCode: params.destination,
        departureDate: params.departureDate,
        adults: params.adults,
        max: params.maxResults || 50,
        currencyCode: params.currency || 'USD',
      };

      if (params.returnDate) {
        searchParams.returnDate = params.returnDate;
      }

      if (params.children) {
        searchParams.children = params.children;
      }

      if (params.infants) {
        searchParams.infants = params.infants;
      }

      if (params.cabinClass) {
        searchParams.travelClass = params.cabinClass;
      }

      if (params.directFlightsOnly) {
        searchParams.nonStop = true;
      }

      if (params.maxStops !== undefined) {
        searchParams.maxStops = params.maxStops;
      }

      const response = await this.client.shopping.flightOffersSearch.get(searchParams);

      const offers: FlightOffer[] = response.data.map((offer: any) => this.transformOffer(offer));

      // Update metrics
      const latency = Date.now() - startTime;
      this.latencies.push(latency);
      if (this.latencies.length > 100) this.latencies.shift();
      this.metrics.averageLatency = this.latencies.reduce((a, b) => a + b, 0) / this.latencies.length;
      this.metrics.successfulRequests++;

      return offers;
    } catch (error) {
      this.metrics.failedRequests++;
      console.error(`${this.name} searchFlights error:`, error);
      throw error;
    }
  }

  async searchAirports(params: AirportSearchParams): Promise<Airport[]> {
    const startTime = Date.now();
    this.metrics.totalRequests++;
    this.metrics.lastUsed = new Date();

    try {
      if (!this.client) {
        throw new Error('Provider not initialized');
      }

      const searchParams: any = {
        keyword: params.keyword,
        subType: 'AIRPORT,CITY',
      };

      if (params.limit) {
        searchParams.max = params.limit;
      }

      const response = await this.client.referenceData.locations.get(searchParams);

      const airports: Airport[] = response.data.map((location: any) => ({
        iataCode: location.iataCode,
        name: location.name,
        city: location.address?.cityName || location.name,
        country: location.address?.countryName || '',
        countryCode: location.address?.countryCode || '',
      }));

      // Update metrics
      const latency = Date.now() - startTime;
      this.latencies.push(latency);
      if (this.latencies.length > 100) this.latencies.shift();
      this.metrics.averageLatency = this.latencies.reduce((a, b) => a + b, 0) / this.latencies.length;
      this.metrics.successfulRequests++;

      return airports;
    } catch (error) {
      this.metrics.failedRequests++;
      console.error(`${this.name} searchAirports error:`, error);
      throw error;
    }
  }

  async checkHealth(): Promise<ProviderHealth> {
    const startTime = Date.now();
    
    try {
      if (!this.client) {
        return {
          isHealthy: false,
          lastChecked: new Date(),
          errorCount: this.metrics.failedRequests,
          successRate: 0,
          message: 'Provider not initialized',
        };
      }

      // Perform a simple health check by searching for a major airport
      await this.client.referenceData.locations.get({
        keyword: 'NYC',
        subType: 'AIRPORT',
        max: 1,
      });

      const latency = Date.now() - startTime;
      const successRate =
        this.metrics.totalRequests > 0
          ? (this.metrics.successfulRequests / this.metrics.totalRequests) * 100
          : 100;

      return {
        isHealthy: true,
        latency,
        lastChecked: new Date(),
        errorCount: this.metrics.failedRequests,
        successRate,
        message: 'Provider is healthy',
      };
    } catch (error) {
      return {
        isHealthy: false,
        latency: Date.now() - startTime,
        lastChecked: new Date(),
        errorCount: this.metrics.failedRequests,
        successRate: 0,
        message: error instanceof Error ? error.message : 'Health check failed',
      };
    }
  }

  getMetrics(): ProviderMetrics {
    return { ...this.metrics };
  }

  /**
   * Transform Amadeus offer format to our standard format
   */
  private transformOffer(amadeusOffer: any): FlightOffer {
    return {
      id: amadeusOffer.id,
      provider: this.name,
      price: {
        total: parseFloat(amadeusOffer.price.total),
        base: parseFloat(amadeusOffer.price.base || amadeusOffer.price.total),
        taxes: parseFloat(amadeusOffer.price.total) - parseFloat(amadeusOffer.price.base || amadeusOffer.price.total),
        fees: 0,
        currency: amadeusOffer.price.currency,
      },
      itineraries: amadeusOffer.itineraries.map((itinerary: any) => ({
        duration: itinerary.duration,
        segments: itinerary.segments.map((segment: any) => ({
          departure: {
            iataCode: segment.departure.iataCode,
            terminal: segment.departure.terminal,
            at: segment.departure.at,
          },
          arrival: {
            iataCode: segment.arrival.iataCode,
            terminal: segment.arrival.terminal,
            at: segment.arrival.at,
          },
          carrierCode: segment.carrierCode,
          flightNumber: segment.number,
          aircraft: segment.aircraft,
          duration: segment.duration,
          numberOfStops: segment.numberOfStops || 0,
          operatingCarrier: segment.operating?.carrierCode,
        })),
      })),
      availableSeats: amadeusOffer.numberOfBookableSeats || 9,
      validatingAirline: amadeusOffer.validatingAirlineCodes?.[0] || '',
      fareClass: amadeusOffer.travelerPricings?.[0]?.fareDetailsBySegment?.[0]?.cabin || 'ECONOMY',
      bookingClass: amadeusOffer.travelerPricings?.[0]?.fareDetailsBySegment?.[0]?.class || 'Y',
      lastTicketingDate: amadeusOffer.lastTicketingDate,
    };
  }
}
