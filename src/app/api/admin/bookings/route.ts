/**
 * Admin API Routes - Booking Management
 * Endpoints for viewing and managing all bookings
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, logAdminAction } from '@/lib/middleware/adminAuth';
import { prisma } from '@/lib/prisma';

// GET - Get all bookings with filters
export async function GET(request: NextRequest) {
  return requireAdmin(request, async (req, admin) => {
    try {
      const { searchParams } = new URL(req.url);
      
      // Parse query parameters
      const page = parseInt(searchParams.get('page') || '1');
      const limit = parseInt(searchParams.get('limit') || '50');
      const status = searchParams.get('status');
      const search = searchParams.get('search'); // Search by booking ref or user email
      const startDate = searchParams.get('startDate');
      const endDate = searchParams.get('endDate');
      const sortBy = searchParams.get('sortBy') || 'createdAt';
      const sortOrder = searchParams.get('sortOrder') || 'desc';

      // Build where clause
      const where: any = {};
      
      if (status) {
        where.status = status;
      }
      
      if (search) {
        where.OR = [
          { bookingReference: { contains: search, mode: 'insensitive' } },
          { confirmationNumber: { contains: search, mode: 'insensitive' } },
          { user: { email: { contains: search, mode: 'insensitive' } } },
        ];
      }
      
      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt.gte = new Date(startDate);
        if (endDate) where.createdAt.lte = new Date(endDate);
      }

      // Get total count
      const total = await prisma.booking.count({ where });

      // Get bookings
      const bookings = await prisma.booking.findMany({
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
              discountType: true,
              discountValue: true,
            },
          },
        },
        orderBy: {
          [sortBy]: sortOrder,
        },
        skip: (page - 1) * limit,
        take: limit,
      });

      // Parse JSON fields
      const formattedBookings = bookings.map(booking => ({
        ...booking,
        flightData: JSON.parse(booking.flightData),
        passengers: JSON.parse(booking.passengers),
        seatSelections: booking.seatSelections ? JSON.parse(booking.seatSelections) : [],
        mealPreferences: booking.mealPreferences ? JSON.parse(booking.mealPreferences) : [],
        baggageInfo: booking.baggageInfo ? JSON.parse(booking.baggageInfo) : null,
        insuranceInfo: booking.insuranceInfo ? JSON.parse(booking.insuranceInfo) : null,
        pricing: JSON.parse(booking.pricing),
        contactInfo: JSON.parse(booking.contactInfo),
        // Don't expose payment info to client
        paymentInfo: { method: 'encrypted', lastFour: '****' },
      }));

      return NextResponse.json({
        success: true,
        bookings: formattedBookings,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error('Error fetching bookings:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch bookings' },
        { status: 500 }
      );
    }
  });
}

// PUT - Update booking status
export async function PUT(request: NextRequest) {
  return requireAdmin(request, async (req, admin) => {
    try {
      const body = await req.json();
      const { bookingId, status, notes } = body;

      if (!bookingId || !status) {
        return NextResponse.json(
          { success: false, error: 'Booking ID and status are required' },
          { status: 400 }
        );
      }

      // Validate status
      const validStatuses = ['CONFIRMED', 'PENDING', 'PAYMENT_FAILED', 'CANCELLED', 'COMPLETED', 'REFUNDED'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { success: false, error: 'Invalid status' },
          { status: 400 }
        );
      }

      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: { user: true },
      });

      if (!booking) {
        return NextResponse.json(
          { success: false, error: 'Booking not found' },
          { status: 404 }
        );
      }

      // Update booking
      const updatedBooking = await prisma.booking.update({
        where: { id: bookingId },
        data: { status },
      });

      // Log admin action
      await logAdminAction(
        admin,
        'UPDATE_BOOKING_STATUS',
        'BOOKING_UPDATE',
        {
          bookingId,
          bookingReference: booking.bookingReference,
          oldStatus: booking.status,
          newStatus: status,
          notes,
          userEmail: booking.user.email,
        },
        req
      );

      // TODO: Send email notification to user about status change

      return NextResponse.json({
        success: true,
        booking: updatedBooking,
        message: 'Booking status updated successfully',
      });
    } catch (error) {
      console.error('Error updating booking:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to update booking' },
        { status: 500 }
      );
    }
  });
}
