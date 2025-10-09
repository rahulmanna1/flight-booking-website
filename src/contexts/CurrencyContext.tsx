'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Currency {
  code: string;
  symbol: string;
  name: string;
  rate: number; // Exchange rate relative to USD
}

export const currencies: Currency[] = [
  { code: 'USD', symbol: '$', name: 'US Dollar', rate: 1.00 },
  { code: 'EUR', symbol: '€', name: 'Euro', rate: 0.92 },
  { code: 'GBP', symbol: '£', name: 'British Pound', rate: 0.79 },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', rate: 149.50 },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', rate: 1.35 },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', rate: 1.52 },
  { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc', rate: 0.88 },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', rate: 7.24 },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', rate: 83.25 },
];

interface CurrencyContextType {
  selectedCurrency: Currency;
  currency: Currency; // Alias for selectedCurrency
  setCurrency: (currency: Currency) => void;
  convertPrice: (usdPrice: number) => number;
  formatPrice: (usdPrice: number) => string;
  formatAmount: (amount: number) => string; // Alias for formatPrice
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(currencies[0]); // Default to USD

  const setCurrency = (currency: Currency) => {
    setSelectedCurrency(currency);
  };

  const convertPrice = (usdPrice: number): number => {
    return Math.round(usdPrice * selectedCurrency.rate);
  };

  const formatPrice = (usdPrice: number): string => {
    const convertedPrice = convertPrice(usdPrice);
    
    // Format based on currency
    if (selectedCurrency.code === 'JPY' || selectedCurrency.code === 'CNY') {
      // No decimal places for Yen and Yuan
      return `${selectedCurrency.symbol}${convertedPrice.toLocaleString()}`;
    } else if (selectedCurrency.code === 'INR') {
      // Indian number formatting
      return `${selectedCurrency.symbol}${convertedPrice.toLocaleString('en-IN')}`;
    } else {
      // Standard formatting with 2 decimal places for other currencies
      return `${selectedCurrency.symbol}${convertedPrice.toLocaleString('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      })}`;
    }
  };

  const value: CurrencyContextType = {
    selectedCurrency,
    currency: selectedCurrency, // Alias
    setCurrency,
    convertPrice,
    formatPrice,
    formatAmount: formatPrice, // Alias
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = (): CurrencyContextType => {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};