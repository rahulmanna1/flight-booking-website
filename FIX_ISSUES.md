# 🔧 Fix Guide - Database & Email Issues

## Issues Found:
1. ❌ Email verification token storage error (FIXED)
2. ❌ Database schema mismatch - missing `seatSelections` column

---

## ✅ Issue 1: Email Verification - FIXED

**Error:**
```
⚠️ Failed to send verification email: Invalid `prisma.user.update()` invocation
```

**Solution:** Updated the code to properly handle Prisma updates.

**Status:** ✅ FIXED - Code has been updated

---

## 🔧 Issue 2: Database Migration Needed

**Error:**
```
The column `bookings.seatSelections` does not exist in the current database.
```

**Cause:** Your database schema is out of sync with the Prisma schema file.

### Solution: Run Database Migration

```powershell
# Stop the dev server first (Ctrl+C)

# Then run these commands:
cd "F:\Flight Booking Project\flight-booking-website\flight-booking-website"

# Generate Prisma client
npm run db:generate

# Push schema changes to database
npm run db:push

# OR run a migration
npm run db:migrate

# Restart dev server
npm run dev
```

### Alternative: Reset Database (if safe to do)
```powershell
# WARNING: This will delete all data!
npm run db:reset

# Then restart
npm run dev
```

---

## 🧪 Test Email Verification Again

After running the migration:

1. **Stop and restart the server**
   ```powershell
   # Press Ctrl+C to stop
   npm run dev
   ```

2. **Register a new user**
   - Go to: http://localhost:3000/register
   - Use a **REAL email** you can access
   - Fill in the form
   - Click Register

3. **Check server logs**
   Look for this message:
   ```
   ✅ Verification email sent to your@email.com
   ```

4. **Check your email**
   - Email should arrive in 1-2 minutes
   - Check spam folder if not in inbox
   - Subject: "Verify Your Email - FlightBooker"

5. **Click verification link**
   - Should redirect to `/verify-email`
   - Should show success message
   - Should auto-redirect to login

---

## 📊 What the Logs Should Show (Success):

```
POST /api/auth/register
prisma:query INSERT INTO "public"."users" ...
✅ Verification email sent to your@email.com
POST /api/auth/register 200 in XXXms
```

---

## ⚠️ Current Issue Analysis

From your logs, I can see:
1. ✅ User registration **works** (user was created)
2. ❌ Email sending **failed** due to Prisma update error (NOW FIXED)
3. ❌ Database query error for bookings (needs migration)
4. ✅ You could login immediately (because error was non-blocking)

---

## 🎯 Quick Fix Steps

### Step 1: Stop Server
```powershell
# Press Ctrl+C in the terminal running npm run dev
```

### Step 2: Update Database
```powershell
npm run db:push
```

Expected output:
```
Your database is now in sync with your Prisma schema.
✔ Generated Prisma Client
```

### Step 3: Restart Server
```powershell
npm run dev
```

### Step 4: Test Registration Again
1. Go to http://localhost:3000/register
2. Use a new email (or different one)
3. Register
4. Check server logs for: `✅ Verification email sent`
5. Check your email inbox

---

## 🐛 If Email Still Doesn't Send

### Check 1: Verify SendGrid API Key
```powershell
# In PowerShell, check if env variable is set
$env:SENDGRID_API_KEY
```

Should show: `SG.P6mjF9r0REW0YH8j8Jiy0A...`

### Check 2: Test SendGrid API Directly
```powershell
# Test with curl
curl -X POST https://api.sendgrid.com/v3/mail/send `
  -H "Authorization: Bearer YOUR_SENDGRID_API_KEY" `
  -H "Content-Type: application/json" `
  -d '{
    "personalizations": [{"to": [{"email": "your@email.com"}]}],
    "from": {"email": "noreply@flightbooker.com"},
    "subject": "Test",
    "content": [{"type": "text/plain", "value": "Test email"}]
  }'
```

### Check 3: Verify Email Domain
- SendGrid requires sender verification
- Go to: https://app.sendgrid.com/settings/sender_auth
- Verify your sender email address

---

## 📋 Checklist Before Testing

- [ ] Server stopped (Ctrl+C)
- [ ] Database migrated (`npm run db:push`)
- [ ] Server restarted (`npm run dev`)
- [ ] No errors in terminal startup
- [ ] SendGrid API key in .env.local
- [ ] Using a real, accessible email address

---

## ✅ Success Indicators

You'll know it works when you see:

1. **In Terminal:**
   ```
   ✅ Verification email sent to your@email.com
   POST /api/auth/register 200 in XXXms
   ```

2. **In Email Inbox:**
   - Beautiful HTML email from FlightBooker
   - "Verify My Email" button
   - Professional formatting

3. **After Clicking Link:**
   - Redirected to `/verify-email?token=...`
   - Success message displayed
   - Auto-redirect to login

---

## 🆘 Need Help?

If issues persist:
1. Share the **complete server logs** after registration
2. Check **SendGrid Activity** dashboard
3. Verify **email address** is real and accessible
4. Try with a **different email** address

---

**Last Updated:** 2025-10-27  
**Status:** Issues Identified & Fixed  
**Next Step:** Run database migration and test again
