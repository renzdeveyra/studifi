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
      name: 'Internet Computer',
      icon: '🌐',
      color: '#7fff00',
      bgColor: 'rgba(127, 255, 0, 0.1)',
      borderColor: 'rgba(127, 255, 0, 0.3)'
    },
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
            <p>Connect your wallet to access decentralized education finance on the Internet Computer blockchain</p>
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

          {/* Development Mode - Remove in production */}
          {import.meta.env.VITE_DFX_NETWORK === 'local' && (
            <div style={{marginTop: '1rem', padding: '1rem', background: 'rgba(255, 165, 0, 0.1)', borderRadius: '8px', border: '1px solid rgba(255, 165, 0, 0.3)'}}>
              <p style={{fontSize: '0.8rem', color: 'rgba(255, 165, 0, 0.9)', margin: '0 0 0.5rem 0'}}>
                🚧 Development Mode
              </p>
              <button
                className="alt-btn"
                onClick={() => {
                  console.log('Demo mode - skipping authentication');
                  onLogin('Demo');
                }}
                style={{width: '100%', background: 'rgba(255, 165, 0, 0.1)', borderColor: 'rgba(255, 165, 0, 0.3)'}}
              >
                <span className="alt-icon">🔧</span>
                Continue Without Auth (Demo)
              </button>
            </div>
          )}

          <div className="security-notice">
            <div className="security-icon">🔒</div>
            <p>Your identity is secured by blockchain cryptography. StudiFi never stores private keys or personal data - everything runs on-chain with complete transparency.</p>
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
