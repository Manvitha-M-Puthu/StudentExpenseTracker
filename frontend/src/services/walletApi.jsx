import API from './axiosInstance';

/**
 * Wallet API Service
 * Centralized service for all wallet-related API calls
 */

// Get user wallet
export const getUserWallet = async (userId) => {
  try {
    const response = await API.get(`/api/wallet/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching wallet:', error);
    throw error;
  }
};

// Create a new wallet
export const createWallet = async (userId, initialBalance) => {
  try {
    const response = await API.post('/api/wallet', {
      userId,
      initial_balance: parseFloat(initialBalance) || 0
    });
    return response.data;
  } catch (error) {
    console.error('Error creating wallet:', error);
    throw error;
  }
};

// Update wallet balance
export const updateWalletBalance = async (userId, newBalance) => {
  try {
    const response = await API.put(`/api/wallet/${userId}`, {
      current_balance: parseFloat(newBalance)
    });
    return response.data;
  } catch (error) {
    console.error('Error updating wallet balance:', error);
    throw error;
  }
};

// Export default object with all functions
export default {
  getUserWallet,
  createWallet,
  updateWalletBalance
}; 