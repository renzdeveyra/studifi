import React from 'react';
import './Navigation.scss';

// Accept navigateTo, isKycSubmitted, and onLogout as props
const Navigation = ({ navigateTo, isKycSubmitted, onLogout }) => {
  return (
    <>
      {/* Top Navbar - shown when KYC is NOT submitted */}
      {!isKycSubmitted && (
        <nav className="navbar">
          <div className="logo">
            Studi<span className="green">fi</span>
          </div>
          <ul className="nav-menu">
            <li><a href="#" onClick={() => navigateTo('home')}>Home</a></li>   
            <li><a href="#service">Service</a></li>
            <li><a href="#about">About Us</a></li>
            <li><a href="#contact">Contact</a></li>
          </ul>
          <div className="nav-right">
            <a href="#login" className="login-btn">Login</a>
            <button className="get-started-btn" onClick={() => navigateTo('kyc')}>Get Started Now</button>
          </div>
        </nav>
      )}

      {/* Sidebar - shown when KYC IS submitted */}
      {isKycSubmitted && (
        <nav className="sidebar">
          <div className="sidebar-header">
            <div className="logo">
              Studi<span className="green">fi</span>
            </div>
          </div>
          
          <ul className="sidebar-menu">
            <li><a href="#" onClick={() => navigateTo('dashboard')}>
              <span className="menu-icon">📊</span>
              Dashboard
            </a></li>
            <li><a href="#" onClick={() => navigateTo('loan')}>
              <span className="menu-icon">💰</span>
              Loan
            </a></li>
            <li><a href="#" onClick={() => navigateTo('scholarship')}>
              <span className="menu-icon">🎓</span>
              Scholarship
            </a></li>
            <li><a href="#" onClick={() => navigateTo('governance')}>
              <span className="menu-icon">⚖️</span>
              Governance
            </a></li>
          </ul>
          
          <div className="sidebar-footer">
            <a href="#" className="logout-btn" onClick={onLogout}>
              <span className="menu-icon">🚪</span>
              Logout
            </a>
          </div>
        </nav>
      )}
    </>
  );
};

export default Navigation;