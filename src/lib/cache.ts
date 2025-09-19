interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

class SimpleCache {
  private cache: Map<string, CacheItem<any>>;
  private maxSize: number;
  private defaultTTL: number; // Time to live in milliseconds

  constructor(maxSize = 100, defaultTTL = 5 * 60 * 1000) { // Default 5 minutes
    this.cache = new Map();
    this.maxSize = maxSize;
    this.defaultTTL = defaultTTL;
  }

  // Generate a cache key from request parameters
  static generateKey(prefix: string, params: any): string {
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((acc, key) => {
        if (params[key] !== undefined && params[key] !== null) {
          acc[key] = params[key];
        }
        return acc;
      }, {} as any);
    
    return `${prefix}:${JSON.stringify(sortedParams)}`;
  }

  // Set a value in the cache
  set<T>(key: string, data: T, ttl?: number): void {
    // If cache is full, remove oldest item
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    const expiresAt = Date.now() + (ttl || this.defaultTTL);
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiresAt
    });
  }

  // Get a value from the cache
  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    // Check if item has expired
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    // Move to end (LRU behavior)
    this.cache.delete(key);
    this.cache.set(key, item);

    return item.data as T;
  }

  // Check if a key exists and is valid
  has(key: string): boolean {
    const item = this.cache.get(key);
    
    if (!item) {
      return false;
    }

    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  // Clear expired entries
  clearExpired(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  // Clear all entries
  clear(): void {
    this.cache.clear();
  }

  // Get cache statistics
  getStats(): {
    size: number;
    maxSize: number;
    keys: string[];
  } {
    this.clearExpired(); // Clean up before reporting
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Create singleton instances for different cache types
export const flightSearchCache = new SimpleCache(50, 10 * 60 * 1000); // 10 minutes for flight searches
export const airportCache = new SimpleCache(200, 60 * 60 * 1000); // 1 hour for airport data
export const airportSearchCache = new SimpleCache(100, 30 * 60 * 1000); // 30 minutes for airport searches

// Export the cache class for custom instances
export default SimpleCache;