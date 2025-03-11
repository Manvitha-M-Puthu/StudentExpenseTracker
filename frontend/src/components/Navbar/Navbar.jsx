// Navbar.jsx
import React, { useContext, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './navbar-css.css';
import { AuthContext } from '../../context/authContext';

const Navbar = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Function to check if a nav item is active
  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const {logout} = useContext(AuthContext);
  const handleLogout = async() =>{
    try{
        await logout();
        res.status(200).json("user successfully Logged out");
    }catch(err){
        res.status(500).json("Something went wrong",err);
    }
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">
          <Link to="/">
            <div className="logo">Logo</div>
          </Link>
        </div>
        
        {/* Mobile menu toggle */}
        <div className="mobile-menu-toggle" onClick={toggleMobileMenu}>
          <div className={`menu-icon ${mobileMenuOpen ? 'open' : ''}`}>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
        
        {/* Desktop and mobile navigation */}
        <div className={`navbar-links ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          <Link to="/budget" className={`nav-item ${isActive('/budget')}`} onClick={closeMobileMenu}>
            Budget
          </Link>
          <Link to="/savings" className={`nav-item ${isActive('/savings')}`} onClick={closeMobileMenu}>
            Savings
          </Link>
          <Link to="/transactions" className={`nav-item ${isActive('/daily-spends')}`} onClick={closeMobileMenu}>
            Daily Spends
          </Link>
          
          {/* Mobile-only logout and profile */}
          <div className="mobile-nav-footer">
            <button className="logout-btn mobile-logout" onClick={() => {
              handleLogout;
              closeMobileMenu();
            }}>
              Logout
            </button>
            <Link to="/profile" className="mobile-profile" onClick={closeMobileMenu}>
              Profile
            </Link>
          </div>
        </div>
        
        <div className="navbar-right">
          <button className="logout-btn desktop-logout" onClick={handleLogout}>
            Logout
          </button>
          
          <Link to="/profile" className="profile-icon">
            <div className="avatar"></div>
          </Link>
        </div>
      </div>
      
      {/* Overlay for mobile menu */}
      {mobileMenuOpen && <div className="mobile-menu-overlay" onClick={closeMobileMenu}></div>}
    </nav>
  );
};

export default Navbar;