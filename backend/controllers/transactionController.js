import {
    createTransaction,
    getTransactionsByUserId,
    getTransactionById,
    updateTransaction,
    deleteTransaction,
    getBudgetSummary,
  } from "../models/Transaction.js";
  import db from '../utils/db.js';
  
  export const createTransactionHandler = async (req, res) => {
    console.log("Received transaction creation request:", req.body);
  
    const {
      amount,
      transactionType,
      description,
      categoryId,
      budgetId,
      transactionDate,
    } = req.body;

    const userId = req.user.id;
  
    // Input validation
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      return res.status(400).json({ 
        success: false,
        message: "Valid positive amount is required" 
      });
    }
    if (!transactionType || !["expense", "income"].includes(transactionType)) {
      return res.status(400).json({
        success: false,
        message: "Valid transaction type (expense or income) is required",
      });
    }
  
    try {
      // Parse date if provided
      let parsedDate = null;
      if (transactionDate) {
        parsedDate = new Date(transactionDate);
        if (isNaN(parsedDate.getTime())) {
          return res.status(400).json({ 
            success: false,
            message: "Invalid transaction date format" 
          });
        }
      }

      // Create transaction
      const transaction = await createTransaction({
        userId,
        amount: parseFloat(amount),
        transactionType,
        description,
        categoryId,
        budgetId,
        transactionDate: parsedDate || new Date(),
      });

      // Get category details if categoryId is provided
      let category = null;
      if (categoryId) {
        const [categoryResult] = await db.query(
          'SELECT * FROM categories WHERE category_id = ? AND user_id = ?',
          [categoryId, userId]
        );
        category = categoryResult[0];
      }

      // Get budget details if budgetId is provided
      let budget = null;
      if (budgetId) {
        const [budgetResult] = await db.query(
          'SELECT * FROM budget WHERE budget_id = ? AND user_id = ?',
          [budgetId, userId]
        );
        budget = budgetResult[0];
      }

      res.status(201).json({
        success: true,
        data: {
          ...transaction,
          category,
          budget
        }
      });
    } catch (error) {
      console.error("Error creating transaction:", error);
      res.status(500).json({
        success: false,
        message: "Error creating transaction",
        error: error.message
      });
    }
  };
  
  export const getTransactionsHandler = async (req, res) => {
    const userId = req.user.id;
  
    try {
      const transactions = await getTransactionsByUserId(userId);
      
      // Get categories and budgets for all transactions
      const transactionsWithDetails = await Promise.all(
        transactions.map(async (transaction) => {
          let category = null;
          let budget = null;

          if (transaction.category_id) {
            const [categoryResult] = await db.query(
              'SELECT * FROM categories WHERE category_id = ? AND user_id = ?',
              [transaction.category_id, userId]
            );
            category = categoryResult[0];
          }

          if (transaction.budget_id) {
            const [budgetResult] = await db.query(
              'SELECT * FROM budget WHERE budget_id = ? AND user_id = ?',
              [transaction.budget_id, userId]
            );
            budget = budgetResult[0];
          }

          return {
            ...transaction,
            category,
            budget
          };
        })
      );

      res.json({
        success: true,
        data: transactionsWithDetails
      });
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching transactions",
        error: error.message
      });
    }
  };
  
  export const getTransactionHandler = async (req, res) => {
    const { transactionId } = req.params;
    const userId = req.user.id;
  
    if (!transactionId) {
      return res.status(400).json({
        success: false,
        message: "Transaction ID is required"
      });
    }
  
    try {
      const transaction = await getTransactionById(transactionId, userId);
      
      if (!transaction) {
        return res.status(404).json({
          success: false,
          message: "Transaction not found"
        });
      }

      // Get category details if categoryId is provided
      let category = null;
      if (transaction.category_id) {
        const [categoryResult] = await db.query(
          'SELECT * FROM categories WHERE category_id = ? AND user_id = ?',
          [transaction.category_id, userId]
        );
        category = categoryResult[0];
      }

      // Get budget details if budgetId is provided
      let budget = null;
      if (transaction.budget_id) {
        const [budgetResult] = await db.query(
          'SELECT * FROM budget WHERE budget_id = ? AND user_id = ?',
          [transaction.budget_id, userId]
        );
        budget = budgetResult[0];
      }

      res.json({
        success: true,
        data: {
          ...transaction,
          category,
          budget
        }
      });
    } catch (error) {
      console.error("Error fetching transaction:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching transaction",
        error: error.message
      });
    }
  };
  
  export const updateTransactionHandler = async (req, res) => {
    const { transactionId } = req.params;
    const userId = req.user.id;
    const updateData = req.body;
  
    if (!transactionId) {
      return res.status(400).json({
        success: false,
        message: "Transaction ID is required"
      });
    }
  
    try {
      const updatedTransaction = await updateTransaction(transactionId, userId, updateData);
      
      if (!updatedTransaction) {
        return res.status(404).json({
          success: false,
          message: "Transaction not found"
        });
      }

      // Get category details if categoryId is provided
      let category = null;
      if (updatedTransaction.category_id) {
        const [categoryResult] = await db.query(
          'SELECT * FROM categories WHERE category_id = ? AND user_id = ?',
          [updatedTransaction.category_id, userId]
        );
        category = categoryResult[0];
      }

      // Get budget details if budgetId is provided
      let budget = null;
      if (updatedTransaction.budget_id) {
        const [budgetResult] = await db.query(
          'SELECT * FROM budget WHERE budget_id = ? AND user_id = ?',
          [updatedTransaction.budget_id, userId]
        );
        budget = budgetResult[0];
      }

      res.json({
        success: true,
        data: {
          ...updatedTransaction,
          category,
          budget
        }
      });
    } catch (error) {
      console.error("Error updating transaction:", error);
      res.status(500).json({
        success: false,
        message: "Error updating transaction",
        error: error.message
      });
    }
  };
  
  export const deleteTransactionHandler = async (req, res) => {
    const { transactionId } = req.params;
    const userId = req.user.id;
  
    if (!transactionId) {
      return res.status(400).json({
        success: false,
        message: "Transaction ID is required"
      });
    }
  
    try {
      const deleted = await deleteTransaction(transactionId, userId);
      
      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: "Transaction not found"
        });
      }

      res.json({
        success: true,
        message: "Transaction deleted successfully"
      });
    } catch (error) {
      console.error("Error deleting transaction:", error);
      res.status(500).json({
        success: false,
        message: "Error deleting transaction",
        error: error.message
      });
    }
  };
  
  export const getBudgetSummaryHandler = async (req, res) => {
    const userId = req.user.id;
  
    try {
      const summary = await getBudgetSummary(userId);
      res.json({
        success: true,
        data: summary
      });
    } catch (error) {
      console.error("Error fetching budget summary:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching budget summary",
        error: error.message
      });
    }
  };