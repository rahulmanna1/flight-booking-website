/**
 * Query Optimization Utilities
 * Provides optimized Prisma queries and helpers to prevent N+1 problems
 */

import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';

/**
 * Optimized booking queries with proper includes to avoid N+1
 */
export const bookingQueries = {
  /**
   * Get user's bookings with all related data (single query)
   */
  async getUserBookings(userId: string, options?: {
    status?: string;
    limit?: number;
    offset?: number;
  }) {
    return prisma.booking.findMany({
      where: {
        userId,
        ...(options?.status && { status: options.status as any }),
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        promoCode: {
          select: {
            id: true,
            code: true,
            discountType: true,
            discountValue: true,
          },
        },
        refunds: {
          select: {
            id: true,
            refundReference: true,
            status: true,
            requestedAmount: true,
            approvedAmount: true,
            requestedAt: true,
          },
          orderBy: {
            requestedAt: 'desc',
          },
        },
        modifications: {
          select: {
            id: true,
            modificationReference: true,
            modificationType: true,
            status: true,
            requestedAt: true,
          },
          orderBy: {
            requestedAt: 'desc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: options?.limit || 50,
      skip: options?.offset || 0,
    });
  },

  /**
   * Get single booking with all details (optimized)
   */
  async getBookingById(bookingId: string) {
    return prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        user: true,
        promoCode: true,
        refunds: {
          orderBy: { requestedAt: 'desc' },
        },
        modifications: {
          orderBy: { requestedAt: 'desc' },
        },
      },
    });
  },

  /**
   * Get bookings by reference (fast lookup with index)
   */
  async getBookingByReference(bookingReference: string) {
    return prisma.booking.findUnique({
      where: { bookingReference },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
        refunds: true,
        modifications: true,
      },
    });
  },

  /**
   * Get admin dashboard bookings (optimized for admin view)
   */
  async getAdminBookings(filters?: {
    status?: string;
    dateFrom?: Date;
    dateTo?: Date;
    search?: string;
    limit?: number;
    offset?: number;
  }) {
    const where: Prisma.BookingWhereInput = {
      ...(filters?.status && { status: filters.status as any }),
      ...(filters?.dateFrom && {
        createdAt: {
          gte: filters.dateFrom,
          ...(filters?.dateTo && { lte: filters.dateTo }),
        },
      }),
      ...(filters?.search && {
        OR: [
          { bookingReference: { contains: filters.search, mode: 'insensitive' } },
          { confirmationNumber: { contains: filters.search, mode: 'insensitive' } },
          { user: { email: { contains: filters.search, mode: 'insensitive' } } },
        ],
      }),
    };

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          promoCode: {
            select: {
              code: true,
              discountValue: true,
            },
          },
          _count: {
            select: {
              refunds: true,
              modifications: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: filters?.limit || 50,
        skip: filters?.offset || 0,
      }),
      prisma.booking.count({ where }),
    ]);

    return { bookings, total };
  },
};

/**
 * Optimized notification queries
 */
export const notificationQueries = {
  /**
   * Get user's unread notifications (indexed query)
   */
  async getUnreadNotifications(userId: string, limit = 20) {
    return prisma.notification.findMany({
      where: {
        userId,
        readAt: null,
      },
      include: {
        priceAlert: {
          select: {
            id: true,
            origin: true,
            destination: true,
            targetPrice: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  },

  /**
   * Get all user notifications with pagination
   */
  async getUserNotifications(userId: string, options?: {
    limit?: number;
    offset?: number;
    type?: string;
  }) {
    return prisma.notification.findMany({
      where: {
        userId,
        ...(options?.type && { type: options.type as any }),
      },
      include: {
        priceAlert: {
          select: {
            id: true,
            origin: true,
            destination: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: options?.limit || 50,
      skip: options?.offset || 0,
    });
  },

  /**
   * Mark notifications as read (batch update)
   */
  async markAsRead(notificationIds: string[]) {
    return prisma.notification.updateMany({
      where: {
        id: { in: notificationIds },
        readAt: null,
      },
      data: {
        readAt: new Date(),
      },
    });
  },
};

/**
 * Optimized price alert queries
 */
export const priceAlertQueries = {
  /**
   * Get user's active alerts
   */
  async getUserActiveAlerts(userId: string) {
    return prisma.priceAlert.findMany({
      where: {
        userId,
        isActive: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  /**
   * Get alerts that need checking (for background job)
   */
  async getAlertsToCheck(limit = 100) {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    
    return prisma.priceAlert.findMany({
      where: {
        isActive: true,
        OR: [
          { lastChecked: null },
          { lastChecked: { lt: oneHourAgo } },
        ],
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } },
        ],
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            preferences: true,
          },
        },
      },
      take: limit,
      orderBy: { lastChecked: 'asc' },
    });
  },
};

/**
 * Optimized refund queries
 */
export const refundQueries = {
  /**
   * Get pending refunds for admin (indexed query)
   */
  async getPendingRefunds(limit = 50, offset = 0) {
    return prisma.refund.findMany({
      where: {
        status: {
          in: ['PENDING', 'UNDER_REVIEW', 'APPROVED'],
        },
      },
      include: {
        booking: {
          select: {
            id: true,
            bookingReference: true,
            totalAmount: true,
            userId: true,
          },
        },
      },
      orderBy: { requestedAt: 'asc' },
      take: limit,
      skip: offset,
    });
  },

  /**
   * Get user's refund history
   */
  async getUserRefunds(userId: string) {
    return prisma.refund.findMany({
      where: { userId },
      include: {
        booking: {
          select: {
            bookingReference: true,
            confirmationNumber: true,
          },
        },
      },
      orderBy: { requestedAt: 'desc' },
    });
  },
};

/**
 * Optimized airport search queries
 */
export const airportQueries = {
  /**
   * Search airports with trigram similarity (fast autocomplete)
   * Requires pg_trgm extension enabled
   */
  async searchAirports(keyword: string, limit = 10) {
    // Use raw query for trigram search
    return prisma.$queryRaw<Array<{
      id: string;
      iataCode: string;
      name: string;
      city: string;
      country: string;
      countryCode: string;
    }>>`
      SELECT 
        id, 
        "iataCode", 
        name, 
        city, 
        country, 
        "countryCode"
      FROM airports
      WHERE 
        name % ${keyword} 
        OR city % ${keyword}
        OR "iataCode" ILIKE ${`%${keyword}%`}
      ORDER BY 
        similarity(name, ${keyword}) DESC,
        similarity(city, ${keyword}) DESC
      LIMIT ${limit}
    `;
  },

  /**
   * Fallback search without trigram (if extension not available)
   */
  async searchAirportsFallback(keyword: string, limit = 10) {
    return prisma.airport.findMany({
      where: {
        OR: [
          { iataCode: { contains: keyword, mode: 'insensitive' } },
          { name: { contains: keyword, mode: 'insensitive' } },
          { city: { contains: keyword, mode: 'insensitive' } },
          { country: { contains: keyword, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        iataCode: true,
        name: true,
        city: true,
        country: true,
        countryCode: true,
      },
      take: limit,
    });
  },

  /**
   * Get airport by IATA code (indexed lookup)
   */
  async getAirportByCode(iataCode: string) {
    return prisma.airport.findUnique({
      where: { iataCode: iataCode.toUpperCase() },
    });
  },

  /**
   * Get popular airports (cached in Redis in production)
   */
  async getPopularAirports(limit = 20) {
    // This should be cached in Redis
    return prisma.airport.findMany({
      where: {
        iataCode: {
          in: [
            'JFK', 'LAX', 'ORD', 'ATL', 'DFW', 'DEN', 'SFO', 'LAS',
            'LHR', 'CDG', 'FRA', 'AMS', 'DXB', 'HKG', 'SIN', 'NRT',
            'SYD', 'MEL', 'DEL', 'BOM',
          ],
        },
      },
      orderBy: { iataCode: 'asc' },
      take: limit,
    });
  },
};

/**
 * Batch query utilities
 */
export const batchQueries = {
  /**
   * Get multiple bookings by IDs (single query)
   */
  async getBookingsByIds(bookingIds: string[]) {
    return prisma.booking.findMany({
      where: {
        id: { in: bookingIds },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  },

  /**
   * Get multiple users by IDs (single query)
   */
  async getUsersByIds(userIds: string[]) {
    return prisma.user.findMany({
      where: {
        id: { in: userIds },
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        avatar: true,
        role: true,
      },
    });
  },
};

/**
 * Analytics queries (optimized for reporting)
 */
export const analyticsQueries = {
  /**
   * Get booking statistics (efficient aggregation)
   */
  async getBookingStats(dateFrom: Date, dateTo: Date) {
    return prisma.booking.groupBy({
      by: ['status'],
      where: {
        createdAt: {
          gte: dateFrom,
          lte: dateTo,
        },
      },
      _count: true,
      _sum: {
        totalAmount: true,
      },
    });
  },

  /**
   * Get daily booking counts (for charts)
   */
  async getDailyBookings(days = 30) {
    const dateFrom = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    // Use raw query for better performance
    return prisma.$queryRaw<Array<{
      date: string;
      count: number;
      revenue: number;
    }>>`
      SELECT 
        DATE("createdAt") as date,
        COUNT(*)::int as count,
        SUM("totalAmount")::float as revenue
      FROM bookings
      WHERE "createdAt" >= ${dateFrom}
      GROUP BY DATE("createdAt")
      ORDER BY date DESC
    `;
  },

  /**
   * Get top routes (most booked)
   */
  async getTopRoutes(limit = 10, days = 90) {
    const dateFrom = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    // This requires parsing JSON - use raw query
    return prisma.$queryRaw<Array<{
      route: string;
      count: number;
    }>>`
      SELECT 
        "flightData"->>'route' as route,
        COUNT(*)::int as count
      FROM bookings
      WHERE "createdAt" >= ${dateFrom}
      GROUP BY route
      ORDER BY count DESC
      LIMIT ${limit}
    `;
  },
};

/**
 * Database health check utilities
 */
export const dbHealthQueries = {
  /**
   * Check database connection
   */
  async checkConnection() {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      return false;
    }
  },

  /**
   * Get database statistics
   */
  async getDatabaseStats() {
    const stats = await prisma.$queryRaw<Array<{
      table_name: string;
      row_count: number;
      total_size: string;
      index_size: string;
    }>>`
      SELECT 
        schemaname || '.' || tablename as table_name,
        n_live_tup::int as row_count,
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as total_size,
        pg_size_pretty(pg_indexes_size(schemaname||'.'||tablename)) as index_size
      FROM pg_stat_user_tables
      ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
    `;
    
    return stats;
  },

  /**
   * Get slow queries (requires pg_stat_statements extension)
   */
  async getSlowQueries(limit = 10) {
    try {
      return await prisma.$queryRaw<Array<{
        query: string;
        calls: number;
        mean_time: number;
        total_time: number;
      }>>`
        SELECT 
          query,
          calls::int,
          mean_exec_time::float as mean_time,
          total_exec_time::float as total_time
        FROM pg_stat_statements
        WHERE query NOT LIKE '%pg_stat_statements%'
        ORDER BY mean_exec_time DESC
        LIMIT ${limit}
      `;
    } catch (error) {
      console.warn('pg_stat_statements extension not available');
      return [];
    }
  },
};
