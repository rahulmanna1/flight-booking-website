'use client';

import React, { useState } from 'react';
import {
  SlidersHorizontal,
  ArrowUpDown,
  LayoutGrid,
  List,
  Filter,
  X,
} from 'lucide-react';

export type SortOption =
  | 'price-asc'
  | 'price-desc'
  | 'duration-asc'
  | 'duration-desc'
  | 'departure-asc'
  | 'departure-desc'
  | 'best';

export type ViewMode = 'grid' | 'list';

interface FilterSortBarProps {
  resultCount: number;
  activeFilterCount: number;
  sortBy: SortOption;
  viewMode: ViewMode;
  onSortChange: (sort: SortOption) => void;
  onViewModeChange: (mode: ViewMode) => void;
  onToggleFilters: () => void;
  filtersVisible: boolean;
}

const sortOptions: Array<{ value: SortOption; label: string }> = [
  { value: 'best', label: 'Best' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'duration-asc', label: 'Duration: Shortest' },
  { value: 'duration-desc', label: 'Duration: Longest' },
  { value: 'departure-asc', label: 'Departure: Earliest' },
  { value: 'departure-desc', label: 'Departure: Latest' },
];

export default function FilterSortBar({
  resultCount,
  activeFilterCount,
  sortBy,
  viewMode,
  onSortChange,
  onViewModeChange,
  onToggleFilters,
  filtersVisible,
}: FilterSortBarProps) {
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);

  const currentSortLabel =
    sortOptions.find((opt) => opt.value === sortBy)?.label || 'Best';

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4">
        {/* Left section - Results count */}
        <div className="flex items-center gap-4">
          <div>
            <p className="text-sm text-gray-600">
              <span className="font-bold text-gray-900">{resultCount}</span> flights found
            </p>
          </div>
        </div>

        {/* Right section - Controls */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Filters Toggle Button */}
          <button
            onClick={onToggleFilters}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border-2 font-medium transition-all ${
              filtersVisible
                ? 'bg-blue-50 border-blue-500 text-blue-700'
                : 'bg-white border-gray-300 text-gray-700 hover:border-blue-400 hover:bg-blue-50'
            }`}
          >
            {filtersVisible ? (
              <X className="w-4 h-4" />
            ) : (
              <SlidersHorizontal className="w-4 h-4" />
            )}
            <span className="text-sm">Filters</span>
            {activeFilterCount > 0 && (
              <span className="bg-blue-600 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Sort Dropdown */}
          <div className="relative">
            <button
              onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-300 rounded-lg text-gray-700 hover:border-blue-400 hover:bg-blue-50 font-medium transition-all"
            >
              <ArrowUpDown className="w-4 h-4" />
              <span className="text-sm">{currentSortLabel}</span>
            </button>

            {sortDropdownOpen && (
              <>
                {/* Backdrop */}
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setSortDropdownOpen(false)}
                />

                {/* Dropdown Menu */}
                <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-xl z-20 overflow-hidden">
                  <div className="p-2">
                    <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Sort By
                    </div>
                    {sortOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          onSortChange(option.value);
                          setSortDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                          sortBy === option.value
                            ? 'bg-blue-50 text-blue-700 font-semibold'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {option.label}
                        {sortBy === option.value && (
                          <span className="float-right text-blue-600">✓</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* View Mode Toggle */}
          <div className="inline-flex border-2 border-gray-300 rounded-lg overflow-hidden">
            <button
              onClick={() => onViewModeChange('grid')}
              className={`p-2 transition-colors ${
                viewMode === 'grid'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
              title="Grid view"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => onViewModeChange('list')}
              className={`p-2 transition-colors ${
                viewMode === 'list'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
              title="List view"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile filters summary */}
      <div className="sm:hidden border-t border-gray-200 p-3 bg-gray-50">
        <div className="flex items-center justify-between text-xs text-gray-600">
          <span>Sorted by: {currentSortLabel}</span>
          <span>View: {viewMode === 'grid' ? 'Grid' : 'List'}</span>
        </div>
      </div>
    </div>
  );
}
