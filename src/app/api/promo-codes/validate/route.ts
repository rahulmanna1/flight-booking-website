import { NextRequest, NextResponse } from 'next/server';
import PromoCodeService from '@/lib/services/promoCodeService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, userId, bookingAmount, route, airline } = body;

    // Validate required fields
    if (!code || !userId || !bookingAmount) {
      return NextResponse.json(
        { error: 'Missing required fields: code, userId, bookingAmount' },
        { status: 400 }
      );
    }

    if (bookingAmount <= 0) {
      return NextResponse.json(
        { error: 'Booking amount must be greater than 0' },
        { status: 400 }
      );
    }

    // Validate promo code
    const result = await PromoCodeService.validatePromoCode(
      code,
      userId,
      bookingAmount,
      route,
      airline
    );

    if (!result.valid) {
      return NextResponse.json(
        { 
          valid: false, 
          message: result.message 
        },
        { status: 200 }
      );
    }

    return NextResponse.json({
      valid: true,
      discountAmount: result.discountAmount,
      finalAmount: result.finalAmount,
      message: result.message,
      promoCode: {
        id: result.promoCode?.id,
        code: result.promoCode?.code,
        description: result.promoCode?.description,
        discountType: result.promoCode?.discountType,
        discountValue: result.promoCode?.discountValue,
      },
    });
  } catch (error) {
    console.error('❌ Promo code validation error:', error);
    return NextResponse.json(
      { error: 'Failed to validate promo code' },
      { status: 500 }
    );
  }
}
