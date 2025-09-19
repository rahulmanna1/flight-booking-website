'use client';

import { useState, useEffect, useCallback } from 'react';

interface LocationData {
  latitude: number;
  longitude: number;
  timestamp: number;
}

interface LocationPermissionState {
  permission: 'granted' | 'denied' | 'prompt' | 'unknown';
  location: LocationData | null;
  lastChecked: number;
}

const STORAGE_KEY = 'flight-booking-location-permission';
const LOCATION_CACHE_TIME = 10 * 60 * 1000; // 10 minutes
const PERMISSION_CHECK_TIME = 24 * 60 * 60 * 1000; // 24 hours

export function useLocationPermission() {
  const [permissionState, setPermissionState] = useState<LocationPermissionState>({
    permission: 'unknown',
    location: null,
    lastChecked: 0
  });
  const [isLoading, setIsLoading] = useState(false);

  // Load saved permission state
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved) as LocationPermissionState;
          
          // Check if cached location is still valid
          const now = Date.now();
          if (parsed.location && (now - parsed.location.timestamp) < LOCATION_CACHE_TIME) {
            setPermissionState(parsed);
          } else if (parsed.permission === 'granted' && (now - parsed.lastChecked) < PERMISSION_CHECK_TIME) {
            // Permission was granted previously and check is still valid
            setPermissionState({ ...parsed, location: null });
          } else {
            // Permission check has expired, reset to prompt
            setPermissionState({ permission: 'prompt', location: null, lastChecked: 0 });
          }
        } catch (error) {
          console.error('Error loading location permission state:', error);
        }
      }
    }
  }, []);

  // Save permission state to localStorage
  const savePermissionState = useCallback((state: LocationPermissionState) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
    setPermissionState(state);
  }, []);

  // Check browser permission status
  const checkPermissionStatus = useCallback(async (): Promise<'granted' | 'denied' | 'prompt'> => {
    if (!navigator.permissions) {
      return 'prompt';
    }

    try {
      const result = await navigator.permissions.query({ name: 'geolocation' });
      return result.state;
    } catch (error) {
      console.log('Could not check permission status:', error);
      return 'prompt';
    }
  }, []);

  // Request location with proper caching
  const requestLocation = useCallback(async (forceNew = false): Promise<GeolocationPosition | null> => {
    if (!navigator.geolocation) {
      console.log('Geolocation not supported');
      return null;
    }

    // Check if we have a valid cached location
    if (!forceNew && permissionState.location) {
      const age = Date.now() - permissionState.location.timestamp;
      if (age < LOCATION_CACHE_TIME) {
        console.log('Using cached location');
        return {
          coords: {
            latitude: permissionState.location.latitude,
            longitude: permissionState.location.longitude,
            accuracy: 100,
            altitude: null,
            altitudeAccuracy: null,
            heading: null,
            speed: null
          },
          timestamp: permissionState.location.timestamp
        } as GeolocationPosition;
      }
    }

    setIsLoading(true);

    try {
      // Check current permission status first
      const currentPermission = await checkPermissionStatus();
      
      if (currentPermission === 'denied') {
        // Don't try to request if already denied
        savePermissionState({
          permission: 'denied',
          location: null,
          lastChecked: Date.now()
        });
        setIsLoading(false);
        return null;
      }

      // Request location
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          {
            enableHighAccuracy: false,
            timeout: 5000,
            maximumAge: LOCATION_CACHE_TIME
          }
        );
      });

      // Save successful location
      const locationData: LocationData = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        timestamp: Date.now()
      };

      savePermissionState({
        permission: 'granted',
        location: locationData,
        lastChecked: Date.now()
      });

      setIsLoading(false);
      return position;

    } catch (error: any) {
      console.log('Location request failed:', error);
      
      // Determine if it was a denial or other error
      const permission = error.code === 1 ? 'denied' : 'prompt';
      
      savePermissionState({
        permission,
        location: null,
        lastChecked: Date.now()
      });

      setIsLoading(false);
      return null;
    }
  }, [permissionState, checkPermissionStatus, savePermissionState]);

  // Clear saved permission (for testing or user preference reset)
  const clearPermission = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setPermissionState({
      permission: 'unknown',
      location: null,
      lastChecked: 0
    });
  }, []);

  return {
    permission: permissionState.permission,
    location: permissionState.location,
    isLoading,
    requestLocation,
    clearPermission,
    hasValidLocation: !!permissionState.location && 
      (Date.now() - permissionState.location.timestamp) < LOCATION_CACHE_TIME
  };
}