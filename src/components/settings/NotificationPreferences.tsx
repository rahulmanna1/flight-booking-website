'use client';

import { useState, useEffect } from 'react';
import { Bell, Mail, Smartphone, MessageSquare, Check, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

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

export default function NotificationPreferences() {
  const { token } = useAuth();
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      const response = await fetch('/api/notifications/preferences', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPreferences(data.preferences);
      }
    } catch (error) {
      console.error('Failed to fetch preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async () => {
    if (!preferences) return;

    setSaving(true);
    setSaved(false);

    try {
      const response = await fetch('/api/notifications/preferences', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ preferences }),
      });

      if (response.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (error) {
      console.error('Failed to save preferences:', error);
    } finally {
      setSaving(false);
    }
  };

  const updatePreference = (key: keyof NotificationPreferences, value: boolean) => {
    if (!preferences) return;
    setPreferences({
      ...preferences,
      [key]: value,
    });
  };

  const updateNotificationType = (type: keyof NotificationPreferences['notificationTypes'], value: boolean) => {
    if (!preferences) return;
    setPreferences({
      ...preferences,
      notificationTypes: {
        ...preferences.notificationTypes,
        [type]: value,
      },
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (!preferences) {
    return (
      <div className="text-center p-12">
        <p className="text-gray-500">Failed to load preferences</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Bell className="w-6 h-6" />
          Notification Preferences
        </h2>
        <p className="text-gray-600 mt-1">
          Choose how you want to receive notifications
        </p>
      </div>

      {/* Delivery Channels */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">Delivery Channels</h3>
        </div>
        <div className="p-6 space-y-4">
          {/* Email Notifications */}
          <label className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Mail className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="font-medium text-gray-900">Email Notifications</div>
                <div className="text-sm text-gray-500">Receive updates via email</div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={preferences.emailNotifications}
              onChange={(e) => updatePreference('emailNotifications', e.target.checked)}
              className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
          </label>

          {/* Push Notifications */}
          <label className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="font-medium text-gray-900">Push Notifications</div>
                <div className="text-sm text-gray-500">Receive push notifications in-app</div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={preferences.pushNotifications}
              onChange={(e) => updatePreference('pushNotifications', e.target.checked)}
              className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
          </label>

          {/* SMS Notifications */}
          <label className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="font-medium text-gray-900">SMS Notifications</div>
                <div className="text-sm text-gray-500">Receive text messages (coming soon)</div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={preferences.smsNotifications}
              onChange={(e) => updatePreference('smsNotifications', e.target.checked)}
              disabled
              className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            />
          </label>
        </div>
      </div>

      {/* Notification Types */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">Notification Types</h3>
        </div>
        <div className="p-6 space-y-3">
          <label className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
            <div>
              <div className="font-medium text-gray-900">Booking Confirmations</div>
              <div className="text-sm text-gray-500">Confirmation emails when you book a flight</div>
            </div>
            <input
              type="checkbox"
              checked={preferences.notificationTypes.bookingConfirmation}
              onChange={(e) => updateNotificationType('bookingConfirmation', e.target.checked)}
              className="w-5 h-5 text-blue-600 rounded"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
            <div>
              <div className="font-medium text-gray-900">Booking Reminders</div>
              <div className="text-sm text-gray-500">Reminders 24 hours before your flight</div>
            </div>
            <input
              type="checkbox"
              checked={preferences.notificationTypes.bookingReminder}
              onChange={(e) => updateNotificationType('bookingReminder', e.target.checked)}
              className="w-5 h-5 text-blue-600 rounded"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
            <div>
              <div className="font-medium text-gray-900">Check-in Reminders</div>
              <div className="text-sm text-gray-500">When online check-in opens</div>
            </div>
            <input
              type="checkbox"
              checked={preferences.notificationTypes.checkInReminder}
              onChange={(e) => updateNotificationType('checkInReminder', e.target.checked)}
              className="w-5 h-5 text-blue-600 rounded"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
            <div>
              <div className="font-medium text-gray-900">Flight Delays</div>
              <div className="text-sm text-gray-500">Alerts when your flight is delayed</div>
            </div>
            <input
              type="checkbox"
              checked={preferences.notificationTypes.flightDelays}
              onChange={(e) => updateNotificationType('flightDelays', e.target.checked)}
              className="w-5 h-5 text-blue-600 rounded"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
            <div>
              <div className="font-medium text-gray-900">Flight Cancellations</div>
              <div className="text-sm text-gray-500">Immediate notification if flight is cancelled</div>
            </div>
            <input
              type="checkbox"
              checked={preferences.notificationTypes.flightCancellations}
              onChange={(e) => updateNotificationType('flightCancellations', e.target.checked)}
              className="w-5 h-5 text-blue-600 rounded"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
            <div>
              <div className="font-medium text-gray-900">Price Alerts</div>
              <div className="text-sm text-gray-500">Notifications when prices drop</div>
            </div>
            <input
              type="checkbox"
              checked={preferences.notificationTypes.priceAlerts}
              onChange={(e) => updateNotificationType('priceAlerts', e.target.checked)}
              className="w-5 h-5 text-blue-600 rounded"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
            <div>
              <div className="font-medium text-gray-900">Promotions & Offers</div>
              <div className="text-sm text-gray-500">Special deals and promotions</div>
            </div>
            <input
              type="checkbox"
              checked={preferences.notificationTypes.promotions}
              onChange={(e) => updateNotificationType('promotions', e.target.checked)}
              className="w-5 h-5 text-blue-600 rounded"
            />
          </label>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex items-center justify-end gap-3">
        {saved && (
          <span className="flex items-center gap-2 text-green-600 font-medium">
            <Check className="w-5 h-5" />
            Saved successfully!
          </span>
        )}
        <button
          onClick={savePreferences}
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2"
        >
          {saving ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Preferences'
          )}
        </button>
      </div>
    </div>
  );
}
