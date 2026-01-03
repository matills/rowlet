import { Request, Response } from 'express';
import { userListService } from '../services/user-list.service';
import { logger } from '../config/logger';
import type {
  AddToListInput,
  UpdateListItemInput,
  UpdateProgressInput,
  UserMediaStatus,
} from '../validators/user-list.validators';

export class UserListController {
  /**
   * Get current user's full media list
   * GET /api/v1/users/me/list
   */
  async getMyList(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;

      if (!userId) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'User not authenticated',
        });
        return;
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await userListService.getUserList(userId, page, limit);

      res.status(200).json({
        message: 'List retrieved successfully',
        ...result,
      });
    } catch (error: any) {
      logger.error('Get my list controller error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: error.message || 'Failed to fetch list',
      });
    }
  }

  /**
   * Get current user's media list by status
   * GET /api/v1/users/me/list/:status
   */
  async getMyListByStatus(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const status = req.params.status as UserMediaStatus;

      if (!userId) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'User not authenticated',
        });
        return;
      }

      const validStatuses = ['watching', 'completed', 'plan_to_watch', 'on_hold', 'dropped'];
      if (!validStatuses.includes(status)) {
        res.status(400).json({
          error: 'Bad Request',
          message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
        });
        return;
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await userListService.getUserListByStatus(
        userId,
        status,
        page,
        limit
      );

      res.status(200).json({
        message: 'List retrieved successfully',
        status,
        ...result,
      });
    } catch (error: any) {
      logger.error('Get my list by status controller error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: error.message || 'Failed to fetch list',
      });
    }
  }

  /**
   * Add media to user's list
   * POST /api/v1/users/me/list
   */
  async addToList(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const input: AddToListInput = req.body;

      if (!userId) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'User not authenticated',
        });
        return;
      }

      const result = await userListService.addToList(userId, input);

      res.status(201).json({
        message: 'Added to list successfully',
        data: result,
      });
    } catch (error: any) {
      logger.error('Add to list controller error:', error);

      if (error.message.includes('already in your list')) {
        res.status(409).json({
          error: 'Conflict',
          message: error.message,
        });
        return;
      }

      if (error.message.includes('not found')) {
        res.status(404).json({
          error: 'Not Found',
          message: error.message,
        });
        return;
      }

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to add to list',
      });
    }
  }

  /**
   * Update media in user's list
   * PUT /api/v1/users/me/list/:mediaId
   */
  async updateListItem(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const mediaId = req.params.mediaId;
      const input: UpdateListItemInput = req.body;

      if (!userId) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'User not authenticated',
        });
        return;
      }

      const result = await userListService.updateListItem(userId, mediaId, input);

      res.status(200).json({
        message: 'List item updated successfully',
        data: result,
      });
    } catch (error: any) {
      logger.error('Update list item controller error:', error);

      if (error.message.includes('not found')) {
        res.status(404).json({
          error: 'Not Found',
          message: error.message,
        });
        return;
      }

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to update list item',
      });
    }
  }

  /**
   * Update viewing progress
   * PATCH /api/v1/users/me/list/:mediaId/progress
   */
  async updateProgress(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const mediaId = req.params.mediaId;
      const input: UpdateProgressInput = req.body;

      if (!userId) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'User not authenticated',
        });
        return;
      }

      const result = await userListService.updateProgress(userId, mediaId, input);

      res.status(200).json({
        message: 'Progress updated successfully',
        data: result,
      });
    } catch (error: any) {
      logger.error('Update progress controller error:', error);

      if (error.message.includes('not found')) {
        res.status(404).json({
          error: 'Not Found',
          message: error.message,
        });
        return;
      }

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to update progress',
      });
    }
  }

  /**
   * Remove media from user's list
   * DELETE /api/v1/users/me/list/:mediaId
   */
  async removeFromList(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const mediaId = req.params.mediaId;

      if (!userId) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'User not authenticated',
        });
        return;
      }

      await userListService.removeFromList(userId, mediaId);

      res.status(200).json({
        message: 'Removed from list successfully',
      });
    } catch (error: any) {
      logger.error('Remove from list controller error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to remove from list',
      });
    }
  }

  /**
   * Get public user's media list
   * GET /api/v1/users/:username/list
   */
  async getUserList(req: Request, res: Response): Promise<void> {
    try {
      const username = req.params.username;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      // Get user by username
      const user = await userListService.getUserByUsername(username);

      const result = await userListService.getUserList(user.id, page, limit);

      res.status(200).json({
        message: 'List retrieved successfully',
        user: {
          username: user.username,
          displayName: user.display_name,
        },
        ...result,
      });
    } catch (error: any) {
      logger.error('Get user list controller error:', error);

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
        message: 'Failed to fetch list',
      });
    }
  }

  /**
   * Get public user's media list by status
   * GET /api/v1/users/:username/list/:status
   */
  async getUserListByStatus(req: Request, res: Response): Promise<void> {
    try {
      const username = req.params.username;
      const status = req.params.status as UserMediaStatus;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const validStatuses = ['watching', 'completed', 'plan_to_watch', 'on_hold', 'dropped'];
      if (!validStatuses.includes(status)) {
        res.status(400).json({
          error: 'Bad Request',
          message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
        });
        return;
      }

      // Get user by username
      const user = await userListService.getUserByUsername(username);

      const result = await userListService.getUserListByStatus(
        user.id,
        status,
        page,
        limit
      );

      res.status(200).json({
        message: 'List retrieved successfully',
        user: {
          username: user.username,
          displayName: user.display_name,
        },
        status,
        ...result,
      });
    } catch (error: any) {
      logger.error('Get user list by status controller error:', error);

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
        message: 'Failed to fetch list',
      });
    }
  }

  /**
   * Get current user's statistics
   * GET /api/v1/users/me/stats
   */
  async getMyStats(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;

      if (!userId) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'User not authenticated',
        });
        return;
      }

      const stats = await userListService.getUserStats(userId);

      res.status(200).json({
        message: 'Stats retrieved successfully',
        stats,
      });
    } catch (error: any) {
      logger.error('Get my stats controller error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to fetch stats',
      });
    }
  }
}

export const userListController = new UserListController();
