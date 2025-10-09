'use client';

// Payment Context
// Comprehensive payment state management for flight booking platform

import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import EnhancedStripeService, { 
  PaymentMethod, 
  PaymentRequest, 
  PaymentResult, 
  RefundRequest,
  RefundResult 
} from '../lib/payments/enhancedStripeService';
import { useAuth } from './AuthContext';

// Payment state interfaces
export interface PaymentState {
  // Payment methods
  paymentMethods: PaymentMethod[];
  selectedPaymentMethod: PaymentMethod | null;
  isLoadingPaymentMethods: boolean;
  
  // Current payment
  currentPayment: {
    amount: number;
    currency: string;
    description: string;
    bookingId?: string;
    clientSecret?: string;
    paymentIntentId?: string;
    status?: string;
  } | null;
  
  // Payment processing
  isProcessingPayment: boolean;
  paymentErrors: {
    type: string;
    message: string;
    field?: string;
  }[];
  
  // Payment history
  paymentHistory: {
    id: string;
    amount: number;
    currency: string;
    status: string;
    description: string;
    date: string;
    paymentMethod: string;
    refundable: boolean;
  }[];
  isLoadingHistory: boolean;
  
  // Billing information
  billingInfo: {
    name: string;
    email: string;
    phone?: string;
    address: {
      line1: string;
      line2?: string;
      city: string;
      state: string;
      country: string;
      postal_code: string;
    };
  } | null;
  
  // Saved preferences
  preferences: {
    savePaymentMethods: boolean;
    defaultPaymentMethod?: string;
    autoPayEnabled: boolean;
    receiptEmailEnabled: boolean;
    smsNotificationsEnabled: boolean;
  };
  
  // Security
  securitySettings: {
    requireCaptcha: boolean;
    requireTwoFactorForPayments: boolean;
    deviceTrustEnabled: boolean;
  };
  
  // UI state
  ui: {
    showPaymentModal: boolean;
    showAddPaymentMethodModal: boolean;
    showBillingModal: boolean;
    showRefundModal: boolean;
    activePaymentStep: 'method' | 'billing' | 'confirmation' | 'processing' | 'success' | 'error';
    paymentModalBookingId?: string;
  };
}

// Action types
type PaymentAction = 
  // Payment methods
  | { type: 'SET_LOADING_PAYMENT_METHODS'; loading: boolean }
  | { type: 'SET_PAYMENT_METHODS'; methods: PaymentMethod[] }
  | { type: 'ADD_PAYMENT_METHOD'; method: PaymentMethod }
  | { type: 'REMOVE_PAYMENT_METHOD'; methodId: string }
  | { type: 'SELECT_PAYMENT_METHOD'; method: PaymentMethod | null }
  | { type: 'SET_DEFAULT_PAYMENT_METHOD'; methodId: string }
  
  // Current payment
  | { type: 'START_PAYMENT'; payment: PaymentState['currentPayment'] }
  | { type: 'UPDATE_PAYMENT_STATUS'; status: string; clientSecret?: string; paymentIntentId?: string }
  | { type: 'COMPLETE_PAYMENT' }
  | { type: 'CANCEL_PAYMENT' }
  
  // Payment processing
  | { type: 'SET_PROCESSING_PAYMENT'; processing: boolean }
  | { type: 'SET_PAYMENT_ERRORS'; errors: PaymentState['paymentErrors'] }
  | { type: 'CLEAR_PAYMENT_ERRORS' }
  | { type: 'ADD_PAYMENT_ERROR'; error: { type: string; message: string; field?: string } }
  
  // Payment history
  | { type: 'SET_LOADING_HISTORY'; loading: boolean }
  | { type: 'SET_PAYMENT_HISTORY'; history: PaymentState['paymentHistory'] }
  | { type: 'ADD_PAYMENT_TO_HISTORY'; payment: PaymentState['paymentHistory'][0] }
  
  // Billing info
  | { type: 'SET_BILLING_INFO'; billingInfo: PaymentState['billingInfo'] }
  | { type: 'UPDATE_BILLING_FIELD'; field: string; value: any }
  
  // Preferences
  | { type: 'UPDATE_PREFERENCES'; preferences: Partial<PaymentState['preferences']> }
  | { type: 'UPDATE_SECURITY_SETTINGS'; settings: Partial<PaymentState['securitySettings']> }
  
  // UI state
  | { type: 'SHOW_PAYMENT_MODAL'; bookingId?: string }
  | { type: 'HIDE_PAYMENT_MODAL' }
  | { type: 'SHOW_ADD_PAYMENT_METHOD_MODAL' }
  | { type: 'HIDE_ADD_PAYMENT_METHOD_MODAL' }
  | { type: 'SHOW_BILLING_MODAL' }
  | { type: 'HIDE_BILLING_MODAL' }
  | { type: 'SHOW_REFUND_MODAL' }
  | { type: 'HIDE_REFUND_MODAL' }
  | { type: 'SET_PAYMENT_STEP'; step: PaymentState['ui']['activePaymentStep'] }
  | { type: 'RESET_PAYMENT_UI' };

// Initial state
const initialState: PaymentState = {
  paymentMethods: [],
  selectedPaymentMethod: null,
  isLoadingPaymentMethods: false,
  
  currentPayment: null,
  
  isProcessingPayment: false,
  paymentErrors: [],
  
  paymentHistory: [],
  isLoadingHistory: false,
  
  billingInfo: null,
  
  preferences: {
    savePaymentMethods: true,
    autoPayEnabled: false,
    receiptEmailEnabled: true,
    smsNotificationsEnabled: false,
  },
  
  securitySettings: {
    requireCaptcha: true,
    requireTwoFactorForPayments: false,
    deviceTrustEnabled: true,
  },
  
  ui: {
    showPaymentModal: false,
    showAddPaymentMethodModal: false,
    showBillingModal: false,
    showRefundModal: false,
    activePaymentStep: 'method',
  },
};

// Reducer
function paymentReducer(state: PaymentState, action: PaymentAction): PaymentState {
  switch (action.type) {
    // Payment methods
    case 'SET_LOADING_PAYMENT_METHODS':
      return { ...state, isLoadingPaymentMethods: action.loading };
    
    case 'SET_PAYMENT_METHODS':
      return { 
        ...state, 
        paymentMethods: action.methods,
        selectedPaymentMethod: action.methods.find(m => m.isDefault) || 
                                action.methods[0] || 
                                null
      };
    
    case 'ADD_PAYMENT_METHOD':
      return {
        ...state,
        paymentMethods: [...state.paymentMethods, action.method],
        selectedPaymentMethod: state.selectedPaymentMethod || action.method,
      };
    
    case 'REMOVE_PAYMENT_METHOD':
      return {
        ...state,
        paymentMethods: state.paymentMethods.filter(m => m.id !== action.methodId),
        selectedPaymentMethod: state.selectedPaymentMethod?.id === action.methodId 
          ? null 
          : state.selectedPaymentMethod,
      };
    
    case 'SELECT_PAYMENT_METHOD':
      return { ...state, selectedPaymentMethod: action.method };
    
    case 'SET_DEFAULT_PAYMENT_METHOD':
      return {
        ...state,
        paymentMethods: state.paymentMethods.map(method => ({
          ...method,
          isDefault: method.id === action.methodId,
        })),
        preferences: {
          ...state.preferences,
          defaultPaymentMethod: action.methodId,
        },
      };
    
    // Current payment
    case 'START_PAYMENT':
      return {
        ...state,
        currentPayment: action.payment,
        paymentErrors: [],
        ui: {
          ...state.ui,
          activePaymentStep: 'method',
        },
      };
    
    case 'UPDATE_PAYMENT_STATUS':
      return {
        ...state,
        currentPayment: state.currentPayment ? {
          ...state.currentPayment,
          status: action.status,
          clientSecret: action.clientSecret || state.currentPayment.clientSecret,
          paymentIntentId: action.paymentIntentId || state.currentPayment.paymentIntentId,
        } : null,
      };
    
    case 'COMPLETE_PAYMENT':
      return {
        ...state,
        currentPayment: null,
        isProcessingPayment: false,
        ui: {
          ...state.ui,
          activePaymentStep: 'success',
        },
      };
    
    case 'CANCEL_PAYMENT':
      return {
        ...state,
        currentPayment: null,
        isProcessingPayment: false,
        paymentErrors: [],
        ui: {
          ...state.ui,
          showPaymentModal: false,
          activePaymentStep: 'method',
        },
      };
    
    // Payment processing
    case 'SET_PROCESSING_PAYMENT':
      return { 
        ...state, 
        isProcessingPayment: action.processing,
        ui: {
          ...state.ui,
          activePaymentStep: action.processing ? 'processing' : state.ui.activePaymentStep,
        },
      };
    
    case 'SET_PAYMENT_ERRORS':
      return { 
        ...state, 
        paymentErrors: action.errors,
        ui: {
          ...state.ui,
          activePaymentStep: action.errors.length > 0 ? 'error' : state.ui.activePaymentStep,
        },
      };
    
    case 'CLEAR_PAYMENT_ERRORS':
      return { ...state, paymentErrors: [] };
    
    case 'ADD_PAYMENT_ERROR':
      return { 
        ...state, 
        paymentErrors: [...state.paymentErrors, action.error],
        ui: {
          ...state.ui,
          activePaymentStep: 'error',
        },
      };
    
    // Payment history
    case 'SET_LOADING_HISTORY':
      return { ...state, isLoadingHistory: action.loading };
    
    case 'SET_PAYMENT_HISTORY':
      return { ...state, paymentHistory: action.history };
    
    case 'ADD_PAYMENT_TO_HISTORY':
      return { 
        ...state, 
        paymentHistory: [action.payment, ...state.paymentHistory] 
      };
    
    // Billing info
    case 'SET_BILLING_INFO':
      return { ...state, billingInfo: action.billingInfo };
    
    case 'UPDATE_BILLING_FIELD':
      if (!state.billingInfo) return state;
      return {
        ...state,
        billingInfo: {
          ...state.billingInfo,
          [action.field]: action.value,
        },
      };
    
    // Preferences
    case 'UPDATE_PREFERENCES':
      return {
        ...state,
        preferences: { ...state.preferences, ...action.preferences },
      };
    
    case 'UPDATE_SECURITY_SETTINGS':
      return {
        ...state,
        securitySettings: { ...state.securitySettings, ...action.settings },
      };
    
    // UI state
    case 'SHOW_PAYMENT_MODAL':
      return {
        ...state,
        ui: {
          ...state.ui,
          showPaymentModal: true,
          paymentModalBookingId: action.bookingId,
          activePaymentStep: 'method',
        },
      };
    
    case 'HIDE_PAYMENT_MODAL':
      return {
        ...state,
        ui: {
          ...state.ui,
          showPaymentModal: false,
          paymentModalBookingId: undefined,
          activePaymentStep: 'method',
        },
      };
    
    case 'SHOW_ADD_PAYMENT_METHOD_MODAL':
      return {
        ...state,
        ui: { ...state.ui, showAddPaymentMethodModal: true },
      };
    
    case 'HIDE_ADD_PAYMENT_METHOD_MODAL':
      return {
        ...state,
        ui: { ...state.ui, showAddPaymentMethodModal: false },
      };
    
    case 'SHOW_BILLING_MODAL':
      return {
        ...state,
        ui: { ...state.ui, showBillingModal: true },
      };
    
    case 'HIDE_BILLING_MODAL':
      return {
        ...state,
        ui: { ...state.ui, showBillingModal: false },
      };
    
    case 'SHOW_REFUND_MODAL':
      return {
        ...state,
        ui: { ...state.ui, showRefundModal: true },
      };
    
    case 'HIDE_REFUND_MODAL':
      return {
        ...state,
        ui: { ...state.ui, showRefundModal: false },
      };
    
    case 'SET_PAYMENT_STEP':
      return {
        ...state,
        ui: { ...state.ui, activePaymentStep: action.step },
      };
    
    case 'RESET_PAYMENT_UI':
      return {
        ...state,
        ui: {
          ...initialState.ui,
          showPaymentModal: false,
          showAddPaymentMethodModal: false,
          showBillingModal: false,
          showRefundModal: false,
        },
        currentPayment: null,
        isProcessingPayment: false,
        paymentErrors: [],
      };
    
    default:
      return state;
  }
}

// Context value interface
interface PaymentContextValue {
  state: PaymentState;
  
  // Payment method actions
  loadPaymentMethods: () => Promise<void>;
  addPaymentMethod: (paymentMethodId: string) => Promise<boolean>;
  removePaymentMethod: (methodId: string) => Promise<boolean>;
  setDefaultPaymentMethod: (methodId: string) => Promise<boolean>;
  selectPaymentMethod: (method: PaymentMethod | null) => void;
  
  // Payment processing
  startPayment: (amount: number, currency: string, description: string, bookingId?: string) => Promise<PaymentResult>;
  processPayment: (paymentRequest: Omit<PaymentRequest, 'userId'>) => Promise<PaymentResult>;
  confirmPayment: (paymentIntentId: string, paymentMethodId?: string) => Promise<PaymentResult>;
  cancelPayment: () => void;
  
  // Refunds
  processRefund: (paymentIntentId: string, amount?: number, reason?: RefundRequest['reason']) => Promise<RefundResult>;
  
  // Billing and preferences
  updateBillingInfo: (billingInfo: PaymentState['billingInfo']) => void;
  updatePreferences: (preferences: Partial<PaymentState['preferences']>) => void;
  updateSecuritySettings: (settings: Partial<PaymentState['securitySettings']>) => void;
  
  // Payment history
  loadPaymentHistory: () => Promise<void>;
  
  // UI actions
  showPaymentModal: (bookingId?: string) => void;
  hidePaymentModal: () => void;
  showAddPaymentMethodModal: () => void;
  hideAddPaymentMethodModal: () => void;
  showBillingModal: () => void;
  hideBillingModal: () => void;
  showRefundModal: () => void;
  hideRefundModal: () => void;
  setPaymentStep: (step: PaymentState['ui']['activePaymentStep']) => void;
  resetPaymentUI: () => void;
  
  // Utilities
  formatAmount: (amount: number, currency: string) => string;
  validateBillingInfo: (billingInfo: PaymentState['billingInfo']) => { isValid: boolean; errors: string[] };
  getPaymentMethodDisplayName: (method: PaymentMethod) => string;
}

// Create context
const PaymentContext = createContext<PaymentContextValue | undefined>(undefined);

// Provider component
interface PaymentProviderProps {
  children: ReactNode;
}

export function PaymentProvider({ children }: PaymentProviderProps) {
  const [state, dispatch] = useReducer(paymentReducer, initialState);
  const { user } = useAuth();

  // Payment method actions
  const loadPaymentMethods = async () => {
    if (!user?.customerId) return;

    dispatch({ type: 'SET_LOADING_PAYMENT_METHODS', loading: true });
    
    try {
      const methods = await EnhancedStripeService.getPaymentMethods(user.customerId);
      dispatch({ type: 'SET_PAYMENT_METHODS', methods });
    } catch (error) {
      console.error('Failed to load payment methods:', error);
      dispatch({ 
        type: 'ADD_PAYMENT_ERROR', 
        error: { 
          type: 'load_error', 
          message: 'Failed to load payment methods' 
        } 
      });
    } finally {
      dispatch({ type: 'SET_LOADING_PAYMENT_METHODS', loading: false });
    }
  };

  const addPaymentMethod = async (paymentMethodId: string): Promise<boolean> => {
    if (!user?.customerId) return false;

    try {
      const method = await EnhancedStripeService.addPaymentMethod(user.customerId, paymentMethodId);
      if (method) {
        dispatch({ type: 'ADD_PAYMENT_METHOD', method });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to add payment method:', error);
      dispatch({ 
        type: 'ADD_PAYMENT_ERROR', 
        error: { 
          type: 'add_method_error', 
          message: 'Failed to add payment method' 
        } 
      });
      return false;
    }
  };

  const removePaymentMethod = async (methodId: string): Promise<boolean> => {
    try {
      const success = await EnhancedStripeService.removePaymentMethod(methodId);
      if (success) {
        dispatch({ type: 'REMOVE_PAYMENT_METHOD', methodId });
      }
      return success;
    } catch (error) {
      console.error('Failed to remove payment method:', error);
      dispatch({ 
        type: 'ADD_PAYMENT_ERROR', 
        error: { 
          type: 'remove_method_error', 
          message: 'Failed to remove payment method' 
        } 
      });
      return false;
    }
  };

  const setDefaultPaymentMethod = async (methodId: string): Promise<boolean> => {
    try {
      // This would typically involve updating the customer's default payment method
      dispatch({ type: 'SET_DEFAULT_PAYMENT_METHOD', methodId });
      return true;
    } catch (error) {
      console.error('Failed to set default payment method:', error);
      return false;
    }
  };

  const selectPaymentMethod = (method: PaymentMethod | null) => {
    dispatch({ type: 'SELECT_PAYMENT_METHOD', method });
  };

  // Payment processing
  const startPayment = async (
    amount: number, 
    currency: string, 
    description: string, 
    bookingId?: string
  ): Promise<PaymentResult> => {
    if (!user) {
      throw new Error('User must be authenticated to start payment');
    }

    const payment = {
      amount,
      currency,
      description,
      bookingId,
    };

    dispatch({ type: 'START_PAYMENT', payment });
    dispatch({ type: 'SHOW_PAYMENT_MODAL', bookingId });

    return {
      success: true,
      metadata: {
        processingTime: 0,
        timestamp: new Date().toISOString(),
        provider: 'stripe' as const,
        securityScore: 1.0,
      },
    };
  };

  const processPayment = async (
    paymentRequest: Omit<PaymentRequest, 'userId'>
  ): Promise<PaymentResult> => {
    if (!user) {
      throw new Error('User must be authenticated to process payment');
    }

    dispatch({ type: 'SET_PROCESSING_PAYMENT', processing: true });
    dispatch({ type: 'CLEAR_PAYMENT_ERRORS' });

    try {
      const fullRequest: PaymentRequest = {
        ...paymentRequest,
        userId: user.id,
      };

      const result = await EnhancedStripeService.createPaymentIntent(fullRequest);

      if (result.success && result.paymentIntent) {
        dispatch({ 
          type: 'UPDATE_PAYMENT_STATUS', 
          status: result.status || 'created',
          clientSecret: result.clientSecret,
          paymentIntentId: result.paymentIntent.id,
        });

        if (result.status === 'succeeded') {
          dispatch({ type: 'COMPLETE_PAYMENT' });
        }
      } else if (result.error) {
        dispatch({
          type: 'SET_PAYMENT_ERRORS',
          errors: [{
            type: result.error.type,
            message: result.error.message,
            field: result.error.param,
          }],
        });
      }

      return result;
    } catch (error: any) {
      dispatch({
        type: 'SET_PAYMENT_ERRORS',
        errors: [{
          type: 'processing_error',
          message: error.message || 'Payment processing failed',
        }],
      });

      return {
        success: false,
        error: {
          type: 'processing_error',
          code: 'unknown',
          message: error.message || 'Payment processing failed',
        },
        metadata: {
          processingTime: 0,
          timestamp: new Date().toISOString(),
          provider: 'stripe',
          securityScore: 0,
        },
      };
    } finally {
      dispatch({ type: 'SET_PROCESSING_PAYMENT', processing: false });
    }
  };

  const confirmPayment = async (
    paymentIntentId: string,
    paymentMethodId?: string
  ): Promise<PaymentResult> => {
    dispatch({ type: 'SET_PROCESSING_PAYMENT', processing: true });

    try {
      const result = await EnhancedStripeService.confirmPaymentIntent(paymentIntentId, paymentMethodId);

      if (result.success && result.paymentIntent) {
        dispatch({
          type: 'UPDATE_PAYMENT_STATUS',
          status: result.status || 'confirmed',
          clientSecret: result.clientSecret,
        });

        if (result.status === 'succeeded') {
          dispatch({ type: 'COMPLETE_PAYMENT' });
        }
      }

      return result;
    } catch (error: any) {
      dispatch({
        type: 'SET_PAYMENT_ERRORS',
        errors: [{
          type: 'confirmation_error',
          message: error.message || 'Payment confirmation failed',
        }],
      });

      return {
        success: false,
        error: {
          type: 'confirmation_error',
          code: 'unknown',
          message: error.message || 'Payment confirmation failed',
        },
        metadata: {
          processingTime: 0,
          timestamp: new Date().toISOString(),
          provider: 'stripe',
          securityScore: 0,
        },
      };
    } finally {
      dispatch({ type: 'SET_PROCESSING_PAYMENT', processing: false });
    }
  };

  const cancelPayment = () => {
    dispatch({ type: 'CANCEL_PAYMENT' });
  };

  // Refunds
  const processRefund = async (
    paymentIntentId: string,
    amount?: number,
    reason: RefundRequest['reason'] = 'requested_by_customer'
  ): Promise<RefundResult> => {
    try {
      return await EnhancedStripeService.processRefund({
        paymentIntentId,
        amount,
        reason,
      });
    } catch (error: any) {
      return {
        success: false,
        error: {
          type: 'refund_error',
          code: 'unknown',
          message: error.message || 'Refund processing failed',
        },
        metadata: {
          processingTime: 0,
          timestamp: new Date().toISOString(),
          originalAmount: 0,
          refundedAmount: 0,
        },
      };
    }
  };

  // Billing and preferences
  const updateBillingInfo = (billingInfo: PaymentState['billingInfo']) => {
    dispatch({ type: 'SET_BILLING_INFO', billingInfo });
  };

  const updatePreferences = (preferences: Partial<PaymentState['preferences']>) => {
    dispatch({ type: 'UPDATE_PREFERENCES', preferences });
  };

  const updateSecuritySettings = (settings: Partial<PaymentState['securitySettings']>) => {
    dispatch({ type: 'UPDATE_SECURITY_SETTINGS', settings });
  };

  // Payment history
  const loadPaymentHistory = async () => {
    if (!user) return;

    dispatch({ type: 'SET_LOADING_HISTORY', loading: true });
    
    try {
      // This would typically fetch from your backend API
      // For now, we'll use mock data
      const mockHistory = [
        {
          id: 'pi_mock_1',
          amount: 299.99,
          currency: 'USD',
          status: 'succeeded',
          description: 'Flight booking - NYC to LAX',
          date: new Date().toISOString(),
          paymentMethod: 'Visa ending in 4242',
          refundable: true,
        },
      ];
      
      dispatch({ type: 'SET_PAYMENT_HISTORY', history: mockHistory });
    } catch (error) {
      console.error('Failed to load payment history:', error);
    } finally {
      dispatch({ type: 'SET_LOADING_HISTORY', loading: false });
    }
  };

  // UI actions
  const showPaymentModal = (bookingId?: string) => {
    dispatch({ type: 'SHOW_PAYMENT_MODAL', bookingId });
  };

  const hidePaymentModal = () => {
    dispatch({ type: 'HIDE_PAYMENT_MODAL' });
  };

  const showAddPaymentMethodModal = () => {
    dispatch({ type: 'SHOW_ADD_PAYMENT_METHOD_MODAL' });
  };

  const hideAddPaymentMethodModal = () => {
    dispatch({ type: 'HIDE_ADD_PAYMENT_METHOD_MODAL' });
  };

  const showBillingModal = () => {
    dispatch({ type: 'SHOW_BILLING_MODAL' });
  };

  const hideBillingModal = () => {
    dispatch({ type: 'HIDE_BILLING_MODAL' });
  };

  const showRefundModal = () => {
    dispatch({ type: 'SHOW_REFUND_MODAL' });
  };

  const hideRefundModal = () => {
    dispatch({ type: 'HIDE_REFUND_MODAL' });
  };

  const setPaymentStep = (step: PaymentState['ui']['activePaymentStep']) => {
    dispatch({ type: 'SET_PAYMENT_STEP', step });
  };

  const resetPaymentUI = () => {
    dispatch({ type: 'RESET_PAYMENT_UI' });
  };

  // Utilities
  const formatAmount = (amount: number, currency: string): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount);
  };

  const validateBillingInfo = (billingInfo: PaymentState['billingInfo']): {
    isValid: boolean;
    errors: string[];
  } => {
    const errors: string[] = [];

    if (!billingInfo) {
      errors.push('Billing information is required');
      return { isValid: false, errors };
    }

    if (!billingInfo.name.trim()) {
      errors.push('Name is required');
    }

    if (!billingInfo.email.trim()) {
      errors.push('Email is required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(billingInfo.email)) {
      errors.push('Invalid email address');
    }

    if (!billingInfo.address.line1.trim()) {
      errors.push('Address is required');
    }

    if (!billingInfo.address.city.trim()) {
      errors.push('City is required');
    }

    if (!billingInfo.address.state.trim()) {
      errors.push('State is required');
    }

    if (!billingInfo.address.country.trim()) {
      errors.push('Country is required');
    }

    if (!billingInfo.address.postal_code.trim()) {
      errors.push('Postal code is required');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  };

  const getPaymentMethodDisplayName = (method: PaymentMethod): string => {
    if (method.type === 'card') {
      return `${method.brand?.toUpperCase() || 'Card'} ending in ${method.last4}`;
    }
    return method.type.charAt(0).toUpperCase() + method.type.slice(1);
  };

  const value: PaymentContextValue = {
    state,
    
    // Payment method actions
    loadPaymentMethods,
    addPaymentMethod,
    removePaymentMethod,
    setDefaultPaymentMethod,
    selectPaymentMethod,
    
    // Payment processing
    startPayment,
    processPayment,
    confirmPayment,
    cancelPayment,
    
    // Refunds
    processRefund,
    
    // Billing and preferences
    updateBillingInfo,
    updatePreferences,
    updateSecuritySettings,
    
    // Payment history
    loadPaymentHistory,
    
    // UI actions
    showPaymentModal,
    hidePaymentModal,
    showAddPaymentMethodModal,
    hideAddPaymentMethodModal,
    showBillingModal,
    hideBillingModal,
    showRefundModal,
    hideRefundModal,
    setPaymentStep,
    resetPaymentUI,
    
    // Utilities
    formatAmount,
    validateBillingInfo,
    getPaymentMethodDisplayName,
  };

  return (
    <PaymentContext.Provider value={value}>
      {children}
    </PaymentContext.Provider>
  );
}

// Custom hook
export function usePayment() {
  const context = useContext(PaymentContext);
  if (context === undefined) {
    throw new Error('usePayment must be used within a PaymentProvider');
  }
  return context;
}

export default PaymentContext;