import express from "express";
import {
  createCategoryHandler,
  getCategoriesHandler,
} from "../controllers/categoryController.js";
import {
  createBudgetHandler,
  getBudgetHandler,
} from "../controllers/budgetController.js";

const router = express.Router();

// Category routes
router.post("/categories", createCategoryHandler);
router.get("/categories/:userId", getCategoriesHandler);

// Budget routes
router.post("/budgets", createBudgetHandler);
router.get("/budgets/:userId", getBudgetHandler);

export default router;
