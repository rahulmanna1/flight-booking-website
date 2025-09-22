import { 
  PriceAlert, 
  CreatePriceAlertRequest, 
  UpdatePriceAlertRequest, 
  PriceAlertFilters,
  PriceHistoryEntry
} from '@/types/priceAlert';
import { v4 as uuidv4 } from 'uuid';
import { NotificationService } from './NotificationService';

// Mock database - In production, this would be replaced with actual database operations
const priceAlerts: Map<string, PriceAlert> = new Map();
const userAlerts: Map<string, string[]> = new Map();

export class PriceAlertService {
  // Create a new price alert
  static async createPriceAlert(userId: string, request: CreatePriceAlertRequest): Promise<PriceAlert> {
    this.validateCreateRequest(request);
    
    const alertId = uuidv4();
    const now = new Date().toISOString();
    
    const priceAlert: PriceAlert = {
      id: alertId,
      userId,
      origin: request.origin,
      destination: request.destination,
      departureDate: request.departureDate,
      returnDate: request.returnDate,
      tripType: request.tripType,
      passengers: request.passengers,
      cabinClass: request.cabinClass,
      targetPrice: request.targetPrice,
      currency: request.currency,
      isActive: true,
      alertType: request.alertType,
      frequency: request.frequency,
      emailNotifications: request.emailNotifications,
      pushNotifications: request.pushNotifications,
      priceHistory: [],
      createdAt: now,
      updatedAt: now,
      expiresAt: request.expiresAt
    };
    
    // Store in mock database
    priceAlerts.set(alertId, priceAlert);
    
    // Update user's alert list
    const userAlertList = userAlerts.get(userId) || [];
    userAlertList.push(alertId);
    userAlerts.set(userId, userAlertList);
    
    // Start monitoring this alert
    this.startMonitoring(priceAlert);
    
    return priceAlert;
  }
  
  // Get all price alerts for a user
  static async getUserPriceAlerts(
    userId: string, 
    filters: PriceAlertFilters = {}
  ): Promise<{ alerts: PriceAlert[], total: number, hasMore: boolean }> {
    const userAlertIds = userAlerts.get(userId) || [];
    let userAlertsList = userAlertIds
      .map(id => priceAlerts.get(id))
      .filter(alert => alert !== undefined) as PriceAlert[];
    
    // Apply filters
    if (filters.isActive !== undefined) {
      userAlertsList = userAlertsList.filter(alert => alert.isActive === filters.isActive);
    }
    
    if (filters.origin) {
      userAlertsList = userAlertsList.filter(alert => 
        alert.origin.toLowerCase().includes(filters.origin!.toLowerCase())
      );
    }
    
    if (filters.destination) {
      userAlertsList = userAlertsList.filter(alert => 
        alert.destination.toLowerCase().includes(filters.destination!.toLowerCase())
      );
    }
    
    if (filters.tripType) {
      userAlertsList = userAlertsList.filter(alert => alert.tripType === filters.tripType);
    }
    
    if (filters.alertType) {
      userAlertsList = userAlertsList.filter(alert => alert.alertType === filters.alertType);
    }
    
    // Sort results
    const sortBy = filters.sortBy || 'createdAt';
    const sortOrder = filters.sortOrder || 'desc';
    
    userAlertsList.sort((a, b) => {
      let valueA, valueB;
      
      switch (sortBy) {
        case 'targetPrice':
          valueA = a.targetPrice;
          valueB = b.targetPrice;
          break;
        case 'currentPrice':
          valueA = a.currentPrice || 0;
          valueB = b.currentPrice || 0;
          break;
        case 'departureDate':
          valueA = new Date(a.departureDate).getTime();
          valueB = new Date(b.departureDate).getTime();
          break;
        default:
          valueA = new Date(a.createdAt).getTime();
          valueB = new Date(b.createdAt).getTime();
      }
      
      if (sortOrder === 'asc') {
        return valueA > valueB ? 1 : -1;
      } else {
        return valueA < valueB ? 1 : -1;
      }
    });
    
    // Pagination
    const limit = filters.limit || 20;
    const offset = filters.offset || 0;
    const total = userAlertsList.length;
    const paginatedAlerts = userAlertsList.slice(offset, offset + limit);
    const hasMore = offset + limit < total;
    
    return {
      alerts: paginatedAlerts,
      total,
      hasMore
    };
  }
  
  // Get a specific price alert
  static async getPriceAlert(userId: string, alertId: string): Promise<PriceAlert | null> {
    const alert = priceAlerts.get(alertId);
    
    if (!alert || alert.userId !== userId) {
      return null;
    }
    
    return alert;
  }
  
  // Update a price alert
  static async updatePriceAlert(
    userId: string, 
    alertId: string, 
    updates: UpdatePriceAlertRequest
  ): Promise<PriceAlert | null> {
    const alert = priceAlerts.get(alertId);
    
    if (!alert || alert.userId !== userId) {
      return null;
    }
    
    // Validate updates
    if (updates.targetPrice !== undefined && updates.targetPrice <= 0) {
      throw new Error('Target price must be greater than 0');
    }
    
    // Apply updates
    const updatedAlert: PriceAlert = {
      ...alert,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    priceAlerts.set(alertId, updatedAlert);
    
    return updatedAlert;
  }
  
  // Delete a price alert
  static async deletePriceAlert(userId: string, alertId: string): Promise<boolean> {
    const alert = priceAlerts.get(alertId);
    
    if (!alert || alert.userId !== userId) {
      return false;
    }
    
    // Remove from storage
    priceAlerts.delete(alertId);
    
    // Remove from user's alert list
    const userAlertList = userAlerts.get(userId) || [];
    const updatedList = userAlertList.filter(id => id !== alertId);
    userAlerts.set(userId, updatedList);
    
    return true;
  }
  
  // Toggle alert active status
  static async togglePriceAlert(userId: string, alertId: string): Promise<PriceAlert | null> {
    const alert = priceAlerts.get(alertId);
    
    if (!alert || alert.userId !== userId) {
      return null;
    }
    
    const updatedAlert = {
      ...alert,
      isActive: !alert.isActive,
      updatedAt: new Date().toISOString()
    };
    
    priceAlerts.set(alertId, updatedAlert);
    
    return updatedAlert;
  }
  
  // Check prices for all active alerts (would be called by a background job)
  static async checkAllPrices(): Promise<void> {
    const activeAlerts = Array.from(priceAlerts.values())
      .filter(alert => alert.isActive && this.isNotExpired(alert));
    
    for (const alert of activeAlerts) {
      try {
        await this.checkPriceForAlert(alert);
      } catch (error) {
        console.error(`Error checking price for alert ${alert.id}:`, error);
      }
    }
  }
  
  // Check price for a specific alert
  static async checkPriceForAlert(alert: PriceAlert): Promise<void> {
    // Mock price fetching - in production, this would call actual flight APIs
    const currentPrice = await this.fetchCurrentPrice(alert);
    const previousPrice = alert.currentPrice;
    
    // Update alert with current price
    const priceEntry: PriceHistoryEntry = {
      date: new Date().toISOString(),
      price: currentPrice,
      change: previousPrice ? currentPrice - previousPrice : 0,
      changePercent: previousPrice ? ((currentPrice - previousPrice) / previousPrice) * 100 : 0
    };
    
    const updatedAlert: PriceAlert = {
      ...alert,
      currentPrice,
      lastChecked: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      priceHistory: [...alert.priceHistory, priceEntry].slice(-30) // Keep last 30 entries
    };
    
    priceAlerts.set(alert.id, updatedAlert);
    
    // Check if alert conditions are met
    const shouldTrigger = this.shouldTriggerAlert(alert, currentPrice, previousPrice);
    
    if (shouldTrigger) {
      await this.triggerAlert(updatedAlert, priceEntry);
    }
  }
  
  // Private helper methods
  private static validateCreateRequest(request: CreatePriceAlertRequest): void {
    if (!request.origin || !request.destination) {
      throw new Error('Origin and destination are required');
    }
    
    if (!request.departureDate) {
      throw new Error('Departure date is required');
    }
    
    if (new Date(request.departureDate) < new Date()) {
      throw new Error('Departure date cannot be in the past');
    }
    
    if (request.targetPrice <= 0) {
      throw new Error('Target price must be greater than 0');
    }
    
    if (request.passengers.adults < 1) {
      throw new Error('At least one adult passenger is required');
    }
  }
  
  private static async fetchCurrentPrice(alert: PriceAlert): Promise<number> {
    // Mock implementation - in production, this would integrate with actual flight APIs
    // Generate a realistic price with some randomness
    const basePrice = alert.targetPrice * (0.8 + Math.random() * 0.4); // ±20% of target price
    const variation = basePrice * (Math.random() * 0.1 - 0.05); // ±5% random variation
    
    return Math.max(50, Math.round(basePrice + variation)); // Minimum $50
  }
  
  private static shouldTriggerAlert(
    alert: PriceAlert, 
    currentPrice: number, 
    previousPrice?: number
  ): boolean {
    switch (alert.alertType) {
      case 'price-below':
        return currentPrice <= alert.targetPrice;
      
      case 'price-above':
        return currentPrice >= alert.targetPrice;
      
      case 'price-drop':
        return previousPrice !== undefined && currentPrice < previousPrice;
      
      default:
        return false;
    }
  }
  
  private static async triggerAlert(alert: PriceAlert, priceEntry: PriceHistoryEntry): Promise<void> {
    try {
      // Send comprehensive notification using NotificationService
      await NotificationService.sendPriceAlertNotification(
        alert.userId,
        alert,
        priceEntry.price,
        priceEntry.price - priceEntry.change // Previous price
      );
      
      console.log(`✅ Alert triggered and notifications sent for user ${alert.userId}:`, {
        alertId: alert.id,
        route: `${alert.origin} → ${alert.destination}`,
        currentPrice: priceEntry.price,
        targetPrice: alert.targetPrice,
        change: priceEntry.change,
        changePercent: priceEntry.changePercent
      });
    } catch (error) {
      console.error(`❌ Failed to send notifications for alert ${alert.id}:`, error);
    }
  }
  
  private static isNotExpired(alert: PriceAlert): boolean {
    if (!alert.expiresAt) {
      return true;
    }
    
    return new Date(alert.expiresAt) > new Date();
  }
  
  private static startMonitoring(alert: PriceAlert): void {
    // Mock monitoring start - in production, this would add the alert to a monitoring queue
    console.log(`Started monitoring alert ${alert.id} for ${alert.origin} → ${alert.destination}`);
  }
  
  // Get price alert statistics for a user
  static async getUserAlertStats(userId: string): Promise<{
    total: number;
    active: number;
    triggered: number;
    avgSavings: number;
  }> {
    const userAlertIds = userAlerts.get(userId) || [];
    const userAlertsList = userAlertIds
      .map(id => priceAlerts.get(id))
      .filter(alert => alert !== undefined) as PriceAlert[];
    
    const total = userAlertsList.length;
    const active = userAlertsList.filter(alert => alert.isActive).length;
    
    // Mock triggered count and savings calculation
    const triggered = userAlertsList.filter(alert => 
      alert.currentPrice && alert.currentPrice <= alert.targetPrice
    ).length;
    
    const totalSavings = userAlertsList.reduce((sum, alert) => {
      if (alert.currentPrice && alert.currentPrice < alert.targetPrice) {
        return sum + (alert.targetPrice - alert.currentPrice);
      }
      return sum;
    }, 0);
    
    const avgSavings = triggered > 0 ? totalSavings / triggered : 0;
    
    return {
      total,
      active,
      triggered,
      avgSavings
    };
  }
}