import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

interface JWTPayload {
  userId: string;
  email: string;
}

interface NotificationPreferences {
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  notificationTypes: {
    bookingConfirmation: boolean;
    bookingReminder: boolean;
    checkInReminder: boolean;
    flightDelays: boolean;
    flightCancellations: boolean;
    priceAlerts: boolean;
    promotions: boolean;
  };
}

// GET - Fetch user notification preferences
export async function GET(request: NextRequest) {
  try {
    // Extract and verify JWT token
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const JWT_SECRET = process.env.JWT_SECRET;

    if (!JWT_SECRET) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    let decoded: JWTPayload;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Fetch user preferences (stored in user's preferences JSON field)
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        preferences: true, // Assuming this is a JSON field
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Parse preferences or return defaults
    let preferences: NotificationPreferences;
    try {
      preferences = user.preferences 
        ? (typeof user.preferences === 'string' ? JSON.parse(user.preferences) : user.preferences)
        : getDefaultPreferences();
    } catch {
      preferences = getDefaultPreferences();
    }

    return NextResponse.json({
      preferences,
    });

  } catch (error) {
    console.error('❌ Get preferences error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch preferences' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// PUT - Update user notification preferences
export async function PUT(request: NextRequest) {
  try {
    // Extract and verify JWT token
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const JWT_SECRET = process.env.JWT_SECRET;

    if (!JWT_SECRET) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    let decoded: JWTPayload;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { preferences } = body;

    if (!preferences) {
      return NextResponse.json({ error: 'Preferences are required' }, { status: 400 });
    }

    // Validate preferences structure
    const validatedPreferences = validatePreferences(preferences);

    // Update user preferences
    const updatedUser = await prisma.user.update({
      where: { id: decoded.userId },
      data: {
        preferences: validatedPreferences as any, // Cast to any for Prisma JSON type
      },
      select: {
        id: true,
        email: true,
        preferences: true,
      },
    });

    console.log(`✅ Updated notification preferences for user ${decoded.userId}`);

    return NextResponse.json({
      message: 'Preferences updated successfully',
      preferences: updatedUser.preferences,
    });

  } catch (error) {
    console.error('❌ Update preferences error:', error);
    return NextResponse.json(
      { error: 'Failed to update preferences' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// Helper function to get default preferences
function getDefaultPreferences(): NotificationPreferences {
  return {
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    notificationTypes: {
      bookingConfirmation: true,
      bookingReminder: true,
      checkInReminder: true,
      flightDelays: true,
      flightCancellations: true,
      priceAlerts: true,
      promotions: false,
    },
  };
}

// Helper function to validate preferences
function validatePreferences(preferences: any): NotificationPreferences {
  const defaults = getDefaultPreferences();

  return {
    emailNotifications: typeof preferences.emailNotifications === 'boolean' 
      ? preferences.emailNotifications 
      : defaults.emailNotifications,
    pushNotifications: typeof preferences.pushNotifications === 'boolean'
      ? preferences.pushNotifications
      : defaults.pushNotifications,
    smsNotifications: typeof preferences.smsNotifications === 'boolean'
      ? preferences.smsNotifications
      : defaults.smsNotifications,
    notificationTypes: {
      bookingConfirmation: typeof preferences.notificationTypes?.bookingConfirmation === 'boolean'
        ? preferences.notificationTypes.bookingConfirmation
        : defaults.notificationTypes.bookingConfirmation,
      bookingReminder: typeof preferences.notificationTypes?.bookingReminder === 'boolean'
        ? preferences.notificationTypes.bookingReminder
        : defaults.notificationTypes.bookingReminder,
      checkInReminder: typeof preferences.notificationTypes?.checkInReminder === 'boolean'
        ? preferences.notificationTypes.checkInReminder
        : defaults.notificationTypes.checkInReminder,
      flightDelays: typeof preferences.notificationTypes?.flightDelays === 'boolean'
        ? preferences.notificationTypes.flightDelays
        : defaults.notificationTypes.flightDelays,
      flightCancellations: typeof preferences.notificationTypes?.flightCancellations === 'boolean'
        ? preferences.notificationTypes.flightCancellations
        : defaults.notificationTypes.flightCancellations,
      priceAlerts: typeof preferences.notificationTypes?.priceAlerts === 'boolean'
        ? preferences.notificationTypes.priceAlerts
        : defaults.notificationTypes.priceAlerts,
      promotions: typeof preferences.notificationTypes?.promotions === 'boolean'
        ? preferences.notificationTypes.promotions
        : defaults.notificationTypes.promotions,
    },
  };
}
