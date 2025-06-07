import React from 'react';
import './HomePage.scss';
const HomePage = ({ navigateTo }) => { 
  return (
    <>
      <section className="section-one" id="home">
        <div className="hero-content">
          <h1>
            Quick and Easy Loans for<br />
            Your <span className="highlight">Financial Needs.</span>
          </h1>
          <p>
            Secure finance solutions designed for modern businesses and individuals. Experience 
            fast approvals and competitive rates.
          </p>
          <div className="hero-buttons">
            <button className="cta-btn" onClick={() => navigateTo('kyc')}>⚡ Get Started Now</button>
            <a href="#learn" className="learn-btn">Learn More</a>
          </div>
          <div className="stats-section">
            <div className="stat-item">
              <span className="stat-number">15K+</span>
              <div className="stat-label">Clients</div>
            </div>
            <div className="stat-item">
              <div className="rating">
                <span className="stat-number">4.9</span>
              </div>
              <div className="stat-label">Trustpilot</div>
              <div className="stars">★★★★★</div>
            </div>
            <div className="stat-item">
              <span className="stat-number">$12M</span>
              <div className="stat-label">Funded</div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose StudiFi Section */}
      <section className="section-two" id="why-choose">
        <div className="container">
          <div className="Hsection-header">
            <h2>Why Choose StudiFi?</h2>
            <p>Discover the advantages that make us the preferred choice for students</p>
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
            <h2>Our Offerings</h2>
            <p>Explore our comprehensive loan and scholarship options designed to fuel your educational journey and unlock your potential.</p>
            <button className="cta-btn" onClick={() => navigateTo('kyc')}>Apply Now ⚡</button>
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
                    <h3>Student Loan</h3>
                    <p className="card-subtitle">Smart Financing Solution</p>
                    </div>
                    <a href="#learn-more" className="learn-more-btn">Learn More</a>
                </div>
                <p className="card-description">Access low-interest, transparent financing options with AI-powered instant approval. Designed specifically for students with flexible repayment terms that adapt to your financial situation.</p>
                </div>
                
                <div className="offering-card">
                <div className="card-icon"></div>
                <div className="card-header">
                    <div>
                    <h3>Scholarship Program</h3>
                    <p className="card-subtitle">Community-Powered Support</p>
                    </div>
                    <a href="#learn-more" className="learn-more-btn">Learn More</a>
                </div>
                <p className="card-description">Join our decentralized scholarship ecosystem where community members support promising students. Benefit from peer-to-peer funding and collaborative educational advancement.</p>
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
              <h2>How It Works</h2>
              <p>A simple step-by-step application process.</p>
            </div>
            
            <div className="how-it-works-steps">
              <div className="step">
                <div className="step-number">1</div>
                <div className="step-content">
                  <h3>Create an Account</h3>
                  <p>Sign up to create your StudiFi account.</p>
                </div>
              </div>
              
              <div className="step">
                <div className="step-number">2</div>
                <div className="step-content">
                  <h3>Verify Your Identity</h3>
                  <p>Link your identity document for verification.</p>
                </div>
              </div>
              
              <div className="step">
                <div className="step-number">3</div>
                <div className="step-content">
                  <h3>Apply for Loans/Scholarships</h3>
                  <p>Complete the application form to get started.</p>
                </div>
              </div>
              
              <div className="step">
                <div className="step-number">4</div>
                <div className="step-content">
                  <h3>Monitor Your Progress</h3>
                  <p>Use our dashboard to track your loan status and repayments.</p>
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
                  <h4>John Doe</h4>
                  <div className="rating-stars">★★★★★</div>
                  <p>"StudiFi transformed my education. The loan process was seamless, and I could focus on my studies without financial stress."</p>
                </div>
              </div>
              
              <div className="testimonial">
                <div className="testimonial-avatar">B</div>
                <div className="testimonial-content">
                  <h4>Jane Smith</h4>
                  <div className="rating-stars">★★★★★</div>
                  <p>"The decentralized scholarship program is incredible. It allowed me to pursue my dreams with community support."</p>
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