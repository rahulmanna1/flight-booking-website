/**
 * Provider Metrics API Endpoint
 * Returns health status, metrics, and configuration for all providers
 * 
 * GET /api/admin/providers/metrics
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { providerFactory } from '@/lib/providers/ProviderFactory';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
      select: { role: true },
    });

    if (user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    // Get provider health status from factory
    const providerStatuses = await providerFactory.getProviderHealthStatus();

    // Get provider configurations from database
    const dbProviders = await prisma.apiProvider.findMany({
      orderBy: [{ isPrimary: 'desc' }, { priority: 'asc' }],
      select: {
        id: true,
        name: true,
        displayName: true,
        provider: true,
        environment: true,
        isActive: true,
        isPrimary: true,
        priority: true,
        totalRequests: true,
        successfulRequests: true,
        failedRequests: true,
        lastUsedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Combine runtime metrics with DB config
    const combinedData = dbProviders.map(dbProvider => {
      const runtimeStatus = providerStatuses.find(
        (status: any) => status.name === dbProvider.name
      );

      return {
        // Database config
        id: dbProvider.id,
        name: dbProvider.name,
        displayName: dbProvider.displayName,
        providerType: dbProvider.provider,
        environment: dbProvider.environment,
        isActive: dbProvider.isActive,
        isPrimary: dbProvider.isPrimary,
        priority: dbProvider.priority,
        lastUsedAt: dbProvider.lastUsedAt,
        createdAt: dbProvider.createdAt,
        updatedAt: dbProvider.updatedAt,

        // Database statistics
        stats: {
          totalRequests: dbProvider.totalRequests,
          successfulRequests: dbProvider.successfulRequests,
          failedRequests: dbProvider.failedRequests,
          successRate: dbProvider.totalRequests > 0
            ? ((dbProvider.successfulRequests / dbProvider.totalRequests) * 100).toFixed(2)
            : '0.00',
        },

        // Runtime metrics (from provider instance)
        metrics: runtimeStatus?.metrics || null,

        // Runtime health status
        health: runtimeStatus?.health || {
          isHealthy: false,
          message: 'Provider not initialized',
          lastChecked: new Date(),
          errorCount: 0,
          successRate: 0,
        },
      };
    });

    // Calculate system-wide statistics
    const systemStats = {
      totalProviders: dbProviders.length,
      activeProviders: dbProviders.filter(p => p.isActive).length,
      healthyProviders: combinedData.filter(p => p.health.isHealthy).length,
      totalRequests: dbProviders.reduce((sum, p) => sum + p.totalRequests, 0),
      totalSuccessful: dbProviders.reduce((sum, p) => sum + p.successfulRequests, 0),
      totalFailed: dbProviders.reduce((sum, p) => sum + p.failedRequests, 0),
      averageSuccessRate: dbProviders.length > 0
        ? (dbProviders.reduce((sum, p) => {
            const rate = p.totalRequests > 0 
              ? (p.successfulRequests / p.totalRequests) * 100 
              : 0;
            return sum + rate;
          }, 0) / dbProviders.length).toFixed(2)
        : '0.00',
    };

    // Get environment configuration
    const config = {
      enableMultiProvider: process.env.ENABLE_MULTI_PROVIDER === 'true',
      defaultProvider: process.env.DEFAULT_PROVIDER || 'AMADEUS',
      maxParallelProviders: parseInt(process.env.MAX_PARALLEL_PROVIDERS || '3', 10),
      providerTimeoutMs: parseInt(process.env.PROVIDER_TIMEOUT_MS || '5000', 10),
    };

    return NextResponse.json({
      success: true,
      data: {
        providers: combinedData,
        systemStats,
        config,
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Provider metrics API error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch provider metrics',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
