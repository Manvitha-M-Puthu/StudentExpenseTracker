import { createTransaction, findTransactionsByUserId } from '../models/Transaction.js';

export const createTransactionHandler = async (req, res) => {
    const { userId, categoryId, amount, transactionType, date } = req.body;
    try {
        const transactionId = await createTransaction({ userId, categoryId, amount, transactionType, date });
        res.status(201).json({ transactionId });
    } catch (error) {
        res.status(500).json({ error: 'Error creating transaction' });
    }
};

export const getTransactionsHandler = async (req, res) => {
    const { userId } = req.params;
    try {
        const transactions = await findTransactionsByUserId(userId);
        res.status(200).json(transactions);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching transactions' });
    }
};