import {
  createBudget,
  findBudgetByUserId,
  updateBudget,
  deleteBudget,
} from "../models/Budget.js";
import db from "../utils/db.js";

export const createBudgetHandler = async (req, res) => {
  const { categoryId, amount, startDate, endDate } = req.body;
  const userId = req.user.id;

  console.log('Budget Creation Request:', {
    userId,
    categoryId,
    amount,
    startDate,
    endDate
  });

  // Input validation
  if (!categoryId) {
    return res.status(400).json({ 
      success: false,
      message: "Category ID is required" 
    });
  }
  if (!amount || isNaN(amount)) {
    return res.status(400).json({ 
      success: false,
      message: "Valid amount is required" 
    });
  }
  if (!startDate) {
    return res.status(400).json({ 
      success: false,
      message: "Start date is required" 
    });
  }
  if (!endDate) {
    return res.status(400).json({ 
      success: false,
      message: "End date is required" 
    });
  }

  try {
    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime())) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid start date format" 
      });
    }
    if (isNaN(end.getTime())) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid end date format" 
      });
    }
    if (end < start) {
      return res.status(400).json({ 
        success: false,
        message: "End date must be after start date" 
      });
    }

    console.log('Creating budget with validated data:', {
      userId,
      categoryId,
      amount: parseFloat(amount),
      startDate,
      endDate
    });

    const budgetId = await createBudget({
      userId,
      categoryId,
      amount: parseFloat(amount),
      startDate,
      endDate,
    });

    console.log('Budget created successfully with ID:', budgetId);

    // Verify the budget was created
    const [verifyBudget] = await db.query(
      `SELECT b.*, c.category_name 
       FROM budget b 
       JOIN categories c ON b.category_id = c.category_id 
       WHERE b.budget_id = ? AND b.user_id = ?`,
      [budgetId, userId]
    );

    console.log('Verified budget data:', verifyBudget[0]);

    res.status(201).json({
      success: true,
      data: {
        budgetId,
        userId,
        categoryId,
        amount,
        startDate,
        endDate,
      }
    });
  } catch (error) {
    console.error("Error in createBudgetHandler:", error);
    if (error.message === "Invalid category") {
      return res.status(400).json({
        success: false,
        message: "Selected category is invalid or does not belong to the user",
      });
    }
    res.status(500).json({
      success: false,
      message: "Error creating budget. " + error.message,
    });
  }
};

export const getBudgetHandler = async (req, res) => {
  try {
    const userId = req.user.id;
    const budgets = await findBudgetByUserId(userId);
    
    res.status(200).json({
      success: true,
      data: budgets
    });
  } catch (error) {
    console.error("Error in getBudgetHandler:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching budgets. " + error.message,
    });
  }
};

export const updateBudgetHandler = async (req, res) => {
  const { budgetId, amount, startDate, endDate } = req.body;
  const userId = req.user.id;

  // Input validation
  if (!budgetId) {
    return res.status(400).json({ 
      success: false,
      message: "Budget ID is required" 
    });
  }
  if (!amount || isNaN(amount)) {
    return res.status(400).json({ 
      success: false,
      message: "Valid amount is required" 
    });
  }
  if (!startDate || !endDate) {
    return res.status(400).json({ 
      success: false,
      message: "Start and end dates are required" 
    });
  }

  try {
    const updatedBudgetId = await updateBudget({
      budgetId,
      userId,
      amount: parseFloat(amount),
      startDate,
      endDate,
    });

    res.status(200).json({
      success: true,
      data: {
        budgetId: updatedBudgetId,
        amount,
        startDate,
        endDate,
      }
    });
  } catch (error) {
    console.error("Error in updateBudgetHandler:", error);
    res.status(500).json({
      success: false,
      message: "Error updating budget. " + error.message,
    });
  }
};

export const deleteBudgetHandler = async (req, res) => {
  const { budgetId } = req.params;
  const userId = req.user.id;

  if (!budgetId) {
    return res.status(400).json({ 
      success: false,
      message: "Budget ID is required" 
    });
  }

  try {
    await deleteBudget({ budgetId, userId });
    res.status(200).json({
      success: true,
      message: "Budget deleted successfully",
    });
  } catch (error) {
    console.error("Error in deleteBudgetHandler:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting budget. " + error.message,
    });
  }
};
