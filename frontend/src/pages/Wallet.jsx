import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Wallet = () => {
    const [wallet, setWallet] = useState(null);

    useEffect(() => {
        const fetchWallet = async () => {
            try {
                const response = await axios.get('/api/wallet/1'); // Replace with dynamic user ID
                setWallet(response.data);
            } catch (error) {
                console.error('Error fetching wallet', error);
            }
        };
        fetchWallet();
    }, []);

    return (
        <div>
            <h1>Wallet</h1>
            {wallet && (
                <div>
                    <p>Balance: {wallet.BALANCE}</p>
                </div>
            )}
        </div>
    );
};

export default Wallet;