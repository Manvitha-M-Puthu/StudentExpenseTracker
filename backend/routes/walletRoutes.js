import express from 'express';
import { createWalletHandler, getWalletHandler, updateWalletHandler } from '../controllers/walletController.js';

const router = express.Router();

router.post('/', createWalletHandler);  
router.get('/:userId', getWalletHandler); 
router.put('/:userId', updateWalletHandler);

export default router;
