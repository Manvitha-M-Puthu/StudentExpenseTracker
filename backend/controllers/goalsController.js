// src/controllers/savingGoalController.js
import { SavingGoalModel } from '../models/goalsModel.js';

// Create a new saving goal
export const createSavingGoal = async (req, res) => {
  try {
    const { goal_name, target_amount, saved_amount, monthly_contribution, deadline, priority, user_id } = req.body;
    
    // Validation
    if (!goal_name || !target_amount || saved_amount === undefined || !deadline || !priority || !user_id) {
      return res.status(400).json({ 
        success: false,
        message: 'Please provide all required fields'
      });
    }
    
    // Create goal with model
    const goalData = {
      user_id,
      goal_name,
      target_amount,
      saved_amount,
      monthly_contribution,
      deadline,
      priority
    };
    
    const newGoal = await SavingGoalModel.create(goalData);
    
    return res.status(201).json(newGoal);
  } catch (error) {
    console.error('Error creating saving goal:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Server error while creating saving goal'
    });
  }
};

// Get all saving goals for a user
export const getAllSavingGoals = async (req, res) => {
  try {
    const user_id = req.user.id;
    
    const goals = await SavingGoalModel.getAllByUserId(user_id);
    
    return res.status(200).json(goals);
  } catch (error) {
    console.error('Error fetching saving goals:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Server error while fetching saving goals'
    });
  }
};

// Get a specific saving goal by ID
export const getSavingGoalById = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.query.userId;
    
    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }
    
    const goal = await SavingGoalModel.getById(id, user_id);
    
    if (!goal) {
      return res.status(404).json({ 
        success: false, 
        message: 'Saving goal not found'
      });
    }
    
    return res.status(200).json(goal);
  } catch (error) {
    console.error('Error fetching saving goal:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Server error while fetching saving goal'
    });
  }
};

// Update a saving goal
export const updateSavingGoal = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id; // Get user ID from the authenticated request
    
    if (!id || !userId) {
      return res.status(400).json({ 
        success: false,
        message: 'Goal ID and User ID are required'
      });
    }

    // Get the existing goal to use as defaults
    const existingGoal = await SavingGoalModel.getById(id, userId);
    if (!existingGoal) {
      return res.status(404).json({ 
        success: false, 
        message: 'Saving goal not found'
      });
    }

    // For partial updates, only include the fields that are being updated
    const goalData = {};
    
    // Only include fields that are present in the request
    if (req.body.saved_amount !== undefined) {
      goalData.saved_amount = parseFloat(req.body.saved_amount);
    }
    if (req.body.status !== undefined) {
      goalData.status = req.body.status;
    }
    if (req.body.goal_name !== undefined) {
      goalData.goal_name = req.body.goal_name;
    }
    if (req.body.target_amount !== undefined) {
      goalData.target_amount = parseFloat(req.body.target_amount);
    }
    if (req.body.monthly_contribution !== undefined) {
      goalData.monthly_contribution = parseFloat(req.body.monthly_contribution);
    }
    if (req.body.deadline !== undefined) {
      goalData.deadline = req.body.deadline;
    }
    if (req.body.priority !== undefined) {
      goalData.priority = req.body.priority;
    }
    
    // If no fields to update, return the existing goal
    if (Object.keys(goalData).length === 0) {
      return res.status(200).json(existingGoal);
    }
    
    const updatedGoal = await SavingGoalModel.update(id, goalData, userId);
    
    if (!updatedGoal) {
      return res.status(404).json({ 
        success: false, 
        message: 'Saving goal not found or not authorized to update'
      });
    }
    
    return res.status(200).json(updatedGoal);
  } catch (error) {
    console.error('Error updating saving goal:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Server error while updating saving goal'
    });
  }
};

// Delete a saving goal
export const deleteSavingGoal = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.query.userId;
    
    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }
    
    const result = await SavingGoalModel.delete(id, user_id);
    
    if (!result) {
      return res.status(404).json({ 
        success: false, 
        message: 'Saving goal not found or not authorized to delete'
      });
    }
    
    return res.status(200).json({ 
      success: true, 
      message: 'Saving goal deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting saving goal:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Server error while deleting saving goal'
    });
  }
};

// Get summary statistics for user's goals
export const getSavingGoalsSummary = async (req, res) => {
  try {
    const user_id = req.query.userId;
    
    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }
    
    const summary = await SavingGoalModel.getSummary(user_id);
    
    return res.status(200).json(summary);
  } catch (error) {
    console.error('Error fetching saving goals summary:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Server error while fetching saving goals summary'
    });
  }
};