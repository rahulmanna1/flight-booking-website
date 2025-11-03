# 🚀 Quick Setup Guide - Flight Booking Website

This guide will help you get your flight booking website up and running in minutes.

---

## ✅ Step 1: Install Dependencies

```powershell
npm install
```

---

## ⚙️ Step 2: Configure Environment Variables

### 2.1 Copy the Example File
```powershell
copy .env.example .env.local
```

### 2.2 Add Required Variables

Open `.env.local` and fill in the following:

#### Database (REQUIRED)
Choose one of these providers:
- **Neon** (Recommended): https://neon.tech
- **Vercel Postgres**: https://vercel.com/storage/postgres
- **Supabase**: https://supabase.com

```bash
DATABASE_URL="postgresql://username:password@host:port/database?schema=public"
```

#### Authentication (REQUIRED)
```bash
# Generate random strings using:
# Node: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Or: https://generate-secret.vercel.app/32

NEXTAUTH_SECRET="your-secret-here-min-32-chars"
JWT_SECRET="another-secret-here-min-32-chars"
NEXTAUTH_URL="http://localhost:3000"
```

#### Flight API (OPTIONAL - Works Without)
Without this, the app will use mock flight data:
```bash
AMADEUS_CLIENT_ID="your-amadeus-client-id"
AMADEUS_CLIENT_SECRET="your-amadeus-client-secret"
AMADEUS_ENVIRONMENT="test"
```
Sign up at: https://developers.amadeus.com

#### Payment (OPTIONAL - For Testing)
```bash
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```
Sign up at: https://stripe.com

#### Email (OPTIONAL - For Notifications)
```bash
SENDGRID_API_KEY="SG...."
FROM_EMAIL="noreply@yoursite.com"
```
Sign up at: https://sendgrid.com

#### File Upload (OPTIONAL - For Avatars)
```bash
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```
Sign up at: https://cloudinary.com

---

## 🗄️ Step 3: Setup Database

### 3.1 Generate Prisma Client
```powershell
npm run db:generate
```

### 3.2 Push Database Schema
```powershell
npm run db:push
```

### 3.3 Seed Airport Data (Optional)
```powershell
npm run db:seed
```

---

## 🚀 Step 4: Start Development Server

```powershell
npm run dev
```

Your app will be running at: http://localhost:3000

---

## 🧪 Step 5: Test the Application

### Test Flight Search
1. Go to http://localhost:3000
2. You'll be redirected to http://localhost:3000/search
3. Enter origin and destination (e.g., JFK → LAX)
4. Select dates and passengers
5. Click "Search Flights"

**Note:** Without Amadeus API credentials, the app will automatically use mock flight data.

### Test Authentication (Requires Database)
1. Click "Login" or "Register"
2. Create a test account
3. Check that you can log in
4. Try updating your profile

### Test Booking Flow (Requires Database)
1. Search for flights
2. Select a flight
3. Enter passenger details
4. (Payment will require Stripe configuration)

---

## 🔧 Common Issues & Solutions

### Issue: "DATABASE_URL not found"
**Solution:** Make sure you created `.env.local` and added `DATABASE_URL`

### Issue: "Prisma Client not found"
**Solution:** Run `npm run db:generate`

### Issue: "No flights found"
**Solution:** This is normal without Amadeus API. The app will show mock data.

### Issue: "Port 3000 already in use"
**Solution:** Either stop the process using port 3000 or use a different port:
```powershell
$env:PORT=3001; npm run dev
```

### Issue: TypeScript errors
**Solution:** All TypeScript errors have been fixed. Run:
```powershell
npm run type-check
```

### Issue: Build fails
**Solution:** Make sure all dependencies are installed:
```powershell
rm -rf node_modules package-lock.json
npm install
npm run build
```

---

## 📋 Minimal Setup (Just to Run)

If you just want to see the app running with minimal configuration:

```powershell
# 1. Install dependencies
npm install

# 2. Create .env.local with ONLY these (use any random strings):
# DATABASE_URL="postgresql://..." (get from neon.tech - free tier)
# NEXTAUTH_SECRET="any-random-string-min-32-characters-long-123456"
# JWT_SECRET="another-random-string-32-chars-minimum-abcdef"
# NEXTAUTH_URL="http://localhost:3000"

# 3. Setup database
npm run db:generate
npm run db:push

# 4. Start server
npm run dev
```

---

## 🎯 What Works Without External APIs

### ✅ WORKS (With just database):
- Flight search (with mock data)
- User registration and login
- Profile management
- Booking creation (without payment)
- Dashboard and booking history
- Price alerts (without email)
- All UI components and pages

### ⚠️ NEEDS API (Optional):
- Real flight data (Amadeus)
- Payment processing (Stripe)
- Email notifications (SendGrid)
- Avatar uploads (Cloudinary)

---

## 📊 Verify Setup

Run these commands to verify everything is working:

```powershell
# Check TypeScript (should show no errors)
npm run type-check

# Check for lint issues (warnings are OK)
npm run lint

# Build for production (should succeed)
npm run build
```

All checks should pass! ✅

---

## 🔐 Generate Secure Secrets

### Using Node.js:
```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Using PowerShell:
```powershell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

### Using Online Tool:
https://generate-secret.vercel.app/32

---

## 📱 Testing on Mobile

### Option 1: Use Your Local IP
1. Find your IP: `ipconfig` (look for IPv4 Address)
2. Update `.env.local`: `NEXTAUTH_URL="http://YOUR-IP:3000"`
3. Access from mobile: `http://YOUR-IP:3000`

### Option 2: Use ngrok
```powershell
# Install ngrok: https://ngrok.com/
ngrok http 3000
```

---

## 🎨 Customization

### Change Colors
Edit `src/app/globals.css` and look for color variables

### Change Logo/Branding
Replace files in `public/` directory

### Modify Flight Search
Edit `src/components/forms/SearchForm.tsx`

### Change Mock Flight Data
Edit `src/lib/mockFlights.ts`

---

## 🆘 Getting Help

### Check Logs
The console will show detailed error messages. Look for:
- Database connection errors
- API errors
- Authentication issues

### Debug Mode
Add this to `.env.local` for more detailed logs:
```bash
NODE_ENV=development
DEBUG=true
```

### Common Error Messages

**"Invalid `prisma.xxx.findMany()` invocation"**
→ Database not connected or schema not pushed

**"Cannot read properties of undefined"**
→ Missing environment variable

**"fetch failed"**
→ API endpoint not reachable or credentials invalid

---

## ✅ Success Checklist

- [ ] `npm install` completed without errors
- [ ] `.env.local` created with required variables
- [ ] `npm run db:generate` succeeded
- [ ] `npm run db:push` succeeded
- [ ] `npm run dev` starts without errors
- [ ] Can access http://localhost:3000
- [ ] Can see search form
- [ ] Can search for flights (mock data OK)
- [ ] Can register a new account
- [ ] Can login successfully

---

## 🚀 Ready for Production?

See `PRODUCTION_READINESS_AUDIT.md` for a complete checklist of what's needed for production deployment.

---

**Need More Help?**
- Check `PRODUCTION_READINESS_AUDIT.md` for detailed documentation
- Check `README.md` for project overview
- Check `TROUBLESHOOTING.md` (if available)

**Last Updated:** 2025-11-01
