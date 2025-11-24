/**
 * Skyscanner API Provider Implementation
 * Implements IFlightProvider interface for Skyscanner Flight Search API
 * 
 * API Documentation: https://developers.skyscanner.net/docs/
 * Known for: Comprehensive flight options, price comparison, flexible date search
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

interface SkyscannerFlightResponse {
  data: {
    itineraries: any[];
    places: any[];
    carriers: any[];
    agents: any[];
  };
  meta: {
    count: number;
    requestId: string;
  };
}

export class SkyscannerProvider implements IFlightProvider {
  readonly name = 'Skyscanner';
  readonly providerType = 'SKYSCANNER' as const;

  private apiKey: string | undefined;
  private baseUrl = 'https://partners.api.skyscanner.net/apiservices';
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
      
      if (!this.apiKey) {
        throw new Error('Skyscanner API key is required');
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

      // Skyscanner uses locale-currency-market format
      const locale = 'en-US';
      const currency = params.currency || 'USD';
      const market = 'US';

      // Build search request
      const searchUrl = `${this.baseUrl}/v3/flights/live/search/create`;
      
      const requestBody = {
        query: {
          market,
          locale,
          currency,
          queryLegs: [
            {
              originPlaceId: { iata: params.origin },
              destinationPlaceId: { iata: params.destination },
              date: {
                year: parseInt(params.departureDate.split('-')[0]),
                month: parseInt(params.departureDate.split('-')[1]),
                day: parseInt(params.departureDate.split('-')[2]),
              },
            },
          ],
          adults: params.adults,
          children: params.children || 0,
          infants: params.infants || 0,
          cabinClass: this.mapCabinClass(params.cabinClass),
          includedCarriersIds: [],
          excludedCarriersIds: [],
        },
      };

      // Add return leg if round trip
      if (params.returnDate) {
        requestBody.query.queryLegs.push({
          originPlaceId: { iata: params.destination },
          destinationPlaceId: { iata: params.origin },
          date: {
            year: parseInt(params.returnDate.split('-')[0]),
            month: parseInt(params.returnDate.split('-')[1]),
            day: parseInt(params.returnDate.split('-')[2]),
          },
        });
      }

      // Create search session
      const createResponse = await fetch(searchUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
        },
        body: JSON.stringify(requestBody),
      });

      if (!createResponse.ok) {
        throw new Error(`Skyscanner API error: ${createResponse.status}`);
      }

      const createData = await createResponse.json();
      const sessionToken = createData.sessionToken;

      // Poll for results
      const pollUrl = `${this.baseUrl}/v3/flights/live/search/poll/${sessionToken}`;
      let attempts = 0;
      const maxAttempts = 10;
      let results: SkyscannerFlightResponse | null = null;

      while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second

        const pollResponse = await fetch(pollUrl, {
          method: 'POST',
          headers: {
            'x-api-key': this.apiKey,
          },
        });

        if (!pollResponse.ok) {
          throw new Error(`Skyscanner poll error: ${pollResponse.status}`);
        }

        const pollData: SkyscannerFlightResponse = await pollResponse.json();

        // Check if results are complete
        if (pollData.data.itineraries && pollData.data.itineraries.length > 0) {
          results = pollData;
          break;
        }

        attempts++;
      }

      if (!results || !results.data.itineraries) {
        return []; // No results found
      }

      // Transform Skyscanner results to our format
      const offers: FlightOffer[] = results.data.itineraries
        .slice(0, params.maxResults || 50)
        .map((itinerary: any, index: number) => this.transformOffer(itinerary, results!, index));

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

      // Skyscanner places autosuggest API
      const searchUrl = `${this.baseUrl}/v3/autosuggest/flights`;
      
      const queryParams = new URLSearchParams({
        query: params.keyword,
        locale: 'en-US',
        market: 'US',
        limit: (params.limit || 10).toString(),
      });

      const response = await fetch(`${searchUrl}?${queryParams}`, {
        method: 'GET',
        headers: {
          'x-api-key': this.apiKey,
        },
      });

      if (!response.ok) {
        throw new Error(`Skyscanner API error: ${response.status}`);
      }

      const data = await response.json();

      const airports: Airport[] = (data.places || [])
        .filter((place: any) => place.type === 'AIRPORT' || place.type === 'CITY')
        .map((place: any) => ({
          iataCode: place.iataCode || place.skyId,
          name: place.name,
          city: place.cityName || place.name,
          country: place.countryName || '',
          countryCode: place.countryId || '',
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
        keyword: 'London',
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

  private transformOffer(
    itinerary: any,
    response: SkyscannerFlightResponse,
    index: number
  ): FlightOffer {
    const pricing = itinerary.pricingOptions?.[0] || {};
    const legs = itinerary.legs || [];

    return {
      id: `skyscanner-${itinerary.id || index}`,
      provider: this.name,
      price: {
        total: pricing.price?.amount || 0,
        base: pricing.price?.amount || 0,
        taxes: 0,
        fees: 0,
        currency: pricing.price?.unit || 'USD',
      },
      itineraries: legs.map((leg: any) => ({
        duration: this.formatDuration(leg.durationInMinutes || 0),
        segments: (leg.segments || []).map((segment: any) => {
          const origin = this.findPlace(response.data.places, segment.originPlaceId);
          const destination = this.findPlace(response.data.places, segment.destinationPlaceId);
          const carrier = this.findCarrier(response.data.carriers, segment.operatingCarrierId);

          return {
            departure: {
              iataCode: origin?.iataCode || segment.originPlaceId,
              at: segment.departureDateTime || new Date().toISOString(),
            },
            arrival: {
              iataCode: destination?.iataCode || segment.destinationPlaceId,
              at: segment.arrivalDateTime || new Date().toISOString(),
            },
            carrierCode: carrier?.iataCode || segment.marketingCarrierId || 'XX',
            flightNumber: segment.flightNumber || '0000',
            duration: this.formatDuration(segment.durationInMinutes || 0),
            numberOfStops: segment.stopCount || 0,
            operatingCarrier: carrier?.name || 'Unknown',
          };
        }),
      })),
      availableSeats: 9, // Skyscanner doesn't provide this
      validatingAirline: legs[0]?.segments?.[0]?.marketingCarrierId || 'XX',
      fareClass: 'ECONOMY',
      bookingClass: itinerary.tags?.[0] || 'Y',
      lastTicketingDate: undefined,
    };
  }

  private findPlace(places: any[], placeId: string): any {
    return places.find(p => p.id === placeId);
  }

  private findCarrier(carriers: any[], carrierId: string): any {
    return carriers.find(c => c.id === carrierId);
  }

  private formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `PT${hours}H${mins}M`;
  }

  private mapCabinClass(cabinClass?: string): string {
    const mapping: Record<string, string> = {
      ECONOMY: 'CABIN_CLASS_ECONOMY',
      PREMIUM_ECONOMY: 'CABIN_CLASS_PREMIUM_ECONOMY',
      BUSINESS: 'CABIN_CLASS_BUSINESS',
      FIRST: 'CABIN_CLASS_FIRST',
    };
    return mapping[cabinClass || 'ECONOMY'] || 'CABIN_CLASS_ECONOMY';
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
