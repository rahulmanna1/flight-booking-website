import { NextApiRequest, NextApiResponse } from 'next';
import { verifyAuth } from '@/lib/auth';
import { NotificationService } from '@/services/NotificationService';

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
        return handleGetNotifications(req, res, decoded.userId);
      
      case 'PUT':
        return handleMarkAllAsRead(req, res, decoded.userId);
      
      default:
        res.setHeader('Allow', ['GET', 'PUT']);
        return res.status(405).json({ 
          success: false, 
          error: `Method ${req.method} not allowed` 
        });
    }
  } catch (error) {
    console.error('Notifications API error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
}

async function handleGetNotifications(
  req: NextApiRequest, 
  res: NextApiResponse, 
  userId: string
) {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
    const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;

    const result = await NotificationService.getUserNotifications(userId, limit, offset);
    
    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch notifications'
    });
  }
}

async function handleMarkAllAsRead(
  req: NextApiRequest, 
  res: NextApiResponse, 
  userId: string
) {
  try {
    const success = await NotificationService.markAllNotificationsAsRead(userId);
    
    if (success) {
      return res.status(200).json({
        success: true,
        message: 'All notifications marked as read'
      });
    } else {
      return res.status(400).json({
        success: false,
        error: 'Failed to mark notifications as read'
      });
    }
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to mark notifications as read'
    });
  }
}