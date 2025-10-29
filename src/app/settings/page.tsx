'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/ui/Header';
import AvatarUpload from '@/components/ui/AvatarUpload';
import { 
  User, 
  Lock, 
  Bell, 
  Globe, 
  CreditCard, 
  Shield, 
  Save,
  ArrowLeft,
  Loader2,
  Check,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';

export default function SettingsPage() {
  const { user, isAuthenticated, isLoading: authLoading, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  
  // Profile form state
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    dateOfBirth: user?.dateOfBirth || '',
    nationality: user?.nationality || '',
    avatar: user?.avatar || ''
  });

  // Update profile data when user changes
  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        dateOfBirth: user.dateOfBirth || '',
        nationality: user.nationality || '',
        avatar: user.avatar || ''
      });
    }
  }, [user]);

  // Notification preferences
  const [notifications, setNotifications] = useState<{
    email: boolean;
    sms: boolean;
    push: boolean;
    priceDrops: boolean;
    bookingUpdates: boolean;
    promotions: boolean;
  }>({
    email: user?.preferences?.notifications?.email ?? true,
    sms: user?.preferences?.notifications?.sms ?? false,
    push: user?.preferences?.notifications?.push ?? true,
    priceDrops: true,
    bookingUpdates: true,
    promotions: false
  });

  // Privacy settings
  const [privacy, setPrivacy] = useState({
    profileVisible: false,
    shareData: false,
    analytics: true
  });

  const handleProfileSave = async () => {
    setSaving(true);
    setSaveMessage('');
    
    try {
      const result = await updateProfile(profileData);
      if (result.success) {
        setSaveMessage('Profile updated successfully!');
      } else {
        setSaveMessage('Failed to update profile: ' + result.error);
      }
    } catch (error) {
      setSaveMessage('An error occurred while updating your profile.');
    } finally {
      setSaving(false);
      // Clear message after 3 seconds
      setTimeout(() => setSaveMessage(''), 3000);
    }
  };

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Loading...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show login message if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-12 h-12 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Authentication Required</h3>
            <p className="text-gray-600 mb-4">
              Please log in to access your settings.
            </p>
            <Link
              href="/login"
              className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 active:bg-blue-700 transition-colors inline-block"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'privacy', name: 'Privacy', icon: Shield },
    { id: 'security', name: 'Security', icon: Lock }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Link
              href="/dashboard"
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Dashboard</span>
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Account Settings</h1>
          <p className="text-gray-600">
            Manage your account preferences and security settings.
          </p>
        </div>

        {/* Save Message */}
        {saveMessage && (
          <div className={`mb-6 p-4 rounded-lg flex items-center space-x-3 ${
            saveMessage.includes('successfully') 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            {saveMessage.includes('successfully') ? (
              <Check className="w-5 h-5 text-green-600" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600" />
            )}
            <span className={`text-sm font-medium ${
              saveMessage.includes('successfully') ? 'text-green-800' : 'text-red-800'
            }`}>
              {saveMessage}
            </span>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:w-64 flex-shrink-0">
            <nav className="bg-white rounded-lg shadow-md p-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded-md transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{tab.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-md">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="p-6">
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile Information</h2>
                    <p className="text-gray-600">Update your personal information and contact details.</p>
                  </div>

                  <div className="space-y-6">
                    {/* Avatar Upload */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-4">
                        Profile Picture
                      </label>
                      <AvatarUpload
                        currentAvatar={profileData.avatar}
                        onUploadSuccess={(url) => {
                          setProfileData({...profileData, avatar: url});
                          setSaveMessage('Avatar uploaded! Remember to save changes.');
                          setTimeout(() => setSaveMessage(''), 3000);
                        }}
                        onRemove={() => setProfileData({...profileData, avatar: ''})}
                      />
                    </div>

                    <div className="border-t border-gray-200 pt-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          First Name
                        </label>
                        <input
                          type="text"
                          value={profileData.firstName}
                          onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Last Name
                        </label>
                        <input
                          type="text"
                          value={profileData.lastName}
                          onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                        placeholder="(555) 123-4567"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Date of Birth
                        </label>
                        <input
                          type="date"
                          value={profileData.dateOfBirth}
                          onChange={(e) => setProfileData({...profileData, dateOfBirth: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nationality
                        </label>
                        <select
                          value={profileData.nationality}
                          onChange={(e) => setProfileData({...profileData, nationality: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                        >
                          <option value="">Select nationality</option>
                          <option value="US">United States</option>
                          <option value="CA">Canada</option>
                          <option value="GB">United Kingdom</option>
                          <option value="DE">Germany</option>
                          <option value="FR">France</option>
                          <option value="IT">Italy</option>
                          <option value="ES">Spain</option>
                          <option value="AU">Australia</option>
                          <option value="JP">Japan</option>
                        </select>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-gray-200">
                      <button
                        onClick={handleProfileSave}
                        disabled={saving}
                        className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 active:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                      >
                        {saving ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Saving...</span>
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            <span>Save Changes</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div className="p-6">
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Notification Preferences</h2>
                    <p className="text-gray-600">Choose how you want to receive updates and alerts.</p>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Communication Channels</h3>
                      <div className="space-y-4">
                        <label className="flex items-center justify-between">
                          <div>
                            <span className="font-medium text-gray-900">Email Notifications</span>
                            <p className="text-sm text-gray-600">Receive notifications via email</p>
                          </div>
                          <input
                            type="checkbox"
                            checked={notifications.email}
                            onChange={(e) => setNotifications({...notifications, email: e.target.checked})}
                            className="w-5 h-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                        </label>

                        <label className="flex items-center justify-between">
                          <div>
                            <span className="font-medium text-gray-900">SMS Notifications</span>
                            <p className="text-sm text-gray-600">Receive notifications via text message</p>
                          </div>
                          <input
                            type="checkbox"
                            checked={notifications.sms}
                            onChange={(e) => setNotifications({...notifications, sms: e.target.checked})}
                            className="w-5 h-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                        </label>

                        <label className="flex items-center justify-between">
                          <div>
                            <span className="font-medium text-gray-900">Push Notifications</span>
                            <p className="text-sm text-gray-600">Receive browser push notifications</p>
                          </div>
                          <input
                            type="checkbox"
                            checked={notifications.push}
                            onChange={(e) => setNotifications({...notifications, push: e.target.checked})}
                            className="w-5 h-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                        </label>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Types</h3>
                      <div className="space-y-4">
                        <label className="flex items-center justify-between">
                          <div>
                            <span className="font-medium text-gray-900">Price Drop Alerts</span>
                            <p className="text-sm text-gray-600">Get notified when flight prices drop</p>
                          </div>
                          <input
                            type="checkbox"
                            checked={notifications.priceDrops}
                            onChange={(e) => setNotifications({...notifications, priceDrops: e.target.checked})}
                            className="w-5 h-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                        </label>

                        <label className="flex items-center justify-between">
                          <div>
                            <span className="font-medium text-gray-900">Booking Updates</span>
                            <p className="text-sm text-gray-600">Flight changes, reminders, and confirmations</p>
                          </div>
                          <input
                            type="checkbox"
                            checked={notifications.bookingUpdates}
                            onChange={(e) => setNotifications({...notifications, bookingUpdates: e.target.checked})}
                            className="w-5 h-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                        </label>

                        <label className="flex items-center justify-between">
                          <div>
                            <span className="font-medium text-gray-900">Promotions & Deals</span>
                            <p className="text-sm text-gray-600">Special offers and promotional content</p>
                          </div>
                          <input
                            type="checkbox"
                            checked={notifications.promotions}
                            onChange={(e) => setNotifications({...notifications, promotions: e.target.checked})}
                            className="w-5 h-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                        </label>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-gray-200">
                      <button className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 active:bg-blue-700 transition-colors flex items-center space-x-2">
                        <Save className="w-4 h-4" />
                        <span>Save Preferences</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Privacy Tab */}
              {activeTab === 'privacy' && (
                <div className="p-6">
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Privacy Settings</h2>
                    <p className="text-gray-600">Control your privacy and data sharing preferences.</p>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-4">
                      <label className="flex items-center justify-between">
                        <div>
                          <span className="font-medium text-gray-900">Public Profile</span>
                          <p className="text-sm text-gray-600">Make your profile visible to other users</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={privacy.profileVisible}
                          onChange={(e) => setPrivacy({...privacy, profileVisible: e.target.checked})}
                          className="w-5 h-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </label>

                      <label className="flex items-center justify-between">
                        <div>
                          <span className="font-medium text-gray-900">Data Sharing</span>
                          <p className="text-sm text-gray-600">Share anonymized data to improve our services</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={privacy.shareData}
                          onChange={(e) => setPrivacy({...privacy, shareData: e.target.checked})}
                          className="w-5 h-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </label>

                      <label className="flex items-center justify-between">
                        <div>
                          <span className="font-medium text-gray-900">Analytics</span>
                          <p className="text-sm text-gray-600">Allow usage analytics to help us improve</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={privacy.analytics}
                          onChange={(e) => setPrivacy({...privacy, analytics: e.target.checked})}
                          className="w-5 h-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </label>
                    </div>

                    <div className="pt-6 border-t border-gray-200">
                      <button className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 active:bg-blue-700 transition-colors flex items-center space-x-2">
                        <Save className="w-4 h-4" />
                        <span>Save Settings</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <div className="p-6">
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Security Settings</h2>
                    <p className="text-gray-600">Manage your password and security preferences.</p>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Password</h3>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-medium text-gray-900">Password</span>
                            <p className="text-sm text-gray-600">Last changed 3 months ago</p>
                          </div>
                          <button className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 active:bg-blue-700 transition-colors text-sm">
                            Change Password
                          </button>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Two-Factor Authentication</h3>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-medium text-gray-900">2FA Status</span>
                            <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                          </div>
                          <button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors text-sm">
                            Enable 2FA
                          </button>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Actions</h3>
                      <div className="space-y-3">
                        <button className="w-full text-left p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                          <div>
                            <span className="font-medium text-gray-900">Download Account Data</span>
                            <p className="text-sm text-gray-600">Get a copy of all your account information</p>
                          </div>
                        </button>
                        
                        <button className="w-full text-left p-4 border border-red-300 rounded-lg hover:bg-red-50 transition-colors">
                          <div>
                            <span className="font-medium text-red-600">Delete Account</span>
                            <p className="text-sm text-red-500">Permanently delete your account and all data</p>
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}