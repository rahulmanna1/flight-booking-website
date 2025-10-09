// Application Instrumentation
// Runs on application startup to validate environment and initialize systems

import { initializeEnvironment } from '@/lib/security/envValidator';

export async function register() {
  // Only run in production and test environments to avoid development noise
  if (process.env.NODE_ENV === 'development') {
    return;
  }
  
  try {
    console.log('🚀 Initializing Flight Booking System...');
    
    // Validate environment variables
    const isValid = initializeEnvironment();
    
    if (!isValid) {
      console.error('❌ Critical environment variables missing! System may not function properly.');
      // In production, you might want to exit the process
      // process.exit(1);
    } else {
      console.log('✅ Environment validation passed');
    }
    
    console.log('🚀 Flight Booking System initialization complete');
    
  } catch (error) {
    console.error('❌ System initialization failed:', error);
    // Log error but don't crash the application
  }
}

// Edge runtime compatibility
export const runtime = 'nodejs';