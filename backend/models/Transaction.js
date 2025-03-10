import pool from '../utils/db.js';

export const createTransaction = async ({ userId, categoryId, amount, transactionType, date }) => {
    const [result] = await pool.query(
        'INSERT INTO TRANSACTION (USER_ID, CATEGORY_ID, AMOUNT, TRANSACTION_TYPE, DATE) VALUES (?, ?, ?, ?, ?)',
        [userId, categoryId, amount, transactionType, date]
    );
    return result.insertId;
};

export const findTransactionsByUserId = async (userId) => {
    const [rows] = await pool.query('SELECT * FROM TRANSACTION WHERE USER_ID = ?', [userId]);
    return rows;
};