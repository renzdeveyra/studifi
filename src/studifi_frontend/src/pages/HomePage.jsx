// HomePage.jsx
import React from 'react';

// Ensure your SCSS file is imported somewhere in your project, e.g., in App.js or index.js
// import './styles/pages/_pages.scss'; // Example import path

const HomePage = ({ setCurrentPage }) => {
    return (
        <div className="home-page">
            {/* Section 1: Welcome to StudiFi (Original from first input) */}
            <section className="original-hero-stats-section">
                <div className="original-hero-content">
                    <h1 className="original-hero-title">Welcome to StudiFi</h1>
                    <p className="original-hero-subtitle">
                        The Future of Student Finance on Internet Computer
                    </p>
                    <p className="original-hero-description">
                        Experience instant microloans, transparent scholarships, and community governance
                        - all powered by blockchain technology with zero transaction fees.
                    </p>
                    <div className="original-hero-stats-grid">
                        <div className="stat">
                            <h3>$2.5M+</h3>
                            <p>Total Loans Disbursed</p>
                        </div>
                        <div className="stat">
                            <h3>1,247</h3>
                            <p>Students Helped</p>
                        </div>
                        <div className="stat">
                            <h3>5 sec</h3>
                            <p>Average Approval Time</p>
                        </div>
                        <div className="stat">
                            <h3>0%</h3>
                            <p>Transaction Fees</p>
                        </div>
                    </div>
                    <div className="original-hero-actions">
                        <button
                            className="btn-primary"
                            onClick={() => setCurrentPage('loans')}
                        >
                            Apply for Loan
                        </button>
                        <button
                            className="btn-secondary"
                            onClick={() => setCurrentPage('scholarships')}
                        >
                            Browse Scholarships
                        </button>
                    </div>
                </div>
            </section>

            {/* Section 3: Why Choose StudiFi? (Original from first input) */}
            <section className="section-common features-section">
                <h2 className="features-section-title">Why Choose StudiFi?</h2>
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
            </section>

            {/* Section 4: Our Offerings (Updated to match draft image and SCSS) */}
            <section className="section-common offerings-section">
              <div className="image-block">
                {/* Removed the <img> tag. The "Education Image" text is now directly within the div,
                    and its styling (centering, background color) is handled by the .image-block CSS. */}
                <h3>Education Image</h3>
              </div>
              <div className="offerings-content-container">
                <div className="offerings-header">
                  <h2 className="offerings-title">Our Offerings</h2>
                  <p className="offerings-description">
                    Explore our loan and scholarship options designed for your educational
                    needs.
                  </p>
                  <button onClick={() => setCurrentPage('loans')} className="action-button">
                    <div className="button-text">Apply Now</div>
                  </button>
                </div>
                <div className="metrics-list">
                  <div className="cards-row">
                    <div className="offering-card">
                      <div className="offering-image-wrapper">
                        <img
                          className="offering-image"
                          src="https://placehold.co/300x240/d8d8d8/000000?text=Student+Loan"
                          alt="Student Loan"
                        />
                        <button
                          onClick={() => setCurrentPage('loans')}
                          className="offering-tag"
                        >
                          <div className="offering-tag-text">Learn More</div>
                        </button>
                      </div>
                      <div className="offering-text-content">
                        <div className="offering-card-title">Student Loan</div>
                        <div className="offering-card-subtitle">
                          Low-interest and transparent
                        </div>
                      </div>
                    </div>
                    <div className="offering-card">
                      <div className="offering-image-wrapper">
                        <img
                          className="offering-image"
                          src="https://placehold.co/300x240/d8d8d8/000000?text=Scholarship"
                          alt="Decentralized Scholarship"
                        />
                        <button
                          onClick={() => setCurrentPage('scholarships')}
                          className="offering-tag"
                        >
                          <div className="offering-tag-text">Learn More</div>
                        </button>
                      </div>
                      <div className="offering-text-content">
                        <div className="offering-card-title">Decentralized Scholarship</div>
                        <p className="offering-card-subtitle">
                          Support from peers and community
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 5: Apply for Loan or Scholarship (Form) (Original from second input) */}
            <section className="section-common application-form-section">
                <div className="offerings-header section-header-left">
                    <h2 className="offerings-title section-title">Apply for a Loan or Scholarship</h2>
                    <p className="offerings-description section-description">Follow the steps below to apply.</p>
                </div>
                <div className="application-form-list">
                    <div className="input-group-wrapper">
                        <div className="input-group">
                            <label htmlFor="fullName" className="input-label">Full Name</label>
                            <div className="input-field-container">
                                <input type="text" id="fullName" className="input-field" placeholder="Enter your full name" />
                            </div>
                        </div>
                    </div>
                    <div className="input-group-wrapper">
                        <div className="input-group">
                            <label htmlFor="emailAddress" className="input-label">Email Address</label>
                            <div className="input-field-container">
                                <input type="email" id="emailAddress" className="input-field" placeholder="Enter your email" />
                            </div>
                        </div>
                    </div>
                    <div className="input-group-wrapper">
                        <div className="input-group">
                            <label htmlFor="amountRequested" className="input-label">Amount Requested</label>
                            <div className="input-field-container">
                                <input type="number" id="amountRequested" className="input-field" placeholder="Enter the amount" />
                            </div>
                        </div>
                    </div>
                    <button onClick={() => setCurrentView('register')} className="action-button submit-button w-full">
                        <div className="button-text">Register & Apply</div>
                    </button>
                </div>
            </section>

            {/* Section 6: How It Works (Updated to match draft layout and SCSS) */}
            <section className="section-common how-it-works-section">
                <div className="section-header-left"> {/* Matches the SCSS for two-column layout */}
                    <h2 className="section-title">How It Works</h2>
                    <p className="section-description">A simple step-by-step application process.</p>
                </div>
                <div className="how-it-works-steps-container"> {/* Container for the steps */}
                    <div className="how-it-works-list"> {/* The list of individual steps */}
                        <div className="step-article-wrapper">
                            <div className="step-article">
                                <div className="step-icon-image">
                                    {/* Using Font Awesome icons as placeholders */}
                                    <i className="fas fa-user-plus"></i>
                                </div>
                                <div className="step-text-content">
                                    <div className="step-title">Step 1: Create an Account</div>
                                    <p className="step-description">Sign up to create your StudiFi account.</p>
                                </div>
                            </div>
                        </div>
                        <div className="step-article-wrapper">
                            <div className="step-article">
                                <div className="step-icon-image">
                                    <i className="fas fa-id-card"></i>
                                </div>
                                <div className="step-text-content">
                                    <div className="step-title">Step 2: Verify Your Identity</div>
                                    <p className="step-description">Link your identity document for verification.</p>
                                </div>
                            </div>
                        </div>
                        <div className="step-article-wrapper">
                            <div className="step-article">
                                <div className="step-icon-image">
                                    <i className="fas fa-file-alt"></i>
                                </div>
                                <div className="step-text-content">
                                    <div className="step-title">Step 3: Apply for Loans/Scholarships</div>
                                    <p className="step-description">Complete the application form to get started.</p>
                                </div>
                            </div>
                        </div>
                        <div className="step-article-wrapper">
                            <div className="step-article">
                                <div className="step-icon-image">
                                    <i className="fas fa-chart-line"></i>
                                </div>
                                <div className="step-text-content">
                                    <div className="step-title">Step 4: Monitor Your Progress</div>
                                    <p className="step-description">Use our dashboard to track your loan status and repayments.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Section 7: Success Stories (Updated to match draft layout and SCSS) */}
            <section className="section-common success-stories-section-wrapper"> {/* Renamed for clarity */}
                {/* The draft image shows the title and description above the cards, not as a left header */}
                <div className="offerings-header" style={{ textAlign: 'center', width: '100%', marginBottom: '2rem' }}>
                    <h2 className="offerings-title" style={{ textAlign: 'center' }}>Success Stories</h2>
                    <p className="offerings-description" style={{ textAlign: 'center' }}>Hear from our successful students.</p>
                </div>
                <div className="cards-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', width: '100%' }}>
                    <div className="success-story-card">
                        <div className="user-info">
                            <div className="user-avatar-group">
                                <img className="user-avatar" src="https://placehold.co/40x40/d1d5db/000000?text=A" alt="User Avatar" />
                                <div className="user-name-container">
                                    <div className="user-name">John Doe</div>
                                </div>
                            </div>
                            <img className="stars-rating-image" src="https://placehold.co/70x12/FFD700/000000?text=★★★★★" alt="5 Stars Rating" />
                        </div>
                        <p className="testimonial-text">
                            "StudiFi transformed my education. The loan process was seamless, and I
                            could focus on my studies without financial stress."
                        </p>
                    </div>
                    <div className="success-story-card">
                        <div className="user-info">
                            <div className="user-avatar-group">
                                <img className="user-avatar" src="https://placehold.co/40x40/d1d5db/000000?text=B" alt="User Avatar" />
                                <div className="user-name-container">
                                    <div className="user-name">Jane Smith</div>
                                </div>
                            </div>
                            <img className="stars-rating-image" src="https://placehold.co/70x12/FFD700/000000?text=★★★★★" alt="5 Stars Rating" />
                        </div>
                        <p className="testimonial-text">
                            "The decentralized scholarship program is incredible. It allowed me to
                            pursue my dreams with community support."
                        </p>
                    </div>
                    {/* Add more success story cards as needed */}
                </div>
            </section>
        </div>
    );
};

export default HomePage;
