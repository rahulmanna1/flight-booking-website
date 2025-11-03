/**
 * Admin API Routes - Analytics & Reporting
 * Endpoints for business metrics and insights
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/middleware/adminAuth';
import { prisma } from '@/lib/prisma';

// GET - Get analytics data
export async function GET(request: NextRequest) {
  return requireAdmin(request, async (req, admin) => {
    try {
      const { searchParams } = new URL(req.url);
      const type = searchParams.get('type') || 'overview';
      const startDate = searchParams.get('startDate');
      const endDate = searchParams.get('endDate');

      const where: any = {};
      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt.gte = new Date(startDate);
        if (endDate) where.createdAt.lte = new Date(endDate);
      }

      switch (type) {
        case 'overview':
          return await getOverviewMetrics(where);
        case 'revenue':
          return await getRevenueMetrics(where);
        case 'popular-routes':
          return await getPopularRoutes(where);
        case 'conversion':
          return await getConversionMetrics(where);
        case 'users':
          return await getUserMetrics(where);
        default:
          return NextResponse.json(
            { success: false, error: 'Invalid analytics type' },
            { status: 400 }
          );
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch analytics' },
        { status: 500 }
      );
    }
  });
}

// Overview metrics
async function getOverviewMetrics(where: any) {
  const [
    totalBookings,
    totalUsers,
    totalRevenue,
    confirmedBookings,
    cancelledBookings,
    recentBookings,
  ] = await Promise.all([
    prisma.booking.count({ where }),
    prisma.user.count(),
    prisma.booking.aggregate({
      where: { ...where, status: { in: ['CONFIRMED', 'COMPLETED'] } },
      _sum: { totalAmount: true },
    }),
    prisma.booking.count({ where: { ...where, status: 'CONFIRMED' } }),
    prisma.booking.count({ where: { ...where, status: 'CANCELLED' } }),
    prisma.booking.findMany({
      where,
      include: {
        user: {
          select: { email: true, firstName: true, lastName: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
  ]);

  return NextResponse.json({
    success: true,
    data: {
      totalBookings,
      totalUsers,
      totalRevenue: totalRevenue._sum.totalAmount || 0,
      confirmedBookings,
      cancelledBookings,
      cancellationRate: totalBookings > 0 ? (cancelledBookings / totalBookings) * 100 : 0,
      recentBookings: recentBookings.map(b => ({
        ...b,
        flightData: JSON.parse(b.flightData),
        passengers: JSON.parse(b.passengers),
      })),
    },
  });
}

// Revenue metrics
async function getRevenueMetrics(where: any) {
  // Get daily revenue for the period
  const bookings = await prisma.booking.findMany({
    where: { ...where, status: { in: ['CONFIRMED', 'COMPLETED'] } },
    select: {
      createdAt: true,
      totalAmount: true,
    },
    orderBy: { createdAt: 'asc' },
  });

  // Group by date
  const revenueByDate: Record<string, { date: string; revenue: number; count: number }> = {};
  
  bookings.forEach(booking => {
    const date = booking.createdAt.toISOString().split('T')[0];
    if (!revenueByDate[date]) {
      revenueByDate[date] = { date, revenue: 0, count: 0 };
    }
    revenueByDate[date].revenue += booking.totalAmount || 0;
    revenueByDate[date].count += 1;
  });

  const dailyRevenue = Object.values(revenueByDate);

  // Calculate totals
  const totalRevenue = dailyRevenue.reduce((sum, day) => sum + day.revenue, 0);
  const totalBookings = dailyRevenue.reduce((sum, day) => sum + day.count, 0);
  const averageBookingValue = totalBookings > 0 ? totalRevenue / totalBookings : 0;

  // Get revenue by status
  const revenueByStatus = await prisma.booking.groupBy({
    by: ['status'],
    where,
    _sum: { totalAmount: true },
    _count: true,
  });

  return NextResponse.json({
    success: true,
    data: {
      totalRevenue,
      totalBookings,
      averageBookingValue,
      dailyRevenue,
      revenueByStatus: revenueByStatus.map(s => ({
        status: s.status,
        revenue: s._sum.totalAmount || 0,
        count: s._count,
      })),
    },
  });
}

// Popular routes
async function getPopularRoutes(where: any) {
  const bookings = await prisma.booking.findMany({
    where: { ...where, status: { in: ['CONFIRMED', 'COMPLETED'] } },
    select: {
      flightData: true,
      totalAmount: true,
    },
  });

  // Parse flight data and count routes
  const routeStats: Record<string, { origin: string; destination: string; count: number; revenue: number }> = {};

  bookings.forEach(booking => {
    try {
      const flightData = JSON.parse(booking.flightData);
      const route = `${flightData.departure}-${flightData.arrival}`;
      
      if (!routeStats[route]) {
        routeStats[route] = {
          origin: flightData.departure,
          destination: flightData.arrival,
          count: 0,
          revenue: 0,
        };
      }
      
      routeStats[route].count += 1;
      routeStats[route].revenue += booking.totalAmount || 0;
    } catch (error) {
      console.error('Error parsing flight data:', error);
    }
  });

  // Sort by popularity
  const popularRoutes = Object.values(routeStats)
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);

  return NextResponse.json({
    success: true,
    data: {
      popularRoutes,
      totalRoutes: Object.keys(routeStats).length,
    },
  });
}

// Conversion metrics
async function getConversionMetrics(where: any) {
  const [
    totalBookings,
    completedBookings,
    cancelledBookings,
    paymentFailedBookings,
  ] = await Promise.all([
    prisma.booking.count({ where }),
    prisma.booking.count({ where: { ...where, status: 'COMPLETED' } }),
    prisma.booking.count({ where: { ...where, status: 'CANCELLED' } }),
    prisma.booking.count({ where: { ...where, status: 'PAYMENT_FAILED' } }),
  ]);

  const completionRate = totalBookings > 0 ? (completedBookings / totalBookings) * 100 : 0;
  const cancellationRate = totalBookings > 0 ? (cancelledBookings / totalBookings) * 100 : 0;
  const paymentFailureRate = totalBookings > 0 ? (paymentFailedBookings / totalBookings) * 100 : 0;

  return NextResponse.json({
    success: true,
    data: {
      totalBookings,
      completedBookings,
      cancelledBookings,
      paymentFailedBookings,
      completionRate,
      cancellationRate,
      paymentFailureRate,
    },
  });
}

// User metrics
async function getUserMetrics(where: any) {
  const totalUsers = await prisma.user.count();
  const usersWithBookings = await prisma.user.count({
    where: {
      bookings: {
        some: {},
      },
    },
  });

  // Get user registration trend
  const recentUsers = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
    select: { createdAt: true },
  });

  // Group by date
  const usersByDate: Record<string, number> = {};
  recentUsers.forEach(user => {
    const date = user.createdAt.toISOString().split('T')[0];
    usersByDate[date] = (usersByDate[date] || 0) + 1;
  });

  const registrationTrend = Object.entries(usersByDate)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return NextResponse.json({
    success: true,
    data: {
      totalUsers,
      usersWithBookings,
      conversionRate: totalUsers > 0 ? (usersWithBookings / totalUsers) * 100 : 0,
      registrationTrend,
    },
  });
}
