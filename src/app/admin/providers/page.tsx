'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Header from '@/components/ui/Header';
import { 
  Server, 
  Plus, 
  Edit, 
  Trash2, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  RefreshCw,
  Activity,
  Zap,
} from 'lucide-react';

interface Provider {
  id: string;
  name: string;
  displayName: string;
  provider: string;
  environment: string;
  isActive: boolean;
  isPrimary: boolean;
  priority: number;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  lastUsedAt: string | null;
  credentials: {
    clientId?: string;
    clientSecret?: string;
    apiKey?: string;
  };
  supportedFeatures: string[];
}

interface ProviderHealth {
  name: string;
  health: {
    isHealthy: boolean;
    latency?: number;
    successRate: number;
    errorCount: number;
  };
}

export default function ProvidersPage() {
  const { user, isAdmin, token, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [healthStatus, setHealthStatus] = useState<Record<string, ProviderHealth>>({});
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProvider, setEditingProvider] = useState<Provider | null>(null);
  const [switching, setSwitching] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push('/dashboard');
    }
  }, [authLoading, isAdmin, router]);

  useEffect(() => {
    if (isAdmin && token) {
      fetchProviders();
      fetchHealth();
    }
  }, [isAdmin, token]);

  const fetchProviders = async () => {
    try {
      const response = await fetch('/api/admin/providers', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (response.ok) {
        const data = await response.json();
        setProviders(data.providers);
      }
    } catch (error) {
      console.error('Error fetching providers:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchHealth = async () => {
    try {
      const response = await fetch('/api/admin/providers/health', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (response.ok) {
        const data = await response.json();
        const healthMap: Record<string, ProviderHealth> = {};
        data.providers.forEach((p: any) => {
          healthMap[p.name] = p;
        });
        setHealthStatus(healthMap);
      }
    } catch (error) {
      console.error('Error fetching health:', error);
    }
  };

  const handleSwitchPrimary = async (providerName: string) => {
    if (!confirm(`Switch primary provider to ${providerName}?`)) return;
    
    setSwitching(providerName);
    try {
      const response = await fetch('/api/admin/providers/switch', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ providerName }),
      });

      if (response.ok) {
        await fetchProviders();
        alert('Primary provider switched successfully!');
      } else {
        const data = await response.json();
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      alert('Failed to switch provider');
    } finally {
      setSwitching(null);
    }
  };

  const handleDelete = async (provider: Provider) => {
    if (!confirm(`Delete provider ${provider.displayName}? This cannot be undone.`)) return;
    
    try {
      const response = await fetch(`/api/admin/providers?id=${provider.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        await fetchProviders();
        alert('Provider deleted successfully!');
      } else {
        const data = await response.json();
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      alert('Failed to delete provider');
    }
  };

  const getSuccessRate = (provider: Provider) => {
    if (provider.totalRequests === 0) return 0;
    return (provider.successfulRequests / provider.totalRequests) * 100;
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
                API Providers
              </h1>
              <p className="text-gray-600">
                Manage flight API providers and switch between them
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={fetchHealth}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 flex items-center space-x-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Refresh</span>
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Provider</span>
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        ) : providers.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Server className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Providers Configured</h3>
            <p className="text-gray-600 mb-6">Add your first flight API provider to get started</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 inline-flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Add Provider</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {providers.map((provider) => {
              const health = healthStatus[provider.name];
              const successRate = getSuccessRate(provider);
              
              return (
                <div
                  key={provider.id}
                  className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Header */}
                      <div className="flex items-center space-x-3 mb-3">
                        {health?.health.isHealthy ? (
                          <CheckCircle className="w-6 h-6 text-green-600" />
                        ) : (
                          <AlertCircle className="w-6 h-6 text-red-600" />
                        )}
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="text-xl font-semibold text-gray-900">
                              {provider.displayName}
                            </h3>
                            {provider.isPrimary && (
                              <span className="px-3 py-1 text-sm font-medium text-blue-700 bg-blue-100 rounded-full flex items-center space-x-1">
                                <Zap className="w-3 h-3" />
                                <span>Primary</span>
                              </span>
                            )}
                            {!provider.isActive && (
                              <span className="px-3 py-1 text-sm font-medium text-gray-700 bg-gray-200 rounded-full">
                                Inactive
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">
                            {provider.provider} • {provider.environment}
                          </p>
                        </div>
                      </div>

                      {/* Metrics */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-xs text-gray-600 mb-1">Success Rate</p>
                          <p className={`text-lg font-semibold ${successRate >= 95 ? 'text-green-600' : successRate >= 80 ? 'text-yellow-600' : 'text-red-600'}`}>
                            {successRate.toFixed(1)}%
                          </p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-xs text-gray-600 mb-1">Total Requests</p>
                          <p className="text-lg font-semibold text-gray-900">
                            {provider.totalRequests.toLocaleString()}
                          </p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-xs text-gray-600 mb-1">Priority</p>
                          <p className="text-lg font-semibold text-gray-900">
                            {provider.priority}
                          </p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-xs text-gray-600 mb-1">Latency</p>
                          <p className="text-lg font-semibold text-gray-900">
                            {health?.health.latency ? `${health.health.latency}ms` : 'N/A'}
                          </p>
                        </div>
                      </div>

                      {/* Features */}
                      {provider.supportedFeatures.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {provider.supportedFeatures.map((feature) => (
                            <span
                              key={feature}
                              className="px-2 py-1 text-xs font-medium text-purple-700 bg-purple-100 rounded"
                            >
                              {feature}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col space-y-2 ml-4">
                      {!provider.isPrimary && provider.isActive && (
                        <button
                          onClick={() => handleSwitchPrimary(provider.name)}
                          disabled={switching === provider.name}
                          className="px-4 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center space-x-2"
                        >
                          {switching === provider.name ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Zap className="w-4 h-4" />
                          )}
                          <span>Make Primary</span>
                        </button>
                      )}
                      <button
                        onClick={() => setEditingProvider(provider)}
                        className="px-4 py-2 text-sm bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 flex items-center space-x-2"
                      >
                        <Edit className="w-4 h-4" />
                        <span>Edit</span>
                      </button>
                      {!provider.isPrimary && (
                        <button
                          onClick={() => handleDelete(provider)}
                          className="px-4 py-2 text-sm bg-white border border-red-300 text-red-700 rounded-md hover:bg-red-50 flex items-center space-x-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Delete</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Add/Edit Modal */}
        {(showAddModal || editingProvider) && (
          <ProviderModal
            provider={editingProvider}
            onClose={() => {
              setShowAddModal(false);
              setEditingProvider(null);
            }}
            onSave={async () => {
              await fetchProviders();
              setShowAddModal(false);
              setEditingProvider(null);
            }}
            token={token!}
          />
        )}
      </div>
    </div>
  );
}

// Provider Modal Component
function ProviderModal({ provider, onClose, onSave, token }: {
  provider: Provider | null;
  onClose: () => void;
  onSave: () => void;
  token: string;
}) {
  const [formData, setFormData] = useState({
    name: provider?.name || '',
    displayName: provider?.displayName || '',
    provider: provider?.provider || 'AMADEUS',
    environment: provider?.environment || 'test',
    isActive: provider?.isActive ?? true,
    priority: provider?.priority || 100,
    clientId: provider?.credentials.clientId || '',
    clientSecret: provider?.credentials.clientSecret || '',
    apiKey: provider?.credentials.apiKey || '',
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const body: any = {
        name: formData.name,
        displayName: formData.displayName,
        provider: formData.provider,
        environment: formData.environment,
        isActive: formData.isActive,
        priority: formData.priority,
        credentials: {
          clientId: formData.clientId,
          clientSecret: formData.clientSecret,
          apiKey: formData.apiKey,
          environment: formData.environment,
        },
        supportedFeatures: ['FLIGHT_SEARCH', 'AIRPORT_SEARCH'],
      };

      if (provider) {
        body.id = provider.id;
      }

      const response = await fetch('/api/admin/providers', {
        method: provider ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        alert(provider ? 'Provider updated!' : 'Provider created!');
        onSave();
      } else {
        const data = await response.json();
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      alert('Failed to save provider');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {provider ? 'Edit Provider' : 'Add New Provider'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Provider Name (ID)
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., amadeus-primary"
                  disabled={!!provider}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Display Name
                </label>
                <input
                  type="text"
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  placeholder="e.g., Amadeus Travel API"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Provider Type
                </label>
                <select
                  value={formData.provider}
                  onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                  disabled={!!provider}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                >
                  <option value="AMADEUS">Amadeus</option>
                  <option value="SKYSCANNER">Skyscanner</option>
                  <option value="KIWI">Kiwi</option>
                  <option value="SABRE">Sabre</option>
                  <option value="TRAVELPORT">Travelport</option>
                  <option value="CUSTOM">Custom</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Environment
                </label>
                <select
                  value={formData.environment}
                  onChange={(e) => setFormData({ ...formData, environment: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="test">Test</option>
                  <option value="production">Production</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority (lower = higher priority)
                </label>
                <input
                  type="number"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                  min="1"
                  max="1000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="flex items-center pt-7">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Active</span>
                </label>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">API Credentials</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Client ID
                  </label>
                  <input
                    type="text"
                    value={formData.clientId}
                    onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Client Secret
                  </label>
                  <input
                    type="password"
                    value={formData.clientSecret}
                    onChange={(e) => setFormData({ ...formData, clientSecret: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    API Key (optional)
                  </label>
                  <input
                    type="password"
                    value={formData.apiKey}
                    onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>{provider ? 'Update' : 'Create'} Provider</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
