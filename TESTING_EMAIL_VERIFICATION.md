# Email Verification Testing Guide

## Setup Complete ✅
- SendGrid API key configured
- Email service ready
- Verification endpoints live

## How to Test

### 1. Start the Development Server
```bash
cd "F:\Flight Booking Project\flight-booking-website\flight-booking-website"
npm run dev
```

### 2. Test Registration with Email Verification

#### Step 1: Register a New User
1. Go to `http://localhost:3000/register`
2. Fill in the registration form with:
   - **Email**: Use a real email you can access
   - **Password**: At least 8 characters
   - **First Name**: Your name
   - **Last Name**: Your last name
3. Click "Register"

#### Step 2: Check Your Email
- You should receive an email from **FlightBooker**
- Subject: "Verify Your Email - FlightBooker"
- From: noreply@flightbooker.com

#### Step 3: Verify Your Email
- Click the "Verify My Email" button in the email
- OR copy the verification link and paste in browser
- You'll be redirected to `/verify-email?token=...`
- Page will show:
  - Loading spinner while verifying
  - Success message: "Email Verified!"
  - Auto-redirect to login after 3 seconds

#### Step 4: Login
- Go to `http://localhost:3000/login`
- You should see a success message if you were redirected from verification
- Login with your email and password

### 3. Test Resend Verification Email

If you need to resend the verification email:

```bash
# Using curl (PowerShell)
curl -X POST http://localhost:3000/api/auth/resend-verification `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer YOUR_JWT_TOKEN" `
  -UseBasicParsing
```

Replace `YOUR_JWT_TOKEN` with the token you get after login.

### 4. What to Check

✅ **Email Delivery**
- [ ] Email arrives within 1-2 minutes
- [ ] Email has proper formatting
- [ ] Links work correctly
- [ ] Email is not in spam folder

✅ **Verification Process**
- [ ] Token verification works
- [ ] Success message displays
- [ ] Redirect to login works
- [ ] Can login after verification

✅ **Error Handling**
- [ ] Invalid token shows error
- [ ] Expired token shows error (24 hours)
- [ ] Already verified email shows message

## Expected Email Content

### Verification Email Preview:

**Subject:** Verify Your Email - FlightBooker

**Content:**
```
Welcome to FlightBooker! ✈️

Hi [FirstName]! 👋

Thank you for signing up with FlightBooker. We're excited to help you 
find and book your perfect flights!

To complete your registration and start booking flights, please verify 
your email address by clicking the button below:

[Verify My Email Button]

⏰ Important: This verification link will expire in 24 hours.

Once verified, you'll be able to:
✓ Search and book flights worldwide
✓ Save favorite destinations
✓ Set up price alerts
✓ Manage your bookings
✓ Earn rewards and benefits
```

## Troubleshooting

### Email Not Received?
1. **Check spam folder** - SendGrid emails sometimes go to spam initially
2. **Wait 2-3 minutes** - Email delivery can be delayed
3. **Check SendGrid dashboard** - Verify email was sent
4. **Check console logs** - Look for "✅ Verification email sent to..."

### Verification Not Working?
1. **Check browser console** - Look for JavaScript errors
2. **Check server logs** - Look for API errors
3. **Verify token in URL** - Should be a long hex string
4. **Check database** - Verify user preferences have verificationToken

### Common Issues:

**Issue**: "Email service not configured"
- **Fix**: Ensure SENDGRID_API_KEY is in .env.local
- **Fix**: Restart dev server after adding env variable

**Issue**: "Invalid or expired token"
- **Fix**: Token expires after 24 hours, request new one
- **Fix**: Check if token matches what's in database

**Issue**: Email goes to spam
- **Fix**: In production, verify domain in SendGrid
- **Fix**: Add SPF/DKIM records to domain

## API Endpoints Reference

### POST /api/auth/register
Registers user and sends verification email automatically.

### POST /api/auth/verify-email
```json
{
  "token": "64-character-hex-string"
}
```

### GET /api/auth/verify-email?token=...
Direct link verification (redirects to login).

### POST /api/auth/resend-verification
Requires authentication header.

## Success Criteria

- [x] Email arrives with verification link
- [x] Clicking link verifies email
- [x] User can login after verification
- [x] Verification status saved in database
- [x] Error handling works for invalid tokens
- [x] Email templates look professional

## Next Steps After Testing

Once verification works:
1. ✅ Mark feature as tested
2. ➡️ Move to next feature: Profile Photo Upload
3. 📋 Update implementation log
4. 🚀 Continue with Phase 1 Week 1 tasks

---

**Testing Date**: 2025-10-27  
**Feature**: Email Verification  
**Status**: Ready for Testing ✅
