import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
import { useAuth } from './context/AuthContext'; // Correct import
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import Wallet from './pages/Wallet/Wallet';
import Transaction from './pages/Transaction/Transaction';
import SavingGoals from './pages/Savings/SavingGoals';
import Budget from './pages/Budget/Budget';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import Profile from './pages/Profile/Profile';
import DebtTracker from './pages/DebtTracker/DebtTracker';
import Dashboard from './components/Dashboard/Dashboard';
import Landing from './pages/Landing/Landing';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';
import './app.css';

const PrivateRoute = ({ children }) => {
    const { currentUser } = useAuth();

    return currentUser ? children : <Navigate to="/login" />;
};

const Layout = () =>{
    console.log("Layout component rendered");
    return(
        
        <>
            <Navbar />
            <ErrorBoundary>
                <Outlet />
            </ErrorBoundary>
            <Footer />
        </>
    )
}

const router = createBrowserRouter([
    {path:"/",element:<Landing />},
    {path:"/login",element:<Login />},
    {path:"/register",element:<Register />},
    {path:"/",element:<Layout />,children:[
        {path:"/dash",element:<PrivateRoute><Dashboard /></PrivateRoute>},
        {path:"/wallet",element:<PrivateRoute><Wallet /></PrivateRoute>},
        {path:"/budget",element:<PrivateRoute><Budget /></PrivateRoute>},
        {path:"/transaction",element:<PrivateRoute><Transaction /></PrivateRoute>},
        {path:"/savings",element:<PrivateRoute><SavingGoals /></PrivateRoute>},
        {path:"/profile",element:<PrivateRoute><Profile /></PrivateRoute>},
        {path:"/debttrack",element:<PrivateRoute><DebtTracker /></PrivateRoute>},
    ]},
]);

function App() {
    return (
        <>
        <RouterProvider router = {router}/>
        </>
    );
}

export default App;