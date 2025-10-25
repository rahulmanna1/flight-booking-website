# 🚀 Production Environment Setup Guide

## Environment Variables Configuration

### Required Environment Variables

Create a `.env.production` file in your project root with the following variables:

```env
# ===================================================================
# NODE ENVIRONMENT
# ===================================================================
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1

# ===================================================================
# DATABASE CONFIGURATION
# ===================================================================
# PostgreSQL connection string
# Format: postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public
DATABASE_URL="postgresql://username:password@your-db-host:5432/flight_booking_db?schema=public"

# Connection Pool Settings (Optional but recommended)
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=10

# ===================================================================
# AUTHENTICATION (NextAuth.js)
# ===================================================================
# NextAuth secret - Generate with: openssl rand -base64 32
NEXTAUTH_SECRET="your-super-secret-random-string-here"

# Production URL
NEXTAUTH_URL="https://yourdomain.com"

# Session Settings
NEXTAUTH_SESSION_MAXAGE=86400  # 24 hours in seconds

# ===================================================================
# AMADEUS TRAVEL API
# ===================================================================
# Get from: https://developers.amadeus.com/
AMADEUS_CLIENT_ID="your_amadeus_client_id"
AMADEUS_CLIENT_SECRET="your_amadeus_client_secret"
AMADEUS_ENVIRONMENT="production"  # or "test" for testing

# ===================================================================
# STRIPE PAYMENT GATEWAY
# ===================================================================
# Get from: https://dashboard.stripe.com/apikeys
STRIPE_PUBLIC_KEY="pk_live_your_stripe_public_key"
STRIPE_SECRET_KEY="sk_live_your_stripe_secret_key"
STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret"

# Stripe Settings
STRIPE_CURRENCY="USD"
STRIPE_PAYMENT_METHODS="card,apple_pay,google_pay"

# ===================================================================
# EMAIL SERVICE (SendGrid)
# ===================================================================
# Get from: https://app.sendgrid.com/settings/api_keys
SENDGRID_API_KEY="SG.your_sendgrid_api_key"
SENDGRID_FROM_EMAIL="noreply@yourdomain.com"
SENDGRID_FROM_NAME="Flight Booking"

# ===================================================================
# GOOGLE RECAPTCHA v3 (Security)
# ===================================================================
# Get from: https://www.google.com/recaptcha/admin
NEXT_PUBLIC_RECAPTCHA_SITE_KEY="your_recaptcha_site_key"
RECAPTCHA_SECRET_KEY="your_recaptcha_secret_key"

# ===================================================================
# ANALYTICS & MONITORING (Optional but Recommended)
# ===================================================================
# Sentry for Error Tracking
NEXT_PUBLIC_SENTRY_DSN="https://your-sentry-dsn@sentry.io/project-id"
SENTRY_AUTH_TOKEN="your_sentry_auth_token"

# Google Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID="G-XXXXXXXXXX"

# LogRocket (Session Replay)
NEXT_PUBLIC_LOGROCKET_APP_ID="your-app/id"

# ===================================================================
# RATE LIMITING & SECURITY
# ===================================================================
# Redis URL for rate limiting (if using Redis)
REDIS_URL="redis://your-redis-host:6379"

# Rate Limit Settings
RATE_LIMIT_WINDOW=900000  # 15 minutes in ms
RATE_LIMIT_MAX_REQUESTS=100

# ===================================================================
# CORS & SECURITY HEADERS
# ===================================================================
ALLOWED_ORIGINS="https://yourdomain.com,https://www.yourdomain.com"
TRUSTED_HOSTS="yourdomain.com,www.yourdomain.com"

# ===================================================================
# FILE STORAGE (Optional - for ticket PDFs, etc.)
# ===================================================================
# AWS S3 or similar
AWS_ACCESS_KEY_ID="your_aws_access_key"
AWS_SECRET_ACCESS_KEY="your_aws_secret_key"
AWS_REGION="us-east-1"
AWS_S3_BUCKET="flight-booking-assets"

# ===================================================================
# FEATURE FLAGS
# ===================================================================
ENABLE_AMADEUS_LIVE_SEARCH=true
ENABLE_PAYMENT_PROCESSING=true
ENABLE_EMAIL_NOTIFICATIONS=true
ENABLE_PRICE_ALERTS=true

# ===================================================================
# LOGGING
# ===================================================================
LOG_LEVEL="info"  # debug, info, warn, error
ENABLE_REQUEST_LOGGING=true
```

## Step-by-Step Setup Instructions

### 1. Database Setup

```bash
# Deploy PostgreSQL database (example using Railway, Supabase, or AWS RDS)

# Run migrations
npx prisma migrate deploy

# Seed initial data
npm run db:seed
```

### 2. Amadeus API Setup

1. Visit https://developers.amadeus.com/
2. Create an account and application
3. Get your Client ID and Client Secret
4. For production, switch to "Production" environment
5. Add credentials to `.env.production`

### 3. Stripe Setup

1. Visit https://dashboard.stripe.com/
2. Complete business verification
3. Get your production API keys
4. Set up webhook endpoint: `https://yourdomain.com/api/payments/webhook`
5. Configure webhook events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`

### 4. SendGrid Email Setup

1. Visit https://sendgrid.com/
2. Create account and verify domain
3. Create API key with "Mail Send" permissions
4. Add sender authentication
5. Create email templates for:
   - Booking confirmation
   - Flight changes
   - Price alerts

### 5. Google reCAPTCHA Setup

1. Visit https://www.google.com/recaptcha/admin
2. Register your site with reCAPTCHA v3
3. Add your domain
4. Get Site Key and Secret Key

### 6. Security Configuration

```bash
# Generate secure NextAuth secret
openssl rand -base64 32

# Set strong database password
# Use password manager to generate 32+ character password
```

## Deployment Checklist

### Pre-Deployment

- [ ] All environment variables configured
- [ ] Database migrations applied
- [ ] Database seeded with initial data
- [ ] Amadeus API credentials verified (production mode)
- [ ] Stripe account fully verified
- [ ] Stripe webhooks configured
- [ ] SendGrid domain verified
- [ ] Email templates created
- [ ] reCAPTCHA configured for production domain

### Security Checklist

- [ ] NextAuth secret is strong (32+ characters)
- [ ] Database uses SSL connection
- [ ] All API keys are production keys (not test keys)
- [ ] CORS configured to allow only production domains
- [ ] Rate limiting enabled on all API endpoints
- [ ] Security headers configured (CSP, X-Frame-Options)
- [ ] HTTPS enforced on all routes
- [ ] Password hashing uses bcrypt with 12+ rounds

### Build & Deploy

```bash
# Test build locally
npm run build

# Check for TypeScript errors
npm run type-check

# Run linter
npm run lint

# Test production build
npm start
```

### Post-Deployment

- [ ] Test flight search functionality
- [ ] Test booking flow end-to-end
- [ ] Test payment processing (use Stripe test mode first)
- [ ] Verify email notifications work
- [ ] Test error handling and 404 pages
- [ ] Check mobile responsiveness
- [ ] Run Lighthouse audit (target 90+ performance)
- [ ] Set up monitoring (Sentry, LogRocket)
- [ ] Configure uptime monitoring

## Environment Variable Validation

Add this to your `src/lib/env.ts`:

```typescript
export function validateEnv() {
  const required = [
    'DATABASE_URL',
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL',
    'AMADEUS_CLIENT_ID',
    'AMADEUS_CLIENT_SECRET',
    'STRIPE_SECRET_KEY',
  ];

  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`
    );
  }
}
```

## Monitoring Setup

### Sentry Configuration

```typescript
// sentry.server.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});
```

### Performance Monitoring

- Configure Sentry for performance tracking
- Set up database query monitoring
- Monitor API response times
- Track user errors and crashes

## Backup Strategy

1. **Database Backups**: Daily automated backups
2. **Configuration Backups**: Store `.env` template in secure vault
3. **Disaster Recovery**: Document recovery procedures

## Support & Troubleshooting

### Common Issues

1. **Database Connection Fails**
   - Check DATABASE_URL format
   - Verify firewall rules allow connection
   - Ensure SSL is properly configured

2. **Amadeus API Errors**
   - Verify production credentials
   - Check API quota limits
   - Review rate limiting settings

3. **Stripe Webhook Failures**
   - Verify webhook signature
   - Check endpoint URL is accessible
   - Review webhook event types

4. **Email Delivery Issues**
   - Verify SendGrid domain authentication
   - Check SPF/DKIM records
   - Review sender reputation

---

**Last Updated**: 2025-01-24
**Status**: Ready for Production Deployment
