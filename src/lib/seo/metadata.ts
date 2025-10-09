// SEO Metadata Configuration for Flight Booking Website
// Provides structured metadata for all flight booking related pages

import { Metadata } from 'next';

export interface FlightSEOData {
  from?: {
    code: string;
    name: string;
    city: string;
  };
  to?: {
    code: string;
    name: string;
    city: string;
  };
  departDate?: string;
  returnDate?: string;
  passengers?: number;
  class?: string;
}

export interface BookingSEOData {
  bookingReference?: string;
  flightNumber?: string;
  airline?: string;
  route?: string;
}

export class FlightBookerSEO {
  private static readonly BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  private static readonly SITE_NAME = 'FlightBooker';
  private static readonly SITE_DESCRIPTION = 'Find and book flights at the best prices. Compare airlines, search flexible dates, and enjoy seamless booking experience with FlightBooker.';

  // Default metadata for the main site
  static getDefaultMetadata(): Metadata {
    return {
      title: {
        default: 'FlightBooker - Find and Book Flights at Best Prices',
        template: '%s | FlightBooker'
      },
      description: this.SITE_DESCRIPTION,
      keywords: [
        'flight booking',
        'cheap flights',
        'airline tickets',
        'travel booking',
        'flight search',
        'best flight prices',
        'international flights',
        'domestic flights'
      ],
      authors: [{ name: 'FlightBooker Team' }],
      creator: 'FlightBooker',
      publisher: 'FlightBooker',
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-video-preview': -1,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      },
      openGraph: {
        type: 'website',
        locale: 'en_US',
        url: this.BASE_URL,
        siteName: this.SITE_NAME,
        title: 'FlightBooker - Find and Book Flights at Best Prices',
        description: this.SITE_DESCRIPTION,
        images: [
          {
            url: `${this.BASE_URL}/images/og-default.jpg`,
            width: 1200,
            height: 630,
            alt: 'FlightBooker - Flight Booking Made Easy',
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        site: '@flightbooker',
        creator: '@flightbooker',
        title: 'FlightBooker - Find and Book Flights at Best Prices',
        description: this.SITE_DESCRIPTION,
        images: [`${this.BASE_URL}/images/twitter-card.jpg`],
      },
      verification: {
        google: 'your-google-site-verification-code',
      },
      alternates: {
        canonical: this.BASE_URL,
      },
    };
  }

  // Metadata for flight search page
  static getFlightSearchMetadata(searchData?: FlightSEOData): Metadata {
    let title = 'Search Flights';
    let description = 'Search and compare flights from hundreds of airlines. Find the best deals and book your perfect trip.';

    if (searchData?.from && searchData?.to) {
      const route = `${searchData.from.city} to ${searchData.to.city}`;
      title = `Flights from ${route}`;
      description = `Find cheap flights from ${route}. Compare prices and book ${searchData.from.code} to ${searchData.to.code} flights with FlightBooker.`;
    }

    return {
      title,
      description,
      keywords: [
        'flight search',
        'compare flights',
        'cheap flights',
        searchData?.from?.city,
        searchData?.to?.city,
        searchData?.from?.code,
        searchData?.to?.code,
      ].filter((keyword): keyword is string => Boolean(keyword)),
      openGraph: {
        title,
        description,
        type: 'website',
        url: `${this.BASE_URL}/search`,
        images: [
          {
            url: `${this.BASE_URL}/images/og-search.jpg`,
            width: 1200,
            height: 630,
            alt: title,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
      },
    };
  }

  // Metadata for booking page
  static getBookingMetadata(bookingData?: BookingSEOData): Metadata {
    let title = 'Flight Booking';
    let description = 'Complete your flight booking securely and get instant confirmation.';

    if (bookingData?.bookingReference) {
      title = `Booking ${bookingData.bookingReference}`;
      description = `View your flight booking details for ${bookingData.bookingReference}. Check flight status, manage booking, and get support.`;
    }

    return {
      title,
      description,
      robots: {
        index: false,
        follow: false,
      },
      openGraph: {
        title,
        description,
        type: 'website',
      },
      twitter: {
        card: 'summary',
        title,
        description,
      },
    };
  }

  // Metadata for bookings list page
  static getBookingsListMetadata(): Metadata {
    return {
      title: 'My Bookings',
      description: 'View and manage all your flight bookings. Check flight status, modify bookings, and access e-tickets.',
      keywords: [
        'flight bookings',
        'manage bookings',
        'flight status',
        'e-tickets',
        'booking management'
      ],
      robots: {
        index: false,
        follow: false,
      },
      openGraph: {
        title: 'My Flight Bookings | FlightBooker',
        description: 'View and manage all your flight bookings in one place.',
        type: 'website',
      },
    };
  }

  // Metadata for price alerts page
  static getPriceAlertsMetadata(): Metadata {
    return {
      title: 'Price Alerts',
      description: 'Set up price alerts for your favorite routes and get notified when flight prices drop. Never miss a great deal!',
      keywords: [
        'flight price alerts',
        'price drop notifications',
        'cheap flight alerts',
        'flight deals',
        'price tracking'
      ],
      openGraph: {
        title: 'Flight Price Alerts | FlightBooker',
        description: 'Get notified when flight prices drop for your favorite routes.',
        type: 'website',
        url: `${this.BASE_URL}/price-alerts`,
      },
    };
  }

  // Generate JSON-LD structured data for flight search
  static getFlightSearchStructuredData(searchData?: FlightSEOData) {
    if (!searchData?.from || !searchData?.to) {
      return this.getWebsiteStructuredData();
    }

    return {
      '@context': 'https://schema.org',
      '@type': 'FlightReservation',
      reservationFor: {
        '@type': 'Flight',
        departureAirport: {
          '@type': 'Airport',
          iataCode: searchData.from.code,
          name: searchData.from.name,
        },
        arrivalAirport: {
          '@type': 'Airport',
          iataCode: searchData.to.code,
          name: searchData.to.name,
        },
        departureTime: searchData.departDate,
      },
      provider: {
        '@type': 'Organization',
        name: this.SITE_NAME,
        url: this.BASE_URL,
      },
    };
  }

  // Generate JSON-LD structured data for website
  static getWebsiteStructuredData() {
    return {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: this.SITE_NAME,
      url: this.BASE_URL,
      description: this.SITE_DESCRIPTION,
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${this.BASE_URL}/search?from={from}&to={to}&departDate={departDate}`,
        },
        'query-input': 'required name=from,to,departDate',
      },
      publisher: {
        '@type': 'Organization',
        name: this.SITE_NAME,
        logo: {
          '@type': 'ImageObject',
          url: `${this.BASE_URL}/images/logo.png`,
        },
      },
    };
  }

  // Generate JSON-LD structured data for breadcrumbs
  static getBreadcrumbStructuredData(breadcrumbs: Array<{ name: string; url: string }>) {
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbs.map((crumb, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: crumb.name,
        item: `${this.BASE_URL}${crumb.url}`,
      })),
    };
  }

  // Generate JSON-LD structured data for organization
  static getOrganizationStructuredData() {
    return {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: this.SITE_NAME,
      url: this.BASE_URL,
      logo: `${this.BASE_URL}/images/logo.png`,
      description: this.SITE_DESCRIPTION,
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: '+1-800-FLY-BOOK',
        contactType: 'Customer Service',
        availableLanguage: ['English'],
      },
      sameAs: [
        'https://twitter.com/flightbooker',
        'https://facebook.com/flightbooker',
        'https://linkedin.com/company/flightbooker',
      ],
    };
  }
}

export default FlightBookerSEO;