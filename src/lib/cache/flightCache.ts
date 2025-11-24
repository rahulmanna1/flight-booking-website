/**
 * Flight Search Caching Service
 * Caches flight search results to reduce API calls and improve performance
 */

import Cache, { CacheTTL, CacheHelpers } from './redis';
import type { FlightSearchParams, FlightResult } from '@/types/flight';

export interface CachedFlightSearch {
  params: FlightSearchParams;
  results: FlightResult[];
  timestamp: number;
  provider: string;
  totalResults: number;
}

export class FlightCache {
  /**
   * Get cached flight search results
   */
  static async getFlightSearch(
    params: FlightSearchParams
  ): Promise<CachedFlightSearch | null> {
    const key = CacheHelpers.flightSearchKey({
      origin: params.origin,
      destination: params.destination,
      departureDate: params.departureDate,
      returnDate: params.returnDate,
      adults: params.adults,
      children: params.children,
      cabinClass: params.cabinClass,
    });

    const cached = await Cache.get<CachedFlightSearch>(key);
    
    if (cached) {
      console.log(`✅ Cache HIT: Flight search ${params.origin} → ${params.destination}`);
      return cached;
    }

    console.log(`❌ Cache MISS: Flight search ${params.origin} → ${params.destination}`);
    return null;
  }

  /**
   * Cache flight search results
   */
  static async setFlightSearch(
    params: FlightSearchParams,
    results: FlightResult[],
    provider: string
  ): Promise<boolean> {
    const key = CacheHelpers.flightSearchKey({
      origin: params.origin,
      destination: params.destination,
      departureDate: params.departureDate,
      returnDate: params.returnDate,
      adults: params.adults,
      children: params.children,
      cabinClass: params.cabinClass,
    });

    const cacheData: CachedFlightSearch = {
      params,
      results,
      timestamp: Date.now(),
      provider,
      totalResults: results.length,
    };

    const success = await Cache.set(key, cacheData, CacheTTL.FLIGHT_SEARCH);
    
    if (success) {
      console.log(
        `💾 Cached flight search: ${params.origin} → ${params.destination} (${results.length} results, TTL: ${CacheTTL.FLIGHT_SEARCH}s)`
      );
    }

    return success;
  }

  /**
   * Invalidate flight search cache for specific route
   */
  static async invalidateRoute(
    origin: string,
    destination: string
  ): Promise<number> {
    const pattern = `flight:search:${origin.toLowerCase()}-${destination.toLowerCase()}-*`;
    const deleted = await Cache.delPattern(pattern);
    
    if (deleted > 0) {
      console.log(`🗑️  Invalidated ${deleted} cached searches for ${origin} → ${destination}`);
    }

    return deleted;
  }

  /**
   * Invalidate all flight search cache
   */
  static async invalidateAll(): Promise<number> {
    const pattern = 'flight:search:*';
    const deleted = await Cache.delPattern(pattern);
    
    if (deleted > 0) {
      console.log(`🗑️  Invalidated ${deleted} cached flight searches`);
    }

    return deleted;
  }

  /**
   * Get cache statistics for flight searches
   */
  static async getStats(): Promise<{
    totalCachedSearches: number;
    routes: string[];
  }> {
    const client = await Cache.get<any>('_flight_cache_stats');
    
    // This is a placeholder - Redis doesn't have built-in way to count keys by pattern efficiently
    // In production, you'd use Redis SCAN command or maintain a separate counter
    return {
      totalCachedSearches: 0,
      routes: [],
    };
  }
}

/**
 * Airport data caching
 */
export class AirportCache {
  /**
   * Get cached airport data by IATA code
   */
  static async getAirport(iataCode: string): Promise<any | null> {
    const key = CacheHelpers.airportKey(iataCode);
    const cached = await Cache.get<any>(key);
    
    if (cached) {
      console.log(`✅ Cache HIT: Airport ${iataCode}`);
    }

    return cached;
  }

  /**
   * Cache airport data
   */
  static async setAirport(iataCode: string, data: any): Promise<boolean> {
    const key = CacheHelpers.airportKey(iataCode);
    const success = await Cache.set(key, data, CacheTTL.AIRPORT_DATA);
    
    if (success) {
      console.log(`💾 Cached airport: ${iataCode} (TTL: ${CacheTTL.AIRPORT_DATA}s)`);
    }

    return success;
  }

  /**
   * Cache airport search results
   */
  static async getAirportSearch(keyword: string): Promise<any[] | null> {
    const key = CacheHelpers.airportSearchKey(keyword);
    const cached = await Cache.get<any[]>(key);
    
    if (cached) {
      console.log(`✅ Cache HIT: Airport search "${keyword}"`);
    }

    return cached;
  }

  /**
   * Set airport search results cache
   */
  static async setAirportSearch(
    keyword: string,
    results: any[]
  ): Promise<boolean> {
    const key = CacheHelpers.airportSearchKey(keyword);
    const success = await Cache.set(key, results, CacheTTL.AIRPORT_DATA);
    
    if (success) {
      console.log(
        `💾 Cached airport search: "${keyword}" (${results.length} results)`
      );
    }

    return success;
  }

  /**
   * Invalidate airport cache
   */
  static async invalidateAirport(iataCode: string): Promise<boolean> {
    const key = CacheHelpers.airportKey(iataCode);
    return await Cache.del(key);
  }

  /**
   * Invalidate all airport cache
   */
  static async invalidateAll(): Promise<number> {
    const pattern = 'airport:*';
    return await Cache.delPattern(pattern);
  }
}

/**
 * Booking data caching
 */
export class BookingCache {
  /**
   * Get cached booking details
   */
  static async getBooking(bookingId: string): Promise<any | null> {
    const key = CacheHelpers.bookingKey(bookingId);
    return await Cache.get<any>(key);
  }

  /**
   * Cache booking details
   */
  static async setBooking(bookingId: string, data: any): Promise<boolean> {
    const key = CacheHelpers.bookingKey(bookingId);
    return await Cache.set(key, data, CacheTTL.BOOKING_DETAILS);
  }

  /**
   * Invalidate booking cache (e.g., after update)
   */
  static async invalidateBooking(bookingId: string): Promise<boolean> {
    const key = CacheHelpers.bookingKey(bookingId);
    return await Cache.del(key);
  }

  /**
   * Invalidate all bookings for a user
   */
  static async invalidateUserBookings(userId: string): Promise<number> {
    const pattern = `booking:*${userId}*`;
    return await Cache.delPattern(pattern);
  }
}

/**
 * User session caching
 */
export class SessionCache {
  /**
   * Get cached user session
   */
  static async getSession(sessionId: string): Promise<any | null> {
    const key = `session:${sessionId}`;
    return await Cache.get<any>(key);
  }

  /**
   * Cache user session
   */
  static async setSession(
    sessionId: string,
    data: any,
    ttl?: number
  ): Promise<boolean> {
    const key = `session:${sessionId}`;
    return await Cache.set(key, data, ttl || CacheTTL.USER_SESSION);
  }

  /**
   * Invalidate session
   */
  static async invalidateSession(sessionId: string): Promise<boolean> {
    const key = `session:${sessionId}`;
    return await Cache.del(key);
  }

  /**
   * Invalidate all sessions for a user
   */
  static async invalidateUserSessions(userId: string): Promise<number> {
    const pattern = `session:*${userId}*`;
    return await Cache.delPattern(pattern);
  }
}

/**
 * Price alert caching
 */
export class PriceAlertCache {
  /**
   * Get cached price alert
   */
  static async getPriceAlert(alertId: string): Promise<any | null> {
    const key = CacheHelpers.priceAlertKey(alertId);
    return await Cache.get<any>(key);
  }

  /**
   * Cache price alert
   */
  static async setPriceAlert(alertId: string, data: any): Promise<boolean> {
    const key = CacheHelpers.priceAlertKey(alertId);
    return await Cache.set(key, data, CacheTTL.PRICE_ALERT);
  }

  /**
   * Invalidate price alert cache
   */
  static async invalidatePriceAlert(alertId: string): Promise<boolean> {
    const key = CacheHelpers.priceAlertKey(alertId);
    return await Cache.del(key);
  }

  /**
   * Invalidate all price alerts for a user
   */
  static async invalidateUserAlerts(userId: string): Promise<number> {
    const pattern = `price_alert:*${userId}*`;
    return await Cache.delPattern(pattern);
  }
}

/**
 * Promo code caching
 */
export class PromoCodeCache {
  /**
   * Get cached promo code
   */
  static async getPromoCode(code: string): Promise<any | null> {
    const key = CacheHelpers.promoCodeKey(code);
    const cached = await Cache.get<any>(key);
    
    if (cached) {
      console.log(`✅ Cache HIT: Promo code ${code}`);
    }

    return cached;
  }

  /**
   * Cache promo code
   */
  static async setPromoCode(code: string, data: any): Promise<boolean> {
    const key = CacheHelpers.promoCodeKey(code);
    const success = await Cache.set(key, data, CacheTTL.PROMO_CODE);
    
    if (success) {
      console.log(`💾 Cached promo code: ${code}`);
    }

    return success;
  }

  /**
   * Invalidate promo code cache
   */
  static async invalidatePromoCode(code: string): Promise<boolean> {
    const key = CacheHelpers.promoCodeKey(code);
    return await Cache.del(key);
  }

  /**
   * Invalidate all promo codes
   */
  static async invalidateAll(): Promise<number> {
    const pattern = 'promo:*';
    return await Cache.delPattern(pattern);
  }
}

/**
 * Provider health caching
 */
export class ProviderHealthCache {
  /**
   * Get cached provider health status
   */
  static async getProviderHealth(providerName: string): Promise<any | null> {
    const key = CacheHelpers.providerHealthKey(providerName);
    return await Cache.get<any>(key);
  }

  /**
   * Cache provider health status
   */
  static async setProviderHealth(
    providerName: string,
    healthData: any
  ): Promise<boolean> {
    const key = CacheHelpers.providerHealthKey(providerName);
    return await Cache.set(key, healthData, CacheTTL.PROVIDER_HEALTH);
  }

  /**
   * Invalidate provider health cache
   */
  static async invalidateProviderHealth(providerName: string): Promise<boolean> {
    const key = CacheHelpers.providerHealthKey(providerName);
    return await Cache.del(key);
  }

  /**
   * Invalidate all provider health data
   */
  static async invalidateAll(): Promise<number> {
    const pattern = 'provider:health:*';
    return await Cache.delPattern(pattern);
  }
}

/**
 * Generic cache warming utilities
 */
export class CacheWarmer {
  /**
   * Warm up popular routes cache
   */
  static async warmPopularRoutes(routes: Array<{
    origin: string;
    destination: string;
  }>): Promise<number> {
    let warmed = 0;

    // This would typically fetch and cache popular route data
    // For now, it's a placeholder for implementation
    
    console.log(`🔥 Cache warming: ${routes.length} popular routes`);
    return warmed;
  }

  /**
   * Warm up airport data cache
   */
  static async warmAirports(airports: string[]): Promise<number> {
    let warmed = 0;

    // This would typically fetch and cache airport data
    // For now, it's a placeholder for implementation
    
    console.log(`🔥 Cache warming: ${airports.length} airports`);
    return warmed;
  }
}

export default {
  FlightCache,
  AirportCache,
  BookingCache,
  SessionCache,
  PriceAlertCache,
  PromoCodeCache,
  ProviderHealthCache,
  CacheWarmer,
};
