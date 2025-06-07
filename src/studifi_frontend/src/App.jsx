// App.jsx
import React, { useState } from 'react';
import './App.scss';
import Navigation from './components/Navigation';
import HomePage from './pages/HomePage';
import KYCPage from './pages/KYCPage';
import DashboardPage from './pages/DashboardPage';
import LoanDashboard from './pages/LoanDashboard';
import LoanApplication from './pages/LoanApplication'; // Import LoanApplication component
import ScholarshipDashboard from './pages/ScholarshipDashboard';

const App = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [isKycSubmitted, setIsKycSubmitted] = useState(false);

  const navigateTo = (page) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  const handleKycSubmissionComplete = () => {
    setIsKycSubmitted(true);
    navigateTo('dashboard');
  };

  const handleLogout = () => {
    setIsKycSubmitted(false);
    navigateTo('home');
  };

  return (
    <div className="App">
      <Navigation navigateTo={navigateTo} isKycSubmitted={isKycSubmitted} onLogout={handleLogout} />
      {currentPage === 'home' && <HomePage navigateTo={navigateTo} />}
      {currentPage === 'kyc' && <KYCPage onSubmissionComplete={handleKycSubmissionComplete} />}
      {currentPage === 'dashboard' && <DashboardPage />}
      {currentPage === 'loan' && (
        <LoanDashboard navigateTo={navigateTo} />
      )}
      {currentPage === 'applyLoan' && ( // Add a new condition for LoanApplication
        <LoanApplication navigateTo={navigateTo} /> // Render LoanApplication when currentPage is 'applyLoan'
      )}
      {currentPage === 'scholarship' && <ScholarshipDashboard />}
    </div>
  );
};

export default App;