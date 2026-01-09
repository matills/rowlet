import { Response } from 'express';
import { followService } from '../services/follow.service';
import { logger } from '../config/logger';
import type { AuthRequest } from '../middlewares/auth';

export class FollowController {
  /**
   * Follow a user
   * POST /api/users/:username/follow
   */
  async followUser(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'User not authenticated',
        });
        return;
      }

      const { username } = req.params;

      await followService.followUser(req.user.id, username);

      res.status(200).json({
        message: `You are now following @${username}`,
      });
    } catch (error: any) {
      logger.error('Follow user controller error:', error);

      if (error.message.includes('not found')) {
        res.status(404).json({
          error: 'Not Found',
          message: error.message,
        });
        return;
      }

      if (
        error.message.includes('already following') ||
        error.message.includes('cannot follow yourself')
      ) {
        res.status(400).json({
          error: 'Bad Request',
          message: error.message,
        });
        return;
      }

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to follow user',
      });
    }
  }

  /**
   * Unfollow a user
   * DELETE /api/users/:username/unfollow
   */
  async unfollowUser(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'User not authenticated',
        });
        return;
      }

      const { username } = req.params;

      await followService.unfollowUser(req.user.id, username);

      res.status(200).json({
        message: `You have unfollowed @${username}`,
      });
    } catch (error: any) {
      logger.error('Unfollow user controller error:', error);

      if (error.message.includes('not found')) {
        res.status(404).json({
          error: 'Not Found',
          message: error.message,
        });
        return;
      }

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to unfollow user',
      });
    }
  }

  /**
   * Get followers of a user
   * GET /api/users/:username/followers
   */
  async getFollowers(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { username } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await followService.getFollowers(username, page, limit);

      res.status(200).json({
        message: 'Followers retrieved successfully',
        ...result,
      });
    } catch (error: any) {
      logger.error('Get followers controller error:', error);

      if (error.message.includes('not found')) {
        res.status(404).json({
          error: 'Not Found',
          message: error.message,
        });
        return;
      }

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to fetch followers',
      });
    }
  }

  /**
   * Get users that a user is following
   * GET /api/users/:username/following
   */
  async getFollowing(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { username } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await followService.getFollowing(username, page, limit);

      res.status(200).json({
        message: 'Following retrieved successfully',
        ...result,
      });
    } catch (error: any) {
      logger.error('Get following controller error:', error);

      if (error.message.includes('not found')) {
        res.status(404).json({
          error: 'Not Found',
          message: error.message,
        });
        return;
      }

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to fetch following',
      });
    }
  }

  /**
   * Check follow status between current user and target user
   * GET /api/users/:username/is-following
   */
  async checkFollowStatus(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'User not authenticated',
        });
        return;
      }

      const { username } = req.params;

      const status = await followService.checkFollowStatus(req.user.id, username);

      res.status(200).json({
        ...status,
      });
    } catch (error: any) {
      logger.error('Check follow status controller error:', error);

      if (error.message.includes('not found')) {
        res.status(404).json({
          error: 'Not Found',
          message: error.message,
        });
        return;
      }

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to check follow status',
      });
    }
  }
}

export const followController = new FollowController();
