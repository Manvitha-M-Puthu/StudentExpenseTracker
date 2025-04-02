import axiosInstance from './axiosInstance';

// Create a new saving goal
export const createSavingGoal = async (goalData) => {
  try {
    const response = await axiosInstance.post('/api/savings', goalData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get all saving goals
export const getAllSavingGoals = async () => {
  try {
    const response = await axiosInstance.get('/api/savings');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get a specific saving goal
export const getSavingGoal = async (goalId) => {
  try {
    const response = await axiosInstance.get(`/api/savings/${goalId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update a saving goal
export const updateSavingGoal = async (goalId, goalData) => {
  try {
    // Ensure we're only sending the fields that need to be updated
    const updateData = {};
    if (goalData.saved_amount !== undefined) {
      updateData.saved_amount = parseFloat(goalData.saved_amount);
    }
    if (goalData.status !== undefined) {
      updateData.status = goalData.status;
    }
    if (goalData.goal_name !== undefined) {
      updateData.goal_name = goalData.goal_name;
    }
    if (goalData.target_amount !== undefined) {
      updateData.target_amount = parseFloat(goalData.target_amount);
    }
    if (goalData.monthly_contribution !== undefined) {
      updateData.monthly_contribution = parseFloat(goalData.monthly_contribution);
    }
    if (goalData.deadline !== undefined) {
      updateData.deadline = goalData.deadline;
    }
    if (goalData.priority !== undefined) {
      updateData.priority = goalData.priority;
    }

    const response = await axiosInstance.put(`/api/savings/${goalId}`, updateData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Delete a saving goal
export const deleteSavingGoal = async (goalId) => {
  try {
    const response = await axiosInstance.delete(`/api/savings/${goalId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get savings progress
export const getSavingsProgress = async () => {
  try {
    const response = await axiosInstance.get('/api/savings/progress');
    return response.data;
  } catch (error) {
    throw error;
  }
};
