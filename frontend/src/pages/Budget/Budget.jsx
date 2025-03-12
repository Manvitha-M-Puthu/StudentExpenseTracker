import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import './budget.css';
import moneyLogo from './money-logo.svg'
import endlogo from './enddate.svg';
import startlogo from './startdate.svg';
const Budget = () => {
    const { currentUser } = useAuth();
    const [categories, setCategories] = useState([]);
    const [budgets, setBudgets] = useState([]);
    const [newCategory, setNewCategory] = useState('');
    const [newBudget, setNewBudget] = useState({
        categoryId: '',
        amount: '',
        startDate: '',
        endDate: '',
    });
    const [setMessage] = useState(''); //uncomment message if alert needed
    const [setMessageType] = useState('');//uncomment messageType if needed
    const [editingBudget, setEditingBudget] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);


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
            const response = await axios.get(`/api/budgets/${currentUser.user_id}`);
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
                categoryId: newBudget.categoryId,
                amount: parseFloat(newBudget.amount),
                startDate: newBudget.startDate,
                endDate: newBudget.endDate
            };
            console.log('Sending budget data:', budgetData);

            const response = await axios.post('/api/budgets', budgetData);

            if (response.data) {
                setNewBudget({
                    categoryId: '',
                    amount: '',
                    startDate: '',
                    endDate: '',
                });
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

    const handleEditBudget = (budget) => {
        setEditingBudget(budget);
        setShowEditModal(true);
    };

    const handleUpdateBudget = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.put('/api/budgets', {
                budgetId: editingBudget.budget_id,
                userId: currentUser.user_id,
                amount: editingBudget.amount,
                startDate: editingBudget.start_date,
                endDate: editingBudget.end_date,
            });

            if (response.data) {
                setShowEditModal(false);
                setEditingBudget(null);
                fetchBudgets();
                setMessage('Budget updated successfully');
                setMessageType('success');
            }
        } catch (error) {
            console.error('Error updating budget:', error);
            setMessage(error.response?.data?.error || 'Error updating budget');
            setMessageType('error');
        }
    };

    const handleDeleteBudget = async (budgetId) => {
        if (!window.confirm('Are you sure you want to delete this budget?')) {
            return;
        }
        
        try {
            const response = await axios.delete(`/api/budgets/${budgetId}`, {
                data: { userId: currentUser.user_id }
            });

            if (response.data) {
                await fetchBudgets();
                setMessage('Budget deleted successfully');
                setMessageType('success');
            }
        } catch (error) {
            console.error('Error deleting budget:', error);
            setMessage(error.response?.data?.error || 'Error deleting budget');
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
                <h1>Budget Tracker</h1>
            </div>
            
            {/* {message && (
                <div className={`alert ${messageType === 'success' ? 'alert-success' : 'alert-error'}`}>
                    {message}
                </div>
            )} */}
            
            <div className="budget-section">
                {budgets.length > 0 && (
                  <div className="active-budgets">
                        <h2>Active Budgets</h2>
                        <div className="categories-list">
                        {budgets.map((budget) => {
                            const categoryClass = budget.category_name.toLowerCase(); // Convert category name to lowercase
                            return (
                                <div key={budget.budget_id} className={`budget-card ${categoryClass}`}>
                                    <h3>{budget.category_name}</h3>
                                    <div className="content"> <img src={moneyLogo} alt="Money Logo" /> <p>Amount:  ₹{budget.amount}</p></div>
                                    <div className="content"> <img src={moneyLogo} alt="Money Logo" /> <p>Remaining:  ₹{budget.remaining_amount || budget.amount}</p></div>
                                    <div className="content"> <img src={startlogo} alt="Start Date Logo" /> <p>Start Date: {new Date(budget.start_date).toLocaleDateString()}</p></div>
                                    <div className="content"> <img src={endlogo} alt="End Date Logo" /> <p>End Date: {new Date(budget.end_date).toLocaleDateString()}</p></div>
                                    <div className="budget-card-buttons">
                                        <button 
                                            className="edit-button"
                                            onClick={() => handleEditBudget(budget)}
                                        >
                                            Edit Budget
                                        </button>
                                        <button 
                                            className="delete-button"
                                            onClick={() => handleDeleteBudget(budget.budget_id)}
                                        >
                                            Delete Budget
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    </div>
                )}
            </div>
                    {/* create categories section */}
            <div className="budget-section">
                <h2>Create New Category</h2>
                <form onSubmit={handleCreateCategory}>
                    <div className="create-category">
                    <div className="form-group">
                    
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
                        Create
                    </button>
                    </div>
                </form>

                {categories.length > 0 && (
    <div className="categories">
        <div>
            <h3>Available Categories</h3>
        </div>
        <div className="categories-list">
            {categories.map((category) => {
                const categoryClass = category.category_name.toLowerCase(); // Convert category name to lowercase
                return (
                    <div key={category.category_id} className={`category-card ${categoryClass}`}>
                        <h3>{category.category_name}</h3>
                    </div>
                );
            })}
        </div>
    </div>
)}
            </div>

            {/* Create Budget Section */}
            <div className="budget-section">
                <h2>Set Budget</h2>
                <div className="setBudget-container">
                <form onSubmit={handleCreateBudget}>
                    <div className="form-group">
                     
                        <select
                            className="form-control"
                            value={newBudget.categoryId}
                            onChange={(e) => setNewBudget({ ...newBudget, categoryId: e.target.value })}
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
                  
                        <input
                           
                            className="form-control large-input"
                            value={newBudget.amount}
                            onChange={(e) => setNewBudget({ ...newBudget, amount: e.target.value })}
                            placeholder="Enter budget amount"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Start Date</label>
                        <input
                            type="date"
                            className="form-control"
                            value={newBudget.startDate}
                            onChange={(e) => setNewBudget({ ...newBudget, startDate: e.target.value })}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>End Date</label>
                        <input
                            type="date"
                            className="form-control"
                            value={newBudget.endDate}
                            onChange={(e) => setNewBudget({ ...newBudget, endDate: e.target.value })}
                            required
                        />
                    </div>
                    <div className="budget-btn">
                    <button type="submit" className="btn btn-success">
                        Set Budget
                    </button>
                    </div>
                </form>
                </div>
                </div>
                           
            {/* Edit Budget Modal */}
            {showEditModal && editingBudget && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>Edit Budget</h2>
                        <form onSubmit={handleUpdateBudget}>
                            <div className="form-group">
                                <label>Amount</label>
                                <input
                              
                                    className="form-control"
                                    value={editingBudget.amount}
                                    onChange={(e) => setEditingBudget({ ...editingBudget, amount: e.target.value })}
                                    placeholder="Enter amount"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Start Date</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    value={editingBudget.start_date}
                                    onChange={(e) => setEditingBudget({ ...editingBudget, start_date: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>End Date</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    value={editingBudget.end_date}
                                    onChange={(e) => setEditingBudget({ ...editingBudget, end_date: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="modal-buttons">
                                <button type="submit">Save Changes</button>
                                <button type="button" onClick={() => setShowEditModal(false)}>
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
           
        </div>
    );
};

export default Budget; 