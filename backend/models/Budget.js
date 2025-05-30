import db from "../utils/db.js";

export const createBudget = async ({
  userId,
  categoryId,
  amount,
  startDate,
  endDate,
}) => {
  try {
    console.log('createBudget model called with:', {
      userId,
      categoryId,
      amount,
      startDate,
      endDate
    });

    // Validate inputs
    if (!userId || !categoryId || !amount || !startDate || !endDate) {
      throw new Error("All fields are required");
    }

    // Validate amount
    if (isNaN(amount) || amount <= 0) {
      throw new Error("Amount must be a positive number");
    }

    // Check if category exists and belongs to user
    const [categoryRows] = await db.query(
      "SELECT * FROM categories WHERE category_id = ? AND user_id = ?",
      [categoryId, userId]
    );

    console.log('Category check result:', categoryRows);

    if (!categoryRows || categoryRows.length === 0) {
      throw new Error("Invalid category");
    }

    // Check if dates are valid
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new Error("Invalid date format");
    }

    if (end < start) {
      throw new Error("End date must be after start date");
    }

    // Check for overlapping budgets in the same category
    const [existingBudgets] = await db.query(
      `SELECT * FROM budget 
       WHERE category_id = ? 
       AND user_id = ?
       AND ((start_date BETWEEN ? AND ?) 
            OR (end_date BETWEEN ? AND ?)
            OR (start_date <= ? AND end_date >= ?))`,
      [
        categoryId,
        userId,
        startDate,
        endDate,
        startDate,
        endDate,
        startDate,
        endDate,
      ]
    );

    console.log('Overlapping budgets check:', existingBudgets);

    if (existingBudgets && existingBudgets.length > 0) {
      throw new Error(
        "A budget already exists for this category during the specified time period"
      );
    }

    // Insert the budget
    const [result] = await db.query(
      "INSERT INTO budget (user_id, category_id, amount, remaining_amount, start_date, end_date) VALUES (?, ?, ?, ?, ?, ?)",
      [userId, categoryId, amount, amount, startDate, endDate]
    );

    console.log('Budget insert result:', result);

    if (!result || !result.insertId) {
      throw new Error("Failed to create budget");
    }

    // Verify the inserted budget
    const [verifyInsert] = await db.query(
      "SELECT * FROM budget WHERE budget_id = ?",
      [result.insertId]
    );

    console.log('Verified inserted budget:', verifyInsert[0]);

    return result.insertId;
  } catch (error) {
    console.error("Error in createBudget:", error);
    throw error;
  }
};

export const findBudgetByUserId = async (userId) => {
  try {
    // Validate userId
    if (!userId) {
      throw new Error("User ID is required");
    }

    // Get budgets with category information
    const [rows] = await db.query(
      `SELECT b.*, c.category_name,
              DATE_FORMAT(b.start_date, '%Y-%m-%d') as start_date,
              DATE_FORMAT(b.end_date, '%Y-%m-%d') as end_date,
              COALESCE(b.remaining_amount, b.amount) as remaining_amount
       FROM budget b 
       JOIN categories c ON b.category_id = c.category_id 
       WHERE b.user_id = ? 
       ORDER BY b.start_date DESC`,
      [userId]
    );

    return rows || [];
  } catch (error) {
    console.error("Error in findBudgetByUserId:", error);
    throw error;
  }
};

export const updateBudget = async ({
  budgetId,
  userId,
  amount,
  startDate,
  endDate,
}) => {
  try {
    // Input validation
    if (!budgetId || !userId || !amount || !startDate || !endDate) {
      throw new Error("Missing required fields");
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new Error("Invalid date format");
    }

    if (end < start) {
      throw new Error("End date must be after start date");
    }

    // Check if budget exists and belongs to user
    const [existing] = await db.query(
      "SELECT * FROM budget WHERE budget_id = ? AND user_id = ?",
      [budgetId, userId]
    );

    if (!existing || existing.length === 0) {
      throw new Error("Budget not found or does not belong to user");
    }

    // Calculate the difference between old and new amounts
    const oldAmount = existing[0].amount;
    const amountDifference = parseFloat(amount) - parseFloat(oldAmount);

    // Update the budget
    const [result] = await db.query(
      "UPDATE budget SET amount = ?, remaining_amount = remaining_amount + ?, start_date = ?, end_date = ? WHERE budget_id = ? AND user_id = ?",
      [amount, amountDifference, startDate, endDate, budgetId, userId]
    );

    if (result.affectedRows === 0) {
      throw new Error("Failed to update budget");
    }

    return budgetId;
  } catch (error) {
    console.error("Error in updateBudget:", error);
    throw error;
  }
};

export const deleteBudget = async ({ budgetId, userId }) => {
  try {
    // Input validation
    if (!budgetId || !userId) {
      throw new Error("Budget ID and User ID are required");
    }

    // Check if budget exists and belongs to user
    const [existing] = await db.query(
      "SELECT * FROM budget WHERE budget_id = ? AND user_id = ?",
      [budgetId, userId]
    );

    if (!existing || existing.length === 0) {
      throw new Error("Budget not found or does not belong to user");
    }

    // Delete the budget
    const [result] = await db.query(
      "DELETE FROM budget WHERE budget_id = ? AND user_id = ?",
      [budgetId, userId]
    );

    if (result.affectedRows === 0) {
      throw new Error("Failed to delete budget");
    }

    return true;
  } catch (error) {
    console.error("Error in deleteBudget:", error);
    throw error;
  }
};
