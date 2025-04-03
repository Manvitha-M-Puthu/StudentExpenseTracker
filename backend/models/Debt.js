import db from '../utils/db.js';

export const findDebtsByUserId = async (userId) => {
  try {
    const [results] = await db.query(
      'SELECT * FROM debts_loans WHERE user_id = ? ORDER BY due_date ASC',
      [userId]
    );
    
    return results;
  } catch (error) {
    console.error("Error finding debts:", error);
    throw error;
  }
};

export const createDebt = async (debtData) => {
  try {
    const { user_id, amount, debtor_name, debt_type, status, due_date, description } = debtData;
    
    const [result] = await db.query(
      'INSERT INTO debts_loans (user_id, amount, debtor_name, debt_type, status, due_date, description) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [user_id, amount, debtor_name, debt_type, status, due_date, description]
    );
    
    return {
      debt_id: result.insertId,
      ...debtData
    };
  } catch (error) {
    console.error("Error creating debt record:", error);
    throw error;
  }
};

export const updateDebtStatus = async (debtId, status) => {
  try {
    const [result] = await db.query(
      'UPDATE debts_loans SET status = ? WHERE debt_id = ?',
      [status, debtId]
    );
    
    return result.affectedRows > 0;
  } catch (error) {
    console.error("Error updating debt status:", error);
    throw error;
  }
};

export const findDebtById = async (debtId) => {
  try {
    const [results] = await db.query(
      'SELECT * FROM debts_loans WHERE debt_id = ?',
      [debtId]
    );
    
    return results.length > 0 ? results[0] : null;
  } catch (error) {
    console.error("Error finding debt by ID:", error);
    throw error;
  }
};

export const updateWalletBalance = async (userId, amount, isIncoming) => {
  try {
    const adjustedAmount = isIncoming ? amount : -amount;
    
    const [result] = await db.query(
      'UPDATE wallet SET current_balance = current_balance + ? WHERE user_id = ?',
      [adjustedAmount, userId]
    );
    
    return result.affectedRows > 0;
  } catch (error) {
    console.error("Error updating wallet balance:", error);
    throw error;
  }
};