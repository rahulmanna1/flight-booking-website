# 🚀 Amadeus API Integration Guide

## 📋 Complete Setup Instructions

### **Step 1: Create Amadeus Developer Account**

1. **Go to Amadeus for Developers**
   - Visit: https://developers.amadeus.com/
   - Click "Get Started" or "Sign Up"

2. **Register Your Account**
   - Fill out the registration form
   - Verify your email address
   - Complete profile setup

3. **Create a New App**
   - Go to "My Apps" in your dashboard
   - Click "Create New App"
   - Fill in app details:
     - **App Name**: FlightBooker Website
     - **Description**: Flight booking website with real-time search
     - **App Type**: Web Application

4. **Get Your API Credentials**
   - After creating the app, you'll see:
     - **Client ID**: (copy this)
     - **Client Secret**: (copy this)
   - **IMPORTANT**: Keep these credentials secure!

### **Step 2: Configure Environment Variables**

1. **Update `.env.local` file** with your real credentials:
   ```bash
   # Replace with your actual credentials from Amadeus dashboard
   AMADEUS_CLIENT_ID=your_actual_client_id_here
   AMADEUS_CLIENT_SECRET=your_actual_client_secret_here
   
   # Start with 'test' environment for development
   AMADEUS_ENVIRONMENT=test
   
   # Enable real API
   USE_REAL_API=true
   ```

2. **Environment Options**:
   - `AMADEUS_ENVIRONMENT=test` → Sandbox/Test data (FREE)
   - `AMADEUS_ENVIRONMENT=production` → Live/Real data (PAID)

### **Step 3: Test the Integration**

1. **Start your development server**:
   ```bash
   npm run dev
   ```

2. **Test API endpoint directly** (optional):
   ```bash
   curl -X POST http://localhost:3000/api/flights/search \
   -H "Content-Type: application/json" \
   -d '{
     "from": "JFK",
     "to": "LAX", 
     "departDate": "2024-12-01",
     "passengers": 1,
     "tripType": "oneway"
   }'
   ```

3. **Check the data source indicator**:
   - Look for the colored badge on flight results:
     - 🟢 **"Live Data"** → Amadeus API working
     - 🟡 **"Demo Data (API Error)"** → API failed, using fallback
     - 🔵 **"Demo Data"** → Using mock data (API disabled)

### **Step 4: Understanding Amadeus Pricing**

#### **Test Environment (FREE)**
- ✅ **Free forever** for development
- ✅ **Fake data** but realistic structure
- ✅ **All API endpoints** available
- ✅ **Rate limit**: 10 requests/second
- ⚠️ **Cannot book real flights**

#### **Production Environment (PAID)**
- 💰 **Pay-per-request** pricing
- ✅ **Real flight data** from 800+ airlines
- ✅ **Actual booking capability**
- ✅ **Higher rate limits**

#### **Pricing Examples** (as of 2024):
- **Flight Search**: ~$0.002-0.007 per request
- **Flight Booking**: ~$2.50-15.00 per booking
- **Free monthly quota**: Usually 2,000 test requests

### **Step 5: Production Deployment**

When ready for production:

1. **Update environment variables**:
   ```bash
   AMADEUS_ENVIRONMENT=production
   ```

2. **Add billing method** in Amadeus dashboard

3. **Monitor usage** in dashboard to avoid unexpected costs

4. **Set up monitoring** for API errors and fallbacks

### **Step 6: API Features Available**

#### **Currently Implemented**:
- ✅ **Flight Search** (`GET /shopping/flight-offers-search`)
- ✅ **Multi-currency support**
- ✅ **Error handling with fallbacks**
- ✅ **Loading states**

#### **Ready to Implement** (examples):
- 🔜 **Flight Booking** (`POST /booking/flight-orders`)
- 🔜 **Seat Maps** (`GET /shopping/seatmaps`)
- 🔜 **Airport Information** (`GET /reference-data/locations`)
- 🔜 **Airline Information** (`GET /reference-data/airlines`)

### **Step 7: Troubleshooting**

#### **Common Issues:**

1. **"Authentication failed"**
   - ✅ Check if CLIENT_ID and CLIENT_SECRET are correct
   - ✅ Verify no extra spaces in environment variables
   - ✅ Restart development server after changing .env

2. **"Invalid origin/destination"**
   - ✅ Use IATA airport codes (JFK, LAX, LHR)
   - ✅ Check if airports are supported by Amadeus

3. **"Rate limit exceeded"**
   - ✅ Add delays between requests
   - ✅ Implement request caching
   - ✅ Use production environment for higher limits

4. **"No flights found"**
   - ✅ Try different dates (advance booking required)
   - ✅ Check if route is commercially viable
   - ✅ Verify date format (YYYY-MM-DD)

### **Step 8: Monitoring and Analytics**

#### **Check Logs:**
- Browser Console: API response details
- Server Logs: Amadeus API calls and errors
- Amadeus Dashboard: Request count and billing

#### **Monitor These Metrics:**
- API success/failure rates
- Average response times  
- Daily/monthly request counts
- Conversion from search to booking

### **Step 9: Security Best Practices**

1. **Never expose credentials**:
   - ✅ Keep CLIENT_SECRET in environment variables only
   - ✅ Add `.env.local` to `.gitignore`
   - ✅ Use different credentials for different environments

2. **Rate limiting**:
   - ✅ Implement client-side request throttling
   - ✅ Cache results when possible
   - ✅ Show loading states to prevent spam clicking

3. **Error handling**:
   - ✅ Always have fallback data
   - ✅ Log errors for debugging
   - ✅ Don't expose API errors to users

---

## 🎯 **Quick Start Commands**

```bash
# 1. Get your credentials from https://developers.amadeus.com/my-apps

# 2. Update .env.local with your credentials

# 3. Test the integration
npm run dev

# 4. Open http://localhost:3000 and search for flights

# 5. Check the data source badge to confirm API is working
```

## 📞 **Support Resources**

- **Amadeus Documentation**: https://developers.amadeus.com/self-service
- **API Reference**: https://developers.amadeus.com/self-service/category/air
- **Community Forum**: https://developers.amadeus.com/support
- **Status Page**: https://status.amadeus.com/

---

**🎉 Congratulations!** Your flight booking website now has real-time flight data integration!