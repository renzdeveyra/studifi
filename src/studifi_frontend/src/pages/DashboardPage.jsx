import React, { useEffect } from 'react';
import './DashboardPage.scss';

const DashboardPage = ({ navigateTo }) => {
  useEffect(() => {
    console.log('DashboardPage mounted successfully');
  }, []);

  return (
    <section className="dashboard-page-section">
      <div className="container">
        <header className="dashboard-header">
          <div className="profile-section">
            <div className="profile-avatar"></div>
            <div className="profile-info">
              <h1 className="user-name">Hello, Doe!</h1>
              <p className="welcome-message">Welcome to your financial aid dashboard.</p>
            </div>
            <div className="profile-actions">
              <button
                className="btn-primary"
                onClick={() => navigateTo('applyLoan')}
                data-tutorial="apply-aid-btn"
              >
                <span className="material-icons">➕</span> Apply for Aid
              </button>
              <button
                className="btn-secondary"
                data-tutorial="wallet-btn"
              >
                <span className="material-icons">👛</span> My Wallet
              </button>
            </div>
          </div>
        </header>

        {/* Current Financial Aid Status Section */}
        <div className="dashboard-section-wrapper" data-tutorial="loan-status">
          <div className="section-header-left">
            <h2 className="section-title">Current Financial Aid Status</h2>
            <p className="section-description">
              View the current status of your loan and scholarship applications. Stay updated on approvals and next steps.
            </p>
          </div>
          <div className="section-content-right">
            <div className="aid-status-card">
              <div className="card-image-container">
                <div className="card-image">💰</div>
              </div>
              <div className="card-details">
                <h4 className="card-title">Loan Summary</h4>
                <p className="card-subtitle">Status:</p>
                <p className="card-value">Pending Approval</p>
                <p className="card-text">
                  Your loan application is currently awaiting final approval. We will notify you once there's an update.
                </p>
              </div>
            </div>

            <div className="aid-status-card">
              <div className="card-image-container">
                <div className="card-image">🎓</div>
              </div>
              <div className="card-details">
                <h4 className="card-title">Scholarship Application</h4>
                <p className="card-subtitle">Status:</p>
                <p className="card-value">In Review</p>
                <p className="card-text">
                  Your scholarship application is being reviewed by the committee. Please ensure all required documents are submitted.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Loan Overview Section */}
        <div className="dashboard-section-wrapper">
          <div className="section-header-left">
            <h2 className="section-title">Loan Overview</h2>
            <p className="section-description">
              Get a quick glance at your loan details, including disbursed amounts and payment schedules.
            </p>
            <div className="payment-actions">
                <button className="btn-primary" onClick={() => navigateTo('loan')}>View Loan Details</button>
            </div>
          </div>
          <div className="section-content-right">
            <div className="overview-grid">
              <div className="overview-card">
                <span className="overview-icon">🔄</span>
                <p className="overview-label">Auto Renewal</p>
                <p className="overview-value">$10,000</p>
              </div>
              <div className="overview-card">
                <span className="overview-icon">💸</span>
                <p className="overview-label">Disbursed</p>
                <p className="overview-value">$5,800</p>
              </div>
              <div className="overview-card">
                <span className="overview-icon">✅</span>
                <p className="overview-label">Status</p>
                <p className="overview-value">Approved</p>
              </div>
              <div className="overview-card">
                <span className="overview-icon">📅</span>
                <p className="overview-label">Next Payment Due</p>
                <p className="overview-value">Dec 17</p>
                <p className="card-text">$500 due on 2023-12-01</p>
              </div>
            </div>
          </div>
        </div>

        {/* Scholarship Status Section */}
        <div className="dashboard-section-wrapper" data-tutorial="scholarship-section">
          <div className="section-header-left">
            <h2 className="section-title">Scholarship Status</h2>
            <p className="section-description">
              Track the progress of your scholarship applications and discover what's next.
            </p>
            <div className="payment-actions">
              <button className="btn-primary" onClick={() => navigateTo('scholarship')}>View All Scholarships</button>
            </div>
          </div>
          <div className="section-content-right">
            <div className="aid-status-card">
              <div className="card-image-container">
                <div className="card-image">✍️</div>
              </div>
              <div className="card-details">
                <h4 className="card-title">Approval Type</h4>
                <p className="card-value">Manual Approval</p>
                <p className="card-text">
                  Your scholarship requires manual review by the financial aid office.
                </p>
              </div>
            </div>
            <div className="aid-status-card">
              <div className="card-image-container">
                <div className="card-image">📄</div>
              </div>
              <div className="card-details">
                <h4 className="card-title">Next Step</h4>
                <p className="card-value">Submit Additional Documents</p>
                <p className="card-text">
                  Please upload the requested documents to complete your application.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Active Applications Section */}
        <div className="dashboard-section-wrapper">
          <div className="section-header-left">
            <h2 className="section-title">Active Applications</h2>
            <p className="section-description">
              Keep tabs on all your active financial aid applications in one place.
            </p>
            <div className="payment-actions">
              <button className="btn-primary">Manage Applications</button> 
            </div>
          </div>
          <div className="section-content-right">
            <div className="active-application-item">
              <div className="application-icon">📚</div>
              <div className="application-details">
                <h4 className="application-title">Student Loan Application</h4>
                <p className="application-status">Status: Pending Approval</p>
              </div>
            </div>
            <div className="active-application-item">
              <div className="application-icon">🎓</div>
              <div className="application-details">
                <h4 className="application-title">Scholarship Application</h4>
                <p className="application-status">Status: In Review</p>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Schedule Section */}
        <div className="dashboard-section-wrapper">
          <div className="section-header-left">
            <h2 className="section-title">Payment Schedule</h2>
            <p className="section-description">
              View your upcoming payment due dates and manage your payments easily.
            </p>
            <div className="payment-actions">
              <button className="btn-primary">View All Activity</button>
              <button className="btn-secondary" onClick={() => navigateTo('payment')}>Make a Payment</button>
            </div>
          </div>
          <div className="section-content-right">
            <div className="aid-status-card">
              <div className="card-image-container">
                <div className="card-image">💳</div>
              </div>
              <div className="card-details">
                <h4 className="card-title">Upcoming Payment</h4>
                <p className="card-value">$500 due on 2023-12-01</p>
                <p className="card-text">
                  Your next loan payment is scheduled for December 1, 2023.
                </p>
                <div className="card-tag">
                  <span className="tag-text">Loan Payment</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Wallet Integration Section */}
        <div className="dashboard-section-wrapper">
          <div className="section-header-left">
            <h2 className="section-title">Wallet Integration</h2>
            <p className="section-description">
              Connect and manage your digital wallet for seamless financial transactions.
            </p>
            <div className="payment-actions">
              <button className="btn-primary">Connect Wallet</button>
            </div>
          </div>
          <div className="section-content-right">
            <div className="active-application-item"> {/* Reusing this card style */}
              <div className="application-icon">🔗</div>
              <div className="application-details">
                <h4 className="application-title">Connected Wallet</h4>
                <p className="application-status">Status: Active</p>
              </div>
              <span className="wallet-address-value">0x73A...acd</span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default DashboardPage;

