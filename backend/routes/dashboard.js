import { Router } from 'express';
const router = Router();
import { getDashboardData } from '../controllers/dashboardController.js';
import { authenticateToken } from '../middleware/auth.js';

// Get dashboard data
router.get('/', authenticateToken, getDashboardData);

export default router; 