import React, { useState } from 'react';
import './OAuthLogin.scss';

const OAuthLogin = ({ navigateTo, onLogin }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [activeProvider, setActiveProvider] = useState(null);

  const handleOAuthLogin = async (providerName) => {
    setIsLoading(true);
    setActiveProvider(providerName);

    setTimeout(() => {
      console.log(`Logging in with ${providerName}`);
      onLogin(providerName);
      setIsLoading(false);
      setActiveProvider(null);
    }, 2000);
  };

  const providers = [
    {
      name: 'ICP',
      icon: '🌐',
      color: '#7fff00',
      bgColor: 'rgba(127, 255, 0, 0.1)',
      borderColor: 'rgba(127, 255, 0, 0.3)'
    }
  ];

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-content">
          <div className="login-header">
            <div className="logo-section">
              <div className="logo">
                Studi<span className="green">fi</span>
              </div>
              <div className="logo-tagline">Student Finance Revolution</div>
            </div>
            <h1>Welcome Back</h1>
            <p>Choose your preferred login method to access your StudiFi account</p>
          </div>

          <div className="oauth-providers">
            {providers.map((provider) => (
              <button
                key={provider.name}
                className={`oauth-btn ${activeProvider === provider.name ? 'loading' : ''}`}
                onClick={() => handleOAuthLogin(provider.name)}
                disabled={isLoading || (activeProvider && activeProvider !== provider.name)}
                style={{
                  '--provider-color': provider.color,
                  '--provider-bg': provider.bgColor,
                  '--provider-border': provider.borderColor
                }}
              >
                <div className="oauth-content">
                  <div className="oauth-icon">
                    {activeProvider === provider.name && isLoading ? (
                      <div className="loading-spinner"></div>
                    ) : (
                      provider.icon
                    )}
                  </div>
                  <span className="oauth-text">
                    {activeProvider === provider.name && isLoading
                      ? 'Connecting...'
                      : `Continue with ${provider.name}`
                    }
                  </span>
                  <div className="oauth-arrow">→</div>
                </div>
                <div className="oauth-shimmer"></div>
              </button>
            ))}
          </div>

          <div className="divider">
            <span>or</span>
          </div>

          <div className="alternative-actions">
            <button className="alt-btn" onClick={() => navigateTo('home')}>
              <span className="alt-icon">🏠</span>
              Back to Home
            </button>
            <button className="alt-btn" onClick={() => navigateTo('kyc')}>
              <span className="alt-icon">✨</span>
              New User? Get Started
            </button>
          </div>

          <div className="security-notice">
            <div className="security-icon">🔒</div>
            <p>Your data is protected with enterprise-grade security. We never store your login credentials.</p>
          </div>
        </div>

        <div className="login-bg-elements">
          <div className="bg-circle bg-circle-1"></div>
          <div className="bg-circle bg-circle-2"></div>
          <div className="bg-circle bg-circle-3"></div>
        </div>
      </div>
    </div>
  );
};

export default OAuthLogin;
