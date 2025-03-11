import { createBudget, findBudgetByUserId } from "../models/Budget.js";

export const createBudgetHandler = async (req, res) => {
  console.log("Received budget creation request:", req.body);

  const { userId, categoryId, amount, startDate, endDate } = req.body;

  // Input validation
  if (!userId) {
    return res.status(400).json({ error: "User ID is required" });
  }
  if (!categoryId) {
    return res.status(400).json({ error: "Category ID is required" });
  }
  if (!amount || isNaN(amount)) {
    return res.status(400).json({ error: "Valid amount is required" });
  }
  if (!startDate) {
    return res.status(400).json({ error: "Start date is required" });
  }
  if (!endDate) {
    return res.status(400).json({ error: "End date is required" });
  }

  try {
    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime())) {
      return res.status(400).json({ error: "Invalid start date format" });
    }
    if (isNaN(end.getTime())) {
      return res.status(400).json({ error: "Invalid end date format" });
    }
    if (end < start) {
      return res
        .status(400)
        .json({ error: "End date must be after start date" });
    }

    const budgetId = await createBudget({
      userId,
      categoryId,
      amount: parseFloat(amount),
      startDate,
      endDate,
    });

    console.log("Budget created successfully:", { budgetId });
    res.status(201).json({
      budgetId,
      message: "Budget created successfully",
      data: { userId, categoryId, amount, startDate, endDate },
    });
  } catch (error) {
    console.error("Error in createBudgetHandler:", error);
    if (error.message === "Invalid category") {
      return res
        .status(400)
        .json({
          error: "Selected category is invalid or does not belong to the user",
        });
    }
    res.status(500).json({
      error: "Error creating budget. " + error.message,
      details: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

export const getBudgetHandler = async (req, res) => {
  console.log("Received budget fetch request for user:", req.params.userId);

  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({ error: "User ID is required" });
  }

  try {
    const budgets = await findBudgetByUserId(userId);
    console.log(`Found ${budgets.length} budgets for user ${userId}`);
    res.status(200).json(budgets);
  } catch (error) {
    console.error("Error in getBudgetHandler:", error);
    res.status(500).json({
      error: "Error fetching budgets. " + error.message,
      details: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};
