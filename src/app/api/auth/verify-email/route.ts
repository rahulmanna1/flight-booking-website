import { NextRequest, NextResponse } from 'next/server';
import EmailVerificationService from '@/lib/services/emailVerificationService';

// POST - Verify email with token
export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Verification token is required' },
        { status: 400 }
      );
    }

    // Verify the token
    const result = await EmailVerificationService.verifyEmailToken(token);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Email verified successfully',
        userId: result.userId
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error || 'Verification failed' },
        { status: 400 }
      );
    }

  } catch (error: any) {
    console.error('Email verification error:', error);
    
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET - Verify email with token (for direct link clicks)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.redirect(new URL('/login?error=invalid_token', request.url));
    }

    // Verify the token
    const result = await EmailVerificationService.verifyEmailToken(token);

    if (result.success) {
      return NextResponse.redirect(new URL('/login?verified=true', request.url));
    } else {
      return NextResponse.redirect(new URL('/login?error=verification_failed', request.url));
    }

  } catch (error: any) {
    console.error('Email verification error:', error);
    return NextResponse.redirect(new URL('/login?error=server_error', request.url));
  }
}
