import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import * as walletApi from '../../services/walletApi';
import './wallet.css';
import pigSave from '../../components/Navbar/piggyPal.svg';

const Wallet = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [wallet, setWallet] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');

    useEffect(() => {
        if (currentUser) {
            fetchWallet();
        }
    }, [currentUser]);

    const fetchWallet = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await walletApi.getUserWallet();
            
            // Check if wallet exists and has any balance
            if (!response.data || 
                (response.data.current_balance === 0 && response.data.initial_balance === 0)) {
                setWallet(null);
            } else {
                setWallet({
                    current_balance: response.data.current_balance,
                    initial_balance: response.data.initial_balance
                });
            }
        } catch (error) {
            console.error('Error fetching wallet:', error);
            setError('Failed to fetch wallet information. Please try again.');
            setWallet(null);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateWallet = async (initialBalance) => {
        try {
            setLoading(true);
            setError(null);
            const response = await walletApi.createWallet(initialBalance);
            
            if (response.data) {
                setWallet({
                    current_balance: response.data.current_balance,
                    initial_balance: response.data.initial_balance
                });
                setMessage('Wallet created successfully! You can now start tracking your expenses.');
                setMessageType('success');
                
                // Wait a brief moment to show the success message
                setTimeout(() => {
                    // Navigate to dashboard after successful wallet creation
                    navigate('/dash');
                }, 1500);
            } else {
                throw new Error('Failed to create wallet');
            }
        } catch (error) {
            console.error('Error creating wallet:', error);
            setError(error.response?.data?.message || 'Failed to create wallet. Please try again.');
            setMessageType('error');
            setWallet(null); // Ensure wallet is null so the create form stays visible
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateBalance = async (newBalance) => {
        try {
            setLoading(true);
            setError(null);
            const response = await walletApi.updateWalletBalance(newBalance);
            setWallet({
                current_balance: response.data.current_balance,
                initial_balance: response.data.initial_balance
            });
            setMessage('Wallet balance updated successfully');
            setMessageType('success');
        } catch (error) {
            console.error('Error updating wallet balance:', error);
            setError(error.response?.data?.message || 'Failed to update wallet balance');
            setMessageType('error');
        } finally {
            setLoading(false);
        }
    };

    // Function to render a circle indicator of wallet balance
    const renderWalletCircle = () => {
        const balance = parseFloat(wallet.current_balance);
        const initialBalance = parseFloat(wallet.initial_balance);
        
        // Calculate percentage of balance remaining
        const percentRemaining = initialBalance > 0 ? (balance / initialBalance) * 100 : 100;
        
        // Determine color based on percentage remaining
        const getColor = (percent) => {
            // Ensure percentage is within bounds
            const boundedPercent = Math.max(0, Math.min(100, percent));
            
            if (boundedPercent >= 100) return '#4CAF50'; // Full green for 100% or more
            if (boundedPercent <= 0) return '#F44336';   // Full red for 0% or less
            
            // For values in between, create a gradient
            if (boundedPercent >= 66) {
                // Between 66% and 100%: Green to Yellow-Green
                const factor = (boundedPercent - 66) / 34;
                return `rgb(${76 + (189 - 76) * (1 - factor)}, ${175}, ${80 * factor})`;
            } else if (boundedPercent >= 33) {
                // Between 33% and 66%: Yellow-Green to Yellow
                const factor = (boundedPercent - 33) / 33;
                return `rgb(${189 + (255 - 189) * (1 - factor)}, ${175 - (175 - 193) * (1 - factor)}, ${0})`;
            } else {
                // Between 0% and 33%: Yellow to Red
                const factor = boundedPercent / 33;
                return `rgb(${255}, ${193 * factor}, ${0})`;
            }
        };
        
        const color = getColor(percentRemaining);
        
        // Calculate the stroke-dasharray and stroke-dashoffset for circular progress
        const radius = 70;
        const circumference = 2 * Math.PI * radius;
        // Calculate dashOffset based on remaining balance
        const dashOffset = circumference - (percentRemaining / 100) * circumference;
        
        return (
            <div className="wallet-circle-wrapper">
                <svg className="wallet-circle" width="160" height="160" viewBox="0 0 160 160">
                    {/* Background circle */}
                    <circle 
                        className="wallet-circle-bg"
                        cx="80" 
                        cy="80" 
                        r={radius} 
                        strokeWidth="10"
                    />
                    {/* Progress circle with decreasing arc */}
                    <circle 
                        className="wallet-circle-indicator"
                        cx="80" 
                        cy="80" 
                        r={radius} 
                        strokeWidth="10"
                        style={{ 
                            stroke: color,
                            strokeDasharray: circumference,
                            strokeDashoffset: dashOffset
                        }}
                    />
                </svg>
                <div className="wallet-amount-display">
                    <div className="balance-value-wrapper">
                       
                        <span className="amount-value">{wallet.current_balance}</span>
                    </div>
                    <div className="wallet-label">Current Balance</div>
                </div>
            </div>
        );
    };

    // Money saving tips data
    const savingTips = [
        {
            title: "50/30/20 Rule",
            description: "Allocate 50% of income to needs, 30% to wants, and 20% to savings & debt repayment.",
            icon: "📊"
        },
        {
            title: "Automate Savings",
            description: "Set up automatic transfers to your savings account on payday.",
            icon: "🤖"
        },
        {
            title: "Track Your Expenses",
            description: "Use this app to categorize and monitor where your money goes.",
            icon: "📱"
        },
        {
            title: "Cook at Home",
            description: "Prepare meals at home to save on food expenses.",
            icon: "🍳"
        },
        {
            title: "24-Hour Rule",
            description: "Wait 24 hours before making non-essential purchases over ₹2,000.",
            icon: "⏰"
        },
        {
            title: "Use Cash Envelopes",
            description: "Allocate cash for different spending categories to avoid overspending.",
            icon: "💰"
        }
    ];

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading wallet data...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-container">
                <div className="error-icon">⚠️</div>
                <h2>Something went wrong</h2>
                <p>{error}</p>
            </div>
        );
    }

    return (
        <div className="wallet-container">
            <header className="wallet-header">
                <div className="header-content">
                    <img src={pigSave} alt="Piggy Bank" className="wallet-logo" />
                    <h1>My Wallet</h1>
                </div>
            </header>
            
            {message && (
                <div className={`message ${messageType}`}>
                    {message}
                </div>
            )}
            
            {!wallet ? (
                <div className="wallet-setup-card">
                    <div className="wallet-welcome">
                        <img src={pigSave} alt="Piggy Bank" className="setup-pig-icon" />
                        <h2>Welcome! Let's Set Up Your Wallet</h2>
                        <p>To get started with expense tracking and savings goals, please create your wallet by entering your initial balance.</p>
                    </div>
                    
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        const initialBalance = e.target.initialBalance.value;
                        handleCreateWallet(initialBalance);
                    }} className="wallet-form">
                        <div className="form-group">
                            <label htmlFor="initialBalance">
                                <span className="form-icon">💵</span> Initial Balance
                            </label>
                            <div className="amount-input-container">
                                <span className="currency-symbol">₹</span>
                                <input 
                                    type="number" 
                                    id="initialBalance" 
                                    name="initialBalance"
                                    min="0"
                                    step="0.01"
                                    placeholder="0.00"
                                    className="form-control amount-input"
                                    required
                                />
                            </div>
                        </div>
                        <button type="submit" className="create-wallet-btn">
                            Create My Wallet
                        </button>
                    </form>
                </div>
            ) : (
                <main className="wallet-content">
                    <section className="wallet-details-card">
                        <div className="wallet-balance-section">
                            <div className="wallet-circle-container">
                                {renderWalletCircle()}
                            </div>
                            
                            <div className="wallet-info">
                                <div className="info-item">
                                    <span className="info-label">Initial Balance:</span>
                                    <span className="info-value">₹{wallet.initial_balance}</span>
                                </div>
                                
                                <div className="info-item">
                                    <span className="info-label">Current Balance:</span>
                                    <span className="info-value balance-highlight">₹{wallet.current_balance}</span>
                                </div>
                                
                                {wallet.initial_balance !== wallet.current_balance && (
                                    <div className="info-item">
                                        <span className="info-label">Difference:</span>
                                        <span className={`info-value ${parseFloat(wallet.current_balance) >= parseFloat(wallet.initial_balance) ? 'positive' : 'negative'}`}>
                                            {parseFloat(wallet.current_balance) >= parseFloat(wallet.initial_balance) ? '+' : ''}
                                            ₹{(parseFloat(wallet.current_balance) - parseFloat(wallet.initial_balance)).toFixed(2)}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>
                    
                    <section className="wallet-tips-section">
                        <div className="tips-header">
                            <img src={pigSave} alt="Savings Pig" className="tips-pig-icon" />
                            <h2>Money Saving Tips</h2>
                        </div>
                        <div className="tips-grid">
                            {savingTips.map((tip, index) => (
                                <div className="tip-card" key={index}>
                                    <div className="tip-icon">{tip.icon}</div>
                                    <h3>{tip.title}</h3>
                                    <p>{tip.description}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                </main>
            )}
        </div>
    );
};

export default Wallet;