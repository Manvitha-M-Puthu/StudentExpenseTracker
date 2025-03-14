import React, { useEffect, useState } from 'react';
import { useAuth } from "../../context/AuthContext";
import * as walletApi from '../../services/walletApi';
import './wallet.css';

const Wallet = () => {
    const [wallet, setWallet] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [initialBalance, setInitialBalance] = useState(0);
    
    const { currentUser } = useAuth();

    useEffect(() => {
        if (!currentUser) {
            setLoading(false);
            return;
        }

        const fetchWallet = async () => {
            try {
                const data = await walletApi.getUserWallet(currentUser.user_id);
                console.log("Wallet response received:", data);
                setWallet(data);
            } catch (error) {
                if (error.response && error.response.status === 404) {
                    setWallet(null); // No wallet found
                } else {
                    console.error("Error fetching wallet:", error);
                    setError("Failed to load wallet data");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchWallet();
    }, [currentUser]);

    const handleCreateWallet = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const data = await walletApi.createWallet(
                currentUser.user_id, 
                parseFloat(initialBalance) || 0
            );
            setWallet(data);
            setError(null);
        } catch (error) {
            console.error("Error creating wallet:", error);
            setError("Failed to create wallet");
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
        console.log(`Wallet balance: ${balance}/${initialBalance} = ${percentRemaining}% remaining`);
        
        // Determine color based on percentage remaining (smooth gradient from green to red)
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
        console.log(`Color for ${percentRemaining}% balance: ${color}`);
        
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

    if (loading) {
        return <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading wallet data...</p>
        </div>;
    }

    if (error) {
        return <div className="error-container">
            <div className="error-icon">⚠️</div>
            <h2>Something went wrong</h2>
            <p>{error}</p>
        </div>;
    }

    return (
        <div className="wallet-container">
            <div className="wallet-header">
                <h1><span className="wallet-icon">💼</span> My Wallet</h1>
            </div>
            
            {wallet ? (
                <div className="wallet-content">
                    <div className="wallet-details-card">
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
                    
                    <div className="wallet-tips">
                        <h3><span className="tips-icon">💡</span> Wallet Tips</h3>
                        <ul>
                            <li>Track your expenses carefully to maintain a healthy balance</li>
                            <li>Set budget goals to help manage your spending</li>
                            <li>Review your transaction history regularly</li>
                        </ul>
                    </div>
                </div>
            ) : (
                <div className="wallet-setup-card">
                    <div className="wallet-welcome">
                        <div className="wallet-setup-icon">💰</div>
                        <h2>Welcome to Your Wallet</h2>
                        <p>Create your wallet to start tracking your finances and manage your budget effectively.</p>
                    </div>
                    
                    <form onSubmit={handleCreateWallet} className="wallet-form">
                        <div className="form-group">
                            <label htmlFor="initialBalance">
                                <span className="form-icon">💵</span> Initial Balance
                            </label>
                            <div className="amount-input-container">
                                <span className="currency-symbol">₹</span>
                                <input 
                                    type="number" 
                                    id="initialBalance" 
                                    value={initialBalance} 
                                    onChange={(e) => setInitialBalance(e.target.value)}
                                    min="0"
                                    step="0.01"
                                    placeholder="0.00"
                                    className="form-control amount-input"
                                />
                            </div>
                        </div>
                        <button type="submit" className="create-wallet-btn">
                            <span className="btn-icon">✓</span> Create Wallet
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default Wallet;