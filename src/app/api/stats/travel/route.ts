import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth-prisma';
import { prisma } from '@/lib/prisma';
import TravelStatsService from '@/lib/services/travelStatsService';

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const authResult = verifyAuth(token);
    
    if (!authResult) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Fetch user's bookings
    const bookings = await prisma.booking.findMany({
      where: { userId: authResult.userId },
      orderBy: { bookingDate: 'desc' },
    });

    // Calculate statistics
    const stats = TravelStatsService.calculateStats(bookings);
    const monthlySpending = TravelStatsService.calculateMonthlySpending(bookings);
    const topDestinations = TravelStatsService.getTopDestinations(bookings, 5);
    const growth = TravelStatsService.calculateGrowthMetrics(bookings);

    return NextResponse.json({
      stats,
      monthlySpending,
      topDestinations,
      growth,
    });

  } catch (error) {
    console.error('Travel stats error:', error);
    
    return NextResponse.json(
      { error: 'Failed to fetch travel statistics' },
      { status: 500 }
    );
  }
}
