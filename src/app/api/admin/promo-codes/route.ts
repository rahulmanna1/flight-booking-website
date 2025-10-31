import { NextRequest, NextResponse } from 'next/server';
import PromoCodeService, { DiscountType } from '@/lib/services/promoCodeService';

// GET all promo codes (admin only)
export async function GET(request: NextRequest) {
  try {
    // TODO: Add authentication middleware to verify admin role
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get('includeInactive') === 'true';

    const promoCodes = await PromoCodeService.getAllPromoCodes(includeInactive);

    return NextResponse.json({
      success: true,
      promoCodes,
      count: promoCodes.length,
    });
  } catch (error) {
    console.error('❌ Failed to fetch promo codes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch promo codes' },
      { status: 500 }
    );
  }
}

// POST create new promo code (admin only)
export async function POST(request: NextRequest) {
  try {
    // TODO: Add authentication middleware to verify admin role
    const body = await request.json();

    // Validate required fields
    const requiredFields = [
      'code',
      'description',
      'discountType',
      'discountValue',
      'validFrom',
      'validUntil',
    ];

    const missingFields = requiredFields.filter(field => !body[field]);
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate discount type
    if (!Object.values(DiscountType).includes(body.discountType)) {
      return NextResponse.json(
        { error: 'Invalid discount type' },
        { status: 400 }
      );
    }

    // Validate discount value
    if (body.discountValue <= 0) {
      return NextResponse.json(
        { error: 'Discount value must be greater than 0' },
        { status: 400 }
      );
    }

    if (body.discountType === DiscountType.PERCENTAGE && body.discountValue > 100) {
      return NextResponse.json(
        { error: 'Percentage discount cannot exceed 100%' },
        { status: 400 }
      );
    }

    // Validate dates
    const validFrom = new Date(body.validFrom);
    const validUntil = new Date(body.validUntil);

    if (validFrom >= validUntil) {
      return NextResponse.json(
        { error: 'Valid from date must be before valid until date' },
        { status: 400 }
      );
    }

    // Create promo code
    const result = await PromoCodeService.createPromoCode({
      code: body.code,
      description: body.description,
      discountType: body.discountType,
      discountValue: body.discountValue,
      minPurchaseAmount: body.minPurchaseAmount,
      maxDiscountAmount: body.maxDiscountAmount,
      usageLimit: body.usageLimit,
      perUserLimit: body.perUserLimit,
      validFrom,
      validUntil,
      applicableRoutes: body.applicableRoutes,
      applicableAirlines: body.applicableAirlines,
      firstTimeOnly: body.firstTimeOnly,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to create promo code' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Promo code created successfully',
    });
  } catch (error) {
    console.error('❌ Failed to create promo code:', error);
    return NextResponse.json(
      { error: 'Failed to create promo code' },
      { status: 500 }
    );
  }
}
