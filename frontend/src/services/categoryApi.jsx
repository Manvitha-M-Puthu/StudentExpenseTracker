import API from './axiosInstance';

/**
 * Category API Service
 * Centralized service for all category-related API calls
 */

// Get all categories for a user
export const getUserCategories = async () => {
  try {
    const response = await API.get('/api/categories');
    return response.data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

// Create a new category
export const createCategory = async (categoryName) => {
  try {
    const response = await API.post('/api/categories', {
      categoryName
    });
    return response.data;
  } catch (error) {
    console.error('Error creating category:', error);
    throw error;
  }
};

// Delete a category
export const deleteCategory = async (categoryId) => {
  try {
    const response = await API.delete(`/api/categories/${categoryId}`);
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