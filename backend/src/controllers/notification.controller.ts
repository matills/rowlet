import { Request, Response } from 'express';
import { notificationService } from '../services/notification.service';
import logger from '../config/logger';

export class NotificationController {
  async getNotifications(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;
      const is_read = req.query.is_read === 'true' ? true : req.query.is_read === 'false' ? false : undefined;
      const type = req.query.type as string | undefined;

      const result = await notificationService.getNotifications(userId, {
        limit,
        offset,
        is_read,
        type: type as any,
      });

      res.status(200).json({
        success: true,
        data: result.notifications,
        pagination: {
          limit,
          offset,
          total: result.total,
        },
      });
    } catch (error: any) {
      logger.error('[NotificationController] Error getting notifications:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to fetch notifications',
      });
    }
  }

  async getUnreadCount(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const count = await notificationService.getUnreadCount(userId);

      res.status(200).json({
        success: true,
        data: { count },
      });
    } catch (error: any) {
      logger.error('[NotificationController] Error getting unread count:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to get unread count',
      });
    }
  }

  async markAsRead(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const notificationId = req.params.id;

      await notificationService.markAsRead(userId, notificationId);

      res.status(200).json({
        success: true,
        message: 'Notification marked as read',
      });
    } catch (error: any) {
      logger.error('[NotificationController] Error marking notification as read:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to mark notification as read',
      });
    }
  }

  async markAllAsRead(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;

      await notificationService.markAllAsRead(userId);

      res.status(200).json({
        success: true,
        message: 'All notifications marked as read',
      });
    } catch (error: any) {
      logger.error('[NotificationController] Error marking all notifications as read:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to mark all notifications as read',
      });
    }
  }

  async deleteNotification(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const notificationId = req.params.id;

      await notificationService.deleteNotification(userId, notificationId);

      res.status(200).json({
        success: true,
        message: 'Notification deleted',
      });
    } catch (error: any) {
      logger.error('[NotificationController] Error deleting notification:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to delete notification',
      });
    }
  }

  async getPreferences(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const preferences = await notificationService.getPreferences(userId);

      res.status(200).json({
        success: true,
        data: preferences,
      });
    } catch (error: any) {
      logger.error('[NotificationController] Error getting preferences:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to fetch notification preferences',
      });
    }
  }

  async updatePreferences(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const preferences = await notificationService.updatePreferences(userId, req.body);

      res.status(200).json({
        success: true,
        data: preferences,
        message: 'Notification preferences updated',
      });
    } catch (error: any) {
      logger.error('[NotificationController] Error updating preferences:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to update notification preferences',
      });
    }
  }
}

export const notificationController = new NotificationController();
