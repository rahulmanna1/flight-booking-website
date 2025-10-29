# Password Reset Feature - Testing Guide

## ✅ Feature Complete!

The password reset via email feature has been successfully implemented with the following components:

### Backend
- ✅ Database schema updated with `resetToken` and `resetTokenExpiry` fields
- ✅ API endpoint `/api/auth/forgot-password` - Request password reset
- ✅ API endpoint `/api/auth/reset-password` - Reset password with token
- ✅ Email templates (HTML & text) for password reset
- ✅ Token generation and validation (1-hour expiration)

### Frontend
- ✅ `/forgot-password` page - Request reset link
- ✅ `/reset-password` page - Set new password
- ✅ Password strength indicator
- ✅ Form validation and error handling
- ✅ "Forgot Password?" link on login page

---

## 🧪 How to Test

### 1. Start the Development Server
```bash
npm run dev
```
Visit: http://localhost:3000

### 2. Register a Test User
1. Go to http://localhost:3000/register
2. Create a new account with your email
3. Verify your email (check inbox for verification link)
4. Log out

### 3. Test Password Reset Flow

#### Step 1: Request Password Reset
1. Go to http://localhost:3000/login
2. Click "Forgot your password?" link
3. Enter your registered email address
4. Click "Send Reset Link"
5. You should see a success message

#### Step 2: Check Email
1. Open your email inbox
2. Look for email from "FlightBooker" with subject "Reset Your Password"
3. Click the "Reset My Password" button in the email
   - OR copy the reset link from the email

#### Step 3: Reset Password
1. The link will take you to `/reset-password?token=...`
2. Enter a new password (must meet requirements):
   - At least 8 characters
   - One uppercase letter
   - One lowercase letter
   - One number
   - One special character (@$!%*?&)
3. Confirm the new password
4. Watch the password strength indicator
5. Click "Reset Password"
6. You should see success message and auto-redirect to login

#### Step 4: Log in with New Password
1. On the login page, enter your email
2. Enter your NEW password
3. Click "Sign In"
4. You should successfully log in ✅

---

## 🔒 Security Features

- **Email Enumeration Protection**: Always returns success message even if email doesn't exist
- **Token Expiration**: Reset tokens expire after 1 hour
- **One-Time Use**: Tokens are invalidated after password reset
- **Strong Password Requirements**: Enforced both client and server-side
- **Secure Token Generation**: Using crypto.randomBytes (32 bytes)

---

## 🎨 UX Features

- **Real-time password strength indicator**
- **Password visibility toggle**
- **Client-side validation before submission**
- **Clear error messages**
- **Loading states**
- **Success confirmations**
- **Auto-redirect after success**

---

## 📧 Email Template

The password reset email includes:
- Professional, branded design
- Clear call-to-action button
- Security warning
- 1-hour expiration notice
- Plain text alternative
- Fallback link (copy-paste)

---

## 🐛 Troubleshooting

### Email not received?
1. Check spam/junk folder
2. Verify SendGrid API key is configured in Vercel
3. Check server logs for email sending errors

### Token expired/invalid?
- Reset tokens expire after 1 hour
- Request a new reset link

### Password validation failing?
- Ensure password meets all requirements:
  - Minimum 8 characters
  - At least one uppercase (A-Z)
  - At least one lowercase (a-z)
  - At least one number (0-9)
  - At least one special character (@$!%*?&)

---

## 📝 API Endpoints

### POST `/api/auth/forgot-password`
**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "If an account exists with this email, you will receive a password reset link."
}
```

### POST `/api/auth/reset-password`
**Request:**
```json
{
  "token": "abc123...",
  "password": "NewPassword123!"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Password has been reset successfully. You can now log in with your new password."
}
```

**Response (Error - Weak Password):**
```json
{
  "error": "Password does not meet requirements",
  "details": [
    "Password must be at least 8 characters long",
    "Password must contain at least one uppercase letter"
  ]
}
```

---

## ✨ Next Steps

Password reset feature is complete! Ready to move on to the next feature:
- **Option 2**: Enhanced user profile editing and photo upload
- **Option 3**: Dashboard enhancements (real booking history, travel stats)

Let me know which feature you'd like to implement next! 🚀
