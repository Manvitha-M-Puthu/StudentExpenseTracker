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

const router = express.Router();

// Create a new saving goal - no middleware
router.post('/saving-goals', createSavingGoal);

// Get all saving goals for a user - passing userId as query param
router.get('/saving-goals', getAllSavingGoals);

// Get a specific saving goal by ID
router.get('/saving-goals/:id', getSavingGoalById);

// Update a saving goal
router.put('/saving-goals/:id', updateSavingGoal);

// Delete a saving goal
router.delete('/saving-goals/:id', deleteSavingGoal);

// Get summary statistics for user's goals
router.get('/saving-goals-summary', getSavingGoalsSummary);

export default router;