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

    const notificationId = req.query.id as string;
    if (!notificationId) {
      return res.status(400).json({ success: false, error: 'Notification ID is required' });
    }

    switch (req.method) {
      case 'PUT':
        return handleMarkAsRead(req, res, decoded.userId, notificationId);
      
      case 'DELETE':
        return handleDeleteNotification(req, res, decoded.userId, notificationId);
      
      default:
        res.setHeader('Allow', ['PUT', 'DELETE']);
        return res.status(405).json({ 
          success: false, 
          error: `Method ${req.method} not allowed` 
        });
    }
  } catch (error) {
    console.error('Notification API error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
}

async function handleMarkAsRead(
  req: NextApiRequest, 
  res: NextApiResponse, 
  userId: string,
  notificationId: string
) {
  try {
    const success = await NotificationService.markNotificationAsRead(userId, notificationId);
    
    if (success) {
      return res.status(200).json({
        success: true,
        message: 'Notification marked as read'
      });
    } else {
      return res.status(404).json({
        success: false,
        error: 'Notification not found'
      });
    }
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to mark notification as read'
    });
  }
}

async function handleDeleteNotification(
  req: NextApiRequest, 
  res: NextApiResponse, 
  userId: string,
  notificationId: string
) {
  try {
    const success = await NotificationService.deleteNotification(userId, notificationId);
    
    if (success) {
      return res.status(200).json({
        success: true,
        message: 'Notification deleted successfully'
      });
    } else {
      return res.status(404).json({
        success: false,
        error: 'Notification not found'
      });
    }
  } catch (error) {
    console.error('Error deleting notification:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to delete notification'
    });
  }
}