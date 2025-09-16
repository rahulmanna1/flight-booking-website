import { useCallback } from 'react';
import { Airport } from '@/app/api/airports/search/route';

interface SearchHistory {
  id: string;
  from: Airport;
  to: Airport;
  departDate: string;
  returnDate?: string;
  tripType: 'roundtrip' | 'oneway';
  travelClass: string;
  passengers: number;
  searchedAt: string;
}

const STORAGE_KEY = 'flight_search_history';
const MAX_HISTORY_ITEMS = 10;

export function useSearchHistory() {
  // Add a search to history
  const addSearchToHistory = useCallback((
    from: Airport,
    to: Airport,
    departDate: string,
    returnDate: string | undefined,
    tripType: 'roundtrip' | 'oneway',
    travelClass: string,
    passengers: number
  ) => {
    try {
      const newSearch: SearchHistory = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        from,
        to,
        departDate,
        returnDate,
        tripType,
        travelClass,
        passengers,
        searchedAt: new Date().toISOString()
      };

      // Get existing history
      const stored = localStorage.getItem(STORAGE_KEY);
      const existingHistory: SearchHistory[] = stored ? JSON.parse(stored) : [];

      // Remove duplicates based on route and dates
      const filteredHistory = existingHistory.filter(search => 
        !(search.from.iataCode === newSearch.from.iataCode && 
          search.to.iataCode === newSearch.to.iataCode &&
          search.departDate === newSearch.departDate &&
          search.returnDate === newSearch.returnDate &&
          search.tripType === newSearch.tripType)
      );

      // Add new search to the beginning and limit total items
      const updatedHistory = [newSearch, ...filteredHistory].slice(0, MAX_HISTORY_ITEMS);

      // Save to localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));

      console.log('Search added to history:', newSearch);
    } catch (error) {
      console.error('Failed to save search to history:', error);
    }
  }, []);

  // Get search history
  const getSearchHistory = useCallback((): SearchHistory[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load search history:', error);
      return [];
    }
  }, []);

  // Clear search history
  const clearSearchHistory = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear search history:', error);
    }
  }, []);

  return {
    addSearchToHistory,
    getSearchHistory,
    clearSearchHistory
  };
}

export type { SearchHistory };