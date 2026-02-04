import { Router, type IRouter } from 'express';
import { getSearchService } from '../services/search.service.js';
import type { ContentType } from '../services/search.service.js';

export const searchRouter: IRouter = Router();

/**
 * GET /api/search
 * Query params:
 *   - q: search query (required)
 *   - type: content type filter (optional, default: 'all')
 *   - page: page number (optional, default: 1)
 */
searchRouter.get('/', async (req, res) => {
  try {
    const query = req.query.q as string;
    const type = (req.query.type as ContentType) || 'all';
    const page = parseInt(req.query.page as string, 10) || 1;

    if (!query) {
      return res.status(400).json({
        error: 'Search query is required',
      });
    }

    if (!['all', 'movie', 'series', 'anime'].includes(type)) {
      return res.status(400).json({
        error: 'Invalid content type. Must be one of: all, movie, series, anime',
      });
    }

    if (page < 1) {
      return res.status(400).json({
        error: 'Page number must be greater than 0',
      });
    }

    const searchService = getSearchService();
    const results = await searchService.search({ query, type, page });

    res.json({
      query,
      type,
      page,
      results,
      count: results.length,
    });
  } catch (error) {
    console.error('Search endpoint error:', error);
    res.status(500).json({
      error: 'Failed to search content',
    });
  }
});

/**
 * GET /api/search/:source/:externalId
 * Get content details by source and external ID
 * Params:
 *   - source: 'tmdb' or 'anilist'
 *   - externalId: external ID from the source
 * Query params:
 *   - type: content type (optional, helps with TMDB ambiguity)
 */
searchRouter.get('/:source/:externalId', async (req, res) => {
  try {
    const { source, externalId } = req.params;
    const type = req.query.type as 'movie' | 'series' | 'anime' | undefined;

    if (!['tmdb', 'anilist'].includes(source)) {
      return res.status(400).json({
        error: 'Invalid source. Must be either tmdb or anilist',
      });
    }

    const searchService = getSearchService();
    const content = await searchService.getContentDetails(
      source as 'tmdb' | 'anilist',
      externalId,
      type
    );

    res.json(content);
  } catch (error) {
    console.error('Get content details error:', error);
    res.status(404).json({
      error: 'Content not found',
    });
  }
});
