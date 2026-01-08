import { Response } from 'express';
import { userService } from '../services/user.service';
import { userStatsService } from '../services/user-stats.service';
import { logger } from '../config/logger';
import type { AuthRequest } from '../middlewares/auth';
import type {
  UpdateProfileInput,
  ChangePasswordInput,
} from '../validators/auth.validators';

export class UserController {
  /**
   * Get current user profile
   * GET /api/users/me
   */
  async getMe(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'User not authenticated',
        });
        return;
      }

      const profile = await userService.getUserProfile(req.user.id);

      res.status(200).json({
        user: profile,
      });
    } catch (error) {
      logger.error('Get me error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to fetch profile',
      });
    }
  }

  /**
   * Update current user profile
   * PUT /api/users/me
   */
  async updateMe(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'User not authenticated',
        });
        return;
      }

      const data: UpdateProfileInput = req.body;

      const updatedProfile = await userService.updateProfile(req.user.id, data);

      res.status(200).json({
        message: 'Profile updated successfully',
        user: updatedProfile,
      });
    } catch (error: any) {
      logger.error('Update profile error:', error);

      if (error.message?.includes('duplicate key') || error.code === '23505') {
        res.status(409).json({
          error: 'Conflict',
          message: 'Username already taken',
        });
        return;
      }

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to update profile',
      });
    }
  }

  /**
   * Change password
   * PUT /api/users/me/password
   */
  async changePassword(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'User not authenticated',
        });
        return;
      }

      const data: ChangePasswordInput = req.body;

      await userService.changePassword(req.user.id, data);

      res.status(200).json({
        message: 'Password changed successfully',
      });
    } catch (error) {
      logger.error('Change password error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to change password',
      });
    }
  }

  /**
   * Delete account
   * DELETE /api/users/me
   */
  async deleteMe(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'User not authenticated',
        });
        return;
      }

      await userService.deleteAccount(req.user.id);

      res.status(200).json({
        message: 'Account deleted successfully',
      });
    } catch (error) {
      logger.error('Delete account error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to delete account',
      });
    }
  }

  /**
   * Get user by username (public profile)
   * GET /api/users/:username
   */
  async getUserByUsername(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { username } = req.params;

      const profile = await userService.getUserByUsername(username);

      // Check if profile is private and user is not the owner
      if (profile.is_private && (!req.user || req.user.id !== profile.id)) {
        res.status(403).json({
          error: 'Forbidden',
          message: 'This profile is private',
        });
        return;
      }

      // Don't return sensitive information for public profiles
      const publicProfile = {
        id: profile.id,
        username: profile.username,
        display_name: profile.display_name,
        bio: profile.bio,
        avatar_url: profile.avatar_url,
        banner_url: profile.banner_url,
        created_at: profile.created_at,
      };

      res.status(200).json({
        user: publicProfile,
      });
    } catch (error: any) {
      logger.error('Get user by username error:', error);

      if (error.code === 'PGRST116') {
        res.status(404).json({
          error: 'Not Found',
          message: 'User not found',
        });
        return;
      }

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to fetch user',
      });
    }
  }

  /**
   * Get user stats (basic)
   * GET /api/users/:username/stats
   */
  async getUserStats(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { username } = req.params;

      const profile = await userService.getUserByUsername(username);

      // Check if profile is private and user is not the owner
      if (profile.is_private && (!req.user || req.user.id !== profile.id)) {
        res.status(403).json({
          error: 'Forbidden',
          message: 'This profile is private',
        });
        return;
      }

      const stats = await userService.getUserStats(profile.id);

      res.status(200).json({
        stats,
      });
    } catch (error) {
      logger.error('Get user stats error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to fetch stats',
      });
    }
  }

  /**
   * Get current user general statistics
   * GET /api/users/me/stats
   * Sprint 6: Comprehensive user statistics
   */
  async getMyStatsGeneral(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'User not authenticated',
        });
        return;
      }

      const stats = await userStatsService.getUserStatsGeneral(req.user.id);

      res.status(200).json({
        stats,
      });
    } catch (error) {
      logger.error('Get my stats general error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to fetch statistics',
      });
    }
  }

  /**
   * Get current user genre statistics
   * GET /api/users/me/stats/genres
   * Sprint 6: Genre distribution statistics
   */
  async getMyStatsGenres(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'User not authenticated',
        });
        return;
      }

      const stats = await userStatsService.getUserStatsGenres(req.user.id);

      res.status(200).json({
        stats,
      });
    } catch (error) {
      logger.error('Get my stats genres error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to fetch genre statistics',
      });
    }
  }

  /**
   * Get current user timeline statistics
   * GET /api/users/me/stats/timeline
   * Sprint 6: Activity timeline and streaks
   */
  async getMyStatsTimeline(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'User not authenticated',
        });
        return;
      }

      const stats = await userStatsService.getUserStatsTimeline(req.user.id);

      res.status(200).json({
        stats,
      });
    } catch (error) {
      logger.error('Get my stats timeline error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to fetch timeline statistics',
      });
    }
  }
}

export const userController = new UserController();
