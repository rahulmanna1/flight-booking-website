/**
 * Admin API Routes - Provider Management
 * Endpoints for managing flight API providers
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, logAdminAction } from '@/lib/middleware/adminAuth';
import { prisma } from '@/lib/prisma';
import { ProviderFactory } from '@/lib/providers/ProviderFactory';

// GET - List all providers
export async function GET(request: NextRequest) {
  return requireAdmin(request, async (req, admin) => {
    try {
      const providers = await prisma.apiProvider.findMany({
        orderBy: [
          { isPrimary: 'desc' },
          { priority: 'asc' },
        ],
      });

      // Parse JSON fields
      const formattedProviders = providers.map(p => ({
        ...p,
        credentials: JSON.parse(p.credentials),
        supportedFeatures: JSON.parse(p.supportedFeatures),
        healthCheckDetails: p.healthCheckDetails ? JSON.parse(p.healthCheckDetails) : null,
      }));

      return NextResponse.json({
        success: true,
        providers: formattedProviders,
      });
    } catch (error) {
      console.error('Error fetching providers:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch providers' },
        { status: 500 }
      );
    }
  });
}

// POST - Create new provider
export async function POST(request: NextRequest) {
  return requireAdmin(request, async (req, admin) => {
    try {
      const body = await req.json();
      
      const {
        name,
        displayName,
        provider,
        credentials,
        environment,
        isActive,
        priority,
        supportedFeatures,
      } = body;

      // Validate required fields
      if (!name || !displayName || !provider || !credentials) {
        return NextResponse.json(
          { success: false, error: 'Missing required fields' },
          { status: 400 }
        );
      }

      // Check if name already exists
      const existing = await prisma.apiProvider.findUnique({
        where: { name },
      });

      if (existing) {
        return NextResponse.json(
          { success: false, error: 'Provider with this name already exists' },
          { status: 400 }
        );
      }

      // Encrypt credentials
      const encryptedCreds = ProviderFactory.encryptCredentials(credentials);

      // Create provider
      const newProvider = await prisma.apiProvider.create({
        data: {
          name,
          displayName,
          provider,
          credentials: encryptedCreds,
          environment: environment || 'test',
          isActive: isActive ?? false,
          isPrimary: false, // New providers are never primary by default
          priority: priority ?? 100,
          supportedFeatures: JSON.stringify(supportedFeatures || []),
        },
      });

      // Log admin action
      await logAdminAction(
        admin,
        'CREATE_API_PROVIDER',
        'API_PROVIDER_CHANGE',
        {
          providerId: newProvider.id,
          providerName: newProvider.name,
          providerType: newProvider.provider,
        },
        req
      );

      return NextResponse.json({
        success: true,
        provider: {
          ...newProvider,
          credentials: credentials, // Return unencrypted for display
          supportedFeatures: supportedFeatures || [],
        },
      });
    } catch (error) {
      console.error('Error creating provider:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to create provider' },
        { status: 500 }
      );
    }
  });
}

// PUT - Update provider
export async function PUT(request: NextRequest) {
  return requireAdmin(request, async (req, admin) => {
    try {
      const body = await req.json();
      
      const {
        id,
        displayName,
        credentials,
        environment,
        isActive,
        priority,
        supportedFeatures,
      } = body;

      if (!id) {
        return NextResponse.json(
          { success: false, error: 'Provider ID is required' },
          { status: 400 }
        );
      }

      // Build update data
      const updateData: any = {};
      
      if (displayName !== undefined) updateData.displayName = displayName;
      if (environment !== undefined) updateData.environment = environment;
      if (isActive !== undefined) updateData.isActive = isActive;
      if (priority !== undefined) updateData.priority = priority;
      
      if (credentials !== undefined) {
        updateData.credentials = ProviderFactory.encryptCredentials(credentials);
      }
      
      if (supportedFeatures !== undefined) {
        updateData.supportedFeatures = JSON.stringify(supportedFeatures);
      }

      // Update provider
      const updatedProvider = await prisma.apiProvider.update({
        where: { id },
        data: updateData,
      });

      // Log admin action
      await logAdminAction(
        admin,
        'UPDATE_API_PROVIDER',
        'API_PROVIDER_CHANGE',
        {
          providerId: updatedProvider.id,
          providerName: updatedProvider.name,
          changes: Object.keys(updateData),
        },
        req
      );

      return NextResponse.json({
        success: true,
        provider: {
          ...updatedProvider,
          credentials: credentials || JSON.parse(updatedProvider.credentials),
          supportedFeatures: JSON.parse(updatedProvider.supportedFeatures),
        },
      });
    } catch (error) {
      console.error('Error updating provider:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to update provider' },
        { status: 500 }
      );
    }
  });
}

// DELETE - Remove provider
export async function DELETE(request: NextRequest) {
  return requireAdmin(request, async (req, admin) => {
    try {
      const { searchParams } = new URL(req.url);
      const id = searchParams.get('id');

      if (!id) {
        return NextResponse.json(
          { success: false, error: 'Provider ID is required' },
          { status: 400 }
        );
      }

      // Check if it's the primary provider
      const provider = await prisma.apiProvider.findUnique({
        where: { id },
      });

      if (!provider) {
        return NextResponse.json(
          { success: false, error: 'Provider not found' },
          { status: 404 }
        );
      }

      if (provider.isPrimary) {
        return NextResponse.json(
          { success: false, error: 'Cannot delete primary provider. Switch primary first.' },
          { status: 400 }
        );
      }

      // Delete provider
      await prisma.apiProvider.delete({
        where: { id },
      });

      // Log admin action
      await logAdminAction(
        admin,
        'DELETE_API_PROVIDER',
        'API_PROVIDER_CHANGE',
        {
          providerId: id,
          providerName: provider.name,
          providerType: provider.provider,
        },
        req
      );

      return NextResponse.json({
        success: true,
        message: 'Provider deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting provider:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to delete provider' },
        { status: 500 }
      );
    }
  });
}
