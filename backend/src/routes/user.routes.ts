import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { customListController } from '../controllers/custom-list.controller';
import { followController } from '../controllers/follow.controller';
import { authenticate, optionalAuth } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import {
  updateProfileSchema,
  changePasswordSchema,
} from '../validators/auth.validators';

const router = Router();

/**
 * @route GET /api/users/me
 * @desc Get current user profile
 * @access Private
 */
router.get('/me', authenticate, (req, res) => userController.getMe(req, res));

/**
 * @route PUT /api/users/me
 * @desc Update current user profile
 * @access Private
 */
router.put('/me', authenticate, validate(updateProfileSchema), (req, res) =>
  userController.updateMe(req, res)
);

/**
 * @route PUT /api/users/me/password
 * @desc Change password
 * @access Private
 */
router.put(
  '/me/password',
  authenticate,
  validate(changePasswordSchema),
  (req, res) => userController.changePassword(req, res)
);

/**
 * @route DELETE /api/users/me
 * @desc Delete account
 * @access Private
 */
router.delete('/me', authenticate, (req, res) =>
  userController.deleteMe(req, res)
);

/**
 * @route GET /api/users/me/stats
 * @desc Get current user general statistics
 * @access Private
 * Sprint 6: Comprehensive statistics
 */
router.get('/me/stats', authenticate, (req, res) =>
  userController.getMyStatsGeneral(req, res)
);

/**
 * @route GET /api/users/me/stats/genres
 * @desc Get current user genre statistics
 * @access Private
 * Sprint 6: Genre distribution
 */
router.get('/me/stats/genres', authenticate, (req, res) =>
  userController.getMyStatsGenres(req, res)
);

/**
 * @route GET /api/users/me/stats/timeline
 * @desc Get current user timeline statistics
 * @access Private
 * Sprint 6: Activity timeline and streaks
 */
router.get('/me/stats/timeline', authenticate, (req, res) =>
  userController.getMyStatsTimeline(req, res)
);

/**
 * @route GET /api/users/search
 * @desc Search users by username or display name
 * @query q: search query
 * @access Public
 * Sprint 7: User search functionality
 */
router.get('/search', (req, res) => userController.searchUsers(req, res));

/**
 * @route GET /api/users/:username
 * @desc Get user profile by username (public)
 * @access Public (with optional auth)
 */
router.get('/:username', optionalAuth, (req, res) =>
  userController.getUserByUsername(req, res)
);

/**
 * @route GET /api/users/:username/stats
 * @desc Get user stats (basic)
 * @access Public (with optional auth)
 */
router.get('/:username/stats', optionalAuth, (req, res) =>
  userController.getUserStats(req, res)
);

/**
 * @route GET /api/users/:username/lists
 * @desc Get user's public custom lists
 * @access Public
 * Sprint 7: Public profile lists
 */
router.get('/:username/lists', (req, res) =>
  customListController.getPublicListsByUsername(req, res)
);

/**
 * @route POST /api/users/:username/follow
 * @desc Follow a user
 * @access Private
 * Sprint 8: Follow system
 */
router.post('/:username/follow', authenticate, (req, res) =>
  followController.followUser(req, res)
);

/**
 * @route DELETE /api/users/:username/unfollow
 * @desc Unfollow a user
 * @access Private
 * Sprint 8: Follow system
 */
router.delete('/:username/unfollow', authenticate, (req, res) =>
  followController.unfollowUser(req, res)
);

/**
 * @route GET /api/users/:username/followers
 * @desc Get user's followers list
 * @access Public
 * Sprint 8: Follow system
 */
router.get('/:username/followers', (req, res) =>
  followController.getFollowers(req, res)
);

/**
 * @route GET /api/users/:username/following
 * @desc Get list of users that this user is following
 * @access Public
 * Sprint 8: Follow system
 */
router.get('/:username/following', (req, res) =>
  followController.getFollowing(req, res)
);

/**
 * @route GET /api/users/:username/is-following
 * @desc Check if current user is following target user
 * @access Private
 * Sprint 8: Follow system
 */
router.get('/:username/is-following', authenticate, (req, res) =>
  followController.checkFollowStatus(req, res)
);

export default router;
