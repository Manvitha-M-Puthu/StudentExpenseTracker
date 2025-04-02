import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/authContext';
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
    if (currentUser) {
      fetchTransactions();
      fetchCategories();
      fetchBudgets();
    }
  }, [currentUser]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await transactionApi.getUserTransactions();
      setTransactions(response.data);
      calculateStats(response.data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setMessage(error.response?.data?.message || 'Failed to fetch transactions');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await categoryApi.getUserCategories();
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setMessage(error.response?.data?.message || 'Failed to fetch categories');
      setMessageType('error');
    }
  };

  const fetchBudgets = async () => {
    try {
      const response = await budgetApi.getUserBudgets();
      setBudgets(response.data);
    } catch (error) {
      console.error('Error fetching budgets:', error);
      setMessage(error.response?.data?.message || 'Failed to fetch budgets');
      setMessageType('error');
    }
  };

  const calculateStats = (transactions) => {
    const stats = transactions.reduce((acc, transaction) => {
      if (transaction.transactionType === 'income') {
        acc.totalIncome += parseFloat(transaction.amount);
      } else {
        acc.totalExpense += parseFloat(transaction.amount);
      }
      return acc;
    }, { totalIncome: 0, totalExpense: 0 });

    stats.balance = stats.totalIncome - stats.totalExpense;
    setStats(stats);
  };

  const handleCreateTransaction = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await transactionApi.createTransaction(newTransaction);
      setTransactions([...transactions, response.data]);
      calculateStats([...transactions, response.data]);
      setNewTransaction({
        amount: '',
        transactionType: 'expense',
        description: '',
        categoryId: '',
        budgetId: '',
        transactionDate: new Date().toISOString().split('T')[0]
      });
      setShowAddForm(false);
      setMessage('Transaction created successfully');
      setMessageType('success');
    } catch (error) {
      console.error('Error creating transaction:', error);
      setMessage(error.response?.data?.message || 'Failed to create transaction');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTransaction = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await transactionApi.updateTransaction(
        editingTransaction.transaction_id,
        editingTransaction
      );
      const updatedTransactions = transactions.map(t =>
        t.transaction_id === editingTransaction.transaction_id ? response.data : t
      );
      setTransactions(updatedTransactions);
      calculateStats(updatedTransactions);
      setEditingTransaction(null);
      setShowEditModal(false);
      setMessage('Transaction updated successfully');
      setMessageType('success');
    } catch (error) {
      console.error('Error updating transaction:', error);
      setMessage(error.response?.data?.message || 'Failed to update transaction');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTransaction = async (transactionId) => {
    try {
      setLoading(true);
      await transactionApi.deleteTransaction(transactionId);
      const updatedTransactions = transactions.filter(t => t.transaction_id !== transactionId);
      setTransactions(updatedTransactions);
      calculateStats(updatedTransactions);
      setMessage('Transaction deleted successfully');
      setMessageType('success');
    } catch (error) {
      console.error('Error deleting transaction:', error);
      setMessage(error.response?.data?.message || 'Failed to delete transaction');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter(transaction => {
      let match = true;
      if (filters.categoryId && transaction.categoryId !== filters.categoryId) {
        match = false;
      }
      if (filters.transactionType && transaction.transactionType !== filters.transactionType) {
        match = false;
      }
      if (filters.startDate && new Date(transaction.transactionDate) < new Date(filters.startDate)) {
        match = false;
      }
      if (filters.endDate && new Date(transaction.transactionDate) > new Date(filters.endDate)) {
        match = false;
      }
      if (filters.searchQuery && !transaction.description.toLowerCase().includes(filters.searchQuery.toLowerCase())) {
        match = false;
      }
      return match;
    });
  }, [transactions, filters]);

  if (loading) {
    return <div>Loading...</div>;
  }

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
          <p>₹{stats.totalIncome.toFixed(2)}</p>
        </div>
        <div className="summary-card expense">
          <h3>Total Expenses</h3>
          <p>₹{stats.totalExpense.toFixed(2)}</p>
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
                  onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
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
                  onChange={(e) => setNewTransaction({ ...newTransaction, transactionType: e.target.value })}
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
                  onChange={(e) => setNewTransaction({ ...newTransaction, categoryId: e.target.value })}
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
                  onChange={(e) => setNewTransaction({ ...newTransaction, budgetId: e.target.value })}
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
                  onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })}
                  placeholder="Enter description"
                />
              </div>
              <div className="form-group">
                <label>Date</label>
                <input
                  type="date"
                  name="transactionDate"
                  value={newTransaction.transactionDate}
                  onChange={(e) => setNewTransaction({ ...newTransaction, transactionDate: e.target.value })}
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
            <button onClick={() => setFilters({
              categoryId: '',
              transactionType: '',
              startDate: '',
              endDate: '',
              searchQuery: ''
            })} className="btn-sm btn-text">Clear Filters</button>
          </div>
          <div className="filters-grid">
            <div className="form-group">
              <label>Search</label>
              <input
                type="text"
                name="searchQuery"
                value={filters.searchQuery}
                onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
                placeholder="Search descriptions or categories"
              />
            </div>
            <div className="form-group">
              <label>Category</label>
              <select
                name="categoryId"
                value={filters.categoryId}
                onChange={(e) => setFilters({ ...filters, categoryId: e.target.value })}
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
                onChange={(e) => setFilters({ ...filters, transactionType: e.target.value })}
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
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>End Date</label>
              <input
                type="date"
                name="endDate"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
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
                    <button onClick={() => {
                      setEditingTransaction(transaction);
                      setShowEditModal(true);
                    }} className="btn-sm btn-edit">
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
              <button onClick={() => setFilters({
                categoryId: '',
                transactionType: '',
                startDate: '',
                endDate: '',
                searchQuery: ''
              })} className="btn-sm">Clear Filters</button>
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
                    onChange={(e) => setEditingTransaction({ ...editingTransaction, amount: e.target.value })}
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
                    onChange={(e) => setEditingTransaction({ ...editingTransaction, transaction_type: e.target.value })}
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
                    onChange={(e) => setEditingTransaction({ ...editingTransaction, category_id: e.target.value })}
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
                    onChange={(e) => setEditingTransaction({ ...editingTransaction, budget_id: e.target.value })}
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
                    onChange={(e) => setEditingTransaction({ ...editingTransaction, description: e.target.value })}
                    placeholder="Enter description"
                  />
                </div>
                <div className="form-group">
                  <label>Date</label>
                  <input
                    type="date"
                    name="transactionDate"
                    value={editingTransaction.transactionDate}
                    onChange={(e) => setEditingTransaction({ ...editingTransaction, transactionDate: e.target.value })}
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