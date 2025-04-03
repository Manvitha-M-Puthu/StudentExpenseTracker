import express from "express";
import {
  createCategoryHandler,
  getCategoriesHandler,
} from "../controllers/categoryController.js";
import {
  createBudgetHandler,
  getBudgetHandler,
  updateBudgetHandler,
  deleteBudgetHandler,
} from "../controllers/budgetController.js";
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Category routes
router.post("/budget/categories", authenticateToken, createCategoryHandler);
router.get("/budget/categories", authenticateToken, getCategoriesHandler);

// Budget routes
router.post("/budget", authenticateToken, createBudgetHandler);
router.get("/budget", authenticateToken, getBudgetHandler);
router.put("/budget/:budgetId", authenticateToken, updateBudgetHandler);
router.delete("/budget/:budgetId", authenticateToken, deleteBudgetHandler);

export default router;
