// Enhanced Authentication Context
// Comprehensive user authentication with security features, profile management, and 2FA

'use client';

import React, { createContext, useContext, useReducer, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { logSecurityEvent } from '@/lib/security/audit';
import { getClientIP } from '@/lib/utils/network';

// User Profile Interface
export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  phoneNumber?: string;
  avatar?: string;
  
  // Travel preferences
  preferences: {
    defaultCurrency: string;
    defaultTravelClass: 'economy' | 'premium-economy' | 'business' | 'first';
    preferredSeats: string[];
    mealPreferences: string[];
    specialRequirements: string[];
    loyaltyPrograms: {
      airline: string;
      membershipNumber: string;
      tier: string;
    }[];
  };

  // Contact information
  addresses: {
    id: string;
    type: 'home' | 'work' | 'billing';
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    isDefault: boolean;
  }[];

  // Emergency contacts
  emergencyContacts: {
    id: string;
    name: string;
    relationship: string;
    phone: string;
    email?: string;
  }[];

  // Account settings
  settings: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    marketingEmails: boolean;
    priceAlerts: boolean;
    bookingReminders: boolean;
    flightUpdates: boolean;
    newsletter: boolean;
  };

  // Security settings
  security: {
    twoFactorEnabled: boolean;
    lastPasswordChange: string;
    trustedDevices: {
      id: string;
      name: string;
      lastUsed: string;
      location: string;
    }[];
    loginHistory: {
      timestamp: string;
      ip: string;
      location: string;
      device: string;
      success: boolean;
    }[];
  };

  // Account metadata
  metadata: {
    createdAt: string;
    lastLogin: string;
    emailVerified: boolean;
    phoneVerified: boolean;
    accountStatus: 'active' | 'suspended' | 'pending';
    kycStatus: 'none' | 'pending' | 'verified' | 'rejected';
  };
}

// Authentication State
export interface AuthState {
  user: UserProfile | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  
  // Session management
  sessionId: string | null;
  sessionExpiry: string | null;
  autoLogoutWarning: boolean;
  
  // Security state
  loginAttempts: number;
  isLocked: boolean;
  lockExpiry: string | null;
  twoFactorRequired: boolean;
  twoFactorMethod: '2fa-app' | 'sms' | 'email' | null;
  
  // UI state
  showLoginModal: boolean;
  showRegistrationModal: boolean;
  showTwoFactorModal: boolean;
  showProfileModal: boolean;
  
  // Error handling
  error: string | null;
  fieldErrors: Record<string, string>;
  
  // Activity tracking
  bookingHistory: any[];
  searchHistory: any[];
  priceAlerts: any[];
}

// Action Types
type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: UserProfile | null }
  | { type: 'SET_TOKENS'; payload: { accessToken: string; refreshToken: string } }
  | { type: 'SET_SESSION'; payload: { sessionId: string; expiry: string } }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_FIELD_ERRORS'; payload: Record<string, string> }
  | { type: 'SET_LOGIN_ATTEMPTS'; payload: number }
  | { type: 'SET_ACCOUNT_LOCKED'; payload: { locked: boolean; expiry?: string } }
  | { type: 'SET_TWO_FACTOR_REQUIRED'; payload: { required: boolean; method?: '2fa-app' | 'sms' | 'email' | null } }
  | { type: 'SET_AUTO_LOGOUT_WARNING'; payload: boolean }
  | { type: 'SHOW_MODAL'; payload: 'login' | 'registration' | 'twoFactor' | 'profile' | null }
  | { type: 'UPDATE_PROFILE'; payload: Partial<UserProfile> }
  | { type: 'ADD_LOGIN_HISTORY'; payload: any }
  | { type: 'LOGOUT' }
  | { type: 'CLEAR_ERRORS' };

// Initial state
const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isLoading: false,
  isAuthenticated: false,
  sessionId: null,
  sessionExpiry: null,
  autoLogoutWarning: false,
  loginAttempts: 0,
  isLocked: false,
  lockExpiry: null,
  twoFactorRequired: false,
  twoFactorMethod: null,
  showLoginModal: false,
  showRegistrationModal: false,
  showTwoFactorModal: false,
  showProfileModal: false,
  error: null,
  fieldErrors: {},
  bookingHistory: [],
  searchHistory: [],
  priceAlerts: [],
};

// Reducer
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        isLoading: false,
        error: null,
      };

    case 'SET_TOKENS':
      return {
        ...state,
        accessToken: action.payload.accessToken,
        refreshToken: action.payload.refreshToken,
      };

    case 'SET_SESSION':
      return {
        ...state,
        sessionId: action.payload.sessionId,
        sessionExpiry: action.payload.expiry,
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };

    case 'SET_FIELD_ERRORS':
      return {
        ...state,
        fieldErrors: action.payload,
        isLoading: false,
      };

    case 'SET_LOGIN_ATTEMPTS':
      return {
        ...state,
        loginAttempts: action.payload,
      };

    case 'SET_ACCOUNT_LOCKED':
      return {
        ...state,
        isLocked: action.payload.locked,
        lockExpiry: action.payload.expiry || null,
        error: action.payload.locked ? 'Account temporarily locked due to failed login attempts' : null,
      };

    case 'SET_TWO_FACTOR_REQUIRED':
      return {
        ...state,
        twoFactorRequired: action.payload.required,
        twoFactorMethod: action.payload.method || null,
        showTwoFactorModal: action.payload.required,
      };

    case 'SET_AUTO_LOGOUT_WARNING':
      return {
        ...state,
        autoLogoutWarning: action.payload,
      };

    case 'SHOW_MODAL':
      return {
        ...state,
        showLoginModal: action.payload === 'login',
        showRegistrationModal: action.payload === 'registration',
        showTwoFactorModal: action.payload === 'twoFactor',
        showProfileModal: action.payload === 'profile',
        error: null,
        fieldErrors: {},
      };

    case 'UPDATE_PROFILE':
      return {
        ...state,
        user: state.user ? { ...state.user, ...action.payload } : null,
      };

    case 'ADD_LOGIN_HISTORY':
      return {
        ...state,
        user: state.user ? {
          ...state.user,
          security: {
            ...state.user.security,
            loginHistory: [action.payload, ...state.user.security.loginHistory.slice(0, 49)], // Keep last 50
          }
        } : null,
      };

    case 'LOGOUT':
      return {
        ...initialState,
        searchHistory: state.searchHistory, // Preserve search history
      };

    case 'CLEAR_ERRORS':
      return {
        ...state,
        error: null,
        fieldErrors: {},
      };

    default:
      return state;
  }
}

// Context value interface
interface EnhancedAuthContextValue {
  state: AuthState;
  
  // Authentication methods
  login: (email: string, password: string, rememberMe?: boolean) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshAuthToken: () => Promise<boolean>;
  
  // Two-factor authentication
  setupTwoFactor: (method: '2fa-app' | 'sms' | 'email') => Promise<string>; // Returns setup key/QR
  verifyTwoFactor: (code: string) => Promise<boolean>;
  disableTwoFactor: (password: string) => Promise<boolean>;
  
  // Profile management
  updateProfile: (updates: Partial<UserProfile>) => Promise<boolean>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  updatePreferences: (preferences: Partial<UserProfile['preferences']>) => Promise<boolean>;
  
  // Address management
  addAddress: (address: Omit<UserProfile['addresses'][0], 'id'>) => Promise<boolean>;
  updateAddress: (addressId: string, updates: Partial<UserProfile['addresses'][0]>) => Promise<boolean>;
  deleteAddress: (addressId: string) => Promise<boolean>;
  
  // Security features
  getTrustedDevices: () => Promise<UserProfile['security']['trustedDevices']>;
  revokeTrustedDevice: (deviceId: string) => Promise<boolean>;
  getLoginHistory: () => Promise<UserProfile['security']['loginHistory']>;
  
  // Account verification
  resendEmailVerification: () => Promise<boolean>;
  verifyEmail: (token: string) => Promise<boolean>;
  verifyPhone: (code: string) => Promise<boolean>;
  
  // Password reset
  requestPasswordReset: (email: string) => Promise<boolean>;
  resetPassword: (token: string, newPassword: string) => Promise<boolean>;
  
  // UI controls
  showModal: (modal: 'login' | 'registration' | 'twoFactor' | 'profile' | null) => void;
  clearErrors: () => void;
  
  // Session management
  extendSession: () => Promise<boolean>;
  checkSessionStatus: () => boolean;
}

// Registration data interface
export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  phoneNumber?: string;
  acceptTerms: boolean;
  marketingOptIn?: boolean;
}

const EnhancedAuthContext = createContext<EnhancedAuthContextValue | undefined>(undefined);

// Provider component
export function EnhancedAuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const router = useRouter();
  const sessionCheckInterval = useRef<NodeJS.Timeout | null>(null);
  const autoLogoutTimeout = useRef<NodeJS.Timeout | null>(null);

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      try {
        const accessToken = localStorage.getItem('accessToken');
        const refreshToken = localStorage.getItem('refreshToken');
        
        if (accessToken && refreshToken) {
          // Validate tokens and get user profile
          const user = await validateTokensAndGetUser(accessToken);
          if (user) {
            dispatch({ type: 'SET_TOKENS', payload: { accessToken, refreshToken } });
            dispatch({ type: 'SET_USER', payload: user });
            startSessionManagement();
          } else {
            // Invalid tokens, clear them
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      }
      
      dispatch({ type: 'SET_LOADING', payload: false });
    };

    initializeAuth();
  }, []);

  // Session management
  const startSessionManagement = useCallback(() => {
    // Check session status every 5 minutes
    sessionCheckInterval.current = setInterval(() => {
      checkSessionStatus();
    }, 5 * 60 * 1000);

    // Auto-logout warning 5 minutes before expiry
    const sessionExpiry = localStorage.getItem('sessionExpiry');
    if (sessionExpiry) {
      const expiryTime = new Date(sessionExpiry).getTime();
      const warningTime = expiryTime - 5 * 60 * 1000; // 5 minutes before
      const now = Date.now();

      if (warningTime > now) {
        autoLogoutTimeout.current = setTimeout(() => {
          dispatch({ type: 'SET_AUTO_LOGOUT_WARNING', payload: true });
        }, warningTime - now);
      }
    }
  }, []);

  // Login function
  const login = useCallback(async (email: string, password: string, rememberMe = false): Promise<boolean> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'CLEAR_ERRORS' });

    try {
      const clientIP = await getClientIPAddress();
      
      // Check if account is locked
      if (state.isLocked && state.lockExpiry) {
        if (new Date() < new Date(state.lockExpiry)) {
          dispatch({ type: 'SET_ERROR', payload: 'Account is temporarily locked. Please try again later.' });
          return false;
        } else {
          // Lock expired, reset
          dispatch({ type: 'SET_ACCOUNT_LOCKED', payload: { locked: false } });
          dispatch({ type: 'SET_LOGIN_ATTEMPTS', payload: 0 });
        }
      }

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          rememberMe,
          clientInfo: {
            ip: clientIP,
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString(),
          },
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Reset login attempts on success
        dispatch({ type: 'SET_LOGIN_ATTEMPTS', payload: 0 });
        dispatch({ type: 'SET_ACCOUNT_LOCKED', payload: { locked: false } });

        if (data.twoFactorRequired) {
          // Two-factor authentication required
          dispatch({
            type: 'SET_TWO_FACTOR_REQUIRED',
            payload: { required: true, method: data.twoFactorMethod },
          });
          
          // Store temporary session info
          sessionStorage.setItem('tempAuthData', JSON.stringify({
            email,
            sessionId: data.tempSessionId,
          }));
          
          return true; // Will show 2FA modal
        } else {
          // Complete login
          await completeLogin(data);
          return true;
        }
      } else {
        // Handle login failure
        const attempts = state.loginAttempts + 1;
        dispatch({ type: 'SET_LOGIN_ATTEMPTS', payload: attempts });

        if (attempts >= 5) {
          // Lock account for 30 minutes
          const lockExpiry = new Date(Date.now() + 30 * 60 * 1000).toISOString();
          dispatch({ type: 'SET_ACCOUNT_LOCKED', payload: { locked: true, expiry: lockExpiry } });
          
          await logSecurityEvent({
            type: 'ACCOUNT_LOCKED',
            severity: 'high',
            details: {
              email,
              attempts,
              lockExpiry,
              clientIP,
            },
            metadata: {
              userAgent: navigator.userAgent,
              endpoint: '/api/auth/login',
            },
          });
        }

        dispatch({ type: 'SET_ERROR', payload: data.error || 'Login failed' });
        if (data.fieldErrors) {
          dispatch({ type: 'SET_FIELD_ERRORS', payload: data.fieldErrors });
        }

        // Log failed login attempt
        await logSecurityEvent({
          type: 'LOGIN_FAILED',
          severity: 'medium',
          details: {
            email,
            attempts,
            reason: data.error,
            clientIP,
          },
          metadata: {
            userAgent: navigator.userAgent,
            endpoint: '/api/auth/login',
          },
        });

        return false;
      }
    } catch (error: any) {
      console.error('Login error:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Network error. Please try again.' });
      return false;
    }
  }, [state.isLocked, state.lockExpiry, state.loginAttempts]);

  // Complete login process
  const completeLogin = useCallback(async (authData: any) => {
    const { user, accessToken, refreshToken, sessionId, sessionExpiry } = authData;

    // Store tokens
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('sessionExpiry', sessionExpiry);

    // Update state
    dispatch({ type: 'SET_USER', payload: user });
    dispatch({ type: 'SET_TOKENS', payload: { accessToken, refreshToken } });
    dispatch({ type: 'SET_SESSION', payload: { sessionId, expiry: sessionExpiry } });

    // Add login history entry
    const clientIP = await getClientIPAddress();
    dispatch({
      type: 'ADD_LOGIN_HISTORY',
      payload: {
        timestamp: new Date().toISOString(),
        ip: clientIP,
        location: 'Unknown', // Would be populated by IP geolocation service
        device: getDeviceInfo(),
        success: true,
      },
    });

    // Start session management
    startSessionManagement();

    // Close any open modals
    dispatch({ type: 'SHOW_MODAL', payload: null });

    // Log successful login
    await logSecurityEvent({
      type: 'LOGIN_SUCCESS',
      severity: 'low',
      details: {
        userId: user.id,
        email: user.email,
        clientIP,
        sessionId,
      },
      metadata: {
        userAgent: navigator.userAgent,
        endpoint: '/api/auth/login',
      },
    });

    console.log('✅ Login successful');
  }, [startSessionManagement]);

  // Register function
  const register = useCallback(async (userData: RegisterData): Promise<boolean> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'CLEAR_ERRORS' });

    try {
      const clientIP = await getClientIPAddress();

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...userData,
          clientInfo: {
            ip: clientIP,
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString(),
          },
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Registration successful
        dispatch({ type: 'SHOW_MODAL', payload: 'login' });
        dispatch({ type: 'SET_ERROR', payload: null });

        await logSecurityEvent({
          type: 'USER_REGISTERED',
          severity: 'low',
          details: {
            email: userData.email,
            firstName: userData.firstName,
            lastName: userData.lastName,
            clientIP,
          },
          metadata: {
            userAgent: navigator.userAgent,
            endpoint: '/api/auth/register',
          },
        });

        console.log('✅ Registration successful');
        return true;
      } else {
        dispatch({ type: 'SET_ERROR', payload: data.error || 'Registration failed' });
        if (data.fieldErrors) {
          dispatch({ type: 'SET_FIELD_ERRORS', payload: data.fieldErrors });
        }
        return false;
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Network error. Please try again.' });
      return false;
    }
  }, []);

  // Logout function
  const logout = useCallback(async () => {
    try {
      // Clear timers
      if (sessionCheckInterval.current) {
        clearInterval(sessionCheckInterval.current);
      }
      if (autoLogoutTimeout.current) {
        clearTimeout(autoLogoutTimeout.current);
      }

      // Call logout API if we have a valid session
      if (state.accessToken) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${state.accessToken}`,
            'Content-Type': 'application/json',
          },
        });
      }

      // Clear local storage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('sessionExpiry');
      sessionStorage.removeItem('tempAuthData');

      // Update state
      dispatch({ type: 'LOGOUT' });

      // Redirect to home
      router.push('/');

      console.log('✅ Logout successful');
    } catch (error) {
      console.error('Logout error:', error);
      // Force logout even if API fails
      localStorage.clear();
      sessionStorage.clear();
      dispatch({ type: 'LOGOUT' });
      router.push('/');
    }
  }, [state.accessToken, router]);

  // Additional utility functions...
  const checkSessionStatus = useCallback(() => {
    const sessionExpiry = localStorage.getItem('sessionExpiry');
    if (sessionExpiry) {
      const expiryTime = new Date(sessionExpiry).getTime();
      const now = Date.now();
      
      if (now >= expiryTime) {
        // Session expired, logout
        logout();
        return false;
      } else if (expiryTime - now <= 5 * 60 * 1000) {
        // Show warning
        dispatch({ type: 'SET_AUTO_LOGOUT_WARNING', payload: true });
      }
    }
    return true;
  }, [logout]);

  // Context value
  const contextValue: EnhancedAuthContextValue = {
    state,
    login,
    register,
    logout,
    refreshAuthToken: async () => false, // TODO: Implement
    setupTwoFactor: async () => '', // TODO: Implement
    verifyTwoFactor: async () => false, // TODO: Implement
    disableTwoFactor: async () => false, // TODO: Implement
    updateProfile: async () => false, // TODO: Implement
    changePassword: async () => false, // TODO: Implement
    updatePreferences: async () => false, // TODO: Implement
    addAddress: async () => false, // TODO: Implement
    updateAddress: async () => false, // TODO: Implement
    deleteAddress: async () => false, // TODO: Implement
    getTrustedDevices: async () => [], // TODO: Implement
    revokeTrustedDevice: async () => false, // TODO: Implement
    getLoginHistory: async () => [], // TODO: Implement
    resendEmailVerification: async () => false, // TODO: Implement
    verifyEmail: async () => false, // TODO: Implement
    verifyPhone: async () => false, // TODO: Implement
    requestPasswordReset: async () => false, // TODO: Implement
    resetPassword: async () => false, // TODO: Implement
    showModal: (modal) => dispatch({ type: 'SHOW_MODAL', payload: modal }),
    clearErrors: () => dispatch({ type: 'CLEAR_ERRORS' }),
    extendSession: async () => false, // TODO: Implement
    checkSessionStatus,
  };

  return (
    <EnhancedAuthContext.Provider value={contextValue}>
      {children}
    </EnhancedAuthContext.Provider>
  );
}

// Hook to use the context
export function useEnhancedAuth() {
  const context = useContext(EnhancedAuthContext);
  if (context === undefined) {
    throw new Error('useEnhancedAuth must be used within an EnhancedAuthProvider');
  }
  return context;
}

// Utility functions
async function validateTokensAndGetUser(accessToken: string): Promise<UserProfile | null> {
  try {
    const response = await fetch('/api/auth/profile', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      return data.user;
    }
  } catch (error) {
    console.error('Token validation error:', error);
  }
  
  return null;
}

async function getClientIPAddress(): Promise<string> {
  try {
    // This would typically call an IP detection service
    // For now, return a placeholder
    return 'unknown';
  } catch {
    return 'unknown';
  }
}

function getDeviceInfo(): string {
  const userAgent = navigator.userAgent;
  // Simple device detection
  if (userAgent.includes('Mobile')) return 'Mobile';
  if (userAgent.includes('Tablet')) return 'Tablet';
  return 'Desktop';
}

export default EnhancedAuthContext;