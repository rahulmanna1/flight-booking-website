import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAuth, logAdminAction } from '@/lib/middleware/adminAuth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET single refund details
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await verifyAdminAuth(request);
    if (!authResult.valid) {
      return NextResponse.json({ error: authResult.error }, { status: 403 });
    }

    const { id } = await context.params;

    const refund = await prisma.refund.findUnique({
      where: { id },
      include: {
        booking: {
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
          },
        },
      },
    });

    if (!refund) {
      return NextResponse.json(
        { error: 'Refund not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      refund,
    });
  } catch (error) {
    console.error('❌ Failed to fetch refund details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch refund details' },
      { status: 500 }
    );
  }
}

// PUT update refund status or details
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await verifyAdminAuth(request);
    if (!authResult.valid) {
      return NextResponse.json({ error: authResult.error }, { status: 403 });
    }

    const { id } = await context.params;
    const body = await request.json();

    // Get current refund
    const refund = await prisma.refund.findUnique({
      where: { id },
      include: { booking: true },
    });

    if (!refund) {
      return NextResponse.json(
        { error: 'Refund not found' },
        { status: 404 }
      );
    }

    // Build update data
    const updateData: any = {};

    if (body.status !== undefined) updateData.status = body.status;
    if (body.adminNotes !== undefined) updateData.adminNotes = body.adminNotes;
    if (body.approvedAmount !== undefined) updateData.approvedAmount = body.approvedAmount;
    if (body.processingFee !== undefined) updateData.processingFee = body.processingFee;
    if (body.refundMethod !== undefined) updateData.refundMethod = body.refundMethod;
    if (body.transactionId !== undefined) updateData.transactionId = body.transactionId;

    // Calculate net amount if approved amount or fee changes
    if (body.approvedAmount !== undefined || body.processingFee !== undefined) {
      const approvedAmount = body.approvedAmount ?? refund.approvedAmount ?? refund.requestedAmount;
      const processingFee = body.processingFee ?? refund.processingFee ?? 0;
      updateData.netRefundAmount = approvedAmount - processingFee;
    }

    // Set completion date if status is COMPLETED
    if (body.status === 'COMPLETED' && refund.status !== 'COMPLETED') {
      updateData.completedAt = new Date();
    }

    // Update refund
    const updatedRefund = await prisma.refund.update({
      where: { id },
      data: {
        ...updateData,
        processedBy: authResult.user?.userId,
      },
    });

    // Log admin action
    await logAdminAction({
      userId: authResult.user?.userId || '',
      action: 'Refund updated',
      category: 'REFUND',
      details: {
        refundId: id,
        refundReference: refund.refundReference,
        bookingReference: refund.booking.bookingReference,
        changes: updateData,
      },
      ipAddress: request.headers.get('x-forwarded-for') || '',
      userAgent: request.headers.get('user-agent') || '',
    });

    return NextResponse.json({
      success: true,
      message: 'Refund updated successfully',
      refund: updatedRefund,
    });
  } catch (error) {
    console.error('❌ Failed to update refund:', error);
    return NextResponse.json(
      { error: 'Failed to update refund' },
      { status: 500 }
    );
  }
}

// DELETE refund (cancel request)
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await verifyAdminAuth(request);
    if (!authResult.valid) {
      return NextResponse.json({ error: authResult.error }, { status: 403 });
    }

    const { id } = await context.params;

    // Get refund details
    const refund = await prisma.refund.findUnique({
      where: { id },
      include: { booking: true },
    });

    if (!refund) {
      return NextResponse.json(
        { error: 'Refund not found' },
        { status: 404 }
      );
    }

    // Only allow deletion of PENDING or REJECTED refunds
    if (!['PENDING', 'REJECTED', 'CANCELLED'].includes(refund.status)) {
      return NextResponse.json(
        { error: 'Cannot delete processed refunds' },
        { status: 400 }
      );
    }

    // Delete refund
    await prisma.refund.delete({
      where: { id },
    });

    // Log admin action
    await logAdminAction({
      userId: authResult.user?.userId || '',
      action: 'Refund deleted',
      category: 'REFUND',
      details: {
        refundId: id,
        refundReference: refund.refundReference,
        bookingReference: refund.booking.bookingReference,
        requestedAmount: refund.requestedAmount,
      },
      ipAddress: request.headers.get('x-forwarded-for') || '',
      userAgent: request.headers.get('user-agent') || '',
    });

    return NextResponse.json({
      success: true,
      message: 'Refund request deleted successfully',
    });
  } catch (error) {
    console.error('❌ Failed to delete refund:', error);
    return NextResponse.json(
      { error: 'Failed to delete refund' },
      { status: 500 }
    );
  }
}
