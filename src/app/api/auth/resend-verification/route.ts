import { NextRequest, NextResponse } from 'next/server';
import EmailVerificationService from '@/lib/services/emailVerificationService';
import { verifyAuth } from '@/lib/auth-prisma';

// POST - Resend verification email
export async function POST(request: NextRequest) {
  try {
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

    // Resend verification email
    const result = await EmailVerificationService.resendVerificationEmail(userId);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Verification email sent successfully'
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to send verification email' },
        { status: 400 }
      );
    }

  } catch (error: any) {
    console.error('Resend verification error:', error);
    
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
