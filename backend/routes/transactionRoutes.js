import express from "express";
import {
  createTransactionHandler,
  getTransactionsHandler,
  getTransactionHandler,
  updateTransactionHandler,
  deleteTransactionHandler,
  getBudgetSummaryHandler,
} from "../controllers/transactionController.js";

const router = express.Router();


router.post("/transactions", createTransactionHandler); 
router.get("/transactions/:userId", getTransactionsHandler); 
router.get("/transactions/:userId/:transactionId", getTransactionHandler); 
router.put("/transactions/:userId/:transactionId", updateTransactionHandler);
router.delete("/transactions/:userId/:transactionId", deleteTransactionHandler); 


router.get("/budget-summary/:userId", getBudgetSummaryHandler); 

export default router;