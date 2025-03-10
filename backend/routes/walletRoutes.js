import express from 'express';
import { createWalletHandler, getWalletHandler } from '../controllers/walletController.js';

const router = express.Router();

router.post('/wallet', createWalletHandler);
router.get('/wallet/:userId', getWalletHandler);

export default router;