import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Cache for settings to reduce database queries
let settingsCache: Record<string, string> = {};
let cacheTimestamp = 0;
const CACHE_TTL = 60000; // 1 minute

/**
 * Get all system settings
 */
export async function getAllSettings(forceRefresh = false): Promise<Record<string, string>> {
  const now = Date.now();
  
  // Return cache if valid and not forcing refresh
  if (!forceRefresh && Object.keys(settingsCache).length > 0 && now - cacheTimestamp < CACHE_TTL) {
    return settingsCache;
  }

  try {
    const settings = await prisma.systemConfig.findMany();
    
    // Build settings map
    const settingsMap: Record<string, string> = {};
    settings.forEach((setting) => {
      settingsMap[setting.key] = setting.value;
    });

    // Update cache
    settingsCache = settingsMap;
    cacheTimestamp = now;

    return settingsMap;
  } catch (error) {
    console.error('Error fetching settings:', error);
    return settingsCache; // Return cached data on error
  }
}

/**
 * Get a specific setting value
 */
export async function getSetting(key: string, defaultValue: string = ''): Promise<string> {
  try {
    const setting = await prisma.systemConfig.findUnique({
      where: { key },
    });

    return setting?.value || defaultValue;
  } catch (error) {
    console.error(`Error fetching setting ${key}:`, error);
    return defaultValue;
  }
}

/**
 * Get a setting as a number
 */
export async function getSettingAsNumber(key: string, defaultValue: number = 0): Promise<number> {
  const value = await getSetting(key, String(defaultValue));
  const parsed = parseFloat(value);
  return isNaN(parsed) ? defaultValue : parsed;
}

/**
 * Get a setting as a boolean
 */
export async function getSettingAsBoolean(key: string, defaultValue: boolean = false): Promise<boolean> {
  const value = await getSetting(key, String(defaultValue));
  return value === 'true' || value === '1';
}

/**
 * Update a setting value
 */
export async function updateSetting(key: string, value: string): Promise<void> {
  try {
    await prisma.systemConfig.upsert({
      where: { key },
      update: { value },
      create: {
        key,
        value,
        description: 'Custom setting',
        category: 'custom',
      },
    });

    // Invalidate cache
    settingsCache = {};
    cacheTimestamp = 0;
  } catch (error) {
    console.error(`Error updating setting ${key}:`, error);
    throw error;
  }
}

/**
 * Get settings by category
 */
export async function getSettingsByCategory(category: string): Promise<Record<string, string>> {
  try {
    const settings = await prisma.systemConfig.findMany({
      where: { category },
    });

    const settingsMap: Record<string, string> = {};
    settings.forEach((setting) => {
      settingsMap[setting.key] = setting.value;
    });

    return settingsMap;
  } catch (error) {
    console.error(`Error fetching settings for category ${category}:`, error);
    return {};
  }
}

/**
 * Clear settings cache (useful after bulk updates)
 */
export function clearSettingsCache(): void {
  settingsCache = {};
  cacheTimestamp = 0;
}

/**
 * Helper functions for common settings
 */
export const Settings = {
  // Site Configuration
  getSiteName: () => getSetting('site_name', 'FlightBooker'),
  getSiteUrl: () => getSetting('site_url', 'http://localhost:3000'),
  getSupportEmail: () => getSetting('support_email', 'support@flightbooker.com'),
  getCompanyName: () => getSetting('company_name', 'FlightBooker Inc.'),

  // Email Configuration
  getSmtpHost: () => getSetting('smtp_host', 'smtp.gmail.com'),
  getSmtpPort: () => getSettingAsNumber('smtp_port', 587),
  getSmtpUsername: () => getSetting('smtp_username', ''),
  getFromEmail: () => getSetting('from_email', 'noreply@flightbooker.com'),
  getFromName: () => getSetting('from_name', 'FlightBooker'),

  // Currency & Localization
  getDefaultCurrency: () => getSetting('default_currency', 'USD'),
  getDefaultLanguage: () => getSetting('default_language', 'en'),
  getTimezone: () => getSetting('timezone', 'UTC'),

  // Booking Configuration
  getCancellationWindowHours: () => getSettingAsNumber('cancellation_window_hours', 24),
  getRefundProcessingDays: () => getSettingAsNumber('refund_processing_days', 7),
  getBookingHoldTimeMinutes: () => getSettingAsNumber('booking_hold_time_minutes', 15),

  // Notification Settings
  isEmailNotificationsEnabled: () => getSettingAsBoolean('email_notifications_enabled', true),
  isSmsNotificationsEnabled: () => getSettingAsBoolean('sms_notifications_enabled', false),
  isAdminAlertsEnabled: () => getSettingAsBoolean('admin_alerts_enabled', true),

  // API Configuration
  getApiRateLimit: () => getSettingAsNumber('api_rate_limit', 100),
  getSearchCacheDuration: () => getSettingAsNumber('search_cache_duration', 300),
};

export default {
  getAllSettings,
  getSetting,
  getSettingAsNumber,
  getSettingAsBoolean,
  updateSetting,
  getSettingsByCategory,
  clearSettingsCache,
  Settings,
};
