import API from './axiosInstance';

/**
 * Budget API Service
 * Centralized service for all budget-related API calls
 */

// Get all budgets for a user
export const getUserBudgets = async (userId) => {
  try {
    const response = await API.get(`/api/budgets/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching budgets:', error);
    throw error;
  }
};

// Create a new budget
export const createBudget = async (budgetData) => {
  try {
    const response = await API.post('/api/budgets', budgetData);
    return response.data;
  } catch (error) {
    console.error('Error creating budget:', error);
    throw error;
  }
};

// Update an existing budget
export const updateBudget = async (userId, budgetId, budgetData) => {
  try {
    const response = await API.put(
      `/api/budgets/${userId}/${budgetId}`,
      budgetData
    );
    return response.data;
  } catch (error) {
    console.error('Error updating budget:', error);
    throw error;
  }
};

// Delete a budget
export const deleteBudget = async (userId, budgetId) => {
  try {
    const response = await API.delete(`/api/budgets/${userId}/${budgetId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting budget:', error);
    throw error;
  }
};

// Export default object with all functions
export default {
  getUserBudgets,
  createBudget,
  updateBudget,
  deleteBudget
};
