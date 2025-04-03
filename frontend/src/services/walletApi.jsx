import API from './axiosInstance';

/**
 * Wallet API Service
 * Centralized service for all wallet-related API calls
 */

// Get user wallet
export const getUserWallet = async () => {
  try {
    const response = await API.get('/api/wallet/balance');
    // Return the response even if no wallet exists
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      // Return a default structure for non-existent wallet
      return {
        success: true,
        data: {
          current_balance: 0,
          initial_balance: 0
        }
      };
    }
    console.error('Error fetching wallet:', error);
    throw error;
  }
};

// Create a new wallet
export const createWallet = async (initialBalance) => {
  try {
    const response = await API.post('/api/wallet', {
      initial_balance: parseFloat(initialBalance) || 0
    });
    return response.data;
  } catch (error) {
    console.error('Error creating wallet:', error);
    throw error;
  }
};

// Update wallet balance
export const updateWalletBalance = async (newBalance) => {
  try {
    const response = await API.put('/api/wallet', {
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