// Email Verification Service
// Handles sending verification emails and token management

import sgMail from '@sendgrid/mail';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';

// Note: API key is set dynamically in each method to avoid caching issues

interface VerificationEmailData {
  email: string;
  firstName: string;
  verificationToken: string;
}

interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

class EmailVerificationService {
  
  static isConfigured(): boolean {
    return !!process.env.SENDGRID_API_KEY;
  }

  // Generate verification token
  static generateVerificationToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  // Create verification token in database
  static async createVerificationToken(userId: string): Promise<string> {
    const token = this.generateVerificationToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Get current user preferences
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { preferences: true }
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Parse and update preferences
    const prefs = JSON.parse(user.preferences);
    prefs.verificationToken = token;
    prefs.verificationTokenExpiry = expiresAt.toISOString();
    prefs.emailVerified = false;

    // Store token in user preferences
    await prisma.user.update({
      where: { id: userId },
      data: {
        preferences: JSON.stringify(prefs)
      }
    });

    return token;
  }

  // Send verification email
  static async sendVerificationEmail(data: VerificationEmailData): Promise<EmailResult> {
    const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
    const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || 'noreply@flightbooker.com';
    const FROM_NAME = process.env.SENDGRID_FROM_NAME || 'FlightBooker';
    const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    if (!SENDGRID_API_KEY) {
      console.warn('⚠️ Email service not configured, skipping verification email');
      return { success: false, error: 'Email service not configured' };
    }

    // Set API key dynamically to avoid caching issues
    sgMail.setApiKey(SENDGRID_API_KEY);

    try {
      const verificationLink = `${BASE_URL}/verify-email?token=${data.verificationToken}`;
      
      const htmlContent = this.generateVerificationHTML(data.firstName, verificationLink);
      const textContent = this.generateVerificationText(data.firstName, verificationLink);

      const msg = {
        to: data.email,
        from: {
          email: FROM_EMAIL,
          name: FROM_NAME
        },
        subject: 'Verify Your Email - FlightBooker',
        text: textContent,
        html: htmlContent,
        trackingSettings: {
          clickTracking: {
            enable: true
          },
          openTracking: {
            enable: true
          }
        }
      };

      const [response] = await sgMail.send(msg);
      
      console.log(`✅ Verification email sent to ${data.email}`);
      
      return {
        success: true,
        messageId: response.headers['x-message-id'] as string
      };

    } catch (error: any) {
      console.error('❌ Failed to send verification email:', error);
      
      return {
        success: false,
        error: error.message || 'Failed to send email'
      };
    }
  }

  // Verify email token
  static async verifyEmailToken(token: string): Promise<{ success: boolean; userId?: string; error?: string }> {
    try {
      // Find user with this token
      const users = await prisma.user.findMany();
      
      let matchedUser = null;
      for (const user of users) {
        const prefs = JSON.parse(user.preferences);
        if (prefs.verificationToken === token) {
          // Check if token is expired
          const expiry = new Date(prefs.verificationTokenExpiry);
          if (expiry > new Date()) {
            matchedUser = user;
            break;
          }
        }
      }

      if (!matchedUser) {
        return { success: false, error: 'Invalid or expired token' };
      }

      // Mark email as verified
      const prefs = JSON.parse(matchedUser.preferences);
      delete prefs.verificationToken;
      delete prefs.verificationTokenExpiry;
      prefs.emailVerified = true;

      await prisma.user.update({
        where: { id: matchedUser.id },
        data: {
          preferences: JSON.stringify(prefs)
        }
      });

      console.log(`✅ Email verified for user ${matchedUser.email}`);
      
      return { success: true, userId: matchedUser.id };

    } catch (error: any) {
      console.error('❌ Email verification failed:', error);
      return { success: false, error: 'Verification failed' };
    }
  }

  // Resend verification email
  static async resendVerificationEmail(userId: string): Promise<EmailResult> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        return { success: false, error: 'User not found' };
      }

      const prefs = JSON.parse(user.preferences);
      if (prefs.emailVerified) {
        return { success: false, error: 'Email already verified' };
      }

      // Generate new token
      const token = await this.createVerificationToken(userId);

      // Send email
      return await this.sendVerificationEmail({
        email: user.email,
        firstName: user.firstName,
        verificationToken: token
      });

    } catch (error: any) {
      console.error('❌ Failed to resend verification email:', error);
      return { success: false, error: 'Failed to resend email' };
    }
  }

  // Generate verification HTML email
  private static generateVerificationHTML(firstName: string, verificationLink: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Verify Your Email</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f5f5f5; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); color: white; padding: 40px 20px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; }
        .content { padding: 40px 30px; }
        .content h2 { color: #1e293b; margin-top: 0; }
        .button { display: inline-block; padding: 14px 32px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
        .button:hover { background: #1e40af; }
        .footer { background: #f8fafc; padding: 20px; text-align: center; color: #64748b; font-size: 14px; }
        .info-box { background: #f0f9ff; border-left: 4px solid #2563eb; padding: 15px; margin: 20px 0; border-radius: 4px; }
        .link-text { color: #64748b; font-size: 12px; word-break: break-all; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>✈️ Welcome to FlightBooker!</h1>
        </div>
        
        <div class="content">
            <h2>Hi ${firstName}! 👋</h2>
            <p>Thank you for signing up with FlightBooker. We're excited to help you find and book your perfect flights!</p>
            
            <p>To complete your registration and start booking flights, please verify your email address by clicking the button below:</p>
            
            <div style="text-align: center;">
                <a href="${verificationLink}" class="button">Verify My Email</a>
            </div>
            
            <div class="info-box">
                <strong>⏰ Important:</strong> This verification link will expire in 24 hours. If you didn't create an account with FlightBooker, you can safely ignore this email.
            </div>
            
            <p>Once verified, you'll be able to:</p>
            <ul>
                <li>✓ Search and book flights worldwide</li>
                <li>✓ Save favorite destinations</li>
                <li>✓ Set up price alerts</li>
                <li>✓ Manage your bookings</li>
                <li>✓ Earn rewards and benefits</li>
            </ul>
            
            <p class="link-text">
                <strong>Can't click the button?</strong> Copy and paste this link into your browser:<br>
                ${verificationLink}
            </p>
        </div>
        
        <div class="footer">
            <p>Need help? Contact us at <a href="mailto:support@flightbooker.com" style="color: #2563eb;">support@flightbooker.com</a></p>
            <p>&copy; 2024 FlightBooker. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`;
  }

  // Generate verification plain text email
  private static generateVerificationText(firstName: string, verificationLink: string): string {
    return `
VERIFY YOUR EMAIL

Hi ${firstName}!

Thank you for signing up with FlightBooker. We're excited to help you find and book your perfect flights!

To complete your registration, please verify your email address by clicking the link below:

${verificationLink}

IMPORTANT: This verification link will expire in 24 hours.

Once verified, you'll be able to:
✓ Search and book flights worldwide
✓ Save favorite destinations
✓ Set up price alerts
✓ Manage your bookings
✓ Earn rewards and benefits

If you didn't create an account with FlightBooker, you can safely ignore this email.

Need help? Contact us at support@flightbooker.com

FlightBooker Team
    `.trim();
  }

  // Send password reset email
  static async sendPasswordResetEmail(email: string, firstName: string, resetToken: string): Promise<EmailResult> {
    const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
    const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || 'noreply@flightbooker.com';
    const FROM_NAME = process.env.SENDGRID_FROM_NAME || 'FlightBooker';
    const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    if (!SENDGRID_API_KEY) {
      console.warn('⚠️ Email service not configured, skipping password reset email');
      return { success: false, error: 'Email service not configured' };
    }

    // Set API key dynamically to avoid caching issues
    sgMail.setApiKey(SENDGRID_API_KEY);

    try {
      const resetLink = `${BASE_URL}/reset-password?token=${resetToken}`;
      
      const htmlContent = this.generatePasswordResetHTML(firstName, resetLink);
      const textContent = this.generatePasswordResetText(firstName, resetLink);

      const msg = {
        to: email,
        from: {
          email: FROM_EMAIL,
          name: FROM_NAME
        },
        subject: 'Reset Your Password - FlightBooker',
        text: textContent,
        html: htmlContent
      };

      const [response] = await sgMail.send(msg);
      
      console.log(`✅ Password reset email sent to ${email}`);
      
      return {
        success: true,
        messageId: response.headers['x-message-id'] as string
      };

    } catch (error: any) {
      console.error('❌ Failed to send password reset email:', error);
      
      return {
        success: false,
        error: error.message || 'Failed to send email'
      };
    }
  }

  // Generate password reset HTML email
  private static generatePasswordResetHTML(firstName: string, resetLink: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Reset Your Password</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f5f5f5; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .header { background: #ef4444; color: white; padding: 30px 20px; text-align: center; }
        .content { padding: 40px 30px; }
        .button { display: inline-block; padding: 14px 32px; background: #ef4444; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
        .warning { background: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; border-radius: 4px; }
        .footer { background: #f8fafc; padding: 20px; text-align: center; color: #64748b; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔒 Password Reset Request</h1>
        </div>
        
        <div class="content">
            <h2>Hi ${firstName},</h2>
            <p>We received a request to reset your FlightBooker account password.</p>
            
            <p>Click the button below to create a new password:</p>
            
            <div style="text-align: center;">
                <a href="${resetLink}" class="button">Reset My Password</a>
            </div>
            
            <div class="warning">
                <strong>⚠️ Security Notice:</strong> This link will expire in 1 hour. If you didn't request a password reset, please ignore this email and ensure your account is secure.
            </div>
            
            <p style="font-size: 12px; color: #64748b; margin-top: 30px;">
                Link not working? Copy and paste this URL into your browser:<br>
                ${resetLink}
            </p>
        </div>
        
        <div class="footer">
            <p>Contact support: <a href="mailto:support@flightbooker.com" style="color: #ef4444;">support@flightbooker.com</a></p>
            <p>&copy; 2024 FlightBooker</p>
        </div>
    </div>
</body>
</html>`;
  }

  // Generate password reset plain text email
  private static generatePasswordResetText(firstName: string, resetLink: string): string {
    return `
PASSWORD RESET REQUEST

Hi ${firstName},

We received a request to reset your FlightBooker account password.

Click the link below to create a new password:
${resetLink}

SECURITY NOTICE: This link will expire in 1 hour. If you didn't request a password reset, please ignore this email and ensure your account is secure.

Contact support: support@flightbooker.com

FlightBooker Team
    `.trim();
  }
}

export default EmailVerificationService;
