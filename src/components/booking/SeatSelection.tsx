'use client';

import React, { useState } from 'react';
import { X, Plane, Users, Info } from 'lucide-react';

interface Seat {
  id: string;
  row: number;
  letter: string;
  type: 'economy' | 'premium-economy' | 'business' | 'first';
  status: 'available' | 'occupied' | 'selected' | 'blocked';
  price: number; // Additional price for seat selection
}

interface SeatSelectionProps {
  flight: {
    id: string;
    airline: string;
    flightNumber: string;
    aircraft: string;
    origin: string;
    destination: string;
    departTime: string;
    duration: string;
  };
  passengers: number;
  onSeatSelect: (seats: Seat[]) => void;
  onClose: () => void;
}

// Mock aircraft seat configuration (Boeing 737-800 layout)
const generateSeatMap = (): Seat[][] => {
  const rows: Seat[][] = [];
  
  // Business class rows (1-3)
  for (let row = 1; row <= 3; row++) {
    const seatRow: Seat[] = [];
    ['A', 'B', 'C', 'D'].forEach(letter => {
      seatRow.push({
        id: `${row}${letter}`,
        row,
        letter,
        type: 'business',
        status: Math.random() > 0.7 ? 'occupied' : 'available',
        price: 75
      });
    });
    rows.push(seatRow);
  }
  
  // Premium Economy rows (7-9)
  for (let row = 7; row <= 9; row++) {
    const seatRow: Seat[] = [];
    ['A', 'B', 'C', 'D', 'E', 'F'].forEach(letter => {
      seatRow.push({
        id: `${row}${letter}`,
        row,
        letter,
        type: 'premium-economy',
        status: Math.random() > 0.6 ? 'occupied' : 'available',
        price: 35
      });
    });
    rows.push(seatRow);
  }
  
  // Economy rows (10-30)
  for (let row = 10; row <= 30; row++) {
    const seatRow: Seat[] = [];
    ['A', 'B', 'C', 'D', 'E', 'F'].forEach(letter => {
      // Exit rows have blocked middle seats
      if ([14, 15].includes(row) && ['C', 'D'].includes(letter)) {
        seatRow.push({
          id: `${row}${letter}`,
          row,
          letter,
          type: 'economy',
          status: 'blocked',
          price: 0
        });
      } else {
        seatRow.push({
          id: `${row}${letter}`,
          row,
          letter,
          type: 'economy',
          status: Math.random() > 0.5 ? 'occupied' : 'available',
          price: row <= 12 || row >= 28 ? 15 : 0 // Preferred seats cost extra
        });
      }
    });
    rows.push(seatRow);
  }
  
  return rows;
};

export default function SeatSelection({ flight, passengers, onSeatSelect, onClose }: SeatSelectionProps) {
  const [seatMap] = useState<Seat[][]>(generateSeatMap());
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);

  const handleSeatClick = (seat: Seat) => {
    if (seat.status === 'occupied' || seat.status === 'blocked') return;

    const isSelected = selectedSeats.find(s => s.id === seat.id);
    
    if (isSelected) {
      // Deselect seat
      const updatedSeats = selectedSeats.filter(s => s.id !== seat.id);
      setSelectedSeats(updatedSeats);
      
      // Update seat map
      seat.status = 'available';
    } else if (selectedSeats.length < passengers) {
      // Select seat
      const updatedSeats = [...selectedSeats, seat];
      setSelectedSeats(updatedSeats);
      
      // Update seat map
      seat.status = 'selected';
    }
  };

  const getSeatClass = (seat: Seat) => {
    const baseClass = 'w-8 h-8 m-0.5 rounded-md border-2 cursor-pointer transition-all duration-200 flex items-center justify-center text-xs font-semibold';
    
    switch (seat.status) {
      case 'available':
        switch (seat.type) {
          case 'business':
            return `${baseClass} bg-purple-100 border-purple-300 text-purple-700 hover:bg-purple-200`;
          case 'premium-economy':
            return `${baseClass} bg-blue-100 border-blue-300 text-blue-700 hover:bg-blue-200`;
          case 'economy':
            return `${baseClass} bg-green-100 border-green-300 text-green-700 hover:bg-green-200`;
          default:
            return `${baseClass} bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200`;
        }
      case 'selected':
        return `${baseClass} bg-orange-500 border-orange-600 text-white`;
      case 'occupied':
        return `${baseClass} bg-red-200 border-red-300 text-red-700 cursor-not-allowed`;
      case 'blocked':
        return `${baseClass} bg-gray-300 border-gray-400 text-gray-500 cursor-not-allowed`;
      default:
        return baseClass;
    }
  };

  const getTotalPrice = () => {
    return selectedSeats.reduce((total, seat) => total + seat.price, 0);
  };

  const handleConfirmSelection = () => {
    onSeatSelect(selectedSeats);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Select Your Seats</h2>
              <p className="text-blue-100 mt-1">
                {flight.airline} {flight.flightNumber} • {flight.origin} → {flight.destination}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-blue-600 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-wrap gap-6 items-center justify-center">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-100 border-2 border-green-300 rounded"></div>
              <span className="text-sm">Available (Economy)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-blue-100 border-2 border-blue-300 rounded"></div>
              <span className="text-sm">Premium Economy</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-purple-100 border-2 border-purple-300 rounded"></div>
              <span className="text-sm">Business Class</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-orange-500 border-2 border-orange-600 rounded"></div>
              <span className="text-sm">Selected</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-red-200 border-2 border-red-300 rounded"></div>
              <span className="text-sm">Occupied</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-gray-300 border-2 border-gray-400 rounded"></div>
              <span className="text-sm">Blocked</span>
            </div>
          </div>
        </div>

        {/* Seat Map */}
        <div className="p-6 overflow-y-auto max-h-[50vh]">
          <div className="max-w-md mx-auto">
            {/* Aircraft nose indicator */}
            <div className="flex justify-center mb-4">
              <div className="flex items-center space-x-2 text-gray-600">
                <Plane className="w-5 h-5" />
                <span className="text-sm font-medium">Front of Aircraft</span>
              </div>
            </div>

            {/* Seat rows */}
            <div className="space-y-1">
              {seatMap.map((row, rowIndex) => (
                <div key={rowIndex} className="flex items-center justify-center">
                  <div className="w-8 text-center text-xs text-gray-500 font-medium">
                    {row[0].row}
                  </div>
                  <div className="flex">
                    {row.map((seat, seatIndex) => {
                      // Add aisle space
                      const needsAisle = seat.type === 'business' 
                        ? seatIndex === 1 
                        : seatIndex === 2;
                      
                      return (
                        <React.Fragment key={seat.id}>
                          <button
                            onClick={() => handleSeatClick(seat)}
                            className={getSeatClass(seat)}
                            disabled={seat.status === 'occupied' || seat.status === 'blocked'}
                            title={`${seat.id} - ${seat.type} ${seat.price > 0 ? `(+$${seat.price})` : ''}`}
                          >
                            {seat.letter}
                          </button>
                          {needsAisle && <div className="w-4"></div>}
                        </React.Fragment>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Aircraft tail indicator */}
            <div className="flex justify-center mt-4">
              <span className="text-sm text-gray-600">Rear of Aircraft</span>
            </div>
          </div>
        </div>

        {/* Selection Summary */}
        <div className="p-6 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-gray-900">Selected Seats</h3>
              <p className="text-sm text-gray-600">
                {selectedSeats.length} of {passengers} passengers seated
              </p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-gray-900">
                +${getTotalPrice()}
              </p>
              <p className="text-sm text-gray-600">Total seat fees</p>
            </div>
          </div>

          {/* Selected seats list */}
          {selectedSeats.length > 0 && (
            <div className="mb-4">
              <div className="flex flex-wrap gap-2">
                {selectedSeats.map(seat => (
                  <span
                    key={seat.id}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-orange-100 text-orange-800"
                  >
                    {seat.id}
                    {seat.price > 0 && <span className="ml-1">(+${seat.price})</span>}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Info message */}
          <div className="flex items-start space-x-2 mb-4 p-3 bg-blue-50 rounded-lg">
            <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p><strong>Tip:</strong> Window seats (A, F) and aisle seats (C, D) may have additional fees. Seats near emergency exits have extra legroom but restrictions may apply.</p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition-colors"
            >
              Skip Seat Selection
            </button>
            <button
              onClick={handleConfirmSelection}
              disabled={selectedSeats.length === 0}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Continue with Selected Seats
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}