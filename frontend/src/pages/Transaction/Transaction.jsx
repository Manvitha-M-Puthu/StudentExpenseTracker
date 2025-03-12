import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import './transactions.css';

const Transactions = () => {
  const { currentUser } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  
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
    endDate: ''
  });
  
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);


  axios.defaults.baseURL = 'http://localhost:8800';
  axios.defaults.withCredentials = true;

  useEffect(() => {
    if (currentUser && currentUser.user_id) {
      fetchTransactions();
      fetchCategories();
      fetchBudgets();
    }
  }, [currentUser]);

  const fetchTransactions = async () => {
    try {
      const response = await axios.get(`/api/transactions/${currentUser.user_id}`);
      setTransactions(response.data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      showMessage('Failed to fetch transactions', 'error');
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`/api/categories/${currentUser.user_id}`);
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      showMessage('Failed to fetch categories', 'error');
    }
  };

  const fetchBudgets = async () => {
    try {
      const response = await axios.get(`/api/budget-summary/${currentUser.user_id}`);
      setBudgets(response.data);
    } catch (error) {
      console.error('Error fetching budgets:', error);
      showMessage('Failed to fetch budgets', 'error');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTransaction({ ...newTransaction, [name]: value });
  };

  const handleCreateTransaction = async (e) => {
    e.preventDefault();
    try {
      const transactionData = {
        ...newTransaction,
        userId: currentUser.user_id
      };

      await axios.post('/api/transactions', transactionData);
      setNewTransaction({
        amount: '',
        transactionType: 'expense',
        description: '',
        categoryId: '',
        budgetId: '',
        transactionDate: new Date().toISOString().split('T')[0]
      });
      fetchTransactions(); // Refresh transactions list
      showMessage('Transaction created successfully', 'success');
    } catch (error) {
      console.error('Error creating transaction:', error);
      showMessage(error.response?.data?.error || 'Failed to create transaction', 'error');
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
    setEditingTransaction({ ...editingTransaction, [name]: value });
  };

  const handleUpdateTransaction = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `/api/transactions/${currentUser.user_id}/${editingTransaction.transaction_id}`,
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
      fetchTransactions(); // Refresh transactions list
      showMessage('Transaction updated successfully', 'success');
    } catch (error) {
      console.error('Error updating transaction:', error);
      showMessage(error.response?.data?.error || 'Failed to update transaction', 'error');
    }
  };

  const handleDeleteTransaction = async (transactionId) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) {
      return;
    }
    try {
      await axios.delete(`/api/transactions/${currentUser.user_id}/${transactionId}`);
      fetchTransactions(); // Refresh transactions list
      showMessage('Transaction deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting transaction:', error);
      showMessage(error.response?.data?.error || 'Failed to delete transaction', 'error');
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

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

    return match;
  });

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
      <h1>Transactions</h1>
      
      {message && (
        <div className={`alert ${messageType === 'success' ? 'alert-success' : 'alert-error'}`}>
          {message}
        </div>
      )}
      
      {/* Create Transaction Form */}
      <div className="transaction-section">
        <h2>Add New Transaction</h2>
        <form onSubmit={handleCreateTransaction}>
          <div className="form-row">
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
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Category</label>
              <select
                name="categoryId"
                value={newTransaction.categoryId}
                onChange={handleInputChange}
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
              <label>Budget</label>
              <select
                name="budgetId"
                value={newTransaction.budgetId}
                onChange={handleInputChange}
                disabled={newTransaction.transactionType !== 'expense'}
              >
                <option value="">Select a budget</option>
                {budgets.map((budget) => (
                  <option key={budget.budget_id} value={budget.budget_id}>
                    {budget.category_name} - ₹{budget.budget_amount} (₹{budget.remaining_amount} left)
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-row">
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
          <button type="submit" className="btn btn-primary">Add Transaction</button>
        </form>
      </div>
      
      {/* Filters */}
      <div className="transaction-section">
        <h2>Filters</h2>
        <div className="filters-container">
          <div className="form-group">
            <label>Category</label>
            <select
              name="categoryId"
              value={filters.categoryId}
              onChange={handleFilterChange}
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category.category_id} value={category.category_id}>
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
      
      {/* Transaction List */}
      <div className="transaction-section">
        <h2>Transaction History</h2>
        {filteredTransactions.length > 0 ? (
          <table className="transactions-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Category</th>
                <th>Amount</th>
                <th>Type</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((transaction) => (
                <tr key={transaction.transaction_id} className={transaction.transaction_type}>
                  <td>{transaction.formatted_date || new Date(transaction.transaction_date).toLocaleDateString()}</td>
                  <td>{transaction.description || '-'}</td>
                  <td>{transaction.category_name || 'Uncategorized'}</td>
                  <td>₹{transaction.amount}</td>
                  <td>{transaction.transaction_type === 'income' ? 'Income' : 'Expense'}</td>
                  <td>
                    <button onClick={() => handleEditClick(transaction)} className="btn-sm btn-edit">
                      Edit
                    </button>
                    <button onClick={() => handleDeleteTransaction(transaction.transaction_id)} className="btn-sm btn-delete">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="no-data">No transactions found.</p>
        )}
      </div>
      
      {/* Edit Transaction Modal */}
      {showEditModal && editingTransaction && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Edit Transaction</h2>
            <form onSubmit={handleUpdateTransaction}>
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
                <label>Budget</label>
                <select
                  name="budget_id"
                  value={editingTransaction.budget_id || ''}
                  onChange={handleEditInputChange}
                  disabled={editingTransaction.transaction_type !== 'expense'}
                >
                  <option value="">Select a budget</option>
                  {budgets.map((budget) => (
                    <option key={budget.budget_id} value={budget.budget_id}>
                      {budget.category_name} - ₹{budget.budget_amount} (₹{budget.remaining_amount} left)
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
              <div className="modal-buttons">
                <button type="submit" className="btn btn-primary">Update</button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;