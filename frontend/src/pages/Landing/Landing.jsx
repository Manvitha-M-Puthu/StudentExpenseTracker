import React from 'react';
import { useNavigate } from 'react-router-dom';
import './landing.css'; 
import piggyPal from './piggyPal.svg';
import cash from './cashmoney.svg';

console.log("Landing component rendered");


const Landing = () => {
    const navigate = useNavigate();
    
    
    return (
        
        <div className="landing-container">
            <div className="hero-section">
                <div className="logo-container">
                    <div className="piggy-icon bounce logo"><img src={piggyPal} alt="" /></div>
                </div>
                
                <div className="hero-content">
                    <div className="piggy-animation">
                    <div className="coin coin-2">
                    💸
</div>

                        <div className="coin coin-1">💸</div>
                        <div className="coin coin-3">💸</div>
                     
                    </div>
                    
                    <h1 className="app-title">Welcome to <span className="highlight">PiggyPal</span></h1>
                    <p className="tagline">Your Smart Student Expense Management Companion</p>
                    
                    <div className="cta-buttons">
                        <button onClick={() => navigate('/login')} className="login-btn pulse-effect">
                   
                            Login
                        </button>
                        <button  onClick={() => navigate('/register')} className="signup-btn pulse-effect">
                
                            Sign Up
                        </button>
                    </div>
                </div>
            </div>
            
            <div className="features-section">
                <div className="section-header">
                    <h2>Why Choose PiggyPal?</h2>
                  
                </div>
                
                <div className="features-grid">
                    <div className="feature-card hover-float">
                        <div className="feature-icon">💰</div>
                        <h3>Smart Wallet</h3>
                        <p>Track your expenses and income in one place with our intuitive wallet system.</p>
                    </div>
                    <div className="feature-card hover-float">
                        <div className="feature-icon">📊</div>
                        <h3>Budget Planning</h3>
                        <p>Create and manage budgets to keep your spending in check.</p>
                    </div>
                    <div className="feature-card hover-float">
                        <div className="feature-icon">🎯</div>
                        <h3>Savings Goals</h3>
                        <p>Set and track your savings goals to achieve your financial dreams.</p>
                    </div>
                    <div className="feature-card hover-float">
                        <div className="feature-icon">📉</div>
                        <h3>Debt Tracking</h3>
                        <p>Keep track of your debts and manage them effectively.</p>
                    </div>
                    <div className="feature-card hover-float">
                        <div className="feature-icon">📱</div>
                        <h3>Transaction History</h3>
                        <p>View detailed transaction history and analyze your spending patterns.</p>
                    </div>
                    <div className="feature-card hover-float">
                        <div className="feature-icon">👤</div>
                        <h3>Profile Management</h3>
                        <p>Customize your profile and manage your account settings.</p>
                    </div>
                </div>
            </div>
            
            <div className="cta-container">
            <div className="cta-section">
  <h2>Start Managing Your Finances Today!</h2>
  <p>Join Piggy Pal and take the first step towards better financial management.</p>

</div>
            
<div className="wave-footer">
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="animated-wave">
    <path fill="#6bba8b" fillOpacity="0.3" d="M0,192L48,176C96,160,192,128,288,133.3C384,139,480,181,576,186.7C672,192,768,160,864,165.3C960,171,1056,213,1152,218.7C1248,224,1344,192,1392,176L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
  </svg>
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="animated-wave wave-2">
    <path fill="#6bba8b" fillOpacity="0.2" d="M0,256L48,245.3C96,235,192,213,288,213.3C384,213,480,235,576,229.3C672,224,768,192,864,181.3C960,171,1056,181,1152,176C1248,171,1344,149,1392,138.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
  </svg>
</div>
        </div>
        </div>
    );
};

export default Landing;