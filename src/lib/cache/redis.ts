/**
 * Redis Client Configuration and Utilities
 * Provides caching layer for improved performance
 */

import { createClient, RedisClientType } from 'redis';

// Redis client instance (singleton)
let redisClient: RedisClientType | null = null;

/**
 * Redis configuration from environment
 */
const REDIS_CONFIG = {
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  password: process.env.REDIS_PASSWORD,
  socket: {
    reconnectStrategy: (retries: number) => {
      if (retries > 10) {
        console.error('❌ Redis: Too many reconnection attempts');
        return new Error('Too many reconnection attempts');
      }
      // Exponential backoff: 100ms, 200ms, 400ms, 800ms, etc.
      return Math.min(retries * 100, 3000);
    },
  },
};

/**
 * TTL (Time To Live) constants in seconds
 */
export const CacheTTL = {
  FLIGHT_SEARCH: 300,        // 5 minutes
  AIRPORT_DATA: 3600,         // 1 hour
  POPULAR_AIRPORTS: 86400,    // 24 hours
  USER_SESSION: 7200,         // 2 hours
  PRICE_ALERT: 1800,          // 30 minutes
  PROVIDER_HEALTH: 300,       // 5 minutes
  BOOKING_DETAILS: 600,       // 10 minutes
  PROMO_CODE: 1800,           // 30 minutes
  SYSTEM_CONFIG: 3600,        // 1 hour
  SHORT: 60,                  // 1 minute
  MEDIUM: 1800,               // 30 minutes
  LONG: 86400,                // 24 hours
} as const;

/**
 * Cache key prefixes for organization
 */
export const CachePrefix = {
  FLIGHT_SEARCH: 'flight:search',
  AIRPORT: 'airport',
  USER: 'user',
  SESSION: 'session',
  BOOKING: 'booking',
  PRICE_ALERT: 'price_alert',
  PROMO_CODE: 'promo',
  PROVIDER: 'provider',
  ANALYTICS: 'analytics',
  RATE_LIMIT: 'rate_limit',
} as const;

/**
 * Initialize Redis client
 */
export async function initRedis(): Promise<RedisClientType> {
  if (redisClient && redisClient.isOpen) {
    return redisClient;
  }

  try {
    redisClient = createClient(REDIS_CONFIG);

    // Event handlers
    redisClient.on('error', (error) => {
      console.error('❌ Redis Client Error:', error);
    });

    redisClient.on('connect', () => {
      console.log('🔗 Redis: Connecting...');
    });

    redisClient.on('ready', () => {
      console.log('✅ Redis: Ready');
    });

    redisClient.on('reconnecting', () => {
      console.log('🔄 Redis: Reconnecting...');
    });

    // Connect to Redis
    await redisClient.connect();

    return redisClient;
  } catch (error) {
    console.error('❌ Failed to initialize Redis:', error);
    throw error;
  }
}

/**
 * Get Redis client (lazy initialization)
 */
export async function getRedisClient(): Promise<RedisClientType | null> {
  // If Redis is disabled in development
  if (process.env.DISABLE_REDIS === 'true') {
    return null;
  }

  try {
    if (!redisClient || !redisClient.isOpen) {
      await initRedis();
    }
    return redisClient;
  } catch (error) {
    console.error('Redis unavailable, continuing without cache:', error);
    return null;
  }
}

/**
 * Close Redis connection
 */
export async function closeRedis(): Promise<void> {
  if (redisClient && redisClient.isOpen) {
    await redisClient.quit();
    console.log('👋 Redis: Connection closed');
  }
}

/**
 * Cache utility class
 */
export class Cache {
  /**
   * Get value from cache
   */
  static async get<T>(key: string): Promise<T | null> {
    const client = await getRedisClient();
    if (!client) return null;

    try {
      const value = await client.get(key);
      if (!value) return null;

      return JSON.parse(value) as T;
    } catch (error) {
      console.error(`Cache get error for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Set value in cache with TTL
   */
  static async set(key: string, value: any, ttl?: number): Promise<boolean> {
    const client = await getRedisClient();
    if (!client) return false;

    try {
      const serialized = JSON.stringify(value);
      
      if (ttl) {
        await client.setEx(key, ttl, serialized);
      } else {
        await client.set(key, serialized);
      }

      return true;
    } catch (error) {
      console.error(`Cache set error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Delete value from cache
   */
  static async del(key: string): Promise<boolean> {
    const client = await getRedisClient();
    if (!client) return false;

    try {
      await client.del(key);
      return true;
    } catch (error) {
      console.error(`Cache delete error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Delete multiple keys matching pattern
   */
  static async delPattern(pattern: string): Promise<number> {
    const client = await getRedisClient();
    if (!client) return 0;

    try {
      const keys = await client.keys(pattern);
      if (keys.length === 0) return 0;

      await client.del(keys);
      return keys.length;
    } catch (error) {
      console.error(`Cache delete pattern error for ${pattern}:`, error);
      return 0;
    }
  }

  /**
   * Check if key exists
   */
  static async exists(key: string): Promise<boolean> {
    const client = await getRedisClient();
    if (!client) return false;

    try {
      const result = await client.exists(key);
      return result === 1;
    } catch (error) {
      console.error(`Cache exists error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Get TTL (time to live) for key
   */
  static async ttl(key: string): Promise<number> {
    const client = await getRedisClient();
    if (!client) return -2;

    try {
      return await client.ttl(key);
    } catch (error) {
      console.error(`Cache TTL error for key ${key}:`, error);
      return -2;
    }
  }

  /**
   * Increment counter (useful for rate limiting)
   */
  static async incr(key: string, ttl?: number): Promise<number> {
    const client = await getRedisClient();
    if (!client) return 0;

    try {
      const value = await client.incr(key);
      
      if (ttl && value === 1) {
        await client.expire(key, ttl);
      }

      return value;
    } catch (error) {
      console.error(`Cache incr error for key ${key}:`, error);
      return 0;
    }
  }

  /**
   * Get multiple values at once
   */
  static async mGet<T>(keys: string[]): Promise<(T | null)[]> {
    const client = await getRedisClient();
    if (!client) return keys.map(() => null);

    try {
      const values = await client.mGet(keys);
      return values.map(value => {
        if (!value) return null;
        try {
          return JSON.parse(value) as T;
        } catch {
          return null;
        }
      });
    } catch (error) {
      console.error('Cache mGet error:', error);
      return keys.map(() => null);
    }
  }

  /**
   * Set multiple values at once
   */
  static async mSet(entries: Record<string, any>): Promise<boolean> {
    const client = await getRedisClient();
    if (!client) return false;

    try {
      const serialized = Object.entries(entries).flatMap(([key, value]) => [
        key,
        JSON.stringify(value),
      ]);

      await client.mSet(serialized);
      return true;
    } catch (error) {
      console.error('Cache mSet error:', error);
      return false;
    }
  }

  /**
   * Clear all cache (dangerous - use with caution)
   */
  static async flushAll(): Promise<boolean> {
    const client = await getRedisClient();
    if (!client) return false;

    try {
      await client.flushAll();
      console.warn('⚠️  Redis: All cache cleared');
      return true;
    } catch (error) {
      console.error('Cache flush error:', error);
      return false;
    }
  }

  /**
   * Get cache statistics
   */
  static async getStats(): Promise<{
    connected: boolean;
    keys: number;
    memory: string | null;
    hits: number;
    misses: number;
  }> {
    const client = await getRedisClient();
    
    if (!client) {
      return {
        connected: false,
        keys: 0,
        memory: null,
        hits: 0,
        misses: 0,
      };
    }

    try {
      const info = await client.info('stats');
      const dbSize = await client.dbSize();
      const memory = await client.info('memory');

      // Parse stats from INFO command
      const hitsMatch = info.match(/keyspace_hits:(\d+)/);
      const missesMatch = info.match(/keyspace_misses:(\d+)/);
      const memoryMatch = memory.match(/used_memory_human:([^\r\n]+)/);

      return {
        connected: true,
        keys: dbSize,
        memory: memoryMatch ? memoryMatch[1] : null,
        hits: hitsMatch ? parseInt(hitsMatch[1]) : 0,
        misses: missesMatch ? parseInt(missesMatch[1]) : 0,
      };
    } catch (error) {
      console.error('Error getting cache stats:', error);
      return {
        connected: true,
        keys: 0,
        memory: null,
        hits: 0,
        misses: 0,
      };
    }
  }
}

/**
 * Cache helper functions with automatic key generation
 */
export const CacheHelpers = {
  /**
   * Generate flight search cache key
   */
  flightSearchKey(params: {
    origin: string;
    destination: string;
    departureDate: string;
    returnDate?: string;
    adults: number;
    children?: number;
    cabinClass?: string;
  }): string {
    const key = `${params.origin}-${params.destination}-${params.departureDate}-${params.returnDate || 'oneway'}-${params.adults}-${params.children || 0}-${params.cabinClass || 'economy'}`;
    return `${CachePrefix.FLIGHT_SEARCH}:${key.toLowerCase()}`;
  },

  /**
   * Generate airport cache key
   */
  airportKey(iataCode: string): string {
    return `${CachePrefix.AIRPORT}:${iataCode.toUpperCase()}`;
  },

  /**
   * Generate airport search cache key
   */
  airportSearchKey(keyword: string): string {
    return `${CachePrefix.AIRPORT}:search:${keyword.toLowerCase()}`;
  },

  /**
   * Generate user cache key
   */
  userKey(userId: string): string {
    return `${CachePrefix.USER}:${userId}`;
  },

  /**
   * Generate booking cache key
   */
  bookingKey(bookingId: string): string {
    return `${CachePrefix.BOOKING}:${bookingId}`;
  },

  /**
   * Generate price alert cache key
   */
  priceAlertKey(alertId: string): string {
    return `${CachePrefix.PRICE_ALERT}:${alertId}`;
  },

  /**
   * Generate provider health cache key
   */
  providerHealthKey(providerName: string): string {
    return `${CachePrefix.PROVIDER}:health:${providerName}`;
  },

  /**
   * Generate promo code cache key
   */
  promoCodeKey(code: string): string {
    return `${CachePrefix.PROMO_CODE}:${code.toUpperCase()}`;
  },

  /**
   * Generate rate limit cache key
   */
  rateLimitKey(identifier: string, window: string): string {
    return `${CachePrefix.RATE_LIMIT}:${identifier}:${window}`;
  },
};

/**
 * Cache decorator for function results
 */
export function cached<T>(
  keyFn: (...args: any[]) => string,
  ttl: number
) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const cacheKey = keyFn(...args);

      // Try to get from cache
      const cached = await Cache.get<T>(cacheKey);
      if (cached !== null) {
        return cached;
      }

      // Execute original method
      const result = await originalMethod.apply(this, args);

      // Store in cache
      await Cache.set(cacheKey, result, ttl);

      return result;
    };

    return descriptor;
  };
}

export default Cache;
