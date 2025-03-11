import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import './budget.css';

const Budget = () => {
    const { currentUser } = useAuth();
    const [categories, setCategories] = useState([]);
    const [newCategory, setNewCategory] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [amount, setAmount] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');
    const [budgets, setBudgets] = useState([]);

    // Configure axios defaults
    axios.defaults.baseURL = 'http://localhost:8800';
    axios.defaults.withCredentials = true;

    useEffect(() => {
        if (currentUser && currentUser.user_id) {
            fetchCategories();
            fetchBudgets();
        }
    }, [currentUser]);

    const fetchCategories = async () => {
        try {
            const response = await axios.get(`/api/categories/${currentUser.user_id}`);
            setCategories(response.data);
        } catch (error) {
            console.error('Error fetching categories:', error);
            setMessage(error.response?.data?.error || 'Error fetching categories');
            setMessageType('error');
        }
    };

    const fetchBudgets = async () => {
        try {
            const response = await axios.get(`/api/budget/${currentUser.user_id}`);
            setBudgets(response.data);
        } catch (error) {
            console.error('Error fetching budgets:', error);
            setMessage(error.response?.data?.error || 'Error fetching budgets');
            setMessageType('error');
        }
    };

    const handleCreateCategory = async (e) => {
        e.preventDefault();
        try {
            if (!currentUser?.user_id) {
                setMessage('Please log in to create a category');
                setMessageType('error');
                return;
            }

            if (!newCategory || newCategory.trim() === '') {
                setMessage('Please enter a category name');
                setMessageType('error');
                return;
            }

            const categoryData = {
                userId: currentUser.user_id,
                categoryName: newCategory.trim()
            };
            console.log('Sending category data:', categoryData);

            const response = await axios.post('/api/categories', categoryData);
            
            if (response.data) {
                console.log('Category created:', response.data);
                setNewCategory('');
                fetchCategories();
                setMessage('Category created successfully');
                setMessageType('success');
            }
        } catch (error) {
            console.error('Error creating category:', error);
            console.error('Error response:', error.response?.data);
            setMessage(error.response?.data?.error || 'Error creating category. Please check the console for details.');
            setMessageType('error');
        }
    };

    const handleCreateBudget = async (e) => {
        e.preventDefault();
        try {
            // Log the data being sent
            const budgetData = {
                userId: currentUser.user_id,
                categoryId: selectedCategory,
                amount: parseFloat(amount),
                startDate,
                endDate
            };
            console.log('Sending budget data:', budgetData);

            const response = await axios.post('/api/budget', budgetData);

            if (response.data) {
                setSelectedCategory('');
                setAmount('');
                setStartDate('');
                setEndDate('');
                fetchBudgets();
                setMessage('Budget created successfully');
                setMessageType('success');
            }
        } catch (error) {
            console.error('Error creating budget:', error);
            console.error('Error response:', error.response?.data);
            setMessage(error.response?.data?.error || 'Error creating budget. Please check the console for details.');
            setMessageType('error');
        }
    };

    if (!currentUser) {
        return (
            <div className="budget-container">
                <div className="alert alert-error">
                    Please log in to access the budget management features.
                </div>
            </div>
        );
    }

    return (
        <div className="budget-container">
            <div className="budget-header">
                <h1>Budget Management</h1>
            </div>
            
            {message && (
                <div className={`alert ${messageType === 'success' ? 'alert-success' : 'alert-error'}`}>
                    {message}
                </div>
            )}
            
            {/* Create Category Section */}
            <div className="budget-section">
                <h2>Create New Category</h2>
                <form onSubmit={handleCreateCategory}>
                    <div className="form-group">
                        <label>Category Name</label>
                        <input
                            type="text"
                            className="form-control"
                            value={newCategory}
                            onChange={(e) => setNewCategory(e.target.value)}
                            placeholder="Enter category name"
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary">
                        Create Category
                    </button>
                </form>

                {categories.length > 0 && (
                    <div className="categories-list">
                        {categories.map((category) => (
                            <div key={category.category_id} className="category-card">
                                <h3>{category.category_name}</h3>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Create Budget Section */}
            <div className="budget-section">
                <h2>Set Budget</h2>
                <form onSubmit={handleCreateBudget}>
                    <div className="form-group">
                        <label>Category</label>
                        <select
                            className="form-control"
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            required
                        >
                            <option value="">Select a category</option>
                            {categories.map((category) => (
                                <option key={category.category_id} value={category.category_id}>
                                    {category.category_name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Amount</label>
                        <input
                            type="number"
                            className="form-control"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="Enter budget amount"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Start Date</label>
                        <input
                            type="date"
                            className="form-control"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>End Date</label>
                        <input
                            type="date"
                            className="form-control"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-success">
                        Set Budget
                    </button>
                </form>

                {budgets.length > 0 && (
                    <div className="categories-list">
                        {budgets.map((budget) => (
                            <div key={budget.budget_id} className="category-card">
                                <h3>
                                    {categories.find(c => c.category_id === budget.category_id)?.category_name}
                                </h3>
                                <p>Amount: ${budget.amount}</p>
                                <p>From: {new Date(budget.start_date).toLocaleDateString()}</p>
                                <p>To: {new Date(budget.end_date).toLocaleDateString()}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Budget; 