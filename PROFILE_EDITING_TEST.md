# Enhanced Profile Editing & Photo Upload - Testing Guide

## ✅ Feature Complete!

The enhanced profile editing with photo upload feature has been successfully implemented:

### Backend
- ✅ Cloudinary integration for image storage
- ✅ Avatar upload API endpoint (`/api/upload/avatar`)
- ✅ Image validation (type, size, format)
- ✅ Automatic image optimization (400x400, face detection)
- ✅ Enhanced user update API (`PUT /api/auth/me`)
- ✅ Avatar deletion functionality

### Frontend
- ✅ AvatarUpload component with drag-and-drop
- ✅ Real-time image preview
- ✅ Profile settings page with avatar section
- ✅ Profile completion indicator (dashboard & settings)
- ✅ Progress tracking for profile fields
- ✅ Responsive UI for all devices

### Security
- JWT authentication for uploads
- File type validation (JPEG, PNG, WebP only)
- File size limit (5MB max)
- Secure Cloudinary signed uploads
- Server-side validation

---

## 🧪 Testing Instructions

### Prerequisites

1. **Get Cloudinary Account** (Free tier is fine):
   - Sign up at https://cloudinary.com/
   - Go to Dashboard → Get your credentials
   - Copy: Cloud Name, API Key, API Secret

2. **Add to Environment Variables**:

**Local Testing (.env.local)**:
```bash
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**Production (Vercel)**:
```bash
# Go to: Vercel Dashboard → Your Project → Settings → Environment Variables
# Add the same three variables for Production, Preview, and Development
```

---

## 📋 Test Cases

### Test 1: Profile Completion Indicator

**On Dashboard:**
1. Go to http://localhost:3000/dashboard
2. Look for "Profile Completion" card on the right
3. Should show percentage and missing fields
4. Click "Complete Profile" button → redirects to settings

**Expected Results:**
- ✅ Percentage calculated correctly
- ✅ Missing fields listed
- ✅ Color coding (red < 50%, yellow < 80%, green >= 80%)
- ✅ Button links to settings page

---

### Test 2: Avatar Upload - Basic Flow

**Step 1: Access Settings**
1. Navigate to `/settings`
2. Click "Profile" tab (should be default)
3. See avatar upload section at top

**Step 2: Upload Image**
1. Click camera button on avatar or "Click to upload"
2. Select a profile picture (JPEG, PNG, or WebP)
3. Watch for:
   - ✅ Immediate preview
   - ✅ Upload progress indicator
   - ✅ Success message
   - ✅ "Remember to save changes" notification

**Step 3: Save Profile**
1. Scroll down
2. Click "Save Changes" button
3. Wait for success message
4. Refresh page → avatar should persist

---

### Test 3: Drag and Drop Upload

**Test:**
1. Go to Settings → Profile tab
2. Drag an image file from your desktop
3. Drop it onto the dashed upload area
4. Should upload automatically

**Expected:**
- ✅ Visual feedback during drag (border turns blue)
- ✅ Upload starts on drop
- ✅ Preview updates immediately

---

### Test 4: File Validation

**Test Invalid File Type:**
1. Try uploading a `.pdf` or `.txt` file
2. Should show error: "Please upload a JPEG, PNG, or WebP image"

**Test Large File:**
1. Try uploading an image >5MB
2. Should show error: "File size must be less than 5MB"

**Expected:**
- ✅ Errors displayed in red alert box
- ✅ No upload attempt made
- ✅ Previous avatar remains unchanged

---

### Test 5: Remove Avatar

**Test:**
1. Upload an avatar successfully
2. Click "Remove" button below the preview
3. Avatar should clear to default user icon
4. Click "Save Changes"
5. Refresh → should show default icon

**Expected:**
- ✅ Remove button only shows after upload
- ✅ Immediate visual feedback
- ✅ Changes persist after save

---

### Test 6: Profile Fields Editing

**Test All Fields:**
1. Go to Settings → Profile tab
2. Edit the following fields:
   - First Name
   - Last Name
   - Email
   - Phone
   - Date of Birth
   - Nationality
3. Click "Save Changes"
4. Refresh page → changes should persist

**Expected:**
- ✅ All fields editable
- ✅ Form validation works
- ✅ Success message on save
- ✅ Data persists in database
- ✅ Profile completion % updates

---

### Test 7: Profile Completion Progress

**Starting from empty profile:**
1. Check dashboard completion: should be low (e.g., 37%)
2. Go to settings
3. Upload avatar → completion increases
4. Fill in phone → completion increases
5. Add date of birth → completion increases
6. Select nationality → completion increases
7. Return to dashboard → see updated %

**Expected:**
- ✅ Calculation updates in real-time
- ✅ Color changes at thresholds:
  - Red: 0-49%
  - Yellow: 50-79%
  - Green: 80-100%
- ✅ Label updates ("Just started" → "In progress" → "Almost there" → "Complete")

---

### Test 8: Mobile Responsiveness

**Test on mobile/small screen:**
1. Resize browser to mobile width (< 768px)
2. Navigate to Settings → Profile
3. Test avatar upload
4. Test form fields

**Expected:**
- ✅ Avatar upload section stacks vertically
- ✅ Form fields responsive
- ✅ Upload area still drag-drop functional
- ✅ Camera button accessible

---

### Test 9: Authentication & Security

**Test unauthenticated access:**
1. Log out
2. Try to access `/api/upload/avatar` directly
3. Should get 401 Unauthorized

**Test file injection:**
1. Try renaming a `.exe` to `.jpg`
2. Try uploading
3. Should be rejected by mime-type validation

**Expected:**
- ✅ All upload endpoints require authentication
- ✅ File type checked by content, not just extension
- ✅ Secure signed uploads to Cloudinary

---

### Test 10: Image Optimization

**Test Cloudinary transformations:**
1. Upload a large image (e.g., 4000x3000px)
2. Check the returned Cloudinary URL
3. Image should be:
   - ✅ Resized to 400x400
   - ✅ Cropped to focus on face (if detected)
   - ✅ Optimized quality
   - ✅ Auto format (WebP for supported browsers)

**Verify:**
- Right-click avatar → "Open image in new tab"
- Check URL for transformations: `/w_400,h_400,c_fill,g_face/`

---

## 🔍 API Endpoint Testing

### POST `/api/upload/avatar`

**Test with curl:**
```bash
# Get your JWT token from localStorage
TOKEN="your_jwt_token_here"

# Upload image
curl -X POST http://localhost:3000/api/upload/avatar \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@path/to/image.jpg"
```

**Expected Response:**
```json
{
  "success": true,
  "url": "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/flight-booker/avatars/user_abc123_1234567890.jpg",
  "publicId": "flight-booker/avatars/user_abc123_1234567890"
}
```

### PUT `/api/auth/me`

**Test with curl:**
```bash
curl -X PUT http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890",
    "avatar": "https://res.cloudinary.com/..."
  }'
```

---

## 🐛 Common Issues & Solutions

### Issue: "Image upload service not configured"
**Solution:**
- Check Cloudinary environment variables are set
- Restart dev server after adding env vars
- For production: verify Vercel env vars

### Issue: "Upload failed" or timeout
**Solution:**
- Check network connection
- Verify Cloudinary credentials are correct
- Check file size (must be < 5MB)
- Check Cloudinary account limits (free tier has monthly limit)

### Issue: Profile completion % not updating
**Solution:**
- Hard refresh page (Ctrl+Shift+R)
- Check that all fields are being saved properly
- Verify user.preferences.emailVerified is set after email verification

### Issue: Image not displaying
**Solution:**
- Check CORS settings in Cloudinary
- Verify URL is accessible (open in new tab)
- Check Next.js image domains configuration

---

## 📊 Profile Completion Calculation

Fields counted (8 total):
1. ✓ Avatar uploaded
2. ✓ First Name filled
3. ✓ Last Name filled
4. ✓ Email verified
5. ✓ Phone number added
6. ✓ Date of Birth added
7. ✓ Nationality selected
8. ✓ Email verified

**Formula:** `(completed_fields / 8) * 100`

---

## 🚀 Production Deployment Checklist

Before deploying:
- [ ] Cloudinary credentials added to Vercel
- [ ] Test upload in production environment
- [ ] Verify image optimization settings
- [ ] Check mobile responsiveness
- [ ] Test with real user accounts
- [ ] Monitor Cloudinary usage/limits
- [ ] Set up backup/cleanup for old avatars (optional)

---

## ✨ What's Next?

Profile editing feature is complete! Ready for the next enhancement:
- **Option 3**: Dashboard enhancements (real booking history, travel stats, charts)

Let me know when you're ready to continue! 🎉
