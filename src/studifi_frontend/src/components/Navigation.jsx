import React from 'react';
import './Navigation.scss';

// Accept navigateTo, isKycSubmitted, and onLogout as props
const Navigation = ({ navigateTo, isKycSubmitted, onLogout }) => {
  return (
    <nav className="navbar">
      <div className="logo">
        Studi<span className="green">fi</span>
      </div>
      <ul className="nav-menu">

        {/* Links shown BEFORE KYC is submitted */}
        {!isKycSubmitted && (
          <>
            <li><a href="#" onClick={() => navigateTo('home')}>Home</a></li>   
            <li><a href="#service">Service</a></li>
            <li><a href="#about">About Us</a></li>
            <li><a href="#contact">Contact</a></li>
          </>
        )}
        {/* Links shown AFTER KYC is submitted */}
        {isKycSubmitted && (
          <>
            <li><a href="#" onClick={() => navigateTo('loan')}>Loan</a></li>
            <li><a href="#" onClick={() => navigateTo('scholarship')}>Scholarship</a></li>
            <li><a href="#" onClick={() => navigateTo('governance')}>Governance</a></li>
            <li><a href="#" onClick={() => navigateTo('dashboard')}>Dashboard</a></li>
          </>
        )}
      </ul>
      <div className="nav-right">
        {isKycSubmitted ? (
          // Show Logout button after KYC is submitted
          <a href="#" className="login-btn" onClick={onLogout}>Logout</a>
        ) : (
          // Show Login and Get Started Now buttons before KYC is submitted
          <>
            <a href="#login" className="login-btn">Login</a>
            <button className="get-started-btn" onClick={() => navigateTo('kyc')}>Get Started Now</button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
