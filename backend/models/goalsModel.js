import db from "../utils/db.js";

export const SavingGoalModel = {
  // Create a new saving goal
  create: async (goalData) => {
    const { user_id, goal_name, priority, target_amount, saved_amount, monthly_contribution, deadline } = goalData;
    
    try {
      // Determine goal status
      const status = parseFloat(saved_amount) >= parseFloat(target_amount) ? "completed" : "active";
      
      // Convert deadline to MySQL format if it's an ISO string
      const formattedDeadline = deadline ? new Date(deadline).toISOString().slice(0, 19).replace('T', ' ') : null;

      const query = `
        INSERT INTO saving_goals 
        (user_id, goal_name, priority, target_amount, saved_amount, monthly_contribution, deadline, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `;

      const values = [user_id, goal_name, priority, target_amount, saved_amount, monthly_contribution || 0, formattedDeadline, status];

      const [result] = await db.execute(query, values);

      // Fetch the inserted row using LAST_INSERT_ID()
      const [savedGoal] = await db.execute(
        `SELECT * FROM saving_goals WHERE goal_id = LAST_INSERT_ID()`
      );

      return savedGoal[0]; // Return the inserted row
    } catch (error) {
      throw error;
    }
  },

  // Get all saving goals for a user
  getAllByUserId: async (userId) => {
    try {
      const query = `
        SELECT * FROM saving_goals
        WHERE user_id = ?
        ORDER BY 
          CASE WHEN status = 'completed' THEN 1 ELSE 0 END,
          CASE 
            WHEN priority = 'High' THEN 0
            WHEN priority = 'Medium' THEN 1
            WHEN priority = 'Low' THEN 2
          END,
          deadline ASC
      `;

      const [result] = await db.execute(query, [userId]);
      return result;
    } catch (error) {
      throw error;
    }
  },

  // Get a single saving goal by ID
  getById: async (goalId, userId) => {
    try {
      if (!goalId || !userId) {
        throw new Error('Goal ID and User ID are required');
      }

      const query = `
        SELECT * FROM saving_goals
        WHERE goal_id = ? AND user_id = ?
      `;

      const [result] = await db.execute(query, [goalId, userId]);
      return result.length > 0 ? result[0] : null;
    } catch (error) {
      console.error('Error in getById:', error);
      throw error;
    }
  },

  // Update an existing saving goal
  update: async (goalId, goalData, userId) => {
    try {
      if (!goalId || !userId) {
        throw new Error('Goal ID and User ID are required');
      }

      // First, check if the goal exists
      const goal = await SavingGoalModel.getById(goalId, userId);
      if (!goal) {
        return null;
      }

      // Build the update query dynamically based on provided fields
      const updateFields = [];
      const values = [];

      // Only include fields that are explicitly provided and not undefined
      if (goalData.goal_name !== undefined && goalData.goal_name !== null) {
        updateFields.push('goal_name = ?');
        values.push(goalData.goal_name);
      }
      if (goalData.target_amount !== undefined && goalData.target_amount !== null) {
        updateFields.push('target_amount = ?');
        values.push(parseFloat(goalData.target_amount));
      }
      if (goalData.saved_amount !== undefined && goalData.saved_amount !== null) {
        updateFields.push('saved_amount = ?');
        values.push(parseFloat(goalData.saved_amount));
      }
      if (goalData.monthly_contribution !== undefined && goalData.monthly_contribution !== null) {
        updateFields.push('monthly_contribution = ?');
        values.push(parseFloat(goalData.monthly_contribution));
      }
      if (goalData.deadline !== undefined && goalData.deadline !== null) {
        const formattedDeadline = new Date(goalData.deadline).toISOString().slice(0, 19).replace('T', ' ');
        updateFields.push('deadline = ?');
        values.push(formattedDeadline);
      }
      if (goalData.priority !== undefined && goalData.priority !== null) {
        updateFields.push('priority = ?');
        values.push(goalData.priority);
      }

      // Handle status update
      if (goalData.status !== undefined && goalData.status !== null) {
        updateFields.push('status = ?');
        values.push(goalData.status);
      } else if (goalData.saved_amount !== undefined && goalData.saved_amount !== null) {
        // Auto-update status based on saved amount if not explicitly provided
        const newStatus = parseFloat(goalData.saved_amount) >= parseFloat(goal.target_amount) ? "completed" : "active";
        updateFields.push('status = ?');
        values.push(newStatus);
      }

      // Always update the updated_at timestamp
      updateFields.push('updated_at = NOW()');

      if (updateFields.length === 0) {
        return goal; // No fields to update
      }

      const query = `
        UPDATE saving_goals
        SET ${updateFields.join(', ')}
        WHERE goal_id = ? AND user_id = ?
      `;

      values.push(goalId, userId);
      
      await db.execute(query, values);

      // Fetch the updated row
      const updatedGoal = await SavingGoalModel.getById(goalId, userId);
      return updatedGoal;
    } catch (error) {
      console.error('Error updating saving goal:', error);
      throw error;
    }
  },

  // Delete a saving goal
  delete: async (goalId, userId) => {
    try {
      // First, check if the goal exists
      const goal = await SavingGoalModel.getById(goalId, userId);
      if (!goal) {
        return false;
      }

      const query = `
        DELETE FROM saving_goals
        WHERE goal_id = ? AND user_id = ?
      `;

      const [result] = await db.execute(query, [goalId, userId]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  },

  // Get summary statistics for a user's goals
  getSummary: async (userId) => {
    try {
      const query = `
        SELECT 
          COUNT(CASE WHEN status = 'active' THEN 1 END) AS active_goals_count,
          COUNT(CASE WHEN status = 'completed' THEN 1 END) AS completed_goals_count,
          SUM(CASE WHEN status = 'active' THEN target_amount ELSE 0 END) AS total_target_amount,
          SUM(CASE WHEN status = 'active' THEN saved_amount ELSE 0 END) AS total_saved_amount,
          SUM(CASE WHEN status = 'active' THEN monthly_contribution ELSE 0 END) AS total_monthly_contribution
        FROM saving_goals
        WHERE user_id = ?
      `;

      const [result] = await db.execute(query, [userId]);
      return result.length > 0 ? result[0] : null;
    } catch (error) {
      throw error;
    }
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