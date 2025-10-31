'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import Header from '@/components/ui/Header';
import ProfileCompletionBadge from '@/components/ui/ProfileCompletionBadge';
import TravelStatsWidgets from '@/components/dashboard/TravelStatsWidgets';
import SpendingChart from '@/components/dashboard/SpendingChart';
import BookingTimeline from '@/components/dashboard/BookingTimeline';
import QuickActions from '@/components/dashboard/QuickActions';
import { TravelStats } from '@/lib/services/travelStatsService';
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

interface Booking {
  id: string;
  bookingReference: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  flightData: {
    departure: string;
    arrival: string;
    departureTime: string;
    arrivalTime: string;
    airline?: string;
    flightNumber?: string;
  };
}

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading: authLoading, token } = useAuth();
  const { formatPrice } = useCurrency();
  const [stats, setStats] = useState<UserStats>({ bookings: 0, priceAlerts: 0, notifications: 0 });
  const [travelStats, setTravelStats] = useState<TravelStats | null>(null);
  const [monthlySpending, setMonthlySpending] = useState<Array<{ month: string; amount: number; bookings: number }>>([]);
  const [growth, setGrowth] = useState<{ bookingGrowth: number; spendingGrowth: number } | undefined>(undefined);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!isAuthenticated || !user || !token) return;
      
      try {
        // Fetch travel statistics
        const statsResponse = await fetch('/api/stats/travel', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (statsResponse.ok) {
          const data = await statsResponse.json();
          // API returns shape: { stats, monthlySpending, topDestinations, growth }
          setTravelStats(data.stats);
          setMonthlySpending(data.monthlySpending || []);
          setGrowth(data.growth);
          setStats({
            bookings: data.stats?.totalBookings || 0,
            priceAlerts: 3, // TODO: fetch from price alerts API
            notifications: 8, // TODO: fetch from notifications API
          });
        }

        // Fetch recent bookings
        const bookingsResponse = await fetch('/api/bookings?limit=5', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (bookingsResponse.ok) {
          const bookingsData = await bookingsResponse.json();
          setRecentBookings(bookingsData.bookings || []);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchDashboardData();
    }
  }, [isAuthenticated, user, authLoading, token]);

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

        {/* Travel Stats Widgets */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        ) : travelStats ? (
          <div className="mb-8">
            <TravelStatsWidgets stats={travelStats} growth={growth} />
          </div>
        ) : null}

        {/* Spending Chart & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Spending Chart */}
          {monthlySpending.length > 0 && (
            <div className="lg:col-span-2">
              <SpendingChart monthlySpending={monthlySpending} />
            </div>
          )}

          {/* Quick Actions */}
          <div>
            <QuickActions />
          </div>
        </div>

        {/* Profile Completion & Profile Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Profile Completion */}
          <div>
            <ProfileCompletionBadge user={user} showDetails={true} />
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

        {/* Recent Bookings */}
        <div className="mb-8">
          <BookingTimeline 
            bookings={recentBookings} 
            title="Recent Bookings"
            emptyMessage="No bookings yet. Start exploring flights!"
          />
        </div>
      </div>
    </div>
  );
}