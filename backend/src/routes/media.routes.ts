import { Router } from 'express';
import { mediaController } from '../controllers/media.controller';
import { validate, validateQuery } from '../middlewares/validate';
import { authenticate, optionalAuth } from '../middlewares/auth';
import {
  MediaSearchSchema,
  CreateMediaSchema,
  UpdateMediaSchema,
} from '../validators/media.validators';

const router = Router();

/**
 * @route GET /api/media/trending
 * @desc Get trending content
 * @access Public
 */
router.get('/trending', (req, res) => mediaController.getTrending(req, res));

/**
 * @route GET /api/media/popular
 * @desc Get popular content
 * @access Public
 */
router.get('/popular', (req, res) => mediaController.getPopular(req, res));

/**
 * @route GET /api/media
 * @desc Search media with filters and pagination
 * @access Public
 */
router.get('/', (req, res) => mediaController.search(req, res));

/**
 * @route GET /api/media/:id
 * @desc Get media by ID with seasons (if series/anime)
 * @access Public
 */
router.get('/:id', (req, res) => mediaController.getById(req, res));

/**
 * @route POST /api/media
 * @desc Create new media (admin only - TODO: add admin middleware)
 * @access Private/Admin
 */
router.post(
  '/',
  authenticate,
  validate(CreateMediaSchema),
  (req, res) => mediaController.create(req, res)
);

/**
 * @route PUT /api/media/:id
 * @desc Update media (admin only - TODO: add admin middleware)
 * @access Private/Admin
 */
router.put(
  '/:id',
  authenticate,
  validate(UpdateMediaSchema),
  (req, res) => mediaController.update(req, res)
);

/**
 * @route DELETE /api/media/:id
 * @desc Delete media (admin only - TODO: add admin middleware)
 * @access Private/Admin
 */
router.delete(
  '/:id',
  authenticate,
  (req, res) => mediaController.delete(req, res)
);

/**
 * @route GET /api/media/:id/seasons
 * @desc Get all seasons for a series/anime
 * @access Public
 */
router.get('/:id/seasons', (req, res) => mediaController.getSeasons(req, res));

/**
 * @route GET /api/media/:id/seasons/:seasonNumber/episodes
 * @desc Get all episodes for a season
 * @access Public
 */
router.get('/:id/seasons/:seasonNumber/episodes', (req, res) =>
  mediaController.getEpisodes(req, res)
);

export default router;
