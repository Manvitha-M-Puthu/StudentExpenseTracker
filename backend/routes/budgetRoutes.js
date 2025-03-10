import express from 'express';
import { createBudgetHandler, getBudgetHandler } from '../controllers/budgetController.js';

const router = express.Router();

router.post('/budget', createBudgetHandler);
router.get('/budget/:userId', getBudgetHandler);

export default router;