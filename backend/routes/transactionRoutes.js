import express from "express";
import {
  createTransactionHandler,
  getTransactionsHandler,
  getTransactionHandler,
  updateTransactionHandler,
  deleteTransactionHandler,
  getBudgetSummaryHandler,
  getRecentTransactionsHandler
} from "../controllers/transactionController.js";
import { authenticateToken } from '../middleware/auth.js';
import db from '../utils/db.js';

const router = express.Router();

// Create transaction
router.post('/', authenticateToken, createTransactionHandler);

// Get all transactions for user
router.get('/', authenticateToken, getTransactionsHandler);

// Get specific transaction
router.get('/:transactionId', authenticateToken, getTransactionHandler);

// Update transaction
router.put('/:transactionId', authenticateToken, updateTransactionHandler);

// Delete transaction
router.delete('/:transactionId', authenticateToken, deleteTransactionHandler);

// Get budget summary
router.get('/budget/summary', authenticateToken, getBudgetSummaryHandler);

// Get monthly transactions summary
router.get('/monthly', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const query = `
            SELECT 
                DATE_FORMAT(transaction_date, '%Y-%m') as month,
                SUM(CASE WHEN transaction_type = 'income' THEN amount ELSE 0 END) as income,
                SUM(CASE WHEN transaction_type = 'expense' THEN amount ELSE 0 END) as expenses
            FROM transactions
            WHERE user_id = ?
            AND transaction_date >= DATE_SUB(CURRENT_DATE, INTERVAL 6 MONTH)
            GROUP BY DATE_FORMAT(transaction_date, '%Y-%m')
            ORDER BY month ASC
        `;
        
        const [results] = await db.query(query, [userId]);
        
        res.json({
            success: true,
            data: results
        });
    } catch (error) {
        console.error('Error fetching monthly transactions:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching monthly transactions'
        });
    }
});

// Get recent transactions
router.get('/recent', authenticateToken, getRecentTransactionsHandler);

export default router;