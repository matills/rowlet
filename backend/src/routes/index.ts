import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import userListRoutes from './user-list.routes';
import mediaRoutes from './media.routes';
import externalRoutes from './external.routes';

const router = Router();

// API Routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/users', userListRoutes); // User list endpoints
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
