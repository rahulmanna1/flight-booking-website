'use client';

import { useState, useEffect } from 'react';
import { 
  Calendar,
  ChevronLeft,
  ChevronRight,
  TrendingDown,
  TrendingUp,
  DollarSign,
  Plane,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  Info
} from 'lucide-react';
import { useCurrency } from '@/contexts/CurrencyContext';

interface FlexibleDateSearchProps {
  origin: string;
  destination: string;
  initialDepartDate: string;
  initialReturnDate?: string;
  tripType: 'oneway' | 'roundtrip';
  passengers: number;
  travelClass: string;
  onDateSelect: (departDate: string, returnDate?: string) => void;
  onClose: () => void;
}

interface PriceData {
  date: string;
  price: number;
  availability: 'high' | 'medium' | 'low' | 'none';
  deals?: string[];
}

interface DateGridData {
  departure: PriceData[];
  return?: PriceData[];
}

// Mock function - in real implementation, this would call the flight API
const generateMockPriceData = (
  baseDate: string, 
  daysRange: number, 
  basePrice: number
): PriceData[] => {
  const data: PriceData[] = [];
  const startDate = new Date(baseDate);
  startDate.setDate(startDate.getDate() - Math.floor(daysRange / 2));

  for (let i = 0; i < daysRange; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);
    
    // Simulate price variations
    const dayOfWeek = currentDate.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const isHoliday = Math.random() < 0.1; // 10% chance of holiday pricing
    
    let priceMultiplier = 1;
    if (isWeekend) priceMultiplier += 0.2;
    if (isHoliday) priceMultiplier += 0.4;
    
    // Add some randomness
    priceMultiplier += (Math.random() - 0.5) * 0.3;
    
    const price = Math.round(basePrice * priceMultiplier);
    
    // Determine availability based on price
    let availability: PriceData['availability'] = 'high';
    if (price > basePrice * 1.3) availability = 'low';
    else if (price > basePrice * 1.1) availability = 'medium';
    
    // Add deals occasionally
    const deals: string[] = [];
    if (Math.random() < 0.15) deals.push('Early Bird');
    if (Math.random() < 0.1) deals.push('Flash Sale');
    if (price < basePrice * 0.8) deals.push('Best Deal');
    
    data.push({
      date: currentDate.toISOString().split('T')[0],
      price,
      availability,
      deals: deals.length > 0 ? deals : undefined
    });
  }
  
  return data;
};

export default function FlexibleDateSearch({
  origin,
  destination,
  initialDepartDate,
  initialReturnDate,
  tripType,
  passengers,
  travelClass,
  onDateSelect,
  onClose
}: FlexibleDateSearchProps) {
  const { formatPrice, convertPrice } = useCurrency();
  
  const [selectedDepartDate, setSelectedDepartDate] = useState(initialDepartDate);
  const [selectedReturnDate, setSelectedReturnDate] = useState(initialReturnDate);
  const [priceData, setPriceData] = useState<DateGridData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date(initialDepartDate));
  const [viewMode, setViewMode] = useState<'grid' | 'chart'>('grid');

  // Simulate loading price data
  useEffect(() => {
    setLoading(true);
    
    // Simulate API delay
    const timer = setTimeout(() => {
      const basePrice = 300 + Math.random() * 200; // $300-500 base price
      
      const departureData = generateMockPriceData(initialDepartDate, 42, basePrice); // 6 weeks
      let returnData: PriceData[] | undefined;
      
      if (tripType === 'roundtrip' && initialReturnDate) {
        returnData = generateMockPriceData(initialReturnDate, 42, basePrice * 0.9);
      }
      
      setPriceData({
        departure: departureData,
        return: returnData
      });
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [initialDepartDate, initialReturnDate, tripType]);

  const handleDateClick = (date: string, type: 'departure' | 'return') => {
    if (type === 'departure') {
      setSelectedDepartDate(date);
      
      // If return date is before new departure date, clear it
      if (selectedReturnDate && new Date(selectedReturnDate) <= new Date(date)) {
        setSelectedReturnDate('');
      }
    } else {
      setSelectedReturnDate(date);
    }
  };

  const handleConfirmDates = () => {
    onDateSelect(selectedDepartDate, tripType === 'roundtrip' ? selectedReturnDate : undefined);
  };

  const getDayData = (date: string, type: 'departure' | 'return'): PriceData | null => {
    const data = type === 'departure' ? priceData?.departure : priceData?.return;
    return data?.find(d => d.date === date) || null;
  };

  const formatDateForDisplay = (dateStr: string) => {
    const date = new Date(dateStr);
    return {
      day: date.getDate(),
      weekday: date.toLocaleDateString('en-US', { weekday: 'short' }),
      month: date.toLocaleDateString('en-US', { month: 'short' })
    };
  };

  const getPriceRangeInfo = () => {
    if (!priceData?.departure) return null;
    
    const prices = priceData.departure.map(d => d.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
    
    return { minPrice, maxPrice, avgPrice };
  };

  const getBestDealDates = () => {
    if (!priceData?.departure) return [];
    
    return priceData.departure
      .filter(d => d.deals?.includes('Best Deal'))
      .slice(0, 3)
      .sort((a, b) => a.price - b.price);
  };

  const renderCalendarGrid = (type: 'departure' | 'return') => {
    const today = new Date();
    const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    const startDate = new Date(monthStart);
    startDate.setDate(startDate.getDate() - monthStart.getDay());
    
    const days = [];
    const endDate = new Date(monthEnd);
    endDate.setDate(endDate.getDate() + (6 - monthEnd.getDay()));
    
    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
      const dateStr = date.toISOString().split('T')[0];
      const dayData = getDayData(dateStr, type);
      const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
      const isToday = date.toDateString() === today.toDateString();
      const isSelected = dateStr === (type === 'departure' ? selectedDepartDate : selectedReturnDate);
      const isPast = date < today;
      const isValidReturnDate = type === 'return' && selectedDepartDate && date > new Date(selectedDepartDate);
      const canSelect = !isPast && (type === 'departure' || isValidReturnDate);
      
      days.push(
        <button
          key={dateStr}
          onClick={() => canSelect && handleDateClick(dateStr, type)}
          disabled={!canSelect}
          className={`
            relative p-2 min-h-[60px] border border-gray-200 text-sm transition-all
            ${!isCurrentMonth ? 'text-gray-300 bg-gray-50' : ''}
            ${isPast ? 'text-gray-300 bg-gray-100 cursor-not-allowed' : ''}
            ${isToday ? 'ring-2 ring-blue-400' : ''}
            ${isSelected ? 'bg-blue-100 border-blue-300 text-blue-900' : ''}
            ${canSelect ? 'hover:bg-blue-50 hover:border-blue-200' : ''}
            ${!canSelect && !isPast && type === 'return' ? 'bg-red-50 cursor-not-allowed' : ''}
          `}
        >
          <div className="font-medium">{date.getDate()}</div>
          
          {dayData && canSelect && (
            <>
              <div className={`text-xs mt-1 ${
                dayData.price <= (getPriceRangeInfo()?.minPrice ?? 0) * 1.1 ? 'text-green-600' :
                dayData.price >= (getPriceRangeInfo()?.avgPrice ?? 0) * 1.2 ? 'text-red-600' :
                'text-gray-600'
              }`}>
                {formatPrice(convertPrice(dayData.price))}
              </div>
              
              {dayData.deals && dayData.deals.length > 0 && (
                <div className="absolute top-0 right-0 w-2 h-2 bg-green-500 rounded-full"></div>
              )}
              
              <div className={`absolute bottom-0 left-0 w-full h-1 ${
                dayData.availability === 'high' ? 'bg-green-400' :
                dayData.availability === 'medium' ? 'bg-yellow-400' :
                dayData.availability === 'low' ? 'bg-red-400' :
                'bg-gray-400'
              }`}></div>
            </>
          )}
        </button>
      );
    }
    
    return days;
  };

  const priceRangeInfo = getPriceRangeInfo();
  const bestDeals = getBestDealDates();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Calendar className="w-6 h-6 text-blue-600" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Flexible Dates</h2>
                <p className="text-sm text-gray-600">
                  {origin} → {destination} • {passengers} {passengers === 1 ? 'passenger' : 'passengers'} • {travelClass}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 text-sm">
                <span className="w-3 h-3 bg-green-400 rounded"></span>
                <span>High availability</span>
                <span className="w-3 h-3 bg-yellow-400 rounded ml-3"></span>
                <span>Medium</span>
                <span className="w-3 h-3 bg-red-400 rounded ml-3"></span>
                <span>Low</span>
              </div>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100"
              >
                ✕
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-gray-600">Loading flexible date prices...</p>
            </div>
          </div>
        ) : (
          <div className="p-6">
            {/* Price Summary */}
            {priceRangeInfo && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="flex items-center justify-center space-x-1 text-green-600 mb-1">
                      <TrendingDown className="w-4 h-4" />
                      <span className="text-sm font-medium">Lowest Price</span>
                    </div>
                    <div className="text-2xl font-bold text-green-700">
                      {formatPrice(convertPrice(priceRangeInfo.minPrice))}
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-center space-x-1 text-blue-600 mb-1">
                      <DollarSign className="w-4 h-4" />
                      <span className="text-sm font-medium">Average Price</span>
                    </div>
                    <div className="text-2xl font-bold text-blue-700">
                      {formatPrice(convertPrice(Math.round(priceRangeInfo.avgPrice)))}
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-center space-x-1 text-red-600 mb-1">
                      <TrendingUp className="w-4 h-4" />
                      <span className="text-sm font-medium">Highest Price</span>
                    </div>
                    <div className="text-2xl font-bold text-red-700">
                      {formatPrice(convertPrice(priceRangeInfo.maxPrice))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Best Deals */}
            {bestDeals.length > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <div className="flex items-center space-x-2 mb-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <h3 className="font-semibold text-green-800">Best Deals Found</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {bestDeals.map(deal => {
                    const dateInfo = formatDateForDisplay(deal.date);
                    return (
                      <button
                        key={deal.date}
                        onClick={() => handleDateClick(deal.date, 'departure')}
                        className="text-left p-3 bg-white border border-green-300 rounded-lg hover:bg-green-50 transition-colors"
                      >
                        <div className="font-medium text-green-800">
                          {dateInfo.weekday}, {dateInfo.month} {dateInfo.day}
                        </div>
                        <div className="text-lg font-bold text-green-700">
                          {formatPrice(convertPrice(deal.price))}
                        </div>
                        {deal.deals?.map(dealType => (
                          <span key={dealType} className="inline-block text-xs bg-green-100 text-green-700 px-2 py-1 rounded mt-1 mr-1">
                            {dealType}
                          </span>
                        ))}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Departure Calendar */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Departure Date
                    {selectedDepartDate && (
                      <span className="ml-2 text-sm font-normal text-blue-600">
                        ({formatDateForDisplay(selectedDepartDate).weekday}, {formatDateForDisplay(selectedDepartDate).month} {formatDateForDisplay(selectedDepartDate).day})
                      </span>
                    )}
                  </h3>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="font-medium">
                      {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </span>
                    <button
                      onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-7 gap-1 mb-2 text-xs font-medium text-gray-500">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="p-2 text-center">{day}</div>
                  ))}
                </div>
                
                <div className="grid grid-cols-7 gap-1 mb-4">
                  {renderCalendarGrid('departure')}
                </div>
              </div>

              {/* Return Calendar */}
              {tripType === 'roundtrip' && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Return Date
                      {selectedReturnDate && (
                        <span className="ml-2 text-sm font-normal text-blue-600">
                          ({formatDateForDisplay(selectedReturnDate).weekday}, {formatDateForDisplay(selectedReturnDate).month} {formatDateForDisplay(selectedReturnDate).day})
                        </span>
                      )}
                    </h3>
                  </div>
                  
                  <div className="grid grid-cols-7 gap-1 mb-2 text-xs font-medium text-gray-500">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                      <div key={day} className="p-2 text-center">{day}</div>
                    ))}
                  </div>
                  
                  <div className="grid grid-cols-7 gap-1 mb-4">
                    {renderCalendarGrid('return')}
                  </div>
                  
                  {!selectedReturnDate && (
                    <div className="flex items-start space-x-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                      <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>Select a departure date first, then choose your return date.</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {selectedDepartDate && (
              <span>
                Selected: {formatDateForDisplay(selectedDepartDate).weekday}, {formatDateForDisplay(selectedDepartDate).month} {formatDateForDisplay(selectedDepartDate).day}
                {selectedReturnDate && (
                  <> → {formatDateForDisplay(selectedReturnDate).weekday}, {formatDateForDisplay(selectedReturnDate).month} {formatDateForDisplay(selectedReturnDate).day}</>
                )}
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmDates}
              disabled={!selectedDepartDate || (tripType === 'roundtrip' && !selectedReturnDate)}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <Plane className="w-4 h-4" />
              <span>Search Flights</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}