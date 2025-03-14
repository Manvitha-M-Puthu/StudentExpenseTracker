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
      const query = `
        SELECT * FROM saving_goals
        WHERE goal_id = ? AND user_id = ?
      `;

      const [result] = await db.execute(query, [goalId, userId]);
      return result.length > 0 ? result[0] : null;
    } catch (error) {
      throw error;
    }
  },

  // Update an existing saving goal
  update: async (goalId, goalData, userId) => {
    const { goal_name, target_amount, saved_amount, monthly_contribution, deadline, priority, status } = goalData;

    try {
      // First, check if the goal exists
      const goal = await SavingGoalModel.getById(goalId, userId);
      if (!goal) {
        return null;
      }

      // Determine goal status if not explicitly provided
      let goalStatus = status || (parseFloat(saved_amount) >= parseFloat(target_amount) ? "completed" : "active");
      
      // Convert deadline to MySQL format if it's an ISO string
      const formattedDeadline = deadline ? new Date(deadline).toISOString().slice(0, 19).replace('T', ' ') : goal.deadline;

      const query = `
        UPDATE saving_goals
        SET 
          goal_name = ?,
          target_amount = ?,
          saved_amount = ?,
          monthly_contribution = ?,
          deadline = ?,
          priority = ?,
          status = ?,
          updated_at = NOW()
        WHERE goal_id = ? AND user_id = ?
      `;

      const values = [
        goal_name, 
        target_amount, 
        saved_amount, 
        monthly_contribution || goal.monthly_contribution || 0, 
        formattedDeadline, 
        priority, 
        goalStatus, 
        goalId, 
        userId
      ];
      
      await db.execute(query, values);

      // Fetch the updated row
      const updatedGoal = await SavingGoalModel.getById(goalId, userId);
      return updatedGoal;
    } catch (error) {
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