# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

A full-stack flight booking platform built with **Next.js 15**, **TypeScript**, **Prisma ORM**, and **PostgreSQL**. The application integrates with the Amadeus Travel API for real-time flight data and uses Stripe for payment processing.

## Development Commands

### Essential Commands
```bash
# Development server with Turbopack
npm run dev

# Production build (includes Prisma client generation)
npm run build

# Clean build (Windows-specific)
npm run build:clean

# Start production server
npm start
```

### Code Quality
```bash
# Run ESLint
npm run lint

# Type checking (recommended before committing)
npm run type-check

# Strict type checking
npm run type-check:strict
```

### Database Operations
```bash
# Generate Prisma client (required after schema changes)
npm run db:generate

# Push schema changes to DB (development)
npm run db:push

# Create and run migrations
npm run db:migrate

# Deploy migrations (production)
npm run db:migrate:deploy

# Reset database (WARNING: destructive)
npm run db:reset

# Seed database with sample data
npm run db:seed

# Open Prisma Studio (database GUI)
npm run db:studio
```

## Architecture Overview

### Tech Stack
- **Framework**: Next.js 15 with App Router and Turbopack
- **Language**: TypeScript (strict mode)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT-based auth with bcrypt password hashing
- **Payment**: Stripe integration (PCI compliant)
- **Styling**: Tailwind CSS v4
- **External APIs**: Amadeus Travel API (flight search), SendGrid (emails), Cloudinary (images)

### Key Architectural Patterns

#### 1. Database Layer
- **Location**: `prisma/schema.prisma`
- All models use JSON fields for flexible data structures (e.g., `flightData`, `passengers`, `pricing`)
- Enums for structured data: `BookingStatus`, `TripType`, `CabinClass`, `DiscountType`, etc.
- User preferences, flight details, passenger info, and pricing are stored as serialized JSON
- Important: Run `npm run db:generate` after any schema changes

#### 2. Authentication Flow
- **Context**: `src/contexts/AuthContext.tsx`
- **Service**: `src/lib/auth-prisma.ts`
- **Middleware**: `src/middleware.ts`
- JWT tokens stored in localStorage (key: `auth_token`)
- Protected routes validated via middleware
- User model includes preferences, frequent flyer numbers (JSON fields)
- Token generation uses 7-day expiry
- Password hashing: bcrypt with 12 salt rounds

#### 3. API Route Structure
- **Pattern**: `src/app/api/[resource]/route.ts`
- All API routes follow Next.js 15 App Router conventions
- Authentication via `Authorization: Bearer <token>` header
- Rate limiting and security validation for sensitive operations
- CAPTCHA verification for booking creation (configurable via `DISABLE_CAPTCHA_DEV`)

#### 4. Context Providers Architecture
- **Root Provider**: `src/components/providers/ClientProviders.tsx`
- Multiple context providers for state management:
  - `AuthContext`: User authentication and session
  - `BookingContext`: Booking flow state
  - `PaymentContext`: Payment processing
  - `PriceAlertContext`: Flight price monitoring
  - `CurrencyContext`: Multi-currency support
  - `AdvancedSearchContext`: Complex search state
- All providers wrapped in single client component for optimal hydration

#### 5. Booking Flow
- **Component**: `src/components/booking/BookingFlow.tsx`
- Multi-step process: Seats → Passengers → Payment → Confirmation
- State management includes:
  - Seat selections (with pricing per seat)
  - Passenger details (adults, children, infants)
  - Contact information
  - Payment data (card details, billing address)
- Booking reference generation (6-character alphanumeric)
- Tax calculation: 12% tax rate + $25 base fee per passenger

#### 6. Airport Database & Search
- **Fallback DB**: `src/lib/airportDatabase.ts`
- Comprehensive airport data with coordinates for geolocation
- Primary source: Amadeus API
- Fallback: Local database (~50+ airports)
- Search includes fuzzy matching and nearby airport detection

### Environment Configuration

#### Required Variables
```bash
# Database
DATABASE_URL=postgresql://...

# Authentication
JWT_SECRET=<32+ character string>
NEXTAUTH_SECRET=<32+ character string>
NEXTAUTH_URL=http://localhost:3000

# Amadeus API (flight search)
AMADEUS_CLIENT_ID=...
AMADEUS_CLIENT_SECRET=...
AMADEUS_ENVIRONMENT=test|production

# Stripe (payments)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# SendGrid (emails)
SENDGRID_API_KEY=SG...
SENDGRID_FROM_EMAIL=noreply@domain.com

# Cloudinary (images)
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

#### Development Shortcuts
```bash
# Skip CAPTCHA in development
DISABLE_CAPTCHA_DEV=true

# Debug flags
DEBUG_API_REQUESTS=false
DEBUG_BOOKING_FLOW=false
```

See `.env.example` for complete configuration template.

### Path Aliases
- `@/*` maps to `src/*` (configured in `tsconfig.json`)
- Always use path aliases for imports: `@/components`, `@/lib`, `@/contexts`

## Important Patterns & Conventions

### 1. Authentication Requirements
When making authenticated API calls:
```typescript
const token = localStorage.getItem('auth_token');
const response = await fetch('/api/endpoint', {
  headers: {
    'Authorization': `Bearer ${token}`,
  },
});
```

### 2. Database JSON Fields
When working with Prisma models that use JSON fields:
```typescript
// Reading
const preferences = JSON.parse(user.preferences);

// Writing
await prisma.user.update({
  where: { id },
  data: {
    preferences: JSON.stringify(preferencesObject),
  },
});
```

### 3. Error Handling in API Routes
Follow the established pattern for consistent error responses:
```typescript
return NextResponse.json(
  { success: false, error: 'Error message' },
  { status: 400 }
);
```

### 4. Type Safety with Prisma
- Always regenerate Prisma client after schema changes: `npm run db:generate`
- Import types from Prisma: `import { User, Booking } from '@prisma/client'`
- Use TypeScript interfaces in `@/contexts` for frontend types

### 5. Security Considerations
- All booking operations include rate limiting
- CAPTCHA validation on booking creation (production)
- Password reset tokens have expiry (`resetTokenExpiry` in User model)
- Sensitive payment data stored as encrypted JSON
- Never log or expose JWT_SECRET, API keys, or payment details

## Testing & Deployment

### Pre-Deployment Checklist
1. Run type checking: `npm run type-check`
2. Run linter: `npm run lint`
3. Test database migrations: `npm run db:migrate`
4. Verify all environment variables are set
5. Ensure Prisma client is generated: `npm run db:generate`

### Database Migration Strategy
- Development: Use `npm run db:push` for rapid iteration
- Production: Always use `npm run db:migrate` for tracked migrations
- Deploy migrations: `npm run db:migrate:deploy` (production)

### Common Gotchas
- **Windows-specific**: Build clean script uses `rmdir /s /q` (Windows syntax)
- **Prisma Client**: Must regenerate after schema changes or deployment
- **Environment Variables**: `NEXT_PUBLIC_*` prefix required for client-side access
- **Authentication**: Token validation in middleware runs on every protected route
- **JSON Fields**: Always parse/stringify when reading/writing to database

## Key Files to Understand

### Configuration
- `prisma/schema.prisma` - Complete database schema with relationships
- `tsconfig.json` - TypeScript configuration with path aliases
- `.env.example` - Comprehensive environment variable template

### Core Architecture
- `src/app/layout.tsx` - Root layout with providers and metadata
- `src/components/providers/ClientProviders.tsx` - Context provider orchestration
- `src/middleware.ts` - Route protection and authentication
- `src/lib/auth-prisma.ts` - Authentication service layer
- `src/contexts/AuthContext.tsx` - Client-side auth state management

### Business Logic
- `src/components/booking/BookingFlow.tsx` - Complete booking process
- `src/app/api/bookings/route.ts` - Booking API with security validation
- `src/lib/airportDatabase.ts` - Airport data and search fallback
- `src/services/BookingService.ts` - Booking business logic

## Development Notes

- The project uses **Turbopack** for faster development builds (`npm run dev`)
- **Strict TypeScript** is enforced; use `npm run type-check:strict` for maximum type safety
- All React components use **'use client'** directive when needed (Next.js App Router)
- Database uses **PostgreSQL**; ensure it's running before starting the app
- **Windows compatibility**: Some scripts use Windows-specific commands (e.g., `rmdir`)
