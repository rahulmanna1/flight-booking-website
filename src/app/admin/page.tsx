'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Header from '@/components/ui/Header';
import { 
  Settings, 
  Users, 
  Plane, 
  DollarSign, 
  TrendingUp,
  Server,
  AlertCircle,
  CheckCircle,
  Loader2,
  BarChart3,
} from 'lucide-react';
import Link from 'next/link';

interface OverviewMetrics {
  totalBookings: number;
  totalUsers: number;
  totalRevenue: number;
  confirmedBookings: number;
  cancelledBookings: number;
  cancellationRate: number;
}

interface ProviderHealth {
  name: string;
  displayName: string;
  isHealthy: boolean;
  isPrimary: boolean;
  isActive: boolean;
  metrics: {
    successRate: number;
    totalRequests: number;
  };
}

export default function AdminDashboard() {
  const { user, isAdmin, isSuperAdmin, token, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [metrics, setMetrics] = useState<OverviewMetrics | null>(null);
  const [providers, setProviders] = useState<ProviderHealth[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push('/dashboard');
    }
  }, [authLoading, isAdmin, router]);

  useEffect(() => {
    if (isAdmin && token) {
      fetchDashboardData();
    }
  }, [isAdmin, token]);

  const fetchDashboardData = async () => {
    try {
      // Fetch overview metrics
      const metricsRes = await fetch('/api/admin/analytics?type=overview', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (metricsRes.ok) {
        const data = await metricsRes.json();
        setMetrics(data.data);
      }

      // Fetch provider health
      const providersRes = await fetch('/api/admin/providers/health', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (providersRes.ok) {
        const data = await providersRes.json();
        setProviders(data.providers);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-96">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Admin Dashboard 🔐
              </h1>
              <p className="text-gray-600">
                Welcome back, {user?.firstName}! {isSuperAdmin && <span className="text-purple-600 font-semibold">(Super Admin)</span>}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard"
                className="text-gray-600 hover:text-gray-900 flex items-center space-x-2"
              >
                <span>User Dashboard</span>
              </Link>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        ) : (
          <>
            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <MetricCard
                icon={<Plane className="w-6 h-6" />}
                title="Total Bookings"
                value={metrics?.totalBookings || 0}
                iconColor="text-blue-600"
                bgColor="bg-blue-100"
              />
              <MetricCard
                icon={<Users className="w-6 h-6" />}
                title="Total Users"
                value={metrics?.totalUsers || 0}
                iconColor="text-green-600"
                bgColor="bg-green-100"
              />
              <MetricCard
                icon={<DollarSign className="w-6 h-6" />}
                title="Total Revenue"
                value={`$${((metrics?.totalRevenue || 0) / 1).toFixed(0)}`}
                iconColor="text-purple-600"
                bgColor="bg-purple-100"
              />
              <MetricCard
                icon={<TrendingUp className="w-6 h-6" />}
                title="Cancellation Rate"
                value={`${(metrics?.cancellationRate || 0).toFixed(1)}%`}
                iconColor="text-orange-600"
                bgColor="bg-orange-100"
              />
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <QuickActionCard
                href="/admin/providers"
                icon={<Server className="w-8 h-8" />}
                title="API Providers"
                description="Manage flight API providers and switch primary"
                color="blue"
              />
              <QuickActionCard
                href="/admin/bookings"
                icon={<Plane className="w-8 h-8" />}
                title="All Bookings"
                description="View and manage all customer bookings"
                color="green"
              />
              <QuickActionCard
                href="/admin/analytics"
                icon={<BarChart3 className="w-8 h-8" />}
                title="Analytics"
                description="Revenue metrics and popular routes"
                color="purple"
              />
            </div>

            {/* Provider Health Status */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Server className="w-6 h-6 mr-2 text-gray-600" />
                API Provider Status
              </h3>
              
              {providers.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <AlertCircle className="w-12 h-12 mx-auto mb-2 text-orange-500" />
                  <p>No API providers configured. Add one to get started.</p>
                  <Link
                    href="/admin/providers"
                    className="mt-4 inline-block text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Configure Providers →
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {providers.map((provider) => (
                    <div
                      key={provider.name}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center space-x-4">
                        {provider.isHealthy ? (
                          <CheckCircle className="w-6 h-6 text-green-600" />
                        ) : (
                          <AlertCircle className="w-6 h-6 text-red-600" />
                        )}
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold text-gray-900">{provider.displayName}</span>
                            {provider.isPrimary && (
                              <span className="px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded">
                                Primary
                              </span>
                            )}
                            {!provider.isActive && (
                              <span className="px-2 py-1 text-xs font-medium text-gray-700 bg-gray-200 rounded">
                                Inactive
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">
                            Success Rate: {provider.metrics.successRate.toFixed(1)}% • 
                            Requests: {provider.metrics.totalRequests}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`text-sm font-medium ${provider.isHealthy ? 'text-green-600' : 'text-red-600'}`}>
                          {provider.isHealthy ? 'Healthy' : 'Unhealthy'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Metric Card Component
function MetricCard({ icon, title, value, iconColor, bgColor }: {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  iconColor: string;
  bgColor: string;
}) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`${bgColor} p-3 rounded-lg ${iconColor}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

// Quick Action Card Component
function QuickActionCard({ href, icon, title, description, color }: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}) {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-100 hover:bg-blue-200',
    green: 'text-green-600 bg-green-100 hover:bg-green-200',
    purple: 'text-purple-600 bg-purple-100 hover:bg-purple-200',
  };

  return (
    <Link
      href={href}
      className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
    >
      <div className={`${colorClasses[color as keyof typeof colorClasses]} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </Link>
  );
}
