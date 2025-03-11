// Footer.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './footer-css.css';

const Footer = () => {
  const [expandedColumn, setExpandedColumn] = useState(null);
  
  const toggleColumn = (columnName) => {
    if (expandedColumn === columnName) {
      setExpandedColumn(null);
    } else {
      setExpandedColumn(columnName);
    }
  };
  
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-top">
          <div className="footer-logo">
            <h3>COLORLIB</h3>
            <p>© 2019</p>
          </div>
          
          <div className="footer-links">
            <div className="footer-column">
              <h4 
                className="footer-column-title"
                onClick={() => toggleColumn('customers')}
              >
                Customers
                <span className={`toggle-icon ${expandedColumn === 'customers' ? 'open' : ''}`}>+</span>
              </h4>
              <ul className={expandedColumn === 'customers' ? 'expanded' : ''}>
                <li><Link to="/transactions">Transactions</Link></li>
                <li><Link to="/savings">Savings</Link></li>
              </ul>
            </div>
            
            <div className="footer-column">
              <h4 
                className="footer-column-title"
                onClick={() => toggleColumn('company')}
              >
                Project
                <span className={`toggle-icon ${expandedColumn === 'company' ? 'open' : ''}`}>+</span>
              </h4>
              <ul className={expandedColumn === 'company' ? 'expanded' : ''}>
                <li><Link to="/about-us">About us</Link></li>
                <li><Link to="/careers">Careers</Link></li>
                <li><Link to="/contact-us">Contact us</Link></li>
              </ul>
            </div>
            
            <div className="footer-column">
              <h4
                className="footer-column-title"
                onClick={() => toggleColumn('information')}
              >
                Further Information
                <span className={`toggle-icon ${expandedColumn === 'information' ? 'open' : ''}`}>+</span>
              </h4>
              <ul className={expandedColumn === 'information' ? 'expanded' : ''}>
                <li><Link to="/terms">Terms & Conditions</Link></li>
                <li><Link to="/privacy">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="footer-social">
            <h4>Follow us</h4>
            <div className="social-icons">
              <a href="#" className="social-icon facebook" aria-label="Facebook">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="#" className="social-icon twitter" aria-label="Twitter">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" className="social-icon linkedin" aria-label="LinkedIn">
                <i className="fab fa-linkedin-in"></i>
              </a>
              <a href="#" className="social-icon youtube" aria-label="YouTube">
                <i className="fab fa-youtube"></i>
              </a>
              <a href="#" className="social-icon telegram" aria-label="Telegram">
                <i className="fab fa-telegram-plane"></i>
              </a>
            </div>
          </div>
        </div>
      </div>
      
      <div className="next-project">
        <div className="next-project-container">
          <div className="next-project-text">
            <h3>Ready for a next project?</h3>
            <p>Let's get started!</p>
          </div>
          <div className="next-project-cta">
            <Link to="/contact" className="contact-btn">Contact us</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;