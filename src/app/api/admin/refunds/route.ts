import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAuth, logAdminAction } from '@/lib/middleware/adminAuth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET all refund requests with filters
export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAdminAuth(request);
    if (!authResult.valid) {
      return NextResponse.json({ error: authResult.error }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || '';
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (status && status !== 'ALL') {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { refundReference: { contains: search, mode: 'insensitive' } },
        { 
          booking: {
            bookingReference: { contains: search, mode: 'insensitive' }
          }
        },
      ];
    }

    // Get refunds with booking and user details
    const [refunds, totalCount] = await Promise.all([
      prisma.refund.findMany({
        where,
        skip,
        take: limit,
        orderBy: { requestedAt: 'desc' },
        include: {
          booking: {
            select: {
              bookingReference: true,
              confirmationNumber: true,
              totalAmount: true,
              status: true,
              user: {
                select: {
                  id: true,
                  email: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
      }),
      prisma.refund.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      refunds,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error('❌ Failed to fetch refunds:', error);
    return NextResponse.json(
      { error: 'Failed to fetch refunds' },
      { status: 500 }
    );
  }
}

// POST process refund (approve/reject)
export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyAdminAuth(request);
    if (!authResult.valid) {
      return NextResponse.json({ error: authResult.error }, { status: 403 });
    }

    const body = await request.json();
    const {
      refundId,
      action, // 'APPROVE' or 'REJECT'
      approvedAmount,
      processingFee,
      adminNotes,
      refundMethod,
    } = body;

    if (!refundId || !action) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get refund details
    const refund = await prisma.refund.findUnique({
      where: { id: refundId },
      include: {
        booking: true,
      },
    });

    if (!refund) {
      return NextResponse.json(
        { error: 'Refund request not found' },
        { status: 404 }
      );
    }

    if (refund.status !== 'PENDING' && refund.status !== 'UNDER_REVIEW') {
      return NextResponse.json(
        { error: 'This refund has already been processed' },
        { status: 400 }
      );
    }

    let updateData: any = {
      processedBy: authResult.user?.userId,
      processedAt: new Date(),
      adminNotes,
    };

    if (action === 'APPROVE') {
      const finalAmount = approvedAmount || refund.requestedAmount;
      const fee = processingFee || 0;
      
      updateData = {
        ...updateData,
        status: 'APPROVED',
        approvedAmount: finalAmount,
        processingFee: fee,
        netRefundAmount: finalAmount - fee,
        refundMethod: refundMethod || 'ORIGINAL_METHOD',
      };

      // Update booking status to REFUNDED
      await prisma.booking.update({
        where: { id: refund.bookingId },
        data: { status: 'REFUNDED' },
      });
    } else if (action === 'REJECT') {
      updateData = {
        ...updateData,
        status: 'REJECTED',
      };
    }

    // Update refund
    const updatedRefund = await prisma.refund.update({
      where: { id: refundId },
      data: updateData,
    });

    // Log admin action
    await logAdminAction({
      userId: authResult.user?.userId || '',
      action: `Refund ${action.toLowerCase()}ed`,
      category: 'REFUND',
      details: {
        refundId,
        refundReference: refund.refundReference,
        bookingReference: refund.booking.bookingReference,
        amount: updateData.netRefundAmount || refund.requestedAmount,
        action,
      },
      ipAddress: request.headers.get('x-forwarded-for') || '',
      userAgent: request.headers.get('user-agent') || '',
    });

    return NextResponse.json({
      success: true,
      message: `Refund ${action.toLowerCase()}ed successfully`,
      refund: updatedRefund,
    });
  } catch (error) {
    console.error('❌ Failed to process refund:', error);
    return NextResponse.json(
      { error: 'Failed to process refund' },
      { status: 500 }
    );
  }
}
