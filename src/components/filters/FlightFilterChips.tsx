'use client';

import React from 'react';
import { X, DollarSign, MapPin, Clock, Plane, Luggage } from 'lucide-react';
import { FlightFilters } from './AdvancedFiltersPanel';

interface FlightFilterChipsProps {
  filters: FlightFilters;
  onRemoveFilter: (filterKey: keyof FlightFilters, value?: any) => void;
  onClearAll: () => void;
}

export default function FlightFilterChips({
  filters,
  onRemoveFilter,
  onClearAll,
}: FlightFilterChipsProps) {
  const chips: Array<{
    key: keyof FlightFilters;
    label: string;
    icon: React.ReactNode;
    value?: any;
  }> = [];

  // Price range chip (only if not at max)
  if (filters.priceRange[1] < 5000) {
    chips.push({
      key: 'priceRange',
      label: `Up to $${filters.priceRange[1]}`,
      icon: <DollarSign className="w-3 h-3" />,
    });
  }

  // Max stops chip
  if (filters.maxStops !== null) {
    const stopsLabel =
      filters.maxStops === 0
        ? 'Non-stop only'
        : `Up to ${filters.maxStops} stop${filters.maxStops > 1 ? 's' : ''}`;
    chips.push({
      key: 'maxStops',
      label: stopsLabel,
      icon: <MapPin className="w-3 h-3" />,
    });
  }

  // Direct flights only
  if (filters.directFlightsOnly) {
    chips.push({
      key: 'directFlightsOnly',
      label: 'Direct flights only',
      icon: <Plane className="w-3 h-3" />,
    });
  }

  // Airlines chips
  filters.airlines.forEach((airline) => {
    chips.push({
      key: 'airlines',
      label: airline,
      icon: <Plane className="w-3 h-3" />,
      value: airline,
    });
  });

  // Departure time chip
  if (filters.departureTimeRange[0] !== 0 || filters.departureTimeRange[1] !== 24) {
    chips.push({
      key: 'departureTimeRange',
      label: `Depart: ${formatTime(filters.departureTimeRange[0])} - ${formatTime(
        filters.departureTimeRange[1]
      )}`,
      icon: <Clock className="w-3 h-3" />,
    });
  }

  // Arrival time chip
  if (filters.arrivalTimeRange[0] !== 0 || filters.arrivalTimeRange[1] !== 24) {
    chips.push({
      key: 'arrivalTimeRange',
      label: `Arrive: ${formatTime(filters.arrivalTimeRange[0])} - ${formatTime(
        filters.arrivalTimeRange[1]
      )}`,
      icon: <Clock className="w-3 h-3" />,
    });
  }

  // Max duration chip
  if (filters.maxDuration !== null) {
    chips.push({
      key: 'maxDuration',
      label: `Max ${formatDuration(filters.maxDuration)}`,
      icon: <Clock className="w-3 h-3" />,
    });
  }

  // Layover duration chips
  if (filters.minLayoverDuration !== null) {
    chips.push({
      key: 'minLayoverDuration',
      label: `Min layover: ${formatDuration(filters.minLayoverDuration)}`,
      icon: <Clock className="w-3 h-3" />,
    });
  }

  if (filters.maxLayoverDuration !== null) {
    chips.push({
      key: 'maxLayoverDuration',
      label: `Max layover: ${formatDuration(filters.maxLayoverDuration)}`,
      icon: <Clock className="w-3 h-3" />,
    });
  }

  // Baggage chip
  if (filters.baggageIncluded) {
    chips.push({
      key: 'baggageIncluded',
      label: 'Baggage included',
      icon: <Luggage className="w-3 h-3" />,
    });
  }

  // Refundable chip
  if (filters.refundable) {
    chips.push({
      key: 'refundable',
      label: 'Refundable',
      icon: <Luggage className="w-3 h-3" />,
    });
  }

  if (chips.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm font-medium text-gray-700">Active filters:</span>
      
      {chips.map((chip, index) => (
        <FilterChip
          key={`${chip.key}-${chip.value || index}`}
          label={chip.label}
          icon={chip.icon}
          onRemove={() => onRemoveFilter(chip.key, chip.value)}
        />
      ))}

      {chips.length > 1 && (
        <button
          onClick={onClearAll}
          className="text-xs text-blue-600 hover:text-blue-800 font-medium px-3 py-1 hover:bg-blue-50 rounded-full transition-colors"
        >
          Clear all
        </button>
      )}
    </div>
  );
}

interface FilterChipProps {
  label: string;
  icon: React.ReactNode;
  onRemove: () => void;
}

function FilterChip({ label, icon, onRemove }: FilterChipProps) {
  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-200 text-blue-700 rounded-full text-sm group hover:bg-blue-100 transition-colors">
      <div className="text-blue-600">{icon}</div>
      <span className="font-medium">{label}</span>
      <button
        onClick={onRemove}
        className="ml-1 hover:bg-blue-200 rounded-full p-0.5 transition-colors"
        aria-label={`Remove ${label} filter`}
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
}

// Helper functions
function formatTime(hour: number) {
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${displayHour}:00${period}`;
}

function formatDuration(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}
