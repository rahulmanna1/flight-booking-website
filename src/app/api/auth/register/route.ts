import { NextRequest, NextResponse } from 'next/server';
import { PrismaAuthService as AuthService } from '@/lib/auth-prisma';

export async function POST(request: NextRequest) {
  try {
    const {
      email,
      password,
      firstName,
      lastName,
      phone,
      dateOfBirth,
      nationality
    } = await request.json();

    // Validate required fields
    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'Email, password, first name, and last name are required' },
        { status: 400 }
      );
    }

    // Validate email format
    if (!AuthService.validateEmail(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate password strength
    const passwordValidation = AuthService.validatePassword(password);
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { 
          error: 'Password does not meet requirements',
          details: passwordValidation.errors
        },
        { status: 400 }
      );
    }

    // Validate names
    if (firstName.trim().length < 2 || lastName.trim().length < 2) {
      return NextResponse.json(
        { error: 'First name and last name must be at least 2 characters long' },
        { status: 400 }
      );
    }

    // Validate phone if provided
    if (phone && !/^\+?[\d\s\-\(\)]{10,}$/.test(phone)) {
      return NextResponse.json(
        { error: 'Invalid phone number format' },
        { status: 400 }
      );
    }

    // Validate date of birth if provided
    if (dateOfBirth) {
      const birthDate = new Date(dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      
      if (age < 16 || age > 120) {
        return NextResponse.json(
          { error: 'You must be between 16 and 120 years old' },
          { status: 400 }
        );
      }
    }

    // Create user
    const { user, token } = await AuthService.createUser({
      email: email.toLowerCase().trim(),
      password,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: phone?.trim(),
      dateOfBirth,
      nationality: nationality?.trim()
    });

    // Send verification email (don't block registration if it fails)
    try {
      const EmailVerificationService = (await import('@/lib/services/emailVerificationService')).default;
      const verificationToken = await EmailVerificationService.createVerificationToken(user.id);
      await EmailVerificationService.sendVerificationEmail({
        email: user.email,
        firstName: user.firstName,
        verificationToken
      });
      console.log(`✅ Verification email sent to ${user.email}`);
    } catch (emailError) {
      console.error('⚠️ Failed to send verification email:', emailError);
      // Don't fail registration if email sending fails
    }

    // Don't return token - require email verification first
    return NextResponse.json({
      message: 'Registration successful. Please check your email to verify your account.',
      email: user.email,
      emailVerification: {
        sent: true,
        required: true
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    
    if (error instanceof Error && error.message === 'User already exists') {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}