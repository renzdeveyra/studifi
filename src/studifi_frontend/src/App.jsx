// App.jsx
import React, { useState, useEffect } from 'react';
import { AuthClient } from '@dfinity/auth-client';
import { createActor } from 'declarations/identity_manager';
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

const App = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [pageData, setPageData] = useState(null);
  const [isKycSubmitted, setIsKycSubmitted] = useState(false);
  const [authClient, setAuthClient] = useState(null);
  const [identity, setIdentity] = useState(null);
  const [identityManagerActor, setIdentityManagerActor] = useState(null);
  const [error, setError] = useState(null);

  // Initialize authentication on app load
  useEffect(() => {
    initAuth();
  }, []);

  const initAuth = async () => {
    try {
      console.log('Initializing auth...');
      const client = await AuthClient.create();
      setAuthClient(client);

      if (await client.isAuthenticated()) {
        console.log('User is already authenticated');
        const userIdentity = client.getIdentity();
        setIdentity(userIdentity);

        // Create identity manager actor with authenticated identity
        try {
          const actor = createActor(import.meta.env.VITE_CANISTER_ID_IDENTITY_MANAGER, {
            agentOptions: {
              identity: userIdentity,
            },
          });
          setIdentityManagerActor(actor);
        } catch (actorError) {
          console.warn('Failed to create identity manager actor:', actorError);
          // Don't set error here, just log it - the app can still function
        }
      }
      console.log('Auth initialized successfully');
    } catch (error) {
      console.error('Failed to initialize auth:', error);
      // Don't set error for auth initialization failure - let the app load without auth
      console.warn('App will continue without authentication');
    }
  };

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
      if (authClient) {
        await authClient.logout();
        setIdentity(null);
        setIdentityManagerActor(null);
      }
      setIsKycSubmitted(false);
      navigateTo('home');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Function to handle Internet Identity login
  const handleInternetIdentityLogin = async () => {
    if (!authClient) return;

    try {
      // Always use the mainnet Internet Identity for now to avoid local deployment issues
      const identityProvider = "https://identity.ic0.app";

      console.log('Attempting to login with Internet Identity...');

      await authClient.login({
        identityProvider,
        onSuccess: async () => {
          console.log('Internet Identity login successful');
          const userIdentity = authClient.getIdentity();
          setIdentity(userIdentity);

          // Create identity manager actor with authenticated identity
          const actor = createActor(import.meta.env.VITE_CANISTER_ID_IDENTITY_MANAGER, {
            agentOptions: {
              identity: userIdentity,
            },
          });
          setIdentityManagerActor(actor);

          navigateTo('kyc'); // Navigate to KYC after login
        },
        onError: (error) => {
          console.error('Login failed:', error);
          setError('Internet Identity login failed. Please try again.');
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      setError('Failed to connect to Internet Identity. Please check your connection.');
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
          onClick={() => window.location.reload()}
          style={{padding: '10px 20px', backgroundColor: '#7fff00', color: 'black', border: 'none', borderRadius: '5px'}}
        >
          Reload Page
        </button>
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
        isAuthenticated={!!identity}
      />
      {currentPage === 'home' && <HomePage navigateTo={navigateTo} onInternetIdentityLogin={handleInternetIdentityLogin} />}
      {currentPage === 'kyc' && <KYCPage onSubmissionComplete={handleKycSubmissionComplete} identityManagerActor={identityManagerActor} onInternetIdentityLogin={handleInternetIdentityLogin} />}
      {currentPage === 'dashboard' && <DashboardPage navigateTo={navigateTo} />}
      {currentPage === 'loan' && <LoanDashboard navigateTo={navigateTo} />}
      {currentPage === 'applyLoan' && <LoanApplication navigateTo={navigateTo} />}
      {currentPage === 'scholarship' && <ScholarshipDashboard />}
      {currentPage === 'payment' && <PaymentPage navigateTo={navigateTo} />}
      {currentPage === 'smart-contract' && <SmartContractAgreement navigateTo={navigateTo} contractType={pageData?.contractType || 'loan'} />}
      {currentPage === 'defi-education' && <DeFiEducationHub navigateTo={navigateTo} />}
      {currentPage === 'login' && <OAuthLogin onLogin={handleOAuthLogin} navigateTo={navigateTo} />}
    </div>
  );
};

export default App;
