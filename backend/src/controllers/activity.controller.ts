import { Response } from 'express';
import { activityService } from '../services/activity.service';
import { logger } from '../config/logger';
import type { AuthRequest } from '../middlewares/auth';
import type { GetFeedQuery, GetUserActivityQuery } from '../validators/activity.validators';

export class ActivityController {
  async getFeed(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'User not authenticated',
        });
        return;
      }

      const query = req.query as unknown as GetFeedQuery;
      const page = query.page || 1;
      const limit = query.limit || 20;
      const activityType = query.type;

      const result = await activityService.getFeed(
        req.user.id,
        page,
        limit,
        activityType
      );

      res.status(200).json({
        message: 'Feed retrieved successfully',
        ...result,
      });
    } catch (error: any) {
      logger.error('Get feed controller error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to fetch feed',
      });
    }
  }

  async getMyActivity(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'User not authenticated',
        });
        return;
      }

      const query = req.query as unknown as GetUserActivityQuery;
      const page = query.page || 1;
      const limit = query.limit || 20;
      const activityType = query.type;

      const result = await activityService.getMyActivity(
        req.user.id,
        page,
        limit,
        activityType
      );

      res.status(200).json({
        message: 'Activity retrieved successfully',
        ...result,
      });
    } catch (error: any) {
      logger.error('Get my activity controller error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to fetch activity',
      });
    }
  }

  async getUserActivity(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { username } = req.params;
      const query = req.query as unknown as GetUserActivityQuery;
      const page = query.page || 1;
      const limit = query.limit || 20;
      const activityType = query.type;

      const result = await activityService.getUserActivity(
        username,
        req.user?.id,
        page,
        limit,
        activityType
      );

      res.status(200).json({
        message: 'Activity retrieved successfully',
        ...result,
      });
    } catch (error: any) {
      logger.error('Get user activity controller error:', error);

      if (error.message.includes('not found')) {
        res.status(404).json({
          error: 'Not Found',
          message: error.message,
        });
        return;
      }

      if (error.message.includes('private')) {
        res.status(403).json({
          error: 'Forbidden',
          message: error.message,
        });
        return;
      }

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to fetch activity',
      });
    }
  }

  async deleteActivity(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'User not authenticated',
        });
        return;
      }

      const { activityId } = req.params;

      await activityService.deleteActivity(activityId, req.user.id);

      res.status(200).json({
        message: 'Activity deleted successfully',
      });
    } catch (error: any) {
      logger.error('Delete activity controller error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to delete activity',
      });
    }
  }
}

export const activityController = new ActivityController();
