import { createWallet, findWalletByUserId } from '../models/wallet.js'; 

export const getWalletHandler = async (req, res) => {
    console.log(`🟢 API Request received for user: ${req.params.userId}`);

    try {
        const wallet = await findWalletByUserId(req.params.userId);

        if (!wallet) {
            console.log("❌ No wallet found for user:", req.params.userId);
            return res.status(404).json({ message: "Wallet not found" });
        }

        console.log("✅ Wallet found:", wallet);
        return res.status(200).json(wallet);
    } catch (error) {
        console.error("❌ Error fetching wallet:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};


// Create wallet only if it does not exist
export const createWalletHandler = async (req, res) => {
    try {
        const { userId, initial_balance } = req.body;

        // Check if wallet already exists
        const existingWallet = await findWalletByUserId(userId);
        if (existingWallet) {
            return res.status(200).json(existingWallet); // Return existing wallet
        }

        // Create new wallet if none exists
        const wallet = await createWallet({ userId, initial_balance });
        res.status(201).json(wallet);
    } catch (error) {
        console.error("Error creating wallet:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
