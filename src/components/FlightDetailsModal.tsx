'use client';

import { X, Plane, Clock, MapPin, Wifi, Coffee, Tv, Luggage, CreditCard, Info, Users, Calendar, Shield } from 'lucide-react';
import { useCurrency } from '@/contexts/CurrencyContext';

interface Flight {
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
  travelClass?: string;
}

interface FlightDetailsModalProps {
  flight: Flight | null;
  isOpen: boolean;
  onClose: () => void;
  onBookNow: (flight: Flight) => void;
  passengers: number;
}

// Mock airline logos (in production, you'd have actual logo URLs)
const getAirlineLogo = (airlineCode: string) => {
  const logos: { [key: string]: string } = {
    'AA': '🇺🇸', 'DL': '🔺', 'UA': '🌐', 'BA': '🇬🇧', 'AF': '🇫🇷', 'LH': '🇩🇪', 
    'TK': '🇹🇷', 'EK': '🇦🇪', 'QR': '🇶🇦', 'SQ': '🇸🇬', 'NH': '🇯🇵', 'VS': '✈️'
  };
  
  // Extract airline code from flight number
  const code = airlineCode.split(' ')[0];
  return logos[code] || '✈️';
};

// Get aircraft information
const getAircraftInfo = (aircraftCode?: string) => {
  const aircraftData: { [key: string]: { name: string, seats: string, features: string[] } } = {
    '321': { name: 'Airbus A321', seats: '185-220', features: ['Wi-Fi', 'Entertainment', 'Power Outlets'] },
    '737': { name: 'Boeing 737', seats: '138-189', features: ['Wi-Fi', 'Snacks', 'Entertainment'] },
    '777': { name: 'Boeing 777', seats: '300-400', features: ['Wi-Fi', 'Meals', 'Entertainment', 'Lie-flat Seats'] },
    '380': { name: 'Airbus A380', seats: '500-850', features: ['Wi-Fi', 'Premium Meals', 'Shower Suites', 'Bar'] },
    'A320': { name: 'Airbus A320', seats: '150-180', features: ['Wi-Fi', 'Refreshments', 'Entertainment'] },
    'B787': { name: 'Boeing 787 Dreamliner', seats: '242-335', features: ['Wi-Fi', 'Premium Meals', 'Mood Lighting'] }
  };
  
  const key = aircraftCode?.replace(/[^A-Z0-9]/g, '') || '';
  return aircraftData[key] || { name: aircraftCode || 'Aircraft', seats: 'Varies', features: ['Standard Service'] };
};

export default function FlightDetailsModal({ flight, isOpen, onClose, onBookNow, passengers }: FlightDetailsModalProps) {
  const { formatPrice, convertPrice } = useCurrency();
  
  if (!isOpen || !flight) return null;

  const aircraftInfo = getAircraftInfo(flight.aircraft);
  const totalPrice = convertPrice(flight.price * passengers);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-2xl">
                {getAirlineLogo(flight.airline)}
              </div>
              <div>
                <h2 className="text-2xl font-bold">{flight.airline}</h2>
                <p className="text-blue-100">Flight {flight.flightNumber}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors duration-200"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Flight Route */}
          <div className="mt-6 bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">{flight.origin}</div>
                <div className="text-sm text-blue-600 font-bold mt-1 bg-blue-50 rounded px-3 py-1 inline-block">{flight.departTime}</div>
              </div>
              
              <div className="flex-1 mx-6 relative flex flex-col items-center">
                <div className="w-full relative mb-2">
                  <div className="h-1 bg-blue-200 rounded-full"></div>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-blue-500 rounded-full p-3 shadow-lg">
                    <Plane className="w-5 h-5 text-white transform rotate-90" />
                  </div>
                </div>
                <div className="bg-blue-500 rounded-lg px-4 py-2">
                  <div className="text-sm text-white font-bold">{flight.duration}</div>
                </div>
                {flight.stops !== undefined && (
                  <div className="mt-2 bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                    {flight.stops === 0 ? 'Non-stop' : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}`}
                  </div>
                )}
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">{flight.destination}</div>
                <div className="text-sm text-blue-600 font-bold mt-1 bg-blue-50 rounded px-3 py-1 inline-block">{flight.arriveTime}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Flight Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Aircraft Information */}
            <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Plane className="w-5 h-5 mr-2 text-blue-500" />
                Aircraft Details
              </h3>
            <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-900 font-semibold">Aircraft:</span>
                  <span className="font-bold text-gray-900">{aircraftInfo.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-900 font-semibold">Typical Seats:</span>
                  <span className="font-bold text-gray-900">{aircraftInfo.seats}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-900 font-semibold">Travel Class:</span>
                  <span className="font-bold text-gray-900 capitalize">{flight.travelClass || 'Economy'}</span>
                </div>
              </div>
            </div>

            {/* Flight Times */}
            <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Clock className="w-5 h-5 mr-2 text-green-600" />
                Schedule
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-900 font-semibold">Departure:</span>
                  <span className="font-bold text-gray-900">{flight.departTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-900 font-semibold">Arrival:</span>
                  <span className="font-bold text-gray-900">{flight.arriveTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-900 font-semibold">Duration:</span>
                  <span className="font-bold text-gray-900">{flight.duration}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Amenities */}
          <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Wifi className="w-5 h-5 mr-2 text-blue-500" />
              In-Flight Amenities
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {aircraftInfo.features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-2">
                  {feature === 'Wi-Fi' && <Wifi className="w-4 h-4 text-blue-500" />}
                  {feature.includes('Meal') && <Coffee className="w-4 h-4 text-orange-600" />}
                  {feature === 'Entertainment' && <Tv className="w-4 h-4 text-purple-600" />}
                  {!['Wi-Fi', 'Entertainment'].includes(feature) && !feature.includes('Meal') && 
                   <Shield className="w-4 h-4 text-green-600" />}
                  <span className="text-sm font-medium text-gray-900">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Baggage Policy */}
          <div className="bg-white border-2 border-gray-300 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Luggage className="w-5 h-5 mr-2 text-purple-600" />
              Baggage Policy
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-bold text-gray-900 mb-2">Carry-on Baggage</h4>
                <ul className="text-sm font-medium text-gray-900 space-y-1">
                  <li>• 1 personal item (free)</li>
                  <li>• 1 carry-on bag: 22" x 14" x 9"</li>
                  <li>• Maximum weight: 15 lbs (7 kg)</li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-gray-900 mb-2">Checked Baggage</h4>
                <ul className="text-sm font-medium text-gray-900 space-y-1">
                  <li>• 1st bag: $30 (up to 50 lbs)</li>
                  <li>• 2nd bag: $40 (up to 50 lbs)</li>
                  <li>• Overweight: $100-200</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Fare Details */}
          <div className="bg-white border-2 border-gray-300 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <CreditCard className="w-5 h-5 mr-2 text-green-600" />
              Fare Breakdown
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-900 font-semibold">Base Fare (×{passengers})</span>
                <span className="font-bold text-gray-900">{formatPrice(flight.price * passengers)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-900 font-semibold">Taxes & Fees</span>
                <span className="font-bold text-gray-900">{formatPrice(Math.round(flight.price * 0.15) * passengers)}</span>
              </div>
              <div className="border-t pt-3 flex justify-between text-lg font-bold">
                <span className="text-gray-900">Total</span>
                <span className="text-blue-600">{formatPrice(totalPrice)}</span>
              </div>
            </div>
          </div>

          {/* Important Information */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Info className="w-5 h-5 mr-2 text-yellow-600" />
              Important Information
            </h3>
            <ul className="text-sm font-medium text-gray-900 space-y-2">
              <li className="flex items-start space-x-2">
                <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>Check-in opens 24 hours before departure</span>
              </li>
              <li className="flex items-start space-x-2">
                <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>Arrive at airport 2 hours early for domestic, 3 hours for international</span>
              </li>
              <li className="flex items-start space-x-2">
                <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>Ticket is non-refundable but can be changed for a fee</span>
              </li>
              <li className="flex items-start space-x-2">
                <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>Valid ID required for all passengers</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 rounded-b-2xl border-t">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <Users className="w-4 h-4" />
                <span>{passengers} passenger{passengers > 1 ? 's' : ''}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>{flight.travelClass || 'Economy'}</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-500">{formatPrice(totalPrice)}</div>
                <div className="text-sm text-gray-500">Total for {passengers} passenger{passengers > 1 ? 's' : ''}</div>
            </div>
            <button
                onClick={() => {
                  onBookNow(flight);
                  onClose();
                }}
                className="bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold transition-colors duration-200 shadow-lg"
              >
                Book Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}