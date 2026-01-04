import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import userListRoutes from './user-list.routes';
import customListRoutes from './custom-list.routes';
import mediaRoutes from './media.routes';
import externalRoutes from './external.routes';
import { customListController } from '../controllers/custom-list.controller';

const router = Router();

// API Routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/users', userListRoutes); // User media list endpoints

// Public route for user's custom lists (must be before /lists to avoid route conflict)
router.get('/users/:username/lists', (req, res) =>
  customListController.getPublicListsByUsername(req, res)
);

router.use('/lists', customListRoutes); // Custom lists endpoints
router.use('/media', mediaRoutes);
router.use('/external', externalRoutes);

// Health check (already in main index.ts, but can be here too)
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

export default router;
