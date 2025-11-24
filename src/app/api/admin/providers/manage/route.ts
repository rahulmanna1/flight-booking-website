/**
 * Provider Management API Endpoint
 * Handles provider configuration updates (enable/disable, priority, primary)
 * 
 * POST /api/admin/providers/manage
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { providerFactory } from '@/lib/providers/ProviderFactory';
import { prisma } from '@/lib/prisma';

interface ManageProviderRequest {
  action: 'toggle' | 'setPrimary' | 'updatePriority' | 'testHealth';
  providerId: string;
  value?: boolean | number;
}

export async function POST(request: NextRequest) {
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
      select: { role: true, id: true },
    });

    if (user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    // Parse request body
    const body: ManageProviderRequest = await request.json();
    const { action, providerId, value } = body;

    if (!action || !providerId) {
      return NextResponse.json(
        { error: 'Missing required fields: action, providerId' },
        { status: 400 }
      );
    }

    // Get provider from database
    const provider = await prisma.apiProvider.findUnique({
      where: { id: providerId },
    });

    if (!provider) {
      return NextResponse.json(
        { error: 'Provider not found' },
        { status: 404 }
      );
    }

    let updatedProvider;
    let message = '';

    switch (action) {
      case 'toggle':
        // Toggle provider active status
        const newActiveStatus = typeof value === 'boolean' ? value : !provider.isActive;
        
        updatedProvider = await prisma.apiProvider.update({
          where: { id: providerId },
          data: { isActive: newActiveStatus },
        });

        // Log the action
        await prisma.auditLog.create({
          data: {
            userId: user.id,
            action: newActiveStatus ? 'PROVIDER_ENABLED' : 'PROVIDER_DISABLED',
            entityType: 'API_PROVIDER',
            entityId: providerId,
            details: JSON.stringify({
              providerName: provider.name,
              previousStatus: provider.isActive,
              newStatus: newActiveStatus,
            }),
            ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
            userAgent: request.headers.get('user-agent') || 'unknown',
          },
        });

        message = `Provider ${newActiveStatus ? 'enabled' : 'disabled'} successfully`;
        break;

      case 'setPrimary':
        // Set provider as primary (and unset others)
        await prisma.$transaction([
          // Remove primary flag from all providers
          prisma.apiProvider.updateMany({
            where: { isPrimary: true },
            data: { isPrimary: false },
          }),
          // Set this provider as primary
          prisma.apiProvider.update({
            where: { id: providerId },
            data: { 
              isPrimary: true,
              isActive: true, // Auto-enable when setting as primary
            },
          }),
        ]);

        // Update provider factory
        await providerFactory.switchPrimaryProvider(provider.name);

        updatedProvider = await prisma.apiProvider.findUnique({
          where: { id: providerId },
        });

        // Log the action
        await prisma.auditLog.create({
          data: {
            userId: user.id,
            action: 'PROVIDER_SET_PRIMARY',
            entityType: 'API_PROVIDER',
            entityId: providerId,
            details: JSON.stringify({
              providerName: provider.name,
            }),
            ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
            userAgent: request.headers.get('user-agent') || 'unknown',
          },
        });

        message = 'Primary provider updated successfully';
        break;

      case 'updatePriority':
        // Update provider priority
        if (typeof value !== 'number') {
          return NextResponse.json(
            { error: 'Priority value must be a number' },
            { status: 400 }
          );
        }

        updatedProvider = await prisma.apiProvider.update({
          where: { id: providerId },
          data: { priority: value },
        });

        // Log the action
        await prisma.auditLog.create({
          data: {
            userId: user.id,
            action: 'PROVIDER_PRIORITY_UPDATED',
            entityType: 'API_PROVIDER',
            entityId: providerId,
            details: JSON.stringify({
              providerName: provider.name,
              previousPriority: provider.priority,
              newPriority: value,
            }),
            ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
            userAgent: request.headers.get('user-agent') || 'unknown',
          },
        });

        message = 'Provider priority updated successfully';
        break;

      case 'testHealth':
        // Test provider health
        const healthStatus = await providerFactory.getProviderHealthStatus();
        const providerHealth = healthStatus.find((s: any) => s.name === provider.name);

        if (!providerHealth) {
          return NextResponse.json(
            { 
              success: false,
              error: 'Provider not initialized or not found',
            },
            { status: 404 }
          );
        }

        return NextResponse.json({
          success: true,
          data: {
            provider: provider.name,
            health: providerHealth.health,
            metrics: providerHealth.metrics,
          },
          message: 'Health check completed',
          timestamp: new Date().toISOString(),
        });

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      data: updatedProvider,
      message,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Provider management API error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to manage provider',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
