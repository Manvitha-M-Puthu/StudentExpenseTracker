import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getCategoryColor } from '../../utils/categoryColors';
import * as transactionApi from '../../services/transactionApi';
import * as categoryApi from '../../services/categoryApi';
import * as budgetApi from '../../services/budgetApi';
import './transactions.css';
import transcript from './transcript.svg'
const Transactions = () => {
  const { currentUser } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0
  });
  
  const [newTransaction, setNewTransaction] = useState({
    amount: '',
    transactionType: 'expense',
    description: '',
    categoryId: '',
    budgetId: '',
    transactionDate: new Date().toISOString().split('T')[0]
  });
  
  const [filters, setFilters] = useState({
    categoryId: '',
    transactionType: '',
    startDate: '',
    endDate: '',
    searchQuery: ''
  });
  
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (currentUser && currentUser.user_id) {
      fetchTransactions();
      fetchCategories();
      fetchBudgets();
    }
  }, [currentUser]);

  const filteredTransactions = transactions.filter(transaction => {
    let match = true;

    if (filters.categoryId && transaction.category_id !== parseInt(filters.categoryId)) {
      match = false;
    }

    if (filters.transactionType && transaction.transaction_type !== filters.transactionType) {
      match = false;
    }

    if (filters.startDate && new Date(transaction.transaction_date) < new Date(filters.startDate)) {
      match = false;
    }

    if (filters.endDate && new Date(transaction.transaction_date) > new Date(filters.endDate)) {
      match = false;
    }

    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      const matchesDescription = transaction.description && 
        transaction.description.toLowerCase().includes(query);
      const matchesCategory = transaction.category_name && 
        transaction.category_name.toLowerCase().includes(query);
      
      if (!matchesDescription && !matchesCategory) {
        match = false;
      }
    }

    return match;
  });

  useEffect(() => {
   
    if (filteredTransactions.length > 0) {
      const income = filteredTransactions
        .filter(t => t.transaction_type === 'income')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);
      
      const expense = filteredTransactions
        .filter(t => t.transaction_type === 'expense')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);
      
      setStats({
        totalIncome: income.toFixed(2),
        totalExpense: expense.toFixed(2),
        balance: (income - expense).toFixed(2)
      });
    } else {
      setStats({
        totalIncome: 0,
        totalExpense: 0,
        balance: 0
      });
    }
  }, [filteredTransactions]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const data = await transactionApi.getUserTransactions(currentUser.user_id);
      setTransactions(data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      showMessage('Failed to fetch transactions', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await categoryApi.getUserCategories(currentUser.user_id);
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      showMessage('Failed to fetch categories', 'error');
    }
  };

  const fetchBudgets = async () => {
    try {
      const data = await budgetApi.getUserBudgets(currentUser.user_id);
      setBudgets(data);
    } catch (error) {
      console.error('Error fetching budgets:', error);
      showMessage('Failed to fetch budgets', 'error');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Clear category and budget if switching to income
    if (name === 'transactionType' && value === 'income') {
      setNewTransaction({ 
        ...newTransaction, 
        [name]: value,
        categoryId: '',
        budgetId: ''
      });
    } else {
      setNewTransaction({ ...newTransaction, [name]: value });
    }
  };

  const handleCreateTransaction = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const transactionData = {
        ...newTransaction,
        userId: currentUser.user_id
      };

      await transactionApi.createTransaction(transactionData);
      setNewTransaction({
        amount: '',
        transactionType: 'expense',
        description: '',
        categoryId: '',
        budgetId: '',
        transactionDate: new Date().toISOString().split('T')[0]
      });
      fetchTransactions();
      fetchBudgets(); 
      showMessage('Transaction created successfully', 'success');
      setShowAddForm(false);
    } catch (error) {
      console.error('Error creating transaction:', error);
      showMessage(error.response?.data?.error || 'Failed to create transaction', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (transaction) => {
    setEditingTransaction({
      ...transaction,
      transactionDate: transaction.formatted_date || transaction.transaction_date
    });
    setShowEditModal(true);
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    

    if (name === 'transaction_type' && value === 'income') {
      setEditingTransaction({ 
        ...editingTransaction, 
        [name]: value,
        category_id: '',
        budget_id: ''
      });
    } else {
      setEditingTransaction({ ...editingTransaction, [name]: value });
    }
  };

  const handleUpdateTransaction = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await transactionApi.updateTransaction(
        currentUser.user_id,
        editingTransaction.transaction_id,
        {
          amount: editingTransaction.amount,
          transactionType: editingTransaction.transaction_type,
          description: editingTransaction.description,
          categoryId: editingTransaction.category_id,
          budgetId: editingTransaction.budget_id,
          transactionDate: editingTransaction.transactionDate
        }
      );
      setShowEditModal(false);
      fetchTransactions();
      fetchBudgets(); 
      showMessage('Transaction updated successfully', 'success');
    } catch (error) {
      console.error('Error updating transaction:', error);
      showMessage(error.response?.data?.error || 'Failed to update transaction', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTransaction = async (transactionId) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) {
      return;
    }
    try {
      setLoading(true);
      await transactionApi.deleteTransaction(currentUser.user_id, transactionId);
      fetchTransactions(); 
      fetchBudgets(); 
      showMessage('Transaction deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting transaction:', error);
      showMessage(error.response?.data?.error || 'Failed to delete transaction', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const clearFilters = () => {
    setFilters({
      categoryId: '',
      transactionType: '',
      startDate: '',
      endDate: '',
      searchQuery: ''
    });
  };

  const showMessage = (text, type) => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 5000);
  };

  return (
    <div className="transactions-container">
      <div className="heading">
      <img className='head-img' src={transcript} alt="" />
      <h1 >Transactions</h1>
      </div>
      {message && (
        <div className={`message ${messageType}`}>
          {message}
          <button className="close-btn" onClick={() => setMessage('')}>×</button>
        </div>
      )}
      
      {/* Dashboard Summary */}
      <div className="dashboard-summary">
        <div className="summary-card income">
          <h3>Total Income</h3>
          <p>₹{stats.totalIncome}</p>
        </div>
        <div className="summary-card expense">
          <h3>Total Expenses</h3>
          <p>₹{stats.totalExpense}</p>
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="action-buttons">
        <button 
          className="btn btn-primary" 
          onClick={() => setShowAddForm(!showAddForm)}
        >
          {showAddForm ? 'Hide Form' : 'Add Transaction'}
        </button>
        <button 
          className="btn btn-secondary" 
          onClick={() => setShowFilters(!showFilters)}
        >
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </button>
      </div>
      
      {/* Create Transaction Form */}
      {showAddForm && (
        <div className="transaction-section form-section add-transaction">
          <h2>Add New Transaction</h2>
          <form onSubmit={handleCreateTransaction}>
            <div className="form-grid">
              <div className="form-group">
                <label>Amount</label>
                <input
                  type="number"
                  name="amount"
                  value={newTransaction.amount}
                  onChange={handleInputChange}
                  placeholder="Enter amount"
                  step="0.01"
                  min="0.01"
                  required
                />
              </div>
              <div className="form-group">
                <label>Type</label>
                <select
                  name="transactionType"
                  value={newTransaction.transactionType}
                  onChange={handleInputChange}
                  required
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>
              <div className="form-group">
                <label>Category</label>
                <select
                  name="categoryId"
                  value={newTransaction.categoryId}
                  onChange={handleInputChange}
                  disabled={newTransaction.transactionType === 'income'}
                  className="category-select"
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
                <label>Budget</label>
                <select
                  name="budgetId"
                  value={newTransaction.budgetId}
                  onChange={handleInputChange}
                  disabled={newTransaction.transactionType !== 'expense'}
                >
                  <option value="">Select a budget</option>
                  {budgets.map((budget) => (
                    <option 
                      key={budget.budget_id} 
                      value={budget.budget_id}
                      style={{ 
                        backgroundColor: getCategoryColor(budget.category_name) + '20', // Light background
                        borderLeft: `4px solid ${getCategoryColor(budget.category_name)}` 
                      }}
                    >
                      {budget.category_name} - ₹{budget.amount} (₹{budget.remaining_amount} left)
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Description</label>
                <input
                  type="text"
                  name="description"
                  value={newTransaction.description}
                  onChange={handleInputChange}
                  placeholder="Enter description"
                />
              </div>
              <div className="form-group">
                <label>Date</label>
                <input
                  type="date"
                  name="transactionDate"
                  value={newTransaction.transactionDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            <div className="add-trans-btn">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Adding...' : 'Add Transaction'}
            </button>
            </div>
          </form>
        </div>
      )}
      
      {/* Filters */}
      {showFilters && (
        <div className="transaction-section filters-section">
          <div className="section-header">
            <h2>Filters</h2>
            <button onClick={clearFilters} className="btn-sm btn-text">Clear Filters</button>
          </div>
          <div className="filters-grid">
            <div className="form-group">
              <label>Search</label>
              <input
                type="text"
                name="searchQuery"
                value={filters.searchQuery}
                onChange={handleFilterChange}
                placeholder="Search descriptions or categories"
              />
            </div>
            <div className="form-group">
              <label>Category</label>
              <select
                name="categoryId"
                value={filters.categoryId}
                onChange={handleFilterChange}
                className="category-select"
              >
                <option value="">All Categories</option>
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
              <label>Type</label>
              <select
                name="transactionType"
                value={filters.transactionType}
                onChange={handleFilterChange}
              >
                <option value="">All Types</option>
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </div>
            <div className="form-group">
              <label>Start Date</label>
              <input
                type="date"
                name="startDate"
                value={filters.startDate}
                onChange={handleFilterChange}
              />
            </div>
            <div className="form-group">
              <label>End Date</label>
              <input
                type="date"
                name="endDate"
                value={filters.endDate}
                onChange={handleFilterChange}
              />
            </div>
          </div>
        </div>
      )}
      
      {/* Transaction List */}
      <div className="transaction-section">
        <div className="section-header">
          <h2>Transaction History</h2>
          <span className="count-badge">{filteredTransactions.length} transactions</span>
        </div>
        
        {loading ? (
          <div className="loading-indicator">Loading transactions...</div>
        ) : filteredTransactions.length > 0 ? (
          <div className="transactions-list">
            {filteredTransactions.map((transaction) => {
              const categoryColor = getCategoryColor(transaction.category_name);
              return (
                <div 
                  key={transaction.transaction_id} 
                  className={`transaction-card ${transaction.transaction_type}`}
                  style={{
                    borderLeft: transaction.transaction_type === 'expense' ? 
                      `4px solid ${categoryColor}` : '4px solid var(--income-color)',
                      backgroundColor: `${categoryColor}15`,
                  }}
                >
                  <div className="transaction-header">
                    <span className="transaction-date">
                      {transaction.formatted_date || new Date(transaction.transaction_date).toLocaleDateString()}
                    </span>
                    <span className={`transaction-amount ${transaction.transaction_type}`}>
                      {transaction.transaction_type === 'income' ? '+' : '-'}₹{transaction.amount}
                    </span>
                  </div>
                  <div className="transaction-body">
                    <h3 style={
                      {
                       textTransform: 'capitalize'
                      }
                    } className="transaction-description">
                      {transaction.description || 'No description'}
                    </h3>
                    {transaction.category_name && transaction.transaction_type === 'expense' && (
                      <div className="transaction-category">
                        <span className="category-tag" style={{ backgroundColor: categoryColor }}>
                          {transaction.category_name}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="transaction-actions">
                    <button onClick={() => handleEditClick(transaction)} className="btn-sm btn-edit">
                      Edit
                    </button>
                    <button onClick={() => handleDeleteTransaction(transaction.transaction_id)} className="btn-sm btn-delete">
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="no-data">
            <p>No transactions found</p>
            {Object.values(filters).some(value => value !== '') && (
              <button onClick={clearFilters} className="btn-sm">Clear Filters</button>
            )}
          </div>
        )}
      </div>
      
      {/* Edit Transaction Modal */}
      {showEditModal && editingTransaction && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Edit Transaction</h2>
              <button className="close-btn" onClick={() => setShowEditModal(false)}>×</button>
            </div>
            <form onSubmit={handleUpdateTransaction}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Amount</label>
                  <input
                    type="number"
                    name="amount"
                    value={editingTransaction.amount}
                    onChange={handleEditInputChange}
                    step="0.01"
                    min="0.01"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Type</label>
                  <select
                    name="transaction_type"
                    value={editingTransaction.transaction_type}
                    onChange={handleEditInputChange}
                    required
                  >
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <select
                    name="category_id"
                    value={editingTransaction.category_id || ''}
                    onChange={handleEditInputChange}
                    disabled={editingTransaction.transaction_type === 'income'}
                    className="category-select"
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
                  <label>Budget</label>
                  <select
                    name="budget_id"
                    value={editingTransaction.budget_id || ''}
                    onChange={handleEditInputChange}
                    disabled={editingTransaction.transaction_type !== 'expense'}
                  >
                    <option value="">Select a budget</option>
                    {budgets.map((budget) => (
                      <option 
                        key={budget.budget_id} 
                        value={budget.budget_id}
                        style={{ 
                          backgroundColor: getCategoryColor(budget.category_name) + '20', // Light background
                          borderLeft: `4px solid ${getCategoryColor(budget.category_name)}` 
                        }}
                      >
                        {budget.category_name} - ₹{budget.amount} (₹{budget.remaining_amount} left)
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <input
                    type="text"
                    name="description"
                    value={editingTransaction.description || ''}
                    onChange={handleEditInputChange}
                    placeholder="Enter description"
                  />
                </div>
                <div className="form-group">
                  <label>Date</label>
                  <input
                    type="date"
                    name="transactionDate"
                    value={editingTransaction.transactionDate}
                    onChange={handleEditInputChange}
                    required
                  />
                </div>
              </div>
              <div className="modal-buttons">
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Updating...' : 'Update Transaction'}
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowEditModal(false)}
                >
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

export default Transactions;