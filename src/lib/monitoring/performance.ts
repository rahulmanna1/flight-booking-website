// Performance monitoring and analytics utilities

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  url?: string;
  userAgent?: string;
}

interface AnalyticsEvent {
  name: string;
  properties: Record<string, any>;
  timestamp: number;
  url?: string;
  userId?: string;
}

// Simple in-memory storage (in production, send to analytics service)
const performanceMetrics: PerformanceMetric[] = [];
const analyticsEvents: AnalyticsEvent[] = [];

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  
  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  // Track Core Web Vitals
  public trackWebVitals(): void {
    if (typeof window === 'undefined') return;
    
    try {

    // Largest Contentful Paint (LCP)
    this.observeMetric('LCP', (entry: PerformanceEntry) => {
      this.recordMetric('lcp', (entry as any).startTime);
    });

    // First Input Delay (FID)
    this.observeMetric('FID', (entry: PerformanceEntry) => {
      this.recordMetric('fid', (entry as any).processingStart - entry.startTime);
    });

    // Cumulative Layout Shift (CLS)
    this.observeMetric('CLS', (entry: PerformanceEntry) => {
      this.recordMetric('cls', (entry as any).value);
    });

    // First Contentful Paint (FCP)
    this.observeMetric('FCP', (entry: PerformanceEntry) => {
      this.recordMetric('fcp', entry.startTime);
    });

    // Time to First Byte (TTFB) - use performance.timing for better compatibility
    if (typeof window !== 'undefined' && window.performance?.timing) {
      window.addEventListener('load', () => {
        try {
          const timing = window.performance.timing;
          this.recordMetric('ttfb', timing.responseStart - timing.requestStart);
        } catch (error) {
          console.warn('Failed to record TTFB metric:', error);
        }
      });
    }
    } catch (error) {
      console.warn('Failed to initialize web vitals tracking:', error);
    }
  }

  private observeMetric(type: string, callback: (entry: PerformanceEntry) => void): void {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          callback(entry);
        }
      });

      observer.observe({ type, buffered: true });
    } catch (error) {
      console.warn(`Performance observer for ${type} not supported`, error);
    }
  }

  // Record custom performance metrics
  public recordMetric(name: string, value: number, url?: string): void {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      url: url || (typeof window !== 'undefined' ? window.location.href : undefined),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
    };

    performanceMetrics.push(metric);

    // In production, send to analytics service
    if (process.env.NODE_ENV === 'production') {
      this.sendToAnalyticsService(metric);
    }
  }

  // Track page load time
  public trackPageLoad(): void {
    if (typeof window === 'undefined') return;

    try {
      window.addEventListener('load', () => {
        try {
          const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
          
          if (navigation) {
            // Use fetchStart as baseline for better compatibility
            this.recordMetric('page_load_time', navigation.loadEventEnd - navigation.fetchStart);
            this.recordMetric('dom_content_loaded', navigation.domContentLoadedEventEnd - navigation.fetchStart);
            this.recordMetric('dom_interactive', navigation.domInteractive - navigation.fetchStart);
          }
        } catch (error) {
          console.warn('Failed to record page load metrics:', error);
        }
      });
    } catch (error) {
      console.warn('Failed to initialize page load tracking:', error);
    }
  }

  // Track user interactions
  public trackUserInteraction(action: string, properties: Record<string, any> = {}): void {
    const event: AnalyticsEvent = {
      name: `user_${action}`,
      properties,
      timestamp: Date.now(),
      url: typeof window !== 'undefined' ? window.location.href : undefined,
    };

    analyticsEvents.push(event);

    // In production, send to analytics service
    if (process.env.NODE_ENV === 'production') {
      this.sendEventToAnalyticsService(event);
    }
  }

  // Track flight booking specific events
  public trackFlightEvent(event: 'search' | 'book' | 'payment' | 'cancellation', data: Record<string, any>): void {
    const flightEvent: AnalyticsEvent = {
      name: `flight_${event}`,
      properties: {
        ...data,
        category: 'flight_booking',
      },
      timestamp: Date.now(),
      url: typeof window !== 'undefined' ? window.location.href : undefined,
    };

    analyticsEvents.push(flightEvent);

    // In production, send to analytics service
    if (process.env.NODE_ENV === 'production') {
      this.sendEventToAnalyticsService(flightEvent);
    }
  }

  // Track API response times
  public trackApiResponseTime(endpoint: string, responseTime: number, status: number): void {
    this.recordMetric(`api_${endpoint.replace(/\//g, '_')}`, responseTime);
    
    this.trackUserInteraction('api_call', {
      endpoint,
      responseTime,
      status,
      category: 'api_performance',
    });
  }

  // Get performance summary
  public getPerformanceSummary(): {
    metrics: PerformanceMetric[];
    events: AnalyticsEvent[];
    summary: Record<string, { avg: number; count: number; min: number; max: number }>;
  } {
    const summary: Record<string, { avg: number; count: number; min: number; max: number }> = {};

    // Group metrics by name and calculate statistics
    performanceMetrics.forEach(metric => {
      if (!summary[metric.name]) {
        summary[metric.name] = { avg: 0, count: 0, min: Infinity, max: -Infinity };
      }
      
      const stat = summary[metric.name];
      stat.count++;
      stat.min = Math.min(stat.min, metric.value);
      stat.max = Math.max(stat.max, metric.value);
      stat.avg = ((stat.avg * (stat.count - 1)) + metric.value) / stat.count;
    });

    return {
      metrics: performanceMetrics.slice(-100), // Last 100 metrics
      events: analyticsEvents.slice(-100), // Last 100 events
      summary,
    };
  }

  private sendToAnalyticsService(metric: PerformanceMetric): void {
    // In production, replace with actual analytics service
    // Examples: Google Analytics, Mixpanel, PostHog, etc.
    
    // Example for Google Analytics 4
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'performance_metric', {
        metric_name: metric.name,
        metric_value: metric.value,
        custom_parameter_url: metric.url,
      });
    }

    // Example API call to custom analytics endpoint
    // fetch('/api/analytics/performance', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(metric),
    // }).catch(error => console.warn('Failed to send performance metric:', error));
  }

  private sendEventToAnalyticsService(event: AnalyticsEvent): void {
    // In production, replace with actual analytics service
    
    // Example for Google Analytics 4
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', event.name, event.properties);
    }

    // Example API call to custom analytics endpoint
    // fetch('/api/analytics/events', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(event),
    // }).catch(error => console.warn('Failed to send analytics event:', error));
  }
}

// Singleton instance
export const performanceMonitor = PerformanceMonitor.getInstance();

// Hook for React components to track performance
export function usePerformanceTracking() {
  return {
    trackEvent: (action: string, properties?: Record<string, any>) => {
      performanceMonitor.trackUserInteraction(action, properties);
    },
    trackFlightEvent: (event: 'search' | 'book' | 'payment' | 'cancellation', data: Record<string, any>) => {
      performanceMonitor.trackFlightEvent(event, data);
    },
    recordMetric: (name: string, value: number) => {
      performanceMonitor.recordMetric(name, value);
    },
  };
}

// Initialize performance monitoring
export function initializePerformanceMonitoring(): void {
  if (typeof window === 'undefined') {
    return; // Skip on server-side
  }
  
  try {
    performanceMonitor.trackWebVitals();
    performanceMonitor.trackPageLoad();

    // Track route changes in Next.js
    const handleRouteChange = (url: string) => {
      try {
        performanceMonitor.trackUserInteraction('route_change', { url });
      } catch (error) {
        console.warn('Failed to track route change:', error);
      }
    };

    // Listen for Next.js router events (for pages router)
    // Note: App Router doesn't expose router events on window object
    try {
      if ((window as any).next?.router?.events?.on) {
        (window as any).next.router.events.on('routeChangeComplete', handleRouteChange);
      }
    } catch (routerError) {
      // Silently handle router event setup failure - this is expected in App Router
      console.debug('Router events not available (expected in App Router):', routerError);
    }
    
    // For App Router, route changes are tracked via the PerformanceInit component
  } catch (error) {
    console.warn('Failed to initialize performance monitoring:', error);
  }
}
