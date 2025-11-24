'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import {
  DollarSign,
  Search,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  FileText,
  Calendar,
  User,
  CreditCard,
} from 'lucide-react';

interface Refund {
  id: string;
  refundReference: string;
  status: string;
  reason: string;
  refundType: string;
  requestedAmount: number;
  approvedAmount: number | null;
  processingFee: number | null;
  netRefundAmount: number | null;
  requestedAt: string;
  processedAt: string | null;
  completedAt: string | null;
  adminNotes: string | null;
  booking: {
    bookingReference: string;
    confirmationNumber: string;
    totalAmount: number;
    status: string;
    user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
    };
  };
}

interface Pagination {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
}

export default function RefundsManagement() {
  const { user, isAdmin, token, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    totalCount: 0,
    totalPages: 0,
  });
  const [selectedRefund, setSelectedRefund] = useState<Refund | null>(null);
  const [isProcessModalOpen, setIsProcessModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push('/dashboard');
    }
  }, [authLoading, isAdmin, router]);

  useEffect(() => {
    if (isAdmin && token) {
      fetchRefunds();
    }
  }, [isAdmin, token, pagination.page, statusFilter, searchTerm]);

  const fetchRefunds = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        search: searchTerm,
        status: statusFilter,
      });

      const response = await fetch(`/api/admin/refunds?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setRefunds(data.refunds || []);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error fetching refunds:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (refund: Refund) => {
    setSelectedRefund(refund);
    setIsDetailModalOpen(true);
  };

  const handleProcessRefund = (refund: Refund) => {
    setSelectedRefund(refund);
    setIsProcessModalOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-700',
      UNDER_REVIEW: 'bg-blue-100 text-blue-700',
      APPROVED: 'bg-green-100 text-green-700',
      PROCESSING: 'bg-indigo-100 text-indigo-700',
      COMPLETED: 'bg-green-100 text-green-700',
      REJECTED: 'bg-red-100 text-red-700',
      CANCELLED: 'bg-gray-100 text-gray-700',
    };
    return badges[status] || badges.PENDING;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
      case 'APPROVED':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'REJECTED':
      case 'CANCELLED':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'PENDING':
      case 'UNDER_REVIEW':
      case 'PROCESSING':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  if (authLoading || !isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
      </div>
    );
  }

  const pendingCount = refunds.filter((r) => r.status === 'PENDING').length;
  const approvedCount = refunds.filter((r) => r.status === 'APPROVED' || r.status === 'COMPLETED').length;
  const rejectedCount = refunds.filter((r) => r.status === 'REJECTED').length;
  const totalRefundAmount = refunds
    .filter((r) => r.status === 'APPROVED' || r.status === 'COMPLETED')
    .reduce((sum, r) => sum + (r.netRefundAmount || 0), 0);

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
                <DollarSign className="w-8 h-8 mr-3 text-blue-600" />
                Refund Management
              </h1>
              <p className="text-gray-600">Process and track customer refund requests</p>
            </div>
            {pendingCount > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-2">
                <p className="text-yellow-800 font-medium">
                  {pendingCount} pending request{pendingCount !== 1 ? 's' : ''}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<Clock className="w-6 h-6" />}
            title="Pending"
            value={pendingCount}
            color="yellow"
          />
          <StatCard
            icon={<CheckCircle className="w-6 h-6" />}
            title="Approved"
            value={approvedCount}
            color="green"
          />
          <StatCard
            icon={<XCircle className="w-6 h-6" />}
            title="Rejected"
            value={rejectedCount}
            color="red"
          />
          <StatCard
            icon={<DollarSign className="w-6 h-6" />}
            title="Total Refunded"
            value={`$${totalRefundAmount.toFixed(2)}`}
            color="blue"
          />
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by refund or booking reference..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPagination({ ...pagination, page: 1 });
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPagination({ ...pagination, page: 1 });
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="ALL">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="APPROVED">Approved</option>
              <option value="PROCESSING">Processing</option>
              <option value="COMPLETED">Completed</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>

        {/* Refunds Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
          ) : refunds.length === 0 ? (
            <div className="text-center py-12">
              <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-2">No refund requests found</p>
              <p className="text-gray-400">
                {searchTerm || statusFilter !== 'ALL'
                  ? 'Try adjusting your filters'
                  : 'Refund requests will appear here'}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Refund Details
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Requested
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {refunds.map((refund) => (
                      <RefundRow
                        key={refund.id}
                        refund={refund}
                        onView={() => handleViewDetails(refund)}
                        onProcess={() => handleProcessRefund(refund)}
                        getStatusBadge={getStatusBadge}
                        getStatusIcon={getStatusIcon}
                      />
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t">
                <div className="text-sm text-gray-700">
                  Showing{' '}
                  <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(pagination.page * pagination.limit, pagination.totalCount)}
                  </span>{' '}
                  of <span className="font-medium">{pagination.totalCount}</span> refunds
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                    disabled={pagination.page === 1}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-sm text-gray-700">
                    Page {pagination.page} of {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                    disabled={pagination.page >= pagination.totalPages}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Process Modal */}
      {isProcessModalOpen && selectedRefund && (
        <ProcessRefundModal
          refund={selectedRefund}
          token={token!}
          onClose={() => {
            setIsProcessModalOpen(false);
            setSelectedRefund(null);
          }}
          onSuccess={() => {
            setIsProcessModalOpen(false);
            setSelectedRefund(null);
            fetchRefunds();
          }}
        />
      )}

      {/* Detail Modal */}
      {isDetailModalOpen && selectedRefund && (
        <RefundDetailModal
          refund={selectedRefund}
          onClose={() => {
            setIsDetailModalOpen(false);
            setSelectedRefund(null);
          }}
        />
      )}
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
  value: number | string;
  color: string;
}) {
  const colorClasses: Record<string, string> = {
    yellow: 'text-yellow-600 bg-yellow-100',
    green: 'text-green-600 bg-green-100',
    red: 'text-red-600 bg-red-100',
    blue: 'text-blue-600 bg-blue-100',
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`${colorClasses[color]} p-3 rounded-lg`}>{icon}</div>
      </div>
    </div>
  );
}

// Refund Row Component
function RefundRow({
  refund,
  onView,
  onProcess,
  getStatusBadge,
  getStatusIcon,
}: {
  refund: Refund;
  onView: () => void;
  onProcess: () => void;
  getStatusBadge: (status: string) => string;
  getStatusIcon: (status: string) => React.ReactNode;
}) {
  const canProcess = refund.status === 'PENDING' || refund.status === 'UNDER_REVIEW';

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex flex-col">
          <span className="text-sm font-bold text-gray-900">{refund.refundReference}</span>
          <span className="text-xs text-gray-500">Booking: {refund.booking.bookingReference}</span>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-900">
            {refund.booking.user.firstName} {refund.booking.user.lastName}
          </span>
          <span className="text-xs text-gray-500">{refund.booking.user.email}</span>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex flex-col">
          <span className="text-sm font-bold text-gray-900">
            ${refund.requestedAmount.toFixed(2)}
          </span>
          {refund.netRefundAmount && (
            <span className="text-xs text-green-600">Net: ${refund.netRefundAmount.toFixed(2)}</span>
          )}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="text-sm text-gray-900">{refund.refundType}</span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center space-x-2">
          {getStatusIcon(refund.status)}
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(refund.status)}`}>
            {refund.status.replace('_', ' ')}
          </span>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {new Date(refund.requestedAt).toLocaleDateString()}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex items-center justify-end space-x-2">
          <button
            onClick={onView}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded"
            title="View Details"
          >
            <Eye className="w-5 h-5" />
          </button>
          {canProcess && (
            <button
              onClick={onProcess}
              className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs font-medium"
            >
              Process
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

// Process Refund Modal Component
function ProcessRefundModal({
  refund,
  token,
  onClose,
  onSuccess,
}: {
  refund: Refund;
  token: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [action, setAction] = useState<'APPROVE' | 'REJECT'>('APPROVE');
  const [approvedAmount, setApprovedAmount] = useState(refund.requestedAmount);
  const [processingFee, setProcessingFee] = useState(0);
  const [adminNotes, setAdminNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const netAmount = approvedAmount - processingFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/admin/refunds', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refundId: refund.id,
          action,
          approvedAmount: action === 'APPROVE' ? approvedAmount : null,
          processingFee: action === 'APPROVE' ? processingFee : null,
          adminNotes,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        onSuccess();
      } else {
        setError(data.error || 'Failed to process refund');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Process Refund Request</h2>

          {/* Refund Summary */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Refund Summary</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Refund Reference</p>
                <p className="font-medium">{refund.refundReference}</p>
              </div>
              <div>
                <p className="text-gray-600">Booking Reference</p>
                <p className="font-medium">{refund.booking.bookingReference}</p>
              </div>
              <div>
                <p className="text-gray-600">Customer</p>
                <p className="font-medium">
                  {refund.booking.user.firstName} {refund.booking.user.lastName}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Original Amount</p>
                <p className="font-medium">${refund.booking.totalAmount.toFixed(2)}</p>
              </div>
              <div className="col-span-2">
                <p className="text-gray-600">Reason</p>
                <p className="font-medium">{refund.reason}</p>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
              <AlertCircle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Action Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Decision *</label>
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setAction('APPROVE')}
                  className={`flex-1 py-3 px-4 rounded-lg border-2 font-medium transition-colors ${
                    action === 'APPROVE'
                      ? 'border-green-600 bg-green-50 text-green-700'
                      : 'border-gray-300 text-gray-700 hover:border-gray-400'
                  }`}
                >
                  <CheckCircle className="w-5 h-5 mx-auto mb-1" />
                  Approve
                </button>
                <button
                  type="button"
                  onClick={() => setAction('REJECT')}
                  className={`flex-1 py-3 px-4 rounded-lg border-2 font-medium transition-colors ${
                    action === 'REJECT'
                      ? 'border-red-600 bg-red-50 text-red-700'
                      : 'border-gray-300 text-gray-700 hover:border-gray-400'
                  }`}
                >
                  <XCircle className="w-5 h-5 mx-auto mb-1" />
                  Reject
                </button>
              </div>
            </div>

            {action === 'APPROVE' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Approved Amount ($) *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={approvedAmount}
                      onChange={(e) => setApprovedAmount(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Requested: ${refund.requestedAmount.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Processing Fee ($)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={processingFee}
                      onChange={(e) => setProcessingFee(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Net Amount Display */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-blue-900">Net Refund Amount:</span>
                    <span className="text-2xl font-bold text-blue-600">${netAmount.toFixed(2)}</span>
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Admin Notes {action === 'REJECT' && '*'}
              </label>
              <textarea
                required={action === 'REJECT'}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder={
                  action === 'APPROVE'
                    ? 'Optional notes about this refund...'
                    : 'Please explain the reason for rejection...'
                }
              />
            </div>

            <div className="flex justify-end space-x-4 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`px-4 py-2 text-white rounded-lg disabled:opacity-50 flex items-center space-x-2 ${
                  action === 'APPROVE'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>{action === 'APPROVE' ? 'Approve Refund' : 'Reject Refund'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Refund Detail Modal Component
function RefundDetailModal({ refund, onClose }: { refund: Refund; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Refund Details</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">
              ×
            </button>
          </div>

          <div className="space-y-6">
            {/* Refund Information */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Refund Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Refund Reference</p>
                  <p className="font-medium text-gray-900">{refund.refundReference}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Type</p>
                  <p className="font-medium text-gray-900">{refund.refundType}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <p className="font-medium text-gray-900">{refund.status.replace('_', ' ')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Requested At</p>
                  <p className="font-medium text-gray-900">
                    {new Date(refund.requestedAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Booking Information */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Booking Reference</p>
                  <p className="font-medium text-gray-900">{refund.booking.bookingReference}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Confirmation Number</p>
                  <p className="font-medium text-gray-900">{refund.booking.confirmationNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Original Amount</p>
                  <p className="font-medium text-gray-900">${refund.booking.totalAmount.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Booking Status</p>
                  <p className="font-medium text-gray-900">{refund.booking.status}</p>
                </div>
              </div>
            </div>

            {/* Customer Information */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="font-medium text-gray-900">
                    {refund.booking.user.firstName} {refund.booking.user.lastName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium text-gray-900">{refund.booking.user.email}</p>
                </div>
              </div>
            </div>

            {/* Financial Details */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Details</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Requested Amount:</span>
                  <span className="font-semibold">${refund.requestedAmount.toFixed(2)}</span>
                </div>
                {refund.approvedAmount && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Approved Amount:</span>
                    <span className="font-semibold text-green-600">
                      ${refund.approvedAmount.toFixed(2)}
                    </span>
                  </div>
                )}
                {refund.processingFee && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Processing Fee:</span>
                    <span className="font-semibold text-red-600">
                      -${refund.processingFee.toFixed(2)}
                    </span>
                  </div>
                )}
                {refund.netRefundAmount && (
                  <div className="flex justify-between pt-2 border-t border-gray-300">
                    <span className="text-gray-900 font-semibold">Net Refund:</span>
                    <span className="text-xl font-bold text-blue-600">
                      ${refund.netRefundAmount.toFixed(2)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Reason */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Refund Reason</h3>
              <p className="text-gray-700">{refund.reason}</p>
            </div>

            {/* Admin Notes */}
            {refund.adminNotes && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Admin Notes</h3>
                <p className="text-gray-700">{refund.adminNotes}</p>
              </div>
            )}

            {/* Processing Timeline */}
            {(refund.processedAt || refund.completedAt) && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">Requested:</span>
                    <span className="font-medium">{new Date(refund.requestedAt).toLocaleString()}</span>
                  </div>
                  {refund.processedAt && (
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">Processed:</span>
                      <span className="font-medium">{new Date(refund.processedAt).toLocaleString()}</span>
                    </div>
                  )}
                  {refund.completedAt && (
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">Completed:</span>
                      <span className="font-medium">{new Date(refund.completedAt).toLocaleString()}</span>
                    </div>
                  )}
                </div>
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
