# 🚀 Quick Test Guide - Email Verification

## ✅ Setup Complete!
SendGrid API key is configured and ready to use.

## 🧪 Test in 4 Simple Steps:

### 1️⃣ Start the Server
```powershell
cd "F:\Flight Booking Project\flight-booking-website\flight-booking-website"
npm run dev
```

### 2️⃣ Register a New User
- Go to: http://localhost:3000/register
- Use a **REAL email** you can access
- Fill in all required fields
- Click "Register"

### 3️⃣ Check Your Email
- Look for email from **FlightBooker** 
- Subject: "Verify Your Email - FlightBooker"
- Check **spam folder** if not in inbox
- **Wait 1-2 minutes** for delivery

### 4️⃣ Click Verification Link
- Click the "Verify My Email" button
- You'll see success message
- Auto-redirect to login
- Login with your credentials

---

## 📧 What You'll See in the Email

**Beautiful HTML email with:**
- ✈️ FlightBooker branding
- 🎨 Professional gradient header
- 🔘 Big blue verification button
- ⏰ 24-hour expiration notice
- ✅ List of features you'll unlock

**Plain text fallback** for older email clients

---

## 🔍 What to Watch For

### In Terminal/Console:
```
✅ Verification email sent to your@email.com
```

### In Browser Console:
- No JavaScript errors
- Successful verification message
- Redirect working

### In Email:
- Professional formatting
- All links working
- Images loading (if any)

---

## ⚠️ Troubleshooting

**Email not arriving?**
- Check spam/junk folder
- Wait 2-3 minutes
- Check SendGrid dashboard
- Look for server errors in terminal

**Can't click verification link?**
- Copy the full URL from email
- Paste in browser manually
- Check if link is complete

**"Email service not configured" error?**
- Restart dev server: `Ctrl+C` then `npm run dev`
- Verify .env.local has SENDGRID_API_KEY

---

## ✅ Success = Ready for Next Feature!

Once you successfully:
- Receive the email ✅
- Click verification link ✅
- See success message ✅
- Login to account ✅

**We're ready to move on to:**
→ Profile Photo Upload
→ Saved Passenger Profiles
→ Document Storage
→ Dashboard Enhancements

---

**Ready? Start the server and try it out!** 🚀
