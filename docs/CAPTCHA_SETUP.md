# CAPTCHA Integration Setup Guide

This document provides comprehensive instructions for setting up Google reCAPTCHA v3 integration in your flight booking application.

## Overview

The CAPTCHA system provides bot protection for critical API endpoints using Google reCAPTCHA v3 with score-based validation. Different actions have different security thresholds:

- **Payment**: 0.2 (Most strict)
- **Booking**: 0.3 (Very strict)
- **Login**: 0.3 (Strict)
- **Register**: 0.4 (Stricter)
- **Contact**: 0.5 (Medium)
- **Search**: 0.7 (Lenient)

## Prerequisites

1. **Google Account**: You need a Google account to access the reCAPTCHA Admin Console
2. **Domain Verification**: Your domain must be registered with Google reCAPTCHA
3. **Next.js Environment**: The integration is built for Next.js 13+ App Router

## Setup Steps

### 1. Create reCAPTCHA Keys

1. Go to [Google reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin)
2. Click "+" to create a new site
3. Configure your site:
   - **Label**: Your application name (e.g., "Flight Booking App")
   - **reCAPTCHA type**: Select "reCAPTCHA v3"
   - **Domains**: Add your domains:
     - `localhost` (for development)
     - Your production domain (e.g., `yourdomain.com`)
     - Any staging domains
4. Click "Submit"
5. Copy the **Site Key** and **Secret Key**

### 2. Configure Environment Variables

Add the following environment variables to your `.env.local` file:

```bash
# Google reCAPTCHA v3 Configuration
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=6Lxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
RECAPTCHA_SECRET_KEY=6Lxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Optional: Custom thresholds (if you want to override defaults)
# RECAPTCHA_LOGIN_THRESHOLD=0.3
# RECAPTCHA_PAYMENT_THRESHOLD=0.2
# RECAPTCHA_BOOKING_THRESHOLD=0.3
```

**Important Security Notes:**
- The `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` is safe to expose client-side
- The `RECAPTCHA_SECRET_KEY` must be kept secret and never exposed to the client
- Never commit these keys to version control

### 3. Wrap Your Application

Add the `CaptchaProvider` to your root layout or main app component:

```tsx
// app/layout.tsx (Next.js 13+ App Router)
import { CaptchaProvider } from '@/components/security/CaptchaProvider';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <CaptchaProvider
          hideDefaultBadge={false} // Set to true if you want custom badge placement
          onError={(error) => console.error('CAPTCHA Error:', error)}
          onSuccess={(token, action) => console.log('CAPTCHA Success:', action)}
        >
          {children}
        </CaptchaProvider>
      </body>
    </html>
  );
}
```

### 4. Integrate with Forms

#### Option 1: Using CaptchaForm Component

```tsx
import { CaptchaForm } from '@/components/security/CaptchaProvider';

function BookingForm() {
  const handleSubmit = async (formData: any, captchaToken: string | null) => {
    if (!captchaToken) {
      alert('CAPTCHA verification failed');
      return;
    }

    // Submit form with CAPTCHA token
    const response = await fetch('/api/bookings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        ...formData,
        captchaToken, // Include CAPTCHA token
      }),
    });

    const result = await response.json();
    if (result.success) {
      console.log('Booking created successfully!');
    } else {
      console.error('Booking failed:', result.error);
    }
  };

  return (
    <CaptchaForm
      action="booking"
      onSubmit={handleSubmit}
      onCaptchaError={(error) => alert(`Security error: ${error}`)}
      className="space-y-4"
    >
      <div>
        <label htmlFor="passengerName">Passenger Name</label>
        <input
          type="text"
          id="passengerName"
          name="passengerName"
          required
          className="w-full p-2 border rounded"
        />
      </div>
      
      <div>
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          name="email"
          required
          className="w-full p-2 border rounded"
        />
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
      >
        Create Booking
      </button>
    </CaptchaForm>
  );
}
```

#### Option 2: Using CaptchaButton Component

```tsx
import { CaptchaButton } from '@/components/security/CaptchaProvider';

function PaymentForm() {
  const handlePayment = async (captchaToken: string | null) => {
    if (!captchaToken) {
      alert('Security verification failed');
      return;
    }

    // Process payment with CAPTCHA token
    const response = await fetch('/api/payments/create-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        amount: paymentAmount,
        currency: 'usd',
        captchaToken, // Include CAPTCHA token
      }),
    });

    const result = await response.json();
    // Handle payment result...
  };

  return (
    <div className="space-y-4">
      {/* Payment form fields */}
      
      <CaptchaButton
        action="payment"
        onClick={handlePayment}
        onCaptchaError={(error) => setErrorMessage(error)}
        variant="primary"
        className="w-full"
      >
        Process Payment
      </CaptchaButton>
    </div>
  );
}
```

#### Option 3: Manual Integration

```tsx
import { useCaptchaContext } from '@/components/security/CaptchaProvider';

function CustomForm() {
  const captcha = useCaptchaContext();

  const handleSubmit = async () => {
    // Execute CAPTCHA manually
    const token = await captcha.executeRecaptcha('booking');
    
    if (!token) {
      alert('CAPTCHA verification failed');
      return;
    }

    // Use token in API call...
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <button type="submit">Submit</button>
    </form>
  );
}
```

## API Integration

The CAPTCHA system automatically protects the following API endpoints:

### Protected Endpoints

1. **POST /api/bookings** - Booking creation (action: "booking")
2. **POST /api/payments/create-intent** - Payment processing (action: "payment")
3. You can add more endpoints using the middleware

### API Response Format

When CAPTCHA verification fails, APIs return:

```json
{
  "success": false,
  "error": "CAPTCHA verification required",
  "code": "CAPTCHA_REQUIRED"
}
```

Or for verification failures:

```json
{
  "success": false,
  "error": "CAPTCHA verification failed",
  "code": "CAPTCHA_VERIFICATION_FAILED",
  "score": 0.1,
  "riskLevel": "high",
  "shouldRetry": false
}
```

## Adding CAPTCHA to New API Endpoints

### Next.js 13+ App Router (Recommended)

For new API routes, add CAPTCHA verification manually:

```typescript
// app/api/your-endpoint/route.ts
import { NextRequest, NextResponse } from 'next/server';
import CaptchaService from '@/lib/security/captcha';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const captchaToken = body.captchaToken;

    if (!captchaToken) {
      return NextResponse.json({
        success: false,
        error: 'CAPTCHA verification required',
        code: 'CAPTCHA_REQUIRED'
      }, { status: 400 });
    }

    const captchaResult = await CaptchaService.verifyToken(
      captchaToken,
      'your_action', // Define your action
      request.headers.get('x-forwarded-for') || 'unknown'
    );

    if (!captchaResult.success) {
      return NextResponse.json({
        success: false,
        error: captchaResult.error,
        code: 'CAPTCHA_VERIFICATION_FAILED'
      }, { status: 403 });
    }

    // Continue with your endpoint logic...
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
```

### Pages API (Legacy)

For legacy pages API routes, use the middleware:

```typescript
// pages/api/your-endpoint.ts
import { withCaptcha } from '@/lib/middleware/captchaMiddleware';

async function handler(req: CaptchaRequest, res: NextApiResponse) {
  // Your endpoint logic here
  // req.captcha contains verification results
}

export default withCaptcha(handler, { action: 'your_action' });
```

## Configuration Options

### Custom Thresholds

You can customize CAPTCHA thresholds by action:

```typescript
// lib/security/captcha.ts
CaptchaService.updateActionThreshold('login', 0.4); // Make login more strict
```

### Environment-Specific Settings

```bash
# Development (more lenient)
NODE_ENV=development
RECAPTCHA_LOGIN_THRESHOLD=0.1

# Production (strict)
NODE_ENV=production
RECAPTCHA_LOGIN_THRESHOLD=0.3
```

## Monitoring and Analytics

### CAPTCHA Statistics

Get CAPTCHA usage statistics:

```typescript
import CaptchaService from '@/lib/security/captcha';

const stats = CaptchaService.getStatistics();
console.log(stats);
// {
//   totalVerifications: 150,
//   successfulVerifications: 142,
//   averageScore: 0.85,
//   riskLevelDistribution: { low: 130, medium: 12, high: 8 },
//   actionDistribution: { booking: 45, payment: 30, login: 75 }
// }
```

### Configuration Validation

Validate your CAPTCHA configuration:

```typescript
const validation = CaptchaService.validateConfiguration();
if (!validation.valid) {
  console.error('CAPTCHA configuration errors:', validation.errors);
}
```

## Troubleshooting

### Common Issues

1. **"CAPTCHA not configured" warnings**
   - Ensure environment variables are set correctly
   - Check that keys are not empty or undefined

2. **Client-side script loading failures**
   - Verify domain is registered in reCAPTCHA console
   - Check for content blockers or ad blockers
   - Ensure proper HTTPS configuration

3. **High verification failure rates**
   - Consider adjusting thresholds for your use case
   - Check for bot traffic or unusual usage patterns
   - Verify proper integration in your forms

4. **CORS or domain errors**
   - Ensure your domain is added to the reCAPTCHA site configuration
   - Check for localhost configuration in development

### Debug Mode

Enable verbose logging in development:

```bash
DEBUG=captcha:*
```

### Testing

Test CAPTCHA integration in development:

```typescript
const testResult = await CaptchaService.testIntegration();
console.log(testResult);
```

## Security Best Practices

1. **Never expose secret keys** - Keep `RECAPTCHA_SECRET_KEY` server-side only
2. **Use appropriate thresholds** - Balance security with user experience
3. **Monitor statistics** - Watch for unusual patterns or high failure rates
4. **Rate limiting** - Combine CAPTCHA with rate limiting for enhanced protection
5. **Logging** - Monitor CAPTCHA events for security analysis
6. **Fallbacks** - Have graceful fallbacks if CAPTCHA service is unavailable

## Performance Considerations

1. **Script loading** - reCAPTCHA script loads asynchronously
2. **Token lifetime** - Tokens expire after 2 minutes
3. **Caching** - Verification results are cached to prevent replay attacks
4. **Cleanup** - Automatic cleanup of expired tokens and rate limit entries

## Support

For issues with this integration:
1. Check this documentation first
2. Verify Google reCAPTCHA console configuration
3. Check browser console for client-side errors
4. Review server logs for verification failures

For Google reCAPTCHA specific issues:
- [Google reCAPTCHA Documentation](https://developers.google.com/recaptcha)
- [reCAPTCHA FAQ](https://developers.google.com/recaptcha/docs/faq)