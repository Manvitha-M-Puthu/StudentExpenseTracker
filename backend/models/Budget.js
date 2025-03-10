import pool from '../utils/db.js';

export const createBudget = async ({ userId, categoryId, amount, startDate, endDate }) => {
    const [result] = await pool.query(
        'INSERT INTO BUDGET (USER_ID, CATEGORY_ID, AMOUNT, START_DATE, END_DATE) VALUES (?, ?, ?, ?, ?)',
        [userId, categoryId, amount, startDate, endDate]
    );
    return result.insertId;
};

export const findBudgetByUserId = async (userId) => {
    const [rows] = await pool.query('SELECT * FROM BUDGET WHERE USER_ID = ?', [userId]);
    return rows;
};