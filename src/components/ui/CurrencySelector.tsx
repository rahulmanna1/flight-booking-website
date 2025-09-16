'use client';

import { useState } from 'react';
import { ChevronDown, Globe } from 'lucide-react';
import { useCurrency, currencies, Currency } from '@/contexts/CurrencyContext';

export default function CurrencySelector() {
  const { selectedCurrency, setCurrency } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);

  const handleCurrencySelect = (currency: Currency) => {
    setCurrency(currency);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:text-blue-600 transition-colors border border-gray-300 rounded-md bg-white"
      >
        <Globe className="w-4 h-4" />
        <span>{selectedCurrency.code}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-md shadow-lg z-20 max-h-64 overflow-y-auto">
            <div className="py-1">
              {currencies.map((currency) => (
                <button
                  key={currency.code}
                  onClick={() => handleCurrencySelect(currency)}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center justify-between ${
                    selectedCurrency.code === currency.code 
                      ? 'bg-blue-50 text-blue-600' 
                      : 'text-gray-700'
                  }`}
                >
                  <div>
                    <span className="font-medium">{currency.code}</span>
                    <span className="text-gray-500 ml-2">{currency.name}</span>
                  </div>
                  <span className="text-gray-600">{currency.symbol}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}