import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import EmailVerificationService from '@/lib/services/emailVerificationService';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    });

    // Always return success to prevent email enumeration attacks
    // Don't reveal if user exists or not
    if (!user) {
      return NextResponse.json({
        success: true,
        message: 'If an account exists with this email, you will receive a password reset link.'
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Save token to database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry
      }
    });

    // Send password reset email
    try {
      await EmailVerificationService.sendPasswordResetEmail(
        user.email,
        user.firstName,
        resetToken
      );
      console.log(`✅ Password reset email sent to ${user.email}`);
    } catch (emailError) {
      console.error('⚠️ Failed to send password reset email:', emailError);
      // Continue - don't reveal email sending failure to user
    }

    return NextResponse.json({
      success: true,
      message: 'If an account exists with this email, you will receive a password reset link.'
    });

  } catch (error) {
    console.error('Password reset request error:', error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
