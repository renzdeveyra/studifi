import React, { useState } from 'react';
import './App.scss';
import Navigation from './components/Navigation';
import HomePage from './pages/HomePage';
import KYCPage from './pages/KYCPage';
import DashboardPage from './pages/DashboardPage'; // Import DashboardPage

const App = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [isKycSubmitted, setIsKycSubmitted] = useState(false); // State to track KYC submission

  const navigateTo = (page) => {
    setCurrentPage(page);
    window.scrollTo(0, 0); // Scroll to top on page change
  };

  // Handler for KYC submission completion
  const handleKycSubmissionComplete = () => {
    setIsKycSubmitted(true); // Set KYC submitted status to true
    navigateTo('dashboard'); // Navigate to the dashboard page
  };

  // Handler for logout
  const handleLogout = () => {
    setIsKycSubmitted(false); // Reset KYC submitted status
    navigateTo('home'); // Navigate back to the home page
  };

  return (
    <div className="App">
      {/* Pass isKycSubmitted and handleLogout to the Navigation component */}
      <Navigation navigateTo={navigateTo} isKycSubmitted={isKycSubmitted} onLogout={handleLogout} />
      {currentPage === 'home' && <HomePage navigateTo={navigateTo} />}
      {/* Pass the new submission handler to KYCPage */}
      {currentPage === 'kyc' && <KYCPage onSubmissionComplete={handleKycSubmissionComplete} />}
      {currentPage === 'dashboard' && <DashboardPage />}
    </div>
  );
};

export default App;
