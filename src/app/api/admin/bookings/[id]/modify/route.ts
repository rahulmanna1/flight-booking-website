import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAuth, logAdminAction } from '@/lib/middleware/adminAuth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// POST create modification request
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await verifyAdminAuth(request);
    if (!authResult.valid) {
      return NextResponse.json({ error: authResult.error }, { status: 403 });
    }

    const { id: bookingId } = await context.params;
    const body = await request.json();

    // Get current booking
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Check if booking can be modified
    if (booking.status === 'CANCELLED' || booking.status === 'REFUNDED') {
      return NextResponse.json(
        { error: 'Cannot modify cancelled or refunded bookings' },
        { status: 400 }
      );
    }

    const {
      modificationType,
      modifiedData,
      changeFee,
      priceDifference,
      reason,
      applyImmediately,
    } = body;

    if (!modificationType || !modifiedData) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate modification reference
    const modificationReference = `MOD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Calculate total charge
    const totalCharge = (changeFee || 0) + (priceDifference || 0);

    // Prepare original data based on modification type
    let originalData: any = {};
    
    switch (modificationType) {
      case 'PASSENGER_UPDATE':
        originalData = { passengers: booking.passengers };
        break;
      case 'SEAT_CHANGE':
        originalData = { seatSelections: booking.seatSelections };
        break;
      case 'MEAL_CHANGE':
        originalData = { mealPreferences: booking.mealPreferences };
        break;
      case 'BAGGAGE_CHANGE':
        originalData = { baggageInfo: booking.baggageInfo };
        break;
      case 'CONTACT_UPDATE':
        originalData = { contactInfo: booking.contactInfo };
        break;
      case 'FLIGHT_CHANGE':
        originalData = { flightData: booking.flightData };
        break;
      default:
        originalData = {};
    }

    // If applying immediately, update booking directly
    if (applyImmediately) {
      const updateData: any = {};
      
      switch (modificationType) {
        case 'PASSENGER_UPDATE':
          updateData.passengers = JSON.stringify(modifiedData.passengers || modifiedData);
          break;
        case 'SEAT_CHANGE':
          updateData.seatSelections = JSON.stringify(modifiedData.seatSelections || modifiedData);
          break;
        case 'MEAL_CHANGE':
          updateData.mealPreferences = JSON.stringify(modifiedData.mealPreferences || modifiedData);
          break;
        case 'BAGGAGE_CHANGE':
          updateData.baggageInfo = JSON.stringify(modifiedData.baggageInfo || modifiedData);
          break;
        case 'CONTACT_UPDATE':
          updateData.contactInfo = JSON.stringify(modifiedData.contactInfo || modifiedData);
          break;
        case 'FLIGHT_CHANGE':
          updateData.flightData = JSON.stringify(modifiedData.flightData || modifiedData);
          break;
      }

      // Update total amount if there's a price difference
      if (priceDifference) {
        updateData.totalAmount = (booking.totalAmount || 0) + totalCharge;
      }

      // Update booking
      await prisma.booking.update({
        where: { id: bookingId },
        data: updateData,
      });

      // Create modification record with COMPLETED status
      const modification = await prisma.bookingModification.create({
        data: {
          modificationReference,
          bookingId,
          modificationType,
          status: 'COMPLETED',
          originalData: JSON.stringify(originalData),
          modifiedData: JSON.stringify(modifiedData),
          changeFee: changeFee || 0,
          priceDifference: priceDifference || 0,
          totalCharge,
          requestedBy: authResult.user?.userId || '',
          processedBy: authResult.user?.userId,
          reason,
          adminNotes: `Applied immediately by ${authResult.user?.email}`,
          processedAt: new Date(),
          completedAt: new Date(),
        },
      });

      // Log action
      await logAdminAction({
        userId: authResult.user?.userId || '',
        action: 'Booking modified immediately',
        category: 'BOOKING_UPDATE',
        details: {
          bookingId,
          bookingReference: booking.bookingReference,
          modificationType,
          modificationReference,
          totalCharge,
        },
        ipAddress: request.headers.get('x-forwarded-for') || '',
        userAgent: request.headers.get('user-agent') || '',
      });

      return NextResponse.json({
        success: true,
        message: 'Booking modified successfully',
        modification,
      });
    } else {
      // Create pending modification for approval
      const modification = await prisma.bookingModification.create({
        data: {
          modificationReference,
          bookingId,
          modificationType,
          status: 'PENDING',
          originalData: JSON.stringify(originalData),
          modifiedData: JSON.stringify(modifiedData),
          changeFee: changeFee || 0,
          priceDifference: priceDifference || 0,
          totalCharge,
          requestedBy: authResult.user?.userId || '',
          reason,
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Modification request created',
        modification,
      });
    }
  } catch (error) {
    console.error('❌ Failed to create modification:', error);
    return NextResponse.json(
      { error: 'Failed to create modification' },
      { status: 500 }
    );
  }
}

// PUT apply pending modification
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await verifyAdminAuth(request);
    if (!authResult.valid) {
      return NextResponse.json({ error: authResult.error }, { status: 403 });
    }

    const { id: bookingId } = await context.params;
    const body = await request.json();
    const { modificationId, action, adminNotes } = body;

    if (!modificationId || !action) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get modification
    const modification = await prisma.bookingModification.findUnique({
      where: { id: modificationId },
      include: { booking: true },
    });

    if (!modification || modification.bookingId !== bookingId) {
      return NextResponse.json(
        { error: 'Modification not found' },
        { status: 404 }
      );
    }

    if (modification.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Modification already processed' },
        { status: 400 }
      );
    }

    if (action === 'APPROVE') {
      const modifiedData = JSON.parse(modification.modifiedData);
      const updateData: any = {};

      // Apply changes based on type
      switch (modification.modificationType) {
        case 'PASSENGER_UPDATE':
          updateData.passengers = JSON.stringify(modifiedData.passengers || modifiedData);
          break;
        case 'SEAT_CHANGE':
          updateData.seatSelections = JSON.stringify(modifiedData.seatSelections || modifiedData);
          break;
        case 'MEAL_CHANGE':
          updateData.mealPreferences = JSON.stringify(modifiedData.mealPreferences || modifiedData);
          break;
        case 'BAGGAGE_CHANGE':
          updateData.baggageInfo = JSON.stringify(modifiedData.baggageInfo || modifiedData);
          break;
        case 'CONTACT_UPDATE':
          updateData.contactInfo = JSON.stringify(modifiedData.contactInfo || modifiedData);
          break;
        case 'FLIGHT_CHANGE':
          updateData.flightData = JSON.stringify(modifiedData.flightData || modifiedData);
          break;
      }

      // Update total amount
      if (modification.totalCharge) {
        updateData.totalAmount = (modification.booking.totalAmount || 0) + modification.totalCharge;
      }

      // Update booking
      await prisma.booking.update({
        where: { id: bookingId },
        data: updateData,
      });

      // Update modification status
      await prisma.bookingModification.update({
        where: { id: modificationId },
        data: {
          status: 'COMPLETED',
          processedBy: authResult.user?.userId,
          processedAt: new Date(),
          completedAt: new Date(),
          adminNotes,
        },
      });

      // Log action
      await logAdminAction({
        userId: authResult.user?.userId || '',
        action: 'Modification approved',
        category: 'BOOKING_UPDATE',
        details: {
          bookingId,
          bookingReference: modification.booking.bookingReference,
          modificationType: modification.modificationType,
          modificationReference: modification.modificationReference,
        },
        ipAddress: request.headers.get('x-forwarded-for') || '',
        userAgent: request.headers.get('user-agent') || '',
      });

      return NextResponse.json({
        success: true,
        message: 'Modification approved and applied',
      });
    } else if (action === 'REJECT') {
      await prisma.bookingModification.update({
        where: { id: modificationId },
        data: {
          status: 'REJECTED',
          processedBy: authResult.user?.userId,
          processedAt: new Date(),
          adminNotes,
        },
      });

      // Log action
      await logAdminAction({
        userId: authResult.user?.userId || '',
        action: 'Modification rejected',
        category: 'BOOKING_UPDATE',
        details: {
          bookingId,
          bookingReference: modification.booking.bookingReference,
          modificationReference: modification.modificationReference,
        },
        ipAddress: request.headers.get('x-forwarded-for') || '',
        userAgent: request.headers.get('user-agent') || '',
      });

      return NextResponse.json({
        success: true,
        message: 'Modification rejected',
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('❌ Failed to process modification:', error);
    return NextResponse.json(
      { error: 'Failed to process modification' },
      { status: 500 }
    );
  }
}
