// Navbar.jsx
import React, { useContext, useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './navbar.css';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';
import piggyPal from './piggyPal.svg';

const Navbar = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { currentUser, logout } = useContext(AuthContext);
  const [profilePicture, setProfilePicture] = useState(null);

  useEffect(() => {
    const fetchProfilePicture = async () => {
      if (currentUser) {
        try {
          const response = await axios.get(`http://localhost:8800/api/profile/${currentUser.user_id}`, {
            withCredentials: true
          });
          if (response.data && response.data.profile_picture) {
            setProfilePicture(response.data.profile_picture);
          }
        } catch (err) {
          console.error('Error fetching profile picture:', err);
        }
      }
    };

    fetchProfilePicture();
  }, [currentUser]);

  
  const isActive = (path) => {
    if (path === '/transaction' && (location.pathname === '/transaction' || location.pathname === '/daily-spends')) {
      return 'active';
    }
    return location.pathname === path ? 'active' : '';
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const handleLogout = async() => {
    try {
        await logout();
        navigate("/login");
    } catch(err) {
        console.error("Something went wrong", err);
    }
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">
          <Link to="/">
            <div className="logo"><img src={piggyPal} alt="" /></div>
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
        <Link to="/wallet" className={`nav-item ${isActive('/wallet')}`} onClick={closeMobileMenu}>
            Wallet
          </Link>
          <Link to="/transaction" className={`nav-item ${isActive('/transaction')}`} onClick={closeMobileMenu}>
            Transactions
          </Link>
          <Link to="/budget" className={`nav-item ${isActive('/budget')}`} onClick={closeMobileMenu}>
            Budget
          </Link>
         
         
          <Link to="/savings" className={`nav-item ${isActive('/savings')}`} onClick={closeMobileMenu}>
            Savings
          </Link>
          <Link to="/debttrack" className={`nav-item ${isActive('/debttrack')}`} onClick={closeMobileMenu}>
            DebtTrack
          </Link>
          
          {/* Mobile-only logout and profile */}
          <div className="mobile-nav-footer">
            <button className="logout-btn mobile-logout" onClick={() => {
              handleLogout();
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
            {profilePicture ? (
              <img 
                src={`http://localhost:8800/${profilePicture}`} 
                alt="Profile" 
                className="avatar" 
              />
            ) : (
              <div className="avatar"></div>
            )}
          </Link>
        </div>
      </div>
      
      {mobileMenuOpen && <div className="mobile-menu-overlay" onClick={closeMobileMenu}></div>}
    </nav>
  );
};

export default Navbar;