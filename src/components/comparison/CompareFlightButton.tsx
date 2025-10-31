'use client';

import React from 'react';
import { GitCompare, Check } from 'lucide-react';

interface CompareFlightButtonProps {
  flightId: string;
  isSelected: boolean;
  onToggle: (flightId: string) => void;
  disabled?: boolean;
  maxReached?: boolean;
}

export default function CompareFlightButton({
  flightId,
  isSelected,
  onToggle,
  disabled = false,
  maxReached = false,
}: CompareFlightButtonProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!disabled && !(maxReached && !isSelected)) {
      onToggle(flightId);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled || (maxReached && !isSelected)}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border-2 font-medium text-sm transition-all ${
        isSelected
          ? 'bg-blue-50 border-blue-500 text-blue-700'
          : disabled || (maxReached && !isSelected)
          ? 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed'
          : 'bg-white border-gray-300 text-gray-700 hover:border-blue-400 hover:bg-blue-50'
      }`}
      title={
        maxReached && !isSelected
          ? 'Maximum 4 flights can be compared'
          : isSelected
          ? 'Remove from comparison'
          : 'Add to comparison'
      }
    >
      {isSelected ? (
        <>
          <Check className="w-4 h-4" />
          <span>Added</span>
        </>
      ) : (
        <>
          <GitCompare className="w-4 h-4" />
          <span>Compare</span>
        </>
      )}
    </button>
  );
}
