/**
 * Provider Factory
 * Manages multiple flight API providers with automatic fallback and load balancing
 */

import { prisma } from '@/lib/prisma';
import { IFlightProvider, ProviderConfig, FlightSearchParams, FlightOffer, ProviderResult } from './types';
import { AmadeusProvider } from './AmadeusProvider';
import crypto from 'crypto';

// Provider registry
const PROVIDER_CLASSES: Record<string, new () => IFlightProvider> = {
  AMADEUS: AmadeusProvider,
  // Add more providers as they're implemented
  // SKYSCANNER: SkyscannerProvider,
  // KIWI: KiwiProvider,
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
   * Search flights with automatic fallback
   */
  async searchFlights(params: FlightSearchParams): Promise<ProviderResult<FlightOffer[]>> {
    const startTime = Date.now();
    const providers = await this.getOrderedProviders();

    let lastError: Error | null = null;

    for (const provider of providers) {
      try {
        console.log(`🔍 Searching flights with ${provider.name}...`);
        
        const offers = await provider.searchFlights(params);
        
        // Update usage statistics
        await this.updateProviderStats(provider.name, true);

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
}

// Export singleton instance
export const providerFactory = ProviderFactory.getInstance();
export { ProviderFactory };
