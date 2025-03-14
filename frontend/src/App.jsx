import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, createBrowserRouter,RouterProvider,Outlet } from 'react-router-dom';
import { useAuth } from './context/authContext'; // Correct import
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
import './app.css';
const PrivateRoute = ({ children }) => {
    const { currentUser } = useAuth();

    return currentUser ? children : <Navigate to="/login" />;
};

const Layout = () =>{
    return(
        <>
            <Navbar />
            <Outlet />
            <Footer />
        </>
    )
}

const router = createBrowserRouter([
    {path:"/login",element:<Login />},
    {path:"/register",element:<Register />},
    {path:"/",element:<Layout />,children:[
        {path:"/",element:<PrivateRoute><Wallet /></PrivateRoute>},
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