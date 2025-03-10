import express from 'express';
import { createTransactionHandler, getTransactionsHandler } from '../controllers/transactionController.js';

const router = express.Router();

router.post('/transaction', createTransactionHandler);
router.get('/transaction/:userId', getTransactionsHandler);

export default router;