/**
 * Cache Management API
 * Admin endpoints for monitoring and managing Redis cache
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Cache from '@/lib/cache/redis';
import {
  FlightCache,
  AirportCache,
  BookingCache,
  SessionCache,
  PriceAlertCache,
  PromoCodeCache,
  ProviderHealthCache,
} from '@/lib/cache/flightCache';

/**
 * GET /api/admin/cache - Get cache statistics
 */
export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    // Get cache statistics
    if (action === 'stats' || !action) {
      const stats = await Cache.getStats();

      return NextResponse.json({
        success: true,
        stats: {
          ...stats,
          hitRate: stats.hits + stats.misses > 0 
            ? ((stats.hits / (stats.hits + stats.misses)) * 100).toFixed(2) + '%'
            : '0%',
        },
        timestamp: new Date().toISOString(),
      });
    }

    // Check if specific key exists
    if (action === 'exists') {
      const key = searchParams.get('key');
      
      if (!key) {
        return NextResponse.json(
          { success: false, error: 'Key parameter required' },
          { status: 400 }
        );
      }

      const exists = await Cache.exists(key);
      const ttl = exists ? await Cache.ttl(key) : -2;

      return NextResponse.json({
        success: true,
        key,
        exists,
        ttl,
        expiresIn: ttl > 0 ? `${ttl}s` : ttl === -1 ? 'never' : 'expired',
      });
    }

    // Get value by key
    if (action === 'get') {
      const key = searchParams.get('key');
      
      if (!key) {
        return NextResponse.json(
          { success: false, error: 'Key parameter required' },
          { status: 400 }
        );
      }

      const value = await Cache.get(key);
      const ttl = value ? await Cache.ttl(key) : -2;

      return NextResponse.json({
        success: true,
        key,
        value,
        ttl,
        found: value !== null,
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action parameter' },
      { status: 400 }
    );

  } catch (error: any) {
    console.error('Cache management error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Cache operation failed',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/cache - Cache management operations
 */
export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { action, key, value, ttl, pattern, category } = body;

    // Set cache value
    if (action === 'set') {
      if (!key || value === undefined) {
        return NextResponse.json(
          { success: false, error: 'Key and value required' },
          { status: 400 }
        );
      }

      const success = await Cache.set(key, value, ttl);

      return NextResponse.json({
        success,
        message: success ? 'Cache entry created' : 'Failed to set cache',
        key,
        ttl: ttl || 'none',
      });
    }

    // Delete cache entry
    if (action === 'delete') {
      if (!key) {
        return NextResponse.json(
          { success: false, error: 'Key required' },
          { status: 400 }
        );
      }

      const success = await Cache.del(key);

      return NextResponse.json({
        success,
        message: success ? 'Cache entry deleted' : 'Failed to delete cache',
        key,
      });
    }

    // Delete by pattern
    if (action === 'deletePattern') {
      if (!pattern) {
        return NextResponse.json(
          { success: false, error: 'Pattern required' },
          { status: 400 }
        );
      }

      const deleted = await Cache.delPattern(pattern);

      return NextResponse.json({
        success: true,
        message: `Deleted ${deleted} cache entries`,
        pattern,
        deleted,
      });
    }

    // Invalidate by category
    if (action === 'invalidate') {
      if (!category) {
        return NextResponse.json(
          { success: false, error: 'Category required' },
          { status: 400 }
        );
      }

      let deleted = 0;

      switch (category) {
        case 'flights':
          deleted = await FlightCache.invalidateAll();
          break;
        case 'airports':
          deleted = await AirportCache.invalidateAll();
          break;
        case 'promoCodes':
          deleted = await PromoCodeCache.invalidateAll();
          break;
        case 'providerHealth':
          deleted = await ProviderHealthCache.invalidateAll();
          break;
        case 'all':
          await Cache.flushAll();
          deleted = -1; // Special value indicating all cache cleared
          break;
        default:
          return NextResponse.json(
            { success: false, error: 'Invalid category' },
            { status: 400 }
          );
      }

      return NextResponse.json({
        success: true,
        message: deleted === -1 
          ? 'All cache cleared'
          : `Invalidated ${deleted} ${category} cache entries`,
        category,
        deleted: deleted === -1 ? 'all' : deleted,
      });
    }

    // Increment counter
    if (action === 'increment') {
      if (!key) {
        return NextResponse.json(
          { success: false, error: 'Key required' },
          { status: 400 }
        );
      }

      const newValue = await Cache.incr(key, ttl);

      return NextResponse.json({
        success: true,
        key,
        value: newValue,
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    );

  } catch (error: any) {
    console.error('Cache management error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Cache operation failed',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/cache - Clear all cache (dangerous operation)
 */
export async function DELETE(request: NextRequest) {
  try {
    // Check admin authentication
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    // Require confirmation
    const { searchParams } = new URL(request.url);
    const confirm = searchParams.get('confirm');

    if (confirm !== 'true') {
      return NextResponse.json(
        {
          success: false,
          error: 'Confirmation required - add ?confirm=true to the request',
        },
        { status: 400 }
      );
    }

    const success = await Cache.flushAll();

    return NextResponse.json({
      success,
      message: success 
        ? '⚠️  All cache cleared successfully' 
        : 'Failed to clear cache',
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error('Cache flush error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Cache flush failed',
      },
      { status: 500 }
    );
  }
}
