import React from 'react';
import './ServicesPage.scss';

const ServicesPage = () => {
  return (
    <div className="services-page">
      {/* Hero Section */}
      <section className="services-hero">
        <div className="services-container">
          <div className="hero-content">
            <h1>
              Our <span className="highlight">DeFi Education</span> Services
            </h1>
            <p>
              Comprehensive blockchain-powered education finance solutions designed for students, 
              by the community. Experience transparent, decentralized funding with zero fees and instant approvals.
            </p>
          </div>
        </div>
      </section>

      {/* Core Services Section */}
      <section className="core-services">
        <div className="services-container">
          <div className="section-header">
            <h2>Core DeFi Services</h2>
            <p>Revolutionary blockchain-based education finance powered by Internet Computer</p>
          </div>
          
          <div className="services-grid">
            <div className="service-card featured">
              <div className="service-icon">🎓</div>
              <div className="service-badge">Featured</div>
              <h3>DeFi Student Loans</h3>
              <div className="service-subtitle">Blockchain-Powered Financing</div>
              <p>Access transparent, decentralized student loans with zero transaction fees. Our smart contracts ensure fair terms while community governance protects student interests.</p>
              <div className="service-features">
                <div className="feature-item">
                  <span className="feature-icon">⚡</span>
                  <span>Instant Approval (Under 5 seconds)</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">💰</span>
                  <span>Zero Transaction Fees</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">🔒</span>
                  <span>Smart Contract Security</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">📊</span>
                  <span>Transparent Terms & Conditions</span>
                </div>
              </div>
            </div>

            <div className="service-card">
              <div className="service-icon">🏆</div>
              <h3>DAO Scholarship Fund</h3>
              <div className="service-subtitle">Decentralized Autonomous Funding</div>
              <p>Participate in our decentralized scholarship DAO where token holders vote on funding decisions. Merit-based distribution powered by blockchain technology.</p>
              <div className="service-features">
                <div className="feature-item">
                  <span className="feature-icon">🗳️</span>
                  <span>Community Voting</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">🌍</span>
                  <span>Global Accessibility</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">📈</span>
                  <span>Merit-Based Selection</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">🔍</span>
                  <span>Transparent Allocation</span>
                </div>
              </div>
            </div>

            <div className="service-card">
              <div className="service-icon">🔐</div>
              <h3>On-Chain KYC/AML</h3>
              <div className="service-subtitle">Privacy-Preserving Verification</div>
              <p>Secure identity verification through our blockchain-based KYC system. Maintain privacy while ensuring regulatory compliance.</p>
              <div className="service-features">
                <div className="feature-item">
                  <span className="feature-icon">🛡️</span>
                  <span>Privacy Protection</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">✅</span>
                  <span>Regulatory Compliant</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">🔄</span>
                  <span>One-Time Setup</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">🌐</span>
                  <span>Cross-Platform Valid</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DAO Governance Section */}
      <section className="dao-governance">
        <div className="services-container">
          <div className="governance-content">
            <div className="governance-info">
              <h2>Decentralized Autonomous Organization</h2>
              <p>StudiFi operates as a fully decentralized organization where community members have voting power over key decisions, scholarship distributions, and platform improvements.</p>
              
              <div className="dao-stats">
                <div className="dao-stat">
                  <div className="stat-number">2,500+</div>
                  <div className="stat-label">DAO Members</div>
                </div>
                <div className="dao-stat">
                  <div className="stat-number">1,200+</div>
                  <div className="stat-label">Proposals Voted</div>
                </div>
                <div className="dao-stat">
                  <div className="stat-number">95%</div>
                  <div className="stat-label">Participation Rate</div>
                </div>
              </div>
            </div>
            
            <div className="governance-features">
              <div className="governance-card">
                <div className="governance-icon">🗳️</div>
                <h4>Proposal Voting</h4>
                <p>Vote on platform improvements, policy changes, and new feature implementations with your governance tokens.</p>
              </div>
              
              <div className="governance-card">
                <div className="governance-icon">💎</div>
                <h4>Scholarship Allocation</h4>
                <p>Decide how scholarship funds are distributed based on merit, need, and community impact.</p>
              </div>
              
              <div className="governance-card">
                <div className="governance-icon">⚖️</div>
                <h4>Policy Making</h4>
                <p>Shape lending policies, interest rates, and platform rules through democratic governance.</p>
              </div>
              
              <div className="governance-card">
                <div className="governance-icon">🏛️</div>
                <h4>Treasury Management</h4>
                <p>Oversee platform treasury allocation and ensure sustainable growth of the ecosystem.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Stack Section */}
      <section className="tech-stack">
        <div className="services-container">
          <div className="section-header">
            <h2>Powered by Advanced Technology</h2>
            <p>Built on Internet Computer blockchain for maximum security, scalability, and zero gas fees</p>
          </div>
          
          <div className="tech-grid">
            <div className="tech-card">
              <div className="tech-icon">🌐</div>
              <h3>Internet Computer Protocol</h3>
              <p>Leveraging ICP's revolutionary reverse gas model for zero-fee transactions and unlimited scalability.</p>
            </div>
            
            <div className="tech-card">
              <div className="tech-icon">🤖</div>
              <h3>AI Credit Assessment</h3>
              <p>Advanced machine learning algorithms provide instant credit decisions in under 5 seconds.</p>
            </div>
            
            <div className="tech-card">
              <div class="tech-icon">📜</div>
              <h3>Smart Contracts</h3>
              <p>Immutable, transparent loan agreements executed automatically without intermediaries.</p>
            </div>
            
            <div className="tech-card">
              <div className="tech-icon">🔐</div>
              <h3>Decentralized Identity</h3>
              <p>Secure, privacy-preserving identity management built on blockchain infrastructure.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Statistics */}
      <section className="platform-stats">
        <div className="services-container">
          <div className="stats-header">
            <h2>Platform Impact</h2>
            <p>Real numbers from our decentralized education finance ecosystem</p>
          </div>
          
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">👨‍🎓</div>
              <div className="stat-number">5,247</div>
              <div className="stat-label">Students Funded</div>
              <div className="stat-description">Across 45+ countries worldwide</div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">💰</div>
              <div className="stat-number">$8.2M</div>
              <div className="stat-label">Total Value Locked</div>
              <div className="stat-description">In decentralized lending pools</div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">🏆</div>
              <div className="stat-number">1,834</div>
              <div className="stat-label">Scholarships Awarded</div>
              <div className="stat-description">Through DAO governance</div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">⚡</div>
              <div className="stat-number">2.3s</div>
              <div className="stat-label">Average Approval Time</div>
              <div className="stat-description">Powered by AI assessment</div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">🌐</div>
              <div className="stat-number">100%</div>
              <div className="stat-label">On-Chain Operations</div>
              <div className="stat-description">Fully decentralized platform</div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">🔄</div>
              <div className="stat-number">98.7%</div>
              <div className="stat-label">Repayment Rate</div>
              <div className="stat-description">Community-driven success</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ServicesPage;