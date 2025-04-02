import express from 'express';
import { getDebtsHandler, createDebtHandler, updateDebtStatusHandler } from '../controllers/debtController.js';
import { authenticateToken } from '../middleware/auth.js';
import db  from '../utils/db.js';

const router = express.Router();

router.get('/:userId', getDebtsHandler);

router.post('/', createDebtHandler);

router.put('/:debtId', updateDebtStatusHandler);

// Get upcoming debt payments
router.get('/upcoming', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const query = `
            SELECT 
                debt_id,
                debtor_name,
                amount,
                due_date,
                debt_type,
                status
            FROM debts_loans
            WHERE user_id = ?
            AND status = 'pending'
            AND due_date >= CURRENT_DATE
            ORDER BY due_date ASC
            LIMIT 5
        `;
        
        const [results] = await db.query(query, [userId]);
        
        res.json({
            success: true,
            data: results
        });
    } catch (error) {
        console.error('Error fetching upcoming debts:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching upcoming debts'
        });
    }
});

export default router;