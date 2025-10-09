'use client';

// React Hook for Client-Side CAPTCHA Integration
// Provides easy integration with Google reCAPTCHA v3 for form protection

import React, { useState, useEffect, useCallback, useRef } from 'react';

interface CaptchaHookState {
  isLoaded: boolean;
  isExecuting: boolean;
  error: string | null;
  lastToken: string | null;
  lastScore: number | null;
}

interface CaptchaHookReturn extends CaptchaHookState {
  executeRecaptcha: (action: string) => Promise<string | null>;
  resetCaptcha: () => void;
  validateToken: (token: string, action: string) => Promise<boolean>;
}

interface RecaptchaWindow extends Window {
  grecaptcha?: {
    ready: (callback: () => void) => void;
    execute: (siteKey: string, options: { action: string }) => Promise<string>;
  };
}

declare const window: RecaptchaWindow;

// CAPTCHA configuration from environment
const CAPTCHA_CONFIG = {
  siteKey: process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '',
  enabled: !!process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY && 
           !(process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_DISABLE_CAPTCHA_DEV === 'true'),
  scriptId: 'recaptcha-script',
  scriptSrc: 'https://www.google.com/recaptcha/api.js',
  isDevelopment: process.env.NODE_ENV === 'development',
  disabledInDev: process.env.NEXT_PUBLIC_DISABLE_CAPTCHA_DEV === 'true'
};

/**
 * Custom hook for Google reCAPTCHA v3 integration
 * 
 * @param options Configuration options for the hook
 * @returns Object containing CAPTCHA state and methods
 */
export function useCaptcha(options: {
  autoLoad?: boolean; // Load reCAPTCHA script automatically
  hideDefaultBadge?: boolean; // Hide reCAPTCHA badge (must show alternative UI)
  onError?: (error: string) => void; // Error callback
  onSuccess?: (token: string, action: string) => void; // Success callback
} = {}): CaptchaHookReturn {

  const {
    autoLoad = true,
    hideDefaultBadge = false,
    onError,
    onSuccess
  } = options;

  // Hook state
  const [state, setState] = useState<CaptchaHookState>({
    isLoaded: false,
    isExecuting: false,
    error: null,
    lastToken: null,
    lastScore: null
  });

  // Track script loading to prevent duplicates
  const scriptLoadingRef = useRef<boolean>(false);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Update state helper
  const updateState = useCallback((updates: Partial<CaptchaHookState>) => {
    setState(current => ({ ...current, ...updates }));
  }, []);

  // Load reCAPTCHA script
  const loadRecaptchaScript = useCallback((): Promise<void> => {
    return new Promise((resolve, reject) => {
      // Check if CAPTCHA is enabled
      if (!CAPTCHA_CONFIG.enabled) {
        console.warn('⚠️ CAPTCHA not configured, skipping script load');
        resolve();
        return;
      }

      // Check if already loaded
      if (window.grecaptcha) {
        resolve();
        return;
      }

      // Check if script is already in DOM
      const existingScript = document.getElementById(CAPTCHA_CONFIG.scriptId);
      if (existingScript) {
        // Wait for existing script to load
        existingScript.addEventListener('load', () => resolve());
        existingScript.addEventListener('error', () => reject(new Error('Failed to load reCAPTCHA script')));
        return;
      }

      // Prevent duplicate loading attempts
      if (scriptLoadingRef.current) {
        setTimeout(() => {
          if (window.grecaptcha) {
            resolve();
          } else {
            reject(new Error('reCAPTCHA script loading timeout'));
          }
        }, 5000);
        return;
      }

      scriptLoadingRef.current = true;

      // Create and inject script
      const script = document.createElement('script');
      script.id = CAPTCHA_CONFIG.scriptId;
      script.src = `${CAPTCHA_CONFIG.scriptSrc}?render=${CAPTCHA_CONFIG.siteKey}${hideDefaultBadge ? '&badge=inline' : ''}`;
      script.async = true;
      script.defer = true;

      script.onload = () => {
        console.log('✅ reCAPTCHA script loaded');
        scriptLoadingRef.current = false;

        // Wait for grecaptcha to be available
        if (window.grecaptcha) {
          window.grecaptcha.ready(() => {
            updateState({ isLoaded: true, error: null });
            resolve();
          });
        } else {
          reject(new Error('reCAPTCHA not available after script load'));
        }
      };

      script.onerror = (event) => {
        console.warn('⚠️ Failed to load reCAPTCHA script - continuing without CAPTCHA protection');
        scriptLoadingRef.current = false;
        const error = 'reCAPTCHA unavailable';
        updateState({ error, isLoaded: false });
        // Don't call onError to avoid breaking the user flow
        // onError?.(error);
        
        // Resolve instead of reject to allow the app to continue without CAPTCHA
        resolve();
      };

      // Add to document head
      document.head.appendChild(script);
    });
  }, [hideDefaultBadge, onError, updateState]);

  // Execute reCAPTCHA challenge
  const executeRecaptcha = useCallback(async (action: string): Promise<string | null> => {
    if (!CAPTCHA_CONFIG.enabled) {
      console.warn('⚠️ CAPTCHA not enabled, returning mock token for development');
      return 'mock_token_dev';
    }

    if (!state.isLoaded || !window.grecaptcha) {
      console.warn('⚠️ reCAPTCHA not loaded, returning mock token');
      // Return a mock token to allow the app to continue functioning
      return 'mock_token_fallback';
    }

    if (state.isExecuting) {
      console.warn('⚠️ reCAPTCHA execution already in progress');
      return null;
    }

    try {
      updateState({ isExecuting: true, error: null });

      console.log(`🔐 Executing reCAPTCHA for action: ${action}`);

      // Execute reCAPTCHA
      const token = await window.grecaptcha.execute(CAPTCHA_CONFIG.siteKey, { action });

      if (!token) {
        throw new Error('No token returned from reCAPTCHA');
      }

      console.log('✅ reCAPTCHA token generated successfully');
      
      updateState({ 
        lastToken: token, 
        isExecuting: false,
        error: null
      });

      onSuccess?.(token, action);
      return token;

    } catch (error: any) {
      console.error('❌ reCAPTCHA execution failed:', error);
      const errorMessage = error.message || 'reCAPTCHA execution failed';
      
      updateState({ 
        error: errorMessage, 
        isExecuting: false,
        lastToken: null
      });
      
      onError?.(errorMessage);
      return null;
    }
  }, [state.isLoaded, state.isExecuting, onError, onSuccess, updateState]);

  // Validate token server-side
  const validateToken = useCallback(async (token: string, action: string): Promise<boolean> => {
    if (!token) {
      console.warn('⚠️ No token provided for validation');
      return false;
    }

    try {
      console.log(`🔍 Validating CAPTCHA token for action: ${action}`);

      const response = await fetch('/api/security/captcha/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, action })
      });

      if (!response.ok) {
        throw new Error(`Validation request failed: ${response.status}`);
      }

      const result = await response.json();
      
      updateState({ 
        lastScore: result.score,
        error: result.success ? null : result.error
      });

      if (!result.success) {
        console.warn(`⚠️ CAPTCHA validation failed: ${result.error}`);
        onError?.(result.error);
      } else {
        console.log(`✅ CAPTCHA validation successful, score: ${result.score}`);
      }

      return result.success;

    } catch (error: any) {
      console.error('❌ CAPTCHA validation error:', error);
      const errorMessage = error.message || 'Validation failed';
      updateState({ error: errorMessage });
      onError?.(errorMessage);
      return false;
    }
  }, [onError, updateState]);

  // Reset CAPTCHA state
  const resetCaptcha = useCallback(() => {
    console.log('🔄 Resetting CAPTCHA state');
    updateState({
      error: null,
      lastToken: null,
      lastScore: null,
      isExecuting: false
    });
  }, [updateState]);

  // Auto-load script on mount
  useEffect(() => {
    if (autoLoad && CAPTCHA_CONFIG.enabled) {
      loadRecaptchaScript().catch(error => {
        console.warn('⚠️ Failed to auto-load reCAPTCHA, continuing without protection:', error.message);
        // Don't break the app if CAPTCHA fails to load
        updateState({ error: 'CAPTCHA unavailable', isLoaded: false });
      });
    }
  }, [autoLoad, loadRecaptchaScript, updateState]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  // Handle visibility change (reset on tab focus for security)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && state.lastToken) {
        // Reset token when user returns to tab for security
        console.log('🔄 Tab focus detected, resetting CAPTCHA token');
        resetCaptcha();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [state.lastToken, resetCaptcha]);

  return {
    ...state,
    executeRecaptcha,
    resetCaptcha,
    validateToken
  };
}

/**
 * Higher-order component for CAPTCHA protection
 * Wraps forms to add automatic CAPTCHA validation
 */
export function withCaptcha<T extends Record<string, any>>(
  WrappedComponent: React.ComponentType<T>,
  action: string = 'submit'
) {
  const CaptchaProtectedComponent = (props: T) => {
    const captcha = useCaptcha();

    const handleSubmitWithCaptcha = async (originalHandler: Function) => {
      const token = await captcha.executeRecaptcha(action);
      if (token) {
        return originalHandler({ ...props, captchaToken: token });
      } else {
        console.error('❌ CAPTCHA verification required before submit');
        throw new Error('CAPTCHA verification failed');
      }
    };

    return (
      <WrappedComponent
        {...props}
        captcha={captcha}
        onSubmitWithCaptcha={handleSubmitWithCaptcha}
      />
    );
  };

  CaptchaProtectedComponent.displayName = `withCaptcha(${WrappedComponent.displayName || WrappedComponent.name})`;
  
  return CaptchaProtectedComponent;
}

/**
 * Utility hook for form CAPTCHA integration
 * Simplifies adding CAPTCHA to forms with automatic handling
 */
export function useFormCaptcha(action: string, options?: {
  onValidationSuccess?: () => void;
  onValidationFailure?: (error: string) => void;
  validateOnSubmit?: boolean;
}) {
  const captcha = useCaptcha();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const executeAndValidate = useCallback(async (): Promise<boolean> => {
    if (!captcha.isLoaded) {
      console.warn('⚠️ CAPTCHA not loaded');
      return false;
    }

    setIsSubmitting(true);

    try {
      // Execute CAPTCHA
      const token = await captcha.executeRecaptcha(action);
      
      if (!token) {
        options?.onValidationFailure?.('Failed to generate CAPTCHA token');
        return false;
      }

      // Validate token if required
      if (options?.validateOnSubmit !== false) {
        const isValid = await captcha.validateToken(token, action);
        
        if (isValid) {
          options?.onValidationSuccess?.();
        } else {
          options?.onValidationFailure?.(captcha.error || 'CAPTCHA validation failed');
        }
        
        return isValid;
      }

      options?.onValidationSuccess?.();
      return true;

    } finally {
      setIsSubmitting(false);
    }
  }, [captcha, action, options]);

  return {
    ...captcha,
    isSubmitting,
    executeAndValidate
  };
}

export default useCaptcha;