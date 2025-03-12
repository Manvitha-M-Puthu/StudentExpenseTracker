import {
    createTransaction,
    getTransactionsByUserId,
    getTransactionById,
    updateTransaction,
    deleteTransaction,
    getBudgetSummary,
  } from "../models/Transaction.js";
  
  export const createTransactionHandler = async (req, res) => {
    console.log("Received transaction creation request:", req.body);
  
    const {
      userId,
      amount,
      transactionType,
      description,
      categoryId,
      budgetId,
      transactionDate,
    } = req.body;
  
    // Input validation
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      return res.status(400).json({ error: "Valid positive amount is required" });
    }
    if (!transactionType || !["expense", "income"].includes(transactionType)) {
      return res.status(400).json({
        error: "Valid transaction type (expense or income) is required",
      });
    }
  
    try {
      // Parse date if provided
      let parsedDate = null;
      if (transactionDate) {
        parsedDate = new Date(transactionDate);
        if (isNaN(parsedDate.getTime())) {
          return res
            .status(400)
            .json({ error: "Invalid transaction date format" });
        }
      }
      console.log("Creating transaction with data:", {
        userId,
        amount: parseFloat(amount),
        transactionType,
        description,
        categoryId,
        budgetId,
        transactionDate: parsedDate,
      });
      const result = await createTransaction({
        userId,
        amount: parseFloat(amount),
        transactionType,
        description,
        categoryId,
        budgetId,
        transactionDate: parsedDate,
      });
  
      res.status(201).json(result);
    } catch (error) {
      console.error("Error creating transaction - full error:", error);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
      res.status(500).json({ error: error.message || "Failed to create transaction" });
    }
  };
  
  export const getTransactionsHandler = async (req, res) => {
    try {
      // Get userId from route params or query params
      const userId = req.params.userId || req.query.userId;
      
      if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
      }
  
      const transactions = await getTransactionsByUserId(userId);
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ error: error.message || "Failed to fetch transactions" });
    }
  };
  
  export const getTransactionHandler = async (req, res) => {
    try {
      const { transactionId } = req.params;
      const userId = req.params.userId || req.query.userId;
  
      if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
      }
      
      if (!transactionId) {
        return res.status(400).json({ error: "Transaction ID is required" });
      }
  
      const transaction = await getTransactionById(transactionId, userId);
      res.json(transaction);
    } catch (error) {
      console.error("Error fetching transaction:", error);
      
      if (error.message === "Transaction not found") {
        return res.status(404).json({ error: "Transaction not found" });
      }
      
      res.status(500).json({ error: error.message || "Failed to fetch transaction" });
    }
  };
  
  export const updateTransactionHandler = async (req, res) => {
    try {
      const { transactionId } = req.params;
      const userId = req.params.userId || req.query.userId || req.body.userId;
      
      if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
      }
      
      if (!transactionId) {
        return res.status(400).json({ error: "Transaction ID is required" });
      }
  
      // Parse date if provided
      if (req.body.transactionDate) {
        const parsedDate = new Date(req.body.transactionDate);
        if (isNaN(parsedDate.getTime())) {
          return res.status(400).json({ error: "Invalid transaction date format" });
        }
        req.body.transactionDate = parsedDate;
      }
  
      const result = await updateTransaction(transactionId, userId, req.body);
      res.json(result);
    } catch (error) {
      console.error("Error updating transaction:", error);
      
      if (error.message === "Transaction not found") {
        return res.status(404).json({ error: "Transaction not found" });
      }
      
      res.status(500).json({ error: error.message || "Failed to update transaction" });
    }
  };
  
  export const deleteTransactionHandler = async (req, res) => {
    try {
      const { transactionId } = req.params;
      const userId = req.params.userId || req.query.userId;
      
      if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
      }
      
      if (!transactionId) {
        return res.status(400).json({ error: "Transaction ID is required" });
      }
  
      const result = await deleteTransaction(transactionId, userId);
      res.json(result);
    } catch (error) {
      console.error("Error deleting transaction:", error);
      
      if (error.message === "Transaction not found") {
        return res.status(404).json({ error: "Transaction not found" });
      }
      
      res.status(500).json({ error: error.message || "Failed to delete transaction" });
    }
  };
  
  export const getBudgetSummaryHandler = async (req, res) => {
    try {
      const userId = req.params.userId || req.query.userId;
      
      if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
      }
  
      const budgets = await getBudgetSummary(userId);
      res.json(budgets);
    } catch (error) {
      console.error("Error fetching budget summary:", error);
      res.status(500).json({ error: error.message || "Failed to fetch budget summary" });
    }
  };