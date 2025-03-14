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
    const user_id = req.query.userId;
    
    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }
    
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
    const { goal_name, target_amount, saved_amount, monthly_contribution, deadline, priority, status, user_id } = req.body;
    
    // Validation
    if (!goal_name || !target_amount || saved_amount === undefined || !deadline || !priority || !user_id) {
      return res.status(400).json({ 
        success: false,
        message: 'Please provide all required fields'
      });
    }
    
    const goalData = {
      goal_name,
      target_amount,
      saved_amount,
      monthly_contribution,
      deadline,
      priority,
      status
    };
    
    const updatedGoal = await SavingGoalModel.update(id, goalData, user_id);
    
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