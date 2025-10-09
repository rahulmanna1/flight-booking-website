'use client';

import * as React from 'react';

interface RadioGroupProps {
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

export function RadioGroup({ value, onValueChange, children, className = '' }: RadioGroupProps) {
  return (
    <div className={`space-y-2 ${className}`} role="radiogroup">
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          const childProps = child.props as Record<string, any>;
          if (childProps && typeof childProps === 'object' && 'value' in childProps) {
            return React.cloneElement(child as React.ReactElement<any>, {
              ...childProps,
              checked: childProps.value === value,
              onChange: () => onValueChange?.(childProps.value),
            });
          }
        }
        return child;
      })}
    </div>
  );
}

interface RadioGroupItemProps {
  value: string;
  checked?: boolean;
  onChange?: () => void;
  className?: string;
  children?: React.ReactNode;
  id?: string;
}

export function RadioGroupItem({ value, checked, onChange, className = '', children, id }: RadioGroupItemProps) {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <input
        type="radio"
        value={value}
        checked={checked}
        onChange={onChange}
        id={id}
        className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
      />
      {children}
    </div>
  );
}