'use client';

import React from 'react';
import { GitCompare, X } from 'lucide-react';

interface CompareFloatingBarProps {
  selectedCount: number;
  maxCount: number;
  onCompare: () => void;
  onClear: () => void;
}

export default function CompareFloatingBar({
  selectedCount,
  maxCount,
  onCompare,
  onClear,
}: CompareFloatingBarProps) {
  if (selectedCount === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 animate-slide-up">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-full shadow-2xl border-2 border-white">
        <div className="flex items-center gap-4 px-6 py-4">
          <div className="flex items-center gap-3">
            <GitCompare className="w-5 h-5" />
            <div>
              <p className="font-semibold text-sm">
                {selectedCount} of {maxCount} selected
              </p>
              <p className="text-xs text-blue-100">
                {selectedCount >= 2 ? 'Ready to compare' : 'Select at least 2 flights'}
              </p>
            </div>
          </div>

          <div className="h-8 w-px bg-white/30" />

          <div className="flex items-center gap-2">
            <button
              onClick={onCompare}
              disabled={selectedCount < 2}
              className="px-6 py-2 bg-white text-blue-700 rounded-full font-semibold hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Compare Now
            </button>
            <button
              onClick={onClear}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
              title="Clear selection"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
