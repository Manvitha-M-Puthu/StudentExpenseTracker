import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, createBrowserRouter,RouterProvider,Outlet } from 'react-router-dom';
import { useAuth } from './context/authContext'; // Correct import
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import Wallet from './pages/Wallet/Wallet';
import Transaction from './pages/Transaction/Transaction';
import Savings from './pages/Savings/Savings';
import Budget from './pages/Budget/Budget';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import Profile from './pages/Profile/Profile';

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
        {path:"/budget",element:<Budget />},
        {path:"/transaction",element:<Transaction />},
        {path:"/savings",element:<Savings />},
        {path:"/profile",element:<Profile />},
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