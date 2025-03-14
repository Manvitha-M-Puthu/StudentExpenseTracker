import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';
import Confetti from 'react-confetti';
import { motion } from 'framer-motion';
import './SavingGoals.css';

const SavingGoals = () => {
  const { currentUser } = useContext(AuthContext);
  const [goals, setGoals] = useState([]);
  const [completedGoals, setCompletedGoals] = useState([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [formData, setFormData] = useState({
    goal_name: '',
    target_amount: '',
    saved_amount: '',
    monthly_contribution: '', // New field for monthly contribution
    deadline: '',
    priority: 'Medium'
  });
  const [editingGoal, setEditingGoal] = useState(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [walletInfo, setWalletInfo] = useState(null);

  // Fetch all goals and wallet info on component mount
  useEffect(() => {
    if (currentUser && currentUser.user_id) {
      fetchGoals();
      fetchWalletInfo();
    }
  }, [currentUser]);

  const fetchWalletInfo = async () => {
    try {
      const response = await axios.get(`http://localhost:8800/api/wallet/${currentUser.user_id}`);
      setWalletInfo(response.data);
    } catch (error) {
      console.error('Error fetching wallet info:', error);
    }
  };

  const fetchGoals = async () => {
    try {
      // Get goals directly from the API endpoint without authentication middleware
      const response = await axios.get(`http://localhost:8800/api/saving-goals?userId=${currentUser.user_id}`);
      
      // Separate active and completed goals
      const activeGoals = response.data.filter(goal => goal.status !== 'completed');
      const completed = response.data.filter(goal => goal.status === 'completed');
      
      setGoals(activeGoals);
      setCompletedGoals(completed);
    } catch (error) {
      console.error('Error fetching goals:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const dataToSubmit = {
        ...formData,
        user_id: currentUser.user_id // Add user ID manually
      };
      
      if (editingGoal) {
        // Update existing goal
        await axios.put(
          `http://localhost:8800/api/saving-goals/${editingGoal.goal_id}`,
          dataToSubmit
        );
      } else {
        // Create new goal
        await axios.post('http://localhost:8800/api/saving-goals', dataToSubmit);
      }
      
      // Reset form and fetch updated goals
      resetForm();
      fetchGoals();
    } catch (error) {
      console.error('Error saving goal:', error);
    }
  };

  const handleEdit = (goal) => {
    setEditingGoal(goal);
    setFormData({
      goal_name: goal.goal_name,
      target_amount: goal.target_amount,
      saved_amount: goal.saved_amount,
      monthly_contribution: goal.monthly_contribution || '', // Include monthly contribution
      deadline: new Date(goal.deadline).toISOString().split('T')[0],
      priority: goal.priority
    });
    setIsFormVisible(true);
  };

  const handleDelete = async (goalId) => {
    try {
      await axios.delete(`http://localhost:8800/api/saving-goals/${goalId}?userId=${currentUser.user_id}`);
      fetchGoals();
    } catch (error) {
      console.error('Error deleting goal:', error);
    }
  };

  const handleUpdateAmount = async (goal, amountChange) => {
    try {
      const newAmount = parseFloat(goal.saved_amount) + amountChange;
      
      // Update wallet balance
      if (walletInfo) {
        const newWalletBalance = parseFloat(walletInfo.current_balance) - amountChange;
        
        // Prevent negative wallet balance
        if (newWalletBalance < 0 && amountChange > 0) {
          alert("Insufficient wallet balance!");
          return;
        }
        
        // Update wallet
        await axios.put(`http://localhost:8800/api/wallet/${currentUser.user_id}`, {
          current_balance: newWalletBalance
        });
        
        // Refresh wallet info
        fetchWalletInfo();
      }
      
      const updatedGoal = { 
        ...goal, 
        saved_amount: newAmount,
        user_id: currentUser.user_id // Add user ID manually
      };
      
      // Check if goal is now complete
      const isNowComplete = parseFloat(newAmount) >= parseFloat(goal.target_amount);
      if (isNowComplete && goal.status !== 'completed') {
        updatedGoal.status = 'completed';
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 5000);
      }
      
      await axios.put(
        `http://localhost:8800/api/saving-goals/${goal.goal_id}`,
        updatedGoal
      );
      
      fetchGoals();
    } catch (error) {
      console.error('Error updating amount:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      goal_name: '',
      target_amount: '',
      saved_amount: '',
      monthly_contribution: '', // Reset monthly contribution
      deadline: '',
      priority: 'Medium'
    });
    setEditingGoal(null);
    setIsFormVisible(false);
  };

  const calculateProgress = (saved, target) => {
    const progress = (parseFloat(saved) / parseFloat(target)) * 100;
    return Math.min(progress, 100).toFixed(0);
  };

  const renderPriorityBadge = (priority) => {
    let className = 'priority-badge';
    
    switch(priority) {
      case 'High':
        className += ' high';
        break;
      case 'Medium':
        className += ' medium';
        break;
      case 'Low':
        className += ' low';
        break;
      default:
        break;
    }
    
    return <span className={className}>{priority}</span>;
  };

  // Check if user is logged in
  if (!currentUser || !currentUser.user_id) {
    return (
      <div className="saving-goals-container">
        <p className="no-goals-message">Please log in to view and manage your saving goals.</p>
      </div>
    );
  }

  return (
    <div className="saving-goals-container">
      {showConfetti && <Confetti recycle={false} numberOfPieces={500} />}
      
      <div className="saving-goals-header">
        <h1>Savings Goals</h1>
        <button 
          className="add-goal-btn"
          onClick={() => setIsFormVisible(!isFormVisible)}
        >
          {isFormVisible ? 'Cancel' : '+ Add New Goal'}
        </button>
      </div>

      {walletInfo && (
        <div className="wallet-info">
          <p>Current Wallet Balance: ₹{parseFloat(walletInfo.current_balance).toLocaleString()}</p>
        </div>
      )}
      
      <motion.div 
        className={`goal-form-container ${isFormVisible ? 'visible' : ''}`}
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: isFormVisible ? 'auto' : 0, opacity: isFormVisible ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      >
        <form onSubmit={handleSubmit} className="goal-form">
          <h2>{editingGoal ? 'Edit Goal' : 'Add New Goal'}</h2>
          
          <div className="form-group">
            <label htmlFor="goal_name">Goal Name</label>
            <input
              type="text"
              id="goal_name"
              name="goal_name"
              value={formData.goal_name}
              onChange={handleInputChange}
              placeholder="e.g., Buy a Laptop"
              required
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="target_amount">Target Amount (₹)</label>
              <input
                type="number"
                id="target_amount"
                name="target_amount"
                value={formData.target_amount}
                onChange={handleInputChange}
                placeholder="50000"
                min="1"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="saved_amount">Initial Saved Amount (₹)</label>
              <input
                type="number"
                id="saved_amount"
                name="saved_amount"
                value={formData.saved_amount}
                onChange={handleInputChange}
                placeholder="0"
                min="0"
                required
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="monthly_contribution">Monthly Contribution (₹)</label>
              <input
                type="number"
                id="monthly_contribution"
                name="monthly_contribution"
                value={formData.monthly_contribution}
                onChange={handleInputChange}
                placeholder="e.g., 1000"
                min="0"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="deadline">Target Date</label>
              <input
                type="date"
                id="deadline"
                name="deadline"
                value={formData.deadline}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="priority">Priority Level</label>
            <select
              id="priority"
              name="priority"
              value={formData.priority}
              onChange={handleInputChange}
              required
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>
          
          <div className="form-actions">
            <button type="submit" className="submit-btn">
              {editingGoal ? 'Update Goal' : 'Save Goal'}
            </button>
            <button type="button" className="cancel-btn" onClick={resetForm}>
              Cancel
            </button>
          </div>
        </form>
      </motion.div>
      
      <div className="goals-section">
        <h2>Active Goals</h2>
        {goals.length === 0 ? (
          <p className="no-goals-message">No active goals. Create one to get started!</p>
        ) : (
          <div className="goals-grid">
            {goals.map(goal => (
              <motion.div 
                key={goal.goal_id} 
                className="goal-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="goal-header">
                  <h3>{goal.goal_name}</h3>
                  {renderPriorityBadge(goal.priority)}
                </div>
                
                <div className="goal-amounts">
                  <p className="saved-amount">
                    ₹{parseFloat(goal.saved_amount).toLocaleString()}
                    <span className="amount-label">saved</span>
                  </p>
                  <p className="target-amount">
                    of ₹{parseFloat(goal.target_amount).toLocaleString()}
                    <span className="amount-label">target</span>
                  </p>
                </div>
                
                <div className="progress-container">
                  <div 
                    className="progress-bar" 
                    style={{ width: `${calculateProgress(goal.saved_amount, goal.target_amount)}%` }}
                  ></div>
                  <span className="progress-text">
                    {calculateProgress(goal.saved_amount, goal.target_amount)}%
                  </span>
                </div>
                
                <p className="deadline">
                  Target date: {new Date(goal.deadline).toLocaleDateString()}
                </p>
                
                {goal.monthly_contribution > 0 && (
                  <p className="monthly-contribution">
                    Monthly contribution: ₹{parseFloat(goal.monthly_contribution).toLocaleString()}
                  </p>
                )}
                
                <div className="quick-update">
                  {goal.monthly_contribution > 0 ? (
                    <>
                      <button 
                        onClick={() => handleUpdateAmount(goal, parseFloat(goal.monthly_contribution))}
                        className="quick-add-btn"
                      >
                        +₹{parseFloat(goal.monthly_contribution).toLocaleString()}
                      </button>
                      <button 
                        onClick={() => handleUpdateAmount(goal, -parseFloat(goal.monthly_contribution))}
                        className="quick-subtract-btn"
                      >
                        -₹{parseFloat(goal.monthly_contribution).toLocaleString()}
                      </button>
                    </>
                  ) : (
                    <>
                      <button 
                        onClick={() => handleUpdateAmount(goal, 1000)}
                        className="quick-add-btn"
                      >
                        +₹1000
                      </button>
                      <button 
                        onClick={() => handleUpdateAmount(goal, -1000)}
                        className="quick-subtract-btn"
                      >
                        -₹1000
                      </button>
                    </>
                  )}
                </div>
                
                <div className="goal-actions">
                  <button 
                    className="edit-btn" 
                    onClick={() => handleEdit(goal)}
                  >
                    <i className="fas fa-edit"></i> Edit
                  </button>
                  <button 
                    className="delete-btn" 
                    onClick={() => handleDelete(goal.goal_id)}
                  >
                    <i className="fas fa-trash"></i> Delete
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
      
      {completedGoals.length > 0 && (
        <div className="completed-goals-section">
          <h2>Completed Goals</h2>
          <div className="goals-grid">
            {completedGoals.map(goal => (
              <motion.div 
                key={goal.goal_id} 
                className="goal-card completed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="goal-header">
                  <h3>{goal.goal_name}</h3>
                  <span className="completion-badge">
                    <i className="fas fa-check-circle"></i> Completed
                  </span>
                </div>
                
                <div className="goal-amounts">
                  <p className="saved-amount">
                    ₹{parseFloat(goal.saved_amount).toLocaleString()}
                    <span className="amount-label">saved</span>
                  </p>
                  <p className="target-amount">
                    of ₹{parseFloat(goal.target_amount).toLocaleString()}
                    <span className="amount-label">target</span>
                  </p>
                </div>
                
                <div className="progress-container">
                  <div 
                    className="progress-bar" 
                    style={{ width: '100%' }}
                  ></div>
                  <span className="progress-text">100%</span>
                </div>
                
                <p className="deadline">
                  Completed on: {new Date(goal.updated_at).toLocaleDateString()}
                </p>
                
                <div className="goal-actions">
                  <button 
                    className="delete-btn" 
                    onClick={() => handleDelete(goal.goal_id)}
                  >
                    <i className="fas fa-trash"></i> Remove
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SavingGoals;