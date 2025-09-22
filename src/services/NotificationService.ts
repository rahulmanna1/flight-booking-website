import { PriceAlert, PriceAlertNotification } from '@/types/priceAlert';

// Mock notifications storage - in production this would be a real database
const notifications: Map<string, PriceAlertNotification[]> = new Map();

export interface EmailNotificationConfig {
  to: string;
  subject: string;
  htmlContent: string;
  textContent: string;
}

export interface PushNotificationConfig {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  data?: any;
}

export class NotificationService {
  // Send email notification (mock implementation)
  static async sendEmailNotification(config: EmailNotificationConfig): Promise<boolean> {
    // In production, this would integrate with services like:
    // - SendGrid
    // - Amazon SES
    // - Mailgun
    // - Nodemailer with SMTP
    
    console.log('📧 Email notification sent:', {
      to: config.to,
      subject: config.subject,
      timestamp: new Date().toISOString()
    });
    
    // Mock success (in production, return actual send result)
    return true;
  }

  // Send push notification (mock implementation)
  static async sendPushNotification(userId: string, config: PushNotificationConfig): Promise<boolean> {
    // In production, this would integrate with:
    // - Firebase Cloud Messaging (FCM)
    // - Apple Push Notification Service (APNS)
    // - Web Push API
    
    console.log('📱 Push notification sent:', {
      userId,
      title: config.title,
      body: config.body,
      timestamp: new Date().toISOString()
    });
    
    // Mock success
    return true;
  }

  // Create and store in-app notification
  static async createInAppNotification(
    userId: string, 
    priceAlert: PriceAlert, 
    notificationType: 'price-drop' | 'target-reached' | 'price-increase',
    currentPrice: number,
    previousPrice?: number
  ): Promise<PriceAlertNotification> {
    const notificationId = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const changeAmount = previousPrice ? currentPrice - previousPrice : 0;
    const changePercent = previousPrice ? ((currentPrice - previousPrice) / previousPrice) * 100 : 0;
    
    let message = '';
    switch (notificationType) {
      case 'price-drop':
        message = `Price dropped ${Math.abs(changePercent).toFixed(1)}% for ${priceAlert.origin} → ${priceAlert.destination}`;
        break;
      case 'target-reached':
        message = `Target price reached for ${priceAlert.origin} → ${priceAlert.destination}`;
        break;
      case 'price-increase':
        message = `Price increased ${changePercent.toFixed(1)}% for ${priceAlert.origin} → ${priceAlert.destination}`;
        break;
    }

    const notification: PriceAlertNotification = {
      id: notificationId,
      priceAlertId: priceAlert.id,
      type: notificationType,
      previousPrice: previousPrice || currentPrice,
      currentPrice,
      changeAmount,
      changePercent,
      message,
      sentAt: new Date().toISOString()
    };

    // Store notification
    const userNotifications = notifications.get(userId) || [];
    userNotifications.unshift(notification); // Add to beginning
    
    // Keep only last 100 notifications per user
    if (userNotifications.length > 100) {
      userNotifications.splice(100);
    }
    
    notifications.set(userId, userNotifications);
    
    return notification;
  }

  // Get user notifications
  static async getUserNotifications(
    userId: string, 
    limit: number = 20, 
    offset: number = 0
  ): Promise<{ notifications: PriceAlertNotification[], total: number, hasMore: boolean }> {
    const userNotifications = notifications.get(userId) || [];
    const total = userNotifications.length;
    const paginatedNotifications = userNotifications.slice(offset, offset + limit);
    const hasMore = offset + limit < total;
    
    return {
      notifications: paginatedNotifications,
      total,
      hasMore
    };
  }

  // Mark notification as read
  static async markNotificationAsRead(userId: string, notificationId: string): Promise<boolean> {
    const userNotifications = notifications.get(userId) || [];
    const notification = userNotifications.find(n => n.id === notificationId);
    
    if (notification) {
      notification.readAt = new Date().toISOString();
      return true;
    }
    
    return false;
  }

  // Mark all notifications as read
  static async markAllNotificationsAsRead(userId: string): Promise<boolean> {
    const userNotifications = notifications.get(userId) || [];
    const now = new Date().toISOString();
    
    userNotifications.forEach(notification => {
      if (!notification.readAt) {
        notification.readAt = now;
      }
    });
    
    return true;
  }

  // Delete notification
  static async deleteNotification(userId: string, notificationId: string): Promise<boolean> {
    const userNotifications = notifications.get(userId) || [];
    const index = userNotifications.findIndex(n => n.id === notificationId);
    
    if (index !== -1) {
      userNotifications.splice(index, 1);
      return true;
    }
    
    return false;
  }

  // Send comprehensive notification for price alert trigger
  static async sendPriceAlertNotification(
    userId: string,
    priceAlert: PriceAlert,
    currentPrice: number,
    previousPrice?: number
  ): Promise<void> {
    try {
      // Determine notification type
      let notificationType: 'price-drop' | 'target-reached' | 'price-increase';
      
      if (priceAlert.alertType === 'price-below' && currentPrice <= priceAlert.targetPrice) {
        notificationType = 'target-reached';
      } else if (priceAlert.alertType === 'price-above' && currentPrice >= priceAlert.targetPrice) {
        notificationType = 'target-reached';
      } else if (previousPrice && currentPrice < previousPrice) {
        notificationType = 'price-drop';
      } else {
        notificationType = 'price-increase';
      }

      // Create in-app notification
      const inAppNotification = await this.createInAppNotification(
        userId,
        priceAlert,
        notificationType,
        currentPrice,
        previousPrice
      );

      // Send email notification if enabled
      if (priceAlert.emailNotifications) {
        const emailConfig = this.createEmailNotificationConfig(priceAlert, currentPrice, previousPrice);
        await this.sendEmailNotification(emailConfig);
      }

      // Send push notification if enabled
      if (priceAlert.pushNotifications) {
        const pushConfig = this.createPushNotificationConfig(priceAlert, currentPrice, previousPrice);
        await this.sendPushNotification(userId, pushConfig);
      }

      console.log('✅ Price alert notification sent successfully:', {
        userId,
        alertId: priceAlert.id,
        type: notificationType,
        currentPrice,
        previousPrice
      });

    } catch (error) {
      console.error('❌ Failed to send price alert notification:', error);
      throw error;
    }
  }

  // Create email notification configuration
  private static createEmailNotificationConfig(
    priceAlert: PriceAlert,
    currentPrice: number,
    previousPrice?: number
  ): EmailNotificationConfig {
    const route = `${priceAlert.origin} → ${priceAlert.destination}`;
    const formatPrice = (price: number) => new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: priceAlert.currency
    }).format(price);

    const currentPriceFormatted = formatPrice(currentPrice);
    const targetPriceFormatted = formatPrice(priceAlert.targetPrice);
    
    let subject = '';
    let bodyContent = '';

    if (priceAlert.alertType === 'price-below' && currentPrice <= priceAlert.targetPrice) {
      subject = `🎉 Price Alert: ${route} is now ${currentPriceFormatted}!`;
      bodyContent = `Great news! The price for your flight from ${priceAlert.origin} to ${priceAlert.destination} has dropped to ${currentPriceFormatted}, which is at or below your target price of ${targetPriceFormatted}.`;
    } else if (previousPrice && currentPrice < previousPrice) {
      const savings = previousPrice - currentPrice;
      const savingsFormatted = formatPrice(savings);
      subject = `📉 Price Drop Alert: Save ${savingsFormatted} on ${route}`;
      bodyContent = `The price for your flight from ${priceAlert.origin} to ${priceAlert.destination} has dropped by ${savingsFormatted} to ${currentPriceFormatted}.`;
    } else {
      subject = `🔔 Price Update: ${route} is now ${currentPriceFormatted}`;
      bodyContent = `The price for your flight from ${priceAlert.origin} to ${priceAlert.destination} has been updated to ${currentPriceFormatted}.`;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>FlightBooker Price Alert</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2563eb;">✈️ FlightBooker</h1>
            </div>
            
            <div style="background: #f8fafc; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
              <h2 style="color: #1f2937; margin-top: 0;">${subject}</h2>
              <p>${bodyContent}</p>
            </div>
            
            <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px;">
              <h3 style="margin-top: 0; color: #1f2937;">Flight Details</h3>
              <table style="width: 100%;">
                <tr>
                  <td style="padding: 8px 0;"><strong>Route:</strong></td>
                  <td style="padding: 8px 0;">${route}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;"><strong>Departure:</strong></td>
                  <td style="padding: 8px 0;">${new Date(priceAlert.departureDate).toLocaleDateString()}</td>
                </tr>
                ${priceAlert.returnDate ? `
                <tr>
                  <td style="padding: 8px 0;"><strong>Return:</strong></td>
                  <td style="padding: 8px 0;">${new Date(priceAlert.returnDate).toLocaleDateString()}</td>
                </tr>
                ` : ''}
                <tr>
                  <td style="padding: 8px 0;"><strong>Current Price:</strong></td>
                  <td style="padding: 8px 0; font-size: 18px; font-weight: bold; color: #059669;">${currentPriceFormatted}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;"><strong>Target Price:</strong></td>
                  <td style="padding: 8px 0;">${targetPriceFormatted}</td>
                </tr>
              </table>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/search" 
                 style="display: inline-block; background: #2563eb; color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold;">
                Book This Flight
              </a>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 14px;">
              <p>This alert was sent because you set up a price alert for this route.</p>
              <p>
                <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/price-alerts" style="color: #2563eb;">Manage your alerts</a>
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    const textContent = `
      ${subject}
      
      ${bodyContent}
      
      Flight Details:
      Route: ${route}
      Departure: ${new Date(priceAlert.departureDate).toLocaleDateString()}
      ${priceAlert.returnDate ? `Return: ${new Date(priceAlert.returnDate).toLocaleDateString()}` : ''}
      Current Price: ${currentPriceFormatted}
      Target Price: ${targetPriceFormatted}
      
      Book this flight: ${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/search
      Manage your alerts: ${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/price-alerts
      
      This alert was sent because you set up a price alert for this route.
    `;

    return {
      to: priceAlert.userId, // In production, this would be the user's email
      subject,
      htmlContent,
      textContent
    };
  }

  // Create push notification configuration
  private static createPushNotificationConfig(
    priceAlert: PriceAlert,
    currentPrice: number,
    previousPrice?: number
  ): PushNotificationConfig {
    const route = `${priceAlert.origin} → ${priceAlert.destination}`;
    const formatPrice = (price: number) => new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: priceAlert.currency
    }).format(price);

    const currentPriceFormatted = formatPrice(currentPrice);
    
    let title = '';
    let body = '';

    if (priceAlert.alertType === 'price-below' && currentPrice <= priceAlert.targetPrice) {
      title = '🎉 Price Alert!';
      body = `${route} is now ${currentPriceFormatted}!`;
    } else if (previousPrice && currentPrice < previousPrice) {
      title = '📉 Price Drop!';
      body = `${route} dropped to ${currentPriceFormatted}`;
    } else {
      title = '🔔 Price Update';
      body = `${route} is now ${currentPriceFormatted}`;
    }

    return {
      title,
      body,
      icon: '/icons/flight-icon.png',
      badge: '/icons/badge-icon.png',
      data: {
        priceAlertId: priceAlert.id,
        url: '/price-alerts'
      }
    };
  }
}