// Enhanced System Health Check API Endpoint
// Provides comprehensive health status for monitoring and debugging

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { checkProviderHealth } from '@/lib/flightProviders';
import { checkCriticalServices, getSafeEnvironmentInfo } from '@/lib/security/envValidator';

// Initialize Prisma client for database health check
const prisma = new PrismaClient();

interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  environment: string;
  uptime: number;
  checks: {
    database: {
      status: 'up' | 'down';
      responseTime?: number;
      error?: string;
    };
    amadeus: {
      status: 'up' | 'down' | 'not_configured';
      responseTime?: number;
      error?: string;
    };
    providers: Record<string, {
      available: boolean;
      configured: boolean;
      lastError?: string;
      responseTime?: number;
    }>;
    services: {
      authentication: boolean;
      payment: boolean;
      email: boolean;
    };
  };
  performance: {
    memoryUsage: NodeJS.MemoryUsage;
    platform: string;
    nodeVersion: string;
  };
  configuration?: {
    environment: Record<string, any>;
  };
}

// Database health check
async function checkDatabaseHealth(): Promise<{
  status: 'up' | 'down';
  responseTime?: number;
  error?: string;
}> {
  try {
    const startTime = Date.now();
    
    // Simple query to test connection
    await prisma.$queryRaw`SELECT 1`;
    
    const responseTime = Date.now() - startTime;
    
    return {
      status: 'up',
      responseTime
    };
  } catch (error: any) {
    console.error('Database health check failed:', error);
    return {
      status: 'down',
      error: error.message
    };
  } finally {
    await prisma.$disconnect();
  }
}

// Determine overall system status
function determineOverallStatus(checks: HealthCheckResult['checks']): 'healthy' | 'degraded' | 'unhealthy' {
  // System is unhealthy if database is down
  if (checks.database.status === 'down') {
    return 'unhealthy';
  }
  
  // System is degraded if Amadeus is configured but down
  const amadeusConfigured = checks.amadeus.status !== 'not_configured';
  if (amadeusConfigured && checks.amadeus.status === 'down') {
    return 'degraded';
  }
  
  // Check if any configured providers are down
  const configuredProviders = Object.values(checks.providers).filter(p => p.configured);
  const downProviders = configuredProviders.filter(p => !p.available);
  
  if (downProviders.length > 0) {
    return 'degraded';
  }
  
  return 'healthy';
}

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Check query parameters for detailed info
    const { searchParams } = new URL(request.url);
    const includeConfig = searchParams.get('config') === 'true';
    const format = searchParams.get('format') || 'json';
    
    console.log('🏥 Health check requested');
    
    // Run all health checks in parallel for better performance
    const [databaseHealth, providerHealth, criticalServices] = await Promise.allSettled([
      checkDatabaseHealth(),
      checkProviderHealth(),
      Promise.resolve(checkCriticalServices())
    ]);
    
    // Extract results, handling errors gracefully
    const dbHealth = databaseHealth.status === 'fulfilled' 
      ? databaseHealth.value 
      : { status: 'down' as const, error: 'Health check failed' };
    
    const providers = providerHealth.status === 'fulfilled' 
      ? providerHealth.value 
      : {};
    
    const services = criticalServices.status === 'fulfilled' 
      ? criticalServices.value 
      : { authentication: false, payment: false, email: false, amadeus: false, database: false };
    
    // Determine Amadeus specific status
    const amadeusStatus = services.amadeus 
      ? (providers.amadeus?.available ? 'up' : 'down')
      : 'not_configured';
    
    const healthResult: HealthCheckResult = {
      status: 'healthy', // Will be updated below
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'unknown',
      uptime: process.uptime(),
      checks: {
        database: dbHealth,
        amadeus: {
          status: amadeusStatus,
          responseTime: providers.amadeus?.responseTime,
          error: providers.amadeus?.lastError
        },
        providers,
        services: {
          authentication: services.authentication,
          payment: services.payment,
          email: services.email
        }
      },
      performance: {
        memoryUsage: process.memoryUsage(),
        platform: process.platform,
        nodeVersion: process.version
      }
    };
    
    // Add configuration info if requested (for debugging)
    if (includeConfig) {
      healthResult.configuration = {
        environment: getSafeEnvironmentInfo()
      };
    }
    
    // Determine overall status
    healthResult.status = determineOverallStatus(healthResult.checks);
    
    const responseTime = Date.now() - startTime;
    console.log(`✅ Health check completed in ${responseTime}ms - Status: ${healthResult.status}`);
    
    // Return different response formats
    if (format === 'simple') {
      return NextResponse.json({
        status: healthResult.status,
        timestamp: healthResult.timestamp,
        uptime: healthResult.uptime,
        database: dbHealth.status,
        amadeus: amadeusStatus
      });
    }
    
    // Set appropriate HTTP status code
    let statusCode = 200;
    if (healthResult.status === 'degraded') {
      statusCode = 200; // Still functional
    } else if (healthResult.status === 'unhealthy') {
      statusCode = 503; // Service Unavailable
    }
    
    return NextResponse.json(healthResult, { status: statusCode });
    
  } catch (error: any) {
    console.error('❌ Health check failed:', error);
    
    const errorResult = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      uptime: process.uptime()
    };
    
    return NextResponse.json(errorResult, { status: 500 });
  }
}

// HEAD request for simple uptime checks
export async function HEAD(request: NextRequest) {
  try {
    // Quick database ping
    await prisma.$queryRaw`SELECT 1`;
    await prisma.$disconnect();
    
    return new NextResponse(null, { status: 200 });
  } catch {
    return new NextResponse(null, { status: 503 });
  }
}
