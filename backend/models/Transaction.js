import db from "../utils/db.js";

export const createTransaction = async ({
  userId,
  amount,
  transactionType,
  description,
  categoryId,
  budgetId,
  transactionDate,
}) => {
  try {
    // Start a transaction to ensure data consistency
    await db.query("START TRANSACTION");

    // Validate inputs
    if (!userId || !amount || !transactionType) {
      throw new Error("Required fields are missing");
    }

    // Validate amount
    if (isNaN(amount) || amount <= 0) {
      throw new Error("Amount must be a positive number");
    }

    // Get the user's wallet (assuming one wallet per user)
    let walletId;
    let currentBalance;
    const [walletRows] = await db.query(
      "SELECT wallet_id, current_balance FROM wallet WHERE user_id = ? LIMIT 1",
      [userId]
    );

    if (!walletRows || walletRows.length === 0) {
      // If user doesn't have a wallet, create one
      const [result] = await db.query(
        "INSERT INTO wallet (user_id, initial_balance, current_balance) VALUES (?, 0, 0)",
        [userId]
      );
      walletId = result.insertId;
      currentBalance = 0;
    } else {
      // Use the existing wallet
      walletId = walletRows[0].wallet_id;
      currentBalance = walletRows[0].current_balance;
    }

    // Validate category if provided
    if (categoryId) {
      const [categoryRows] = await db.query(
        "SELECT * FROM categories WHERE category_id = ? AND user_id = ?",
        [categoryId, userId]
      );

      if (!categoryRows || categoryRows.length === 0) {
        throw new Error("Invalid category");
      }
    }

    // Validate budget if provided
    if (budgetId) {
      const [budgetRows] = await db.query(
        "SELECT * FROM budget WHERE budget_id = ? AND user_id = ?",
        [budgetId, userId]
      );

      if (!budgetRows || budgetRows.length === 0) {
        throw new Error("Invalid budget");
      }
    }

    // Use current date if not provided
    const finalTransactionDate = transactionDate || new Date();

    // Insert the transaction
    const [result] = await db.query(
      `INSERT INTO transactions 
        (user_id, amount, transaction_type, description, category_id, budget_id, wallet_id, transaction_date) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        amount,
        transactionType,
        description || null,
        categoryId || null,
        budgetId || null,
        walletId,
        finalTransactionDate,
      ]
    );

    // Update wallet balance based on transaction type
    const newBalance =
      transactionType === "income"
        ? parseFloat(currentBalance) + parseFloat(amount)
        : parseFloat(currentBalance) - parseFloat(amount);

    await db.query(
      "UPDATE wallet SET current_balance = ? WHERE wallet_id = ?",
      [newBalance, walletId]
    );

    // If it's an expense, update the budget remaining amount
    if (transactionType === "expense") {
      if (budgetId) {
        // If budget ID is provided, update that specific budget
        await db.query(
          "UPDATE budget SET remaining_amount = remaining_amount - ? WHERE budget_id = ?",
          [amount, budgetId]
        );
      } else if (categoryId) {
        // If only category ID is provided, find active budgets for this category
        const [activeBudgets] = await db.query(
          `SELECT budget_id FROM budget 
           WHERE category_id = ? 
           AND user_id = ? 
           AND start_date <= CURDATE() 
           AND end_date >= CURDATE()`,
          [categoryId, userId]
        );

        // Update the first active budget found (if any)
        if (activeBudgets && activeBudgets.length > 0) {
          await db.query(
            "UPDATE budget SET remaining_amount = remaining_amount - ? WHERE budget_id = ?",
            [amount, activeBudgets[0].budget_id]
          );
        }
      }
    }

    // Commit the transaction
    await db.query("COMMIT");

    return {
      transactionId: result.insertId,
      userId,
      amount,
      transactionType,
      description,
      categoryId,
      budgetId,
      walletId,
      transactionDate: finalTransactionDate,
    };
  } catch (error) {
    // Rollback in case of error
    await db.query("ROLLBACK");
    console.error("Error in createTransaction:", error);
    throw error;
  }
};

// Update the updateTransaction function to use current_balance
// Add the updateTransaction function
export const updateTransaction = async (transactionId, userId, updateData) => {
  try {
    // Start a transaction
    await db.query("START TRANSACTION");

    // Get the current transaction data
    const [currentTransaction] = await db.query(
      "SELECT * FROM transactions WHERE transaction_id = ? AND user_id = ?",
      [transactionId, userId]
    );

    if (!currentTransaction || currentTransaction.length === 0) {
      throw new Error("Transaction not found");
    }

    const transaction = currentTransaction[0];
    const {
      amount: oldAmount,
      transaction_type: oldType,
      budget_id: oldBudgetId,
    } = transaction;

    // Get user's wallet
    const [walletRows] = await db.query(
      "SELECT wallet_id, current_balance FROM wallet WHERE user_id = ? LIMIT 1",
      [userId]
    );

    if (!walletRows || walletRows.length === 0) {
      throw new Error("Wallet not found");
    }

    const wallet = walletRows[0];
    const currentBalance = wallet.current_balance;

    // Prepare update data
    const {
      amount = transaction.amount,
      transactionType = transaction.transaction_type,
      description = transaction.description,
      categoryId = transaction.category_id,
      budgetId = transaction.budget_id,
      transactionDate = transaction.transaction_date,
    } = updateData;

    // Update the transaction
    await db.query(
      `UPDATE transactions 
       SET amount = ?, 
           transaction_type = ?, 
           description = ?, 
           category_id = ?, 
           budget_id = ?,
           transaction_date = ?
       WHERE transaction_id = ? AND user_id = ?`,
      [
        amount,
        transactionType,
        description,
        categoryId,
        budgetId,
        transactionDate,
        transactionId,
        userId,
      ]
    );

    // Update wallet balance
    // First, reverse the effect of the old transaction
    let balanceAdjustment = 0;
    if (oldType === "income") {
      balanceAdjustment -= parseFloat(oldAmount);
    } else {
      balanceAdjustment += parseFloat(oldAmount);
    }

    // Then, apply the effect of the new transaction
    if (transactionType === "income") {
      balanceAdjustment += parseFloat(amount);
    } else {
      balanceAdjustment -= parseFloat(amount);
    }

    // Update wallet with new balance
    await db.query(
      "UPDATE wallet SET current_balance = current_balance + ? WHERE wallet_id = ?",
      [balanceAdjustment, wallet.wallet_id]
    );

    // Handle budget updates if this is an expense transaction
    if (oldType === "expense" && oldBudgetId) {
      // Add back the old amount to the old budget
      await db.query(
        "UPDATE budget SET remaining_amount = remaining_amount + ? WHERE budget_id = ?",
        [oldAmount, oldBudgetId]
      );
    }

    if (transactionType === "expense" && budgetId) {
      // Subtract the new amount from the new budget
      await db.query(
        "UPDATE budget SET remaining_amount = remaining_amount - ? WHERE budget_id = ?",
        [amount, budgetId]
      );
    }

    // Commit the transaction
    await db.query("COMMIT");

    return {
      transactionId,
      userId,
      amount,
      transactionType,
      description,
      categoryId,
      budgetId,
      transactionDate,
    };
  } catch (error) {
    await db.query("ROLLBACK");
    console.error("Error in updateTransaction:", error);
    throw error;
  }
};

// Add the deleteTransaction function
export const deleteTransaction = async (transactionId, userId) => {
  try {
    // Start a transaction
    await db.query("START TRANSACTION");

    // Get the transaction to be deleted
    const [transactionRows] = await db.query(
      "SELECT * FROM transactions WHERE transaction_id = ? AND user_id = ?",
      [transactionId, userId]
    );

    if (!transactionRows || transactionRows.length === 0) {
      throw new Error("Transaction not found");
    }

    const transaction = transactionRows[0];

    // Update wallet balance
    if (transaction.transaction_type === "income") {
      // If deleting income, subtract from wallet balance
      await db.query(
        "UPDATE wallet SET current_balance = current_balance - ? WHERE wallet_id = ?",
        [transaction.amount, transaction.wallet_id]
      );
    } else {
      // If deleting expense, add to wallet balance
      await db.query(
        "UPDATE wallet SET current_balance = current_balance + ? WHERE wallet_id = ?",
        [transaction.amount, transaction.wallet_id]
      );
    }

    // If it's an expense and has a budget, add the amount back to the budget
    if (transaction.transaction_type === "expense" && transaction.budget_id) {
      await db.query(
        "UPDATE budget SET remaining_amount = remaining_amount + ? WHERE budget_id = ?",
        [transaction.amount, transaction.budget_id]
      );
    }

    // Delete the transaction
    await db.query(
      "DELETE FROM transactions WHERE transaction_id = ? AND user_id = ?",
      [transactionId, userId]
    );

    // Commit the transaction
    await db.query("COMMIT");

    return { success: true, message: "Transaction deleted successfully" };
  } catch (error) {
    await db.query("ROLLBACK");
    console.error("Error in deleteTransaction:", error);
    throw error;
  }
};
// Add this function to the file (if it doesn't exist already)
export const getBudgetSummary = async (userId) => {
  try {
    const [rows] = await db.query(
      `SELECT b.budget_id, b.category_id, c.category_name, 
              b.amount as budget_amount, 
              b.remaining_amount,
              DATE_FORMAT(b.start_date, '%Y-%m-%d') as start_date,
              DATE_FORMAT(b.end_date, '%Y-%m-%d') as end_date
       FROM budget b
       JOIN categories c ON b.category_id = c.category_id
       WHERE b.user_id = ? AND b.end_date >= CURDATE()
       ORDER BY b.end_date ASC`,
      [userId]
    );

    return rows || [];
  } catch (error) {
    console.error("Error in getBudgetSummary:", error);
    throw error;
  }
};
export const getTransactionById = async (transactionId, userId) => {
  try {
    if (!transactionId || !userId) {
      throw new Error("Transaction ID and User ID are required");
    }

    const [rows] = await db.query(
      `SELECT t.*, 
              c.category_name,
              DATE_FORMAT(t.transaction_date, '%Y-%m-%d') as formatted_date
       FROM transactions t
       LEFT JOIN categories c ON t.category_id = c.category_id
       WHERE t.transaction_id = ? AND t.user_id = ?`,
      [transactionId, userId]
    );

    if (!rows || rows.length === 0) {
      throw new Error("Transaction not found");
    }

    return rows[0];
  } catch (error) {
    console.error("Error in getTransactionById:", error);
    throw error;
  }
};

export const getTransactionsByUserId = async (userId) => {
  try {
    if (!userId) {
      throw new Error("User ID is required");
    }

    const [rows] = await db.query(
      `SELECT t.*, 
              c.category_name,
              DATE_FORMAT(t.transaction_date, '%Y-%m-%d') as formatted_date 
       FROM transactions t
       LEFT JOIN categories c ON t.category_id = c.category_id
       WHERE t.user_id = ?
       ORDER BY t.transaction_date DESC`,
      [userId]
    );

    return rows;
  } catch (error) {
    console.error("Error in getTransactionsByUserId:", error);
    throw error;
  }
};

export const getRecentTransactions = async (userId) => {
  try {
    const query = `
      SELECT 
        t.transaction_id as id,
        t.amount,
        t.transaction_type as type,
        t.description,
        DATE_FORMAT(t.transaction_date, '%Y-%m-%d') as date,
        c.category_name as category
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.category_id
      WHERE t.user_id = ?
      ORDER BY t.transaction_date DESC
      LIMIT 5
    `;

    const [rows] = await db.query(query, [userId]);
    
    // If no transactions found, return empty array
    if (!rows || rows.length === 0) {
      return [];
    }

    // Format the response to match what the frontend expects
    return rows.map(row => ({
      id: row.id,
      amount: parseFloat(row.amount),
      type: row.type,
      description: row.description,
      date: row.date,
      category: row.category
    }));
  } catch (error) {
    console.error('Error in getRecentTransactions:', error);
    throw error;
  }
};
