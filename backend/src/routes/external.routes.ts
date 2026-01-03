import { Router } from 'express';
import { mediaController } from '../controllers/media.controller';
import { validate, validateQuery } from '../middlewares/validate';
import { authenticate } from '../middlewares/auth';
import {
  ExternalSearchSchema,
  ImportMediaSchema,
} from '../validators/media.validators';

const router = Router();

/**
 * @route GET /api/external/search
 * @desc Search external APIs (TMDB, AniList)
 * @query query, type, page
 * @access Public
 */
router.get('/search', (req, res) => mediaController.searchExternal(req, res));

/**
 * @route POST /api/external/import
 * @desc Import media from external API to database
 * @body { externalId, source, type }
 * @access Private (requires authentication)
 */
router.post(
  '/import',
  authenticate,
  validate(ImportMediaSchema),
  (req, res) => mediaController.importMedia(req, res)
);

export default router;
