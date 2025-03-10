import { createWallet, findWalletByUserId } from '../models/Wallet.js';

export const createWalletHandler = async (req, res) => {
    const { userId, balance } = req.body;
    try {
        const walletId = await createWallet({ userId, balance });
        res.status(201).json({ walletId });
    } catch (error) {
        res.status(500).json({ error: 'Error creating wallet' });
    }
};

export const getWalletHandler = async (req, res) => {
    const { userId } = req.params;
    try {
        const wallet = await findWalletByUserId(userId);
        res.status(200).json(wallet);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching wallet' });
    }
};