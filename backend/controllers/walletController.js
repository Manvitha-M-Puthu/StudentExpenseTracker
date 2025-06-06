import { createWallet, findWalletByUserId, updateWallet} from '../models/Wallet.js'; 

export const getWalletHandler = async (req, res) => {
    try {
        const userId = req.user.id;
        const wallet = await findWalletByUserId(userId);

        if (!wallet) {
            return res.status(200).json({
                success: true,
                data: {
                    current_balance: 0,
                    initial_balance: 0
                }
            });
        }
        return res.status(200).json({
            success: true,
            data: wallet
        });
    } catch (error) {
        console.error("Error fetching wallet:", error);
        return res.status(500).json({ 
            success: false,
            message: "Internal server error" 
        });
    }
};

export const createWalletHandler = async (req, res) => {
    try {
        const userId = req.user.id;
        const { initial_balance } = req.body;

        const existingWallet = await findWalletByUserId(userId);
        if (existingWallet) {
            return res.status(200).json({
                success: true,
                data: existingWallet
            });
        }

        const wallet = await createWallet({ 
            userId, 
            initial_balance: initial_balance || 0 
        });
        
        res.status(201).json({
            success: true,
            data: wallet
        });
    } catch (error) {
        console.error("Error creating wallet:", error);
        res.status(500).json({ 
            success: false,
            message: "Internal Server Error" 
        });
    }
};

export const updateWalletHandler = async (req, res) => {
    try {
        const userId = req.user.id;
        const { current_balance } = req.body;

        if (current_balance === undefined) {
            return res.status(400).json({ 
                success: false,
                message: "Current balance is required" 
            });
        }

        const existingWallet = await findWalletByUserId(userId);
        if (!existingWallet) {
            return res.status(404).json({ 
                success: false,
                message: "Wallet not found" 
            });
        }

        // Ensure the new balance is a valid number
        const newBalance = parseFloat(current_balance);
        if (isNaN(newBalance)) {
            return res.status(400).json({
                success: false,
                message: "Invalid balance amount"
            });
        }

        // Prevent negative balance
        if (newBalance < 0) {
            return res.status(400).json({
                success: false,
                message: "Balance cannot be negative"
            });
        }

        // Update the wallet with the new balance
        const updatedWallet = await updateWallet(userId, newBalance);
        
        if (!updatedWallet) {
            throw new Error("Failed to update wallet");
        }

        return res.status(200).json({
            success: true,
            data: {
                current_balance: parseFloat(updatedWallet.current_balance),
                initial_balance: parseFloat(updatedWallet.initial_balance)
            }
        });
    } catch (error) {
        console.error("Error updating wallet:", error);
        return res.status(500).json({ 
            success: false,
            message: "Internal server error" 
        });
    }
};