import { createDebt, findDebtsByUserId, updateDebtStatus, findDebtById, updateWalletBalance } from '../models/Debt.js';
import { findWalletByUserId } from '../models/Wallet.js';

export const getDebtsHandler = async (req, res) => {
  try {
    const userId = req.params.userId;
    const debts = await findDebtsByUserId(userId);
    return res.status(200).json(debts);
  } catch (error) {
    console.error("Error fetching debts:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const createDebtHandler = async (req, res) => {
  try {
    const { user_id, amount, debtor_name, debt_type, status, due_date, description } = req.body;
   
    if (!user_id || !amount || !debtor_name || !debt_type || !status || !due_date) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    
    const newDebt = await createDebt({
      user_id,
      amount,
      debtor_name,
      debt_type,
      status,
      due_date,
      description
    });
    
    return res.status(201).json(newDebt);
  } catch (error) {
    console.error("Error creating debt:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updateDebtStatusHandler = async (req, res) => {
  try {
    const debtId = req.params.debtId;
    const { status, user_id, debt_type, amount } = req.body;
    
    const currentDebt = await findDebtById(debtId);
    
    if (!currentDebt) {
      return res.status(404).json({ message: "Debt record not found" });
    }
    
    if (currentDebt.status === status) {
      return res.status(400).json({ message: "Status is already set to " + status });
    }
    
    const updated = await updateDebtStatus(debtId, status);
    
    if (!updated) {
      return res.status(500).json({ message: "Failed to update status" });
    }
    
    if (status === 'paid' && currentDebt.status === 'pending') {

      const wallet = await findWalletByUserId(user_id);
      
      if (!wallet) {
        return res.status(404).json({ message: "Wallet not found" });
      }
      
      const isIncoming = debt_type === 'incoming';
      await updateWalletBalance(user_id, parseFloat(amount), isIncoming);
    }
    
    return res.status(200).json({ message: "Status updated successfully" });
  } catch (error) {
    console.error("Error updating debt status:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};