# Error Logging System Guide

## 📋 Overview

The flight booking system includes a comprehensive error logging system with:

- ✅ **Structured logging** with context and metadata
- ✅ **Multiple log levels** (Debug, Info, Warning, Error, Critical)
- ✅ **Sentry integration** (optional, for production)
- ✅ **Audit logging** for critical errors
- ✅ **Console logging** with color coding
- ✅ **File logging** (development only)
- ✅ **Request context** capture
- ✅ **Automatic error handling** middleware

---

## 🚀 Quick Start

### Basic Usage

```typescript
import { logError, logWarning, logInfo } from '@/lib/services/errorLogger';

// Log an error
try {
  await processBooking(bookingId);
} catch (error) {
  logError('Failed to process booking', error, { bookingId });
  throw error; // Re-throw if needed
}

// Log a warning
logWarning('Payment gateway slow response', undefined, {
  gateway: 'stripe',
  duration: 5000,
});

// Log info
logInfo('Booking created successfully', {
  bookingId: 'abc123',
  userId: 'user456',
});
```

### With API Routes

```typescript
import { withErrorHandler, ValidationError, NotFoundError } from '@/lib/middleware/errorHandler';

export const GET = withErrorHandler(async (request) => {
  const { searchParams } = new URL(request.url);
  const bookingId = searchParams.get('id');

  if (!bookingId) {
    throw new ValidationError('Booking ID is required');
  }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
  });

  if (!booking) {
    throw new NotFoundError('Booking not found');
  }

  return NextResponse.json({ success: true, data: booking });
}, {
  component: 'BookingAPI',
  logErrors: true,
});
```

---

## 📊 Log Levels

### 1. **DEBUG** 🔍
Development-only detailed information.

```typescript
import { logDebug } from '@/lib/services/errorLogger';

logDebug('Cache hit for flight search', {
  searchKey: 'JFK-LAX-2025-01-15',
  cacheAge: 120,
});
```

### 2. **INFO** ℹ️
General informational messages.

```typescript
import { logInfo } from '@/lib/services/errorLogger';

logInfo('User login successful', {
  userId: 'user123',
  method: 'email',
});
```

### 3. **WARNING** ⚠️
Something unusual but not critical.

```typescript
import { logWarning } from '@/lib/services/errorLogger';

logWarning('Flight search returned no results', undefined, {
  origin: 'JFK',
  destination: 'XYZ',
  date: '2025-01-15',
});
```

### 4. **ERROR** ❌
Something went wrong.

```typescript
import { logError } from '@/lib/services/errorLogger';

logError('Payment failed', error, {
  bookingId: 'book123',
  amount: 599.99,
  gateway: 'stripe',
});
```

### 5. **CRITICAL** 🚨
System failure requiring immediate attention.

```typescript
import { logCritical } from '@/lib/services/errorLogger';

logCritical('Database connection lost', error, {
  database: 'production',
  attemptedReconnects: 3,
});
```

---

## 🎯 Context Types

### User Context
```typescript
{
  userId: 'user123',
  userEmail: 'user@example.com',
  userRole: 'ADMIN',
}
```

### Request Context
```typescript
{
  url: '/api/bookings',
  method: 'POST',
  statusCode: 400,
  ip: '192.168.1.1',
  userAgent: 'Mozilla/5.0...',
}
```

### Business Context
```typescript
{
  bookingId: 'book123',
  flightId: 'FL456',
  paymentId: 'pay789',
  orderId: 'ord321',
}
```

### Technical Context
```typescript
{
  component: 'BookingService',
  function: 'createBooking',
  line: 142,
}
```

---

## 🛠️ Error Types

The system includes custom error types for common scenarios:

### ValidationError (400)
```typescript
throw new ValidationError('Email is required');
```

### NotFoundError (404)
```typescript
throw new NotFoundError('Booking not found');
```

### UnauthorizedError (401)
```typescript
throw new UnauthorizedError('Invalid credentials');
```

### ForbiddenError (403)
```typescript
throw new ForbiddenError('Admin access required');
```

### ConflictError (409)
```typescript
throw new ConflictError('Booking already exists');
```

### RateLimitError (429)
```typescript
throw new RateLimitError('Too many requests');
```

### ExternalServiceError (502)
```typescript
throw new ExternalServiceError('Amadeus API unavailable');
```

---

## 📝 API Route Examples

### Example 1: Simple GET with Error Handling

```typescript
import { withErrorHandler, NotFoundError } from '@/lib/middleware/errorHandler';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const GET = withErrorHandler(async (request, { params }) => {
  const booking = await prisma.booking.findUnique({
    where: { id: params.id },
  });

  if (!booking) {
    throw new NotFoundError('Booking not found');
  }

  return NextResponse.json({ success: true, data: booking });
}, {
  component: 'BookingAPI',
});
```

### Example 2: POST with Validation

```typescript
import { withErrorHandler, ValidationError, requireAuth } from '@/lib/middleware/errorHandler';
import { verifyToken } from '@/lib/auth';
import { z } from 'zod';

const createBookingSchema = z.object({
  flightId: z.string(),
  passengers: z.array(z.object({
    firstName: z.string(),
    lastName: z.string(),
  })),
});

export const POST = withErrorHandler(async (request) => {
  // Authenticate
  const token = request.headers.get('authorization')?.split(' ')[1];
  const user = await verifyToken(token);
  requireAuth(user);

  // Validate body
  const body = await request.json();
  const validatedData = createBookingSchema.parse(body);

  // Create booking
  const booking = await prisma.booking.create({
    data: {
      userId: user.id,
      ...validatedData,
    },
  });

  return NextResponse.json({ success: true, data: booking });
}, {
  component: 'BookingAPI',
});
```

### Example 3: External API Call with Error Handling

```typescript
import { withErrorHandler, ExternalServiceError } from '@/lib/middleware/errorHandler';
import { logError } from '@/lib/services/errorLogger';

export const GET = withErrorHandler(async (request) => {
  try {
    const response = await fetch('https://api.amadeus.com/v2/shopping/flight-offers', {
      headers: { Authorization: `Bearer ${amadeusToken}` },
    });

    if (!response.ok) {
      throw new ExternalServiceError('Amadeus API returned an error');
    }

    const data = await response.json();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    logError('Amadeus API call failed', error, {
      service: 'amadeus',
      endpoint: '/v2/shopping/flight-offers',
    });
    throw new ExternalServiceError('Failed to fetch flight offers');
  }
}, {
  component: 'FlightSearchAPI',
});
```

---

## 🔧 Advanced Features

### 1. Wrap Functions with Error Logging

```typescript
import { withErrorLogging } from '@/lib/services/errorLogger';

const processPayment = withErrorLogging(
  async (bookingId: string, amount: number) => {
    // Payment logic
    return paymentResult;
  },
  'processPayment',
  'PaymentService'
);

// Errors in processPayment are automatically logged
```

### 2. Create Request Context

```typescript
import { createContextFromRequest } from '@/lib/services/errorLogger';

export async function POST(request: Request) {
  const context = createContextFromRequest(request, {
    component: 'BookingAPI',
    bookingId: 'book123',
  });

  logError('Failed to create booking', error, context);
}
```

### 3. Safe Error Message Extraction

```typescript
import { getErrorMessage } from '@/lib/services/errorLogger';

try {
  // code
} catch (error) {
  const message = getErrorMessage(error); // Safe extraction
  return { error: message };
}
```

### 4. Check Expected Errors

```typescript
import { isExpectedError } from '@/lib/services/errorLogger';

try {
  // code
} catch (error) {
  if (isExpectedError(error)) {
    // Handle gracefully (validation, not found, etc.)
  } else {
    // Unexpected error - alert admins
    logCritical('Unexpected error', error);
  }
}
```

---

## 🌐 Sentry Integration (Production)

### Step 1: Install Sentry

```bash
npm install @sentry/nextjs
```

### Step 2: Configure Environment

Add to `.env.local`:
```env
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
SENTRY_ORG=your-organization
SENTRY_PROJECT=flight-booking-system
NODE_ENV=production
```

### Step 3: Enable Sentry in Error Logger

Edit `src/lib/services/errorLogger.ts`, uncomment the Sentry initialization code (lines 100-117):

```typescript
const Sentry = require('@sentry/nextjs');

Sentry.init({
  dsn: sentryDsn,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
  debug: false,
  integrations: [
    new Sentry.BrowserTracing(),
    new Sentry.Replay(),
  ],
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});

SentryClient = Sentry;
```

### Step 4: Initialize Sentry Config Files

Run:
```bash
npx @sentry/wizard@latest -i nextjs
```

---

## 📈 Monitoring & Alerts

### View Error Logs

**In Development:**
- Console output with color coding
- Optional file logs in `/logs` directory (set `LOG_TO_FILE=true`)

**In Production:**
- Sentry dashboard (https://sentry.io)
- Database audit logs (`/api/admin/audit-logs`)

### Critical Error Alerts

Critical errors (`logCritical`) are automatically:
1. Logged to console
2. Sent to Sentry (if configured)
3. Saved to audit log database
4. Can trigger email/Slack notifications (configure in audit service)

---

## 🔐 Security Best Practices

### 1. Don't Log Sensitive Data

```typescript
// ❌ BAD
logError('Payment failed', error, {
  cardNumber: '4242-4242-4242-4242',
  cvv: '123',
});

// ✅ GOOD
logError('Payment failed', error, {
  paymentMethod: 'card',
  last4: '4242',
  gateway: 'stripe',
});
```

### 2. Sanitize User Input

```typescript
logError('Search failed', error, {
  searchTerm: sanitize(userInput), // Sanitize before logging
});
```

### 3. Don't Expose Stack Traces in Production

Stack traces are only included in development mode. In production, use Sentry to view full error details.

---

## 🧪 Testing Error Logging

### Test Development Logging

```typescript
// In any API route or function
import { logError, logWarning, logInfo } from '@/lib/services/errorLogger';

logInfo('Test info log');
logWarning('Test warning log');
logError('Test error log', new Error('Test error'));
```

### Test Error Handler

Create a test API route:

```typescript
// src/app/api/test-error/route.ts
import { withErrorHandler, ValidationError } from '@/lib/middleware/errorHandler';

export const GET = withErrorHandler(async (request) => {
  throw new ValidationError('This is a test error');
}, {
  component: 'TestAPI',
});
```

Visit: `http://localhost:3000/api/test-error`

---

## 📊 Environment Variables

```env
# Error Logging Configuration
NODE_ENV=production                    # 'development' or 'production'
LOG_TO_FILE=false                      # Enable file logging (dev only)
LOG_API_REQUESTS=true                  # Log all API requests
LOG_ALL_REQUESTS=false                 # Log even 200 OK responses
DEBUG_MODE=false                       # Enable debug logs

# Sentry (Production)
SENTRY_DSN=https://...@sentry.io/...   # Sentry DSN
SENTRY_ORG=your-org                    # Sentry organization
SENTRY_PROJECT=flight-booking          # Sentry project
```

---

## 🎯 Migration Guide

### Update Existing API Routes

**Before:**
```typescript
export async function GET(request: Request) {
  try {
    const data = await fetchData();
    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
```

**After:**
```typescript
import { withErrorHandler } from '@/lib/middleware/errorHandler';

export const GET = withErrorHandler(async (request) => {
  const data = await fetchData();
  return NextResponse.json({ success: true, data });
}, {
  component: 'DataAPI',
});
```

### Update Service Functions

**Before:**
```typescript
async function processBooking(id: string) {
  try {
    // logic
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}
```

**After:**
```typescript
import { logError } from '@/lib/services/errorLogger';

async function processBooking(id: string) {
  try {
    // logic
  } catch (error) {
    logError('Failed to process booking', error, { bookingId: id });
    throw error;
  }
}
```

---

## 📚 Summary

✅ **Error Logger** (`src/lib/services/errorLogger.ts`)
- Structured logging with context
- Multiple log levels
- Sentry integration support
- Audit logging for critical errors

✅ **Error Handler** (`src/lib/middleware/errorHandler.ts`)
- Automatic error handling for API routes
- Custom error types
- Consistent error responses
- Validation helpers

✅ **Best Practices**
- Use appropriate log levels
- Include context with logs
- Don't log sensitive data
- Use custom error types
- Wrap API routes with `withErrorHandler`

---

**Status**: ✅ Production Ready  
**Next**: Integrate with existing API routes and deploy to production with Sentry
