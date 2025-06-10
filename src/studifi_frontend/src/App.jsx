// App.jsx
import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { TutorialProvider, useTutorial } from './contexts/TutorialContext';
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
import OAuthLogin from './pages/OAuthLogin';
import ServicesPage from './pages/ServicesPage';
import AboutUs from './pages/AboutUs';
import ContactUs from './pages/ContactUs';

import TutorialOverlay from './components/TutorialOverlay';
import TutorialButton from './components/TutorialButton';
import TutorialDebug from './components/TutorialDebug';



// Main App component that uses AuthContext
const AppContent = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [pageData, setPageData] = useState(null);
  const [isKycSubmitted, setIsKycSubmitted] = useState(false);

  const {
    isAuthenticated,
    isLoading,
    error,
    actors,
    login,
    logout,
    clearError
  } = useAuth();

  const { shouldAutoStart, startTutorial } = useTutorial();

  // Auto-start tutorial when user first reaches dashboard
  useEffect(() => {
    if (shouldAutoStart(isKycSubmitted)) {
      // Small delay to ensure dashboard is fully rendered
      setTimeout(() => {
        startTutorial();
      }, 1000);
    }
  }, [isKycSubmitted, shouldAutoStart, startTutorial]);

  const navigateTo = (page, data = null) => {
    setCurrentPage(page);
    setPageData(data);
    window.scrollTo(0, 0);
  };

  const handleKycSubmissionComplete = () => {
    setIsKycSubmitted(true);
    navigateTo('dashboard');
  };

  const handleLogout = async () => {
    try {
      await logout();
      setIsKycSubmitted(false);
      navigateTo('home');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleInternetIdentityLogin = async () => {
    try {
      await login();
      navigateTo('kyc'); // Navigate to KYC after login
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  // Function to handle OAuth login (simulated)
  const handleOAuthLogin = (provider) => {
    console.log(`Attempting to sign in with ${provider}`);
    setTimeout(() => {
      setIsKycSubmitted(true);
      navigateTo('dashboard');
    }, 2000);
  };

  if (error) {
    return (
      <div className="App" style={{backgroundColor: '#1e1e1e', minHeight: '100vh', color: 'white', padding: '20px'}}>
        <h1>StudiFi</h1>
        <p style={{color: '#ff6b6b'}}>Error: {error}</p>
        <button
          onClick={clearError}
          style={{padding: '10px 20px', backgroundColor: '#7fff00', color: 'black', border: 'none', borderRadius: '5px'}}
        >
          Clear Error
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="App" style={{backgroundColor: '#1e1e1e', minHeight: '100vh', color: 'white', padding: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
        <div>
          <h1>StudiFi</h1>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  console.log('App rendering, currentPage:', currentPage);

  return (
    <div className="App">
      <Navigation
        navigateTo={navigateTo}
        isKycSubmitted={isKycSubmitted}
        onLogout={handleLogout}
        currentPage={currentPage}
        onInternetIdentityLogin={handleInternetIdentityLogin}
        isAuthenticated={isAuthenticated}
      />
      {currentPage === 'home' && <HomePage navigateTo={navigateTo} onInternetIdentityLogin={handleInternetIdentityLogin} />}
      {currentPage === 'kyc' && <KYCPage onSubmissionComplete={handleKycSubmissionComplete} identityManagerActor={actors.studentIdentity} onInternetIdentityLogin={handleInternetIdentityLogin} />}
      {currentPage === 'dashboard' && <DashboardPage navigateTo={navigateTo} />}
      {currentPage === 'loan' && <LoanDashboard navigateTo={navigateTo} />}
      {currentPage === 'applyLoan' && <LoanApplication navigateTo={navigateTo} />}
      {currentPage === 'scholarship' && <ScholarshipDashboard />}

      {currentPage === 'payment' && <PaymentPage navigateTo={navigateTo} loanId={pageData?.loanId} />}
      {currentPage === 'smart-contract' && <SmartContractAgreement navigateTo={navigateTo} contractType={pageData?.contractType || 'loan'} />}
      {currentPage === 'defi-education' && <DeFiEducationHub navigateTo={navigateTo} />}
      {currentPage === 'login' && <OAuthLogin onLogin={handleOAuthLogin} navigateTo={navigateTo} />}
      {currentPage === 'services' && <ServicesPage />}
      {currentPage === 'about' && <AboutUs />}
      {currentPage === 'contact' && <ContactUs />}

      {/* Tutorial System */}
      <TutorialOverlay navigateTo={navigateTo} />

      {/* Floating Tutorial Button - only show on dashboard and related pages */}
      {isKycSubmitted && (
        <TutorialButton variant="floating" />
      )}

      {/* Debug Panel - Development Only */}
      <TutorialDebug />
    </div>
  );
};

// Main App wrapper with AuthProvider and TutorialProvider
const App = () => {
  return (
    <AuthProvider>
      <TutorialProvider>
        <AppContent />
      </TutorialProvider>
    </AuthProvider>
  );
};

export default App;