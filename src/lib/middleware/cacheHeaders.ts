/**
 * HTTP Cache Headers Middleware
 * Implements caching strategies for API responses
 */

import { NextResponse } from 'next/server';

export interface CacheConfig {
  maxAge?: number;           // Cache duration in seconds
  sMaxAge?: number;          // CDN cache duration
  staleWhileRevalidate?: number; // Serve stale while revalidating
  staleIfError?: number;     // Serve stale on error
  public?: boolean;          // Public or private cache
  immutable?: boolean;       // Content never changes
  mustRevalidate?: boolean;  // Must revalidate when stale
  noStore?: boolean;         // Don't cache at all
  noCache?: boolean;         // Revalidate before serving
}

/**
 * Predefined cache strategies
 */
export const CacheStrategies = {
  // No caching - always fresh data
  NO_CACHE: {
    noStore: true,
    noCache: true,
  },

  // Short cache - 1 minute (real-time data)
  SHORT: {
    maxAge: 60,
    sMaxAge: 60,
    staleWhileRevalidate: 30,
    public: true,
  },

  // Medium cache - 5 minutes (frequently changing data)
  MEDIUM: {
    maxAge: 300,
    sMaxAge: 300,
    staleWhileRevalidate: 60,
    public: true,
  },

  // Long cache - 1 hour (stable data)
  LONG: {
    maxAge: 3600,
    sMaxAge: 3600,
    staleWhileRevalidate: 600,
    public: true,
  },

  // Very long cache - 24 hours (static data)
  VERY_LONG: {
    maxAge: 86400,
    sMaxAge: 86400,
    staleWhileRevalidate: 3600,
    public: true,
  },

  // Immutable - never changes (versioned assets)
  IMMUTABLE: {
    maxAge: 31536000, // 1 year
    sMaxAge: 31536000,
    immutable: true,
    public: true,
  },

  // Private cache - user-specific data
  PRIVATE_SHORT: {
    maxAge: 60,
    staleWhileRevalidate: 30,
    public: false,
  },

  PRIVATE_MEDIUM: {
    maxAge: 300,
    staleWhileRevalidate: 60,
    public: false,
  },

  // Revalidate - check with server on every request
  REVALIDATE: {
    maxAge: 0,
    mustRevalidate: true,
    public: true,
  },

  // Stale-while-revalidate pattern
  SWR: {
    maxAge: 300,
    staleWhileRevalidate: 86400, // 24 hours
    staleIfError: 604800, // 7 days
    public: true,
  },
} as const;

/**
 * Generate Cache-Control header from config
 */
export function generateCacheControl(config: CacheConfig): string {
  const directives: string[] = [];

  // No caching directives
  if (config.noStore) {
    directives.push('no-store');
  }
  if (config.noCache) {
    directives.push('no-cache');
  }

  // If no-store or no-cache, skip other directives
  if (config.noStore || config.noCache) {
    return directives.join(', ');
  }

  // Public/Private
  if (config.public !== false) {
    directives.push('public');
  } else {
    directives.push('private');
  }

  // Max-age
  if (config.maxAge !== undefined) {
    directives.push(`max-age=${config.maxAge}`);
  }

  // S-maxage (CDN cache)
  if (config.sMaxAge !== undefined) {
    directives.push(`s-maxage=${config.sMaxAge}`);
  }

  // Stale-while-revalidate
  if (config.staleWhileRevalidate !== undefined) {
    directives.push(`stale-while-revalidate=${config.staleWhileRevalidate}`);
  }

  // Stale-if-error
  if (config.staleIfError !== undefined) {
    directives.push(`stale-if-error=${config.staleIfError}`);
  }

  // Immutable
  if (config.immutable) {
    directives.push('immutable');
  }

  // Must-revalidate
  if (config.mustRevalidate) {
    directives.push('must-revalidate');
  }

  return directives.join(', ');
}

/**
 * Add cache headers to NextResponse
 */
export function withCacheHeaders(
  response: NextResponse,
  strategy: keyof typeof CacheStrategies | CacheConfig
): NextResponse {
  const config = typeof strategy === 'string' 
    ? CacheStrategies[strategy] 
    : strategy;

  const cacheControl = generateCacheControl(config);
  response.headers.set('Cache-Control', cacheControl);

  // Add Vary header for content negotiation
  if (!response.headers.has('Vary')) {
    response.headers.set('Vary', 'Accept-Encoding, Accept');
  }

  // Add ETag if not present (for conditional requests)
  if (!response.headers.has('ETag') && config.maxAge && config.maxAge > 0) {
    const etag = generateETag(response);
    if (etag) {
      response.headers.set('ETag', etag);
    }
  }

  return response;
}

/**
 * Generate ETag from response
 */
function generateETag(response: NextResponse): string | null {
  try {
    // Simple hash of response for ETag
    // In production, use a proper hash function
    const timestamp = Date.now();
    return `W/"${timestamp}"`;
  } catch {
    return null;
  }
}

/**
 * Check if request has valid conditional headers
 */
export function checkConditionalRequest(
  request: Request,
  etag?: string,
  lastModified?: Date
): boolean {
  // Check If-None-Match (ETag)
  if (etag) {
    const ifNoneMatch = request.headers.get('If-None-Match');
    if (ifNoneMatch && ifNoneMatch === etag) {
      return true; // 304 Not Modified
    }
  }

  // Check If-Modified-Since
  if (lastModified) {
    const ifModifiedSince = request.headers.get('If-Modified-Since');
    if (ifModifiedSince) {
      const ifModifiedSinceDate = new Date(ifModifiedSince);
      if (lastModified <= ifModifiedSinceDate) {
        return true; // 304 Not Modified
      }
    }
  }

  return false;
}

/**
 * Create 304 Not Modified response
 */
export function createNotModifiedResponse(etag?: string): NextResponse {
  const response = new NextResponse(null, { status: 304 });
  
  if (etag) {
    response.headers.set('ETag', etag);
  }

  return response;
}

/**
 * API route-specific cache strategies
 */
export const APICacheStrategies = {
  // Flight search - medium cache with SWR
  FLIGHT_SEARCH: {
    maxAge: 300, // 5 minutes
    sMaxAge: 300,
    staleWhileRevalidate: 600,
    public: true,
  },

  // Airport data - long cache
  AIRPORTS: {
    maxAge: 3600, // 1 hour
    sMaxAge: 86400, // 24 hours on CDN
    staleWhileRevalidate: 3600,
    public: true,
  },

  // User bookings - no cache (private)
  USER_BOOKINGS: {
    noStore: true,
    public: false,
  },

  // Provider health - short cache
  PROVIDER_HEALTH: {
    maxAge: 60, // 1 minute
    sMaxAge: 60,
    public: true,
  },

  // Static config - very long cache
  CONFIG: {
    maxAge: 86400, // 24 hours
    sMaxAge: 604800, // 7 days on CDN
    staleWhileRevalidate: 86400,
    public: true,
  },

  // Price alerts - medium cache
  PRICE_ALERTS: {
    maxAge: 1800, // 30 minutes
    staleWhileRevalidate: 600,
    public: false,
  },

  // Promo codes - medium cache
  PROMO_CODES: {
    maxAge: 1800, // 30 minutes
    sMaxAge: 1800,
    staleWhileRevalidate: 600,
    public: true,
  },

  // Admin endpoints - no cache
  ADMIN: {
    noStore: true,
    noCache: true,
  },

  // Analytics - short cache
  ANALYTICS: {
    maxAge: 300, // 5 minutes
    public: false,
  },

  // Notifications - no cache
  NOTIFICATIONS: {
    noStore: true,
    public: false,
  },
} as const;

/**
 * Helper to create cached JSON response
 */
export function createCachedResponse(
  data: any,
  strategy: keyof typeof APICacheStrategies | CacheConfig,
  options?: {
    etag?: string;
    lastModified?: Date;
    status?: number;
  }
): NextResponse {
  const response = NextResponse.json(data, { 
    status: options?.status || 200 
  });

  // Apply cache strategy
  const config = typeof strategy === 'string' 
    ? APICacheStrategies[strategy] 
    : strategy;

  withCacheHeaders(response, config);

  // Add ETag if provided
  if (options?.etag) {
    response.headers.set('ETag', options.etag);
  }

  // Add Last-Modified if provided
  if (options?.lastModified) {
    response.headers.set('Last-Modified', options.lastModified.toUTCString());
  }

  return response;
}

/**
 * Middleware to add cache headers based on route
 */
export function routeCacheMiddleware(
  request: Request,
  response: NextResponse
): NextResponse {
  const url = new URL(request.url);
  const pathname = url.pathname;

  // Skip caching for non-GET requests
  if (request.method !== 'GET') {
    return withCacheHeaders(response, CacheStrategies.NO_CACHE);
  }

  // API routes
  if (pathname.startsWith('/api/')) {
    // Flight search
    if (pathname.includes('/flights/search')) {
      return withCacheHeaders(response, APICacheStrategies.FLIGHT_SEARCH);
    }

    // Airports
    if (pathname.includes('/airports')) {
      return withCacheHeaders(response, APICacheStrategies.AIRPORTS);
    }

    // Provider health
    if (pathname.includes('/providers/health')) {
      return withCacheHeaders(response, APICacheStrategies.PROVIDER_HEALTH);
    }

    // Admin routes
    if (pathname.includes('/admin/')) {
      return withCacheHeaders(response, APICacheStrategies.ADMIN);
    }

    // User-specific routes
    if (pathname.includes('/bookings') || pathname.includes('/user')) {
      return withCacheHeaders(response, APICacheStrategies.USER_BOOKINGS);
    }

    // Default API cache
    return withCacheHeaders(response, CacheStrategies.SHORT);
  }

  // Static assets
  if (pathname.startsWith('/_next/static/')) {
    return withCacheHeaders(response, CacheStrategies.IMMUTABLE);
  }

  // Images
  if (pathname.match(/\.(jpg|jpeg|png|gif|svg|webp|ico)$/)) {
    return withCacheHeaders(response, CacheStrategies.VERY_LONG);
  }

  // Fonts
  if (pathname.match(/\.(woff|woff2|ttf|otf|eot)$/)) {
    return withCacheHeaders(response, CacheStrategies.IMMUTABLE);
  }

  // Default - short cache for pages
  return withCacheHeaders(response, CacheStrategies.SHORT);
}

/**
 * Generate cache key for request
 */
export function generateCacheKey(request: Request): string {
  const url = new URL(request.url);
  const searchParams = new URLSearchParams(url.searchParams);
  
  // Sort params for consistent keys
  searchParams.sort();
  
  return `${url.pathname}?${searchParams.toString()}`;
}

/**
 * Check if response is cacheable
 */
export function isCacheable(response: Response): boolean {
  // Only cache successful responses
  if (!response.ok) return false;

  // Check Cache-Control header
  const cacheControl = response.headers.get('Cache-Control');
  if (!cacheControl) return false;

  // Don't cache if no-store or no-cache
  if (cacheControl.includes('no-store') || cacheControl.includes('no-cache')) {
    return false;
  }

  // Must have max-age
  if (!cacheControl.includes('max-age=')) {
    return false;
  }

  return true;
}

export default {
  CacheStrategies,
  APICacheStrategies,
  generateCacheControl,
  withCacheHeaders,
  checkConditionalRequest,
  createNotModifiedResponse,
  createCachedResponse,
  routeCacheMiddleware,
  generateCacheKey,
  isCacheable,
};
