'use client';

import * as React from 'react';
import { cn } from '@/lib/design-system/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export function Input({ className = '', type = 'text', error = false, ...props }: InputProps) {
  return (
    <input
      type={type}
      className={cn(
        // Base styles
        'flex h-11 w-full rounded-lg border-2 bg-white px-4 py-2.5 text-sm font-medium',
        'transition-colors duration-200',
        // Placeholder
        'placeholder:text-gray-500',
        // Focus states - using design tokens
        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
        // Error states
        error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-200 hover:border-gray-300',
        // Disabled states
        'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50',
        // File input
        'file:border-0 file:bg-transparent file:text-sm file:font-medium',
        className
      )}
      {...props}
    />
  );
}
