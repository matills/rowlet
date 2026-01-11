import { Router } from 'express';
import { notificationController } from '../controllers/notification.controller';
import { authenticate } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { UpdateNotificationPreferencesSchema } from '../validators/notification.validators';

const router = Router();

router.get('/', authenticate, notificationController.getNotifications);
router.get('/unread-count', authenticate, notificationController.getUnreadCount);
router.put('/read-all', authenticate, notificationController.markAllAsRead);
router.put('/:id/read', authenticate, notificationController.markAsRead);
router.delete('/:id', authenticate, notificationController.deleteNotification);

router.get('/preferences', authenticate, notificationController.getPreferences);
router.put(
  '/preferences',
  authenticate,
  validate(UpdateNotificationPreferencesSchema),
  notificationController.updatePreferences
);

export default router;
