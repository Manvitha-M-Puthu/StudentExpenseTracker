import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { useAuth } from './context/authContext'; // Correct import
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import Wallet from './pages/Wallet';

const PrivateRoute = ({ children }) => {
    const { currentUser } = useAuth(); // Use `currentUser`, not `user`

    return currentUser ? children : <Navigate to="/login" />;
};

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route
                    path="/"
                    element={
                        <PrivateRoute>
                            <Wallet />
                        </PrivateRoute>
                    }
                />
            </Routes>
        </Router>
    );
}

export default App;