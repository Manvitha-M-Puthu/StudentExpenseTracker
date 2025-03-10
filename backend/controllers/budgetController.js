import { createBudget, findBudgetByUserId } from '../models/Budget.js';

export const createBudgetHandler = async (req, res) => {
    const { userId, categoryId, amount, startDate, endDate } = req.body;
    try {
        const budgetId = await createBudget({ userId, categoryId, amount, startDate, endDate });
        res.status(201).json({ budgetId });
    } catch (error) {
        res.status(500).json({ error: 'Error creating budget' });
    }
};

export const getBudgetHandler = async (req, res) => {
    const { userId } = req.params;
    try {
        const budgets = await findBudgetByUserId(userId);
        res.status(200).json(budgets);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching budgets' });
    }
};