// App.jsx
import React, { useState } from 'react';
import './App.scss';
import Navigation from './components/Navigation';
import HomePage from './pages/HomePage';
import KYCPage from './pages/KYCPage';
import DashboardPage from './pages/DashboardPage';
import LoanDashboard from './pages/LoanDashboard';
import LoanApplication from './pages/LoanApplication';
import ScholarshipDashboard from './pages/ScholarshipDashboard';
import PaymentPage from './pages/PaymentPage';
import SmartContractAgreement from './pages/SmartContractAgreement';
import DeFiEducationHub from './pages/DeFiEducationHub';
import OAuthLogin from './pages/OAuthLogin'; // Import the OAuthLogin component

const App = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [pageData, setPageData] = useState(null);
  const [isKycSubmitted, setIsKycSubmitted] = useState(false);

  const navigateTo = (page, data = null) => {
    setCurrentPage(page);
    setPageData(data);
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

  // Function to handle OAuth login (simulated)
  const handleOAuthLogin = (provider) => {
    // In a real application, you would integrate with an OAuth provider here.
    // For this example, we'll just simulate a successful login and navigate to the dashboard.
    console.log(`Attempting to sign in with ${provider}`);
    // Simulate a delay for the login process
    setTimeout(() => {
      setIsKycSubmitted(true); // Assuming successful login implies KYC is handled or not required for initial dashboard access
      navigateTo('dashboard');
    }, 2000); // Simulate 2-second login process
  };

  return (
    <div className="App">
      <Navigation navigateTo={navigateTo} isKycSubmitted={isKycSubmitted} onLogout={handleLogout} currentPage={currentPage} />
      {currentPage === 'home' && <HomePage navigateTo={navigateTo} />}
      {currentPage === 'kyc' && <KYCPage onSubmissionComplete={handleKycSubmissionComplete} />}
      {currentPage === 'dashboard' && <DashboardPage navigateTo={navigateTo} />}
      {currentPage === 'loan' && (
        <LoanDashboard navigateTo={navigateTo} />
      )}
      {currentPage === 'applyLoan' && (
        <LoanApplication navigateTo={navigateTo} />
      )}
      {currentPage === 'scholarship' && <ScholarshipDashboard />}
      {currentPage === 'payment' && <PaymentPage navigateTo={navigateTo} />}
      {currentPage === 'smart-contract' && <SmartContractAgreement navigateTo={navigateTo} contractType={pageData?.contractType || 'loan'} />}
      {currentPage === 'defi-education' && <DeFiEducationHub navigateTo={navigateTo} />}
      {currentPage === 'login' && <OAuthLogin onLogin={handleOAuthLogin} navigateTo={navigateTo} />} {/* Render OAuthLogin when currentPage is 'login' */}
    </div>
  );
};

export default App;
