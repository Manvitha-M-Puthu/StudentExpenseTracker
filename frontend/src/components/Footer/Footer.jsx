// Footer.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './footer.css';
import piggyPal from '../Navbar/piggyPal.svg';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebookF, faTwitter, faLinkedinIn, faYoutube, faTelegramPlane } from '@fortawesome/free-brands-svg-icons';
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
      
            <img src={piggyPal} alt="" />
            <h3>PiggyPal</h3>
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
              <FontAwesomeIcon icon={faFacebookF} />
            </a>
            <a href="#" className="social-icon twitter" aria-label="Twitter">
              <FontAwesomeIcon icon={faTwitter} />
            </a>
            <a href="#" className="social-icon linkedin" aria-label="LinkedIn">
              <FontAwesomeIcon icon={faLinkedinIn} />
            </a>
            <a href="#" className="social-icon youtube" aria-label="YouTube">
              <FontAwesomeIcon icon={faYoutube} />
            </a>
            <a href="#" className="social-icon telegram" aria-label="Telegram">
              <FontAwesomeIcon icon={faTelegramPlane} />
            </a>
          </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;