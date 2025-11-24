/**
 * Provider Factory
 * Manages multiple flight API providers with automatic fallback and load balancing
 */

import { prisma } from '@/lib/prisma';
import { IFlightProvider, ProviderConfig, FlightSearchParams, FlightOffer, ProviderResult } from './types';
import { AmadeusProvider } from './AmadeusProvider';
import { SkyscannerProvider } from './SkyscannerProvider';
import { KiwiProvider } from './KiwiProvider';
import crypto from 'crypto';

// Provider registry
const PROVIDER_CLASSES: Record<string, new () => IFlightProvider> = {
  AMADEUS: AmadeusProvider,
  SKYSCANNER: SkyscannerProvider,
  KIWI: KiwiProvider,
};

/**
 * Provider Factory Singleton
 * Manages provider instances and configuration
 */
class ProviderFactory {
  private static instance: ProviderFactory;
  private providers: Map<string, IFlightProvider> = new Map();
  private primaryProvider: IFlightProvider | null = null;
  private configCache: Map<string, ProviderConfig> = new Map();
  private cacheTTL = 5 * 60 * 1000; // 5 minutes
  private lastCacheUpdate = 0;
  
  // Circuit breaker state
  private circuitBreakers: Map<string, CircuitBreakerState> = new Map();
  private readonly CIRCUIT_BREAKER_THRESHOLD = 5; // failures before opening
  private readonly CIRCUIT_BREAKER_TIMEOUT = 60000; // 1 minute
  private readonly CIRCUIT_BREAKER_RESET_TIMEOUT = 300000; // 5 minutes

  private constructor() {}

  static getInstance(): ProviderFactory {
    if (!ProviderFactory.instance) {
      ProviderFactory.instance = new ProviderFactory();
    }
    return ProviderFactory.instance;
  }

  /**
   * Initialize all active providers from database
   */
  async initializeProviders(): Promise<void> {
    try {
      const configs = await this.getProviderConfigs();
      
      console.log(`🔧 Initializing ${configs.length} flight API providers...`);
      
      for (const config of configs) {
        if (!config.isActive) {
          console.log(`⏭️  Skipping inactive provider: ${config.displayName}`);
          continue;
        }

        try {
          await this.initializeProvider(config);
          console.log(`✅ Provider initialized: ${config.displayName}`);
        } catch (error) {
          console.error(`❌ Failed to initialize ${config.displayName}:`, error);
        }
      }

      // Set primary provider
      const primaryConfig = configs.find(c => c.isPrimary && c.isActive);
      if (primaryConfig) {
        this.primaryProvider = this.providers.get(primaryConfig.name) || null;
        console.log(`🎯 Primary provider set to: ${primaryConfig.displayName}`);
      }

      if (!this.primaryProvider && this.providers.size > 0) {
        // Fallback to first available provider
        this.primaryProvider = Array.from(this.providers.values())[0];
        console.log(`⚠️  No primary provider set, using: ${this.primaryProvider.name}`);
      }

    } catch (error) {
      console.error('Failed to initialize providers:', error);
      throw error;
    }
  }

  /**
   * Initialize a single provider
   */
  private async initializeProvider(config: ProviderConfig): Promise<void> {
    const ProviderClass = PROVIDER_CLASSES[config.provider];
    
    if (!ProviderClass) {
      throw new Error(`Unknown provider type: ${config.provider}`);
    }

    const provider = new ProviderClass();
    const credentials = this.decryptCredentials(config.credentials);
    
    await provider.initialize(credentials);
    this.providers.set(config.name, provider);
    this.configCache.set(config.name, config);
  }

  /**
   * Get provider configurations from database with caching
   */
  private async getProviderConfigs(): Promise<ProviderConfig[]> {
    const now = Date.now();
    
    // Use cache if valid
    if (now - this.lastCacheUpdate < this.cacheTTL && this.configCache.size > 0) {
      return Array.from(this.configCache.values());
    }

    const dbConfigs = await prisma.apiProvider.findMany({
      orderBy: [{ isPrimary: 'desc' }, { priority: 'asc' }],
    });

    const configs: ProviderConfig[] = dbConfigs.map(config => ({
      id: config.id,
      name: config.name,
      displayName: config.displayName,
      provider: config.provider as any,
      credentials: JSON.parse(config.credentials),
      environment: config.environment,
      isActive: config.isActive,
      isPrimary: config.isPrimary,
      priority: config.priority,
      supportedFeatures: JSON.parse(config.supportedFeatures),
    }));

    this.lastCacheUpdate = now;
    return configs;
  }

  /**
   * Get primary provider or fallback
   */
  async getPrimaryProvider(): Promise<IFlightProvider> {
    if (!this.primaryProvider || this.providers.size === 0) {
      await this.initializeProviders();
    }

    if (!this.primaryProvider) {
      throw new Error('No active providers available');
    }

    return this.primaryProvider;
  }

  /**
   * Search flights with multi-provider parallel search and aggregation
   */
  async searchFlights(params: FlightSearchParams): Promise<ProviderResult<FlightOffer[]>> {
    const startTime = Date.now();
    const enableMultiProvider = process.env.ENABLE_MULTI_PROVIDER === 'true';
    const maxParallelProviders = parseInt(process.env.MAX_PARALLEL_PROVIDERS || '3', 10);
    const providerTimeout = parseInt(process.env.PROVIDER_TIMEOUT_MS || '5000', 10);

    // Get healthy providers
    const providers = await this.getHealthyProviders();
    
    if (providers.length === 0) {
      return {
        success: false,
        error: 'No healthy providers available',
        provider: 'none',
        timestamp: new Date(),
        metrics: {
          duration: Date.now() - startTime,
          cached: false,
        },
      };
    }

    // Multi-provider mode: parallel search
    if (enableMultiProvider && providers.length > 1) {
      return this.searchMultiProvider(params, providers.slice(0, maxParallelProviders), providerTimeout, startTime);
    }

    // Single provider mode: fallback chain
    return this.searchWithFallback(params, providers, startTime);
  }

  /**
   * Multi-provider parallel search with aggregation
   */
  private async searchMultiProvider(
    params: FlightSearchParams,
    providers: IFlightProvider[],
    timeout: number,
    startTime: number
  ): Promise<ProviderResult<FlightOffer[]>> {
    console.log(`🚀 Multi-provider search with ${providers.length} providers...`);

    // Create search promises with timeout
    const searchPromises = providers.map(async (provider) => {
      try {
        const timeoutPromise = new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Provider timeout')), timeout)
        );

        const searchPromise = provider.searchFlights(params);
        const offers = await Promise.race([searchPromise, timeoutPromise]);

        await this.updateProviderStats(provider.name, true);
        this.recordCircuitBreakerSuccess(provider.name);

        return {
          provider: provider.name,
          offers,
          success: true,
        };
      } catch (error) {
        console.error(`❌ ${provider.name} search failed:`, error);
        await this.updateProviderStats(provider.name, false);
        this.recordCircuitBreakerFailure(provider.name);

        return {
          provider: provider.name,
          offers: [] as FlightOffer[],
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    });

    // Wait for all providers to complete or fail
    const results = await Promise.allSettled(searchPromises);

    // Aggregate successful results
    const allOffers: FlightOffer[] = [];
    const successfulProviders: string[] = [];

    for (const result of results) {
      if (result.status === 'fulfilled' && result.value.success) {
        allOffers.push(...result.value.offers);
        successfulProviders.push(result.value.provider);
      }
    }

    if (allOffers.length === 0) {
      return {
        success: false,
        error: 'All providers returned no results',
        provider: providers.map(p => p.name).join(', '),
        timestamp: new Date(),
        metrics: {
          duration: Date.now() - startTime,
          cached: false,
        },
      };
    }

    // Deduplicate and sort results
    const deduplicatedOffers = this.deduplicateOffers(allOffers);
    const sortedOffers = this.sortOffersByQuality(deduplicatedOffers);

    // Limit results
    const limitedOffers = sortedOffers.slice(0, params.maxResults || 50);

    console.log(`✅ Multi-provider search completed: ${limitedOffers.length} unique offers from ${successfulProviders.length} providers`);

    return {
      success: true,
      data: limitedOffers,
      provider: successfulProviders.join(', '),
      timestamp: new Date(),
      metrics: {
        duration: Date.now() - startTime,
        cached: false,
        providersUsed: successfulProviders.length,
        totalOffersBeforeDedup: allOffers.length,
      },
    };
  }

  /**
   * Single provider search with automatic fallback
   */
  private async searchWithFallback(
    params: FlightSearchParams,
    providers: IFlightProvider[],
    startTime: number
  ): Promise<ProviderResult<FlightOffer[]>> {
    let lastError: Error | null = null;

    for (const provider of providers) {
      try {
        console.log(`🔍 Searching flights with ${provider.name}...`);
        
        const offers = await provider.searchFlights(params);
        
        // Update usage statistics
        await this.updateProviderStats(provider.name, true);
        this.recordCircuitBreakerSuccess(provider.name);

        return {
          success: true,
          data: offers,
          provider: provider.name,
          timestamp: new Date(),
          metrics: {
            duration: Date.now() - startTime,
            cached: false,
          },
        };
      } catch (error) {
        lastError = error as Error;
        console.error(`❌ ${provider.name} search failed:`, error);
        
        // Update failure statistics
        await this.updateProviderStats(provider.name, false);
        this.recordCircuitBreakerFailure(provider.name);
        
        // Continue to next provider
        continue;
      }
    }

    // All providers failed
    return {
      success: false,
      error: lastError?.message || 'All providers failed',
      provider: 'none',
      timestamp: new Date(),
      metrics: {
        duration: Date.now() - startTime,
        cached: false,
      },
    };
  }

  /**
   * Get providers ordered by priority and health
   */
  private async getOrderedProviders(): Promise<IFlightProvider[]> {
    const configs = await this.getProviderConfigs();
    const activeConfigs = configs.filter(c => c.isActive);
    
    // Sort by primary first, then by priority
    activeConfigs.sort((a, b) => {
      if (a.isPrimary && !b.isPrimary) return -1;
      if (!a.isPrimary && b.isPrimary) return 1;
      return a.priority - b.priority;
    });

    return activeConfigs
      .map(config => this.providers.get(config.name))
      .filter((p): p is IFlightProvider => p !== undefined);
  }

  /**
   * Get healthy providers (excluding circuit breaker opened providers)
   */
  private async getHealthyProviders(): Promise<IFlightProvider[]> {
    const allProviders = await this.getOrderedProviders();
    
    return allProviders.filter(provider => {
      const state = this.getCircuitBreakerState(provider.name);
      return state.status !== 'OPEN';
    });
  }

  /**
   * Update provider usage statistics
   */
  private async updateProviderStats(providerName: string, success: boolean): Promise<void> {
    try {
      await prisma.apiProvider.update({
        where: { name: providerName },
        data: {
          totalRequests: { increment: 1 },
          successfulRequests: success ? { increment: 1 } : undefined,
          failedRequests: !success ? { increment: 1 } : undefined,
          lastUsedAt: new Date(),
        },
      });
    } catch (error) {
      console.error('Failed to update provider stats:', error);
    }
  }

  /**
   * Switch primary provider (admin action)
   */
  async switchPrimaryProvider(providerName: string): Promise<void> {
    try {
      // Remove primary flag from all providers
      await prisma.apiProvider.updateMany({
        where: { isPrimary: true },
        data: { isPrimary: false },
      });

      // Set new primary provider
      await prisma.apiProvider.update({
        where: { name: providerName },
        data: { isPrimary: true },
      });

      // Refresh providers
      this.configCache.clear();
      this.lastCacheUpdate = 0;
      await this.initializeProviders();

      console.log(`✅ Primary provider switched to: ${providerName}`);
    } catch (error) {
      console.error('Failed to switch primary provider:', error);
      throw error;
    }
  }

  /**
   * Get all provider health status
   */
  async getProviderHealthStatus() {
    const statuses = [];

    for (const [name, provider] of this.providers) {
      const health = await provider.checkHealth();
      const metrics = provider.getMetrics();
      const config = this.configCache.get(name);

      statuses.push({
        name,
        displayName: config?.displayName || name,
        providerType: provider.providerType,
        health,
        metrics,
        isPrimary: config?.isPrimary || false,
        isActive: config?.isActive || false,
      });
    }

    return statuses;
  }

  /**
   * Decrypt provider credentials
   */
  private decryptCredentials(encryptedCreds: any): any {
    // If credentials are already decrypted (for backward compatibility)
    if (typeof encryptedCreds === 'object' && encryptedCreds.clientId) {
      return encryptedCreds;
    }

    // Implement decryption logic here
    // For now, return as-is (should be encrypted in production)
    return encryptedCreds;
  }

  /**
   * Encrypt provider credentials
   */
  static encryptCredentials(credentials: any): string {
    // Implement encryption logic here
    // For now, just stringify (should be encrypted in production)
    const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'dev-key-change-in-production';
    
    // Simple encryption (use proper encryption in production)
    return JSON.stringify(credentials);
  }

  // ===== Circuit Breaker Pattern =====

  /**
   * Get circuit breaker state for a provider
   */
  private getCircuitBreakerState(providerName: string): CircuitBreakerState {
    const existing = this.circuitBreakers.get(providerName);
    if (!existing) {
      const newState: CircuitBreakerState = {
        status: 'CLOSED',
        failureCount: 0,
        lastFailure: null,
        nextRetry: null,
      };
      this.circuitBreakers.set(providerName, newState);
      return newState;
    }

    // Check if we should attempt to close an open circuit
    if (existing.status === 'OPEN' && existing.nextRetry && Date.now() > existing.nextRetry.getTime()) {
      existing.status = 'HALF_OPEN';
      console.log(`🔄 Circuit breaker for ${providerName} moved to HALF_OPEN`);
    }

    return existing;
  }

  /**
   * Record a circuit breaker failure
   */
  private recordCircuitBreakerFailure(providerName: string): void {
    const state = this.getCircuitBreakerState(providerName);
    state.failureCount++;
    state.lastFailure = new Date();

    if (state.failureCount >= this.CIRCUIT_BREAKER_THRESHOLD) {
      state.status = 'OPEN';
      state.nextRetry = new Date(Date.now() + this.CIRCUIT_BREAKER_TIMEOUT);
      console.warn(`⚠️  Circuit breaker OPENED for ${providerName} (${state.failureCount} failures)`);
    }
  }

  /**
   * Record a circuit breaker success
   */
  private recordCircuitBreakerSuccess(providerName: string): void {
    const state = this.getCircuitBreakerState(providerName);
    
    if (state.status === 'HALF_OPEN') {
      // Success in half-open state: close the circuit
      state.status = 'CLOSED';
      state.failureCount = 0;
      state.lastFailure = null;
      state.nextRetry = null;
      console.log(`✅ Circuit breaker CLOSED for ${providerName}`);
    } else if (state.status === 'CLOSED') {
      // Gradually reduce failure count on success
      state.failureCount = Math.max(0, state.failureCount - 1);
    }
  }

  // ===== Deduplication & Sorting =====

  /**
   * Deduplicate flight offers from multiple providers
   */
  private deduplicateOffers(offers: FlightOffer[]): FlightOffer[] {
    const seen = new Set<string>();
    const unique: FlightOffer[] = [];

    for (const offer of offers) {
      // Generate unique key based on flight details
      const key = this.generateOfferKey(offer);
      
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(offer);
      }
    }

    return unique;
  }

  /**
   * Generate unique key for flight offer
   */
  private generateOfferKey(offer: FlightOffer): string {
    // Key based on: carrier, flight number, departure time, origin, destination
    const segments = offer.itineraries.flatMap(it => it.segments);
    const firstSegment = segments[0];
    const lastSegment = segments[segments.length - 1];

    if (!firstSegment || !lastSegment) {
      return offer.id; // Fallback to ID if no segments
    }

    return [
      firstSegment.carrierCode,
      firstSegment.flightNumber,
      firstSegment.departure.iataCode,
      lastSegment.arrival.iataCode,
      firstSegment.departure.at,
    ].join('|');
  }

  /**
   * Sort offers by quality (price and other factors)
   */
  private sortOffersByQuality(offers: FlightOffer[]): FlightOffer[] {
    return offers.sort((a, b) => {
      // Primary: Price (lower is better)
      const priceDiff = a.price.total - b.price.total;
      if (Math.abs(priceDiff) > 10) return priceDiff;

      // Secondary: Duration (shorter is better)
      const aDuration = this.getTotalDuration(a);
      const bDuration = this.getTotalDuration(b);
      const durationDiff = aDuration - bDuration;
      if (Math.abs(durationDiff) > 60) return durationDiff;

      // Tertiary: Number of stops (fewer is better)
      const aStops = this.getTotalStops(a);
      const bStops = this.getTotalStops(b);
      return aStops - bStops;
    });
  }

  /**
   * Get total duration in minutes from offer
   */
  private getTotalDuration(offer: FlightOffer): number {
    return offer.itineraries.reduce((total, itinerary) => {
      const match = itinerary.duration.match(/PT(\d+)H(\d+)M/);
      if (match) {
        return total + parseInt(match[1]) * 60 + parseInt(match[2]);
      }
      return total;
    }, 0);
  }

  /**
   * Get total number of stops from offer
   */
  private getTotalStops(offer: FlightOffer): number {
    return offer.itineraries.reduce((total, itinerary) => {
      return total + itinerary.segments.reduce((sum, seg) => sum + seg.numberOfStops, 0);
    }, 0);
  }
}

// Circuit breaker state interface
interface CircuitBreakerState {
  status: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
  failureCount: number;
  lastFailure: Date | null;
  nextRetry: Date | null;
}

// Export singleton instance
export const providerFactory = ProviderFactory.getInstance();
export { ProviderFactory };
