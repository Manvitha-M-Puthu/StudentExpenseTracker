import API from './axiosInstance';

/**
 * Category API Service
 * Centralized service for all category-related API calls
 */

// Get all categories for a user
export const getUserCategories = async (userId) => {
  try {
    const response = await API.get(`/api/categories/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

// Create a new category
export const createCategory = async (userId, categoryName) => {
  try {
    const response = await API.post('/api/categories', {
      userId,
      categoryName
    });
    return response.data;
  } catch (error) {
    console.error('Error creating category:', error);
    throw error;
  }
};

// Delete a category
export const deleteCategory = async (userId, categoryId) => {
  try {
    const response = await API.delete(`/api/categories/${userId}/${categoryId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting category:', error);
    throw error;
  }
};

// Export default object with all functions
export default {
  getUserCategories,
  createCategory,
  deleteCategory
}; 