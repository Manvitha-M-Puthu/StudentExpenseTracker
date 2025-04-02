import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/authContext';
import { getCategoryColor } from '../../utils/categoryColors';
import * as categoryApi from '../../services/categoryApi';
import * as budgetApi from '../../services/budgetApi';
import './budget.css';
import moneyLogo from './money-logo.svg'
import pigSave from './pigsave.svg';
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
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');
    const [editingBudget, setEditingBudget] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);

    useEffect(() => {
        if (currentUser) {
            fetchCategories();
            fetchBudgets();
        }
    }, [currentUser]);

    const fetchCategories = async () => {
        try {
            const response = await categoryApi.getUserCategories();
            setCategories(response.data);
        } catch (error) {
            console.error('Error fetching categories:', error);
            setMessage(error.response?.data?.message || 'Error fetching categories');
            setMessageType('error');
        }
    };

    const fetchBudgets = async () => {
        try {
            const response = await budgetApi.getUserBudgets();
            setBudgets(response.data);
        } catch (error) {
            console.error('Error fetching budgets:', error);
            setMessage(error.response?.data?.message || 'Error fetching budgets');
            setMessageType('error');
        }
    };

    const handleCreateCategory = async (e) => {
        e.preventDefault();
        if (!newCategory.trim()) {
            setMessage('Category name cannot be empty');
            setMessageType('error');
            return;
        }

        try {
            await categoryApi.createCategory(newCategory.trim());
            setNewCategory('');
            fetchCategories();
            setMessage('Category created successfully');
            setMessageType('success');
        } catch (error) {
            console.error('Error creating category:', error);
            if (error.response && error.response.status === 409) {
                setMessage('This category already exists');
                setMessageType('error');
            } else {
                setMessage(error.response?.data?.message || 'Error creating category');
                setMessageType('error');
            }
        }
    };

    const handleCreateBudget = async (e) => {
        e.preventDefault();
        try {
            const budgetData = {
                categoryId: newBudget.categoryId,
                amount: newBudget.amount,
                startDate: newBudget.startDate,
                endDate: newBudget.endDate
            };
            await budgetApi.createBudget(budgetData);
            setNewBudget({
                categoryId: '',
                amount: '',
                startDate: '',
                endDate: '',
            });
            fetchBudgets();
            setMessage('Budget created successfully');
            setMessageType('success');
        } catch (error) {
            console.error('Error creating budget:', error);
            setMessage(error.response?.data?.message || 'Error creating budget');
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
            await budgetApi.updateBudget(editingBudget.budget_id, editingBudget);
            setEditingBudget(null);
            setShowEditModal(false);
            fetchBudgets();
            setMessage('Budget updated successfully');
            setMessageType('success');
        } catch (error) {
            console.error('Error updating budget:', error);
            setMessage(error.response?.data?.message || 'Error updating budget');
            setMessageType('error');
        }
    };

    const handleDeleteBudget = async (budgetId) => {
        try {
            await budgetApi.deleteBudget(budgetId);
            fetchBudgets();
            setMessage('Budget deleted successfully');
            setMessageType('success');
        } catch (error) {
            console.error('Error deleting budget:', error);
            setMessage(error.response?.data?.message || 'Error deleting budget');
            setMessageType('error');
        }
    };

    const getBudgetStatus = (budget) => {
        const today = new Date();
        const startDate = new Date(budget.start_date);
        const endDate = new Date(budget.end_date);
        
        if (today < startDate) return 'future';
        if (today > endDate) return 'expired';
        return 'active';
    };

    const renderProgressCircle = (budget) => {
       
        const totalBudget = parseFloat(budget.amount);
        const remainingBudget = parseFloat(budget.remaining_amount);
        const usedPercentage = ((totalBudget - remainingBudget) / totalBudget) * 100;
        const remainingPercentage = 100 - usedPercentage;

        const getColor = (percent) => {
            if (percent >= 66) return '#4CAF50';
            if (percent >= 33) return '#FFC107'; 
            return '#F44336';
        };

        const color = getColor(remainingPercentage);
        const radius = 40;
        const circumference = 2 * Math.PI * radius;
        const dashOffset = circumference - (remainingPercentage / 100) * circumference;

        return (
            <div className="budget-progress-circle">
                <svg width="100" height="100" viewBox="0 0 100 100">
                    <circle
                        className="progress-circle-bg"
                        cx="50"
                        cy="50"
                        r={radius}
                        strokeWidth="8"
                    />
                    <circle
                        className="progress-circle-path"
                        cx="50"
                        cy="50"
                        r={radius}
                        strokeWidth="8"
                        style={{
                            stroke: color,
                            strokeDasharray: circumference,
                            strokeDashoffset: dashOffset
                        }}
                    />
                    <text
                        x="50"
                        y="50"
                        textAnchor="middle"
                        dy=".3em"
                        className="progress-text"
                    >
                        {remainingPercentage.toFixed(0)}%
                    </text>
                </svg>
                <div className="progress-label">remaining</div>
            </div>
        );
    };

    const renderBudgetCard = (budget) => {
        const categoryColor = getCategoryColor(budget.category_name);
        const status = getBudgetStatus(budget);
        const isExpired = status === 'expired';

        return (
            <div 
                key={budget.budget_id} 
                className={`budget-card ${isExpired ? 'expired' : ''}`}
                style={{ 
                    borderLeft: `4px solid ${categoryColor}`,
                    backgroundColor: `${categoryColor}25`,
                    opacity: isExpired ? 0.7 : 1
                }}
            >
                <h3 style={{ 
                    backgroundColor: `${categoryColor}85`,
                    padding: '10px',
                    borderRadius: '10px',
                }}>
                    {budget.category_name}
                    {isExpired && <span className="expired-badge">Expired</span>}
                </h3>
                <div className="budget-progress-container">
                    <div className="budget-details">
                        <div className="content"> <img src={moneyLogo} alt="Money Logo" /> <p>Amount: ₹{budget.amount}</p></div>
                        <div className="content"> <img src={pigSave} alt="Money Logo" /> <p>Remaining: ₹{budget.remaining_amount || budget.amount}</p></div>
                        <div className="content"> <img src={startlogo} alt="Start Date Logo" /> <p>Start Date: {new Date(budget.start_date).toLocaleDateString()}</p></div>
                        <div className="content"> <img src={endlogo} alt="End Date Logo" /> <p>End Date: {new Date(budget.end_date).toLocaleDateString()}</p></div>
                    </div>
                    <div className="circular-progress-container">
                        {renderProgressCircle(budget)}
                    </div>
                </div>
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
           
            
             {message && (
                <div className={`alert ${messageType === 'success' ? 'alert-success' : 'alert-error'}`}>
                    {message}
                </div>
            )} 
            
            <div className="budget-section">
                {budgets.length > 0 && (
                    <>
                        <div className="active-budgets">
                            <h2>Active Budgets</h2>
                            <div className="categories-list">
                                {budgets
                                    .filter(budget => getBudgetStatus(budget) === 'active')
                                    .map(renderBudgetCard)}
                            </div>
                        </div>

                        <div className="expired-budgets">
                            <h2>Expired Budgets</h2>
                            <div className="categories-list">
                                {budgets
                                    .filter(budget => getBudgetStatus(budget) === 'expired')
                                    .map(renderBudgetCard)}
                            </div>
                        </div>
                    </>
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
                    <div className="budget-btn">
                        <button type="submit" className="btn btn-success create-budget-btn">
                            <span className="btn-icon">✓</span> Create 
                        </button>
                    </div>
                    </div>
                </form>

                {categories.length > 0 && (
    <div className="categories">
        <div>
            <h3>Available Categories</h3>
        </div>
        <div className="categories-list">
            {categories.map((category) => {
                const categoryColor = getCategoryColor(category.category_name);
                return (
                    <div 
                        key={category.category_id} 
                        className="category-card"
                        style={{ 
                            borderLeft: `4px solid ${categoryColor}`,
                            backgroundColor: `${categoryColor}15`
                        }}
                    >
                        <h3 >{category.category_name}</h3>
                    </div>
                );
            })}
        </div>
    </div>
)}
            </div>

            {/* Create Budget Section */}
            <div className="budget-section budget-form-section">
                <h2><span className="icon-header"><img src={pigSave}></img></span> Set New Budget</h2>
                <div className="setBudget-container">
                <form onSubmit={handleCreateBudget}>
                    <div className="form-group-container">
                        <div className="form-group">
                            <label htmlFor="category-select">
                               Category
                            </label>
                            <select
                                id="category-select"
                                className="form-control styled-select"
                                value={newBudget.categoryId}
                                onChange={(e) => setNewBudget({ ...newBudget, categoryId: e.target.value })}
                                required
                            >
                                <option value="">Select a category</option>
                                {categories.map((category) => (
                                    <option 
                                        key={category.category_id} 
                                        value={category.category_id}
                                        style={{ 
                                            backgroundColor: getCategoryColor(category.category_name) + '20', // Light background 
                                            borderLeft: `4px solid ${getCategoryColor(category.category_name)}` 
                                        }}
                                    >
                                        {category.category_name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="amount-input">
                                Budget Amount
                            </label>
                            <div className="amount-input-container">
                                <span className="currency-symbol">₹</span>
                                <input
                                    id="amount-input"
                                    type="number"
                                    min="1"
                                    step="any"
                                    className="form-control amount-input"
                                    value={newBudget.amount}
                                    onChange={(e) => setNewBudget({ ...newBudget, amount: e.target.value })}
                                    placeholder="0.00"
                                    required
                                />
                            </div>
                        </div>
                    </div>
                    
                    <div className="form-group-container date-container">
                        <div className="form-group">
                            <label htmlFor="start-date">
                                Start Date
                            </label>
                            <input
                                id="start-date"
                                type="date"
                                className="form-control date-input"
                                value={newBudget.startDate}
                                onChange={(e) => setNewBudget({ ...newBudget, startDate: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="end-date">
                              End Date
                            </label>
                            <input
                                id="end-date"
                                type="date"
                                className="form-control date-input"
                                value={newBudget.endDate}
                                onChange={(e) => setNewBudget({ ...newBudget, endDate: e.target.value })}
                                required
                                min={newBudget.startDate} // Can't select end date before start date
                            />
                        </div>
                    </div>
                    
                    <div className="budget-btn">
                        <button type="submit" className="btn btn-success create-budget-btn">
                            <span className="btn-icon">✓</span> Create Budget
                        </button>
                    </div>
                </form>
                </div>
            </div>
                           
            {/* Edit Budget Modal */}
            {showEditModal && editingBudget && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2><span className="icon-header">✏️</span> Edit Budget</h2>
                        <form onSubmit={handleUpdateBudget}>
                            <div className=" edit-amount-container">
                                <label htmlFor="edit-amount">
                              Amount
                                </label>
                                <div className="amount-input-container">
                                    <span className="currency-symbol">₹</span>
                                    <input
                                        id="edit-amount"
                                        type="number"
                                        min="1"
                                        step="any"
                                        className="form-control amount-input"
                                        value={editingBudget.amount}
                                        onChange={(e) => setEditingBudget({ ...editingBudget, amount: e.target.value })}
                                        placeholder="0.00"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="form-group-container date-container">
                                <div className="form-group">
                                    <label htmlFor="edit-start-date">
                                     Start Date
                                    </label>
                                    <input
                                        id="edit-start-date"
                                        type="date"
                                        className="form-control date-input"
                                        value={editingBudget.start_date}
                                        onChange={(e) => setEditingBudget({ ...editingBudget, start_date: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="edit-end-date">
                                       End Date
                                    </label>
                                    <input
                                        id="edit-end-date"
                                        type="date"
                                        className="form-control date-input"
                                        value={editingBudget.end_date}
                                        onChange={(e) => setEditingBudget({ ...editingBudget, end_date: e.target.value })}
                                        required
                                        min={editingBudget.start_date}
                                    />
                                </div>
                            </div>
                            <div className="modal-buttons">
                                <button type="submit" className="save-button">
                                    <span className="btn-icon">✓</span> Save Changes
                                </button>
                                <button type="button" className="cancel-button" onClick={() => setShowEditModal(false)}>
                                    <span className="btn-icon">✕</span> Cancel
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