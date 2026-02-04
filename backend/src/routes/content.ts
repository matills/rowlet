import { Router, type IRouter } from 'express';
import { authMiddleware, type AuthRequest } from '../middleware/auth.js';
import { getContentService } from '../services/content.service.js';
import type { UserContentStatus } from '../types/database.js';

export const contentRouter: IRouter = Router();

/**
 * POST /api/content
 * Add content to user's tracking list
 * Body:
 *   - externalId: string (required)
 *   - source: 'tmdb' | 'anilist' (required)
 *   - type: 'movie' | 'series' | 'anime' (required)
 *   - status: UserContentStatus (required)
 *   - rating?: number (1-10)
 *   - episodesWatched?: number
 *   - watchedAt?: string (ISO date)
 *   - notes?: string
 */
contentRouter.post('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const { externalId, source, type, status, rating, episodesWatched, watchedAt, notes } = req.body;

    // Validation
    if (!externalId || !source || !type || !status) {
      return res.status(400).json({
        error: 'Missing required fields: externalId, source, type, status',
      });
    }

    if (!['tmdb', 'anilist'].includes(source)) {
      return res.status(400).json({
        error: 'Invalid source. Must be either tmdb or anilist',
      });
    }

    if (!['movie', 'series', 'anime'].includes(type)) {
      return res.status(400).json({
        error: 'Invalid type. Must be one of: movie, series, anime',
      });
    }

    if (!['watched', 'watching', 'want_to_watch', 'dropped', 'paused'].includes(status)) {
      return res.status(400).json({
        error: 'Invalid status. Must be one of: watched, watching, want_to_watch, dropped, paused',
      });
    }

    if (rating !== undefined && (rating < 1 || rating > 10)) {
      return res.status(400).json({
        error: 'Rating must be between 1 and 10',
      });
    }

    const contentService = getContentService();
    const userContent = await contentService.addUserContent({
      userId,
      externalId,
      source,
      type,
      status,
      rating,
      episodesWatched,
      watchedAt,
      notes,
    });

    res.status(201).json(userContent);
  } catch (error) {
    console.error('Add content error:', error);
    res.status(500).json({
      error: 'Failed to add content to library',
    });
  }
});

/**
 * GET /api/content
 * Get user's content catalog
 * Query params:
 *   - status?: UserContentStatus (filter by status)
 */
contentRouter.get('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const status = req.query.status as UserContentStatus | undefined;

    if (status && !['watched', 'watching', 'want_to_watch', 'dropped', 'paused'].includes(status)) {
      return res.status(400).json({
        error: 'Invalid status filter',
      });
    }

    const contentService = getContentService();
    const userContent = await contentService.getUserContent(userId, status);

    res.json({
      userId,
      status: status || 'all',
      count: userContent.length,
      items: userContent,
    });
  } catch (error) {
    console.error('Get user content error:', error);
    res.status(500).json({
      error: 'Failed to fetch user content',
    });
  }
});

/**
 * PUT /api/content/:id
 * Update user content
 * Params:
 *   - id: user content ID
 * Body:
 *   - status?: UserContentStatus
 *   - rating?: number
 *   - episodesWatched?: number
 *   - watchedAt?: string
 *   - notes?: string
 */
contentRouter.put('/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const userContentId = req.params.id;
    const { status, rating, episodesWatched, watchedAt, notes } = req.body;

    if (status && !['watched', 'watching', 'want_to_watch', 'dropped', 'paused'].includes(status)) {
      return res.status(400).json({
        error: 'Invalid status',
      });
    }

    if (rating !== undefined && (rating < 1 || rating > 10)) {
      return res.status(400).json({
        error: 'Rating must be between 1 and 10',
      });
    }

    const contentService = getContentService();
    const userContent = await contentService.updateUserContent(userContentId, userId, {
      status,
      rating,
      episodesWatched,
      watchedAt,
      notes,
    });

    res.json(userContent);
  } catch (error) {
    console.error('Update content error:', error);
    res.status(500).json({
      error: 'Failed to update content',
    });
  }
});

/**
 * DELETE /api/content/:id
 * Remove content from user's library
 */
contentRouter.delete('/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const userContentId = req.params.id;

    const contentService = getContentService();
    await contentService.deleteUserContent(userContentId, userId);

    res.status(204).send();
  } catch (error) {
    console.error('Delete content error:', error);
    res.status(500).json({
      error: 'Failed to delete content',
    });
  }
});
