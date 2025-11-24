'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import {
  Settings as SettingsIcon,
  Save,
  Loader2,
  Mail,
  Globe,
  DollarSign,
  Shield,
  Bell,
  Code,
  CheckCircle,
} from 'lucide-react';

interface SystemConfig {
  id: string;
  key: string;
  value: string;
  description: string;
  category: string;
}

export default function SystemSettingsPage() {
  const { user, isSuperAdmin, token, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState('');

  useEffect(() => {
    if (!authLoading && !isSuperAdmin) {
      router.push('/admin');
    }
  }, [authLoading, isSuperAdmin, router]);

  useEffect(() => {
    if (isSuperAdmin && token) {
      fetchSettings();
    }
  }, [isSuperAdmin, token]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/settings', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        const settingsMap: Record<string, string> = {};
        data.settings.forEach((s: SystemConfig) => {
          settingsMap[s.key] = s.value;
        });
        setSettings(settingsMap);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedMessage('');

    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ settings }),
      });

      if (response.ok) {
        setSavedMessage('Settings saved successfully!');
        setTimeout(() => setSavedMessage(''), 3000);
      } else {
        alert('Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key: string, value: string) => {
    setSettings({ ...settings, [key]: value });
  };

  if (authLoading || !isSuperAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
                <SettingsIcon className="w-8 h-8 mr-3 text-blue-600" />
                System Settings
              </h1>
              <p className="text-gray-600">
                Configure global system settings and preferences
              </p>
            </div>
            {savedMessage && (
              <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2 flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-green-800 font-medium">{savedMessage}</span>
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-6">
            {/* Site Configuration */}
            <SettingsSection
              icon={<Globe className="w-6 h-6" />}
              title="Site Configuration"
              description="Basic site information and branding"
            >
              <div className="space-y-4">
                <FormField
                  label="Site Name"
                  value={settings['site_name'] || ''}
                  onChange={(v) => updateSetting('site_name', v)}
                  placeholder="FlightBooker"
                />
                <FormField
                  label="Site URL"
                  value={settings['site_url'] || ''}
                  onChange={(v) => updateSetting('site_url', v)}
                  placeholder="https://flightbooker.com"
                />
                <FormField
                  label="Support Email"
                  type="email"
                  value={settings['support_email'] || ''}
                  onChange={(v) => updateSetting('support_email', v)}
                  placeholder="support@flightbooker.com"
                />
                <FormField
                  label="Company Name"
                  value={settings['company_name'] || ''}
                  onChange={(v) => updateSetting('company_name', v)}
                  placeholder="Flight Booker Inc."
                />
              </div>
            </SettingsSection>

            {/* Email Configuration */}
            <SettingsSection
              icon={<Mail className="w-6 h-6" />}
              title="Email Configuration"
              description="SMTP settings for sending emails"
            >
              <div className="space-y-4">
                <FormField
                  label="SMTP Host"
                  value={settings['smtp_host'] || ''}
                  onChange={(v) => updateSetting('smtp_host', v)}
                  placeholder="smtp.gmail.com"
                />
                <FormField
                  label="SMTP Port"
                  type="number"
                  value={settings['smtp_port'] || ''}
                  onChange={(v) => updateSetting('smtp_port', v)}
                  placeholder="587"
                />
                <FormField
                  label="SMTP Username"
                  value={settings['smtp_username'] || ''}
                  onChange={(v) => updateSetting('smtp_username', v)}
                  placeholder="your-email@gmail.com"
                />
                <FormField
                  label="From Email"
                  type="email"
                  value={settings['from_email'] || ''}
                  onChange={(v) => updateSetting('from_email', v)}
                  placeholder="noreply@flightbooker.com"
                />
                <FormField
                  label="From Name"
                  value={settings['from_name'] || ''}
                  onChange={(v) => updateSetting('from_name', v)}
                  placeholder="FlightBooker"
                />
              </div>
            </SettingsSection>

            {/* Currency & Localization */}
            <SettingsSection
              icon={<DollarSign className="w-6 h-6" />}
              title="Currency & Localization"
              description="Default currency and language settings"
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Default Currency
                  </label>
                  <select
                    value={settings['default_currency'] || 'USD'}
                    onChange={(e) => updateSetting('default_currency', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="GBP">GBP - British Pound</option>
                    <option value="JPY">JPY - Japanese Yen</option>
                    <option value="AUD">AUD - Australian Dollar</option>
                    <option value="CAD">CAD - Canadian Dollar</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Default Language
                  </label>
                  <select
                    value={settings['default_language'] || 'en'}
                    onChange={(e) => updateSetting('default_language', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                    <option value="ja">Japanese</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Timezone
                  </label>
                  <select
                    value={settings['timezone'] || 'UTC'}
                    onChange={(e) => updateSetting('timezone', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">Eastern Time (ET)</option>
                    <option value="America/Chicago">Central Time (CT)</option>
                    <option value="America/Denver">Mountain Time (MT)</option>
                    <option value="America/Los_Angeles">Pacific Time (PT)</option>
                    <option value="Europe/London">London (GMT)</option>
                    <option value="Asia/Tokyo">Tokyo (JST)</option>
                  </select>
                </div>
              </div>
            </SettingsSection>

            {/* Booking Configuration */}
            <SettingsSection
              icon={<Shield className="w-6 h-6" />}
              title="Booking Configuration"
              description="Booking rules and policies"
            >
              <div className="space-y-4">
                <FormField
                  label="Cancellation Window (hours)"
                  type="number"
                  value={settings['cancellation_window_hours'] || ''}
                  onChange={(v) => updateSetting('cancellation_window_hours', v)}
                  placeholder="24"
                  helpText="Number of hours before departure when cancellation is allowed"
                />
                <FormField
                  label="Refund Processing Days"
                  type="number"
                  value={settings['refund_processing_days'] || ''}
                  onChange={(v) => updateSetting('refund_processing_days', v)}
                  placeholder="7"
                  helpText="Number of business days to process refunds"
                />
                <FormField
                  label="Booking Hold Time (minutes)"
                  type="number"
                  value={settings['booking_hold_time_minutes'] || ''}
                  onChange={(v) => updateSetting('booking_hold_time_minutes', v)}
                  placeholder="15"
                  helpText="How long to hold a booking before payment"
                />
              </div>
            </SettingsSection>

            {/* Notification Settings */}
            <SettingsSection
              icon={<Bell className="w-6 h-6" />}
              title="Notification Settings"
              description="System notification preferences"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Email Notifications
                    </label>
                    <p className="text-sm text-gray-500">Send booking confirmations and updates</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings['email_notifications_enabled'] === 'true'}
                    onChange={(e) =>
                      updateSetting('email_notifications_enabled', e.target.checked ? 'true' : 'false')
                    }
                    className="w-5 h-5 text-blue-600 rounded"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      SMS Notifications
                    </label>
                    <p className="text-sm text-gray-500">Send SMS alerts for bookings</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings['sms_notifications_enabled'] === 'true'}
                    onChange={(e) =>
                      updateSetting('sms_notifications_enabled', e.target.checked ? 'true' : 'false')
                    }
                    className="w-5 h-5 text-blue-600 rounded"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Admin Alerts
                    </label>
                    <p className="text-sm text-gray-500">Notify admins of important events</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings['admin_alerts_enabled'] === 'true'}
                    onChange={(e) =>
                      updateSetting('admin_alerts_enabled', e.target.checked ? 'true' : 'false')
                    }
                    className="w-5 h-5 text-blue-600 rounded"
                  />
                </div>
              </div>
            </SettingsSection>

            {/* API Configuration */}
            <SettingsSection
              icon={<Code className="w-6 h-6" />}
              title="API Configuration"
              description="API rate limits and configurations"
            >
              <div className="space-y-4">
                <FormField
                  label="API Rate Limit (requests/minute)"
                  type="number"
                  value={settings['api_rate_limit'] || ''}
                  onChange={(v) => updateSetting('api_rate_limit', v)}
                  placeholder="100"
                />
                <FormField
                  label="Search Cache Duration (seconds)"
                  type="number"
                  value={settings['search_cache_duration'] || ''}
                  onChange={(v) => updateSetting('search_cache_duration', v)}
                  placeholder="300"
                  helpText="How long to cache flight search results"
                />
              </div>
            </SettingsSection>

            {/* Save Button */}
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <button
                type="button"
                onClick={() => router.push('/admin')}
                className="px-6 py-3 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
              >
                {saving && <Loader2 className="w-5 h-5 animate-spin" />}
                <Save className="w-5 h-5" />
                <span>{saving ? 'Saving...' : 'Save Settings'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </AdminLayout>
  );
}

// Settings Section Component
function SettingsSection({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center mb-4">
        <div className="p-2 bg-blue-100 rounded-lg text-blue-600 mr-3">{icon}</div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>
      <div className="mt-4">{children}</div>
    </div>
  );
}

// Form Field Component
function FormField({
  label,
  value,
  onChange,
  type = 'text',
  placeholder = '',
  helpText = '',
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  helpText?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      {helpText && <p className="mt-1 text-sm text-gray-500">{helpText}</p>}
    </div>
  );
}
