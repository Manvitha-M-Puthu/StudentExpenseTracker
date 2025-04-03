import express from "express";
import {
  createBudgetHandler,
  getBudgetHandler,
  updateBudgetHandler,
  deleteBudgetHandler,
} from "../controllers/budgetController.js";
import {
  createCategoryHandler,
  getCategoriesHandler,
} from "../controllers/categoryController.js";
import { authenticateToken } from '../middleware/auth.js';
import db from '../utils/db.js';

const router = express.Router();

// Category routes
router.post("/categories", authenticateToken, createCategoryHandler);
router.get("/categories", authenticateToken, getCategoriesHandler);

// Budget routes
router.post("/", authenticateToken, createBudgetHandler);
router.get("/", authenticateToken, getBudgetHandler);
router.put("/:budgetId", authenticateToken, updateBudgetHandler);
router.delete("/:budgetId", authenticateToken, deleteBudgetHandler);

// Get budget progress
router.get('/progress', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const query = `
            SELECT 
                b.amount as total_budget,
                COALESCE(SUM(t.amount), 0) as spent_amount
            FROM budget b
            LEFT JOIN transactions t ON b.budget_id = t.budget_id
            WHERE b.user_id = ?
            AND b.start_date <= CURRENT_DATE
            AND b.end_date >= CURRENT_DATE
            GROUP BY b.budget_id
        `;
        
        const [results] = await db.query(query, [userId]);
        const budgetData = results[0] || { total_budget: 0, spent_amount: 0 };
        const percentage = budgetData.total_budget > 0 
            ? Math.round((budgetData.spent_amount / budgetData.total_budget) * 100)
            : 0;

        res.json({
            success: true,
            percentage,
            spent: budgetData.spent_amount,
            total: budgetData.total_budget
        });
    } catch (error) {
        console.error('Error fetching budget progress:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching budget progress'
        });
    }
});

export default router;
