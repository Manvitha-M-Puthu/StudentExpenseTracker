// src/routes/savingGoalRoutes.js
import express from 'express';
import { 
  createSavingGoal,
  getAllSavingGoals,
  getSavingGoalById,
  updateSavingGoal,
  deleteSavingGoal,
  getSavingGoalsSummary
} from '../controllers/goalsController.js';
import { authenticateToken } from '../middleware/auth.js';
import db from '../utils/db.js';

const router = express.Router();

// Create a new saving goal
router.post('/', authenticateToken, createSavingGoal);

// Get all saving goals for user
router.get('/', authenticateToken, getAllSavingGoals);

// Get specific saving goal
router.get('/:goalId', authenticateToken, getSavingGoalById);

// Update saving goal
router.put('/:goalId', authenticateToken, updateSavingGoal);

// Delete saving goal
router.delete('/:goalId', authenticateToken, deleteSavingGoal);

// Get saving goals summary
router.get('/summary', authenticateToken, getSavingGoalsSummary);

// Get savings progress
router.get('/savings/progress', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const query = `
            SELECT 
                SUM(target_amount) as total_target,
                SUM(saved_amount) as total_saved
            FROM saving_goals
            WHERE user_id = ? AND status = 'active'
        `;
        
        const [results] = await db.query(query, [userId]);
        const savingsData = results[0] || { total_target: 0, total_saved: 0 };
        const percentage = savingsData.total_target > 0 
            ? Math.round((savingsData.total_saved / savingsData.total_target) * 100)
            : 0;

        res.json({
            success: true,
            percentage,
            saved: savingsData.total_saved,
            target: savingsData.total_target
        });
    } catch (error) {
        console.error('Error fetching savings progress:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching savings progress'
        });
    }
});

export default router;