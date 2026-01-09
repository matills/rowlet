import { Router } from 'express';
import { activityController } from '../controllers/activity.controller';
import { authenticate, optionalAuth } from '../middlewares/auth';
import { validateQuery } from '../middlewares/validate';
import {
  getFeedQuerySchema,
  getUserActivityQuerySchema,
} from '../validators/activity.validators';

const router = Router();

router.get(
  '/feed',
  authenticate,
  validateQuery(getFeedQuerySchema),
  (req, res) => activityController.getFeed(req, res)
);

router.get(
  '/users/me/activity',
  authenticate,
  validateQuery(getUserActivityQuerySchema),
  (req, res) => activityController.getMyActivity(req, res)
);

router.get(
  '/users/:username/activity',
  optionalAuth,
  validateQuery(getUserActivityQuerySchema),
  (req, res) => activityController.getUserActivity(req, res)
);

router.delete(
  '/activity/:activityId',
  authenticate,
  (req, res) => activityController.deleteActivity(req, res)
);

export default router;
