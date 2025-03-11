import express from 'express';
import { createWalletHandler, getWalletHandler } from '../controllers/walletController.js';

const router = express.Router();

router.post('/', createWalletHandler);  
router.get('/:userId', getWalletHandler); 

export default router;
