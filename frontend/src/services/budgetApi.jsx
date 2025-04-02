import API from './axiosInstance';

/**
 * Budget API Service
 * Centralized service for all budget-related API calls
 */

// Get all budgets for a user
export const getUserBudgets = async () => {
  try {
    const response = await API.get('/api/budget');
    return response.data;
  } catch (error) {
    console.error('Error fetching budgets:', error);
    throw error;
  }
};

// Create a new budget
export const createBudget = async (budgetData) => {
  try {
    const response = await API.post('/api/budget', budgetData);
    return response.data;
  } catch (error) {
    console.error('Error creating budget:', error);
    throw error;
  }
};

// Update an existing budget
export const updateBudget = async (budgetId, budgetData) => {
  try {
    const response = await API.put(
      `/api/budget/${budgetId}`,
      budgetData
    );
    return response.data;
  } catch (error) {
    console.error('Error updating budget:', error);
    throw error;
  }
};

// Delete a budget
export const deleteBudget = async (budgetId) => {
  try {
    const response = await API.delete(`/api/budget/${budgetId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting budget:', error);
    throw error;
  }
};

// Get all categories for a user
export const getUserCategories = async () => {
  try {
    const response = await API.get('/api/budget/categories');
    return response.data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

// Create a new category
export const createCategory = async (categoryName) => {
  try {
    const response = await API.post('/api/budget/categories', {
      categoryName
    });
    return response.data;
  } catch (error) {
    console.error('Error creating category:', error);
    throw error;
  }
};

// Export default object with all functions
export default {
  getUserBudgets,
  createBudget,
  updateBudget,
  deleteBudget,
  getUserCategories,
  createCategory
};
