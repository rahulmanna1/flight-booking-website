'use client';

import { Clock, Plane, MapPin } from 'lucide-react';

interface FlightCardProps {
  flight: {
    id: string;
    airline: string;
    flightNumber: string;
    origin: string;
    destination: string;
    departTime: string;
    arriveTime: string;
    duration: string;
    price: number;
    stops?: number;
    aircraft?: string;
  };
  onSelect: (flightId: string) => void;
}

export default function FlightCard({ flight, onSelect }: FlightCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <Plane className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{flight.airline}</h3>
            <p className="text-sm text-gray-500">{flight.flightNumber}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-gray-900">${flight.price}</p>
          <p className="text-sm text-gray-500">per person</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-1 mb-1">
            <MapPin className="w-4 h-4 text-gray-400" />
            <span className="font-semibold text-gray-900">{flight.origin}</span>
          </div>
          <p className="text-lg font-bold text-gray-900">{flight.departTime}</p>
          <p className="text-sm text-gray-500">Departure</p>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-1">
            <Clock className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600">{flight.duration}</span>
          </div>
          <div className="flex items-center justify-center">
            <div className="w-8 h-0.5 bg-gray-300"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full mx-1"></div>
            <div className="w-8 h-0.5 bg-gray-300"></div>
          </div>
          {flight.stops !== undefined && (
            <p className="text-xs text-gray-500 mt-1">
              {flight.stops === 0 ? 'Direct' : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}`}
            </p>
          )}
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center space-x-1 mb-1">
            <MapPin className="w-4 h-4 text-gray-400" />
            <span className="font-semibold text-gray-900">{flight.destination}</span>
          </div>
          <p className="text-lg font-bold text-gray-900">{flight.arriveTime}</p>
          <p className="text-sm text-gray-500">Arrival</p>
        </div>
      </div>

      {flight.aircraft && (
        <div className="mb-4">
          <p className="text-sm text-gray-500">Aircraft: {flight.aircraft}</p>
        </div>
      )}

      <button
        onClick={() => onSelect(flight.id)}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
      >
        Select Flight
      </button>
    </div>
  );
}