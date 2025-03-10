import pool from '../utils/db.js';

export const createDebt = async ({ userId, debtorName, amount, dueDate, status }) => {
    const [result] = await pool.query(
        'INSERT INTO DEBTS (USER_ID, DEBTOR_NAME, AMOUNT, DUE_DATE, STATUS) VALUES (?, ?, ?, ?, ?)',
        [userId, debtorName, amount, dueDate, status]
    );
    return result.insertId;
};

export const findDebtsByUserId = async (userId) => {
    const [rows] = await pool.query('SELECT * FROM DEBTS WHERE USER_ID = ?', [userId]);
    return rows;
};