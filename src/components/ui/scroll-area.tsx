'use client';

import * as React from 'react';

interface ScrollAreaProps {
  children: React.ReactNode;
  className?: string;
}

export function ScrollArea({ children, className = '' }: ScrollAreaProps) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div className="h-full w-full overflow-auto">
        {children}
      </div>
    </div>
  );
}