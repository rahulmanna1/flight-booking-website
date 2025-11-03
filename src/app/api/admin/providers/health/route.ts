/**
 * Admin API Route - Provider Health Check
 * Returns health status of all configured providers
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/middleware/adminAuth';
import { providerFactory } from '@/lib/providers/ProviderFactory';

// GET - Get health status of all providers
export async function GET(request: NextRequest) {
  return requireAdmin(request, async (req, admin) => {
    try {
      const healthStatuses = await providerFactory.getProviderHealthStatus();

      return NextResponse.json({
        success: true,
        providers: healthStatuses,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error fetching provider health:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch provider health status' },
        { status: 500 }
      );
    }
  });
}
