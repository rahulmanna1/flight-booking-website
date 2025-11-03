# Critical Features Implementation Guide

This guide outlines the critical features being implemented for the flight booking platform, focusing on admin capabilities, API provider abstraction, and analytics.

## ✅ Completed Features

### 1. Database Schema Updates
**Status**: ✅ Complete

Added to `prisma/schema.prisma`:
- `UserRole` enum (USER, ADMIN, SUPER_ADMIN)
- `role` field to User model with index
- `ApiProvider` model for dynamic API provider management
- `ProviderType` enum (AMADEUS, SKYSCANNER, KIWI, SABRE, TRAVELPORT, CUSTOM)
- `SystemConfig` model for global settings
- `AuditLog` model for tracking admin actions
- `AuditCategory` and `AuditSeverity` enums

**Next Step**: Run database migration
```bash
npm run db:generate
npm run db:migrate
```

### 2. API Provider Abstraction Layer
**Status**: ✅ Complete

Created files in `src/lib/providers/`:
- `types.ts` - Provider interfaces and types
- `AmadeusProvider.ts` - Amadeus implementation
- `ProviderFactory.ts` - Factory pattern with fallback support

**Features**:
- Unified interface for all flight APIs
- Automatic fallback when primary provider fails
- Health monitoring and metrics tracking
- Dynamic provider switching via database
- Credentials encryption support

**Usage Example**:
```typescript
import { providerFactory } from '@/lib/providers/ProviderFactory';

// Search flights with automatic fallback
const result = await providerFactory.searchFlights({
  origin: 'NYC',
  destination: 'LON',
  departureDate: '2025-12-01',
  adults: 1,
});

if (result.success) {
  console.log(`Found ${result.data.length} flights from ${result.provider}`);
}
```

## 🚧 In Progress Features

### 3. Admin Middleware & Guards
**Status**: Pending
**Priority**: HIGH

Create `src/middleware/admin.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth-prisma';

export async function adminMiddleware(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const token = authHeader.substring(7);
  const auth = verifyAuth(token);
  
  if (!auth) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
  
  // Check if user is admin
  const user = await prisma.user.findUnique({
    where: { id: auth.userId },
    select: { role: true },
  });
  
  if (!user || !['ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  
  return null; // Allow request
}
```

### 4. Admin API Routes
**Status**: Pending
**Priority**: HIGH

Create admin API endpoints:

#### `/api/admin/providers` - Manage API Providers
```typescript
// GET - List all providers
// POST - Add new provider
// PUT - Update provider
// DELETE - Remove provider
```

#### `/api/admin/providers/[id]/switch` - Switch Primary Provider
```typescript
// POST - Switch active provider
```

#### `/api/admin/providers/health` - Provider Health Check
```typescript
// GET - Get health status of all providers
```

#### `/api/admin/bookings` - Admin Booking Management
```typescript
// GET - Get all bookings with filters
// PUT /[id] - Update booking
// DELETE /[id] - Cancel booking
```

#### `/api/admin/analytics` - Analytics & Reporting
```typescript
// GET /revenue - Revenue metrics
// GET /popular-routes - Most booked routes
// GET /conversion - Conversion rates
```

### 5. Admin Dashboard UI
**Status**: Pending
**Priority**: HIGH

Create `src/app/admin/page.tsx`:
- Overview metrics (bookings, revenue, users)
- API provider status and switching
- Recent bookings table
- Quick actions

Create `src/app/admin/providers/page.tsx`:
- List all API providers
- Health status indicators
- Switch primary provider
- Add/edit provider credentials
- Usage metrics (requests, success rate)

Create `src/app/admin/bookings/page.tsx`:
- Searchable booking list
- Filters (status, date, user, airline)
- Export to CSV
- Bulk actions (cancel, refund)

Create `src/app/admin/analytics/page.tsx`:
- Revenue charts (daily, weekly, monthly)
- Popular routes map
- Booking conversion funnel
- User acquisition metrics

## 📋 Implementation Steps

### Step 1: Database Migration (5 mins)
```bash
cd F:\Flight Booking Project\flight-booking-website\flight-booking-website
npm run db:generate
npm run db:migrate
```

### Step 2: Seed Initial Admin User (10 mins)
Create `prisma/seed-admin.ts`:
```typescript
import { PrismaClient } from '@prisma/client';
import { PrismaAuthService } from '../src/lib/auth-prisma';

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const hashedPassword = await PrismaAuthService.hashPassword('admin123');
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@flightbooker.com' },
    update: {},
    create: {
      email: 'admin@flightbooker.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'SUPER_ADMIN',
    },
  });
  
  console.log('✅ Admin user created:', admin.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

Run: `npx tsx prisma/seed-admin.ts`

### Step 3: Seed Amadeus Provider (10 mins)
Create `prisma/seed-provider.ts`:
```typescript
import { PrismaClient } from '@prisma/client';
import { ProviderFactory } from '../src/lib/providers/ProviderFactory';

const prisma = new PrismaClient();

async function main() {
  const amadeusProvider = await prisma.apiProvider.upsert({
    where: { name: 'amadeus-primary' },
    update: {},
    create: {
      name: 'amadeus-primary',
      displayName: 'Amadeus Travel API',
      provider: 'AMADEUS',
      credentials: ProviderFactory.encryptCredentials({
        clientId: process.env.AMADEUS_CLIENT_ID,
        clientSecret: process.env.AMADEUS_CLIENT_SECRET,
        environment: process.env.AMADEUS_ENVIRONMENT || 'test',
      }),
      environment: process.env.AMADEUS_ENVIRONMENT || 'test',
      isActive: true,
      isPrimary: true,
      priority: 1,
      supportedFeatures: JSON.stringify(['FLIGHT_SEARCH', 'AIRPORT_SEARCH']),
    },
  });
  
  console.log('✅ Amadeus provider configured:', amadeusProvider.displayName);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

Run: `npx tsx prisma/seed-provider.ts`

### Step 4: Update AuthContext for Roles (15 mins)
Update `src/contexts/AuthContext.tsx`:
```typescript
export interface User {
  // ... existing fields
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
}

// Add helper methods
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return {
    ...context,
    isAdmin: context.user?.role === 'ADMIN' || context.user?.role === 'SUPER_ADMIN',
    isSuperAdmin: context.user?.role === 'SUPER_ADMIN',
  };
};
```

### Step 5: Create Admin Middleware (20 mins)
Create `src/lib/middleware/adminAuth.ts` with role checking.

### Step 6: Create Admin API Routes (45 mins)
Implement the API routes listed above.

### Step 7: Create Admin Dashboard UI (60 mins)
Build the admin dashboard pages with components.

## 🎯 Next Priorities After Basic Admin

1. **Real-time Provider Health Monitoring**
   - Background job to check provider health
   - Automatic failover when provider is unhealthy
   - Alert admins when provider goes down

2. **Advanced Analytics**
   - Revenue forecasting
   - Customer segmentation
   - A/B testing for pricing

3. **Booking Management Tools**
   - Bulk operations
   - Automated refunds
   - Customer communication tools

4. **Multi-provider Search**
   - Search all providers simultaneously
   - Aggregate and sort results
   - Show best price across providers

## 🔐 Security Considerations

1. **Admin Access**
   - Use strong passwords for admin accounts
   - Enable 2FA for admin users
   - Log all admin actions in AuditLog

2. **API Credentials**
   - Encrypt all provider credentials
   - Rotate credentials regularly
   - Use environment variables for sensitive data

3. **Rate Limiting**
   - Limit admin API calls
   - Prevent brute force attacks
   - Monitor suspicious activity

## 📊 Monitoring & Observability

1. **Provider Metrics**
   - Track success/failure rates
   - Monitor response times
   - Set up alerts for downtime

2. **Booking Analytics**
   - Track conversion rates
   - Monitor revenue trends
   - Identify popular routes

3. **Audit Logging**
   - Log all admin actions
   - Track provider switches
   - Monitor security events

## 🚀 Deployment Checklist

- [ ] Run database migrations
- [ ] Seed admin user
- [ ] Configure API providers
- [ ] Set environment variables
- [ ] Test provider fallback
- [ ] Test admin authentication
- [ ] Enable audit logging
- [ ] Set up monitoring alerts

## 📞 Support

For questions or issues during implementation, refer to:
- WARP.md for project architecture
- Prisma documentation for database changes
- Next.js documentation for API routes
