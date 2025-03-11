import db from '../utils/db.js';

export const createWallet = async ({ userId, initial_balance }) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Check if wallet already exists
            const existingWallet = await findWalletByUserId(userId);
            if (existingWallet) {
                return resolve(existingWallet);
            }

            // Insert new wallet
            const q = 'INSERT INTO wallet (user_id, initial_balance, current_balance) VALUES (?, ?, ?)';
            db.execute(q, [userId, initial_balance, initial_balance], (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve({ wallet_id: result.insertId, user_id: userId, initial_balance, current_balance: initial_balance });
                }
            });
        } catch (error) {
            reject(error);
        }
    });
};

export const findWalletByUserId = async (userId) => {
    try {
        const q = 'SELECT * FROM wallet WHERE user_id = ?';

        const [results] = await db.execute(q, [userId]);

        return results.length > 0 ? results[0] : null;
    } catch (err) {
        throw err; // Ensure the error is properly handled in the calling function
    }
};
