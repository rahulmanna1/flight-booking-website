'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  GitCompare,
  X,
  Star,
  Clock,
  MapPin,
  Plane,
  Wifi,
  Coffee,
  Tv,
  Zap,
  Leaf,
  Shield,
  Heart,
  TrendingUp,
  Check,
  Minus,
  AlertCircle,
  Info
} from 'lucide-react';
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
  amenities?: string[] | {
    wifi?: boolean;
    meals?: boolean;
    entertainment?: boolean;
    powerOutlets?: boolean;
  };
  layovers?: Array<{
    airport: string;
    duration: string;
  }>;
}

interface EnhancedFlightData extends Flight {
  // Additional comparison metrics
  onTimePerformance?: number;
  customerRating?: number;
  legRoom?: number;
  seatWidth?: number;
  baggage?: {
    carry: boolean;
    checked: number;
  };
  carbonFootprint?: number;
  valueScore?: number;
  flexibilityScore?: number;
  comfortScore?: number;
}

interface FlightComparisonProps {
  flights: Flight[];
  selectedFlightIds: string[];
  onClose: () => void;
  onSelectFlight: (flightId: string) => void;
}

const COMPARISON_CATEGORIES = [
  {
    id: 'basic',
    name: 'Flight Details',
    icon: <Plane className="w-4 h-4" />,
    fields: ['airline', 'flightNumber', 'duration', 'stops', 'aircraft']
  },
  {
    id: 'pricing',
    name: 'Pricing & Value',
    icon: <TrendingUp className="w-4 h-4" />,
    fields: ['price', 'valueScore', 'baggage']
  },
  {
    id: 'comfort',
    name: 'Comfort & Amenities',
    icon: <Heart className="w-4 h-4" />,
    fields: ['seatWidth', 'legRoom', 'amenities', 'comfortScore']
  },
  {
    id: 'reliability',
    name: 'Reliability',
    icon: <Shield className="w-4 h-4" />,
    fields: ['onTimePerformance', 'customerRating', 'flexibilityScore']
  },
  {
    id: 'environmental',
    name: 'Environmental Impact',
    icon: <Leaf className="w-4 h-4" />,
    fields: ['carbonFootprint']
  }
];

// Mock function to enhance flight data with additional metrics
const enhanceFlightData = (flight: Flight): EnhancedFlightData => {
  const enhanced: EnhancedFlightData = {
    ...flight,
    onTimePerformance: Math.random() * 30 + 70, // 70-100%
    customerRating: Math.random() * 2 + 3, // 3-5 stars
    legRoom: Math.random() * 10 + 28, // 28-38 inches
    seatWidth: Math.random() * 4 + 16, // 16-20 inches
    baggage: {
      carry: Math.random() > 0.3, // 70% chance of included carry-on
      checked: Math.random() > 0.5 ? 1 : 0 // 50% chance of 1 free checked bag
    },
    carbonFootprint: Math.random() * 200 + 150, // 150-350 kg CO2
    valueScore: Math.random() * 40 + 60, // 60-100
    flexibilityScore: Math.random() * 40 + 60, // 60-100
    comfortScore: Math.random() * 40 + 60, // 60-100
    amenities: (() => {
      if (Array.isArray(flight.amenities) && flight.amenities.length > 0) {
        return flight.amenities;
      } else if (flight.amenities && typeof flight.amenities === 'object') {
        // Convert object format to array
        const amenitiesObj = flight.amenities as any;
        return [
          ...(amenitiesObj.wifi ? ['WiFi'] : []),
          ...(amenitiesObj.meals ? ['Meals'] : []),
          ...(amenitiesObj.entertainment ? ['Entertainment'] : []),
          ...(amenitiesObj.powerOutlets ? ['Power Outlets'] : [])
        ];
      } else {
        // Generate random amenities as fallback
        return ['WiFi', 'Entertainment', 'Power Outlets', 'Meals'].filter(() => Math.random() > 0.4);
      }
    })()
  };

  return enhanced;
};

export default function FlightComparison({ 
  flights, 
  selectedFlightIds, 
  onClose, 
  onSelectFlight 
}: FlightComparisonProps) {
  const { formatPrice, convertPrice } = useCurrency();
  
  const [enhancedFlights, setEnhancedFlights] = useState<EnhancedFlightData[]>([]);
  const [activeCategory, setActiveCategory] = useState('basic');
  const [highlightBest, setHighlightBest] = useState(true);
  
  // Refs for keyboard navigation
  const modalRef = useRef<HTMLDivElement>(null);
  const categoryButtonsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const selectButtonsRef = useRef<(HTMLButtonElement | null)[]>([]);
  
  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    switch (e.key) {
      case 'Escape':
        onClose();
        break;
      case 'ArrowUp':
      case 'ArrowDown':
        // Navigate between categories
        const currentCategoryIndex = COMPARISON_CATEGORIES.findIndex(cat => cat.id === activeCategory);
        const nextIndex = e.key === 'ArrowDown' 
          ? Math.min(currentCategoryIndex + 1, COMPARISON_CATEGORIES.length - 1)
          : Math.max(currentCategoryIndex - 1, 0);
        
        if (nextIndex !== currentCategoryIndex) {
          setActiveCategory(COMPARISON_CATEGORIES[nextIndex].id);
          categoryButtonsRef.current[nextIndex]?.focus();
        }
        e.preventDefault();
        break;
      case 'ArrowLeft':
      case 'ArrowRight':
        // Navigate between flight selection buttons
        const focusedElement = document.activeElement;
        const currentFlightIndex = selectButtonsRef.current.findIndex(btn => btn === focusedElement);
        
        if (currentFlightIndex !== -1) {
          const nextFlightIndex = e.key === 'ArrowRight'
            ? Math.min(currentFlightIndex + 1, enhancedFlights.length - 1)
            : Math.max(currentFlightIndex - 1, 0);
          
          selectButtonsRef.current[nextFlightIndex]?.focus();
          e.preventDefault();
        }
        break;
      case '1':
      case '2':
      case '3':
      case '4':
      case '5':
        // Quick category selection
        const categoryIndex = parseInt(e.key) - 1;
        if (categoryIndex < COMPARISON_CATEGORIES.length) {
          setActiveCategory(COMPARISON_CATEGORIES[categoryIndex].id);
          categoryButtonsRef.current[categoryIndex]?.focus();
        }
        e.preventDefault();
        break;
      default:
        break;
    }
  }, [activeCategory, enhancedFlights.length, onClose]);
  
  // Add keyboard event listeners
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  useEffect(() => {
    // Enhance flight data with additional metrics
    const enhanced = selectedFlightIds
      .map(id => flights.find(f => f.id === id))
      .filter((f): f is Flight => f !== undefined)
      .map(enhanceFlightData);
    
    setEnhancedFlights(enhanced);
  }, [flights, selectedFlightIds]);

  const getBestValue = (field: keyof EnhancedFlightData, isHigherBetter: boolean = true) => {
    if (enhancedFlights.length === 0) return null;
    
    const values = enhancedFlights
      .map(f => f[field])
      .filter(v => v !== undefined && v !== null) as number[];
    
    if (values.length === 0) return null;
    
    return isHigherBetter ? Math.max(...values) : Math.min(...values);
  };

  const renderField = (flight: EnhancedFlightData, field: string) => {
    const isBest = (value: any, isHigherBetter: boolean = true) => {
      if (!highlightBest) return false;
      const bestValue = getBestValue(field as keyof EnhancedFlightData, isHigherBetter);
      return bestValue !== null && value === bestValue;
    };

    switch (field) {
      case 'airline':
        return <span className="font-medium text-gray-900">{flight.airline}</span>;
      
      case 'flightNumber':
        return <span className="text-gray-800">{flight.flightNumber}</span>;
      
      case 'duration':
        const duration = flight.duration;
        const isBestDuration = isBest(
          parseInt(duration.split('h')[0]) * 60 + parseInt(duration.split('h')[1]?.split('m')[0] || '0'),
          false
        );
        return (
          <span className={isBestDuration ? 'text-green-600 font-semibold' : 'text-gray-800'}>
            {duration}
          </span>
        );
      
      case 'stops':
        const stops = flight.stops || 0;
        const isBestStops = isBest(stops, false);
        return (
          <span className={isBestStops ? 'text-green-600 font-semibold' : 'text-gray-800'}>
            {stops === 0 ? 'Direct' : `${stops} stop${stops > 1 ? 's' : ''}`}
          </span>
        );
      
      case 'aircraft':
        return <span className="text-gray-800">{flight.aircraft || 'N/A'}</span>;
      
      case 'price':
        const isBestPrice = isBest(flight.price, false);
        return (
          <div className={isBestPrice ? 'text-green-600 font-bold' : 'font-semibold text-gray-800'}>
            {formatPrice(convertPrice(flight.price))}
            {isBestPrice && <div className="text-xs text-green-600">Best Price!</div>}
          </div>
        );
      
      case 'valueScore':
        const valueScore = flight.valueScore || 0;
        const isBestValue = isBest(valueScore);
        return (
          <div className="flex items-center space-x-2">
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${isBestValue ? 'bg-green-500' : 'bg-blue-500'}`}
                style={{ width: `${valueScore}%` }}
              ></div>
            </div>
            <span className={`text-sm ${isBestValue ? 'text-green-600 font-semibold' : 'text-gray-800'}`}>
              {Math.round(valueScore)}/100
            </span>
          </div>
        );
      
      case 'onTimePerformance':
        const onTime = flight.onTimePerformance || 0;
        const isBestOnTime = isBest(onTime);
        return (
          <span className={isBestOnTime ? 'text-green-600 font-semibold' : 'text-gray-800'}>
            {Math.round(onTime)}%
          </span>
        );
      
      case 'customerRating':
        const rating = flight.customerRating || 0;
        const isBestRating = isBest(rating);
        return (
          <div className={`flex items-center space-x-1 ${isBestRating ? 'text-green-600' : ''}`}>
            {[1, 2, 3, 4, 5].map(star => (
              <Star
                key={star}
                className={`w-4 h-4 ${
                  star <= rating 
                    ? isBestRating ? 'fill-green-500 text-green-500' : 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            ))}
            <span className="text-sm ml-1 text-gray-800">({rating.toFixed(1)})</span>
          </div>
        );
      
      case 'seatWidth':
        const seatWidth = flight.seatWidth || 0;
        const isBestWidth = isBest(seatWidth);
        return (
          <span className={isBestWidth ? 'text-green-600 font-semibold' : 'text-gray-800'}>
            {seatWidth.toFixed(1)}"
          </span>
        );
      
      case 'legRoom':
        const legRoom = flight.legRoom || 0;
        const isBestLegRoom = isBest(legRoom);
        return (
          <span className={isBestLegRoom ? 'text-green-600 font-semibold' : 'text-gray-800'}>
            {legRoom.toFixed(0)}"
          </span>
        );
      
      case 'amenities':
        let amenitiesList: string[] = [];
        
        if (Array.isArray(flight.amenities)) {
          amenitiesList = flight.amenities;
        } else if (flight.amenities && typeof flight.amenities === 'object') {
          // Convert object format to array of strings
          const amenitiesObj = flight.amenities as {
            wifi?: boolean;
            meals?: boolean;
            entertainment?: boolean;
            powerOutlets?: boolean;
          };
          
          amenitiesList = [
            ...(amenitiesObj.wifi ? ['WiFi'] : []),
            ...(amenitiesObj.meals ? ['Meals'] : []),
            ...(amenitiesObj.entertainment ? ['Entertainment'] : []),
            ...(amenitiesObj.powerOutlets ? ['Power Outlets'] : [])
          ];
        }
        
        return (
          <div className="space-y-1">
            {amenitiesList.length > 0 ? (
              amenitiesList.map(amenity => (
                <div key={amenity} className="flex items-center space-x-1 text-sm">
                  <Check className="w-3 h-3 text-green-500" />
                  <span className="text-gray-800">{amenity}</span>
                </div>
              ))
            ) : (
              <span className="text-sm text-gray-700">No amenities listed</span>
            )}
          </div>
        );
      
      case 'baggage':
        return (
          <div className="text-sm space-y-1">
            <div className="flex items-center space-x-1">
              {flight.baggage?.carry ? (
                <Check className="w-3 h-3 text-green-500" />
              ) : (
                <X className="w-3 h-3 text-red-500" />
              )}
              <span className="text-gray-800">Carry-on</span>
            </div>
            <div className="flex items-center space-x-1">
              {flight.baggage?.checked ? (
                <Check className="w-3 h-3 text-green-500" />
              ) : (
                <Minus className="w-3 h-3 text-gray-400" />
              )}
              <span className="text-gray-800">Checked ({flight.baggage?.checked || 0})</span>
            </div>
          </div>
        );
      
      case 'carbonFootprint':
        const carbon = flight.carbonFootprint || 0;
        const isBestCarbon = isBest(carbon, false);
        return (
          <div className={isBestCarbon ? 'text-green-600 font-semibold' : 'text-gray-800'}>
            <div>{Math.round(carbon)} kg CO₂</div>
            <div className="text-xs text-gray-600">per passenger</div>
            {isBestCarbon && <div className="text-xs text-green-600">Most Eco-Friendly!</div>}
          </div>
        );
      
      case 'comfortScore':
      case 'flexibilityScore':
        const score = flight[field as keyof EnhancedFlightData] as number || 0;
        const isBestScore = isBest(score);
        return (
          <div className="flex items-center space-x-2">
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${isBestScore ? 'bg-green-500' : 'bg-blue-500'}`}
                style={{ width: `${score}%` }}
              ></div>
            </div>
            <span className={`text-sm ${isBestScore ? 'text-green-600 font-semibold' : 'text-gray-800'}`}>
              {Math.round(score)}/100
            </span>
          </div>
        );
      
      default:
        return <span className="text-gray-700">N/A</span>;
    }
  };

  const getFieldLabel = (field: string): string => {
    const labels: Record<string, string> = {
      airline: 'Airline',
      flightNumber: 'Flight Number',
      duration: 'Duration',
      stops: 'Stops',
      aircraft: 'Aircraft',
      price: 'Price',
      valueScore: 'Value Score',
      onTimePerformance: 'On-time Performance',
      customerRating: 'Customer Rating',
      seatWidth: 'Seat Width',
      legRoom: 'Legroom',
      amenities: 'Amenities',
      baggage: 'Baggage',
      carbonFootprint: 'Carbon Footprint',
      comfortScore: 'Comfort Score',
      flexibilityScore: 'Flexibility Score'
    };
    
    return labels[field] || field;
  };

  if (enhancedFlights.length === 0) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl p-4 sm:p-6 max-w-md w-full">
          <div className="flex items-center space-x-2 sm:space-x-3 mb-4">
            <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500" />
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">No Flights Selected</h2>
          </div>
          <p className="text-sm sm:text-base text-gray-600 mb-6">
            Please select at least 2 flights from the results to compare them side by side.
          </p>
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="comparison-title"
    >
      <div 
        ref={modalRef}
        className="bg-white rounded-lg shadow-2xl max-w-7xl w-full max-h-[98vh] sm:max-h-[90vh] overflow-hidden focus:outline-none"
        tabIndex={-1}
      >
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-3 sm:px-6 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <GitCompare className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              <h2 id="comparison-title" className="text-lg sm:text-2xl font-bold text-gray-900">Flight Comparison</h2>
              <span className="bg-blue-100 text-blue-800 text-xs sm:text-sm px-2 py-1 rounded">
                {enhancedFlights.length} flights
              </span>
            </div>
            
            <div className="flex items-center space-x-3 sm:space-x-4 w-full sm:w-auto">
              <label className="flex items-center space-x-2 text-xs sm:text-sm flex-1 sm:flex-initial">
                <input
                  type="checkbox"
                  checked={highlightBest}
                  onChange={(e) => setHighlightBest(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="whitespace-nowrap">Highlight best</span>
              </label>
              
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 flex-shrink-0"
                aria-label="Close comparison"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row h-full">
          {/* Category Sidebar - Mobile: Horizontal scroll, Desktop: Vertical sidebar */}
          <div className="lg:w-64 bg-gray-50 border-b lg:border-b-0 lg:border-r border-gray-200 overflow-x-auto lg:overflow-y-auto">
            <div className="p-3 sm:p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-3 hidden lg:block">Categories</h3>
              <div className="flex lg:flex-col space-x-2 lg:space-x-0 lg:space-y-1">
                {COMPARISON_CATEGORIES.map((category, index) => (
                  <button
                    key={category.id}
                    ref={(el) => { categoryButtonsRef.current[index] = el; }}
                    onClick={() => setActiveCategory(category.id)}
                    className={`whitespace-nowrap lg:w-full text-left flex items-center space-x-2 lg:space-x-3 px-3 lg:px-3 py-3 rounded-md text-xs lg:text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 touch-manipulation min-h-[44px] ${
                      activeCategory === category.id
                        ? 'bg-blue-100 text-blue-700 border-blue-200 transform scale-105'
                        : 'text-gray-600 hover:bg-gray-100 active:scale-95'
                    }`}
                    aria-pressed={activeCategory === category.id}
                    aria-label={`Show ${category.name} comparison. Press ${index + 1} for quick access.`}
                  >
                    <span className="flex-shrink-0">{category.icon}</span>
                    <span className="hidden sm:inline lg:inline">{category.name}</span>
                    <span className="sm:hidden lg:hidden text-xs">{category.name.split(' ')[0]}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Comparison Table */}
          <div className="flex-1 overflow-x-auto">
            {/* Mobile: Stack flights vertically, Desktop: Table format */}
            <div className="lg:hidden">
              {/* Mobile Flight Cards */}
              <div className="p-4">
                {enhancedFlights.map((flight, index) => (
                  <div key={flight.id} className="mb-6 bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="font-bold text-lg text-gray-900 mb-1">{flight.airline}</div>
                        <div className="text-sm text-gray-600 mb-1">{flight.flightNumber}</div>
                        <div className="text-sm font-medium text-blue-600">
                          {flight.departTime} → {flight.arriveTime}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {flight.origin} to {flight.destination}
                        </div>
                      </div>
                      <button
                        ref={(el) => { selectButtonsRef.current[index] = el; }}
                        onClick={() => onSelectFlight(flight.id)}
                        className="px-4 py-3 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 transform active:scale-95 min-w-[80px] min-h-[44px] flex items-center justify-center touch-manipulation"
                        aria-label={`Select ${flight.airline} flight ${flight.flightNumber}`}
                      >
                        Select
                      </button>
                    </div>
                    
                    {/* Mobile flight details */}
                    <div className="space-y-3">
                      {COMPARISON_CATEGORIES
                        .find(cat => cat.id === activeCategory)
                        ?.fields.map(field => (
                          <div key={field} className="flex justify-between items-start py-3 border-b border-gray-100 last:border-b-0">
                            <span className="text-sm font-semibold text-gray-700 flex-shrink-0 mr-3">
                              {getFieldLabel(field)}
                            </span>
                            <div className="text-sm text-right">
                              {renderField(flight, field)}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Desktop Table */}
            <div className="hidden lg:block min-w-full">
              {/* Flight Headers */}
              <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
                <div className="grid gap-6" style={{ gridTemplateColumns: `200px repeat(${enhancedFlights.length}, 1fr)` }}>
                  <div className="font-medium text-gray-900">Criteria</div>
                  {enhancedFlights.map((flight, index) => (
                    <div key={flight.id} className="text-center">
                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="font-semibold text-gray-900 mb-1">{flight.airline}</div>
                        <div className="text-sm text-gray-700 mb-2">{flight.flightNumber}</div>
                        <div className="text-xs text-gray-600 mb-3">
                          {flight.departTime} - {flight.arriveTime}
                        </div>
                        <button
                          ref={(el) => { selectButtonsRef.current[index] = el; }}
                          onClick={() => onSelectFlight(flight.id)}
                          className="w-full px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                          aria-label={`Select ${flight.airline} flight ${flight.flightNumber}`}
                        >
                          Select Flight
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Desktop Comparison Rows */}
              <div className="px-6 py-4 max-h-96 overflow-y-auto">
                <div className="space-y-4">
                  {COMPARISON_CATEGORIES
                    .find(cat => cat.id === activeCategory)
                    ?.fields.map(field => (
                      <div
                        key={field}
                        className="grid gap-6 items-center py-3 border-b border-gray-100"
                        style={{ gridTemplateColumns: `200px repeat(${enhancedFlights.length}, 1fr)` }}
                      >
                        <div className="font-medium text-gray-900">
                          {getFieldLabel(field)}
                        </div>
                        {enhancedFlights.map(flight => (
                          <div key={`${flight.id}-${field}`} className="px-2">
                            {renderField(flight, field)}
                          </div>
                        ))}
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer with Legend */}
        <div className="bg-gray-50 border-t border-gray-200 px-3 sm:px-6 py-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 text-xs sm:text-sm text-gray-600">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded flex-shrink-0"></div>
                <span>Best value</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="w-3 h-3 text-green-500 flex-shrink-0" />
                <span>Included</span>
              </div>
              <div className="flex items-center space-x-2">
                <X className="w-3 h-3 text-red-500 flex-shrink-0" />
                <span>Not included</span>
              </div>
            </div>
            
            <div className="text-xs text-gray-500">
              Compare up to 4 flights{highlightBest ? ' • Highlighting enabled' : ''}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}