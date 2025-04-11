import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { 
  createTransactionHandler,
  getTransactionsHandler,
  getTransactionHandler,
  updateTransactionHandler,
  deleteTransactionHandler,
  getRecentTransactionsHandler,
  getBudgetSummaryHandler
} from '../controllers/transactionController.js';

const router = express.Router();

// Get recent transactions
router.get('/recent', authenticateToken, getRecentTransactionsHandler);

// ... existing code ... 