import { Router } from 'express';
import { userListController } from '../controllers/user-list.controller';
import { authenticate } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import {
  AddToListSchema,
  UpdateListItemSchema,
  UpdateProgressSchema,
} from '../validators/user-list.validators';

const router = Router();

/**
 * @route GET /api/v1/users/me/list
 * @desc Get current user's full media list with all statuses
 * @access Private
 */
router.get('/me/list', authenticate, (req, res) =>
  userListController.getMyList(req, res)
);

/**
 * @route GET /api/v1/users/me/list/:status
 * @desc Get current user's media list filtered by status
 * @query status: watching | completed | plan_to_watch | on_hold | dropped
 * @access Private
 */
router.get('/me/list/:status', authenticate, (req, res) =>
  userListController.getMyListByStatus(req, res)
);

/**
 * @route POST /api/v1/users/me/list
 * @desc Add media to user's list
 * @body { mediaId, status, score?, notes? }
 * @access Private
 */
router.post('/me/list', authenticate, validate(AddToListSchema), (req, res) =>
  userListController.addToList(req, res)
);

/**
 * @route PUT /api/v1/users/me/list/:mediaId
 * @desc Update media in user's list (change status, score, notes)
 * @body { status?, score?, notes? }
 * @access Private
 */
router.put(
  '/me/list/:mediaId',
  authenticate,
  validate(UpdateListItemSchema),
  (req, res) => userListController.updateListItem(req, res)
);

/**
 * @route PATCH /api/v1/users/me/list/:mediaId/progress
 * @desc Update viewing progress (episodes watched)
 * @body { episodesWatched }
 * @access Private
 */
router.patch(
  '/me/list/:mediaId/progress',
  authenticate,
  validate(UpdateProgressSchema),
  (req, res) => userListController.updateProgress(req, res)
);

/**
 * @route DELETE /api/v1/users/me/list/:mediaId
 * @desc Remove media from user's list
 * @access Private
 */
router.delete('/me/list/:mediaId', authenticate, (req, res) =>
  userListController.removeFromList(req, res)
);

/**
 * @route GET /api/v1/users/:username/list
 * @desc Get public user's media list (if profile is public)
 * @access Public
 */
router.get('/:username/list', (req, res) =>
  userListController.getUserList(req, res)
);

/**
 * @route GET /api/v1/users/:username/list/:status
 * @desc Get public user's media list by status
 * @access Public
 */
router.get('/:username/list/:status', (req, res) =>
  userListController.getUserListByStatus(req, res)
);

/**
 * @route GET /api/v1/users/me/stats
 * @desc Get current user's statistics (total watched, avg score, etc.)
 * @access Private
 */
router.get('/me/stats', authenticate, (req, res) =>
  userListController.getMyStats(req, res)
);

export default router;
