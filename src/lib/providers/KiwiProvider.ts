/**
 * Kiwi.com API Provider Implementation
 * Implements IFlightProvider interface for Kiwi.com Tequila API
 * 
 * API Documentation: https://tequila.kiwi.com/portal/docs/tequila_api
 * Known for: Cheap flights, unique routes, virtual interlining, hidden city ticketing
 */

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

interface KiwiFlightResponse {
  data: any[];
  _results: number;
  search_id: string;
  currency: string;
  fx_rate: number;
}

export class KiwiProvider implements IFlightProvider {
  readonly name = 'Kiwi.com';
  readonly providerType = 'KIWI' as const;

  private apiKey: string | undefined;
  private partnerId: string | undefined;
  private baseUrl = 'https://api.tequila.kiwi.com';
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
      this.apiKey = credentials.apiKey;
      this.partnerId = credentials['partnerId'];
      
      if (!this.apiKey) {
        throw new Error('Kiwi.com API key is required');
      }

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
      if (!this.apiKey) {
        throw new Error('Provider not initialized');
      }

      // Build search parameters for Kiwi API
      const searchParams = new URLSearchParams({
        fly_from: params.origin,
        fly_to: params.destination,
        date_from: params.departureDate,
        date_to: params.departureDate,
        adults: params.adults.toString(),
        children: (params.children || 0).toString(),
        infants: (params.infants || 0).toString(),
        curr: params.currency || 'USD',
        limit: (params.maxResults || 50).toString(),
        sort: 'quality', // Best balance of price and quality
        vehicle_type: 'aircraft',
      });

      // Add return date if round trip
      if (params.returnDate) {
        searchParams.append('return_from', params.returnDate);
        searchParams.append('return_to', params.returnDate);
      }

      // Add cabin class preference
      if (params.cabinClass) {
        searchParams.append('selected_cabins', this.mapCabinClass(params.cabinClass));
      }

      // Direct flights only
      if (params.directFlightsOnly) {
        searchParams.append('max_stopovers', '0');
      } else if (params.maxStops !== undefined) {
        searchParams.append('max_stopovers', params.maxStops.toString());
      }

      // Make API request
      const searchUrl = `${this.baseUrl}/v2/search?${searchParams}`;
      
      const response = await fetch(searchUrl, {
        method: 'GET',
        headers: {
          'apikey': this.apiKey,
          ...(this.partnerId && { 'Partner-ID': this.partnerId }),
        },
      });

      if (!response.ok) {
        throw new Error(`Kiwi API error: ${response.status}`);
      }

      const data: KiwiFlightResponse = await response.json();

      // Transform Kiwi results to our format
      const offers: FlightOffer[] = (data.data || [])
        .slice(0, params.maxResults || 50)
        .map((flight: any, index: number) => this.transformOffer(flight, data.currency, index));

      // Update metrics
      const latency = Date.now() - startTime;
      this.updateMetrics(latency, true);

      return offers;
    } catch (error) {
      this.metrics.failedRequests++;
      console.error(`${this.name} searchFlights error:`, error);
      
      // Return empty array instead of throwing to allow failover
      return [];
    }
  }

  async searchAirports(params: AirportSearchParams): Promise<Airport[]> {
    const startTime = Date.now();
    this.metrics.totalRequests++;
    this.metrics.lastUsed = new Date();

    try {
      if (!this.apiKey) {
        throw new Error('Provider not initialized');
      }

      // Kiwi locations API
      const searchParams = new URLSearchParams({
        term: params.keyword,
        location_types: 'airport',
        limit: (params.limit || 10).toString(),
        active_only: 'true',
      });

      if (params.countryCode) {
        searchParams.append('locale', params.countryCode);
      }

      const searchUrl = `${this.baseUrl}/locations/query?${searchParams}`;
      
      const response = await fetch(searchUrl, {
        method: 'GET',
        headers: {
          'apikey': this.apiKey,
        },
      });

      if (!response.ok) {
        throw new Error(`Kiwi API error: ${response.status}`);
      }

      const data = await response.json();

      const airports: Airport[] = (data.locations || [])
        .filter((loc: any) => loc.type === 'airport')
        .map((loc: any) => ({
          iataCode: loc.code || loc.id,
          name: loc.name,
          city: loc.city?.name || loc.name,
          country: loc.country?.name || '',
          countryCode: loc.country?.code || '',
        }));

      // Update metrics
      const latency = Date.now() - startTime;
      this.updateMetrics(latency, true);

      return airports;
    } catch (error) {
      this.metrics.failedRequests++;
      console.error(`${this.name} searchAirports error:`, error);
      return [];
    }
  }

  async checkHealth(): Promise<ProviderHealth> {
    const startTime = Date.now();

    try {
      if (!this.apiKey) {
        return {
          isHealthy: false,
          lastChecked: new Date(),
          errorCount: this.metrics.failedRequests,
          successRate: 0,
          message: 'Provider not initialized',
        };
      }

      // Perform a simple health check by searching for a major airport
      const airports = await this.searchAirports({
        keyword: 'New York',
        limit: 1,
      });

      const latency = Date.now() - startTime;
      const successRate =
        this.metrics.totalRequests > 0
          ? (this.metrics.successfulRequests / this.metrics.totalRequests) * 100
          : 100;

      return {
        isHealthy: airports.length > 0,
        latency,
        lastChecked: new Date(),
        errorCount: this.metrics.failedRequests,
        successRate,
        message: airports.length > 0 ? 'Provider is healthy' : 'No results returned',
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

  // Helper methods

  private transformOffer(flight: any, currency: string, index: number): FlightOffer {
    const price = flight.price || 0;
    const route = flight.route || [];

    // Group segments by direction (outbound/return)
    const itineraries = this.groupSegmentsByDirection(route);

    return {
      id: `kiwi-${flight.id || index}`,
      provider: this.name,
      price: {
        total: price,
        base: price * 0.85, // Estimate (Kiwi doesn't always provide breakdown)
        taxes: price * 0.10,
        fees: price * 0.05,
        currency: currency,
      },
      itineraries: itineraries.map(segments => ({
        duration: this.calculateTotalDuration(segments),
        segments: segments.map((seg: any) => ({
          departure: {
            iataCode: seg.flyFrom || seg.cityFrom,
            terminal: seg.departure_terminal,
            at: new Date(seg.local_departure * 1000).toISOString(),
          },
          arrival: {
            iataCode: seg.flyTo || seg.cityTo,
            terminal: seg.arrival_terminal,
            at: new Date(seg.local_arrival * 1000).toISOString(),
          },
          carrierCode: seg.airline || 'XX',
          flightNumber: seg.flight_no?.toString() || '0000',
          duration: this.formatDuration(seg.duration?.total || 0),
          numberOfStops: 0, // Kiwi shows each segment separately
          operatingCarrier: seg.operating_carrier || seg.airline,
        })),
      })),
      availableSeats: flight.availability?.seats || 9,
      validatingAirline: route[0]?.airline || 'XX',
      fareClass: this.mapQualityToFareClass(flight.quality),
      bookingClass: 'Y',
      lastTicketingDate: undefined,
    };
  }

  private groupSegmentsByDirection(route: any[]): any[][] {
    if (!route || route.length === 0) return [];

    // Kiwi provides segments in order; split by return indicator
    const groups: any[][] = [];
    let currentGroup: any[] = [];
    let lastDestination: string | null = null;

    for (const segment of route) {
      // If we're returning to origin or a previous city, start new group
      if (lastDestination && segment.flyFrom === lastDestination && currentGroup.length > 0) {
        groups.push(currentGroup);
        currentGroup = [segment];
      } else {
        currentGroup.push(segment);
      }
      lastDestination = segment.flyTo;
    }

    if (currentGroup.length > 0) {
      groups.push(currentGroup);
    }

    return groups.length > 0 ? groups : [route];
  }

  private calculateTotalDuration(segments: any[]): string {
    if (!segments || segments.length === 0) return 'PT0H0M';

    const firstDeparture = segments[0].local_departure;
    const lastArrival = segments[segments.length - 1].local_arrival;
    const totalMinutes = Math.floor((lastArrival - firstDeparture) / 60);

    return this.formatDuration(totalMinutes);
  }

  private formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `PT${hours}H${mins}M`;
  }

  private mapCabinClass(cabinClass?: string): string {
    const mapping: Record<string, string> = {
      ECONOMY: 'M',
      PREMIUM_ECONOMY: 'W',
      BUSINESS: 'C',
      FIRST: 'F',
    };
    return mapping[cabinClass || 'ECONOMY'] || 'M';
  }

  private mapQualityToFareClass(quality?: number): string {
    // Kiwi quality score is 0-1000+
    if (!quality) return 'ECONOMY';
    if (quality > 900) return 'FIRST';
    if (quality > 700) return 'BUSINESS';
    if (quality > 500) return 'PREMIUM_ECONOMY';
    return 'ECONOMY';
  }

  private updateMetrics(latency: number, success: boolean): void {
    this.latencies.push(latency);
    if (this.latencies.length > 100) this.latencies.shift();
    this.metrics.averageLatency =
      this.latencies.reduce((a, b) => a + b, 0) / this.latencies.length;
    
    if (success) {
      this.metrics.successfulRequests++;
    }
  }
}
