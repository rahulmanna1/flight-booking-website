# ✈️ Flight Booking Website

A modern, responsive flight booking platform built with **Next.js 15**, **TypeScript**, and **Tailwind CSS**. Features real-time flight search, smart airport suggestions, and an intuitive booking interface.

## 🚀 Features

### ✅ Recently Fixed
- **React Key Duplication**: Fixed unique key issues in airport search dropdown
- **Unknown Airports**: Resolved "Unknown" airport names with comprehensive database
- **Enhanced Search**: Added fallback logic for better reliability

### 🛫 Core Features
- **Real-time Flight Search** using Amadeus API
- **Smart Airport Search** with autocomplete and geolocation
- **Nearby Airports** detection based on user location
- **Popular Destinations** suggestions
- **Advanced Filtering** by price, duration, stops
- **Responsive Design** for all devices
- **Indian Airlines Focus** with local routes and pricing

### 🛠️ Technical Features
- Next.js 15 with App Router
- TypeScript for type safety
- Tailwind CSS for styling
- Amadeus Travel API integration
- Comprehensive airport database (50+ airports)
- Real-time search with debouncing
- Error handling and fallback mechanisms

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Amadeus Travel API credentials
- Git (for deployment)

## 🔧 Getting Started

1. **Clone the repository**
```bash
git clone https://github.com/YOUR_USERNAME/flight-booking-website.git
cd flight-booking-website
```

2. **Install dependencies**
```bash
npm install
```

3. **Setup environment variables**
Create a `.env.local` file in the root directory:
```env
AMADEUS_CLIENT_ID=your_client_id_here
AMADEUS_CLIENT_SECRET=your_client_secret_here
AMADEUS_ENVIRONMENT=test
```

4. **Run the development server**
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🏗️ Project Structure

```
src/
├── app/                      # Next.js App Router
│   ├── api/
│   │   ├── airports/search/  # Airport search API
│   │   └── flights/search/   # Flight search API
│   ├── globals.css          # Global styles
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Home page
├── components/              # React components
│   ├── forms/
│   │   └── AirportSearchInput.tsx  # Smart airport search
│   ├── ui/                  # UI components
│   └── SearchForm.tsx       # Main search form
├── lib/                     # Utilities and data
│   ├── airportDatabase.ts   # Comprehensive airport DB
│   ├── mockFlights.ts       # Flight mock data
│   └── utils.ts            # Utility functions
└── types/                   # TypeScript definitions
```

## 🌟 Key Components

### AirportSearchInput
- Smart autocomplete with Amadeus API
- Geolocation-based nearby airports
- Comprehensive fallback database
- Real-time search with debouncing

### Flight Search
- Real-time flight data from Amadeus
- Advanced filtering options
- Price comparison
- Multiple airline support

### Airport Database
Includes major airports worldwide:
- **Indian Airports**: DEL, BOM, CCU, MAA, BLR, HYD, AMD, COK, etc.
- **International**: JFK, LHR, CDG, NRT, DXB, SIN, SYD, etc.

## 🚀 Deployment

### Quick Deploy to Vercel

1. **Push to GitHub**
```bash
git add .
git commit -m "feat: Complete flight booking platform with fixes"
git push origin main
```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Connect your GitHub repository
   - Add environment variables
   - Deploy automatically

3. **Environment Variables on Vercel**
   - `AMADEUS_CLIENT_ID`
   - `AMADEUS_CLIENT_SECRET`
   - `AMADEUS_ENVIRONMENT`

For detailed deployment steps, see `DEPLOYMENT_GUIDE.md`.

## 🔑 API Integration

### Amadeus Travel API
This project integrates with the Amadeus Travel API for:
- Real-time flight search
- Airport and city data
- Flight offers and pricing

Get your API credentials at [developers.amadeus.com](https://developers.amadeus.com)

## 🐛 Troubleshooting

### Common Issues

1. **API Errors**
   - Verify environment variables are set
   - Check Amadeus API credentials
   - Ensure API quota is not exceeded

2. **Build Errors**
   - Run `npm install` to update dependencies
   - Check TypeScript errors: `npm run type-check`
   - Verify all imports are correct

3. **Airport Search Issues**
   - Check network connectivity
   - Verify API endpoints are accessible
   - Local database provides fallback

## 📝 Recent Updates

- ✅ Fixed React key duplication in airport search
- ✅ Resolved "Unknown" airport names issue
- ✅ Added comprehensive airport database
- ✅ Enhanced API with fallback logic
- ✅ Improved error handling and user experience

---

**Built with ❤️ for seamless travel booking**
