'use client';

import React, { useState, useEffect } from 'react';
import { usePriceAlerts } from '@/contexts/PriceAlertContext';
import { PriceAlert, PriceAlertFilters } from '@/types/priceAlert';
import { 
  Bell, 
  BellOff, 
  Edit2, 
  Trash2, 
  Filter, 
  Search, 
  TrendingDown, 
  TrendingUp, 
  Calendar, 
  Plane, 
  DollarSign,
  MoreVertical,
  AlertCircle,
  CheckCircle,
  Clock,
  Settings
} from 'lucide-react';

export default function PriceAlertsList() {
  const { alerts, loading, error, stats, fetchAlerts, deleteAlert, toggleAlert, clearError } = usePriceAlerts();
  const [showFilters, setShowFilters] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<PriceAlert | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  const [filters, setFilters] = useState<PriceAlertFilters>({
    isActive: undefined,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  useEffect(() => {
    fetchAlerts(filters);
  }, [filters]);

  const handleFilterChange = (key: keyof PriceAlertFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleToggleAlert = async (alertId: string) => {
    const result = await toggleAlert(alertId);
    if (!result.success) {
      console.error('Failed to toggle alert:', result.error);
    }
  };

  const handleDeleteAlert = async () => {
    if (!selectedAlert) return;
    
    const result = await deleteAlert(selectedAlert.id);
    if (result.success) {
      setShowDeleteModal(false);
      setSelectedAlert(null);
    } else {
      console.error('Failed to delete alert:', result.error);
    }
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD'
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getPriceChangeIcon = (alert: PriceAlert) => {
    if (!alert.currentPrice) return null;
    
    const change = alert.currentPrice - alert.targetPrice;
    if (change < 0) {
      return <TrendingDown className="w-4 h-4 text-green-600" />;
    } else if (change > 0) {
      return <TrendingUp className="w-4 h-4 text-red-600" />;
    }
    return null;
  };

  const getAlertTypeLabel = (alertType: string) => {
    switch (alertType) {
      case 'price-below': return 'Below target';
      case 'price-above': return 'Above target';
      case 'price-drop': return 'Any price drop';
      default: return alertType;
    }
  };

  const getStatusBadge = (alert: PriceAlert) => {
    if (!alert.isActive) {
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Inactive</span>;
    }
    
    if (alert.currentPrice && alert.targetPrice) {
      const meetsCondition = alert.alertType === 'price-below' 
        ? alert.currentPrice <= alert.targetPrice
        : alert.alertType === 'price-above'
        ? alert.currentPrice >= alert.targetPrice
        : false;
      
      if (meetsCondition) {
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Triggered</span>;
      }
    }
    
    return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Active</span>;
  };

  if (loading && alerts.length === 0) {
    return (
      <div className="w-full max-w-6xl mx-auto p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-300 rounded w-1/4"></div>
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-300 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
                <Bell className="w-6 h-6 text-blue-600" />
                <span>Price Alerts</span>
              </h2>
              <p className="text-gray-600 mt-1">
                Manage your flight price notifications
              </p>
            </div>

            {/* Stats */}
            {stats && (
              <div className="grid grid-cols-4 gap-4 text-center">
                <div className="bg-blue-50 rounded-lg p-3">
                  <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                  <div className="text-xs text-gray-600">Total</div>
                </div>
                <div className="bg-green-50 rounded-lg p-3">
                  <div className="text-2xl font-bold text-green-600">{stats.active}</div>
                  <div className="text-xs text-gray-600">Active</div>
                </div>
                <div className="bg-orange-50 rounded-lg p-3">
                  <div className="text-2xl font-bold text-orange-600">{stats.triggered}</div>
                  <div className="text-xs text-gray-600">Triggered</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-3">
                  <div className="text-2xl font-bold text-purple-600">
                    {stats.avgSavings > 0 ? `$${stats.avgSavings.toFixed(0)}` : '$0'}
                  </div>
                  <div className="text-xs text-gray-600">Avg. Savings</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="px-8 py-4 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
            </button>

            <div className="flex items-center space-x-4">
              <select
                value={filters.sortBy || 'createdAt'}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="text-sm border border-gray-300 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="createdAt">Sort by Created</option>
                <option value="targetPrice">Sort by Price</option>
                <option value="departureDate">Sort by Departure</option>
              </select>

              <select
                value={filters.sortOrder || 'desc'}
                onChange={(e) => handleFilterChange('sortOrder', e.target.value as 'asc' | 'desc')}
                className="text-sm border border-gray-300 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="desc">Newest First</option>
                <option value="asc">Oldest First</option>
              </select>
            </div>
          </div>

          {showFilters && (
            <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={filters.isActive === undefined ? 'all' : filters.isActive.toString()}
                    onChange={(e) => handleFilterChange('isActive', e.target.value === 'all' ? undefined : e.target.value === 'true')}
                    className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Alerts</option>
                    <option value="true">Active Only</option>
                    <option value="false">Inactive Only</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Alert Type</label>
                  <select
                    value={filters.alertType || ''}
                    onChange={(e) => handleFilterChange('alertType', e.target.value || undefined)}
                    className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Types</option>
                    <option value="price-below">Price Below</option>
                    <option value="price-above">Price Above</option>
                    <option value="price-drop">Price Drop</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Trip Type</label>
                  <select
                    value={filters.tripType || ''}
                    onChange={(e) => handleFilterChange('tripType', e.target.value || undefined)}
                    className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Trips</option>
                    <option value="one-way">One Way</option>
                    <option value="round-trip">Round Trip</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="px-8 py-4 bg-red-50 border-b border-red-200">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <div className="text-sm text-red-800">{error}</div>
                <button
                  onClick={clearError}
                  className="text-xs text-red-600 hover:text-red-800 mt-1"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Alerts List */}
        <div className="divide-y divide-gray-200">
          {alerts.length === 0 ? (
            <div className="px-8 py-12 text-center">
              <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No price alerts yet</h3>
              <p className="text-gray-600">Create your first price alert to get notified when flight prices change.</p>
            </div>
          ) : (
            alerts.map((alert) => (
              <div key={alert.id} className="px-8 py-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-2">
                      <div className="flex items-center space-x-2">
                        <Plane className="w-4 h-4 text-blue-600" />
                        <span className="font-semibold text-gray-900">
                          {alert.origin} → {alert.destination}
                        </span>
                        {getStatusBadge(alert)}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(alert.departureDate)}</span>
                        {alert.returnDate && (
                          <span> - {formatDate(alert.returnDate)}</span>
                        )}
                      </div>

                      <div className="flex items-center space-x-1">
                        <DollarSign className="w-4 h-4" />
                        <span>Target: {formatPrice(alert.targetPrice, alert.currency)}</span>
                        {getPriceChangeIcon(alert)}
                      </div>

                      <div className="flex items-center space-x-1">
                        <Settings className="w-4 h-4" />
                        <span>{getAlertTypeLabel(alert.alertType)}</span>
                      </div>

                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>Created {formatDate(alert.createdAt)}</span>
                      </div>
                    </div>

                    {alert.currentPrice && (
                      <div className="mt-2 text-sm">
                        <span className="text-gray-600">Current price: </span>
                        <span className={`font-medium ${
                          alert.currentPrice <= alert.targetPrice ? 'text-green-600' : 'text-gray-900'
                        }`}>
                          {formatPrice(alert.currentPrice, alert.currency)}
                        </span>
                        {alert.lastChecked && (
                          <span className="text-gray-500 ml-2">
                            (checked {formatDate(alert.lastChecked)})
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleToggleAlert(alert.id)}
                      className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${
                        alert.isActive ? 'text-blue-600' : 'text-gray-400'
                      }`}
                      title={alert.isActive ? 'Deactivate alert' : 'Activate alert'}
                    >
                      {alert.isActive ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                    </button>

                    <button
                      onClick={() => {
                        setSelectedAlert(alert);
                        setShowDeleteModal(true);
                      }}
                      className="p-2 rounded-full hover:bg-red-50 hover:text-red-600 transition-colors text-gray-400"
                      title="Delete alert"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Load More */}
        {alerts.length > 0 && alerts.length % 10 === 0 && (
          <div className="px-8 py-4 bg-gray-50 text-center">
            <button
              onClick={async () => {
                const currentFilters = { ...filters, offset: alerts.length };
                await fetchAlerts(currentFilters);
              }}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 hover:text-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                  Loading...
                </>
              ) : (
                'Load More Alerts'
              )}
            </button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Price Alert</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete the price alert for <strong>{selectedAlert.origin} → {selectedAlert.destination}</strong>? 
                This action cannot be undone.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedAlert(null);
                  }}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAlert}
                  className="flex-1 px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}