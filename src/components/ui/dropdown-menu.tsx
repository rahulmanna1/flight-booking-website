'use client';

import * as React from 'react';

interface DropdownMenuProps {
  children: React.ReactNode;
}

export function DropdownMenu({ children }: DropdownMenuProps) {
  return <div className="relative inline-block">{children}</div>;
}

export function DropdownMenuTrigger({ children, asChild }: { children: React.ReactNode; asChild?: boolean }) {
  const [open, setOpen] = React.useState(false);
  
  return (
    <div onClick={() => setOpen(!open)}>
      {children}
    </div>
  );
}

export function DropdownMenuContent({ 
  children, 
  className = '',
  align = 'start'
}: { 
  children: React.ReactNode; 
  className?: string;
  align?: 'start' | 'end'; 
}) {
  const alignmentClass = align === 'end' ? 'right-0' : 'left-0';
  
  return (
    <div className={`absolute ${alignmentClass} mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50 ${className}`}>
      {children}
    </div>
  );
}

export function DropdownMenuItem({ 
  children, 
  onClick,
  className = '' 
}: { 
  children: React.ReactNode; 
  onClick?: () => void;
  className?: string; 
}) {
  return (
    <div 
      className={`px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

export function DropdownMenuSeparator({ className = '' }: { className?: string }) {
  return <hr className={`my-1 border-gray-200 ${className}`} />;
}

export function DropdownMenuLabel({ 
  children, 
  className = '' 
}: { 
  children: React.ReactNode; 
  className?: string; 
}) {
  return (
    <div className={`px-4 py-2 text-sm font-semibold text-gray-900 ${className}`}>
      {children}
    </div>
  );
}

export function DropdownMenuCheckboxItem({ 
  children, 
  checked,
  onCheckedChange,
  className = '' 
}: { 
  children: React.ReactNode; 
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  className?: string; 
}) {
  return (
    <div className={`px-4 py-2 text-sm flex items-center space-x-2 hover:bg-gray-100 cursor-pointer ${className}`}
         onClick={() => onCheckedChange?.(!checked)}>
      <input 
        type="checkbox" 
        checked={checked} 
        onChange={(e) => onCheckedChange?.(e.target.checked)}
        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
      />
      <span>{children}</span>
    </div>
  );
}
