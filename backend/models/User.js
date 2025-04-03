import pool from '../utils/db.js';

export const createUser = async ({ name, email, password }) => {
    const q = 'INSERT INTO users `name`,`email`,`password`,`phone_no` VALUES (?, ?, ?, ?)';
    const [result] = await pool.query(
        q,
        [name, email, password]
    );
    return result.insertId;
};

export const findUserByEmail = async (email) => {
    const q = 'SELECT * FROM Users WHERE email = ?'
    const [rows] = await pool.query(q, [email]);
    return rows[0];
};