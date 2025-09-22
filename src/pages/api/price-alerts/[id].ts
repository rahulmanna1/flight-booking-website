import { NextApiRequest, NextApiResponse } from 'next';
import { PriceAlertService } from '@/services/PriceAlertService';
import { verifyAuth } from '@/lib/auth';
import { 
  UpdatePriceAlertRequest,
  PriceAlertResponse,
  DeletePriceAlertResponse
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

    const alertId = req.query.id as string;
    if (!alertId) {
      return res.status(400).json({ success: false, error: 'Alert ID is required' });
    }

    switch (req.method) {
      case 'GET':
        return handleGetPriceAlert(req, res, decoded.userId, alertId);
      
      case 'PUT':
        return handleUpdatePriceAlert(req, res, decoded.userId, alertId);
      
      case 'DELETE':
        return handleDeletePriceAlert(req, res, decoded.userId, alertId);
      
      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        return res.status(405).json({ 
          success: false, 
          error: `Method ${req.method} not allowed` 
        });
    }
  } catch (error) {
    console.error('Price alert API error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
}

async function handleGetPriceAlert(
  req: NextApiRequest, 
  res: NextApiResponse<PriceAlertResponse>, 
  userId: string,
  alertId: string
) {
  try {
    const priceAlert = await PriceAlertService.getPriceAlert(userId, alertId);
    
    if (!priceAlert) {
      return res.status(404).json({
        success: false,
        error: 'Price alert not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      data: priceAlert
    });
  } catch (error) {
    console.error('Error fetching price alert:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch price alert'
    });
  }
}

async function handleUpdatePriceAlert(
  req: NextApiRequest, 
  res: NextApiResponse<PriceAlertResponse>, 
  userId: string,
  alertId: string
) {
  try {
    const {
      targetPrice,
      alertType,
      frequency,
      emailNotifications,
      pushNotifications,
      isActive,
      expiresAt
    } = req.body as UpdatePriceAlertRequest;

    // Validate targetPrice if provided
    if (targetPrice !== undefined && targetPrice <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Target price must be greater than 0'
      });
    }

    const updatedAlert = await PriceAlertService.updatePriceAlert(userId, alertId, {
      targetPrice,
      alertType,
      frequency,
      emailNotifications,
      pushNotifications,
      isActive,
      expiresAt
    });
    
    if (!updatedAlert) {
      return res.status(404).json({
        success: false,
        error: 'Price alert not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      data: updatedAlert
    });
  } catch (error) {
    console.error('Error updating price alert:', error);
    
    if (error instanceof Error) {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }
    
    return res.status(500).json({
      success: false,
      error: 'Failed to update price alert'
    });
  }
}

async function handleDeletePriceAlert(
  req: NextApiRequest, 
  res: NextApiResponse<DeletePriceAlertResponse>, 
  userId: string,
  alertId: string
) {
  try {
    const deleted = await PriceAlertService.deletePriceAlert(userId, alertId);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Price alert not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      message: 'Price alert deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting price alert:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to delete price alert'
    });
  }
}