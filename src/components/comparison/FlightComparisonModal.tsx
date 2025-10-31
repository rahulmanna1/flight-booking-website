'use client';

import React from 'react';
import {
  X,
  Plane,
  Clock,
  DollarSign,
  MapPin,
  Check,
  Wifi,
  Coffee,
  Tv,
  Luggage,
  Share2,
  Download,
  AlertCircle,
} from 'lucide-react';

export interface FlightForComparison {
  id: string;
  airline: string;
  flightNumber: string;
  logo?: string;
  price: number;
  currency: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  stops: number;
  stopDetails?: string[];
  cabinClass: string;
  availableSeats?: number;
  baggage: {
    carryOn: string;
    checked: string;
  };
  amenities: {
    wifi: boolean;
    meals: boolean;
    entertainment: boolean;
    powerOutlets: boolean;
  };
  cancellationPolicy: string;
  layoverDuration?: string;
}

interface FlightComparisonModalProps {
  flights: FlightForComparison[];
  onClose: () => void;
  onRemoveFlight: (flightId: string) => void;
  onSelectFlight?: (flight: FlightForComparison) => void;
}

export default function FlightComparisonModal({
  flights,
  onClose,
  onRemoveFlight,
  onSelectFlight,
}: FlightComparisonModalProps) {
  const handleExport = () => {
    const comparisonData = flights.map((flight) => ({
      Airline: flight.airline,
      'Flight Number': flight.flightNumber,
      Route: `${flight.origin} → ${flight.destination}`,
      Price: `${flight.currency} ${flight.price}`,
      Duration: flight.duration,
      Stops: flight.stops,
      'Cabin Class': flight.cabinClass,
      'Carry-on': flight.baggage.carryOn,
      'Checked Baggage': flight.baggage.checked,
      WiFi: flight.amenities.wifi ? 'Yes' : 'No',
      Meals: flight.amenities.meals ? 'Yes' : 'No',
      Entertainment: flight.amenities.entertainment ? 'Yes' : 'No',
    }));

    const csv = [
      Object.keys(comparisonData[0]).join(','),
      ...comparisonData.map((row) => Object.values(row).join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'flight-comparison.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleShare = async () => {
    const shareText = flights
      .map(
        (f) =>
          `${f.airline} ${f.flightNumber}: ${f.origin}→${f.destination} - ${f.currency}${f.price}`
      )
      .join('\n');

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Flight Comparison',
          text: shareText,
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      navigator.clipboard.writeText(shareText);
      alert('Comparison copied to clipboard!');
    }
  };

  if (flights.length === 0) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-indigo-700">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Plane className="w-6 h-6" />
              Compare Flights
            </h2>
            <p className="text-blue-100 text-sm mt-1">
              Comparing {flights.length} {flights.length === 1 ? 'flight' : 'flights'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
              title="Share comparison"
            >
              <Share2 className="w-5 h-5 text-white" />
            </button>
            <button
              onClick={handleExport}
              className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
              title="Export as CSV"
            >
              <Download className="w-5 h-5 text-white" />
            </button>
            <button
              onClick={onClose}
              className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="flex-1 overflow-auto">
          <div className="min-w-max">
            {/* Flight Cards Row */}
            <div className="grid gap-4 p-6" style={{ gridTemplateColumns: `repeat(${flights.length}, minmax(300px, 1fr))` }}>
              {flights.map((flight) => (
                <div key={flight.id} className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden">
                  {/* Flight Header */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 border-b border-gray-200">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-bold text-lg text-gray-900">{flight.airline}</h3>
                        <p className="text-sm text-gray-600">{flight.flightNumber}</p>
                      </div>
                      <button
                        onClick={() => onRemoveFlight(flight.id)}
                        className="text-gray-400 hover:text-red-600 transition-colors"
                        title="Remove from comparison"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="text-3xl font-bold text-blue-600">
                      {flight.currency}{flight.price}
                    </div>
                  </div>

                  {/* Flight Details */}
                  <div className="p-4 space-y-4">
                    {/* Route */}
                    <ComparisonRow
                      icon={<MapPin className="w-4 h-4" />}
                      label="Route"
                      value={`${flight.origin} → ${flight.destination}`}
                    />

                    {/* Times */}
                    <ComparisonRow
                      icon={<Clock className="w-4 h-4" />}
                      label="Departure"
                      value={flight.departureTime}
                    />
                    <ComparisonRow
                      icon={<Clock className="w-4 h-4" />}
                      label="Arrival"
                      value={flight.arrivalTime}
                    />

                    {/* Duration */}
                    <ComparisonRow
                      icon={<Clock className="w-4 h-4" />}
                      label="Duration"
                      value={flight.duration}
                    />

                    {/* Stops */}
                    <ComparisonRow
                      icon={<MapPin className="w-4 h-4" />}
                      label="Stops"
                      value={
                        flight.stops === 0
                          ? 'Non-stop'
                          : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}`
                      }
                    />

                    {flight.layoverDuration && (
                      <ComparisonRow
                        icon={<Clock className="w-4 h-4" />}
                        label="Layover"
                        value={flight.layoverDuration}
                      />
                    )}

                    {/* Cabin Class */}
                    <ComparisonRow
                      icon={<Plane className="w-4 h-4" />}
                      label="Class"
                      value={flight.cabinClass}
                    />

                    {/* Baggage */}
                    <div className="pt-3 border-t border-gray-200">
                      <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                        Baggage
                      </h4>
                      <ComparisonRow
                        icon={<Luggage className="w-4 h-4" />}
                        label="Carry-on"
                        value={flight.baggage.carryOn}
                        compact
                      />
                      <ComparisonRow
                        icon={<Luggage className="w-4 h-4" />}
                        label="Checked"
                        value={flight.baggage.checked}
                        compact
                      />
                    </div>

                    {/* Amenities */}
                    <div className="pt-3 border-t border-gray-200">
                      <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                        Amenities
                      </h4>
                      <div className="space-y-1">
                        <AmenityRow icon={<Wifi className="w-4 h-4" />} label="WiFi" available={flight.amenities.wifi} />
                        <AmenityRow icon={<Coffee className="w-4 h-4" />} label="Meals" available={flight.amenities.meals} />
                        <AmenityRow icon={<Tv className="w-4 h-4" />} label="Entertainment" available={flight.amenities.entertainment} />
                        <AmenityRow icon={<Plane className="w-4 h-4" />} label="Power" available={flight.amenities.powerOutlets} />
                      </div>
                    </div>

                    {/* Cancellation Policy */}
                    <div className="pt-3 border-t border-gray-200">
                      <ComparisonRow
                        icon={<AlertCircle className="w-4 h-4" />}
                        label="Cancellation"
                        value={flight.cancellationPolicy}
                      />
                    </div>

                    {/* Select Button */}
                    {onSelectFlight && (
                      <button
                        onClick={() => onSelectFlight(flight)}
                        className="w-full mt-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                      >
                        Select This Flight
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ComparisonRowProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  compact?: boolean;
}

function ComparisonRow({ icon, label, value, compact }: ComparisonRowProps) {
  return (
    <div className={`flex items-start gap-2 ${compact ? 'text-xs' : 'text-sm'}`}>
      <div className="text-gray-400 mt-0.5">{icon}</div>
      <div className="flex-1">
        <div className="text-gray-600 font-medium">{label}</div>
        <div className="text-gray-900 font-semibold">{value}</div>
      </div>
    </div>
  );
}

interface AmenityRowProps {
  icon: React.ReactNode;
  label: string;
  available: boolean;
}

function AmenityRow({ icon, label, available }: AmenityRowProps) {
  return (
    <div className="flex items-center justify-between text-sm">
      <div className="flex items-center gap-2">
        <div className={available ? 'text-green-600' : 'text-gray-300'}>{icon}</div>
        <span className={available ? 'text-gray-700' : 'text-gray-400'}>{label}</span>
      </div>
      {available ? (
        <Check className="w-4 h-4 text-green-600" />
      ) : (
        <X className="w-4 h-4 text-gray-300" />
      )}
    </div>
  );
}
