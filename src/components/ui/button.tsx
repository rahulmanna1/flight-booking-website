'use client';

import * as React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  asChild?: boolean;
}

export function Button({ 
  className = '', 
  variant = 'default', 
  size = 'default',
  asChild = false,
  children,
  ...props 
}: ButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';
  
  const variants = {
    default: 'bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700',
    destructive: 'bg-red-500 text-white hover:bg-red-600 active:bg-red-700',
    outline: 'border-2 border-gray-200 bg-transparent hover:bg-gray-100 active:bg-gray-200',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 active:bg-gray-300',
    ghost: 'hover:bg-gray-100 active:bg-gray-200',
    link: 'underline-offset-4 hover:underline text-blue-600 hover:text-blue-700',
  };

  const sizes = {
    default: 'h-11 px-4 text-base',  // 44px - Mobile touch target
    sm: 'h-9 px-3 text-sm',           // 36px - Compact UI
    lg: 'h-12 px-8 text-lg',          // 48px - Prominent
    icon: 'h-11 w-11 p-0',            // 44px - Touch target
  };

  const buttonClasses = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`;
  
  if (asChild && React.isValidElement(children)) {
    const childProps = (children.props as Record<string, any>) || {};
    return React.cloneElement(children as React.ReactElement<any>, {
      ...childProps,
      className: `${childProps.className || ''} ${buttonClasses}`.trim(),
      ...props,
    });
  }

  return (
    <button
      className={buttonClasses}
      {...props}
    >
      {children}
    </button>
  );
}
