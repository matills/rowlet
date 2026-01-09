import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import userListRoutes from './user-list.routes';
import customListRoutes from './custom-list.routes';
import collaboratorRoutes from './collaborator.routes';
import activityRoutes from './activity.routes';
import mediaRoutes from './media.routes';
import externalRoutes from './external.routes';
import { customListController } from '../controllers/custom-list.controller';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/users', userListRoutes);

router.get('/users/:username/lists', (req, res) =>
  customListController.getPublicListsByUsername(req, res)
);

router.use('/lists', customListRoutes);
router.use('/', collaboratorRoutes);
router.use('/', activityRoutes);
router.use('/media', mediaRoutes);
router.use('/external', externalRoutes);

router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

export default router;
