import db from '../utils/db.js';

export const getDashboardData = async (req, res) => {
    const userId = req.user.id;

    try {
        // Debug query to check all budgets
        const [allBudgets] = await db.query(`
            SELECT 
                b.budget_id,
                b.user_id,
                b.amount,
                b.remaining_amount,
                b.start_date,
                b.end_date,
                c.category_name
            FROM budget b
            JOIN categories c ON b.category_id = c.category_id
            WHERE b.user_id = ?
        `, [userId]);

        console.log('Debug - All Budgets in Database:', allBudgets);
        console.log('Debug - Current User ID:', userId);
        console.log('Debug - Current Date:', new Date().toISOString());

        // Get wallet balance
        const walletQuery = `
            SELECT current_balance
            FROM wallet
            WHERE user_id = ?;
        `;

        // Get spending trends (last 6 months)
        const spendingTrendsQuery = `
            SELECT 
                DATE_FORMAT(transaction_date, '%Y-%m') as month,
                SUM(CASE WHEN transaction_type = 'expense' THEN amount ELSE 0 END) as expenses,
                SUM(CASE WHEN transaction_type = 'income' THEN amount ELSE 0 END) as income
            FROM transactions
            WHERE user_id = ?
            AND transaction_date >= DATE_SUB(CURRENT_DATE, INTERVAL 6 MONTH)
            GROUP BY DATE_FORMAT(transaction_date, '%Y-%m')
            ORDER BY month ASC;
        `;

        // Get budget progress
        const [budgetProgress] = await db.query(
            `WITH AllBudgets AS (
                SELECT 
                    b.budget_id,
                    b.amount,
                    b.remaining_amount,
                    b.start_date,
                    b.end_date,
                    c.category_name,
                    CASE 
                        WHEN b.start_date <= CURDATE() AND b.end_date >= CURDATE() THEN 'active'
                        WHEN b.end_date < CURDATE() THEN 'expired'
                        ELSE 'future'
                    END as budget_status,
                    COALESCE(
                        (SELECT SUM(t.amount) 
                         FROM transactions t 
                         WHERE t.budget_id = b.budget_id 
                         AND t.transaction_type = 'expense'
                         AND t.transaction_date BETWEEN b.start_date AND b.end_date),
                        0
                    ) as spent_amount
                FROM budget b
                JOIN categories c ON b.category_id = c.category_id
                WHERE b.user_id = ?
            )
            SELECT 
                SUM(CASE WHEN budget_status = 'active' THEN amount ELSE 0 END) as total_budget,
                SUM(CASE WHEN budget_status = 'active' THEN spent_amount ELSE 0 END) as total_spent,
                SUM(CASE WHEN budget_status = 'active' THEN (amount - spent_amount) ELSE 0 END) as total_remaining,
                COUNT(CASE WHEN budget_status = 'active' THEN 1 END) as active_budgets_count,
                COUNT(CASE WHEN budget_status = 'expired' THEN 1 END) as expired_budgets_count,
                COUNT(CASE WHEN budget_status = 'future' THEN 1 END) as future_budgets_count,
                GROUP_CONCAT(
                    CONCAT(
                        'Budget ID: ', budget_id, 
                        ', Category: ', category_name,
                        ', Amount: ', amount,
                        ', Spent: ', spent_amount,
                        ', Remaining: ', (amount - spent_amount),
                        ', Start: ', DATE_FORMAT(start_date, '%Y-%m-%d'),
                        ', End: ', DATE_FORMAT(end_date, '%Y-%m-%d'),
                        ', Status: ', budget_status
                    )
                    SEPARATOR '\n'
                ) as budget_details
            FROM AllBudgets`,
            [userId]
        );

        console.log('Budget Debug Info:');
        console.log('User ID:', userId);
        console.log('Current Date:', new Date().toISOString().split('T')[0]);
        console.log('Active Budgets:', budgetProgress[0].active_budgets_count);
        console.log('Expired Budgets:', budgetProgress[0].expired_budgets_count);
        console.log('Future Budgets:', budgetProgress[0].future_budgets_count);
        console.log('\nBudget Details:');
        console.log(budgetProgress[0].budget_details);
        console.log('\nCalculated Totals:');
        console.log('Total Budget:', budgetProgress[0].total_budget);
        console.log('Total Spent:', budgetProgress[0].total_spent);
        console.log('Total Remaining:', budgetProgress[0].total_remaining);

        // Debug query to check all budgets regardless of status
        const [budgetDebug] = await db.query(`
            SELECT 
                b.budget_id,
                b.amount,
                b.remaining_amount,
                b.start_date,
                b.end_date,
                c.category_name,
                CASE 
                    WHEN b.start_date <= CURDATE() AND b.end_date >= CURDATE() THEN 'active'
                    WHEN b.end_date < CURDATE() THEN 'expired'
                    ELSE 'future'
                END as budget_status,
                COALESCE(
                    (SELECT SUM(t.amount) 
                     FROM transactions t 
                     WHERE t.budget_id = b.budget_id 
                     AND t.transaction_type = 'expense'
                     AND t.transaction_date BETWEEN b.start_date AND b.end_date),
                    0
                ) as spent_amount
            FROM budget b
            JOIN categories c ON b.category_id = c.category_id
            WHERE b.user_id = ?
        `, [userId]);

        console.log('\nAll Budgets in Database:');
        console.log(JSON.stringify(budgetDebug, null, 2));

        // Get savings progress
        const savingsProgressQuery = `
            SELECT 
                COALESCE(SUM(target_amount), 0) as total_target,
                COALESCE(SUM(saved_amount), 0) as total_saved,
                CASE 
                    WHEN SUM(target_amount) > 0 
                    THEN (SUM(saved_amount) / SUM(target_amount)) * 100 
                    ELSE 0 
                END as progress
            FROM saving_goals
            WHERE user_id = ? AND status = 'active';
        `;

        // Get upcoming debt payments
        const upcomingPaymentsQuery = `
            SELECT 
                dl.debt_id,
                dl.debtor_name,
                dl.amount,
                dl.due_date,
                dl.debt_type,
                dl.status
            FROM debts_loans dl
            WHERE dl.user_id = ?
            AND dl.status = 'pending'
            AND dl.due_date >= CURRENT_DATE
            ORDER BY dl.due_date ASC
            LIMIT 5;
        `;

        // Execute all queries
        const [walletResult] = await db.query(walletQuery, [userId]);
        const [spendingTrends] = await db.query(spendingTrendsQuery, [userId]);
        const [savingsProgress] = await db.query(savingsProgressQuery, [userId]);
        const [upcomingPayments] = await db.query(upcomingPaymentsQuery, [userId]);

        console.log('Raw Data:');
        console.log('Wallet Result:', walletResult);
        console.log('Spending Trends:', spendingTrends);
        console.log('Raw Budget Data:', {
            budgetProgress: budgetProgress[0],
            activeBudgetsCount: budgetProgress[0]?.active_budgets_count || 0
        });
        console.log('Savings Progress:', savingsProgress);
        console.log('Upcoming Payments:', upcomingPayments);

        // Calculate budget progress
        const totalBudget = parseFloat(budgetProgress[0]?.total_budget || 0);
        const remainingAmount = parseFloat(budgetProgress[0]?.total_remaining || 0);
        const totalSpent = parseFloat(budgetProgress[0]?.total_spent || 0);
        const budgetProgressPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

        console.log('Budget Calculation:', {
            totalBudget,
            totalSpent,
            remainingAmount,
            budgetProgress: budgetProgressPercentage,
            activeBudgetsCount: budgetProgress[0]?.active_budgets_count || 0
        });

        // Calculate savings progress
        const totalTarget = parseFloat(savingsProgress[0]?.total_target || 0);
        const totalSaved = parseFloat(savingsProgress[0]?.total_saved || 0);
        const savingsProgressPercentage = parseFloat(savingsProgress[0]?.progress || 0);

        console.log('Savings Calculation Details:', {
            totalTarget,
            totalSaved,
            savingsProgress: savingsProgressPercentage
        });

        // Prepare response
        const responseData = {
            success: true,
            data: {
                wallet: { balance: walletResult[0]?.current_balance || 0 },
                spendingTrends: spendingTrends.map(trend => ({
                    month: trend.month,
                    expenses: parseFloat(trend.expenses),
                    income: parseFloat(trend.income)
                })),
                budget: {
                    total: totalBudget,
                    spent: totalSpent,
                    remaining: remainingAmount,
                    progress: budgetProgressPercentage,
                    activeBudgetsCount: budgetProgress[0]?.active_budgets_count || 0
                },
                savings: {
                    target: totalTarget,
                    saved: totalSaved,
                    progress: savingsProgressPercentage
                },
                upcomingPayments: upcomingPayments.map(payment => ({
                    id: payment.debt_id,
                    name: payment.debtor_name,
                    amount: parseFloat(payment.amount),
                    dueDate: payment.due_date,
                    type: payment.debt_type,
                    status: payment.status
                }))
            }
        };

        console.log('Final Response Data:', JSON.stringify(responseData, null, 2));
        res.json(responseData);
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching dashboard data',
            error: error.message
        });
    }
}; 