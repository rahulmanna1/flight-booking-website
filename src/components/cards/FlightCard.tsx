'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Clock, Plane, MapPin, Calendar, Users, Info, Wifi, Utensils, Monitor, Zap, Eye } from 'lucide-react';
import { useCurrency } from '@/contexts/CurrencyContext';
import { getAircraftAmenities, getFeatureList } from '@/lib/aircraftDatabase';
import FlightDetailsModal from '../FlightDetailsModal';
import PriceAlertButton from '../price-alerts/PriceAlertButton';

// Airport name mapping for better user experience
const AIRPORT_NAMES = {
  'JFK': 'John F. Kennedy Intl',
  'LAX': 'Los Angeles Intl',
  'LHR': 'London Heathrow',
  'CDG': 'Paris Charles de Gaulle',
  'NRT': 'Tokyo Narita Intl',
  'DXB': 'Dubai Intl',
  'SYD': 'Sydney Kingsford Smith',
  'SFO': 'San Francisco Intl',
  'ORD': 'Chicago O\'Hare Intl',
  'MIA': 'Miami Intl',
  'FCO': 'Rome Fiumicino',
  'AMS': 'Amsterdam Schiphol',
  'FRA': 'Frankfurt Main',
  'MAD': 'Madrid Barajas',
  'BCN': 'Barcelona El Prat',
  'IST': 'Istanbul Airport',
  'DOH': 'Doha Hamad Intl',
  'SIN': 'Singapore Changi',
  'HKG': 'Hong Kong Intl',
  'ICN': 'Seoul Incheon Intl'
};

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
    travelClass?: string;
  };
  onSelect: (flightId: string) => void;
  searchData?: {
    from: string;
    to: string;
    departDate: string;
    returnDate?: string;
    passengers: number;
    tripType: 'roundtrip' | 'oneway';
    travelClass?: string;
  };
}

// Get airline logo/color based on airline name
const getAirlineInfo = (airline: string) => {
  if (airline.includes('Emirates')) return { color: 'bg-red-100 text-red-700', icon: '🇦🇪' };
  if (airline.includes('British Airways')) return { color: 'bg-blue-100 text-blue-700', icon: '🇬🇧' };
  if (airline.includes('Lufthansa')) return { color: 'bg-yellow-100 text-yellow-700', icon: '🇩🇪' };
  if (airline.includes('Air France')) return { color: 'bg-blue-100 text-blue-700', icon: '🇫🇷' };
  if (airline.includes('KLM')) return { color: 'bg-blue-100 text-blue-700', icon: '🇳🇱' };
  if (airline.includes('Turkish')) return { color: 'bg-red-100 text-red-700', icon: '🇹🇷' };
  if (airline.includes('Qatar')) return { color: 'bg-purple-100 text-purple-700', icon: '🇶🇦' };
  if (airline.includes('Singapore')) return { color: 'bg-blue-100 text-blue-700', icon: '🇸🇬' };
  if (airline.includes('American')) return { color: 'bg-red-100 text-red-700', icon: '🇺🇸' };
  if (airline.includes('Delta')) return { color: 'bg-blue-100 text-blue-700', icon: '🇺🇸' };
  if (airline.includes('United')) return { color: 'bg-blue-100 text-blue-700', icon: '🇺🇸' };
  if (airline.includes('WestJet')) return { color: 'bg-blue-100 text-blue-700', icon: '🇨🇦' };
  return { color: 'bg-gray-100 text-gray-700', icon: '✈️' };
};

// Get aircraft features from database
const getAircraftFeatures = (aircraftCode: string | undefined, airline: string) => {
  if (!aircraftCode) {
    return { category: 'Unknown', features: ['Basic Service'] };
  }
  
  const amenities = getAircraftAmenities(aircraftCode, airline);
  const features = getFeatureList(amenities);
  
  return {
    category: amenities.category,
    features: features,
    amenities: amenities
  };
};

// Get travel class display info
const getTravelClassInfo = (travelClass: string | undefined) => {
  switch (travelClass) {
    case 'first':
      return { label: 'First Class', icon: '👑', color: 'bg-purple-100 text-purple-700' };
    case 'business':
      return { label: 'Business', icon: '🥂', color: 'bg-indigo-100 text-indigo-700' };
    case 'premium-economy':
      return { label: 'Premium Economy', icon: '✈️', color: 'bg-blue-100 text-blue-700' };
    case 'economy':
    default:
      return { label: 'Economy', icon: '💺', color: 'bg-gray-100 text-gray-700' };
  }
};

export default function FlightCard({ flight, onSelect, searchData }: FlightCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { formatPrice } = useCurrency();
  const airlineInfo = getAirlineInfo(flight.airline);
  const aircraftInfo = getAircraftFeatures(flight.aircraft, flight.airline);
  const travelClassInfo = getTravelClassInfo(flight.travelClass);
  
  // Refs for keyboard navigation
  const cardRef = useRef<HTMLDivElement>(null);
  const viewDetailsButtonRef = useRef<HTMLButtonElement>(null);
  const selectFlightButtonRef = useRef<HTMLButtonElement>(null);
  const priceAlertButtonRef = useRef<HTMLButtonElement>(null);
  
  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'Enter':
        // Select flight when Enter is pressed on the card itself
        if (e.target === cardRef.current) {
          onSelect(flight.id);
        }
        break;
      case ' ':
        // Space bar on the card activates the select button
        if (e.target === cardRef.current) {
          e.preventDefault(); // Prevent page scrolling
          selectFlightButtonRef.current?.click();
        }
        break;
      case 'Tab':
        // Let Tab handle normal browser behavior
        break;
      case 'ArrowDown':
        // Inside the card, move focus to the select button
        if (e.target === cardRef.current) {
          e.preventDefault();
          selectFlightButtonRef.current?.focus();
        }
        break;
      default:
        break;
    }
  };
  
  const getAirportName = (code: string) => AIRPORT_NAMES[code] || code;
  
  return (
    <div 
      ref={cardRef}
      className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-xl transition-all duration-300 hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      tabIndex={0}
      role="article"
      aria-label={`Flight ${flight.flightNumber} from ${flight.origin} to ${flight.destination}, ${formatPrice(flight.price)}`}
      onKeyDown={handleKeyDown}
    >
      {/* Header - Airline and Price */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg ${airlineInfo.color}`}>
            {airlineInfo.icon}
          </div>
          <div>
            <h3 className="font-bold text-lg text-gray-900">{flight.airline}</h3>
            <p className="text-sm text-gray-500">{flight.flightNumber} • {flight.aircraft}</p>
            <div className="flex items-center space-x-2 mt-1">
              <p className="text-xs text-gray-400">{aircraftInfo.category} Aircraft</p>
              <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${travelClassInfo.color}`}>
                {travelClassInfo.icon} {travelClassInfo.label}
              </span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold text-blue-600">{formatPrice(flight.price)}</p>
          <p className="text-sm text-gray-500">per person</p>
          <div className="flex items-center justify-end mt-1">
            <Users className="w-3 h-3 text-gray-400 mr-1" />
            <span className="text-xs text-gray-400">Adult fare</span>
          </div>
        </div>
      </div>

      {/* Flight Route */}
      <div className="grid grid-cols-3 gap-6 mb-6">
        {/* Departure */}
        <div className="text-left">
          <div className="flex items-center space-x-2 mb-2">
            <MapPin className="w-4 h-4 text-green-600" />
            <span className="font-bold text-lg text-gray-900">{flight.origin}</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-1">{flight.departTime}</p>
          <p className="text-sm text-gray-600">{getAirportName(flight.origin)}</p>
          <p className="text-xs text-gray-500">Departure</p>
        </div>

        {/* Duration and Stops */}
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Clock className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-semibold text-gray-700">{flight.duration}</span>
          </div>
          
          {/* Flight path visualization */}
          <div className="flex items-center justify-center mb-2">
            <div className="w-6 h-0.5 bg-blue-200"></div>
            <Plane className="w-4 h-4 text-blue-600 mx-2 transform rotate-90" />
            <div className="w-6 h-0.5 bg-blue-200"></div>
          </div>
          
          {flight.stops !== undefined && (
            <div className="text-center">
              {flight.stops === 0 ? (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  ✓ Direct Flight
                </span>
              ) : (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                  {flight.stops} Stop{flight.stops > 1 ? 's' : ''}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Arrival */}
        <div className="text-right">
          <div className="flex items-center justify-end space-x-2 mb-2">
            <span className="font-bold text-lg text-gray-900">{flight.destination}</span>
            <MapPin className="w-4 h-4 text-red-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-1">{flight.arriveTime}</p>
          <p className="text-sm text-gray-600">{getAirportName(flight.destination)}</p>
          <p className="text-xs text-gray-500">Arrival</p>
        </div>
      </div>

      {/* Aircraft Features */}
      {aircraftInfo.features.length > 0 && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
            <Info className="w-4 h-4 mr-1" />
            Aircraft Features
          </h4>
          <div className="flex flex-wrap gap-2">
            {aircraftInfo.features.map((feature, index) => {
              let icon = null;
              let bgColor = 'bg-blue-100 text-blue-700';
              
              if (feature.includes('Wi-Fi')) {
                icon = <Wifi className="w-3 h-3 mr-1" />;
                bgColor = 'bg-green-100 text-green-700';
              } else if (feature.includes('Entertainment')) {
                icon = <Monitor className="w-3 h-3 mr-1" />;
                bgColor = 'bg-purple-100 text-purple-700';
              } else if (feature.includes('Meal')) {
                icon = <Utensils className="w-3 h-3 mr-1" />;
                bgColor = 'bg-orange-100 text-orange-700';
              } else if (feature.includes('Power')) {
                icon = <Zap className="w-3 h-3 mr-1" />;
                bgColor = 'bg-yellow-100 text-yellow-700';
              } else if (feature.includes('Legroom')) {
                bgColor = 'bg-indigo-100 text-indigo-700';
              }
              
              return (
                <span key={index} className={`inline-flex items-center px-2 py-1 rounded text-xs ${bgColor}`}>
                  {icon}
                  {feature}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Additional Info */}
      <div className="flex items-center justify-between mb-4 text-sm text-gray-600">
        <div className="flex items-center space-x-4">
          <span className="flex items-center">
            <Calendar className="w-4 h-4 mr-1" />
            Flexible dates
          </span>
          <span className="text-green-600 font-medium">
            {flight.stops === 0 ? 'Fastest option' : 'Economy friendly'}
          </span>
        </div>
        <span className="text-xs text-gray-500">Taxes & fees included</span>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        {/* Price Alert and View Details Row */}
        <div className="flex space-x-3">
          {/* Price Alert Button */}
          {searchData && (
            <div className="flex-1">
              <PriceAlertButton 
                flightData={{
                  origin: flight.origin,
                  destination: flight.destination,
                  departTime: flight.departTime,
                  price: flight.price,
                  airline: flight.airline,
                  flightNumber: flight.flightNumber,
                  travelClass: flight.travelClass
                }}
                searchData={searchData}
              />
            </div>
          )}
          
          {/* View Details Button */}
          <div className="flex-1">
            <button
              ref={viewDetailsButtonRef}
              onClick={() => setIsModalOpen(true)}
              className="w-full bg-white text-blue-600 py-2.5 px-6 rounded-lg hover:bg-blue-50 transition-all duration-200 font-medium flex items-center justify-center space-x-2 border border-blue-200 hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label={`View details for flight ${flight.flightNumber}`}
            >
              <Eye className="w-4 h-4" />
              <span>View Details</span>
            </button>
          </div>
        </div>
        
        {/* Select Button */}
        <button
          ref={selectFlightButtonRef}
          onClick={() => onSelect(flight.id)}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-6 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-semibold flex items-center justify-center space-x-2 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          aria-label={`Select flight ${flight.flightNumber} for ${formatPrice(flight.price)}`}
        >
          <span>Select This Flight</span>
          <Plane className="w-4 h-4" />
        </button>
      </div>
      
      {/* Flight Details Modal */}
      <FlightDetailsModal
        flight={flight}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
