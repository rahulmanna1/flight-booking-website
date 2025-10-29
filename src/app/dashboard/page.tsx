'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import Header from '@/components/ui/Header';
import ProfileCompletionBadge from '@/components/ui/ProfileCompletionBadge';
import { 
  User, 
  Plane, 
  Calendar, 
  CreditCard, 
  Bell, 
  Settings, 
  Edit3,
  MapPin,
  Clock,
  Star,
  TrendingUp,
  Loader2
} from 'lucide-react';
import Link from 'next/link';

interface UserStats {
  bookings: number;
  priceAlerts: number;
  notifications: number;
}

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { formatPrice } = useCurrency();
  const [stats, setStats] = useState<UserStats>({ bookings: 0, priceAlerts: 0, notifications: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserStats = async () => {
      if (!isAuthenticated || !user) return;
      
      try {
        // Mock stats for now - in real app, fetch from API
        setStats({
          bookings: 5,
          priceAlerts: 3,
          notifications: 8
        });
      } catch (error) {
        console.error('Error fetching user stats:', error);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchUserStats();
    }
  }, [isAuthenticated, user, authLoading]);

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
              Please log in to view your dashboard.
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome back, {user?.firstName}! ✈️
              </h1>
              <p className="text-gray-600">
                Manage your flights, track alerts, and plan your next adventure.
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/settings"
                className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors flex items-center space-x-2"
              >
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Total Bookings</p>
                <p className="text-3xl font-bold text-gray-900">{stats.bookings}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Plane className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4">
              <Link
                href="/bookings"
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                View all bookings →
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Price Alerts</p>
                <p className="text-3xl font-bold text-gray-900">{stats.priceAlerts}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Bell className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4">
              <Link
                href="/price-alerts"
                className="text-green-600 hover:text-green-700 text-sm font-medium"
              >
                Manage alerts →
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Notifications</p>
                <p className="text-3xl font-bold text-gray-900">{stats.notifications}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Bell className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Profile Completion & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Profile Completion */}
          <div>
            <ProfileCompletionBadge user={user} showDetails={true} />
          </div>

          {/* Search Flights */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg shadow-md p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">Search New Flights</h3>
              <Plane className="w-8 h-8 opacity-80" />
            </div>
            <p className="text-blue-100 mb-4">
              Find the best deals for your next trip. Compare prices from hundreds of airlines.
            </p>
            <Link
              href="/"
              className="bg-white text-blue-600 px-4 py-2 rounded-md hover:bg-blue-50 transition-colors inline-block font-medium"
            >
              Search Flights
            </Link>
          </div>

          {/* Profile Management */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">Profile Information</h3>
              <User className="w-8 h-8 text-gray-600" />
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Name:</span>
                <span className="font-medium text-gray-900">{user?.firstName} {user?.lastName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Email:</span>
                <span className="font-medium text-gray-900">{user?.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Phone:</span>
                <span className="font-medium text-gray-900">{user?.phone || 'Not provided'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Member since:</span>
                <span className="font-medium text-gray-900">
                  {new Date(user?.createdAt || '').toLocaleDateString()}
                </span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <Link
                href="/settings"
                className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center space-x-1"
              >
                <Edit3 className="w-4 h-4" />
                <span>Edit Profile</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
          </div>
          <div className="p-6">
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-gray-600" />
              </div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">No Recent Activity</h4>
              <p className="text-gray-600 mb-4">
                Your recent bookings and alerts will appear here.
              </p>
              <Link
                href="/"
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 active:bg-blue-700 transition-colors inline-block"
              >
                Start Exploring
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}