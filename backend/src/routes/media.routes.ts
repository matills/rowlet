import { Router } from 'express';
import { mediaController } from '../controllers/media.controller';

const router = Router();

/**
 * @route GET /api/v1/media/trending
 * @desc Get trending content from database
 * @access Public
 */
router.get('/trending', (req, res) => mediaController.getTrending(req, res));

/**
 * @route GET /api/v1/media/popular
 * @desc Get popular content from database
 * @access Public
 */
router.get('/popular', (req, res) => mediaController.getPopular(req, res));

/**
 * @route GET /api/v1/media
 * @desc Search media in database with filters and pagination
 * @access Public
 */
router.get('/', (req, res) => mediaController.search(req, res));

/**
 * @route GET /api/v1/media/:id
 * @desc Get media by ID with seasons (if series/anime)
 * @access Public
 */
router.get('/:id', (req, res) => mediaController.getById(req, res));

/**
 * @route GET /api/v1/media/:id/seasons
 * @desc Get all seasons for a series/anime
 * @access Public
 */
router.get('/:id/seasons', (req, res) => mediaController.getSeasons(req, res));

/**
 * @route GET /api/v1/media/:id/seasons/:seasonNumber/episodes
 * @desc Get all episodes for a season
 * @access Public
 */
router.get('/:id/seasons/:seasonNumber/episodes', (req, res) =>
  mediaController.getEpisodes(req, res)
);

export default router;
