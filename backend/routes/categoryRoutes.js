import express from "express";
import {
  createCategoryHandler,
  getCategoriesHandler,
} from "../controllers/categoryController.js";

const router = express.Router();

// Category routes
router.post("/categories", createCategoryHandler);
router.get("/categories/:userId", getCategoriesHandler);

export default router;
