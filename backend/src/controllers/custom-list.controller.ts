import { Request, Response } from 'express';
import { customListService } from '../services/custom-list.service';
import { logger } from '../config/logger';
import type {
  CreateCustomListInput,
  UpdateCustomListInput,
  AddListItemInput,
  UpdateListItemInput,
} from '../validators/custom-list.validators';

export class CustomListController {
  /**
   * Get all lists for current user
   * GET /api/v1/lists
   */
  async getMyLists(req: Request, res: Response): Promise<void> {
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
      const isPublic = req.query.isPublic
        ? req.query.isPublic === 'true'
        : undefined;

      const result = await customListService.getUserLists(
        userId,
        page,
        limit,
        isPublic
      );

      res.status(200).json({
        message: 'Lists retrieved successfully',
        ...result,
      });
    } catch (error: any) {
      logger.error('Get my lists controller error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: error.message || 'Failed to fetch lists',
      });
    }
  }

  /**
   * Get a specific list by ID
   * GET /api/v1/lists/:id
   */
  async getListById(req: Request, res: Response): Promise<void> {
    try {
      const listId = req.params.id;
      const userId = (req as any).user?.id;

      const result = await customListService.getListById(listId, userId);

      res.status(200).json({
        message: 'List retrieved successfully',
        data: result,
      });
    } catch (error: any) {
      logger.error('Get list by ID controller error:', error);

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
   * Create a new custom list
   * POST /api/v1/lists
   */
  async createList(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const input: CreateCustomListInput = req.body;

      if (!userId) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'User not authenticated',
        });
        return;
      }

      const result = await customListService.createList(userId, input);

      res.status(201).json({
        message: 'List created successfully',
        data: result,
      });
    } catch (error: any) {
      logger.error('Create list controller error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to create list',
      });
    }
  }

  /**
   * Update a custom list
   * PUT /api/v1/lists/:id
   */
  async updateList(req: Request, res: Response): Promise<void> {
    try {
      const listId = req.params.id;
      const userId = (req as any).user?.id;
      const input: UpdateCustomListInput = req.body;

      if (!userId) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'User not authenticated',
        });
        return;
      }

      const result = await customListService.updateList(listId, userId, input);

      res.status(200).json({
        message: 'List updated successfully',
        data: result,
      });
    } catch (error: any) {
      logger.error('Update list controller error:', error);

      if (error.message.includes('not found')) {
        res.status(404).json({
          error: 'Not Found',
          message: error.message,
        });
        return;
      }

      if (error.message.includes('permission')) {
        res.status(403).json({
          error: 'Forbidden',
          message: error.message,
        });
        return;
      }

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to update list',
      });
    }
  }

  /**
   * Delete a custom list
   * DELETE /api/v1/lists/:id
   */
  async deleteList(req: Request, res: Response): Promise<void> {
    try {
      const listId = req.params.id;
      const userId = (req as any).user?.id;

      if (!userId) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'User not authenticated',
        });
        return;
      }

      await customListService.deleteList(listId, userId);

      res.status(200).json({
        message: 'List deleted successfully',
      });
    } catch (error: any) {
      logger.error('Delete list controller error:', error);

      if (error.message.includes('not found')) {
        res.status(404).json({
          error: 'Not Found',
          message: error.message,
        });
        return;
      }

      if (error.message.includes('permission')) {
        res.status(403).json({
          error: 'Forbidden',
          message: error.message,
        });
        return;
      }

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to delete list',
      });
    }
  }

  /**
   * Add item to list
   * POST /api/v1/lists/:id/items
   */
  async addItemToList(req: Request, res: Response): Promise<void> {
    try {
      const listId = req.params.id;
      const userId = (req as any).user?.id;
      const input: AddListItemInput = req.body;

      if (!userId) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'User not authenticated',
        });
        return;
      }

      const result = await customListService.addItemToList(listId, userId, input);

      res.status(201).json({
        message: 'Item added to list successfully',
        data: result,
      });
    } catch (error: any) {
      logger.error('Add item to list controller error:', error);

      if (error.message.includes('not found')) {
        res.status(404).json({
          error: 'Not Found',
          message: error.message,
        });
        return;
      }

      if (error.message.includes('permission')) {
        res.status(403).json({
          error: 'Forbidden',
          message: error.message,
        });
        return;
      }

      if (error.message.includes('already in')) {
        res.status(409).json({
          error: 'Conflict',
          message: error.message,
        });
        return;
      }

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to add item to list',
      });
    }
  }

  /**
   * Update list item
   * PUT /api/v1/lists/:id/items/:mediaId
   */
  async updateListItem(req: Request, res: Response): Promise<void> {
    try {
      const listId = req.params.id;
      const mediaId = req.params.mediaId;
      const userId = (req as any).user?.id;
      const input: UpdateListItemInput = req.body;

      if (!userId) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'User not authenticated',
        });
        return;
      }

      const result = await customListService.updateListItem(
        listId,
        mediaId,
        userId,
        input
      );

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

      if (error.message.includes('permission')) {
        res.status(403).json({
          error: 'Forbidden',
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
   * Remove item from list
   * DELETE /api/v1/lists/:id/items/:mediaId
   */
  async removeItemFromList(req: Request, res: Response): Promise<void> {
    try {
      const listId = req.params.id;
      const mediaId = req.params.mediaId;
      const userId = (req as any).user?.id;

      if (!userId) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'User not authenticated',
        });
        return;
      }

      await customListService.removeItemFromList(listId, mediaId, userId);

      res.status(200).json({
        message: 'Item removed from list successfully',
      });
    } catch (error: any) {
      logger.error('Remove item from list controller error:', error);

      if (error.message.includes('not found')) {
        res.status(404).json({
          error: 'Not Found',
          message: error.message,
        });
        return;
      }

      if (error.message.includes('permission')) {
        res.status(403).json({
          error: 'Forbidden',
          message: error.message,
        });
        return;
      }

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to remove item from list',
      });
    }
  }

  /**
   * Get public lists by username
   * GET /api/v1/users/:username/lists
   */
  async getPublicListsByUsername(req: Request, res: Response): Promise<void> {
    try {
      const username = req.params.username;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await customListService.getPublicListsByUsername(
        username,
        page,
        limit
      );

      res.status(200).json({
        message: 'Public lists retrieved successfully',
        ...result,
      });
    } catch (error: any) {
      logger.error('Get public lists controller error:', error);

      if (error.message.includes('not found')) {
        res.status(404).json({
          error: 'Not Found',
          message: error.message,
        });
        return;
      }

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to fetch public lists',
      });
    }
  }

  /**
   * Reorder list items
   * PUT /api/v1/lists/:id/reorder
   */
  async reorderList(req: Request, res: Response): Promise<void> {
    try {
      const listId = req.params.id;
      const userId = (req as any).user?.id;
      const { itemIds } = req.body;

      if (!userId) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'User not authenticated',
        });
        return;
      }

      if (!Array.isArray(itemIds)) {
        res.status(400).json({
          error: 'Bad Request',
          message: 'itemIds must be an array of media IDs',
        });
        return;
      }

      const result = await customListService.reorderList(listId, userId, itemIds);

      res.status(200).json(result);
    } catch (error: any) {
      logger.error('Reorder list controller error:', error);

      if (error.message.includes('not found')) {
        res.status(404).json({
          error: 'Not Found',
          message: error.message,
        });
        return;
      }

      if (error.message.includes('permission')) {
        res.status(403).json({
          error: 'Forbidden',
          message: error.message,
        });
        return;
      }

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to reorder list',
      });
    }
  }
}

export const customListController = new CustomListController();
