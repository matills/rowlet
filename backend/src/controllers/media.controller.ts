import { Request, Response } from 'express';
import { mediaService } from '../services/media.service';
import { logger } from '../config/logger';
import {
  MediaSearchSchema,
  CreateMediaSchema,
  UpdateMediaSchema,
  ExternalSearchSchema,
  ImportMediaSchema,
} from '../validators/media.validators';

export class MediaController {
  /**
   * Search media
   * GET /api/media?search=&type=&genre=&year=&page=&limit=
   */
  async search(req: Request, res: Response): Promise<void> {
    try {
      const params = MediaSearchSchema.parse(req.query);
      const result = await mediaService.searchMedia(params);

      res.status(200).json({
        message: 'Media search successful',
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error: any) {
      logger.error('Media search controller error:', error);

      if (error.name === 'ZodError') {
        res.status(400).json({
          error: 'Bad Request',
          message: 'Invalid query parameters',
          details: error.errors,
        });
        return;
      }

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to search media',
      });
    }
  }

  /**
   * Get media by ID
   * GET /api/media/:id
   */
  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const media = await mediaService.getMediaById(id);

      res.status(200).json({
        data: media,
      });
    } catch (error: any) {
      logger.error('Get media by ID controller error:', error);

      if (error.code === 'PGRST116') {
        res.status(404).json({
          error: 'Not Found',
          message: 'Media not found',
        });
        return;
      }

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to get media',
      });
    }
  }

  /**
   * Create media (admin only)
   * POST /api/media
   */
  async create(req: Request, res: Response): Promise<void> {
    try {
      const data = CreateMediaSchema.parse(req.body);
      const media = await mediaService.createMedia(data);

      res.status(201).json({
        message: 'Media created successfully',
        data: media,
      });
    } catch (error: any) {
      logger.error('Create media controller error:', error);

      if (error.name === 'ZodError') {
        res.status(400).json({
          error: 'Bad Request',
          message: 'Invalid media data',
          details: error.errors,
        });
        return;
      }

      if (error.code === '23505') {
        res.status(409).json({
          error: 'Conflict',
          message: 'Media already exists',
        });
        return;
      }

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to create media',
      });
    }
  }

  /**
   * Update media (admin only)
   * PUT /api/media/:id
   */
  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const data = UpdateMediaSchema.parse(req.body);

      const media = await mediaService.updateMedia(id, data);

      res.status(200).json({
        message: 'Media updated successfully',
        data: media,
      });
    } catch (error: any) {
      logger.error('Update media controller error:', error);

      if (error.name === 'ZodError') {
        res.status(400).json({
          error: 'Bad Request',
          message: 'Invalid media data',
          details: error.errors,
        });
        return;
      }

      if (error.code === 'PGRST116') {
        res.status(404).json({
          error: 'Not Found',
          message: 'Media not found',
        });
        return;
      }

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to update media',
      });
    }
  }

  /**
   * Delete media (admin only)
   * DELETE /api/media/:id
   */
  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      await mediaService.deleteMedia(id);

      res.status(200).json({
        message: 'Media deleted successfully',
      });
    } catch (error: any) {
      logger.error('Delete media controller error:', error);

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to delete media',
      });
    }
  }

  /**
   * Get seasons for a series/anime
   * GET /api/media/:id/seasons
   */
  async getSeasons(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const seasons = await mediaService.getSeasons(id);

      res.status(200).json({
        data: seasons,
      });
    } catch (error: any) {
      logger.error('Get seasons controller error:', error);

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to get seasons',
      });
    }
  }

  /**
   * Get episodes for a season
   * GET /api/media/:id/seasons/:seasonNumber/episodes
   */
  async getEpisodes(req: Request, res: Response): Promise<void> {
    try {
      const { id, seasonNumber } = req.params;

      const seasons = await mediaService.getSeasons(id);
      const season = seasons.find(
        (s: any) => s.season_number === parseInt(seasonNumber)
      );

      if (!season) {
        res.status(404).json({
          error: 'Not Found',
          message: 'Season not found',
        });
        return;
      }

      const episodes = await mediaService.getEpisodes(season.id);

      res.status(200).json({
        data: episodes,
      });
    } catch (error: any) {
      logger.error('Get episodes controller error:', error);

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to get episodes',
      });
    }
  }

  /**
   * Search external APIs
   * GET /api/external/search?query=&type=&page=
   */
  async searchExternal(req: Request, res: Response): Promise<void> {
    try {
      const params = ExternalSearchSchema.parse(req.query);
      const result = await mediaService.searchExternal(
        params.query,
        params.type,
        params.page
      );

      res.status(200).json({
        message: 'External search successful',
        source: result.source,
        data: result.results,
        pagination: result.pagination,
      });
    } catch (error: any) {
      logger.error('External search controller error:', error);

      if (error.name === 'ZodError') {
        res.status(400).json({
          error: 'Bad Request',
          message: 'Invalid query parameters',
          details: error.errors,
        });
        return;
      }

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to search external APIs',
      });
    }
  }

  /**
   * Import media from external API
   * POST /api/external/import
   * Body: { externalId, source, type }
   */
  async importMedia(req: Request, res: Response): Promise<void> {
    try {
      const params = ImportMediaSchema.parse(req.body);
      const media = await mediaService.importMedia(
        params.externalId,
        params.source,
        params.type
      );

      res.status(201).json({
        message: 'Media imported successfully',
        data: media,
      });
    } catch (error: any) {
      logger.error('Import media controller error:', error);

      if (error.name === 'ZodError') {
        res.status(400).json({
          error: 'Bad Request',
          message: 'Invalid import parameters',
          details: error.errors,
        });
        return;
      }

      if (error.message === 'Media already imported') {
        res.status(409).json({
          error: 'Conflict',
          message: 'Media already imported',
        });
        return;
      }

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to import media',
      });
    }
  }

  /**
   * Get trending content
   * GET /api/media/trending?type=&timeWindow=&page=
   */
  async getTrending(req: Request, res: Response): Promise<void> {
    try {
      const type = (req.query.type as string) || 'movie';
      const timeWindow = (req.query.timeWindow as string) || 'week';
      const page = parseInt(req.query.page as string) || 1;

      if (!['movie', 'series', 'anime'].includes(type)) {
        res.status(400).json({
          error: 'Bad Request',
          message: 'Invalid type. Must be movie, series, or anime',
        });
        return;
      }

      if (!['day', 'week'].includes(timeWindow)) {
        res.status(400).json({
          error: 'Bad Request',
          message: 'Invalid timeWindow. Must be day or week',
        });
        return;
      }

      const result = await mediaService.getTrending(type as any, timeWindow as any, page);

      res.status(200).json({
        message: 'Trending content retrieved successfully',
        source: result.source,
        data: result.results,
        pagination: result.pagination,
      });
    } catch (error: any) {
      logger.error('Get trending controller error:', error);

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to get trending content',
      });
    }
  }

  /**
   * Get popular content
   * GET /api/media/popular?type=&page=
   */
  async getPopular(req: Request, res: Response): Promise<void> {
    try {
      const type = (req.query.type as string) || 'movie';
      const page = parseInt(req.query.page as string) || 1;

      if (!['movie', 'series', 'anime'].includes(type)) {
        res.status(400).json({
          error: 'Bad Request',
          message: 'Invalid type. Must be movie, series, or anime',
        });
        return;
      }

      const result = await mediaService.getPopular(type as any, page);

      res.status(200).json({
        message: 'Popular content retrieved successfully',
        source: result.source,
        data: result.results,
        pagination: result.pagination,
      });
    } catch (error: any) {
      logger.error('Get popular controller error:', error);

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to get popular content',
      });
    }
  }
}

export const mediaController = new MediaController();
