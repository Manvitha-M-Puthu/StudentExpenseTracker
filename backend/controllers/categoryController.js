import { createCategory, getCategoriesByUserId, deleteCategory } from "../models/Category.js";

export const createCategoryHandler = async (req, res) => {
  console.log("Received category creation request:", req.body);

  const { categoryName } = req.body;
  const userId = req.user.id;

  if (!categoryName || categoryName.trim() === "") {
    console.log("Missing or empty categoryName in request");
    return res.status(400).json({ 
      success: false,
      message: "Category name is required" 
    });
  }

  try {
    const categoryId = await createCategory({
      userId,
      categoryName: categoryName.trim(),
    });

    console.log("Category created successfully:", { categoryId, categoryName });
    res.status(201).json({
      success: true,
      data: {
        categoryId,
        categoryName,
        message: "Category created successfully"
      }
    });
  } catch (error) {
    console.error("Error in createCategoryHandler:", error);

    if (error.code === "ER_DUP_ENTRY") {
      return res.status(400).json({
        success: false,
        message: "A category with this name already exists"
      });
    }

    res.status(500).json({
      success: false,
      message: "Error creating category",
      error: error.message
    });
  }
};

export const getCategoriesHandler = async (req, res) => {
  const userId = req.user.id;

  try {
    const categories = await getCategoriesByUserId(userId);
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching categories",
      error: error.message
    });
  }
};

export const deleteCategoryHandler = async (req, res) => {
  const { categoryId } = req.params;
  const userId = req.user.id;

  if (!categoryId) {
    return res.status(400).json({
      success: false,
      message: "Category ID is required"
    });
  }

  try {
    const deleted = await deleteCategory(categoryId, userId);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Category not found"
      });
    }

    res.json({
      success: true,
      message: "Category deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting category",
      error: error.message
    });
  }
};
