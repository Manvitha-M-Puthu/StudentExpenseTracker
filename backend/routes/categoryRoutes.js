import express from "express";
import {
  createCategoryHandler,
  getCategoriesHandler,
  deleteCategoryHandler,
} from "../controllers/categoryController.js";
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Category routes
router.post("/", authenticateToken, createCategoryHandler);
router.get("/", authenticateToken, getCategoriesHandler);
router.delete("/:categoryId", authenticateToken, deleteCategoryHandler);

export default router;
