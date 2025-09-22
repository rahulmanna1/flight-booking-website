'use client';

import { useState, useEffect } from 'react';

export interface RecentSearch {
  id: string;
  from: string;
  to: string;
  fromName?: string;
  toName?: string;
  departDate: string;
  returnDate?: string;
  passengers: number;
  tripType: 'oneway' | 'roundtrip';
  travelClass?: string;
  timestamp: number;
}

const STORAGE_KEY = 'flight-booking-recent-searches';
const MAX_RECENT_SEARCHES = 10;

export function useRecentSearches() {
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load recent searches from localStorage
  useEffect(() => {
    const loadRecentSearches = async () => {
      setIsClient(true);
      setIsLoading(true);
      
      if (typeof window !== 'undefined') {
        try {
          // Simulate a small delay to show loading state (remove in production if not needed)
          await new Promise(resolve => setTimeout(resolve, 100));
          
          const stored = localStorage.getItem(STORAGE_KEY);
          if (stored) {
            const parsed = JSON.parse(stored);
            // Sort by timestamp (most recent first)
            const sorted = parsed.sort((a: RecentSearch, b: RecentSearch) => b.timestamp - a.timestamp);
            setRecentSearches(sorted.slice(0, MAX_RECENT_SEARCHES));
          }
        } catch (error) {
          console.error('Error loading recent searches:', error);
          setRecentSearches([]);
        }
      }
      
      setIsLoading(false);
    };
    
    loadRecentSearches();
  }, []);

  // Save recent searches to localStorage
  const saveRecentSearches = (searches: RecentSearch[]) => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(searches));
      } catch (error) {
        console.error('Error saving recent searches:', error);
      }
    }
  };

  // Add a new search
  const addRecentSearch = (search: Omit<RecentSearch, 'id' | 'timestamp'>) => {
    const newSearch: RecentSearch = {
      ...search,
      id: `${search.from}-${search.to}-${Date.now()}`,
      timestamp: Date.now(),
    };

    // Remove duplicate searches (same from, to, and dates)
    const filtered = recentSearches.filter(s => 
      !(s.from === search.from && 
        s.to === search.to && 
        s.departDate === search.departDate && 
        s.returnDate === search.returnDate &&
        s.tripType === search.tripType)
    );

    // Add new search at the beginning and limit to max
    const updated = [newSearch, ...filtered].slice(0, MAX_RECENT_SEARCHES);
    
    setRecentSearches(updated);
    saveRecentSearches(updated);
  };

  // Remove a search
  const removeRecentSearch = (id: string) => {
    const updated = recentSearches.filter(s => s.id !== id);
    setRecentSearches(updated);
    saveRecentSearches(updated);
  };

  // Clear all searches
  const clearRecentSearches = () => {
    setRecentSearches([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  // Get popular routes from recent searches
  const getPopularRoutes = () => {
    const routeCounts = new Map<string, number>();
    
    recentSearches.forEach(search => {
      const route = `${search.from}-${search.to}`;
      routeCounts.set(route, (routeCounts.get(route) || 0) + 1);
    });

    return Array.from(routeCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([route, count]) => {
        const [from, to] = route.split('-');
        const search = recentSearches.find(s => s.from === from && s.to === to);
        return {
          from,
          to,
          fromName: search?.fromName,
          toName: search?.toName,
          count
        };
      });
  };

  // Get popular destinations (cities/airports that appear most frequently as destinations)
  const getPopularDestinations = () => {
    const destinationCounts = new Map<string, { count: number; name?: string; city?: string }>();
    
    recentSearches.forEach(search => {
      const existing = destinationCounts.get(search.to) || { count: 0 };
      destinationCounts.set(search.to, {
        count: existing.count + 1,
        name: search.toName || existing.name,
        city: search.toName?.split(' ')[0] || existing.city // Extract city name from airport name
      });
    });

    return Array.from(destinationCounts.entries())
      .sort(([,a], [,b]) => b.count - a.count)
      .slice(0, 6)
      .map(([code, data]) => ({
        code,
        count: data.count,
        name: data.name,
        city: data.city || code
      }));
  };

  // Get popular departure cities/airports
  const getPopularOrigins = () => {
    const originCounts = new Map<string, { count: number; name?: string; city?: string }>();
    
    recentSearches.forEach(search => {
      const existing = originCounts.get(search.from) || { count: 0 };
      originCounts.set(search.from, {
        count: existing.count + 1,
        name: search.fromName || existing.name,
        city: search.fromName?.split(' ')[0] || existing.city
      });
    });

    return Array.from(originCounts.entries())
      .sort(([,a], [,b]) => b.count - a.count)
      .slice(0, 6)
      .map(([code, data]) => ({
        code,
        count: data.count,
        name: data.name,
        city: data.city || code
      }));
  };

  return {
    recentSearches,
    addRecentSearch,
    removeRecentSearch,
    clearRecentSearches,
    getPopularRoutes,
    getPopularDestinations,
    getPopularOrigins,
    isClient,
    isLoading
  };
}