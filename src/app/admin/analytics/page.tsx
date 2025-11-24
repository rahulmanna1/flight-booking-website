'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import { 
  DollarSign,
  TrendingUp,
  Plane,
  Users,
  Loader2,
  Calendar,
  MapPin,
} from 'lucide-react';

interface AnalyticsData {
  totalRevenue: number;
  totalBookings: number;
  averageBookingValue: number;
  completionRate: number;
  cancellationRate: number;
}

interface PopularRoute {
  origin: string;
  destination: string;
  count: number;
  revenue: number;
}

export default function AdminAnalyticsPage() {
  const { user, isAdmin, token, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [routes, setRoutes] = useState<PopularRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30'); // days

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push('/dashboard');
    }
  }, [authLoading, isAdmin, router]);

  useEffect(() => {
    if (isAdmin && token) {
      fetchAnalytics();
    }
  }, [isAdmin, token, dateRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(dateRange));

      // Fetch multiple analytics types
      const [revenueRes, conversionRes, routesRes] = await Promise.all([
        fetch(`/api/admin/analytics?type=revenue&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
        fetch(`/api/admin/analytics?type=conversion&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
        fetch(`/api/admin/analytics?type=popular-routes&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
      ]);

      if (revenueRes.ok && conversionRes.ok && routesRes.ok) {
        const revenueData = await revenueRes.json();
        const conversionData = await conversionRes.json();
        const routesData = await routesRes.json();

        setAnalytics({
          totalRevenue: revenueData.data.totalRevenue,
          totalBookings: revenueData.data.totalBookings,
          averageBookingValue: revenueData.data.averageBookingValue,
          completionRate: conversionData.data.completionRate,
          cancellationRate: conversionData.data.cancellationRate,
        });

        setRoutes(routesData.data.popularRoutes.slice(0, 10));
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Analytics & Reports
              </h1>
              <p className="text-gray-600">
                Revenue metrics, popular routes, and performance insights
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
                <option value="365">Last year</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        ) : (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <MetricCard
                icon={<DollarSign className="w-6 h-6" />}
                title="Total Revenue"
                value={`$${analytics?.totalRevenue.toFixed(2)}`}
                iconColor="text-green-600"
                bgColor="bg-green-100"
              />
              <MetricCard
                icon={<Plane className="w-6 h-6" />}
                title="Total Bookings"
                value={analytics?.totalBookings.toLocaleString() || '0'}
                iconColor="text-blue-600"
                bgColor="bg-blue-100"
              />
              <MetricCard
                icon={<TrendingUp className="w-6 h-6" />}
                title="Avg Booking Value"
                value={`$${analytics?.averageBookingValue.toFixed(2)}`}
                iconColor="text-purple-600"
                bgColor="bg-purple-100"
              />
              <MetricCard
                icon={<Users className="w-6 h-6" />}
                title="Completion Rate"
                value={`${analytics?.completionRate.toFixed(1)}%`}
                iconColor="text-orange-600"
                bgColor="bg-orange-100"
              />
            </div>

            {/* Popular Routes */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <MapPin className="w-6 h-6 mr-2 text-gray-600" />
                  Popular Routes
                </h3>
                
                {routes.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No route data available</p>
                ) : (
                  <div className="space-y-3">
                    {routes.map((route, index) => (
                      <div
                        key={`${route.origin}-${route.destination}`}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full font-semibold text-sm">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {route.origin} → {route.destination}
                            </p>
                            <p className="text-sm text-gray-600">
                              {route.count} bookings
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">
                            ${route.revenue.toFixed(0)}
                          </p>
                          <p className="text-sm text-gray-600">revenue</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Conversion Metrics */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <TrendingUp className="w-6 h-6 mr-2 text-gray-600" />
                  Conversion Metrics
                </h3>
                
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Completion Rate</span>
                      <span className="text-sm font-semibold text-green-600">
                        {analytics?.completionRate.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full transition-all"
                        style={{ width: `${analytics?.completionRate}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Cancellation Rate</span>
                      <span className="text-sm font-semibold text-red-600">
                        {analytics?.cancellationRate.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-red-600 h-2 rounded-full transition-all"
                        style={{ width: `${analytics?.cancellationRate}%` }}
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Key Insights</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-start">
                        <span className="text-green-600 mr-2">✓</span>
                        <span>
                          {analytics && analytics.completionRate > 80
                            ? 'Excellent completion rate - customers are confident in booking'
                            : 'Room for improvement in completion rate'}
                        </span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-blue-600 mr-2">•</span>
                        <span>
                          Average booking value: ${analytics?.averageBookingValue.toFixed(2)}
                        </span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-purple-600 mr-2">•</span>
                        <span>
                          Total bookings in period: {analytics?.totalBookings}
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Revenue Summary */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <DollarSign className="w-6 h-6 mr-2 text-gray-600" />
                Revenue Summary
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                  <p className="text-sm text-green-700 mb-2">Total Revenue</p>
                  <p className="text-3xl font-bold text-green-900">
                    ${analytics?.totalRevenue.toFixed(2)}
                  </p>
                </div>
                
                <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                  <p className="text-sm text-blue-700 mb-2">Average Per Booking</p>
                  <p className="text-3xl font-bold text-blue-900">
                    ${analytics?.averageBookingValue.toFixed(2)}
                  </p>
                </div>
                
                <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                  <p className="text-sm text-purple-700 mb-2">Total Bookings</p>
                  <p className="text-3xl font-bold text-purple-900">
                    {analytics?.totalBookings.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}

// Metric Card Component
function MetricCard({ icon, title, value, iconColor, bgColor }: {
  icon: React.ReactNode;
  title: string;
  value: string;
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
