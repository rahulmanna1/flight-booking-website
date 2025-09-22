import { NextApiRequest, NextApiResponse } from 'next';
import { PriceAlertService } from '@/services/PriceAlertService';
import { verifyAuth } from '@/lib/auth';
import { 
  CreatePriceAlertRequest, 
  PriceAlertFilters,
  PriceAlertResponse,
  PriceAlertsListResponse
} from '@/types/priceAlert';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Verify authentication
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    const decoded = verifyAuth(token);
    if (!decoded) {
      return res.status(401).json({ success: false, error: 'Invalid token' });
    }

    switch (req.method) {
      case 'GET':
        return handleGetPriceAlerts(req, res, decoded.userId);
      
      case 'POST':
        return handleCreatePriceAlert(req, res, decoded.userId);
      
      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({ 
          success: false, 
          error: `Method ${req.method} not allowed` 
        });
    }
  } catch (error) {
    console.error('Price alerts API error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
}

async function handleGetPriceAlerts(
  req: NextApiRequest, 
  res: NextApiResponse<PriceAlertsListResponse>, 
  userId: string
) {
  try {
    const filters: PriceAlertFilters = {
      isActive: req.query.isActive ? req.query.isActive === 'true' : undefined,
      origin: req.query.origin as string,
      destination: req.query.destination as string,
      tripType: req.query.tripType as 'one-way' | 'round-trip',
      alertType: req.query.alertType as 'price-drop' | 'price-below' | 'price-above',
      sortBy: req.query.sortBy as 'createdAt' | 'targetPrice' | 'currentPrice' | 'departureDate',
      sortOrder: req.query.sortOrder as 'asc' | 'desc',
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      offset: req.query.offset ? parseInt(req.query.offset as string) : undefined
    };

    const result = await PriceAlertService.getUserPriceAlerts(userId, filters);
    
    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error fetching price alerts:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch price alerts'
    });
  }
}

async function handleCreatePriceAlert(
  req: NextApiRequest, 
  res: NextApiResponse<PriceAlertResponse>, 
  userId: string
) {
  try {
    const {
      origin,
      destination,
      departureDate,
      returnDate,
      tripType,
      passengers,
      cabinClass,
      targetPrice,
      currency,
      alertType,
      frequency,
      emailNotifications,
      pushNotifications,
      expiresAt
    } = req.body as CreatePriceAlertRequest;

    // Basic validation
    if (!origin || !destination || !departureDate || !targetPrice || !alertType) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: origin, destination, departureDate, targetPrice, alertType'
      });
    }

    if (targetPrice <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Target price must be greater than 0'
      });
    }

    if (new Date(departureDate) < new Date()) {
      return res.status(400).json({
        success: false,
        error: 'Departure date cannot be in the past'
      });
    }

    const alertRequest: CreatePriceAlertRequest = {
      origin,
      destination,
      departureDate,
      returnDate,
      tripType: tripType || 'one-way',
      passengers: passengers || { adults: 1, children: 0, infants: 0 },
      cabinClass: cabinClass || 'economy',
      targetPrice,
      currency: currency || 'USD',
      alertType,
      frequency: frequency || 'daily',
      emailNotifications: emailNotifications !== false, // Default to true
      pushNotifications: pushNotifications !== false, // Default to true
      expiresAt
    };

    const priceAlert = await PriceAlertService.createPriceAlert(userId, alertRequest);
    
    return res.status(201).json({
      success: true,
      data: priceAlert
    });
  } catch (error) {
    console.error('Error creating price alert:', error);
    
    if (error instanceof Error) {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }
    
    return res.status(500).json({
      success: false,
      error: 'Failed to create price alert'
    });
  }
}