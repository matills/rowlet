/**
 * Achievement Controller
 * Sprint 11 - Motor de Logros
 *
 * Handles HTTP requests for achievements, user achievements, and XP/leveling
 */

import { Response } from 'express';
import { achievementService } from '../services/achievement.service';
import { logger } from '../config/logger';
import type { AuthRequest } from '../middlewares/auth';
import type { GetAchievementsQuery, GetUserAchievementsQuery } from '../types/achievement.types';

export class AchievementController {
  /**
   * Get all achievements
   * GET /api/achievements
   */
  async getAllAchievements(req: AuthRequest, res: Response): Promise<void> {
    try {
      const query: GetAchievementsQuery = {
        rarity: req.query.rarity as any,
        is_hidden: req.query.is_hidden === 'true',
        is_active: req.query.is_active !== 'false', // Default to true
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
        offset: req.query.offset ? parseInt(req.query.offset as string) : undefined,
      };

      const achievements = await achievementService.getAchievements(query);

      res.status(200).json({
        achievements,
        count: achievements.length,
      });
    } catch (error) {
      logger.error('Get all achievements error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to fetch achievements',
      });
    }
  }

  /**
   * Get a single achievement by ID
   * GET /api/achievements/:id
   */
  async getAchievementById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const achievement = await achievementService.getAchievementById(id);

      if (!achievement) {
        res.status(404).json({
          error: 'Not Found',
          message: 'Achievement not found',
        });
        return;
      }

      res.status(200).json({
        achievement,
      });
    } catch (error) {
      logger.error('Get achievement by ID error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to fetch achievement',
      });
    }
  }

  /**
   * Get current user's achievements
   * GET /api/users/me/achievements
   */
  async getMyAchievements(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'User not authenticated',
        });
        return;
      }

      const query: GetUserAchievementsQuery = {
        unlocked_only: req.query.unlocked_only === 'true',
        in_progress_only: req.query.in_progress_only === 'true',
        rarity: req.query.rarity as any,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
        offset: req.query.offset ? parseInt(req.query.offset as string) : undefined,
      };

      const achievements = await achievementService.getUserAchievements(req.user.id, query);

      res.status(200).json({
        achievements,
        count: achievements.length,
      });
    } catch (error) {
      logger.error('Get my achievements error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to fetch user achievements',
      });
    }
  }

  /**
   * Get current user's achievement progress summary
   * GET /api/users/me/achievements/progress
   */
  async getMyAchievementProgress(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'User not authenticated',
        });
        return;
      }

      const progress = await achievementService.getUserAchievementProgress(req.user.id);

      res.status(200).json(progress);
    } catch (error) {
      logger.error('Get my achievement progress error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to fetch achievement progress',
      });
    }
  }

  /**
   * Get public achievements for a user by username
   * GET /api/users/:username/achievements
   */
  async getUserAchievements(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { username } = req.params;

      const achievements = await achievementService.getPublicUserAchievements(username);

      res.status(200).json({
        achievements,
        count: achievements.length,
      });
    } catch (error: any) {
      logger.error('Get user achievements error:', error);

      if (error.message === 'User not found') {
        res.status(404).json({
          error: 'Not Found',
          message: 'User not found',
        });
        return;
      }

      if (error.message === 'User profile is private') {
        res.status(403).json({
          error: 'Forbidden',
          message: 'User profile is private',
        });
        return;
      }

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to fetch user achievements',
      });
    }
  }

  /**
   * Get current user's XP and level
   * GET /api/users/me/xp
   */
  async getMyXP(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'User not authenticated',
        });
        return;
      }

      const userXP = await achievementService.getUserXP(req.user.id);

      res.status(200).json(userXP);
    } catch (error) {
      logger.error('Get my XP error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to fetch user XP',
      });
    }
  }

  /**
   * Manually trigger achievement evaluation for current user
   * POST /api/users/me/achievements/evaluate
   * (This is mainly for testing/debugging)
   */
  async evaluateMyAchievements(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'User not authenticated',
        });
        return;
      }

      const results = await achievementService.evaluateAndUnlockAchievements(req.user.id);

      res.status(200).json({
        message: 'Achievement evaluation completed',
        unlocked_count: results.length,
        unlocked_achievements: results.map((r) => ({
          key: r.achievement.key,
          name: r.achievement.name,
          xp_awarded: r.xp_awarded,
          level_up: r.level_up_info?.leveled_up || false,
          new_level: r.level_up_info?.new_level,
        })),
      });
    } catch (error) {
      logger.error('Evaluate my achievements error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to evaluate achievements',
      });
    }
  }

  /**
   * Get achievement statistics
   * GET /api/achievements/stats
   */
  async getAchievementStats(req: AuthRequest, res: Response): Promise<void> {
    try {
      const stats = await achievementService.getAchievementStats();

      res.status(200).json({
        stats,
      });
    } catch (error) {
      logger.error('Get achievement stats error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to fetch achievement statistics',
      });
    }
  }

  /**
   * Get achievement leaderboard
   * GET /api/achievements/leaderboard
   */
  async getAchievementLeaderboard(req: AuthRequest, res: Response): Promise<void> {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

      const leaderboard = await achievementService.getAchievementLeaderboard(limit);

      res.status(200).json({
        leaderboard,
      });
    } catch (error) {
      logger.error('Get achievement leaderboard error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to fetch achievement leaderboard',
      });
    }
  }
}

export const achievementController = new AchievementController();
