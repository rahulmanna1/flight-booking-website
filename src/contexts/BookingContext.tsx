'use client';

// Booking Context
// Comprehensive booking state management for flight booking platform

import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { 
  FlightBooking, 
  BookingStatus, 
  CreateBookingRequest, 
  UpdateBookingRequest, 
  CancelBookingRequest,
  BookingSearchFilters,
  BookingSearchOptions,
  BookingSearchResults,
  BookingStats
} from '../types/booking';
import BookingService, { BookingServiceResponse } from '../lib/services/bookingService';
import { useAuth } from './AuthContext';
import { usePayment } from './PaymentContext';

// Booking state interface
export interface BookingState {
  // Current bookings
  bookings: FlightBooking[];
  currentBooking: FlightBooking | null;
  isLoadingBookings: boolean;
  
  // Booking operations
  isCreatingBooking: boolean;
  isUpdatingBooking: boolean;
  isCancellingBooking: boolean;
  
  // Search and filters
  searchFilters: BookingSearchFilters;
  searchResults: BookingSearchResults | null;
  isSearching: boolean;
  
  // Booking statistics
  stats: BookingStats | null;
  isLoadingStats: boolean;
  
  // Error handling
  errors: {
    type: string;
    message: string;
    field?: string;
    bookingId?: string;
  }[];
  
  // UI state
  ui: {
    showBookingDetails: boolean;
    showBookingSearch: boolean;
    showCancellationModal: boolean;
    showCheckInModal: boolean;
    selectedBookingId?: string;
    viewMode: 'list' | 'grid' | 'timeline';
    sortBy: 'createdAt' | 'travelDate' | 'status' | 'total' | 'bookingReference';
    sortOrder: 'asc' | 'desc';
  };
  
  // Pagination
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

// Action types
type BookingAction = 
  // Booking CRUD operations
  | { type: 'SET_LOADING_BOOKINGS'; loading: boolean }
  | { type: 'SET_BOOKINGS'; bookings: FlightBooking[] }
  | { type: 'ADD_BOOKING'; booking: FlightBooking }
  | { type: 'UPDATE_BOOKING'; booking: FlightBooking }
  | { type: 'REMOVE_BOOKING'; bookingId: string }
  | { type: 'SET_CURRENT_BOOKING'; booking: FlightBooking | null }
  
  // Booking operations
  | { type: 'SET_CREATING_BOOKING'; creating: boolean }
  | { type: 'SET_UPDATING_BOOKING'; updating: boolean }
  | { type: 'SET_CANCELLING_BOOKING'; cancelling: boolean }
  
  // Search and filters
  | { type: 'SET_SEARCH_FILTERS'; filters: BookingSearchFilters }
  | { type: 'SET_SEARCH_RESULTS'; results: BookingSearchResults }
  | { type: 'SET_SEARCHING'; searching: boolean }
  | { type: 'CLEAR_SEARCH_RESULTS' }
  
  // Statistics
  | { type: 'SET_STATS'; stats: BookingStats }
  | { type: 'SET_LOADING_STATS'; loading: boolean }
  
  // Error handling
  | { type: 'SET_ERRORS'; errors: BookingState['errors'] }
  | { type: 'ADD_ERROR'; error: BookingState['errors'][0] }
  | { type: 'CLEAR_ERRORS' }
  | { type: 'REMOVE_ERROR'; index: number }
  
  // UI state
  | { type: 'SHOW_BOOKING_DETAILS'; bookingId: string }
  | { type: 'HIDE_BOOKING_DETAILS' }
  | { type: 'SHOW_BOOKING_SEARCH' }
  | { type: 'HIDE_BOOKING_SEARCH' }
  | { type: 'SHOW_CANCELLATION_MODAL'; bookingId: string }
  | { type: 'HIDE_CANCELLATION_MODAL' }
  | { type: 'SHOW_CHECKIN_MODAL'; bookingId: string }
  | { type: 'HIDE_CHECKIN_MODAL' }
  | { type: 'SET_VIEW_MODE'; mode: BookingState['ui']['viewMode'] }
  | { type: 'SET_SORT'; sortBy: BookingState['ui']['sortBy']; sortOrder: BookingState['ui']['sortOrder'] }
  
  // Pagination
  | { type: 'SET_PAGINATION'; pagination: Partial<BookingState['pagination']> };

// Initial state
const initialState: BookingState = {
  bookings: [],
  currentBooking: null,
  isLoadingBookings: false,
  
  isCreatingBooking: false,
  isUpdatingBooking: false,
  isCancellingBooking: false,
  
  searchFilters: {},
  searchResults: null,
  isSearching: false,
  
  stats: null,
  isLoadingStats: false,
  
  errors: [],
  
  ui: {
    showBookingDetails: false,
    showBookingSearch: false,
    showCancellationModal: false,
    showCheckInModal: false,
    viewMode: 'list',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  },
  
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrevious: false,
  },
};

// Reducer
function bookingReducer(state: BookingState, action: BookingAction): BookingState {
  switch (action.type) {
    // Booking CRUD operations
    case 'SET_LOADING_BOOKINGS':
      return { ...state, isLoadingBookings: action.loading };
    
    case 'SET_BOOKINGS':
      return { ...state, bookings: action.bookings };
    
    case 'ADD_BOOKING':
      return {
        ...state,
        bookings: [action.booking, ...state.bookings],
      };
    
    case 'UPDATE_BOOKING':
      return {
        ...state,
        bookings: state.bookings.map(booking =>
          booking.id === action.booking.id ? action.booking : booking
        ),
        currentBooking: state.currentBooking?.id === action.booking.id
          ? action.booking
          : state.currentBooking,
      };
    
    case 'REMOVE_BOOKING':
      return {
        ...state,
        bookings: state.bookings.filter(booking => booking.id !== action.bookingId),
        currentBooking: state.currentBooking?.id === action.bookingId
          ? null
          : state.currentBooking,
      };
    
    case 'SET_CURRENT_BOOKING':
      return { ...state, currentBooking: action.booking };
    
    // Booking operations
    case 'SET_CREATING_BOOKING':
      return { ...state, isCreatingBooking: action.creating };
    
    case 'SET_UPDATING_BOOKING':
      return { ...state, isUpdatingBooking: action.updating };
    
    case 'SET_CANCELLING_BOOKING':
      return { ...state, isCancellingBooking: action.cancelling };
    
    // Search and filters
    case 'SET_SEARCH_FILTERS':
      return { ...state, searchFilters: action.filters };
    
    case 'SET_SEARCH_RESULTS':
      return { 
        ...state, 
        searchResults: action.results,
        pagination: {
          page: action.results.page,
          limit: state.pagination.limit,
          total: action.results.total,
          totalPages: action.results.totalPages,
          hasNext: action.results.hasNext,
          hasPrevious: action.results.hasPrevious,
        },
      };
    
    case 'SET_SEARCHING':
      return { ...state, isSearching: action.searching };
    
    case 'CLEAR_SEARCH_RESULTS':
      return { 
        ...state, 
        searchResults: null,
        searchFilters: {},
      };
    
    // Statistics
    case 'SET_STATS':
      return { ...state, stats: action.stats };
    
    case 'SET_LOADING_STATS':
      return { ...state, isLoadingStats: action.loading };
    
    // Error handling
    case 'SET_ERRORS':
      return { ...state, errors: action.errors };
    
    case 'ADD_ERROR':
      return { 
        ...state, 
        errors: [...state.errors, action.error],
      };
    
    case 'CLEAR_ERRORS':
      return { ...state, errors: [] };
    
    case 'REMOVE_ERROR':
      return { 
        ...state, 
        errors: state.errors.filter((_, index) => index !== action.index),
      };
    
    // UI state
    case 'SHOW_BOOKING_DETAILS':
      return {
        ...state,
        ui: {
          ...state.ui,
          showBookingDetails: true,
          selectedBookingId: action.bookingId,
        },
      };
    
    case 'HIDE_BOOKING_DETAILS':
      return {
        ...state,
        ui: {
          ...state.ui,
          showBookingDetails: false,
          selectedBookingId: undefined,
        },
      };
    
    case 'SHOW_BOOKING_SEARCH':
      return {
        ...state,
        ui: { ...state.ui, showBookingSearch: true },
      };
    
    case 'HIDE_BOOKING_SEARCH':
      return {
        ...state,
        ui: { ...state.ui, showBookingSearch: false },
      };
    
    case 'SHOW_CANCELLATION_MODAL':
      return {
        ...state,
        ui: {
          ...state.ui,
          showCancellationModal: true,
          selectedBookingId: action.bookingId,
        },
      };
    
    case 'HIDE_CANCELLATION_MODAL':
      return {
        ...state,
        ui: {
          ...state.ui,
          showCancellationModal: false,
          selectedBookingId: undefined,
        },
      };
    
    case 'SHOW_CHECKIN_MODAL':
      return {
        ...state,
        ui: {
          ...state.ui,
          showCheckInModal: true,
          selectedBookingId: action.bookingId,
        },
      };
    
    case 'HIDE_CHECKIN_MODAL':
      return {
        ...state,
        ui: {
          ...state.ui,
          showCheckInModal: false,
          selectedBookingId: undefined,
        },
      };
    
    case 'SET_VIEW_MODE':
      return {
        ...state,
        ui: { ...state.ui, viewMode: action.mode },
      };
    
    case 'SET_SORT':
      return {
        ...state,
        ui: { 
          ...state.ui, 
          sortBy: action.sortBy, 
          sortOrder: action.sortOrder,
        },
      };
    
    // Pagination
    case 'SET_PAGINATION':
      return {
        ...state,
        pagination: { ...state.pagination, ...action.pagination },
      };
    
    default:
      return state;
  }
}

// Context value interface
interface BookingContextValue {
  state: BookingState;
  
  // Booking CRUD operations
  createBooking: (request: CreateBookingRequest) => Promise<FlightBooking | null>;
  getBooking: (bookingId: string) => Promise<FlightBooking | null>;
  getBookingById: (bookingId: string) => Promise<FlightBooking | null>; // Alias for getBooking
  getBookingByReference: (reference: string) => Promise<FlightBooking | null>;
  updateBooking: (bookingId: string, updates: UpdateBookingRequest) => Promise<FlightBooking | null>;
  cancelBooking: (bookingId: string, request: CancelBookingRequest) => Promise<FlightBooking | null>;
  
  // Booking management
  loadUserBookings: (page?: number, limit?: number) => Promise<void>;
  refreshBooking: (bookingId: string) => Promise<void>;
  updateBookingStatus: (bookingId: string, status: BookingStatus, notes?: string) => Promise<void>;
  
  // Search functionality
  searchBookings: (filters: BookingSearchFilters, options?: Partial<BookingSearchOptions>) => Promise<void>;
  clearSearch: () => void;
  
  // Statistics
  loadBookingStats: (dateRange?: { start: string; end: string }) => Promise<void>;
  
  // Check-in operations
  checkInPassenger: (bookingId: string, passengerId: string, segmentId: string, seatNumber?: string) => Promise<boolean>;
  
  // Booking confirmation
  sendBookingConfirmation: (bookingId: string) => Promise<boolean>;
  sendConfirmationEmail: (bookingId: string) => Promise<boolean>; // Alias for sendBookingConfirmation
  
  // UI actions
  showBookingDetails: (bookingId: string) => void;
  hideBookingDetails: () => void;
  showBookingSearch: () => void;
  hideBookingSearch: () => void;
  showCancellationModal: (bookingId: string) => void;
  hideCancellationModal: () => void;
  showCheckInModal: (bookingId: string) => void;
  hideCheckInModal: () => void;
  setViewMode: (mode: BookingState['ui']['viewMode']) => void;
  setSorting: (sortBy: BookingState['ui']['sortBy'], sortOrder: BookingState['ui']['sortOrder']) => void;
  
  // Pagination
  goToPage: (page: number) => void;
  setPageSize: (limit: number) => void;
  
  // Utility functions
  getBookingStatusColor: (status: BookingStatus) => string;
  getBookingStatusLabel: (status: BookingStatus) => string;
  canCancelBooking: (booking: FlightBooking) => boolean;
  canCheckIn: (booking: FlightBooking) => boolean;
  canModifyBooking: (booking: FlightBooking) => boolean;
  formatBookingReference: (reference: string) => string;
  calculateRefundAmount: (booking: FlightBooking) => number;
}

// Create context
const BookingContext = createContext<BookingContextValue | undefined>(undefined);

// Provider component
interface BookingProviderProps {
  children: ReactNode;
}

export function BookingProvider({ children }: BookingProviderProps) {
  const [state, dispatch] = useReducer(bookingReducer, initialState);
  const { user } = useAuth();
  const { processPayment } = usePayment();

  // Load user bookings on mount
  useEffect(() => {
    if (user) {
      loadUserBookings();
    }
  }, [user]);

  // Booking CRUD operations
  const createBooking = async (request: CreateBookingRequest): Promise<FlightBooking | null> => {
    if (!user) {
      dispatch({ 
        type: 'ADD_ERROR', 
        error: { type: 'auth_error', message: 'User must be authenticated' } 
      });
      return null;
    }

    dispatch({ type: 'SET_CREATING_BOOKING', creating: true });
    dispatch({ type: 'CLEAR_ERRORS' });

    try {
      const response = await BookingService.createBooking(request, user.id);
      
      if (response.success && response.data) {
        dispatch({ type: 'ADD_BOOKING', booking: response.data });
        dispatch({ type: 'SET_CURRENT_BOOKING', booking: response.data });
        
        console.log(`✅ Booking created: ${response.data.bookingReference}`);
        return response.data;
      } else if (response.error) {
        dispatch({ 
          type: 'ADD_ERROR', 
          error: { 
            type: response.error.code, 
            message: response.error.message 
          } 
        });
      }
    } catch (error: any) {
      dispatch({ 
        type: 'ADD_ERROR', 
        error: { 
          type: 'booking_error', 
          message: error.message || 'Failed to create booking' 
        } 
      });
    } finally {
      dispatch({ type: 'SET_CREATING_BOOKING', creating: false });
    }

    return null;
  };

  const getBooking = async (bookingId: string): Promise<FlightBooking | null> => {
    try {
      const response = await BookingService.getBooking(bookingId);
      
      if (response.success && response.data) {
        dispatch({ type: 'SET_CURRENT_BOOKING', booking: response.data });
        return response.data;
      } else if (response.error) {
        dispatch({ 
          type: 'ADD_ERROR', 
          error: { 
            type: response.error.code, 
            message: response.error.message,
            bookingId,
          } 
        });
      }
    } catch (error: any) {
      dispatch({ 
        type: 'ADD_ERROR', 
        error: { 
          type: 'booking_error', 
          message: error.message || 'Failed to retrieve booking',
          bookingId,
        } 
      });
    }

    return null;
  };

  const getBookingByReference = async (reference: string): Promise<FlightBooking | null> => {
    try {
      const response = await BookingService.getBookingByReference(reference);
      
      if (response.success && response.data) {
        dispatch({ type: 'SET_CURRENT_BOOKING', booking: response.data });
        return response.data;
      } else if (response.error) {
        dispatch({ 
          type: 'ADD_ERROR', 
          error: { 
            type: response.error.code, 
            message: response.error.message 
          } 
        });
      }
    } catch (error: any) {
      dispatch({ 
        type: 'ADD_ERROR', 
        error: { 
          type: 'booking_error', 
          message: error.message || 'Failed to retrieve booking by reference' 
        } 
      });
    }

    return null;
  };

  const updateBooking = async (
    bookingId: string, 
    updates: UpdateBookingRequest
  ): Promise<FlightBooking | null> => {
    if (!user) return null;

    dispatch({ type: 'SET_UPDATING_BOOKING', updating: true });

    try {
      const response = await BookingService.updateBooking(bookingId, updates, user.id);
      
      if (response.success && response.data) {
        dispatch({ type: 'UPDATE_BOOKING', booking: response.data });
        return response.data;
      } else if (response.error) {
        dispatch({ 
          type: 'ADD_ERROR', 
          error: { 
            type: response.error.code, 
            message: response.error.message,
            bookingId,
          } 
        });
      }
    } catch (error: any) {
      dispatch({ 
        type: 'ADD_ERROR', 
        error: { 
          type: 'booking_error', 
          message: error.message || 'Failed to update booking',
          bookingId,
        } 
      });
    } finally {
      dispatch({ type: 'SET_UPDATING_BOOKING', updating: false });
    }

    return null;
  };

  const cancelBooking = async (
    bookingId: string, 
    request: CancelBookingRequest
  ): Promise<FlightBooking | null> => {
    if (!user) return null;

    dispatch({ type: 'SET_CANCELLING_BOOKING', cancelling: true });

    try {
      const response = await BookingService.cancelBooking(bookingId, request, user.id);
      
      if (response.success && response.data) {
        dispatch({ type: 'UPDATE_BOOKING', booking: response.data });
        return response.data;
      } else if (response.error) {
        dispatch({ 
          type: 'ADD_ERROR', 
          error: { 
            type: response.error.code, 
            message: response.error.message,
            bookingId,
          } 
        });
      }
    } catch (error: any) {
      dispatch({ 
        type: 'ADD_ERROR', 
        error: { 
          type: 'booking_error', 
          message: error.message || 'Failed to cancel booking',
          bookingId,
        } 
      });
    } finally {
      dispatch({ type: 'SET_CANCELLING_BOOKING', cancelling: false });
    }

    return null;
  };

  // Booking management
  const loadUserBookings = async (page: number = 1, limit: number = 10): Promise<void> => {
    if (!user) return;

    dispatch({ type: 'SET_LOADING_BOOKINGS', loading: true });

    try {
      const response = await BookingService.getUserBookings(user.id, page, limit);
      
      if (response.success && response.data) {
        dispatch({ type: 'SET_BOOKINGS', bookings: response.data.bookings });
        dispatch({ 
          type: 'SET_PAGINATION', 
          pagination: {
            page: response.data.page,
            total: response.data.total,
            totalPages: response.data.totalPages,
            hasNext: response.data.hasNext,
            hasPrevious: response.data.hasPrevious,
          }
        });
      }
    } catch (error: any) {
      dispatch({ 
        type: 'ADD_ERROR', 
        error: { 
          type: 'loading_error', 
          message: 'Failed to load bookings' 
        } 
      });
    } finally {
      dispatch({ type: 'SET_LOADING_BOOKINGS', loading: false });
    }
  };

  const refreshBooking = async (bookingId: string): Promise<void> => {
    const booking = await getBooking(bookingId);
    if (booking) {
      dispatch({ type: 'UPDATE_BOOKING', booking });
    }
  };

  const updateBookingStatus = async (
    bookingId: string, 
    status: BookingStatus, 
    notes?: string
  ): Promise<void> => {
    if (!user) return;

    try {
      const response = await BookingService.updateBookingStatus(bookingId, status, user.id, notes);
      
      if (response.success && response.data) {
        dispatch({ type: 'UPDATE_BOOKING', booking: response.data });
      }
    } catch (error: any) {
      dispatch({ 
        type: 'ADD_ERROR', 
        error: { 
          type: 'status_update_error', 
          message: 'Failed to update booking status',
          bookingId,
        } 
      });
    }
  };

  // Search functionality
  const searchBookings = async (
    filters: BookingSearchFilters,
    options: Partial<BookingSearchOptions> = {}
  ): Promise<void> => {
    dispatch({ type: 'SET_SEARCHING', searching: true });
    dispatch({ type: 'SET_SEARCH_FILTERS', filters });

    const searchOptions: BookingSearchOptions = {
      filters,
      sortBy: options.sortBy || state.ui.sortBy,
      sortOrder: options.sortOrder || state.ui.sortOrder,
      page: options.page || 1,
      limit: options.limit || state.pagination.limit,
    };

    try {
      const response = await BookingService.searchBookings(searchOptions, user?.id);
      
      if (response.success && response.data) {
        dispatch({ type: 'SET_SEARCH_RESULTS', results: response.data });
      }
    } catch (error: any) {
      dispatch({ 
        type: 'ADD_ERROR', 
        error: { 
          type: 'search_error', 
          message: 'Failed to search bookings' 
        } 
      });
    } finally {
      dispatch({ type: 'SET_SEARCHING', searching: false });
    }
  };

  const clearSearch = (): void => {
    dispatch({ type: 'CLEAR_SEARCH_RESULTS' });
  };

  // Statistics
  const loadBookingStats = async (
    dateRange?: { start: string; end: string }
  ): Promise<void> => {
    dispatch({ type: 'SET_LOADING_STATS', loading: true });

    try {
      const response = await BookingService.getBookingStats(user?.id, dateRange);
      
      if (response.success && response.data) {
        dispatch({ type: 'SET_STATS', stats: response.data });
      }
    } catch (error: any) {
      dispatch({ 
        type: 'ADD_ERROR', 
        error: { 
          type: 'stats_error', 
          message: 'Failed to load statistics' 
        } 
      });
    } finally {
      dispatch({ type: 'SET_LOADING_STATS', loading: false });
    }
  };

  // Check-in operations
  const checkInPassenger = async (
    bookingId: string,
    passengerId: string,
    segmentId: string,
    seatNumber?: string
  ): Promise<boolean> => {
    try {
      const response = await BookingService.checkInPassenger(
        bookingId, 
        passengerId, 
        segmentId, 
        seatNumber
      );
      
      if (response.success) {
        // Refresh the booking to get updated check-in status
        await refreshBooking(bookingId);
        return true;
      }
    } catch (error: any) {
      dispatch({ 
        type: 'ADD_ERROR', 
        error: { 
          type: 'checkin_error', 
          message: 'Failed to check in passenger',
          bookingId,
        } 
      });
    }

    return false;
  };

  // Booking confirmation
  const sendBookingConfirmation = async (bookingId: string): Promise<boolean> => {
    try {
      const response = await BookingService.sendBookingConfirmation(bookingId);
      return response.success;
    } catch (error: any) {
      dispatch({ 
        type: 'ADD_ERROR', 
        error: { 
          type: 'confirmation_error', 
          message: 'Failed to send confirmation',
          bookingId,
        } 
      });
      return false;
    }
  };

  // UI actions
  const showBookingDetails = (bookingId: string): void => {
    dispatch({ type: 'SHOW_BOOKING_DETAILS', bookingId });
  };

  const hideBookingDetails = (): void => {
    dispatch({ type: 'HIDE_BOOKING_DETAILS' });
  };

  const showBookingSearch = (): void => {
    dispatch({ type: 'SHOW_BOOKING_SEARCH' });
  };

  const hideBookingSearch = (): void => {
    dispatch({ type: 'HIDE_BOOKING_SEARCH' });
  };

  const showCancellationModal = (bookingId: string): void => {
    dispatch({ type: 'SHOW_CANCELLATION_MODAL', bookingId });
  };

  const hideCancellationModal = (): void => {
    dispatch({ type: 'HIDE_CANCELLATION_MODAL' });
  };

  const showCheckInModal = (bookingId: string): void => {
    dispatch({ type: 'SHOW_CHECKIN_MODAL', bookingId });
  };

  const hideCheckInModal = (): void => {
    dispatch({ type: 'HIDE_CHECKIN_MODAL' });
  };

  const setViewMode = (mode: BookingState['ui']['viewMode']): void => {
    dispatch({ type: 'SET_VIEW_MODE', mode });
  };

  const setSorting = (
    sortBy: BookingState['ui']['sortBy'], 
    sortOrder: BookingState['ui']['sortOrder']
  ): void => {
    dispatch({ type: 'SET_SORT', sortBy, sortOrder });
  };

  // Pagination
  const goToPage = (page: number): void => {
    dispatch({ type: 'SET_PAGINATION', pagination: { page } });
    loadUserBookings(page, state.pagination.limit);
  };

  const setPageSize = (limit: number): void => {
    dispatch({ type: 'SET_PAGINATION', pagination: { limit, page: 1 } });
    loadUserBookings(1, limit);
  };

  // Utility functions
  const getBookingStatusColor = (status: BookingStatus) => {
    const statusColors: Record<BookingStatus, string> = {
      'PENDING_PAYMENT': 'yellow',
      'PAYMENT_FAILED': 'red',
      'CONFIRMED': 'green',
      'TICKETED': 'blue',
      'CHECKED_IN': 'purple',
      'BOARDING': 'indigo',
      'DEPARTED': 'gray',
      'COMPLETED': 'green',
      'CANCELLED': 'red',
      'REFUNDED': 'orange',
      'EXPIRED': 'gray'
    };
    return statusColors[status] || 'gray';
  };

  const getBookingStatusLabel = (status: BookingStatus) => {
    const statusLabels: Record<BookingStatus, string> = {
      'PENDING_PAYMENT': 'Payment Pending',
      'PAYMENT_FAILED': 'Payment Failed',
      'CONFIRMED': 'Confirmed',
      'TICKETED': 'Ticketed',
      'CHECKED_IN': 'Checked In',
      'BOARDING': 'Boarding',
      'DEPARTED': 'Departed',
      'COMPLETED': 'Completed',
      'CANCELLED': 'Cancelled',
      'REFUNDED': 'Refunded',
      'EXPIRED': 'Expired'
    };
    return statusLabels[status] || status;
  };

  const canCancelBooking = (booking: FlightBooking): boolean => {
    const cancelableStatuses: BookingStatus[] = [
      'PENDING_PAYMENT',
      'CONFIRMED',
      'TICKETED'
    ];
    return cancelableStatuses.includes(booking.status);
  };

  const canCheckIn = (booking: FlightBooking): boolean => {
    return booking.status === 'TICKETED' || booking.status === 'CONFIRMED';
  };

  const canModifyBooking = (booking: FlightBooking): boolean => {
    const modifiableStatuses: BookingStatus[] = [
      'CONFIRMED',
      'TICKETED'
    ];
    return modifiableStatuses.includes(booking.status);
  };

  const formatBookingReference = (reference: string): string => {
    // Format booking reference as ABC-123 for better readability
    if (reference.length === 6) {
      return `${reference.slice(0, 3)}-${reference.slice(3)}`;
    }
    return reference;
  };

  const calculateRefundAmount = (booking: FlightBooking): number => {
    // Simple refund calculation - in reality this would be more complex
    const total = booking.pricing.total;
    const cancellationFees = booking.cancellation?.cancellationFees || 0;
    return Math.max(0, total - cancellationFees);
  };

  const value: BookingContextValue = {
    state,
    
    // Booking CRUD operations
    createBooking,
    getBooking,
    getBookingById: getBooking, // Alias for getBooking
    getBookingByReference,
    updateBooking,
    cancelBooking,
    
    // Booking management
    loadUserBookings,
    refreshBooking,
    updateBookingStatus,
    
    // Search functionality
    searchBookings,
    clearSearch,
    
    // Statistics
    loadBookingStats,
    
    // Check-in operations
    checkInPassenger,
    
    // Booking confirmation
    sendBookingConfirmation,
    sendConfirmationEmail: sendBookingConfirmation, // Alias for sendBookingConfirmation
    
    // UI actions
    showBookingDetails,
    hideBookingDetails,
    showBookingSearch,
    hideBookingSearch,
    showCancellationModal,
    hideCancellationModal,
    showCheckInModal,
    hideCheckInModal,
    setViewMode,
    setSorting,
    
    // Pagination
    goToPage,
    setPageSize,
    
    // Utility functions
    getBookingStatusColor,
    getBookingStatusLabel,
    canCancelBooking,
    canCheckIn,
    canModifyBooking,
    formatBookingReference,
    calculateRefundAmount,
  };

  return (
    <BookingContext.Provider value={value}>
      {children}
    </BookingContext.Provider>
  );
}

// Custom hook
export function useBooking() {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
}

export default BookingContext;