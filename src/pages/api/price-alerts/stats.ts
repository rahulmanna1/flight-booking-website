import { NextApiRequest, NextApiResponse } from 'next';
import { PriceAlertService } from '@/services/PriceAlertService';
import { verifyAuth } from '@/lib/auth';

interface PriceAlertStatsResponse {
  success: boolean;
  data?: {
    total: number;
    active: number;
    triggered: number;
    avgSavings: number;
  };
  error?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<PriceAlertStatsResponse>) {
  try {
    // Only allow GET method
    if (req.method !== 'GET') {
      res.setHeader('Allow', ['GET']);
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

    const stats = await PriceAlertService.getUserAlertStats(decoded.userId);
    
    return res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching price alert stats:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch price alert statistics'
    });
  }
}