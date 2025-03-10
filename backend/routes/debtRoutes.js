import express from 'express';
import { createDebtHandler, getDebtsHandler } from '../controllers/debtController.js';

const router = express.Router();

router.post('/debt', createDebtHandler);
router.get('/debt/:userId', getDebtsHandler);

export default router;