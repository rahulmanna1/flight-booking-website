# 🚨 Authentication Fix Guide

## Current Issue
Your live site https://flight-booking-website-khaki.vercel.app has broken signup/signin because:
1. **SQLite database doesn't work on Vercel** (serverless environment)
2. **Missing environment variables** in production
3. **Prisma client not properly generated** during build

## 🎯 URGENT FIX Required

### Step 1: Set up Production Database (5 minutes)

**Option A: Neon PostgreSQL (Recommended - Free)**
1. Go to [neon.tech](https://neon.tech) 
2. Sign up with GitHub
3. Create new project → Copy connection string
4. It looks like: `postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require`

**Option B: Vercel Postgres (Alternative)**
1. In Vercel dashboard → Storage → Create Database
2. Choose Postgres → Copy connection string

### Step 2: Update Vercel Environment Variables (CRITICAL)

**In Vercel Dashboard:**
1. Go to your project → Settings → Environment Variables
2. Add these **REQUIRED** variables:

```bash
# 🔴 CRITICAL - Database Connection
DATABASE_URL=postgresql://your-connection-string-from-step-1

# 🔴 CRITICAL - JWT Secret for Authentication  
JWT_SECRET=your-super-secure-jwt-secret-key-change-this-in-production-12345

# ✅ Optional - Amadeus API (already working)
AMADEUS_CLIENT_ID=GSxSppcd1E6wN1ltEuRRgubZHw6oyyMl
AMADEUS_CLIENT_SECRET=3sL74ukSwW08AtAX
AMADEUS_ENVIRONMENT=test

# 🔧 Build Configuration
NODE_ENV=production
VERCEL=1
```

### Step 3: Update Database Schema

**Run this locally and push:**
```bash
# Update schema for PostgreSQL
npx prisma db push

# Commit and push
git add .
git commit -m "fix: Update database for production"
git push origin main
```

### Step 4: Trigger Redeploy

1. In Vercel → Deployments → Click "Redeploy" on latest
2. OR push a small change to trigger auto-deploy

## 🧪 Test After Fix

1. **Register**: https://flight-booking-website-khaki.vercel.app/register
2. **Login**: https://flight-booking-website-khaki.vercel.app/login
3. **Test Data**:
   - Email: `test@example.com`
   - Password: `Test123!@#`

## 🐛 Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| "Prisma Client not found" | Check DATABASE_URL in Vercel |
| "JWT error" | Check JWT_SECRET is set |
| "Database connection failed" | Verify PostgreSQL connection string |
| Build fails | Check Vercel function logs |

## 🔧 Quick Alternative: Mock Auth

If you need authentication working IMMEDIATELY for demo:

```javascript
// Can implement in-memory auth (no database needed)
// This bypasses all database requirements
```

## 💡 Why This Happened

- **SQLite works locally** but not on serverless (Vercel)
- **Environment variables** weren't set in production
- **Build process** didn't generate Prisma client properly

## ✅ After Fix Checklist

- [ ] Database connection string added to Vercel
- [ ] JWT_SECRET added to Vercel
- [ ] App redeployed successfully
- [ ] Registration form works
- [ ] Login form works
- [ ] User session persists

**Need help?** The authentication system is fully built - just needs database connection!
