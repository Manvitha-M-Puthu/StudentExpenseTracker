import pool from '../utils/db.js';

export const createWallet = async ({ userId, balance }) => {
    const [result] = await pool.query(
        'INSERT INTO WALLET (USER_ID, BALANCE) VALUES (?, ?)',
        [userId, balance]
    );
    return result.insertId;
};

export const findWalletByUserId = async (userId) => {
    const [rows] = await pool.query('SELECT * FROM WALLET WHERE USER_ID = ?', [userId]);
    return rows[0];
};