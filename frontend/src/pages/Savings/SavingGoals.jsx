import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import axiosInstance from '../../services/axiosInstance';
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
    monthly_contribution: '',
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
      const response = await axiosInstance.get('/api/wallet/balance');
      if (response.data?.success && response.data?.data) {
        const currentBalance = parseFloat(response.data.data.current_balance);
        setWalletInfo({
          balance: isNaN(currentBalance) ? 0 : currentBalance
        });
      } else {
        setWalletInfo({ balance: 0 });
      }
    } catch (error) {
      console.error('Error fetching wallet info:', error);
      setWalletInfo({ balance: 0 });
    }
  };

  const fetchGoals = async () => {
    try {
      const response = await axiosInstance.get('/api/savings');
      
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
      // First check if wallet exists and has sufficient balance
      const walletResponse = await axiosInstance.get('/api/wallet/balance');
      const currentBalance = walletResponse.data.data?.current_balance || 0;
      const initialSavedAmount = parseFloat(formData.saved_amount) || 0;

      if (initialSavedAmount > currentBalance) {
        alert("Your wallet balance is insufficient for the initial saved amount. Please add funds to your wallet first.");
        return;
      }

      const dataToSubmit = {
        ...formData,
        user_id: currentUser.user_id
      };
      
      if (editingGoal) {
        await axiosInstance.put(
          `/api/savings/${editingGoal.goal_id}`,
          dataToSubmit
        );
      } else {
        await axiosInstance.post('/api/savings', dataToSubmit);
        
        // If goal creation is successful, update wallet balance
        if (initialSavedAmount > 0) {
          const newWalletBalance = currentBalance - initialSavedAmount;
          await axiosInstance.put('/api/wallet', {
            current_balance: newWalletBalance
          });
          fetchWalletInfo(); // Refresh wallet info
        }
      }
      
      resetForm();
      fetchGoals();
    } catch (error) {
      console.error('Error saving goal:', error);
      alert('Error saving goal. Please make sure you have sufficient wallet balance.');
    }
  };

  const handleEdit = (goal) => {
    setEditingGoal(goal);
    setFormData({
      goal_name: goal.goal_name,
      target_amount: goal.target_amount,
      saved_amount: goal.saved_amount,
      monthly_contribution: goal.monthly_contribution || '',
      deadline: new Date(goal.deadline).toISOString().split('T')[0],
      priority: goal.priority
    });
    setIsFormVisible(true);
  };

  const handleDelete = async (goalId) => {
    try {
      await axiosInstance.delete(`/api/savings/${goalId}`);
      fetchGoals();
    } catch (error) {
      console.error('Error deleting goal:', error);
    }
  };

  const handleUpdateAmount = async (goal, amountChange) => {
    try {
      const newAmount = parseFloat(goal.saved_amount) + amountChange;
      
      // Prevent negative saved amounts
      if (newAmount < 0) {
        alert("Saved amount cannot be negative!");
        return;
      }
      
      // Fetch latest wallet balance
      const walletResponse = await axiosInstance.get('/api/wallet/balance');
      if (!walletResponse.data?.success || !walletResponse.data?.data) {
        alert("Error fetching wallet balance. Please try again.");
        return;
      }

      const currentBalance = parseFloat(walletResponse.data.data.current_balance);
      if (isNaN(currentBalance)) {
        alert("Invalid wallet balance. Please try again.");
        return;
      }
      
      // For adding money to savings
      if (amountChange > 0 && currentBalance < amountChange) {
        alert(`Insufficient wallet balance! Current balance: ${formatCurrency(currentBalance)}`);
        return;
      }
      
      // Calculate new wallet balance
      const newWalletBalance = currentBalance - amountChange;
      
      // Update the wallet balance
      const updateResponse = await axiosInstance.put('/api/wallet', {
        current_balance: newWalletBalance
      });

      if (!updateResponse.data?.success) {
        throw new Error("Failed to update wallet balance");
      }
      
      // Update the savings goal
      const updateData = {
        saved_amount: newAmount
      };
      
      const isNowComplete = newAmount >= parseFloat(goal.target_amount);
      if (isNowComplete && goal.status !== 'completed') {
        updateData.status = 'completed';
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 5000);
      }
      
      const goalUpdateResponse = await axiosInstance.put(
        `/api/savings/${goal.goal_id}`,
        updateData
      );

      if (!goalUpdateResponse.data?.success) {
        throw new Error("Failed to update savings goal");
      }
      
      // Refresh both wallet and goals data
      await Promise.all([
        fetchWalletInfo(),
        fetchGoals()
      ]);
    } catch (error) {
      console.error('Error updating amount:', error);
      alert('Error updating amount. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({
      goal_name: '',
      target_amount: '',
      saved_amount: '',
      monthly_contribution: '',
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
          <p>Current Wallet Balance: ${parseFloat(walletInfo.balance || 0).toFixed(2)}</p>
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