'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { 
  PriceAlert, 
  CreatePriceAlertRequest, 
  UpdatePriceAlertRequest, 
  PriceAlertFilters,
  PriceAlertsListResponse,
  PriceAlertResponse,
  DeletePriceAlertResponse
} from '@/types/priceAlert';

interface PriceAlertContextType {
  alerts: PriceAlert[];
  loading: boolean;
  error: string | null;
  stats: {
    total: number;
    active: number;
    triggered: number;
    avgSavings: number;
  } | null;
  
  // Actions
  fetchAlerts: (filters?: PriceAlertFilters) => Promise<void>;
  createAlert: (alert: CreatePriceAlertRequest) => Promise<{ success: boolean; data?: PriceAlert; error?: string }>;
  updateAlert: (id: string, updates: UpdatePriceAlertRequest) => Promise<{ success: boolean; data?: PriceAlert; error?: string }>;
  deleteAlert: (id: string) => Promise<{ success: boolean; error?: string }>;
  toggleAlert: (id: string) => Promise<{ success: boolean; data?: PriceAlert; error?: string }>;
  fetchStats: () => Promise<void>;
  clearError: () => void;
}

const PriceAlertContext = createContext<PriceAlertContextType | undefined>(undefined);

interface PriceAlertProviderProps {
  children: ReactNode;
}

export function PriceAlertProvider({ children }: PriceAlertProviderProps) {
  const { user, token, isLoading: authLoading } = useAuth();
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<{
    total: number;
    active: number;
    triggered: number;
    avgSavings: number;
  } | null>(null);

  // Helper function to make authenticated API requests
  const apiRequest = async (url: string, options: RequestInit = {}) => {
    if (!token) {
      throw new Error('Authentication required');
    }

    // Additional check to ensure token is valid and not just an empty string
    if (typeof token !== 'string' || token.trim() === '') {
      throw new Error('Authentication required');
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    return response.json();
  };

  const fetchAlerts = async (filters: PriceAlertFilters = {}) => {
    if (!user || !token) return;

    setLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });

      const url = `/api/price-alerts${queryParams.toString() ? `?${queryParams}` : ''}`;
      const response: PriceAlertsListResponse = await apiRequest(url);
      
      if (response.success && response.data) {
        setAlerts(response.data.alerts);
      } else {
        setError(response.error || 'Failed to fetch price alerts');
      }
    } catch (err) {
      // Only set error if it's not an authentication issue
      if (err instanceof Error && err.message !== 'Authentication required') {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const createAlert = async (alertData: CreatePriceAlertRequest): Promise<{ success: boolean; data?: PriceAlert; error?: string }> => {
    if (!user) {
      return { success: false, error: 'Authentication required' };
    }

    setError(null);

    try {
      const response: PriceAlertResponse = await apiRequest('/api/price-alerts', {
        method: 'POST',
        body: JSON.stringify(alertData),
      });

      if (response.success && response.data) {
        setAlerts(prev => [response.data!, ...prev]);
        await fetchStats(); // Update stats
        return { success: true, data: response.data };
      } else {
        const errorMsg = response.error || 'Failed to create price alert';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to create price alert';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  const updateAlert = async (id: string, updates: UpdatePriceAlertRequest): Promise<{ success: boolean; data?: PriceAlert; error?: string }> => {
    if (!user) {
      return { success: false, error: 'Authentication required' };
    }

    setError(null);

    try {
      const response: PriceAlertResponse = await apiRequest(`/api/price-alerts/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });

      if (response.success && response.data) {
        setAlerts(prev => prev.map(alert => 
          alert.id === id ? response.data! : alert
        ));
        await fetchStats(); // Update stats
        return { success: true, data: response.data };
      } else {
        const errorMsg = response.error || 'Failed to update price alert';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to update price alert';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  const deleteAlert = async (id: string): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: 'Authentication required' };
    }

    setError(null);

    try {
      const response: DeletePriceAlertResponse = await apiRequest(`/api/price-alerts/${id}`, {
        method: 'DELETE',
      });

      if (response.success) {
        setAlerts(prev => prev.filter(alert => alert.id !== id));
        await fetchStats(); // Update stats
        return { success: true };
      } else {
        const errorMsg = response.error || 'Failed to delete price alert';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to delete price alert';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  const toggleAlert = async (id: string): Promise<{ success: boolean; data?: PriceAlert; error?: string }> => {
    if (!user) {
      return { success: false, error: 'Authentication required' };
    }

    setError(null);

    try {
      const response: PriceAlertResponse = await apiRequest(`/api/price-alerts/${id}/toggle`, {
        method: 'POST',
      });

      if (response.success && response.data) {
        setAlerts(prev => prev.map(alert => 
          alert.id === id ? response.data! : alert
        ));
        await fetchStats(); // Update stats
        return { success: true, data: response.data };
      } else {
        const errorMsg = response.error || 'Failed to toggle price alert';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to toggle price alert';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  const fetchStats = async () => {
    if (!user || !token) return;

    try {
      const response = await apiRequest('/api/price-alerts/stats');
      
      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (err) {
      // Only log error if it's not an authentication issue
      if (err instanceof Error && err.message !== 'Authentication required') {
        console.error('Failed to fetch price alert stats:', err);
      }
    }
  };

  const clearError = () => {
    setError(null);
  };

  // Load alerts and stats when user and token are available and auth is not loading
  useEffect(() => {
    // Don't attempt API calls while auth is still loading
    if (authLoading) {
      return;
    }
    
    if (user && token) {
      // Add a small delay to ensure auth is fully established
      const timeoutId = setTimeout(() => {
        fetchAlerts();
        fetchStats();
      }, 100);
      
      return () => clearTimeout(timeoutId);
    } else {
      setAlerts([]);
      setStats(null);
      setError(null); // Clear any previous errors
    }
  }, [user, token, authLoading]);

  const contextValue: PriceAlertContextType = {
    alerts,
    loading,
    error,
    stats,
    fetchAlerts,
    createAlert,
    updateAlert,
    deleteAlert,
    toggleAlert,
    fetchStats,
    clearError,
  };

  return (
    <PriceAlertContext.Provider value={contextValue}>
      {children}
    </PriceAlertContext.Provider>
  );
}

export function usePriceAlerts(): PriceAlertContextType {
  const context = useContext(PriceAlertContext);
  if (context === undefined) {
    throw new Error('usePriceAlerts must be used within a PriceAlertProvider');
  }
  return context;
}