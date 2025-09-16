# Flight Booking Website - Deployment Guide

## Current Status
✅ React key duplication error fixed in AirportSearchInput  
✅ "Unknown" airport names issue resolved  
✅ Comprehensive airport database added  
✅ Enhanced API with fallback logic  

## Deploy to GitHub and Vercel

### Prerequisites
1. Git must be installed on your system
2. GitHub account
3. Vercel account

### Step 1: Setup Git and Push to GitHub

Open Command Prompt or Git Bash and run these commands:

```bash
# Configure git (replace with your info)
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# Check current status
git status

# Add all files
git add .

# Commit current changes
git commit -m "feat: Fix React key duplication and unknown airports

- Fixed React key duplication error in AirportSearchInput component
- Added comprehensive airport database with 50+ airports
- Enhanced API with fallback logic for better reliability
- Resolved 'Unknown' airport names issue
- Added proper Indian and international airport data"

# Create new repository on GitHub first, then add remote
git remote add origin https://github.com/YOUR_USERNAME/flight-booking-website.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### Step 2: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click "New Project"
4. Import your GitHub repository
5. Configure environment variables:
   - `AMADEUS_CLIENT_ID`: Your Amadeus API client ID
   - `AMADEUS_CLIENT_SECRET`: Your Amadeus API client secret  
   - `AMADEUS_ENVIRONMENT`: `test` (or `production`)

### Step 3: Environment Variables

Make sure you have these in your `.env.local` file:
```
AMADEUS_CLIENT_ID=your_client_id_here
AMADEUS_CLIENT_SECRET=your_client_secret_here
AMADEUS_ENVIRONMENT=test
```

## Features Implemented

### ✅ Recent Fixes
- **React Key Fix**: Airport search dropdown now uses unique keys
- **Airport Database**: Comprehensive database with proper names
- **API Enhancement**: Better error handling and fallback logic
- **Unknown Names Fix**: No more "Unknown" airports

### 🚀 Key Features
- Real-time flight search using Amadeus API
- Smart airport search with autocomplete
- Geolocation-based nearby airports
- Responsive design
- Popular destinations
- Flight filtering and sorting

### 📁 Project Structure
```
src/
├── app/
│   ├── api/
│   │   ├── airports/search/  # Airport search API
│   │   └── flights/search/   # Flight search API
│   └── page.tsx              # Main page
├── components/
│   ├── forms/
│   │   └── AirportSearchInput.tsx  # Fixed component
│   └── ui/                   # UI components
├── lib/
│   ├── airportDatabase.ts    # NEW: Comprehensive airport DB
│   └── mockFlights.ts        # Flight mock data
└── styles/                   # Styling
```

## Troubleshooting

### Common Issues:
1. **API Errors**: Check environment variables
2. **Build Errors**: Ensure all dependencies are installed
3. **Git Issues**: Make sure Git is properly configured

### Support:
- Check Vercel deployment logs
- Verify environment variables are set
- Test API endpoints locally first