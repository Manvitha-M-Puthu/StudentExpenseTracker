import express from 'express';
import { getDebtsHandler, createDebtHandler, updateDebtStatusHandler } from '../controllers/debtController.js';

const router = express.Router();

router.get('/:userId', getDebtsHandler);

router.post('/', createDebtHandler);

router.put('/:debtId', updateDebtStatusHandler);

export default router;