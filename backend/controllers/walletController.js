import { createWallet, findWalletByUserId } from '../models/Wallet.js'; 

export const getWalletHandler = async (req, res) => {

    try {
        const wallet = await findWalletByUserId(req.params.userId);

        if (!wallet) {
            return res.status(404).json({ message: "Wallet not found" });
        }
        return res.status(200).json(wallet);
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
};


export const createWalletHandler = async (req, res) => {
    try {
        const { userId, initial_balance } = req.body;

        const existingWallet = await findWalletByUserId(userId);
        if (existingWallet) {
            return res.status(200).json(existingWallet);
        }

        const wallet = await createWallet({ userId, initial_balance });
        res.status(201).json(wallet);
    } catch (error) {
        console.error("Error creating wallet:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
