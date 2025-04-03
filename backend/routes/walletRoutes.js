import express from 'express';
import { createWalletHandler, getWalletHandler, updateWalletHandler } from '../controllers/walletController.js';
import { authenticateToken } from '../middleware/auth.js';
import db from '../utils/db.js';

const router = express.Router();

// Get wallet balance
router.get('/balance', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const query = 'SELECT current_balance, initial_balance FROM wallet WHERE user_id = ?';
        
        const [result] = await db.query(query, [userId]);
        
        if (!result || result.length === 0) {
            return res.json({
                success: true,
                data: {
                    current_balance: 0,
                    initial_balance: 0
                }
            });
        }

        res.json({
            success: true,
            data: {
                current_balance: result[0].current_balance,
                initial_balance: result[0].initial_balance
            }
        });
    } catch (error) {
        console.error('Error fetching wallet balance:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching wallet balance'
        });
    }
});

// Create wallet
router.post('/', authenticateToken, createWalletHandler);

// Get wallet details
router.get('/', authenticateToken, getWalletHandler);

// Update wallet
router.put('/', authenticateToken, updateWalletHandler);

export default router;
