import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import API from '../../services/axiosInstance';
import { motion } from 'framer-motion';
import './DebtTracker.css';

const DebtTracker = () => {
  const { currentUser } = useAuth();
  const [debts, setDebts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    amount: '',
    debtor_name: '',
    debt_type: 'incoming',
    status: 'pending',
    due_date: '',
    description: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchDebts();
  }, [currentUser]);

  const fetchDebts = async () => {
    try {
      setLoading(true);
      const response = await API.get(`api/debts/${currentUser.user_id}`);
      setDebts(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching debts:', err);
      setError('Failed to load debts. Please try again.');
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    try {
      const payload = {
        ...formData,
        user_id: currentUser.user_id,
      };
      
      await API.post('api/debts', payload);
      setSuccess('Debt/loan recorded successfully!');
      setFormData({
        amount: '',
        debtor_name: '',
        debt_type: 'incoming',
        status: 'pending',
        due_date: '',
        description: ''
      });
      fetchDebts();
    } catch (err) {
      console.error('Error creating debt record:', err);
      setError('Failed to record debt/loan. Please try again.');
    }
  };

  const handleStatusUpdate = async (debtId, newStatus, debt_type, amount) => {
    try {
      await API.put(`api/debts/${debtId}`, { 
        status: newStatus,
        user_id: currentUser.user_id,
        debt_type,
        amount
      });
      setSuccess('Status updated successfully!');
      fetchDebts();
    } catch (err) {
      console.error('Error updating status:', err);
      setError('Failed to update status. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div className="debt-loans-container">
      <motion.div 
        className="debt-form-container"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2>Record New Debt/Loan</h2>
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="debtor_name">Name</label>
            <input
              type="text"
              id="debtor_name"
              name="debtor_name"
              value={formData.debtor_name}
              onChange={handleChange}
              placeholder="Person name"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="amount">Amount</label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              placeholder="Amount"
              step="0.01"
              min="0"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="debt_type">Type</label>
            <select
              id="debt_type"
              name="debt_type"
              value={formData.debt_type}
              onChange={handleChange}
              required
            >
              <option value="incoming">Money Coming In (Loan Given)</option>
              <option value="outgoing">Money Going Out (Loan Taken)</option>
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="due_date">Due Date</label>
            <input
              type="date"
              id="due_date"
              name="due_date"
              value={formData.due_date}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Add details about this debt/loan"
              rows="3"
            />
          </div>
          
          <motion.button 
            type="submit"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="submit-button"
          >
            Record
          </motion.button>
        </form>
      </motion.div>

      <motion.div 
        className="debt-list-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <h2>Your Debt/Loan Records</h2>
        {loading ? (
          <div className="loading-spinner">Loading...</div>
        ) : debts.length === 0 ? (
          <p className="no-records">No debt/loan records found.</p>
        ) : (
          <div className="debt-records">
            <div className="debt-records-header">
              <h3>Incoming (Money you'll receive)</h3>
              <div className="records-container">
                {debts
                  .filter(debt => debt.debt_type === 'incoming')
                  .map((debt) => (
                    <motion.div 
                      key={debt.debt_id} 
                      className={`debt-card ${debt.status}`}
                      whileHover={{ scale: 1.02 }}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="debt-header">
                        <h4>{debt.debtor_name}</h4>
                        <span className={`status-badge ${debt.status}`}>
                          {debt.status.charAt(0).toUpperCase() + debt.status.slice(1)}
                        </span>
                      </div>
                      <div className="debt-amount">₹{parseFloat(debt.amount).toFixed(2)}</div>
                      <div className="debt-details">
                        <p><strong>Due:</strong> {formatDate(debt.due_date)}</p>
                        {debt.description && <p><strong>Note:</strong> {debt.description}</p>}
                      </div>
                      {debt.status === 'pending' && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="mark-paid-button"
                          onClick={() => handleStatusUpdate(debt.debt_id, 'paid', debt.debt_type, debt.amount)}
                        >
                          Mark as Paid
                        </motion.button>
                      )}
                    </motion.div>
                  ))}
              </div>
            </div>
            
            <div className="debt-records-header">
              <h3>Outgoing (Money you'll pay)</h3>
              <div className="records-container">
                {debts
                  .filter(debt => debt.debt_type === 'outgoing')
                  .map((debt) => (
                    <motion.div 
                      key={debt.debt_id} 
                      className={`debt-card ${debt.status} outgoing`}
                      whileHover={{ scale: 1.02 }}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="debt-header">
                        <h4>{debt.debtor_name}</h4>
                        <span className={`status-badge ${debt.status}`}>
                          {debt.status.charAt(0).toUpperCase() + debt.status.slice(1)}
                        </span>
                      </div>
                      <div className="debt-amount">₹{parseFloat(debt.amount).toFixed(2)}</div>
                      <div className="debt-details">
                        <p><strong>Due:</strong> {formatDate(debt.due_date)}</p>
                        {debt.description && <p><strong>Note:</strong> {debt.description}</p>}
                      </div>
                      {debt.status === 'pending' && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="mark-paid-button"
                          onClick={() => handleStatusUpdate(debt.debt_id, 'paid', debt.debt_type, debt.amount)}
                        >
                          Mark as Paid
                        </motion.button>
                      )}
                    </motion.div>
                  ))}
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default DebtTracker;