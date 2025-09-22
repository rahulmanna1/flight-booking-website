'use client';

import { AlertCircle, Wifi, RefreshCw, Settings } from 'lucide-react';

export interface ApiError {
  message: string;
  status?: number;
  type?: 'network' | 'server' | 'client' | 'timeout' | 'geolocation';
}

interface ApiErrorHandlerProps {
  error: ApiError;
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
}

export default function ApiErrorHandler({ 
  error, 
  onRetry, 
  onDismiss,
  className = '' 
}: ApiErrorHandlerProps) {
  
  const getErrorIcon = () => {
    switch (error.type) {
      case 'network':
        return <Wifi className="w-6 h-6 text-red-500" />;
      case 'geolocation':
        return <Settings className="w-6 h-6 text-yellow-500" />;
      default:
        return <AlertCircle className="w-6 h-6 text-red-500" />;
    }
  };

  const getErrorTitle = () => {
    switch (error.type) {
      case 'network':
        return 'Connection Problem';
      case 'server':
        return 'Server Error';
      case 'timeout':
        return 'Request Timeout';
      case 'geolocation':
        return 'Location Access Required';
      default:
        return 'Something went wrong';
    }
  };

  const getErrorDescription = () => {
    switch (error.type) {
      case 'network':
        return 'Please check your internet connection and try again.';
      case 'server':
        return 'Our servers are experiencing issues. Please try again in a moment.';
      case 'timeout':
        return 'The request took too long to complete. Please try again.';
      case 'geolocation':
        return 'Please enable location access in your browser settings to find nearby airports.';
      default:
        return error.message || 'An unexpected error occurred.';
    }
  };

  const getActionButtons = () => {
    switch (error.type) {
      case 'geolocation':
        return (
          <div className="flex space-x-3">
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
              >
                Skip
              </button>
            )}
            {onRetry && (
              <button
                onClick={onRetry}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center space-x-2"
              >
                <Settings className="w-4 h-4" />
                <span>Enable Location</span>
              </button>
            )}
          </div>
        );
      default:
        return (
          <div className="flex space-x-3">
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
              >
                Dismiss
              </button>
            )}
            {onRetry && (
              <button
                onClick={onRetry}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium flex items-center space-x-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Try Again</span>
              </button>
            )}
          </div>
        );
    }
  };

  const getBgColor = () => {
    switch (error.type) {
      case 'geolocation':
        return 'bg-yellow-50 border-yellow-200';
      case 'network':
        return 'bg-orange-50 border-orange-200';
      default:
        return 'bg-red-50 border-red-200';
    }
  };

  return (
    <div className={`border rounded-lg p-4 ${getBgColor()} ${className}`}>
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          {getErrorIcon()}
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-900 mb-1">
            {getErrorTitle()}
          </h3>
          <p className="text-sm text-gray-700 mb-3">
            {getErrorDescription()}
          </p>
          
          {error.status && (
            <p className="text-xs text-gray-500 mb-3">
              Error Code: {error.status}
            </p>
          )}
          
          {(onRetry || onDismiss) && (
            <div className="flex justify-end">
              {getActionButtons()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}