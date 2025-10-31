# 🧪 Testing Guide - New Features

## 🚀 Deployment Status
✅ **All changes have been pushed and deployed!**

Your Vercel deployment should automatically build with these changes in a few minutes.

---

## 📋 What to Test

### 1. ✅ **Direct Flights Filter** (WORKING)
**Status:** ✅ You confirmed this is working!

**Location:** Search form homepage  
**What it does:** Checkbox that prioritizes direct flights in results

---

### 2. 🔍 **Advanced Filters Panel** (NEW)
**Location:** Left sidebar on flight results page  
**Access:** Search for flights to see results page

**Test all filter sections:**

#### A. Price Range Slider
- [ ] Drag slider to adjust max price
- [ ] Check flights update to match price range
- [ ] Verify price chips appear at top

#### B. Number of Stops
- [ ] Click "Non-stop only" radio button
- [ ] Click "Up to 1 stop"
- [ ] Check filtered results match selection

#### C. Airlines Filter
- [ ] Scroll through airline list
- [ ] Check/uncheck multiple airlines
- [ ] Verify results show only selected airlines
- [ ] Chips should appear for each selected airline

#### D. Departure Time
- [ ] Adjust "From" slider (0-24 hours)
- [ ] Adjust "To" slider
- [ ] Check results filter by time range

#### E. Arrival Time
- [ ] Same as departure time tests

#### F. Flight Duration
- [ ] Select "Up to 3 hours"
- [ ] Select "Up to 12 hours"
- [ ] Verify results match duration

#### G. Layover Duration
- [ ] Enter minimum layover (e.g., 60 minutes)
- [ ] Enter maximum layover (e.g., 180 minutes)
- [ ] Check results respect constraints

#### H. Amenities & Policies
- [ ] Check "Checked baggage included"
- [ ] Check "Refundable tickets"
- [ ] Verify filter chips appear

---

### 3. 🏷️ **Filter Chips** (NEW)
**Location:** Below FilterSortBar, above flight results

**Test:**
- [ ] All active filters show as chips
- [ ] Each chip has correct icon and label
- [ ] Click X on individual chip removes that filter
- [ ] Click "Clear all" removes all filters at once
- [ ] Chips disappear when no filters active

---

### 4. 🎛️ **Filter & Sort Bar** (NEW)
**Location:** Top of flight results page

**Test:**
- [ ] Shows correct count: "X flights found"
- [ ] Filter button shows active count badge
- [ ] Click filter button toggles sidebar on/off

**Sort Dropdown:**
- [ ] Click dropdown opens menu
- [ ] Test each sort option:
  - Best
  - Price: Low to High
  - Price: High to Low
  - Duration: Shortest
  - Duration: Longest
  - Departure: Earliest
  - Departure: Latest
- [ ] Selected option shows checkmark
- [ ] Results reorder correctly

**View Mode Toggle:**
- [ ] Click Grid icon
- [ ] Click List icon
- [ ] View changes accordingly

---

### 5. ⚖️ **Flight Comparison** (NEW - MAIN FEATURE)
**Location:** Flight results page

#### A. Adding Flights to Compare
- [ ] Find "Compare" button on each flight card (top-right)
- [ ] Click "Compare" on first flight
- [ ] Button changes to "Added" with checkmark ✓
- [ ] Click "Compare" on 2nd flight
- [ ] Click "Compare" on 3rd flight
- [ ] Try adding 5th flight - should be disabled with "Maximum 4 flights" message

#### B. Floating Bar Behavior
- [ ] After selecting 1 flight, bar appears at bottom
- [ ] Shows "1 of 4 selected"
- [ ] Message says "Select at least 2 flights"
- [ ] "Compare Now" button is disabled
- [ ] After selecting 2nd flight:
  - Shows "2 of 4 selected"
  - Message says "Ready to compare"
  - "Compare Now" button is ENABLED
- [ ] Click X on floating bar clears all selections

#### C. Comparison Modal
**Open Modal:**
- [ ] Select 2-4 flights
- [ ] Click "Compare Now" on floating bar
- [ ] Modal opens with side-by-side flight cards

**Check Modal Content:**
- [ ] Header shows "Compare Flights"
- [ ] Shows count: "Comparing X flights"
- [ ] Each flight card displays:
  - Airline name and flight number
  - Price prominently displayed
  - Route (origin → destination)
  - Departure/arrival times
  - Duration
  - Number of stops
  - Cabin class
  - **Baggage section:**
    - Carry-on allowance
    - Checked baggage allowance
  - **Amenities section:**
    - WiFi (✓ or ✗)
    - Meals (✓ or ✗)
    - Entertainment (✓ or ✗)
    - Power outlets (✓ or ✗)
  - Cancellation policy

#### D. Export & Share
**Export to CSV:**
- [ ] Click Download icon in modal header
- [ ] CSV file downloads automatically
- [ ] Open CSV - check all flight data is there

**Share Comparison:**
- [ ] Click Share icon in modal header
- [ ] On mobile: Native share sheet appears
- [ ] On desktop: "Comparison copied to clipboard" alert
- [ ] Paste clipboard content - should show flight info

#### E. Remove Flights from Comparison
- [ ] Click X on individual flight card in modal
- [ ] Flight removes from comparison
- [ ] If only 1 flight left, modal may stay open or close

#### F. Select Flight from Comparison
- [ ] Click "Select This Flight" button on a flight card
- [ ] Modal closes
- [ ] Booking form opens for that flight

---

### 6. 🎫 **Promo Code System** (Blocked by CAPTCHA)
**Note:** You mentioned CAPTCHA issue on checkout page

**To test when CAPTCHA is fixed:**
1. First, create a test promo code via API (see below)
2. Add `PromoCodeInput` component to checkout page
3. Test validation

**Create test promo code** (run in terminal or API tool):
```bash
curl -X POST https://your-app.vercel.app/api/admin/promo-codes \
  -H "Content-Type: application/json" \
  -d '{
    "code": "TEST25",
    "description": "25% off test promo",
    "discountType": "PERCENTAGE",
    "discountValue": 25,
    "validFrom": "2025-01-01T00:00:00Z",
    "validUntil": "2025-12-31T23:59:59Z"
  }'
```

**Then test:**
- [ ] Enter "TEST25" in promo code input
- [ ] Click "Apply"
- [ ] Green success message appears
- [ ] Discount shows: "You saved $X"
- [ ] Try invalid code - see error message
- [ ] Click X to remove promo code

---

## 🎯 Priority Testing Order

### MUST TEST NOW:
1. ✅ Advanced Filters Panel (all sections)
2. ✅ Filter Chips (show/hide/remove)
3. ✅ FilterSortBar (sort dropdown, view modes)
4. ✅ Flight Comparison (add, floating bar, modal)
5. ✅ Export/Share comparison

### TEST WHEN CAPTCHA FIXED:
6. ⏳ Promo Code Input (on checkout page)

---

## 📱 Mobile Testing
**Important:** Test on mobile/tablet too!

- [ ] Filter panel toggles on mobile
- [ ] FilterSortBar is responsive
- [ ] Compare buttons are touch-friendly
- [ ] Floating bar doesn't block content
- [ ] Comparison modal scrolls on mobile
- [ ] Export/share works on mobile

---

## 🐛 Common Issues & Solutions

### Issue: "Filters not working"
**Solution:** Make sure you're on the **flight results page** (search for flights first)

### Issue: "Compare button not visible"
**Solution:** Look at top-right of each flight card

### Issue: "Can't add more than 4 flights"
**Solution:** This is by design - remove one to add another

### Issue: "Modal empty or not loading"
**Solution:** Check browser console for errors, might need page refresh

### Issue: "Export doesn't download"
**Solution:** Check browser's download settings/permissions

---

## 📸 Screenshots to Take

When testing, take screenshots of:
1. Advanced Filters Panel (expanded all sections)
2. Active Filter Chips
3. FilterSortBar with dropdown open
4. Flight card with Compare button
5. Floating bar with 3 flights selected
6. Comparison modal with 3-4 flights
7. Exported CSV file opened in Excel/Sheets

---

## ✅ Quick Checklist

```
CORE FEATURES:
[ ] Direct flights filter works (CONFIRMED ✅)
[ ] Advanced filters panel loads
[ ] All filter options work
[ ] Filter chips display correctly
[ ] FilterSortBar functions properly
[ ] Can add flights to comparison
[ ] Floating bar appears correctly
[ ] Comparison modal opens
[ ] All flight details visible in comparison
[ ] Export to CSV works
[ ] Share functionality works
[ ] Can remove flights from comparison

BONUS:
[ ] Promo code validation (when CAPTCHA fixed)
[ ] Mobile responsive
[ ] No console errors
```

---

## 🆘 Need Help?

If you encounter issues:
1. Check browser console (F12) for errors
2. Take a screenshot of the issue
3. Note what you clicked and what you expected vs what happened
4. Let me know which browser you're using

---

## 🎉 Success Criteria

You'll know everything works when:
- ✅ You can filter flights by multiple criteria
- ✅ Filter chips show and can be removed
- ✅ You can compare 2-4 flights side-by-side
- ✅ You can export comparison to CSV
- ✅ Share works (copies to clipboard or native share)
- ✅ All features work on mobile

---

**Happy Testing! 🚀**

The deployment should be live in ~3-5 minutes. Check your Vercel dashboard for the deployment URL!
