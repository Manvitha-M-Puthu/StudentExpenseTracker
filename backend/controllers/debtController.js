import { createDebt, findDebtsByUserId } from '../models/Debt.js';

export const createDebtHandler = async (req, res) => {
    const { userId, debtorName, amount, dueDate, status } = req.body;
    try {
        const debtId = await createDebt({ userId, debtorName, amount, dueDate, status });
        res.status(201).json({ debtId });
    } catch (error) {
        res.status(500).json({ error: 'Error creating debt' });
    }
};

export const getDebtsHandler = async (req, res) => {
    const { userId } = req.params;
    try {
        const debts = await findDebtsByUserId(userId);
        res.status(200).json(debts);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching debts' });
    }
};