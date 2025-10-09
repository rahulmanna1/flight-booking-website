'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { initializePerformanceMonitoring, performanceMonitor } from '@/lib/monitoring/performance';

export function PerformanceInit() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Initialize performance monitoring with error handling
    try {
      initializePerformanceMonitoring();
    } catch (error) {
      console.warn('Failed to initialize performance monitoring:', error);
    }
  }, []);

  useEffect(() => {
    // Track route changes with error handling
    try {
      performanceMonitor.trackUserInteraction('route_change', { 
        pathname,
        category: 'navigation' 
      });
    } catch (error) {
      console.warn('Failed to track route change:', error);
    }
  }, [pathname]);

  // This component renders nothing but initializes performance monitoring
  return null;
}