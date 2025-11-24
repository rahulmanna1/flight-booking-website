# Multi-Provider Setup Guide

**Version**: 1.0  
**Last Updated**: November 24, 2025

This guide covers how to obtain API keys and configure all flight API providers for the multi-provider flight search system.

---

## Table of Contents

1. [System Requirements](#system-requirements)
2. [Amadeus Setup](#1-amadeus-setup)
3. [Skyscanner Setup](#2-skyscanner-setup)
4. [Kiwi.com Setup](#3-kiwicom-setup)
5. [Database Configuration](#4-database-configuration)
6. [Environment Configuration](#5-environment-configuration)
7. [Provider Initialization](#6-provider-initialization)
8. [Testing & Verification](#7-testing--verification)
9. [Troubleshooting](#8-troubleshooting)

---

## System Requirements

Before setting up providers, ensure you have:

- **Node.js** 18+ installed
- **PostgreSQL** database running
- **Prisma** CLI installed (`npm install -g prisma`)
- **Admin access** to your flight booking application
- **Credit card** (some providers require it for registration)

---

## 1. Amadeus Setup

### Overview
- **Provider**: Amadeus for Developers
- **Best For**: Comprehensive airline data, NDC support, real-time pricing
- **Pricing**: Free tier available (2,000 requests/month)
- **Latency**: ~1.5s average

### Step 1: Register for Amadeus Account

1. Visit [https://developers.amadeus.com/](https://developers.amadeus.com/)
2. Click **"Register"** in the top right
3. Fill out the registration form:
   - Email address
   - Password
   - Company name (or "Personal" for individual use)
   - Country
   - Agree to Terms of Service
4. Verify your email address

### Step 2: Create an Application

1. Log in to the Amadeus Self-Service Portal
2. Navigate to **"My Apps"** → **"Create New App"**
3. Fill out application details:
   - **App Name**: `FlightBooker Production` (or your app name)
   - **Description**: Brief description of your application
   - **APIs**: Select the following:
     - ✅ Flight Offers Search
     - ✅ Airport & City Search
     - ✅ Flight Availabilities Search
4. Click **"Create"**

### Step 3: Get API Credentials

After creating the app:

1. Click on your app name in the **"My Apps"** list
2. You'll see two sets of credentials:
   - **Test Environment** (for development)
   - **Production Environment** (for live use)

**Test Credentials**:
```
API Key: YOUR_TEST_API_KEY
API Secret: YOUR_TEST_API_SECRET
```

**Production Credentials** (requires activation):
```
API Key: YOUR_PROD_API_KEY
API Secret: YOUR_PROD_API_SECRET
```

### Step 4: Configure Environment Variables

Add to your `.env.local` file:

```env
# Amadeus Test Environment
AMADEUS_CLIENT_ID=YOUR_TEST_API_KEY
AMADEUS_CLIENT_SECRET=YOUR_TEST_API_SECRET
AMADEUS_ENVIRONMENT=test

# For production, use:
# AMADEUS_ENVIRONMENT=production
```

### Step 5: Production Activation (Optional)

To activate production access:

1. Go to **"My Apps"** → Select your app
2. Click **"Get Production Key"**
3. Complete the production activation form:
   - Provide business details
   - Describe your use case
   - May require credit card for billing setup
4. Wait for approval (typically 1-2 business days)

### API Endpoints

- **Test**: `https://test.api.amadeus.com`
- **Production**: `https://api.amadeus.com`

### Rate Limits

- **Test**: 2,000 requests/month, 10 req/second
- **Production**: Custom plans starting at $0.01/request

---

## 2. Skyscanner Setup

### Overview
- **Provider**: Skyscanner Travel APIs
- **Best For**: Price comparison, wide coverage, metasearch aggregation
- **Pricing**: Contact for pricing (typically enterprise only)
- **Latency**: ~2.5s average

### Step 1: Apply for API Access

⚠️ **Note**: Skyscanner APIs are currently available only for business partners.

1. Visit [https://developers.skyscanner.net/](https://developers.skyscanner.net/)
2. Click **"Get Started"** or **"Apply for Access"**
3. Fill out the partnership application:
   - Company name
   - Website URL
   - Expected monthly traffic
   - Use case description
   - Contact information
4. Submit application

### Step 2: Partnership Review

- Skyscanner will review your application
- Typical response time: 1-2 weeks
- They may request:
  - Business license/registration
  - Traffic statistics
  - Integration plan
  - Commercial agreement

### Step 3: Receive API Key

Once approved:

1. You'll receive an email with:
   - API Key
   - API documentation link
   - Partner ID (optional)
2. Sign the partnership agreement if required

### Step 4: Configure Environment Variables

Add to your `.env.local` file:

```env
# Skyscanner API
SKYSCANNER_API_KEY=YOUR_SKYSCANNER_API_KEY
```

### API Endpoints

- **Base URL**: `https://partners.api.skyscanner.net/apiservices`
- **Flight Search**: `/v3/flights/live/search/create`
- **Airport Search**: `/v3/autosuggest/flights`

### Rate Limits

- Custom per partnership agreement
- Typical: 10-50 req/second depending on tier

### Alternative for Testing

If you don't have Skyscanner partnership:

1. Use the **RapidAPI** marketplace
2. Search for "Skyscanner" on [https://rapidapi.com/](https://rapidapi.com/)
3. Subscribe to a plan (starting at $0/month for limited requests)
4. Use the RapidAPI key in place of direct Skyscanner API

---

## 3. Kiwi.com Setup

### Overview
- **Provider**: Kiwi.com Tequila API
- **Best For**: Cheap flights, virtual interlining, creative routing
- **Pricing**: Affiliate program (commission-based) or API subscription
- **Latency**: ~2.0s average

### Step 1: Choose Integration Type

Kiwi offers two integration options:

**Option A: Affiliate Program** (Recommended for startups)
- Commission-based (5-10% per booking)
- Lower upfront costs
- Limited API features

**Option B: API Subscription** (For enterprises)
- Monthly subscription fee
- Full API access
- White-label options

### Step 2: Register for Tequila API

1. Visit [https://tequila.kiwi.com/](https://tequila.kiwi.com/)
2. Click **"Sign Up"** or **"Get Started"**
3. Fill out registration:
   - Email
   - Company name
   - Expected monthly volume
   - Integration type preference
4. Submit application

### Step 3: Application Review

- Kiwi will review within 3-5 business days
- They may ask for:
  - Website/app details
  - Traffic projections
  - Business model explanation
  - Payment method (for API subscription)

### Step 4: Receive API Credentials

Once approved, you'll receive:

```
API Key: YOUR_KIWI_API_KEY
Partner ID: YOUR_PARTNER_ID (optional)
```

### Step 5: Configure Environment Variables

Add to your `.env.local` file:

```env
# Kiwi.com Tequila API
KIWI_API_KEY=YOUR_KIWI_API_KEY
KIWI_PARTNER_ID=YOUR_PARTNER_ID
```

### API Endpoints

- **Base URL**: `https://api.tequila.kiwi.com`
- **Flight Search**: `/v2/search`
- **Location Search**: `/locations/query`

### Rate Limits

- **Affiliate**: 1-5 req/second
- **Subscription**: 10-50 req/second depending on plan

### Pricing Tiers

| Tier | Price/Month | Requests | Support |
|------|-------------|----------|---------|
| Startup | $99 | 10,000 | Email |
| Growth | $499 | 100,000 | Priority |
| Enterprise | Custom | Unlimited | Dedicated |

---

## 4. Database Configuration

### Create Provider Records

Once you have API keys, add providers to your database:

```sql
-- Insert Amadeus Provider
INSERT INTO "ApiProvider" (
  "name", 
  "displayName", 
  "provider", 
  "credentials", 
  "environment",
  "isActive",
  "isPrimary",
  "priority",
  "supportedFeatures"
) VALUES (
  'amadeus-primary',
  'Amadeus Travel API',
  'AMADEUS',
  '{"clientId":"YOUR_AMADEUS_CLIENT_ID","clientSecret":"YOUR_AMADEUS_CLIENT_SECRET"}',
  'test',
  true,
  true,
  10,
  '["FLIGHT_SEARCH","AIRPORT_SEARCH","HOTEL_SEARCH"]'
);

-- Insert Skyscanner Provider
INSERT INTO "ApiProvider" (
  "name",
  "displayName",
  "provider",
  "credentials",
  "environment",
  "isActive",
  "isPrimary",
  "priority",
  "supportedFeatures"
) VALUES (
  'skyscanner-partner',
  'Skyscanner',
  'SKYSCANNER',
  '{"apiKey":"YOUR_SKYSCANNER_API_KEY"}',
  'production',
  true,
  false,
  20,
  '["FLIGHT_SEARCH","AIRPORT_SEARCH"]'
);

-- Insert Kiwi Provider
INSERT INTO "ApiProvider" (
  "name",
  "displayName",
  "provider",
  "credentials",
  "environment",
  "isActive",
  "isPrimary",
  "priority",
  "supportedFeatures"
) VALUES (
  'kiwi-tequila',
  'Kiwi.com',
  'KIWI',
  '{"apiKey":"YOUR_KIWI_API_KEY","partnerId":"YOUR_PARTNER_ID"}',
  'production',
  true,
  false,
  30,
  '["FLIGHT_SEARCH","AIRPORT_SEARCH"]'
);
```

**Or** use the Admin Dashboard:
1. Go to `/admin/providers`
2. Click **"Add Provider"**
3. Fill out the form with credentials
4. Click **"Create Provider"**

---

## 5. Environment Configuration

### Complete .env.local File

```env
# ==============================================
# FLIGHT API PROVIDERS
# ==============================================

# Amadeus API Configuration
AMADEUS_CLIENT_ID=your_amadeus_client_id
AMADEUS_CLIENT_SECRET=your_amadeus_client_secret
AMADEUS_ENVIRONMENT=test  # or 'production'

# Skyscanner API Configuration
SKYSCANNER_API_KEY=your_skyscanner_api_key

# Kiwi.com Tequila API Configuration
KIWI_API_KEY=your_kiwi_api_key
KIWI_PARTNER_ID=your_kiwi_partner_id

# Multi-Provider Configuration
ENABLE_MULTI_PROVIDER=false  # Set to 'true' to enable parallel search
DEFAULT_PROVIDER=AMADEUS      # Primary provider fallback
MAX_PARALLEL_PROVIDERS=3      # Max providers to query simultaneously
PROVIDER_TIMEOUT_MS=5000      # Timeout per provider in milliseconds

# ==============================================
# DATABASE
# ==============================================
DATABASE_URL=postgresql://user:password@localhost:5432/flight_booking
```

### Configuration Options Explained

- **ENABLE_MULTI_PROVIDER**: 
  - `false`: Uses only primary provider with automatic failover
  - `true`: Searches all providers in parallel and aggregates results

- **DEFAULT_PROVIDER**: Fallback provider when multi-provider is disabled

- **MAX_PARALLEL_PROVIDERS**: Limits concurrent API calls (recommended: 2-3)

- **PROVIDER_TIMEOUT_MS**: How long to wait for each provider before timing out

---

## 6. Provider Initialization

### Automatic Initialization

The system automatically initializes providers on startup. Check the logs:

```bash
npm run dev
```

Expected output:
```
🔧 Initializing 3 flight API providers...
✅ Provider initialized: Amadeus Travel API
✅ Provider initialized: Skyscanner
✅ Provider initialized: Kiwi.com
🎯 Primary provider set to: Amadeus Travel API
```

### Manual Initialization (if needed)

```typescript
import { providerFactory } from '@/lib/providers/ProviderFactory';

// Initialize all providers
await providerFactory.initializeProviders();

// Get primary provider
const primary = await providerFactory.getPrimaryProvider();
console.log(`Primary provider: ${primary.name}`);
```

---

## 7. Testing & Verification

### Test Individual Providers

#### Test Amadeus

```bash
curl -X GET "https://test.api.amadeus.com/v1/shopping/flight-offers?originLocationCode=JFK&destinationLocationCode=LAX&departureDate=2025-12-01&adults=1" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### Test Skyscanner

```bash
curl -X POST "https://partners.api.skyscanner.net/apiservices/v3/flights/live/search/create" \
  -H "x-api-key: YOUR_SKYSCANNER_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query": {"market": "US", "locale": "en-US", "currency": "USD", "queryLegs": [{"originPlaceId": {"iata": "JFK"}, "destinationPlaceId": {"iata": "LAX"}, "date": {"year": 2025, "month": 12, "day": 1}}], "adults": 1}}'
```

#### Test Kiwi.com

```bash
curl -X GET "https://api.tequila.kiwi.com/v2/search?fly_from=JFK&fly_to=LAX&date_from=01/12/2025&date_to=01/12/2025&adults=1&curr=USD" \
  -H "apikey: YOUR_KIWI_API_KEY"
```

### Test via Admin Dashboard

1. Go to `/admin/providers`
2. Find each provider card
3. Click **"Test Health"** button
4. Verify green checkmark appears

### Test via Application

1. Go to the flight search page
2. Search for flights (e.g., JFK → LAX)
3. Check browser console for provider logs:
   ```
   🔍 Searching flights with Amadeus Travel API...
   ✅ Multi-provider search completed: 45 unique offers from 3 providers
   ```

---

## 8. Troubleshooting

### Common Issues

#### Issue: "Provider not initialized"

**Cause**: Missing or invalid API credentials

**Solution**:
1. Verify credentials in `.env.local`
2. Check database `ApiProvider` table for correct credentials
3. Restart the application: `npm run dev`
4. Check initialization logs

#### Issue: "API key is invalid"

**Cause**: Incorrect API key or expired credentials

**Solution**:
1. Re-copy API key from provider dashboard (no extra spaces)
2. For Amadeus: Regenerate access token
3. For Skyscanner: Check partnership status
4. For Kiwi: Verify subscription is active

#### Issue: "Rate limit exceeded"

**Cause**: Too many requests to provider API

**Solution**:
1. Check rate limits for your plan
2. Increase `PROVIDER_TIMEOUT_MS` to space out requests
3. Reduce `MAX_PARALLEL_PROVIDERS`
4. Contact provider to upgrade plan

#### Issue: "Circuit breaker is OPEN"

**Cause**: Provider has failed 5+ times consecutively

**Solution**:
1. Check provider health in admin dashboard
2. Wait 1 minute for automatic retry (HALF_OPEN state)
3. Test provider health manually
4. Contact provider support if issue persists

#### Issue: "Timeout error"

**Cause**: Provider taking too long to respond

**Solution**:
1. Increase `PROVIDER_TIMEOUT_MS` (default: 5000ms)
2. Check your network connection
3. Verify provider API status page
4. Try again during off-peak hours

### Debug Mode

Enable debug logging:

```env
DEBUG_API_REQUESTS=true
LOG_API_REQUESTS=true
```

View detailed logs:
```bash
npm run dev | grep -i "provider"
```

### Provider Status Pages

- **Amadeus**: https://status.amadeus.com/
- **Skyscanner**: Check partner portal
- **Kiwi.com**: https://status.kiwi.com/

---

## Next Steps

After setting up providers:

1. ✅ Test each provider individually
2. ✅ Enable multi-provider mode (`ENABLE_MULTI_PROVIDER=true`)
3. ✅ Monitor provider performance in admin dashboard
4. ✅ Adjust priorities based on performance/cost
5. ✅ Set up monitoring and alerts

---

## Support

### Provider Support Contacts

- **Amadeus**: https://developers.amadeus.com/support
- **Skyscanner**: partners@skyscanner.net
- **Kiwi.com**: partners@kiwi.com

### Internal Documentation

- [Multi-Provider Architecture](./TASK_1.3_MULTI_PROVIDER_SUMMARY.md)
- [API Documentation](./PROVIDER_API_DOCUMENTATION.md)
- [Troubleshooting Guide](./TROUBLESHOOTING.md)

---

**Document Version**: 1.0  
**Last Updated**: November 24, 2025  
**Maintained By**: Development Team
