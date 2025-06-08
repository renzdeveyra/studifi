import React from 'react';
import './Navigation.scss';

// Accept navigateTo, isKycSubmitted, onLogout, and currentPage as props
const Navigation = ({ navigateTo, isKycSubmitted, onLogout, currentPage }) => {
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
            <li><a href="#" onClick={() => navigateTo('services')}>Services</a></li>
            <li><a href="#" onClick={() => navigateTo('about')}>About</a></li>
            <li><a href="#" onClick={() => navigateTo('contact')}>Contact</a></li>
          </ul>
          <div className="nav-right">
            {/* Updated Login button to navigate to 'login' page */}
            <a href="#" className="login-btn" onClick={() => navigateTo('login')}>Login</a>
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
            <div className="chain-indicator">
              <div className="chain-dot"></div>
              <span className="chain-text">On-Chain</span>
            </div>
          </div>

          <div className="sidebar-content">
            <ul className="sidebar-menu">
              <li className="menu-item">
                <a
                  href="#"
                  onClick={() => navigateTo('dashboard')}
                  className={`menu-link ${currentPage === 'dashboard' ? 'active' : ''}`}
                >
                  <div className="menu-icon-wrapper">
                    <span className="menu-icon">📊</span>
                  </div>
                  <span className="menu-text">Dashboard</span>
                  <div className="menu-indicator"></div>
                </a>
              </li>
              <li className="menu-item">
                <a
                  href="#"
                  onClick={() => navigateTo('loan')}
                  className={`menu-link ${currentPage === 'loan' ? 'active' : ''}`}
                >
                  <div className="menu-icon-wrapper">
                    <span className="menu-icon">💰</span>
                  </div>
                  <span className="menu-text">Loan</span>
                  <div className="menu-indicator"></div>
                </a>
              </li>
              <li className="menu-item">
                <a
                  href="#"
                  onClick={() => navigateTo('scholarship')}
                  className={`menu-link ${currentPage === 'scholarship' ? 'active' : ''}`}
                >
                  <div className="menu-icon-wrapper">
                    <span className="menu-icon">🎓</span>
                  </div>
                  <span className="menu-text">Scholarship</span>
                  <div className="menu-indicator"></div>
                </a>
              </li>
              <li className="menu-item">
                <a
                  href="#"
                  onClick={() => navigateTo('payment')}
                  className={`menu-link ${currentPage === 'payment' ? 'active' : ''}`}
                >
                  <div className="menu-icon-wrapper">
                    <span className="menu-icon">💳</span>
                  </div>
                  <span className="menu-text">Payment</span>
                  <div className="menu-indicator"></div>
                </a>
              </li>
            </ul>
          </div>

          <div className="sidebar-footer">
            <div className="user-section">
              <div className="user-avatar">
                <span className="avatar-icon">👤</span>
              </div>
              <div className="user-info">
                <span className="user-name">John Doe</span>
                <span className="user-status">Verified</span>
              </div>
            </div>
            <a href="#" className="logout-btn" onClick={onLogout}>
              <div className="logout-icon-wrapper">
                <span className="menu-icon">🚪</span>
              </div>
              <span className="logout-text">Logout</span>
            </a>
          </div>
        </nav>
      )}
    </>
  );
};

export default Navigation;
