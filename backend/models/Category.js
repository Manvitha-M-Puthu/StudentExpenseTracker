import db from "../utils/db.js";

export const createCategory = async ({ userId, categoryName }) => {
  try {
    // Input validation
    if (!userId || isNaN(userId)) {
      throw new Error("Valid user ID is required");
    }

    if (!categoryName || categoryName.trim() === "") {
      throw new Error("Category name is required");
    }

    // Check if user exists first
    const [user] = await db.query(
      "SELECT user_id FROM users WHERE user_id = ?",
      [userId]
    );

    if (!user || user.length === 0) {
      throw new Error("Invalid user ID");
    }

    // Check if category already exists for this specific user
    const [existing] = await db.query(
      "SELECT * FROM categories WHERE user_id = ? AND LOWER(category_name) = LOWER(?)",
      [userId, categoryName.trim()]
    );

    if (existing && existing.length > 0) {
      const error = new Error("Category already exists for this user");
      error.code = "ER_DUP_ENTRY";
      throw error;
    }

    // Insert the category
    const [result] = await db.query(
      "INSERT INTO categories (user_id, category_name) VALUES (?, ?)",
      [userId, categoryName.trim()]
    );

    if (!result || !result.insertId) {
      throw new Error("Failed to create category");
    }

    return result.insertId;
  } catch (error) {
    console.error("Error in createCategory:", error);
    throw error;
  }
};

export const getCategoriesByUserId = async (userId) => {
  try {
    // Input validation
    if (!userId || isNaN(userId)) {
      throw new Error("Valid user ID is required");
    }

    // Get categories
    const [rows] = await db.query(
      `SELECT 
        category_id,
        user_id,
        category_name,
        (SELECT COUNT(*) FROM budget WHERE category_id = categories.category_id) as budget_count
       FROM categories 
       WHERE user_id = ? 
       ORDER BY category_name`,
      [userId]
    );

    return rows || [];
  } catch (error) {
    console.error("Error in getCategoriesByUserId:", error);
    throw error;
  }
};

export const deleteCategory = async (categoryId, userId) => {
  try {
    // Input validation
    if (!categoryId || isNaN(categoryId)) {
      throw new Error("Valid category ID is required");
    }

    if (!userId || isNaN(userId)) {
      throw new Error("Valid user ID is required");
    }

    // Check if category exists and belongs to the user
    const [category] = await db.query(
      "SELECT * FROM categories WHERE category_id = ? AND user_id = ?",
      [categoryId, userId]
    );

    if (!category || category.length === 0) {
      return false;
    }

    // Delete the category
    const [result] = await db.query(
      "DELETE FROM categories WHERE category_id = ? AND user_id = ?",
      [categoryId, userId]
    );

    return result.affectedRows > 0;
  } catch (error) {
    console.error("Error in deleteCategory:", error);
    throw error;
  }
};
