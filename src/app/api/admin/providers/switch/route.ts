/**
 * Admin API Route - Switch Primary Provider
 * Allows admins to change the primary flight API provider
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, logAdminAction } from '@/lib/middleware/adminAuth';
import { providerFactory } from '@/lib/providers/ProviderFactory';

// POST - Switch primary provider
export async function POST(request: NextRequest) {
  return requireAdmin(request, async (req, admin) => {
    try {
      const body = await req.json();
      const { providerName } = body;

      if (!providerName) {
        return NextResponse.json(
          { success: false, error: 'Provider name is required' },
          { status: 400 }
        );
      }

      // Switch primary provider
      await providerFactory.switchPrimaryProvider(providerName);

      // Log admin action
      await logAdminAction(
        admin,
        'SWITCH_PRIMARY_PROVIDER',
        'API_PROVIDER_CHANGE',
        {
          newPrimaryProvider: providerName,
        },
        req
      );

      return NextResponse.json({
        success: true,
        message: `Primary provider switched to ${providerName}`,
        providerName,
      });
    } catch (error) {
      console.error('Error switching provider:', error);
      return NextResponse.json(
        { 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to switch provider' 
        },
        { status: 500 }
      );
    }
  });
}
