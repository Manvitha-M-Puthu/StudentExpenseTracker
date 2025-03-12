import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { AuthContext, useAuth } from "../../context/authContext";
import { useNavigate } from 'react-router-dom';
import './wallet.css';

const Wallet = () => {
    const [wallet, setWallet] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [initialBalance, setInitialBalance] = useState(0);
    
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const { logout } = useContext(AuthContext);

    useEffect(() => {
        if (!currentUser) {
            setLoading(false);
            return;
        }

        const fetchWallet = async () => {
            try {
                const response = await axios.get(
                    `http://localhost:8800/api/wallet/${currentUser.user_id}`,
                    { withCredentials: true }
                );
                console.log("Wallet response received:", response.data);
                setWallet(response.data);
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
            const response = await axios.post(
                'http://localhost:8800/api/wallet',
                {
                    userId: currentUser.user_id,
                    initial_balance: parseFloat(initialBalance) || 0
                },
                { withCredentials: true }
            );
            setWallet(response.data);
            setError(null);
        } catch (error) {
            console.error("Error creating wallet:", error);
            setError("Failed to create wallet");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="loading">Loading wallet data...</div>;
    }

    if (error) {
        return <div className="error">{error}</div>;
    }

    return (
        <div className="wallet-container">
            <h1>My Wallet</h1>
            
            {wallet ? (
                <div className="wallet-details">
                    <div className="balance-card">
                        <h2>Current Balance</h2>
                        <h3 className="balance">₹{wallet.current_balance}</h3>
                        <p>Initial Balance: ₹{wallet.initial_balance}</p>
                    </div>
                </div>
            ) : (
                <div className="create-wallet">
                    <h2>You don't have a wallet yet</h2>
                    <p>Create one to start tracking your expenses and income</p>
                    
                    <form onSubmit={handleCreateWallet}>
                        <div className="form-group">
                            <label htmlFor="initialBalance">Initial Balance</label>
                            <input 
                                type="number" 
                                id="initialBalance" 
                                value={initialBalance} 
                                onChange={(e) => setInitialBalance(e.target.value)}
                                min="0"
                                step="0.01"
                                placeholder="0.00"
                            />
                        </div>
                        <button type="submit" className="btn btn-create">
                            Create Wallet
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default Wallet;