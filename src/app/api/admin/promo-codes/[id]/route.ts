import { NextRequest, NextResponse } from 'next/server';
import PromoCodeService from '@/lib/services/promoCodeService';
import { verifyAdminAuth } from '@/lib/middleware/adminAuth';

// GET promo code statistics
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

    const stats = await PromoCodeService.getPromoCodeStats(id);

    if (!stats) {
      return NextResponse.json(
        { error: 'Promo code not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error('❌ Failed to fetch promo code stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch promo code statistics' },
      { status: 500 }
    );
  }
}

// PUT update promo code
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

    const result = await PromoCodeService.updatePromoCode(id, body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to update promo code' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Promo code updated successfully',
    });
  } catch (error) {
    console.error('❌ Failed to update promo code:', error);
    return NextResponse.json(
      { error: 'Failed to update promo code' },
      { status: 500 }
    );
  }
}

// DELETE promo code
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

    const result = await PromoCodeService.deletePromoCode(id);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to delete promo code' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Promo code deleted successfully',
    });
  } catch (error) {
    console.error('❌ Failed to delete promo code:', error);
    return NextResponse.json(
      { error: 'Failed to delete promo code' },
      { status: 500 }
    );
  }
}
