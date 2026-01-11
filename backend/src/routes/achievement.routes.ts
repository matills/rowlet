import { Router } from 'express';
import { achievementController } from '../controllers/achievement.controller';
import { authenticate, optionalAuth } from '../middlewares/auth';

const router = Router();

/**
 * @route GET /api/achievements
 * @desc Get all achievements
 * @query rarity: Filter by rarity (common, rare, epic, legendary)
 * @query is_hidden: Filter by hidden status (true/false)
 * @query is_active: Filter by active status (true/false), default: true
 * @query limit: Results per page
 * @query offset: Pagination offset
 * @access Public
 */
router.get('/', (req, res) => achievementController.getAllAchievements(req, res));

/**
 * @route GET /api/achievements/stats
 * @desc Get achievement statistics (unlock counts, percentages)
 * @access Public
 */
router.get('/stats', (req, res) => achievementController.getAchievementStats(req, res));

/**
 * @route GET /api/achievements/leaderboard
 * @desc Get achievement leaderboard (users with most achievements)
 * @query limit: Number of users to return, default: 10
 * @access Public
 */
router.get('/leaderboard', (req, res) => achievementController.getAchievementLeaderboard(req, res));

/**
 * @route GET /api/achievements/:id
 * @desc Get a single achievement by ID
 * @access Public
 */
router.get('/:id', (req, res) => achievementController.getAchievementById(req, res));

export default router;
