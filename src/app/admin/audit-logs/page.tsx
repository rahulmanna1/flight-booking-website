'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import {
  FileText,
  Search,
  Filter,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  AlertCircle,
  CheckCircle,
  Info,
  AlertTriangle,
  User,
  Calendar,
  MapPin,
} from 'lucide-react';

interface AuditLog {
  id: string;
  action: string;
  category: string;
  severity: string;
  userId: string | null;
  userEmail: string | null;
  userRole: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  endpoint: string | null;
  method: string | null;
  details: Record<string, any>;
  metadata: Record<string, any>;
  createdAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
}

export default function AuditLogsPage() {
  const { user, isSuperAdmin, token, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 50,
    totalCount: 0,
    totalPages: 0,
  });
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !isSuperAdmin) {
      router.push('/admin');
    }
  }, [authLoading, isSuperAdmin, router]);

  useEffect(() => {
    if (isSuperAdmin && token) {
      fetchLogs();
    }
  }, [isSuperAdmin, token, pagination.page, categoryFilter, severityFilter, searchTerm, startDate, endDate]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        search: searchTerm,
        category: categoryFilter,
        severity: severityFilter,
      });

      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await fetch(`/api/admin/audit-logs?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setLogs(data.logs || []);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportLogs = async () => {
    try {
      const params = new URLSearchParams({
        category: categoryFilter,
        severity: severityFilter,
      });

      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await fetch(`/api/admin/audit-logs/export?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audit-logs-${new Date().toISOString()}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error exporting logs:', error);
      alert('Failed to export logs');
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'INFO':
        return <Info className="w-5 h-5 text-blue-600" />;
      case 'WARNING':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'ERROR':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'CRITICAL':
        return <AlertCircle className="w-5 h-5 text-red-700" />;
      default:
        return <CheckCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    const badges = {
      INFO: 'bg-blue-100 text-blue-700',
      WARNING: 'bg-yellow-100 text-yellow-700',
      ERROR: 'bg-red-100 text-red-700',
      CRITICAL: 'bg-red-200 text-red-900',
    };
    return badges[severity as keyof typeof badges] || badges.INFO;
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
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
                <FileText className="w-8 h-8 mr-3 text-blue-600" />
                Audit Logs
              </h1>
              <p className="text-gray-600">
                Track all system activities and admin actions
              </p>
            </div>
            <button
              onClick={handleExportLogs}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
              <Download className="w-5 h-5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<FileText className="w-6 h-6" />}
            title="Total Logs"
            value={pagination.totalCount}
            color="blue"
          />
          <StatCard
            icon={<Info className="w-6 h-6" />}
            title="Info"
            value={logs.filter((l) => l.severity === 'INFO').length}
            color="blue"
          />
          <StatCard
            icon={<AlertTriangle className="w-6 h-6" />}
            title="Warnings"
            value={logs.filter((l) => l.severity === 'WARNING').length}
            color="yellow"
          />
          <StatCard
            icon={<AlertCircle className="w-6 h-6" />}
            title="Errors"
            value={logs.filter((l) => l.severity === 'ERROR' || l.severity === 'CRITICAL').length}
            color="red"
          />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by action, user, or details..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setPagination({ ...pagination, page: 1 });
                  }}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setPagination({ ...pagination, page: 1 });
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">All Categories</option>
                <option value="USER_AUTH">User Auth</option>
                <option value="USER_MANAGEMENT">User Management</option>
                <option value="BOOKING_CREATE">Booking Create</option>
                <option value="BOOKING_UPDATE">Booking Update</option>
                <option value="BOOKING_CANCEL">Booking Cancel</option>
                <option value="PAYMENT">Payment</option>
                <option value="REFUND">Refund</option>
                <option value="API_PROVIDER_CHANGE">API Provider</option>
                <option value="SYSTEM_CONFIG">System Config</option>
                <option value="SECURITY">Security</option>
                <option value="PROMO_CODE">Promo Code</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Severity
              </label>
              <select
                value={severityFilter}
                onChange={(e) => {
                  setSeverityFilter(e.target.value);
                  setPagination({ ...pagination, page: 1 });
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">All Severities</option>
                <option value="INFO">Info</option>
                <option value="WARNING">Warning</option>
                <option value="ERROR">Error</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date Range
              </label>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="md:col-span-2 flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setCategoryFilter('ALL');
                  setSeverityFilter('ALL');
                  setStartDate('');
                  setEndDate('');
                  setPagination({ ...pagination, page: 1 });
                }}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Logs Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-2">No audit logs found</p>
              <p className="text-gray-400">Try adjusting your filters</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Timestamp
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Severity
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Action
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        IP Address
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {logs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(log.createdAt).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${getSeverityBadge(
                              log.severity
                            )}`}
                          >
                            {log.severity}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{log.action}</p>
                            <p className="text-sm text-gray-500">{log.category}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {log.userEmail || 'System'}
                          {log.userRole && (
                            <span className="ml-2 text-xs text-gray-500">({log.userRole})</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {log.ipAddress || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                          <button
                            onClick={() => {
                              setSelectedLog(log);
                              setIsDetailModalOpen(true);
                            }}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t">
                <div className="text-sm text-gray-700">
                  Showing <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(pagination.page * pagination.limit, pagination.totalCount)}
                  </span>{' '}
                  of <span className="font-medium">{pagination.totalCount}</span> logs
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                    disabled={pagination.page === 1}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-sm text-gray-700">
                    Page {pagination.page} of {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                    disabled={pagination.page >= pagination.totalPages}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Detail Modal */}
        {isDetailModalOpen && selectedLog && (
          <LogDetailModal
            log={selectedLog}
            onClose={() => {
              setIsDetailModalOpen(false);
              setSelectedLog(null);
            }}
          />
        )}
      </div>
    </AdminLayout>
  );
}

// Stat Card Component
function StatCard({
  icon,
  title,
  value,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  value: number;
  color: string;
}) {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-100',
    yellow: 'text-yellow-600 bg-yellow-100',
    red: 'text-red-600 bg-red-100',
    green: 'text-green-600 bg-green-100',
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`${colorClasses[color as keyof typeof colorClasses]} p-3 rounded-lg`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

// Log Detail Modal
function LogDetailModal({ log, onClose }: { log: AuditLog; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Audit Log Details</h2>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Timestamp</label>
              <p className="text-gray-900">{new Date(log.createdAt).toLocaleString()}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Action</label>
              <p className="text-gray-900">{log.action}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Category / Severity</label>
              <p className="text-gray-900">
                {log.category} / <span className="font-semibold">{log.severity}</span>
              </p>
            </div>

            {log.userEmail && (
              <div>
                <label className="text-sm font-medium text-gray-700">User</label>
                <p className="text-gray-900">
                  {log.userEmail} {log.userRole && `(${log.userRole})`}
                </p>
              </div>
            )}

            {log.ipAddress && (
              <div>
                <label className="text-sm font-medium text-gray-700">IP Address</label>
                <p className="text-gray-900">{log.ipAddress}</p>
              </div>
            )}

            {log.endpoint && (
              <div>
                <label className="text-sm font-medium text-gray-700">Endpoint</label>
                <p className="text-gray-900">
                  {log.method} {log.endpoint}
                </p>
              </div>
            )}

            {log.userAgent && (
              <div>
                <label className="text-sm font-medium text-gray-700">User Agent</label>
                <p className="text-gray-900 text-sm break-all">{log.userAgent}</p>
              </div>
            )}

            {log.details && Object.keys(log.details).length > 0 && (
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Details</label>
                <pre className="bg-gray-50 p-4 rounded-lg text-xs overflow-x-auto">
                  {JSON.stringify(log.details, null, 2)}
                </pre>
              </div>
            )}

            {log.metadata && Object.keys(log.metadata).length > 0 && (
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Metadata</label>
                <pre className="bg-gray-50 p-4 rounded-lg text-xs overflow-x-auto">
                  {JSON.stringify(log.metadata, null, 2)}
                </pre>
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
