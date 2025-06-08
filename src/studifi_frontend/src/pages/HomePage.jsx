import React from 'react';
import './HomePage.scss';
const HomePage = ({ navigateTo }) => { 
  return (
    <>
      <section className="section-one" id="home">
        <div className="hero-content">
          <h1>
            Decentralized Education Finance<br />
            for the <span className="highlight">Next Generation</span>
          </h1>
          <p>
            Empowering students with transparent, community-driven funding on the Internet Computer blockchain.
            Zero fees, instant approvals, and scholarship opportunities powered by decentralized governance.
          </p>
          <div className="hero-buttons">
            <button className="cta-btn" onClick={() => navigateTo('kyc')}>
              <span className="btn-icon">🚀</span>
              Start Your Journey
            </button>
            <button className="learn-btn" onClick={() => navigateTo('defi-education')}>
              <span className="btn-icon">📖</span>
              Explore DeFi Education
            </button>
          </div>
          <div className="stats-section">
            <div className="stat-item">
              <span className="stat-number">5K+</span>
              <div className="stat-label">Students Funded</div>
            </div>
            <div className="stat-item">
              <div className="rating">
                <span className="stat-number">100%</span>
              </div>
              <div className="stat-label">On-Chain</div>
            </div>
            <div className="stat-item">
              <span className="stat-number">$8M</span>
              <div className="stat-label">Total Value Locked</div>
            </div>
            <div className="stat-item">
              <span className="stat-number">0%</span>
              <div className="stat-label">Transaction Fees</div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose StudiFi Section */}
      <section className="section-two" id="why-choose">
        <div className="container">
          <div className="Hsection-header">
            <h2>Why Choose StudiFi?</h2>
            <p>Experience the future of education finance with blockchain-powered transparency, community governance, and zero-fee transactions</p>
          </div>
          
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🚀</div>
              <h3>Instant Approval</h3>
              <p>AI-powered credit assessment provides decisions in under 5 seconds</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">💰</div>
              <h3>Zero Fees</h3>
              <p>No transaction fees thanks to Internet Computer's reverse gas model</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">🎓</div>
              <h3>Student-Centric</h3>
              <p>Designed specifically for students with flexible repayment terms</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">🏛️</div>
              <h3>Community Governed</h3>
              <p>Stakeholders vote on policies and scholarship distributions</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">🔒</div>
              <h3>Fully Compliant</h3>
              <p>Built-in KYC/AML compliance and regulatory reporting</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">🌐</div>
              <h3>Decentralized</h3>
              <p>No single point of failure, runs entirely on blockchain</p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Offerings Section */}
        <section className="section-three" id="offerings">
        <div className="container">
            <div className="Hsection-header">
            <h2>DeFi Education Solutions</h2>
            <p>Access decentralized funding opportunities through our Internet Computer-powered platform. Join a community-driven ecosystem that puts students first.</p>
            <button className="cta-btn" onClick={() => navigateTo('kyc')}>
              <span className="btn-icon">⚡</span>
              Join the Revolution
            </button>
            </div>
            
            <div className="offerings-content">
            <div className="education-image">
                <div className="image-placeholder">
                <span>Education Excellence</span>
                </div>
            </div>
            
            <div className="offerings-cards">
                <div className="offering-card">
                <div className="card-icon"></div>
                <div className="card-header">
                    <div>
                    <h3>DeFi Student Loans</h3>
                    <p className="card-subtitle">Blockchain-Powered Financing</p>
                    </div>
                    <button className="learn-more-btn" onClick={() => navigateTo('defi-education')}>Explore DeFi</button>
                </div>
                <p className="card-description">Access transparent, decentralized financing with zero fees and instant on-chain approval. Smart contracts ensure fair terms while community governance protects student interests.</p>
                </div>
                
                <div className="offering-card">
                <div className="card-icon"></div>
                <div className="card-header">
                    <div>
                    <h3>DAO Scholarship Fund</h3>
                    <p className="card-subtitle">Decentralized Autonomous Funding</p>
                    </div>
                    <button className="learn-more-btn" onClick={() => navigateTo('login')}>Join DAO</button>
                </div>
                <p className="card-description">Participate in our decentralized scholarship DAO where token holders vote on funding decisions. Transparent allocation, community governance, and merit-based distribution powered by blockchain technology.</p>
                </div>
            </div>
            </div>
        </div>
        </section>

      {/* How It Works Section */}
      <section className="section-four" id="how-it-works">
        <div className="container">
          <div className="how-it-works-content">
            <div className="how-it-works-left">
              <h2>How DeFi Education Works</h2>
              <p>Experience seamless blockchain-powered education finance in four simple steps.</p>
            </div>
            
            <div className="how-it-works-steps">
              <div className="step">
                <div className="step-number">1</div>
                <div className="step-content">
                  <h3>Connect Your Wallet</h3>
                  <p>Create your decentralized identity and connect to the Internet Computer network.</p>
                </div>
              </div>

              <div className="step">
                <div className="step-number">2</div>
                <div className="step-content">
                  <h3>Complete KYC On-Chain</h3>
                  <p>Verify your identity through our secure, privacy-preserving blockchain verification.</p>
                </div>
              </div>

              <div className="step">
                <div className="step-number">3</div>
                <div className="step-content">
                  <h3>Access DeFi Services</h3>
                  <p>Apply for loans or scholarships through smart contracts with instant approval.</p>
                </div>
              </div>

              <div className="step">
                <div className="step-number">4</div>
                <div className="step-content">
                  <h3>Participate in Governance</h3>
                  <p>Vote on community proposals and help shape the future of decentralized education finance.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Success Stories Section */}
      <section className="section-five" id="success-stories">
        <div className="container">
          <div className="success-stories-content">
            <div className="success-stories-left">
              <h2>Success Stories</h2>
              <p>Hear from our successful students.</p>
            </div>
            
            <div className="testimonials">
              <div className="testimonial">
                <div className="testimonial-avatar">A</div>
                <div className="testimonial-content">
                  <h4>Alex Chen</h4>
                  <div className="rating-stars">★★★★★</div>
                  <p>"StudiFi's DeFi platform revolutionized my education funding. Zero fees, instant approval, and complete transparency through blockchain technology. The future of student finance is here!"</p>
                </div>
              </div>

              <div className="testimonial">
                <div className="testimonial-avatar">S</div>
                <div className="testimonial-content">
                  <h4>Sarah Martinez</h4>
                  <div className="rating-stars">★★★★★</div>
                  <p>"Being part of the StudiFi DAO changed everything. I received a scholarship through community voting and now help fund other students. True decentralized education finance!"</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default HomePage;