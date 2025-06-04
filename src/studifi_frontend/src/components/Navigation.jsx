import React from 'react';

const Navigation = ({ setCurrentView, currentView }) => (
  <nav className="studifi-nav">
    <div className="nav-brand">
      <img src="/logo2.svg" alt="StudiFi Logo" className="logo" />
      <h1>StudiFi</h1>
      <span className="tagline">Decentralized Student Finance</span>
    </div>
    <div className="nav-links">
      <button
        className={currentView === 'home' ? 'active' : ''}
        onClick={() => setCurrentView('home')}
      >
        Home
      </button>
      <button
        className={currentView === 'loans' ? 'active' : ''}
        onClick={() => setCurrentView('loans')}
      >
        Loans
      </button>
      <button
        className={currentView === 'scholarships' ? 'active' : ''}
        onClick={() => setCurrentView('scholarships')}
      >
        Scholarships
      </button>
      <button
        className={currentView === 'governance' ? 'active' : ''}
        onClick={() => setCurrentView('governance')}
      >
        Governance
      </button>
      <button
        className={currentView === 'dashboard' ? 'active' : ''}
        onClick={() => setCurrentView('dashboard')}
      >
        Dashboard
      </button>
    </div>
  </nav>
);

export default Navigation;