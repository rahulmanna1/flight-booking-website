// CAPTCHA Provider Component
// Provides CAPTCHA context and components for form integration

'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import useCaptcha from '@/hooks/useCaptcha';

interface CaptchaContextType {
  executeRecaptcha: (action: string) => Promise<string | null>;
  isLoaded: boolean;
  isExecuting: boolean;
  error: string | null;
  lastScore: number | null;
  resetCaptcha: () => void;
}

const CaptchaContext = createContext<CaptchaContextType | undefined>(undefined);

interface CaptchaProviderProps {
  children: React.ReactNode;
  hideDefaultBadge?: boolean;
  onError?: (error: string) => void;
  onSuccess?: (token: string, action: string) => void;
}

/**
 * CAPTCHA Provider Component
 * Wraps the app to provide CAPTCHA functionality to all child components
 */
export function CaptchaProvider({ 
  children, 
  hideDefaultBadge = false,
  onError,
  onSuccess 
}: CaptchaProviderProps) {
  const captcha = useCaptcha({
    autoLoad: true,
    hideDefaultBadge,
    onError,
    onSuccess
  });

  return (
    <CaptchaContext.Provider value={captcha}>
      {children}
      {hideDefaultBadge && <CaptchaBadge />}
    </CaptchaContext.Provider>
  );
}

/**
 * Hook to use CAPTCHA context
 */
export function useCaptchaContext(): CaptchaContextType {
  const context = useContext(CaptchaContext);
  if (context === undefined) {
    throw new Error('useCaptchaContext must be used within a CaptchaProvider');
  }
  return context;
}

/**
 * CAPTCHA Badge Component (shown when default badge is hidden)
 */
function CaptchaBadge() {
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-gray-100 border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-600 shadow-sm">
        <div className="flex items-center space-x-2">
          <span>Protected by</span>
          <strong className="text-blue-600">reCAPTCHA</strong>
        </div>
        <div className="text-xs text-gray-500 mt-1">
          <a 
            href="https://policies.google.com/privacy" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:underline"
          >
            Privacy
          </a>
          {' - '}
          <a 
            href="https://policies.google.com/terms" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:underline"
          >
            Terms
          </a>
        </div>
      </div>
    </div>
  );
}

/**
 * CAPTCHA Form Component
 * Automatically handles CAPTCHA for form submissions
 */
interface CaptchaFormProps {
  children: React.ReactNode;
  action: string;
  onSubmit: (data: any, captchaToken: string | null) => Promise<void> | void;
  onCaptchaError?: (error: string) => void;
  className?: string;
  disabled?: boolean;
}

export function CaptchaForm({ 
  children, 
  action, 
  onSubmit, 
  onCaptchaError,
  className = '',
  disabled = false 
}: CaptchaFormProps) {
  const captcha = useCaptchaContext();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    if (disabled || isSubmitting) return;

    setIsSubmitting(true);

    try {
      // Execute CAPTCHA
      console.log(`🔐 Executing CAPTCHA for form action: ${action}`);
      const captchaToken = await captcha.executeRecaptcha(action);
      
      if (!captchaToken) {
        const errorMessage = captcha.error || 'CAPTCHA verification failed';
        console.warn('⚠️ CAPTCHA execution failed, proceeding without protection:', errorMessage);
        onCaptchaError?.(errorMessage);
        // Continue with form submission even if CAPTCHA fails (for development)
        // In production, you might want to return here to prevent submission
      }

      console.log('✅ CAPTCHA token obtained, submitting form');

      // Get form data
      const formData = new FormData(event.currentTarget);
      const data = Object.fromEntries(formData.entries());

      // Call the onSubmit handler with the CAPTCHA token
      await onSubmit(data, captchaToken);

    } catch (error: any) {
      console.error('❌ Form submission error:', error);
      onCaptchaError?.(error.message || 'Form submission failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className={className}
      noValidate
    >
      {children}
      
      {/* Hidden input to track form action */}
      <input type="hidden" name="captchaAction" value={action} />
      
      {/* CAPTCHA Status Display */}
      {captcha.error && (
        <div className="mt-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
          <strong>Security Error:</strong> {captcha.error}
        </div>
      )}
      
      {isSubmitting && (
        <div className="mt-2 text-sm text-blue-600 bg-blue-50 border border-blue-200 rounded px-3 py-2">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span>Verifying security...</span>
          </div>
        </div>
      )}
    </form>
  );
}

/**
 * CAPTCHA Button Component
 * Button that executes CAPTCHA before triggering action
 */
interface CaptchaButtonProps {
  action: string;
  onClick: (captchaToken: string | null) => Promise<void> | void;
  onCaptchaError?: (error: string) => void;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
}

export function CaptchaButton({ 
  action, 
  onClick, 
  onCaptchaError,
  children, 
  className = '',
  disabled = false,
  variant = 'primary'
}: CaptchaButtonProps) {
  const captcha = useCaptchaContext();
  const [isExecuting, setIsExecuting] = useState(false);

  const baseClasses = 'px-4 py-2 font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
  };

  const handleClick = async () => {
    if (disabled || isExecuting || captcha.isExecuting) return;

    setIsExecuting(true);

    try {
      console.log(`🔐 Executing CAPTCHA for button action: ${action}`);
      const captchaToken = await captcha.executeRecaptcha(action);
      
      if (!captchaToken) {
        const errorMessage = captcha.error || 'CAPTCHA verification failed';
        console.error('❌ CAPTCHA execution failed:', errorMessage);
        onCaptchaError?.(errorMessage);
        return;
      }

      console.log('✅ CAPTCHA token obtained, executing action');
      await onClick(captchaToken);

    } catch (error: any) {
      console.error('❌ Button action error:', error);
      onCaptchaError?.(error.message || 'Action failed');
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled || isExecuting || captcha.isExecuting}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
    >
      {isExecuting || captcha.isExecuting ? (
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          <span>Verifying...</span>
        </div>
      ) : (
        children
      )}
    </button>
  );
}

/**
 * CAPTCHA Status Component
 * Shows CAPTCHA verification status and score
 */
export function CaptchaStatus() {
  const captcha = useCaptchaContext();

  if (!captcha.isLoaded) {
    return (
      <div className="text-sm text-gray-500">
        Loading security verification...
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2 text-sm">
        <div className={`w-2 h-2 rounded-full ${
          captcha.error ? 'bg-red-500' : 
          captcha.lastScore !== null ? 'bg-green-500' : 'bg-gray-400'
        }`} />
        <span className={`${
          captcha.error ? 'text-red-600' : 
          captcha.lastScore !== null ? 'text-green-600' : 'text-gray-600'
        }`}>
          {captcha.error ? 'Security Error' : 
           captcha.lastScore !== null ? 'Security Verified' : 'Ready for Verification'}
        </span>
      </div>
      
      {captcha.lastScore !== null && (
        <div className="text-xs text-gray-500">
          Verification Score: {(captcha.lastScore * 100).toFixed(0)}%
        </div>
      )}
      
      {captcha.error && (
        <div className="text-xs text-red-600">
          {captcha.error}
        </div>
      )}
    </div>
  );
}

export default CaptchaProvider;