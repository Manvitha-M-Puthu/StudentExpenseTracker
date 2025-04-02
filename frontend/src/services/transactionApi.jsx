import API from './axiosInstance';

/**
 * Transaction API Service
 * Centralized service for all transaction-related API calls
 */

// Get all transactions for a user
export const getUserTransactions = async () => {
  try {
    const response = await API.get('/api/transactions');
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
export const updateTransaction = async (transactionId, transactionData) => {
  try {
    const response = await API.put(
      `/api/transactions/${transactionId}`,
      transactionData
    );
    return response.data;
  } catch (error) {
    console.error('Error updating transaction:', error);
    throw error;
  }
};

// Delete a transaction
export const deleteTransaction = async (transactionId) => {
  try {
    const response = await API.delete(`/api/transactions/${transactionId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting transaction:', error);
    throw error;
  }
};

// Get budget summary
export const getBudgetSummary = async () => {
  try {
    const response = await API.get('/api/transactions/budget/summary');
    return response.data;
  } catch (error) {
    console.error('Error fetching budget summary:', error);
    throw error;
  }
};

// Get monthly transactions summary
export const getMonthlyTransactions = async () => {
  try {
    const response = await API.get('/api/transactions/monthly');
    return response.data;
  } catch (error) {
    console.error('Error fetching monthly transactions:', error);
    throw error;
  }
};

// Export default object with all functions
export default {
  getUserTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getBudgetSummary,
  getMonthlyTransactions
};
