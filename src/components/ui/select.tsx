'use client';

import * as React from 'react';

interface SelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
}

export function Select({ value, onValueChange, children }: SelectProps) {
  return (
    <div className="relative">
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          const childProps = child.props as Record<string, any>;
          return React.cloneElement(child as React.ReactElement<any>, {
            ...childProps,
            value,
            onValueChange,
          });
        }
        return child;
      })}
    </div>
  );
}

export function SelectTrigger({ 
  children, 
  className = '' 
}: { 
  children: React.ReactNode; 
  className?: string; 
}) {
  return (
    <button
      className={`flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      {children}
    </button>
  );
}

export function SelectValue({ placeholder }: { placeholder?: string }) {
  return <span className="text-gray-500">{placeholder}</span>;
}

export function SelectContent({ children }: { children: React.ReactNode }) {
  return (
    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-50 max-h-60 overflow-auto">
      {children}
    </div>
  );
}

export function SelectItem({ 
  value, 
  children, 
  onSelect 
}: { 
  value: string; 
  children: React.ReactNode; 
  onSelect?: (value: string) => void; 
}) {
  return (
    <div
      className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100"
      onClick={() => onSelect?.(value)}
    >
      {children}
    </div>
  );
}