import { NextApiRequest, NextApiResponse } from 'next';
import { PriceAlertService } from '@/services/PriceAlertService';
import { verifyAuth } from '@/lib/auth';
import { PriceAlertResponse } from '@/types/priceAlert';

export default async function handler(req: NextApiRequest, res: NextApiResponse<PriceAlertResponse>) {
  try {
    // Only allow POST method
    if (req.method !== 'POST') {
      res.setHeader('Allow', ['POST']);
      return res.status(405).json({ 
        success: false, 
        error: `Method ${req.method} not allowed` 
      });
    }

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

    const updatedAlert = await PriceAlertService.togglePriceAlert(decoded.userId, alertId);
    
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
    console.error('Error toggling price alert:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to toggle price alert'
    });
  }
}