'use client';

import { AlertCircle, MapPin, Plane } from 'lucide-react';
import { getSameAirportSuggestions, isSameAirport } from '@/lib/airportSuggestions';

interface AirportSuggestionsProps {
  origin: string;
  destination: string;
  onSuggestionClick: (airportCode: string) => void;
  className?: string;
}

export default function AirportSuggestions({ 
  origin, 
  destination, 
  onSuggestionClick,
  className = '' 
}: AirportSuggestionsProps) {
  
  if (!isSameAirport(origin, destination)) {
    return null;
  }

  const suggestionData = getSameAirportSuggestions(origin);

  return (
    <div className={`bg-amber-50 border border-amber-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-medium text-amber-800 mb-2">
            Same Airport Selected
          </h4>
          <p className="text-sm text-amber-700 mb-3">
            {suggestionData.message}
          </p>
          
          {suggestionData.suggestions.length > 0 && (
            <div>
              <p className="text-sm font-medium text-amber-800 mb-2">
                Popular destinations from {origin}:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {suggestionData.suggestions.map((suggestion) => (
                  <button
                    key={suggestion.code}
                    onClick={() => onSuggestionClick(suggestion.code)}
                    className="flex items-center space-x-2 p-2 text-left text-sm bg-white border border-amber-200 rounded-md hover:bg-amber-50 hover:border-amber-300 transition-colors group"
                  >
                    <div className="flex-shrink-0">
                      {suggestion.type === 'domestic' ? (
                        <Plane className="w-4 h-4 text-blue-600" />
                      ) : (
                        <MapPin className="w-4 h-4 text-green-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 group-hover:text-amber-800">
                        {suggestion.code} - {suggestion.city}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {suggestion.country} • {suggestion.type}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
          
          <div className="mt-3 pt-3 border-t border-amber-200">
            <p className="text-xs text-amber-600">
              💡 <strong>Tip:</strong> Looking for hotels or activities in {suggestionData.airportName?.split(' ')[0]}? 
              Try our travel packages section.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}