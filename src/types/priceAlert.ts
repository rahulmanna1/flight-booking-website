export interface PriceAlert {
  id: string;
  userId: string;
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string; // Optional for one-way trips
  tripType: 'one-way' | 'round-trip';
  passengers: {
    adults: number;
    children: number;
    infants: number;
  };
  cabinClass: 'economy' | 'premium-economy' | 'business' | 'first';
  targetPrice: number;
  currency: string;
  currentPrice?: number;
  isActive: boolean;
  alertType: 'price-drop' | 'price-below' | 'price-above';
  frequency: 'daily' | 'weekly' | 'immediate';
  emailNotifications: boolean;
  pushNotifications: boolean;
  lastChecked?: string;
  priceHistory: PriceHistoryEntry[];
  createdAt: string;
  updatedAt: string;
  expiresAt?: string; // Optional expiration date for the alert
}

export interface PriceHistoryEntry {
  date: string;
  price: number;
  change: number; // Price change since last check
  changePercent: number; // Percentage change
}

export interface CreatePriceAlertRequest {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  tripType: 'one-way' | 'round-trip';
  passengers: {
    adults: number;
    children: number;
    infants: number;
  };
  cabinClass: 'economy' | 'premium-economy' | 'business' | 'first';
  targetPrice: number;
  currency: string;
  alertType: 'price-drop' | 'price-below' | 'price-above';
  frequency: 'daily' | 'weekly' | 'immediate';
  emailNotifications: boolean;
  pushNotifications: boolean;
  expiresAt?: string;
}

export interface UpdatePriceAlertRequest {
  targetPrice?: number;
  alertType?: 'price-drop' | 'price-below' | 'price-above';
  frequency?: 'daily' | 'weekly' | 'immediate';
  emailNotifications?: boolean;
  pushNotifications?: boolean;
  isActive?: boolean;
  expiresAt?: string;
}

export interface PriceAlertFilters {
  isActive?: boolean;
  origin?: string;
  destination?: string;
  tripType?: 'one-way' | 'round-trip';
  alertType?: 'price-drop' | 'price-below' | 'price-above';
  sortBy?: 'createdAt' | 'targetPrice' | 'currentPrice' | 'departureDate';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface PriceAlertNotification {
  id: string;
  priceAlertId: string;
  type: 'price-drop' | 'target-reached' | 'price-increase';
  previousPrice: number;
  currentPrice: number;
  changeAmount: number;
  changePercent: number;
  message: string;
  sentAt: string;
  readAt?: string;
}

// API Response types
export interface PriceAlertResponse {
  success: boolean;
  data?: PriceAlert;
  error?: string;
}

export interface PriceAlertsListResponse {
  success: boolean;
  data?: {
    alerts: PriceAlert[];
    total: number;
    hasMore: boolean;
  };
  error?: string;
}

export interface DeletePriceAlertResponse {
  success: boolean;
  message?: string;
  error?: string;
}