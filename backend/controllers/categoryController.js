import { createCategory, getCategoriesByUserId } from "../models/Category.js";

export const createCategoryHandler = async (req, res) => {
  console.log("Received category creation request:", req.body);

  const { userId, categoryName } = req.body;

  if (!userId) {
    console.log("Missing userId in request");
    return res.status(400).json({ error: "User ID is required" });
  }

  if (!categoryName || categoryName.trim() === "") {
    console.log("Missing or empty categoryName in request");
    return res.status(400).json({ error: "Category name is required" });
  }

  try {
    const categoryId = await createCategory({
      userId: parseInt(userId),
      categoryName: categoryName.trim(),
    });

    console.log("Category created successfully:", { categoryId, categoryName });
    res.status(201).json({
      categoryId,
      message: "Category created successfully",
      category: { categoryId, categoryName },
    });
  } catch (error) {
    console.error("Error in createCategoryHandler:", error);

    if (error.code === "ER_DUP_ENTRY") {
      return res.status(400).json({
        error: "A category with this name already exists",
      });
    }

    if (error.code === "ER_NO_REFERENCED_ROW_2") {
      return res.status(400).json({
        error: "Invalid user ID",
      });
    }

    res.status(500).json({
      error: "Error creating category: " + error.message,
      details: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

export const getCategoriesHandler = async (req, res) => {
  console.log("Received categories fetch request for user:", req.params.userId);

  const { userId } = req.params;

  if (!userId) {
    console.log("Missing userId in request params");
    return res.status(400).json({ error: "User ID is required" });
  }

  try {
    const categories = await getCategoriesByUserId(parseInt(userId));
    console.log(`Found ${categories.length} categories for user ${userId}`);
    res.status(200).json(categories);
  } catch (error) {
    console.error("Error in getCategoriesHandler:", error);
    res.status(500).json({
      error: "Error fetching categories: " + error.message,
      details: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};
