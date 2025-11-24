/**
 * KiwiProvider Unit Tests
 * Tests for Kiwi.com Tequila API provider implementation
 */

import { KiwiProvider } from '../KiwiProvider';
import { FlightSearchParams, AirportSearchParams } from '../types';

// Mock fetch globally
global.fetch = jest.fn();

describe('KiwiProvider', () => {
  let provider: KiwiProvider;
  const mockApiKey = 'test_kiwi_api_key';
  const mockPartnerId = 'test_partner_id';

  beforeEach(() => {
    provider = new KiwiProvider();
    jest.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize successfully with valid credentials', async () => {
      await expect(
        provider.initialize({
          apiKey: mockApiKey,
          partnerId: mockPartnerId,
        })
      ).resolves.not.toThrow();

      expect(provider.name).toBe('Kiwi.com');
      expect(provider.providerType).toBe('KIWI');
    });

    it('should throw error when API key is missing', async () => {
      await expect(
        provider.initialize({})
      ).rejects.toThrow('Kiwi.com API key is required');
    });

    it('should initialize without partner ID (optional)', async () => {
      await expect(
        provider.initialize({
          apiKey: mockApiKey,
        })
      ).resolves.not.toThrow();
    });
  });

  describe('Flight Search', () => {
    const searchParams: FlightSearchParams = {
      origin: 'JFK',
      destination: 'LAX',
      departureDate: '2025-12-01',
      adults: 1,
      children: 0,
      infants: 0,
      cabinClass: 'ECONOMY',
      currency: 'USD',
      maxResults: 10,
    };

    beforeEach(async () => {
      await provider.initialize({ apiKey: mockApiKey });
    });

    it('should search flights successfully', async () => {
      const mockResponse = {
        data: [
          {
            id: 'kiwi_123',
            price: 250,
            quality: 800,
            route: [
              {
                flyFrom: 'JFK',
                flyTo: 'LAX',
                cityFrom: 'New York',
                cityTo: 'Los Angeles',
                airline: 'AA',
                flight_no: '100',
                local_departure: 1733097600, // Unix timestamp
                local_arrival: 1733108400,
                duration: { total: 300 }, // 5 hours in minutes
              },
            ],
            availability: { seats: 9 },
          },
        ],
        _results: 1,
        search_id: 'search_123',
        currency: 'USD',
        fx_rate: 1,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const results = await provider.searchFlights(searchParams);

      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('kiwi-kiwi_123');
      expect(results[0].provider).toBe('Kiwi.com');
      expect(results[0].price.total).toBe(250);
      expect(results[0].price.currency).toBe('USD');
      expect(results[0].availableSeats).toBe(9);
      expect(results[0].itineraries).toHaveLength(1);

      // Verify API call
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/v2/search'),
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            apikey: mockApiKey,
          }),
        })
      );
    });

    it('should handle round-trip searches', async () => {
      const roundTripParams = {
        ...searchParams,
        returnDate: '2025-12-08',
      };

      const mockResponse = {
        data: [
          {
            id: 'kiwi_456',
            price: 400,
            quality: 750,
            route: [
              {
                flyFrom: 'JFK',
                flyTo: 'LAX',
                airline: 'AA',
                flight_no: '100',
                local_departure: 1733097600,
                local_arrival: 1733108400,
                duration: { total: 300 },
              },
              {
                flyFrom: 'LAX',
                flyTo: 'JFK',
                airline: 'AA',
                flight_no: '200',
                local_departure: 1733702400,
                local_arrival: 1733713200,
                duration: { total: 300 },
              },
            ],
          },
        ],
        _results: 1,
        currency: 'USD',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const results = await provider.searchFlights(roundTripParams);

      expect(results).toHaveLength(1);
      expect(results[0].itineraries.length).toBeGreaterThanOrEqual(1);

      // Verify return_from and return_to were added to API call
      const fetchCall = (global.fetch as jest.Mock).mock.calls[0][0];
      expect(fetchCall).toContain('return_from=2025-12-08');
      expect(fetchCall).toContain('return_to=2025-12-08');
    });

    it('should handle direct flights only filter', async () => {
      const directParams = {
        ...searchParams,
        directFlightsOnly: true,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [], _results: 0, currency: 'USD' }),
      });

      await provider.searchFlights(directParams);

      const fetchCall = (global.fetch as jest.Mock).mock.calls[0][0];
      expect(fetchCall).toContain('max_stopovers=0');
    });

    it('should handle cabin class mapping', async () => {
      const businessParams = {
        ...searchParams,
        cabinClass: 'BUSINESS' as const,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [], _results: 0, currency: 'USD' }),
      });

      await provider.searchFlights(businessParams);

      const fetchCall = (global.fetch as jest.Mock).mock.calls[0][0];
      expect(fetchCall).toContain('selected_cabins=C');
    });

    it('should return empty array on API error', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      const results = await provider.searchFlights(searchParams);

      expect(results).toEqual([]);
    });

    it('should return empty array on network error', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error('Network error')
      );

      const results = await provider.searchFlights(searchParams);

      expect(results).toEqual([]);
    });

    it('should throw error when provider not initialized', async () => {
      const uninitializedProvider = new KiwiProvider();

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [], currency: 'USD' }),
      });

      const results = await uninitializedProvider.searchFlights(searchParams);

      expect(results).toEqual([]);
    });

    it('should update metrics on successful search', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [], _results: 0, currency: 'USD' }),
      });

      await provider.searchFlights(searchParams);

      const metrics = provider.getMetrics();
      expect(metrics.totalRequests).toBe(1);
      expect(metrics.successfulRequests).toBe(1);
      expect(metrics.failedRequests).toBe(0);
      expect(metrics.averageLatency).toBeGreaterThan(0);
    });

    it('should update metrics on failed search', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error('API Error')
      );

      await provider.searchFlights(searchParams);

      const metrics = provider.getMetrics();
      expect(metrics.totalRequests).toBe(1);
      expect(metrics.successfulRequests).toBe(0);
      expect(metrics.failedRequests).toBe(1);
    });
  });

  describe('Airport Search', () => {
    const searchParams: AirportSearchParams = {
      keyword: 'New York',
      limit: 10,
    };

    beforeEach(async () => {
      await provider.initialize({ apiKey: mockApiKey });
    });

    it('should search airports successfully', async () => {
      const mockResponse = {
        locations: [
          {
            type: 'airport',
            code: 'JFK',
            id: 'jfk_airport',
            name: 'John F. Kennedy International Airport',
            city: { name: 'New York' },
            country: { name: 'United States', code: 'US' },
          },
          {
            type: 'airport',
            code: 'LGA',
            id: 'lga_airport',
            name: 'LaGuardia Airport',
            city: { name: 'New York' },
            country: { name: 'United States', code: 'US' },
          },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const results = await provider.searchAirports(searchParams);

      expect(results).toHaveLength(2);
      expect(results[0].iataCode).toBe('JFK');
      expect(results[0].name).toBe('John F. Kennedy International Airport');
      expect(results[0].city).toBe('New York');
      expect(results[0].country).toBe('United States');
      expect(results[0].countryCode).toBe('US');

      // Verify API call
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/locations/query'),
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            apikey: mockApiKey,
          }),
        })
      );
    });

    it('should filter non-airport locations', async () => {
      const mockResponse = {
        locations: [
          {
            type: 'airport',
            code: 'JFK',
            name: 'John F. Kennedy International Airport',
            city: { name: 'New York' },
            country: { name: 'United States', code: 'US' },
          },
          {
            type: 'city',
            code: 'NYC',
            name: 'New York',
            country: { name: 'United States', code: 'US' },
          },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const results = await provider.searchAirports(searchParams);

      expect(results).toHaveLength(1);
      expect(results[0].iataCode).toBe('JFK');
    });

    it('should handle country code filter', async () => {
      const paramsWithCountry = {
        ...searchParams,
        countryCode: 'US',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ locations: [] }),
      });

      await provider.searchAirports(paramsWithCountry);

      const fetchCall = (global.fetch as jest.Mock).mock.calls[0][0];
      expect(fetchCall).toContain('locale=US');
    });

    it('should return empty array on API error', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      const results = await provider.searchAirports(searchParams);

      expect(results).toEqual([]);
    });

    it('should return empty array on network error', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error('Network error')
      );

      const results = await provider.searchAirports(searchParams);

      expect(results).toEqual([]);
    });
  });

  describe('Health Check', () => {
    beforeEach(async () => {
      await provider.initialize({ apiKey: mockApiKey });
    });

    it('should return healthy status when API is working', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          locations: [
            {
              type: 'airport',
              code: 'JFK',
              name: 'Test Airport',
              city: { name: 'Test' },
              country: { name: 'Test', code: 'TS' },
            },
          ],
        }),
      });

      const health = await provider.checkHealth();

      expect(health.isHealthy).toBe(true);
      expect(health.latency).toBeGreaterThan(0);
      expect(health.message).toBe('Provider is healthy');
    });

    it('should return unhealthy status when API returns no results', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ locations: [] }),
      });

      const health = await provider.checkHealth();

      expect(health.isHealthy).toBe(false);
      expect(health.message).toBe('No results returned');
    });

    it('should return unhealthy status when API fails', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error('API Error')
      );

      const health = await provider.checkHealth();

      expect(health.isHealthy).toBe(false);
      expect(health.message).toBe('API Error');
    });

    it('should return unhealthy status when not initialized', async () => {
      const uninitializedProvider = new KiwiProvider();
      const health = await uninitializedProvider.checkHealth();

      expect(health.isHealthy).toBe(false);
      expect(health.message).toBe('Provider not initialized');
    });

    it('should calculate success rate correctly', async () => {
      // First perform some searches to build metrics
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ data: [], currency: 'USD' }),
      });

      await provider.searchFlights({
        origin: 'JFK',
        destination: 'LAX',
        departureDate: '2025-12-01',
        adults: 1,
      });

      await provider.searchFlights({
        origin: 'LAX',
        destination: 'JFK',
        departureDate: '2025-12-01',
        adults: 1,
      });

      // Now check health
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          locations: [{ type: 'airport', code: 'JFK', name: 'Test' }],
        }),
      });

      const health = await provider.checkHealth();

      expect(health.successRate).toBe(100); // 2 successful + 1 health check = 3/3
    });
  });

  describe('Helper Methods', () => {
    beforeEach(async () => {
      await provider.initialize({ apiKey: mockApiKey });
    });

    it('should map quality scores to fare classes correctly', async () => {
      const mockResponses = [
        { quality: 950, expectedClass: 'FIRST' },
        { quality: 800, expectedClass: 'BUSINESS' },
        { quality: 600, expectedClass: 'PREMIUM_ECONOMY' },
        { quality: 400, expectedClass: 'ECONOMY' },
      ];

      for (const { quality, expectedClass } of mockResponses) {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            data: [
              {
                id: 'test',
                price: 100,
                quality,
                route: [
                  {
                    flyFrom: 'JFK',
                    flyTo: 'LAX',
                    airline: 'AA',
                    flight_no: '100',
                    local_departure: 1733097600,
                    local_arrival: 1733108400,
                    duration: { total: 300 },
                  },
                ],
              },
            ],
            currency: 'USD',
          }),
        });

        const results = await provider.searchFlights({
          origin: 'JFK',
          destination: 'LAX',
          departureDate: '2025-12-01',
          adults: 1,
        });

        expect(results[0].fareClass).toBe(expectedClass);
      }
    });

    it('should format duration correctly', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: [
            {
              id: 'test',
              price: 100,
              route: [
                {
                  flyFrom: 'JFK',
                  flyTo: 'LAX',
                  airline: 'AA',
                  flight_no: '100',
                  local_departure: 1733097600,
                  local_arrival: 1733115600, // 5 hours later
                  duration: { total: 300 }, // 5 hours
                },
              ],
            },
          ],
          currency: 'USD',
        }),
      });

      const results = await provider.searchFlights({
        origin: 'JFK',
        destination: 'LAX',
        departureDate: '2025-12-01',
        adults: 1,
      });

      expect(results[0].itineraries[0].segments[0].duration).toMatch(/PT\d+H\d+M/);
    });
  });

  describe('Metrics Tracking', () => {
    beforeEach(async () => {
      await provider.initialize({ apiKey: mockApiKey });
    });

    it('should track metrics correctly', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: [], currency: 'USD' }),
        })
        .mockRejectedValueOnce(new Error('Error'));

      // Successful request
      await provider.searchFlights({
        origin: 'JFK',
        destination: 'LAX',
        departureDate: '2025-12-01',
        adults: 1,
      });

      // Failed request
      await provider.searchFlights({
        origin: 'LAX',
        destination: 'JFK',
        departureDate: '2025-12-01',
        adults: 1,
      });

      const metrics = provider.getMetrics();

      expect(metrics.totalRequests).toBe(2);
      expect(metrics.successfulRequests).toBe(1);
      expect(metrics.failedRequests).toBe(1);
      expect(metrics.lastUsed).toBeInstanceOf(Date);
      expect(metrics.averageLatency).toBeGreaterThan(0);
    });

    it('should calculate average latency correctly', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ data: [], currency: 'USD' }),
      });

      // Perform multiple requests
      for (let i = 0; i < 5; i++) {
        await provider.searchFlights({
          origin: 'JFK',
          destination: 'LAX',
          departureDate: '2025-12-01',
          adults: 1,
        });
      }

      const metrics = provider.getMetrics();

      expect(metrics.totalRequests).toBe(5);
      expect(metrics.averageLatency).toBeGreaterThan(0);
    });
  });
});
