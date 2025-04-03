import db from '../utils/db.js';

export const createWallet = async ({ userId, initial_balance }) => {
  try {
    // Check if wallet already exists
    const existingWallet = await findWalletByUserId(userId);
    if (existingWallet) {
      return existingWallet;
    }

  
    const [result] = await db.query(
      'INSERT INTO wallet (user_id, initial_balance, current_balance) VALUES (?, ?, ?)',
      [userId, initial_balance, initial_balance]
    );
    
    return {
      wallet_id: result.insertId,
      user_id: userId,
      initial_balance,
      current_balance: initial_balance
    };
  } catch (error) {
    console.error("Error creating wallet:", error);
    throw error;
  }
};

export const findWalletByUserId = async (userId) => {
  try {
 
    const [results] = await db.query(
      'SELECT * FROM wallet WHERE user_id = ?',
      [userId]
    );
    
    return results.length > 0 ? results[0] : null;
  } catch (error) {
    console.error("Error finding wallet:", error);
    throw error;
  }
};

export const updateWallet = async (userId, currentBalance) => {
  try {
    await db.query(
      'UPDATE wallet SET current_balance = ? WHERE user_id = ?',
      [currentBalance, userId]
    );
    
    // Return the updated wallet
    return await findWalletByUserId(userId);
  } catch (error) {
    console.error("Error updating wallet:", error);
    throw error;
  }
};