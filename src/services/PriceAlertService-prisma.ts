import { 
  PriceAlert, 
  CreatePriceAlertRequest, 
  UpdatePriceAlertRequest, 
  PriceAlertFilters,
  PriceHistoryEntry
} from '@/types/priceAlert';
import { prisma } from '@/lib/prisma';
import { NotificationService } from './NotificationService';

// Convert Prisma PriceAlert to API format
function formatPriceAlertForAPI(prismaPriceAlert: any): PriceAlert {
  return {
    id: prismaPriceAlert.id,
    userId: prismaPriceAlert.userId,
    origin: prismaPriceAlert.origin,
    destination: prismaPriceAlert.destination,
    departureDate: prismaPriceAlert.departureDate,
    returnDate: prismaPriceAlert.returnDate,
    tripType: prismaPriceAlert.tripType === 'ONE_WAY' ? 'one-way' : 'round-trip',
    passengers: JSON.parse(prismaPriceAlert.passengers),
    cabinClass: prismaPriceAlert.cabinClass.toLowerCase().replace('_', '-') as any,
    targetPrice: prismaPriceAlert.targetPrice,
    currency: prismaPriceAlert.currency,
    currentPrice: prismaPriceAlert.currentPrice,
    isActive: prismaPriceAlert.isActive,
    alertType: prismaPriceAlert.alertType.toLowerCase().replace('_', '-') as any,
    frequency: prismaPriceAlert.frequency.toLowerCase() as any,
    emailNotifications: prismaPriceAlert.emailNotifications,
    pushNotifications: prismaPriceAlert.pushNotifications,
    lastChecked: prismaPriceAlert.lastChecked?.toISOString(),
    priceHistory: JSON.parse(prismaPriceAlert.priceHistory),
    createdAt: prismaPriceAlert.createdAt.toISOString(),
    updatedAt: prismaPriceAlert.updatedAt.toISOString(),
    expiresAt: prismaPriceAlert.expiresAt?.toISOString(),
  };
}

// Convert API format to Prisma format
function formatPriceAlertForPrisma(request: CreatePriceAlertRequest) {
  return {
    origin: request.origin,
    destination: request.destination,
    departureDate: request.departureDate,
    returnDate: request.returnDate,
    tripType: request.tripType === 'one-way' ? 'ONE_WAY' as const : 'ROUND_TRIP' as const,
    passengers: JSON.stringify(request.passengers),
    cabinClass: request.cabinClass.toUpperCase().replace('-', '_') as any,
    targetPrice: request.targetPrice,
    currency: request.currency,
    alertType: request.alertType.toUpperCase().replace('-', '_') as any,
    frequency: request.frequency.toUpperCase() as any,
    emailNotifications: request.emailNotifications,
    pushNotifications: request.pushNotifications,
    priceHistory: JSON.stringify([]),
    expiresAt: request.expiresAt ? new Date(request.expiresAt) : null,
  };
}

export class PrismaPriceAlertService {
  // Create a new price alert
  static async createPriceAlert(userId: string, request: CreatePriceAlertRequest): Promise<PriceAlert> {
    this.validateCreateRequest(request);
    
    try {
      const prismaPriceAlert = await prisma.priceAlert.create({
        data: {
          userId,
          ...formatPriceAlertForPrisma(request),
        } as any,
      });
      
      const priceAlert = formatPriceAlertForAPI(prismaPriceAlert);
      
      // Start monitoring this alert
      this.startMonitoring(priceAlert);
      
      return priceAlert;
    } catch (error) {
      console.error('Error creating price alert:', error);
      throw new Error('Failed to create price alert');
    }
  }
  
  // Get all price alerts for a user
  static async getUserPriceAlerts(
    userId: string, 
    filters: PriceAlertFilters = {}
  ): Promise<{ alerts: PriceAlert[], total: number, hasMore: boolean }> {
    try {
      // Build where clause
      const where: any = { userId };
      
      if (filters.isActive !== undefined) {
        where.isActive = filters.isActive;
      }
      
      if (filters.origin) {
        where.origin = { contains: filters.origin, mode: 'insensitive' };
      }
      
      if (filters.destination) {
        where.destination = { contains: filters.destination, mode: 'insensitive' };
      }
      
      if (filters.tripType) {
        where.tripType = filters.tripType === 'one-way' ? 'ONE_WAY' : 'ROUND_TRIP';
      }
      
      if (filters.alertType) {
        where.alertType = filters.alertType.toUpperCase().replace('-', '_');
      }
      
      // Build order by clause
      const orderBy: any = {};
      const sortBy = filters.sortBy || 'createdAt';
      const sortOrder = filters.sortOrder || 'desc';
      
      switch (sortBy) {
        case 'targetPrice':
          orderBy.targetPrice = sortOrder;
          break;
        case 'currentPrice':
          orderBy.currentPrice = sortOrder;
          break;
        case 'departureDate':
          orderBy.departureDate = sortOrder;
          break;
        default:
          orderBy.createdAt = sortOrder;
      }
      
      // Pagination
      const limit = filters.limit || 20;
      const offset = filters.offset || 0;
      
      // Get alerts and count
      const [prismaPriceAlerts, total] = await Promise.all([
        prisma.priceAlert.findMany({
          where,
          orderBy,
          take: limit,
          skip: offset,
        }),
        prisma.priceAlert.count({ where }),
      ]);
      
      const alerts = prismaPriceAlerts.map(formatPriceAlertForAPI);
      const hasMore = offset + limit < total;
      
      return {
        alerts,
        total,
        hasMore
      };
    } catch (error) {
      console.error('Error fetching user price alerts:', error);
      return { alerts: [], total: 0, hasMore: false };
    }
  }
  
  // Get a specific price alert
  static async getPriceAlert(userId: string, alertId: string): Promise<PriceAlert | null> {
    try {
      const prismaPriceAlert = await prisma.priceAlert.findFirst({
        where: {
          id: alertId,
          userId,
        },
      });
      
      if (!prismaPriceAlert) {
        return null;
      }
      
      return formatPriceAlertForAPI(prismaPriceAlert);
    } catch (error) {
      console.error('Error fetching price alert:', error);
      return null;
    }
  }
  
  // Update a price alert
  static async updatePriceAlert(
    userId: string, 
    alertId: string, 
    updates: UpdatePriceAlertRequest
  ): Promise<PriceAlert | null> {
    try {
      // Validate updates
      if (updates.targetPrice !== undefined && updates.targetPrice <= 0) {
        throw new Error('Target price must be greater than 0');
      }
      
      // Prepare update data
      const updateData: any = {};
      
      if (updates.targetPrice !== undefined) updateData.targetPrice = updates.targetPrice;
      if (updates.alertType !== undefined) updateData.alertType = updates.alertType.toUpperCase().replace('-', '_');
      if (updates.frequency !== undefined) updateData.frequency = updates.frequency.toUpperCase();
      if (updates.emailNotifications !== undefined) updateData.emailNotifications = updates.emailNotifications;
      if (updates.pushNotifications !== undefined) updateData.pushNotifications = updates.pushNotifications;
      if (updates.isActive !== undefined) updateData.isActive = updates.isActive;
      if (updates.expiresAt !== undefined) updateData.expiresAt = updates.expiresAt ? new Date(updates.expiresAt) : null;
      
      const updatedPrismaPriceAlert = await prisma.priceAlert.update({
        where: {
          id: alertId,
          userId,
        },
        data: updateData,
      });
      
      return formatPriceAlertForAPI(updatedPrismaPriceAlert);
    } catch (error) {
      console.error('Error updating price alert:', error);
      return null;
    }
  }
  
  // Delete a price alert
  static async deletePriceAlert(userId: string, alertId: string): Promise<boolean> {
    try {
      await prisma.priceAlert.delete({
        where: {
          id: alertId,
          userId,
        },
      });
      
      return true;
    } catch (error) {
      console.error('Error deleting price alert:', error);
      return false;
    }
  }
  
  // Toggle alert active status
  static async togglePriceAlert(userId: string, alertId: string): Promise<PriceAlert | null> {
    try {
      const prismaPriceAlert = await prisma.priceAlert.findFirst({
        where: {
          id: alertId,
          userId,
        },
      });
      
      if (!prismaPriceAlert) {
        return null;
      }
      
      const updatedPrismaPriceAlert = await prisma.priceAlert.update({
        where: { id: alertId },
        data: { isActive: !prismaPriceAlert.isActive },
      });
      
      return formatPriceAlertForAPI(updatedPrismaPriceAlert);
    } catch (error) {
      console.error('Error toggling price alert:', error);
      return null;
    }
  }
  
  // Get alert statistics for a user
  static async getUserAlertStats(userId: string) {
    try {
      const [totalAlerts, activeAlerts, triggeredAlertsCount] = await Promise.all([
        prisma.priceAlert.count({ where: { userId } }),
        prisma.priceAlert.count({ where: { userId, isActive: true } }),
        prisma.notification.count({ where: { userId, type: { in: ['PRICE_DROP', 'TARGET_REACHED'] } } }),
      ]);
      
      return {
        total: totalAlerts,
        active: activeAlerts,
        inactive: totalAlerts - activeAlerts,
        triggered: triggeredAlertsCount,
      };
    } catch (error) {
      console.error('Error fetching user alert stats:', error);
      return {
        total: 0,
        active: 0,
        inactive: 0,
        triggered: 0,
      };
    }
  }
  
  // Mock price monitoring function
  static startMonitoring(priceAlert: PriceAlert): void {
    // In a real application, this would start a background job to monitor prices
    console.log(`Started monitoring price alert ${priceAlert.id} for ${priceAlert.origin} → ${priceAlert.destination}`);
  }
  
  // Mock current price fetching
  static async getCurrentPrice(priceAlert: PriceAlert): Promise<number> {
    // In a real application, this would fetch current prices from flight APIs
    // For demo purposes, return a random price around the target
    const variation = (Math.random() - 0.5) * 100; // ±$50 variation
    return Math.max(50, priceAlert.targetPrice + variation);
  }
  
  // Process price alerts (called by background job)
  static async processPriceAlerts(): Promise<void> {
    try {
      const activeAlerts = await prisma.priceAlert.findMany({
        where: {
          isActive: true,
          OR: [
            { expiresAt: null },
            { expiresAt: { gt: new Date() } }
          ]
        },
      });
      
      for (const prismaPriceAlert of activeAlerts) {
        const priceAlert = formatPriceAlertForAPI(prismaPriceAlert);
        await this.checkAlertPrice(priceAlert);
      }
    } catch (error) {
      console.error('Error processing price alerts:', error);
    }
  }
  
  // Check price for a single alert
  static async checkAlertPrice(priceAlert: PriceAlert): Promise<void> {
    try {
      const currentPrice = await this.getCurrentPrice(priceAlert);
      const previousPrice = priceAlert.currentPrice || priceAlert.targetPrice;
      
      // Update current price
      await prisma.priceAlert.update({
        where: { id: priceAlert.id },
        data: {
          currentPrice,
          lastChecked: new Date(),
          priceHistory: JSON.stringify([
            ...(Array.isArray(priceAlert.priceHistory) ? priceAlert.priceHistory : JSON.parse(priceAlert.priceHistory || '[]')).slice(-29), // Keep last 29 entries
            {
              date: new Date().toISOString(),
              price: currentPrice,
              change: currentPrice - previousPrice,
              changePercent: ((currentPrice - previousPrice) / previousPrice) * 100,
            } as PriceHistoryEntry
          ])
        }
      });
      
      // Check if alert conditions are met
      let shouldNotify = false;
      let notificationType: 'PRICE_DROP' | 'TARGET_REACHED' | 'PRICE_INCREASE' = 'PRICE_DROP';
      
      switch (priceAlert.alertType) {
        case 'price-below':
          if (currentPrice <= priceAlert.targetPrice) {
            shouldNotify = true;
            notificationType = 'TARGET_REACHED';
          }
          break;
        case 'price-above':
          if (currentPrice >= priceAlert.targetPrice) {
            shouldNotify = true;
            notificationType = 'PRICE_INCREASE';
          }
          break;
        case 'price-drop':
          if (currentPrice < previousPrice) {
            shouldNotify = true;
            notificationType = 'PRICE_DROP';
          }
          break;
      }
      
      if (shouldNotify) {
        // Send price alert notification (if NotificationService.sendPriceAlert exists)
        console.log('🔔 Price alert triggered:', {
          id: `price_${Date.now()}`,
          priceAlertId: priceAlert.id,
          type: notificationType,
          previousPrice,
          currentPrice,
          changeAmount: currentPrice - previousPrice,
          changePercent: ((currentPrice - previousPrice) / previousPrice) * 100,
          message: `Price alert for ${priceAlert.origin} → ${priceAlert.destination}: $${currentPrice}`,
          sentAt: new Date().toISOString(),
        });
        // await NotificationService.sendPriceAlert(alertData, priceAlert.userId);
      }
    } catch (error) {
      console.error('Error checking alert price:', error);
    }
  }
  
  // Validation helper
  private static validateCreateRequest(request: CreatePriceAlertRequest): void {
    if (!request.origin || !request.destination) {
      throw new Error('Origin and destination are required');
    }
    
    if (!request.departureDate) {
      throw new Error('Departure date is required');
    }
    
    if (request.tripType === 'round-trip' && !request.returnDate) {
      throw new Error('Return date is required for round-trip alerts');
    }
    
    if (request.targetPrice <= 0) {
      throw new Error('Target price must be greater than 0');
    }
    
    if (!request.passengers.adults || request.passengers.adults < 1) {
      throw new Error('At least one adult passenger is required');
    }
    
    // Validate departure date is in the future
    const departureDate = new Date(request.departureDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (departureDate < today) {
      throw new Error('Departure date must be in the future');
    }
    
    // Validate return date if provided
    if (request.returnDate) {
      const returnDate = new Date(request.returnDate);
      if (returnDate <= departureDate) {
        throw new Error('Return date must be after departure date');
      }
    }
  }
}