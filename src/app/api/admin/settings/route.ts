import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAuth } from '@/lib/middleware/adminAuth';
import { PrismaClient } from '@prisma/client';
import { createAuditLog } from '@/lib/services/auditService';

const prisma = new PrismaClient();

// Default system settings with descriptions
const DEFAULT_SETTINGS = [
  // Site Configuration
  { key: 'site_name', value: 'FlightBooker', description: 'Website name displayed across the platform', category: 'site' },
  { key: 'site_url', value: 'http://localhost:3000', description: 'Base URL of the website', category: 'site' },
  { key: 'support_email', value: 'support@flightbooker.com', description: 'Customer support email address', category: 'site' },
  { key: 'company_name', value: 'FlightBooker Inc.', description: 'Legal company name', category: 'site' },
  
  // Email Configuration
  { key: 'smtp_host', value: 'smtp.gmail.com', description: 'SMTP server hostname', category: 'email' },
  { key: 'smtp_port', value: '587', description: 'SMTP server port', category: 'email' },
  { key: 'smtp_username', value: '', description: 'SMTP authentication username', category: 'email' },
  { key: 'from_email', value: 'noreply@flightbooker.com', description: 'Default sender email address', category: 'email' },
  { key: 'from_name', value: 'FlightBooker', description: 'Default sender name', category: 'email' },
  
  // Currency & Localization
  { key: 'default_currency', value: 'USD', description: 'Default currency for prices', category: 'localization' },
  { key: 'default_language', value: 'en', description: 'Default platform language', category: 'localization' },
  { key: 'timezone', value: 'UTC', description: 'Default timezone', category: 'localization' },
  
  // Booking Configuration
  { key: 'cancellation_window_hours', value: '24', description: 'Hours before departure when cancellation is allowed', category: 'booking' },
  { key: 'refund_processing_days', value: '7', description: 'Business days to process refunds', category: 'booking' },
  { key: 'booking_hold_time_minutes', value: '15', description: 'Minutes to hold a booking before payment', category: 'booking' },
  
  // Notification Settings
  { key: 'email_notifications_enabled', value: 'true', description: 'Enable email notifications', category: 'notifications' },
  { key: 'sms_notifications_enabled', value: 'false', description: 'Enable SMS notifications', category: 'notifications' },
  { key: 'admin_alerts_enabled', value: 'true', description: 'Enable admin alerts', category: 'notifications' },
  
  // API Configuration
  { key: 'api_rate_limit', value: '100', description: 'API requests per minute limit', category: 'api' },
  { key: 'search_cache_duration', value: '300', description: 'Flight search cache duration in seconds', category: 'api' },
];

// GET - Fetch all system settings
export async function GET(req: NextRequest) {
  try {
    const authResult = await verifyAdminAuth(req);
    if (!authResult.valid) {
      return NextResponse.json({ error: authResult.error }, { status: 403 });
    }

    const { user } = authResult;

    // Fetch all settings
    let settings = await prisma.systemConfig.findMany({
      orderBy: [{ category: 'asc' }, { key: 'asc' }],
    });

    // If no settings exist, initialize with defaults
    if (settings.length === 0) {
      console.log('Initializing default system settings...');
      const createdSettings = await Promise.all(
        DEFAULT_SETTINGS.map((setting) =>
          prisma.systemConfig.create({
            data: setting,
          })
        )
      );
      settings = createdSettings;

      // Log initialization
      await createAuditLog({
        action: 'System settings initialized',
        category: 'SYSTEM_CONFIG',
        severity: 'INFO',
        userId: user.id,
        userEmail: user.email,
        userRole: user.role,
        details: { settingsCount: settings.length },
      });
    }

    return NextResponse.json({ settings }, { status: 200 });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

// PUT - Update system settings
export async function PUT(req: NextRequest) {
  try {
    const authResult = await verifyAdminAuth(req);
    if (!authResult.valid) {
      return NextResponse.json({ error: authResult.error }, { status: 403 });
    }

    const { user } = authResult;

    if (user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden - Super Admin only' }, { status: 403 });
    }

    const body = await req.json();
    const { settings } = body;

    if (!settings || typeof settings !== 'object') {
      return NextResponse.json({ error: 'Invalid settings data' }, { status: 400 });
    }

    // Track changes for audit log
    const changes: any[] = [];
    const updates: any[] = [];

    // Update each setting
    for (const [key, value] of Object.entries(settings)) {
      if (typeof value !== 'string') continue;

      // Check if setting exists
      const existing = await prisma.systemConfig.findUnique({
        where: { key },
      });

      if (existing) {
        // Update existing setting
        if (existing.value !== value) {
          updates.push(
            prisma.systemConfig.update({
              where: { key },
              data: { value },
            })
          );
          changes.push({
            key,
            oldValue: existing.value,
            newValue: value,
          });
        }
      } else {
        // Create new setting if it doesn't exist
        const defaultSetting = DEFAULT_SETTINGS.find((s) => s.key === key);
        updates.push(
          prisma.systemConfig.create({
            data: {
              key,
              value,
              description: defaultSetting?.description || 'Custom setting',
              category: defaultSetting?.category || 'custom',
            },
          })
        );
        changes.push({
          key,
          oldValue: null,
          newValue: value,
        });
      }
    }

    // Execute all updates
    if (updates.length > 0) {
      await Promise.all(updates);
    }

    // Create audit log
    await createAuditLog({
      action: 'System settings updated',
      category: 'SYSTEM_CONFIG',
      severity: 'INFO',
      userId: user.id,
      userEmail: user.email,
      userRole: user.role,
      details: {
        changesCount: changes.length,
        changes,
      },
    });

    // Fetch updated settings
    const updatedSettings = await prisma.systemConfig.findMany({
      orderBy: [{ category: 'asc' }, { key: 'asc' }],
    });

    return NextResponse.json(
      {
        message: 'Settings updated successfully',
        settings: updatedSettings,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}

// POST - Create new setting
export async function POST(req: NextRequest) {
  try {
    const authResult = await verifyAdminAuth(req);
    if (!authResult.valid) {
      return NextResponse.json({ error: authResult.error }, { status: 403 });
    }

    const { user } = authResult;

    if (user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden - Super Admin only' }, { status: 403 });
    }

    const body = await req.json();
    const { key, value, description, category } = body;

    if (!key || !value) {
      return NextResponse.json({ error: 'Key and value are required' }, { status: 400 });
    }

    // Check if setting already exists
    const existing = await prisma.systemConfig.findUnique({
      where: { key },
    });

    if (existing) {
      return NextResponse.json({ error: 'Setting already exists' }, { status: 409 });
    }

    // Create new setting
    const setting = await prisma.systemConfig.create({
      data: {
        key,
        value,
        description: description || 'Custom setting',
        category: category || 'custom',
      },
    });

    // Create audit log
    await createAuditLog({
      action: 'System setting created',
      category: 'SYSTEM_CONFIG',
      severity: 'INFO',
      userId: user.id,
      userEmail: user.email,
      userRole: user.role,
      details: { key, value },
    });

    return NextResponse.json({ setting }, { status: 201 });
  } catch (error) {
    console.error('Error creating setting:', error);
    return NextResponse.json(
      { error: 'Failed to create setting' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a setting
export async function DELETE(req: NextRequest) {
  try {
    const authResult = await verifyAdminAuth(req);
    if (!authResult.valid) {
      return NextResponse.json({ error: authResult.error }, { status: 403 });
    }

    const { user } = authResult;

    if (user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden - Super Admin only' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const key = searchParams.get('key');

    if (!key) {
      return NextResponse.json({ error: 'Key is required' }, { status: 400 });
    }

    // Check if it's a default setting (prevent deletion)
    const isDefault = DEFAULT_SETTINGS.some((s) => s.key === key);
    if (isDefault) {
      return NextResponse.json(
        { error: 'Cannot delete default system settings' },
        { status: 403 }
      );
    }

    // Delete setting
    await prisma.systemConfig.delete({
      where: { key },
    });

    // Create audit log
    await createAuditLog({
      action: 'System setting deleted',
      category: 'SYSTEM_CONFIG',
      severity: 'WARNING',
      userId: user.id,
      userEmail: user.email,
      userRole: user.role,
      details: { key },
    });

    return NextResponse.json({ message: 'Setting deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting setting:', error);
    return NextResponse.json(
      { error: 'Failed to delete setting' },
      { status: 500 }
    );
  }
}
