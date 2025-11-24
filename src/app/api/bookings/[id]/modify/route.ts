import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, ModificationType, ModificationStatus } from '@prisma/client';
import { verifyAuth } from '@/lib/auth-prisma';
import { createAuditLog } from '@/lib/services/auditService';

const prisma = new PrismaClient();

// POST - Request booking modification
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const bookingId = (await params).id;

    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const authResult = verifyAuth(token);

    if (!authResult) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const userId = authResult.userId;
    const body = await request.json();
    const { modificationType, modifiedData, reason } = body;

    // Validate modification type
    const validTypes: ModificationType[] = [
      'FLIGHT_CHANGE',
      'PASSENGER_UPDATE',
      'SEAT_CHANGE',
      'MEAL_CHANGE',
      'BAGGAGE_CHANGE',
      'CONTACT_UPDATE',
      'CANCELLATION',
    ];

    if (!modificationType || !validTypes.includes(modificationType)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid modification type. Valid options: ' + validTypes.join(', '),
        },
        { status: 400 }
      );
    }

    // Get existing booking
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
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

    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Verify ownership
    if (booking.userId !== userId) {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      );
    }

    // Check if booking can be modified
    if (['CANCELLED', 'REFUNDED', 'COMPLETED'].includes(booking.status)) {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot modify booking with status: ${booking.status}`,
        },
        { status: 400 }
      );
    }

    // Calculate fees and price difference
    const { changeFee, priceDifference, totalCharge } = calculateModificationCost(
      modificationType,
      booking,
      modifiedData
    );

    // Generate modification reference
    const modificationReference = `MOD-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

    // Store original data
    const originalData = {
      flightData: JSON.parse(booking.flightData),
      passengers: JSON.parse(booking.passengers),
      seatSelections: booking.seatSelections ? JSON.parse(booking.seatSelections) : [],
      mealPreferences: booking.mealPreferences ? JSON.parse(booking.mealPreferences) : [],
      baggageInfo: booking.baggageInfo ? JSON.parse(booking.baggageInfo) : {},
      contactInfo: JSON.parse(booking.contactInfo),
    };

    // Create modification request
    const modification = await prisma.bookingModification.create({
      data: {
        modificationReference,
        bookingId,
        modificationType,
        status: 'PENDING',
        originalData: JSON.stringify(originalData),
        modifiedData: JSON.stringify(modifiedData),
        changeFee,
        priceDifference,
        totalCharge,
        requestedBy: userId,
        reason: reason || null,
      },
    });

    // Create audit log
    await createAuditLog({
      action: `Booking modification requested: ${modificationType}`,
      category: 'BOOKING_UPDATE',
      severity: 'INFO',
      userId,
      userEmail: booking.user.email,
      userRole: 'USER',
      details: {
        bookingId,
        modificationId: modification.id,
        modificationType,
        totalCharge,
      },
    });

    // Send notification to admins (if modification requires approval)
    if (requiresApproval(modificationType, totalCharge)) {
      await createAdminNotification(modification, booking);
    }

    return NextResponse.json({
      success: true,
      data: {
        modification: {
          id: modification.id,
          reference: modification.modificationReference,
          type: modification.modificationType,
          status: modification.status,
          changeFee: modification.changeFee,
          priceDifference: modification.priceDifference,
          totalCharge: modification.totalCharge,
          requestedAt: modification.requestedAt,
        },
        requiresApproval: requiresApproval(modificationType, totalCharge),
        requiresPayment: totalCharge > 0,
      },
      message: 'Modification request submitted successfully',
    });
  } catch (error: any) {
    console.error('Booking modification error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to process modification request',
      },
      { status: 500 }
    );
  }
}

// GET - Get modification requests for a booking
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const bookingId = (await params).id;

    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const authResult = verifyAuth(token);

    if (!authResult) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const userId = authResult.userId;

    // Verify booking ownership
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      );
    }

    if (booking.userId !== userId) {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      );
    }

    // Get all modifications for this booking
    const modifications = await prisma.bookingModification.findMany({
      where: { bookingId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: modifications.map((mod) => ({
        id: mod.id,
        reference: mod.modificationReference,
        type: mod.modificationType,
        status: mod.status,
        changeFee: mod.changeFee,
        priceDifference: mod.priceDifference,
        totalCharge: mod.totalCharge,
        reason: mod.reason,
        adminNotes: mod.adminNotes,
        requestedAt: mod.requestedAt,
        processedAt: mod.processedAt,
        completedAt: mod.completedAt,
      })),
    });
  } catch (error: any) {
    console.error('Get modifications error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch modifications',
      },
      { status: 500 }
    );
  }
}

// Helper: Calculate modification costs
function calculateModificationCost(
  modificationType: ModificationType,
  booking: any,
  modifiedData: any
): { changeFee: number; priceDifference: number; totalCharge: number } {
  let changeFee = 0;
  let priceDifference = 0;

  switch (modificationType) {
    case 'FLIGHT_CHANGE':
      changeFee = 50; // Base change fee
      // Calculate price difference if new flight is more expensive
      if (modifiedData.newPrice && modifiedData.newPrice > booking.totalAmount) {
        priceDifference = modifiedData.newPrice - booking.totalAmount;
      }
      break;

    case 'PASSENGER_UPDATE':
      changeFee = 25;
      break;

    case 'SEAT_CHANGE':
      changeFee = 15;
      if (modifiedData.seatUpgradePrice) {
        priceDifference = modifiedData.seatUpgradePrice;
      }
      break;

    case 'MEAL_CHANGE':
      changeFee = 0; // Free meal changes
      if (modifiedData.mealUpgradePrice) {
        priceDifference = modifiedData.mealUpgradePrice;
      }
      break;

    case 'BAGGAGE_CHANGE':
      changeFee = 0;
      if (modifiedData.additionalBaggagePrice) {
        priceDifference = modifiedData.additionalBaggagePrice;
      }
      break;

    case 'CONTACT_UPDATE':
      changeFee = 0; // Free contact updates
      break;

    case 'CANCELLATION':
      changeFee = 100; // Cancellation fee
      break;

    default:
      changeFee = 0;
  }

  const totalCharge = changeFee + priceDifference;

  return {
    changeFee,
    priceDifference,
    totalCharge,
  };
}

// Helper: Check if modification requires admin approval
function requiresApproval(modificationType: ModificationType, totalCharge: number): boolean {
  // Flight changes and high-value modifications need approval
  if (modificationType === 'FLIGHT_CHANGE') return true;
  if (totalCharge > 100) return true;

  return false;
}

// Helper: Create admin notification
async function createAdminNotification(modification: any, booking: any): Promise<void> {
  try {
    // Get all admin users
    const admins = await prisma.user.findMany({
      where: {
        role: {
          in: ['ADMIN', 'SUPER_ADMIN'],
        },
      },
    });

    // Create notification for each admin
    for (const admin of admins) {
      await prisma.notification.create({
        data: {
          userId: admin.id,
          type: 'BOOKING',
          title: 'Booking Modification Request',
          message: `Modification request ${modification.modificationReference} for booking ${booking.bookingReference} requires approval`,
          metadata: JSON.stringify({
            bookingId: booking.id,
            modificationId: modification.id,
            modificationType: modification.modificationType,
            totalCharge: modification.totalCharge,
          }),
        },
      });
    }
  } catch (error) {
    console.error('Failed to create admin notifications:', error);
  }
}
