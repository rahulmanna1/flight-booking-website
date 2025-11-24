// Cron Job: Auto-cancel bookings with expired grace periods
// This endpoint should be called hourly via a cron service (Vercel Cron, external scheduler, etc.)

import { NextRequest, NextResponse } from 'next/server';
import StripePaymentService from '@/lib/payments/stripeService';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Allow up to 60 seconds for processing

/**
 * GET /api/cron/cancel-expired-payments
 * 
 * Automatically cancels bookings that have exceeded their payment grace period.
 * This endpoint should be called hourly by a cron service.
 * 
 * Security: Protected by CRON_SECRET environment variable
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      console.error('⚠️ CRON_SECRET not configured');
      return NextResponse.json(
        { error: 'Cron job not configured' },
        { status: 500 }
      );
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
      console.warn('🚨 Unauthorized cron job attempt');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('⏰ Starting automatic payment expiration cleanup...');
    const startTime = Date.now();

    // Run the cleanup job
    const result = await StripePaymentService.cancelExpiredPendingPayments();

    const duration = Date.now() - startTime;

    console.log(`✅ Cleanup completed in ${duration}ms`);
    console.log(`   - Cancelled: ${result.cancelledCount} bookings`);
    console.log(`   - Errors: ${result.errors.length}`);

    return NextResponse.json({
      success: true,
      message: 'Expired payments cancelled',
      data: {
        cancelledCount: result.cancelledCount,
        errorCount: result.errors.length,
        errors: result.errors,
        durationMs: duration,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('❌ Cron job failed:', error);

    return NextResponse.json(
      {
        error: 'Cron job failed',
        message: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * POST endpoint for manual triggering (admin only)
 * Can be called from admin dashboard for testing or manual cleanup
 */
export async function POST(request: NextRequest) {
  try {
    // For POST, check for admin authorization
    // You would implement your admin auth check here
    // For now, using the same cron secret
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('🔧 Manual payment expiration cleanup triggered');
    const result = await StripePaymentService.cancelExpiredPendingPayments();

    return NextResponse.json({
      success: true,
      message: 'Manual cleanup completed',
      data: {
        cancelledCount: result.cancelledCount,
        errorCount: result.errors.length,
        errors: result.errors,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('❌ Manual cleanup failed:', error);

    return NextResponse.json(
      {
        error: 'Manual cleanup failed',
        message: error.message,
      },
      { status: 500 }
    );
  }
}
