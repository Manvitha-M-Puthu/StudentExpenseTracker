import API from './axiosInstance';

/**
 * Transaction API Service
 * Centralized service for all transaction-related API calls
 */

// Get all transactions for a user
export const getUserTransactions = async (userId) => {
  try {
    const response = await API.get(`/api/transactions/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching transactions:', error);
    throw error;
  }
};

// Create a new transaction
export const createTransaction = async (transactionData) => {
  try {
    const response = await API.post('/api/transactions', transactionData);
    return response.data;
  } catch (error) {
    console.error('Error creating transaction:', error);
    throw error;
  }
};

// Update an existing transaction
export const updateTransaction = async (userId, transactionId, transactionData) => {
  try {
    const response = await API.put(
      `/api/transactions/${userId}/${transactionId}`,
      transactionData
    );
    return response.data;
  } catch (error) {
    console.error('Error updating transaction:', error);
    throw error;
  }
};

// Delete a transaction
export const deleteTransaction = async (userId, transactionId) => {
  try {
    const response = await API.delete(`/api/transactions/${userId}/${transactionId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting transaction:', error);
    throw error;
  }
};

// Export default object with all functions
export default {
  getUserTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction
};
