import React, { useState } from 'react';
import './App.scss';
import Navigation from './components/Navigation';
import HomePage from './pages/HomePage';
import KYCPage from './pages/KYCPage';
import DashboardPage from './pages/DashboardPage';
import LoanApplication from './pages/LoanApplication'; // Import LoanApplication
import ScholarshipsPage from './pages/ScholarshipsPage'; // Import ScholarshipsPage

const App = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [isKycSubmitted, setIsKycSubmitted] = useState(false);
  const [notifications, setNotifications] = useState([]); // State for notifications
  const [isLoading, setIsLoading] = useState(false); // State for loading indicator

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
        <LoanApplication />
      )}
      {currentPage === 'scholarship' && <ScholarshipsPage />}
    </div>
  );
};

export default App;