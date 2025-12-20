import { Router } from 'express';
import { userController } from '../controllers/user.controller';
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
 * @route GET /api/users/:username
 * @desc Get user profile by username (public)
 * @access Public (with optional auth)
 */
router.get('/:username', optionalAuth, (req, res) =>
  userController.getUserByUsername(req, res)
);

/**
 * @route GET /api/users/:username/stats
 * @desc Get user stats
 * @access Public (with optional auth)
 */
router.get('/:username/stats', optionalAuth, (req, res) =>
  userController.getUserStats(req, res)
);

export default router;
