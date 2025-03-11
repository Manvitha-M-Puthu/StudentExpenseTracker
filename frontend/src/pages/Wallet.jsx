import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { AuthContext, useAuth } from '../context/authContext';
import { useNavigate } from 'react-router-dom';

const Wallet = () => {
    const [wallet, setWallet] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
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
                console.log("Fetching wallet for user:", currentUser.user_id);
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

    const handleCreateWallet = async () => {
        try {
            setLoading(true);
            const response = await axios.post(
                'http://localhost:8800/api/wallet',
                { userId: currentUser.user_id, initial_balance: 0 },
                { withCredentials: true }
            );
            setWallet(response.data);
        } catch (error) {
            console.error('Error creating wallet:', error);
            setError('Failed to create wallet');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    if (!currentUser) {
        return (
            <div>
                <p>You need an account to use the wallet.</p>
                <button onClick={() => navigate('/login')}>Create an Account or Login</button>
            </div>
        );
    }

    if (loading) {
        return <p>Loading wallet data...</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }

    return (
        <div>
            <h1>Wallet</h1>
            {wallet ? (
                <>
                    <p>Initial Balance: {wallet.initial_balance}</p>
                    <p>Current Balance: {wallet.current_balance}</p>
                </>
            ) : (
                <>
                    <p>No wallet found. Please create a wallet to start using the application.</p>
                    <button onClick={handleCreateWallet}>Create Wallet</button>
                </>
            )}
            <button onClick={handleLogout}>Logout</button>
        </div>
    );
};

export default Wallet;
