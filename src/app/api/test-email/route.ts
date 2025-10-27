import { NextRequest, NextResponse } from 'next/server';
import EmailVerificationService from '@/lib/services/emailVerificationService';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'Email parameter required' }, { status: 400 });
    }

    console.log('🧪 Testing email service...');
    console.log('📧 SendGrid API Key:', process.env.SENDGRID_API_KEY ? '✅ Set' : '❌ Missing');
    console.log('📧 From Email:', process.env.SENDGRID_FROM_EMAIL);
    console.log('📧 Base URL:', process.env.NEXT_PUBLIC_BASE_URL);

    const result = await EmailVerificationService.sendVerificationEmail({
      email,
      firstName: 'Test',
      verificationToken: 'test-token-123'
    });

    return NextResponse.json({
      success: result.success,
      messageId: result.messageId,
      error: result.error,
      config: {
        apiKeySet: !!process.env.SENDGRID_API_KEY,
        fromEmail: process.env.SENDGRID_FROM_EMAIL,
        baseUrl: process.env.NEXT_PUBLIC_BASE_URL
      }
    });

  } catch (error: any) {
    console.error('❌ Test email failed:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      details: error.response?.body
    }, { status: 500 });
  }
}
