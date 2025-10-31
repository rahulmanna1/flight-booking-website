// Travel Statistics Service
// Calculates comprehensive travel statistics from booking data

export interface BookingData {
  id: string;
  bookingReference: string;
  status: string;
  flightData: string | object;
  pricing: string | object;
  bookingDate: string | Date;
  tripType: string;
}

export interface TravelStats {
  totalBookings: number;
  totalFlights: number;
  totalSpent: number;
  currency: string;
  countriesVisited: number;
  citiesVisited: number;
  milesFlown: number;
  carbonFootprint: number; // kg CO2
  favoriteDestination: string | null;
  mostUsedAirline: string | null;
  averageFlightCost: number;
  upcomingFlights: number;
  completedFlights: number;
  cancelledFlights: number;
}

export interface MonthlySpending {
  month: string;
  amount: number;
  bookings: number;
}

export interface DestinationStats {
  city: string;
  country: string;
  count: number;
  lastVisited: string;
}

export class TravelStatsService {
  
  /**
   * Calculate comprehensive travel statistics from bookings
   */
  static calculateStats(bookings: BookingData[]): TravelStats {
    if (!bookings || bookings.length === 0) {
      return this.getEmptyStats();
    }

    const destinations = new Set<string>();
    const cities = new Set<string>();
    const airlines = new Map<string, number>();
    let totalSpent = 0;
    let totalMiles = 0;
    let totalFlights = 0;

    const now = new Date();
    let upcomingFlights = 0;
    let completedFlights = 0;
    let cancelledFlights = 0;

    bookings.forEach(booking => {
      const flightData = typeof booking.flightData === 'string' 
        ? JSON.parse(booking.flightData) 
        : booking.flightData;
      
      const pricing = typeof booking.pricing === 'string'
        ? JSON.parse(booking.pricing)
        : booking.pricing;

      // Count flights based on status
      if (booking.status === 'CANCELLED' || booking.status === 'REFUNDED') {
        cancelledFlights++;
      } else if (booking.status === 'COMPLETED') {
        completedFlights++;
      } else {
        upcomingFlights++;
      }

      // Calculate spending
      if (pricing && pricing.total) {
        totalSpent += pricing.total;
      }

      // Extract flight segments
      const segments = flightData.segments || flightData.itineraries || [flightData];
      totalFlights += segments.length;

      segments.forEach((segment: any) => {
        // Track destinations
        if (segment.destination || segment.arrival?.cityName) {
          const dest = segment.destination || segment.arrival?.cityName;
          destinations.add(dest);
          cities.add(dest);
        }

        // Track airlines
        if (segment.airline || segment.carrierCode) {
          const airline = segment.airline || segment.carrierCode;
          airlines.set(airline, (airlines.get(airline) || 0) + 1);
        }

        // Calculate miles (approximate if not available)
        if (segment.distance) {
          totalMiles += segment.distance;
        }
      });
    });

    // Find most used airline
    let mostUsedAirline: string | null = null;
    let maxCount = 0;
    airlines.forEach((count, airline) => {
      if (count > maxCount) {
        maxCount = count;
        mostUsedAirline = airline;
      }
    });

    // Calculate carbon footprint (rough estimate: 0.09 kg CO2 per passenger mile)
    const carbonFootprint = Math.round(totalMiles * 0.09);

    return {
      totalBookings: bookings.length,
      totalFlights,
      totalSpent: Math.round(totalSpent * 100) / 100,
      currency: 'USD',
      countriesVisited: destinations.size,
      citiesVisited: cities.size,
      milesFlown: Math.round(totalMiles),
      carbonFootprint,
      favoriteDestination: cities.size > 0 ? Array.from(cities)[0] : null,
      mostUsedAirline,
      averageFlightCost: bookings.length > 0 ? Math.round((totalSpent / bookings.length) * 100) / 100 : 0,
      upcomingFlights,
      completedFlights,
      cancelledFlights,
    };
  }

  /**
   * Calculate monthly spending over the last 12 months
   */
  static calculateMonthlySpending(bookings: BookingData[]): MonthlySpending[] {
    const monthlyData = new Map<string, { amount: number; bookings: number }>();
    const now = new Date();
    
    // Initialize last 12 months
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyData.set(key, { amount: 0, bookings: 0 });
    }

    // Aggregate booking data
    bookings.forEach(booking => {
      const bookingDate = new Date(booking.bookingDate);
      const key = `${bookingDate.getFullYear()}-${String(bookingDate.getMonth() + 1).padStart(2, '0')}`;
      
      if (monthlyData.has(key)) {
        const pricing = typeof booking.pricing === 'string'
          ? JSON.parse(booking.pricing)
          : booking.pricing;
        
        const current = monthlyData.get(key)!;
        current.amount += pricing.total || 0;
        current.bookings += 1;
      }
    });

    // Convert to array
    return Array.from(monthlyData.entries()).map(([month, data]) => ({
      month: this.formatMonthLabel(month),
      amount: Math.round(data.amount * 100) / 100,
      bookings: data.bookings,
    }));
  }

  /**
   * Get top destinations by visit frequency
   */
  static getTopDestinations(bookings: BookingData[], limit: number = 5): DestinationStats[] {
    const destinations = new Map<string, { city: string; country: string; count: number; lastVisited: Date }>();

    bookings.forEach(booking => {
      const flightData = typeof booking.flightData === 'string' 
        ? JSON.parse(booking.flightData) 
        : booking.flightData;
      
      const segments = flightData.segments || flightData.itineraries || [flightData];
      
      segments.forEach((segment: any) => {
        const city = segment.destination || segment.arrival?.cityName || 'Unknown';
        const country = segment.arrivalCountry || segment.arrival?.countryCode || 'Unknown';
        const bookingDate = new Date(booking.bookingDate);

        const existing = destinations.get(city);
        if (existing) {
          existing.count++;
          if (bookingDate > existing.lastVisited) {
            existing.lastVisited = bookingDate;
          }
        } else {
          destinations.set(city, {
            city,
            country,
            count: 1,
            lastVisited: bookingDate,
          });
        }
      });
    });

    return Array.from(destinations.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, limit)
      .map(dest => ({
        ...dest,
        lastVisited: dest.lastVisited.toISOString(),
      }));
  }

  /**
   * Get empty stats object
   */
  private static getEmptyStats(): TravelStats {
    return {
      totalBookings: 0,
      totalFlights: 0,
      totalSpent: 0,
      currency: 'USD',
      countriesVisited: 0,
      citiesVisited: 0,
      milesFlown: 0,
      carbonFootprint: 0,
      favoriteDestination: null,
      mostUsedAirline: null,
      averageFlightCost: 0,
      upcomingFlights: 0,
      completedFlights: 0,
      cancelledFlights: 0,
    };
  }

  /**
   * Format month key to readable label
   */
  private static formatMonthLabel(monthKey: string): string {
    const [year, month] = monthKey.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  }

  /**
   * Calculate year-over-year growth
   */
  static calculateGrowthMetrics(bookings: BookingData[]) {
    const now = new Date();
    const thisYear = now.getFullYear();
    const lastYear = thisYear - 1;

    const thisYearBookings = bookings.filter(b => {
      const year = new Date(b.bookingDate).getFullYear();
      return year === thisYear;
    });

    const lastYearBookings = bookings.filter(b => {
      const year = new Date(b.bookingDate).getFullYear();
      return year === lastYear;
    });

    const thisYearSpent = thisYearBookings.reduce((sum, b) => {
      const pricing = typeof b.pricing === 'string' ? JSON.parse(b.pricing) : b.pricing;
      return sum + (pricing.total || 0);
    }, 0);

    const lastYearSpent = lastYearBookings.reduce((sum, b) => {
      const pricing = typeof b.pricing === 'string' ? JSON.parse(b.pricing) : b.pricing;
      return sum + (pricing.total || 0);
    }, 0);

    const bookingGrowth = lastYearBookings.length > 0
      ? Math.round(((thisYearBookings.length - lastYearBookings.length) / lastYearBookings.length) * 100)
      : 0;

    const spendingGrowth = lastYearSpent > 0
      ? Math.round(((thisYearSpent - lastYearSpent) / lastYearSpent) * 100)
      : 0;

    return {
      bookingGrowth,
      spendingGrowth,
      thisYearBookings: thisYearBookings.length,
      lastYearBookings: lastYearBookings.length,
      thisYearSpent: Math.round(thisYearSpent * 100) / 100,
      lastYearSpent: Math.round(lastYearSpent * 100) / 100,
    };
  }
}

export default TravelStatsService;
