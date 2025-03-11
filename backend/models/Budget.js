import db from "../utils/db.js";

export const createBudget = async ({
  userId,
  categoryId,
  amount,
  startDate,
  endDate,
}) => {
  try {
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

    if (existingBudgets && existingBudgets.length > 0) {
      throw new Error(
        "A budget already exists for this category during the specified time period"
      );
    }

    // Insert the budget
    const [result] = await db.query(
      "INSERT INTO budget (user_id, category_id, amount, start_date, end_date) VALUES (?, ?, ?, ?, ?)",
      [userId, categoryId, amount, startDate, endDate]
    );

    if (!result || !result.insertId) {
      throw new Error("Failed to create budget");
    }

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
              DATE_FORMAT(b.end_date, '%Y-%m-%d') as end_date
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
