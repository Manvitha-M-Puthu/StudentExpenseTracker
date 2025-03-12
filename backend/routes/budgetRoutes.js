import express from "express";
import {
  createBudgetHandler,
  getBudgetHandler,
  updateBudgetHandler,
  deleteBudgetHandler,
} from "../controllers/budgetController.js";
import {
  createCategoryHandler,
  getCategoriesHandler,
} from "../controllers/categoryController.js";

const router = express.Router();


router.post("/categories", createCategoryHandler);
router.get("/categories/:userId", getCategoriesHandler);


router.post("/budgets", createBudgetHandler);
router.get("/budgets/:userId", getBudgetHandler);
router.put("/budgets", updateBudgetHandler);
router.delete("/budgets/:budgetId", deleteBudgetHandler);

export default router;
