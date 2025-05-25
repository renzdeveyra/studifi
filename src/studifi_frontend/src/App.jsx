import { useState, useEffect } from 'react';
import { identity_manager } from 'declarations/identity_manager';
import { intelligent_credit } from 'declarations/intelligent_credit';
import { autonomous_finance } from 'declarations/autonomous_finance';
import { governance_engine } from 'declarations/governance_engine';
import { compliance_gateway } from 'declarations/compliance_gateway';
import './App.scss';

function App() {
  const [currentView, setCurrentView] = useState('home');
  const [userProfile, setUserProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // Navigation component
  const Navigation = () => (
    <nav className="studifi-nav">
      <div className="nav-brand">
        <img src="/logo2.svg" alt="StudiFi Logo" className="logo" />
        <h1>StudiFi</h1>
        <span className="tagline">Decentralized Student Finance</span>
      </div>
      <div className="nav-links">
        <button
          className={currentView === 'home' ? 'active' : ''}
          onClick={() => setCurrentView('home')}
        >
          Home
        </button>
        <button
          className={currentView === 'loans' ? 'active' : ''}
          onClick={() => setCurrentView('loans')}
        >
          Loans
        </button>
        <button
          className={currentView === 'scholarships' ? 'active' : ''}
          onClick={() => setCurrentView('scholarships')}
        >
          Scholarships
        </button>
        <button
          className={currentView === 'governance' ? 'active' : ''}
          onClick={() => setCurrentView('governance')}
        >
          Governance
        </button>
        <button
          className={currentView === 'dashboard' ? 'active' : ''}
          onClick={() => setCurrentView('dashboard')}
        >
          Dashboard
        </button>
      </div>
    </nav>
  );

  // Home/Landing Page
  const HomePage = () => (
    <div className="home-page">
      <section className="hero">
        <div className="hero-content">
          <h1>Welcome to StudiFi</h1>
          <p className="hero-subtitle">
            The Future of Student Finance on Internet Computer
          </p>
          <p className="hero-description">
            Experience instant microloans, transparent scholarships, and community governance
            - all powered by blockchain technology with zero transaction fees.
          </p>
          <div className="hero-stats">
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
          <div className="hero-actions">
            <button
              className="btn-primary"
              onClick={() => setCurrentView('loans')}
            >
              Apply for Loan
            </button>
            <button
              className="btn-secondary"
              onClick={() => setCurrentView('scholarships')}
            >
              Browse Scholarships
            </button>
          </div>
        </div>
      </section>

      <section className="features">
        <h2>Why Choose StudiFi?</h2>
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
    </div>
  );

  // Loan Application Component
  const LoanApplication = () => {
    const [formData, setFormData] = useState({
      requestedAmount: '',
      purpose: '',
      gpa: '',
      yearOfStudy: '',
      program: '',
      university: '',
      monthlyIncome: '',
      monthlyExpenses: '',
      existingDebt: '',
      familyIncome: ''
    });
    const [applicationResult, setApplicationResult] = useState(null);

    const handleInputChange = (e) => {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value
      });
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      setIsLoading(true);

      try {
        const academicInfo = {
          gpa: parseFloat(formData.gpa),
          yearOfStudy: parseInt(formData.yearOfStudy),
          program: formData.program,
          university: formData.university,
          expectedGraduation: "2025" // Simplified for demo
        };

        const financialInfo = {
          monthlyIncome: parseInt(formData.monthlyIncome),
          monthlyExpenses: parseInt(formData.monthlyExpenses),
          existingDebt: parseInt(formData.existingDebt),
          familialIncome: parseInt(formData.familyIncome)
        };

        const result = await intelligent_credit.submitLoanApplication(
          parseInt(formData.requestedAmount),
          formData.purpose,
          academicInfo,
          financialInfo
        );

        if (result.ok) {
          setApplicationResult(result.ok);
          addNotification('Loan application submitted successfully!', 'success');
        } else {
          addNotification('Error submitting application: ' + result.err, 'error');
        }
      } catch (error) {
        console.error('Error submitting loan application:', error);
        addNotification('Error submitting application', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    return (
      <div className="loan-application">
        <h2>Apply for a Student Loan</h2>
        <p className="subtitle">Get instant approval with our AI-powered assessment</p>

        {applicationResult ? (
          <div className="application-result">
            <h3>Application Submitted!</h3>
            <div className="result-card">
              <p><strong>Application ID:</strong> {applicationResult.id}</p>
              <p><strong>Status:</strong> {Object.keys(applicationResult.status)[0]}</p>
              <p><strong>Requested Amount:</strong> ${applicationResult.requestedAmount.toLocaleString()}</p>
              <p><strong>Purpose:</strong> {applicationResult.purpose}</p>
              {applicationResult.creditScore && (
                <div className="credit-score">
                  <h4>Credit Assessment</h4>
                  <p><strong>Score:</strong> {applicationResult.creditScore.score}/1000</p>
                  <p><strong>Risk Level:</strong> {Object.keys(applicationResult.creditScore.riskLevel)[0]}</p>
                </div>
              )}
            </div>
            <button onClick={() => setApplicationResult(null)} className="btn-secondary">
              Apply for Another Loan
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="loan-form">
            <div className="form-section">
              <h3>Loan Details</h3>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="requestedAmount">Requested Amount ($)</label>
                  <input
                    type="number"
                    id="requestedAmount"
                    name="requestedAmount"
                    value={formData.requestedAmount}
                    onChange={handleInputChange}
                    required
                    min="100"
                    max="50000"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="purpose">Purpose</label>
                  <select
                    id="purpose"
                    name="purpose"
                    value={formData.purpose}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select purpose</option>
                    <option value="Tuition">Tuition</option>
                    <option value="Books & Supplies">Books & Supplies</option>
                    <option value="Living Expenses">Living Expenses</option>
                    <option value="Technology">Technology</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3>Academic Information</h3>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="university">University</label>
                  <input
                    type="text"
                    id="university"
                    name="university"
                    value={formData.university}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="program">Program</label>
                  <input
                    type="text"
                    id="program"
                    name="program"
                    value={formData.program}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="gpa">GPA</label>
                  <input
                    type="number"
                    id="gpa"
                    name="gpa"
                    value={formData.gpa}
                    onChange={handleInputChange}
                    required
                    min="0"
                    max="4"
                    step="0.01"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="yearOfStudy">Year of Study</label>
                  <select
                    id="yearOfStudy"
                    name="yearOfStudy"
                    value={formData.yearOfStudy}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select year</option>
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                    <option value="5">5th Year+</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3>Financial Information</h3>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="monthlyIncome">Monthly Income ($)</label>
                  <input
                    type="number"
                    id="monthlyIncome"
                    name="monthlyIncome"
                    value={formData.monthlyIncome}
                    onChange={handleInputChange}
                    required
                    min="0"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="monthlyExpenses">Monthly Expenses ($)</label>
                  <input
                    type="number"
                    id="monthlyExpenses"
                    name="monthlyExpenses"
                    value={formData.monthlyExpenses}
                    onChange={handleInputChange}
                    required
                    min="0"
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="existingDebt">Existing Debt ($)</label>
                  <input
                    type="number"
                    id="existingDebt"
                    name="existingDebt"
                    value={formData.existingDebt}
                    onChange={handleInputChange}
                    required
                    min="0"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="familyIncome">Family Income ($)</label>
                  <input
                    type="number"
                    id="familyIncome"
                    name="familyIncome"
                    value={formData.familyIncome}
                    onChange={handleInputChange}
                    required
                    min="0"
                  />
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary" disabled={isLoading}>
                {isLoading ? 'Processing...' : 'Submit Application'}
              </button>
            </div>
          </form>
        )}
      </div>
    );
  };

  // Scholarships Component
  const ScholarshipsPage = () => {
    const [scholarships, setScholarships] = useState([]);
    const [showCreateForm, setShowCreateForm] = useState(false);

    useEffect(() => {
      loadScholarships();
    }, []);

    const loadScholarships = async () => {
      try {
        const result = await governance_engine.getOpenScholarships();
        setScholarships(result);
      } catch (error) {
        console.error('Error loading scholarships:', error);
      }
    };

    return (
      <div className="scholarships-page">
        <div className="page-header">
          <h2>Scholarship Marketplace</h2>
          <p>Transparent, community-governed scholarship distribution</p>
          <button
            className="btn-primary"
            onClick={() => setShowCreateForm(!showCreateForm)}
          >
            {showCreateForm ? 'Cancel' : 'Create Scholarship'}
          </button>
        </div>

        {showCreateForm && (
          <div className="create-scholarship-form">
            <h3>Create New Scholarship</h3>
            <p>Coming soon - Scholarship creation interface</p>
          </div>
        )}

        <div className="scholarships-grid">
          {scholarships.length > 0 ? (
            scholarships.map((scholarship, index) => (
              <div key={index} className="scholarship-card">
                <h3>{scholarship.name}</h3>
                <p className="amount">${scholarship.amount.toLocaleString()}</p>
                <p className="description">{scholarship.description}</p>
                <div className="criteria">
                  <p><strong>Min GPA:</strong> {scholarship.criteria.minGPA}</p>
                  <p><strong>Programs:</strong> {scholarship.criteria.requiredPrograms.join(', ')}</p>
                  <p><strong>Max Recipients:</strong> {scholarship.criteria.maxRecipients}</p>
                </div>
                <button className="btn-secondary">Apply Now</button>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <h3>No scholarships available</h3>
              <p>Be the first to create a scholarship for students!</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Governance Component
  const GovernancePage = () => {
    const [proposals, setProposals] = useState([]);
    const [stats, setStats] = useState(null);

    useEffect(() => {
      loadGovernanceData();
    }, []);

    const loadGovernanceData = async () => {
      try {
        const [proposalsResult, statsResult] = await Promise.all([
          governance_engine.getAllActiveProposals(),
          governance_engine.getGovernanceStats()
        ]);
        setProposals(proposalsResult);
        setStats(statsResult);
      } catch (error) {
        console.error('Error loading governance data:', error);
      }
    };

    return (
      <div className="governance-page">
        <div className="page-header">
          <h2>Community Governance</h2>
          <p>Participate in StudiFi's decentralized decision-making</p>
        </div>

        {stats && (
          <div className="governance-stats">
            <div className="stat-card">
              <h3>{stats.totalProposals}</h3>
              <p>Total Proposals</p>
            </div>
            <div className="stat-card">
              <h3>{stats.activeProposals}</h3>
              <p>Active Proposals</p>
            </div>
            <div className="stat-card">
              <h3>{stats.passedProposals}</h3>
              <p>Passed Proposals</p>
            </div>
            <div className="stat-card">
              <h3>{stats.totalVotes}</h3>
              <p>Total Votes Cast</p>
            </div>
          </div>
        )}

        <div className="proposals-section">
          <h3>Active Proposals</h3>
          {proposals.length > 0 ? (
            <div className="proposals-list">
              {proposals.map((proposal, index) => (
                <div key={index} className="proposal-card">
                  <h4>{proposal.title}</h4>
                  <p className="proposal-type">{Object.keys(proposal.proposalType)[0]}</p>
                  <p className="description">{proposal.description}</p>
                  <div className="voting-info">
                    <div className="votes">
                      <span className="votes-for">For: {proposal.votesFor}</span>
                      <span className="votes-against">Against: {proposal.votesAgainst}</span>
                    </div>
                    <div className="voting-actions">
                      <button className="btn-vote-for">Vote For</button>
                      <button className="btn-vote-against">Vote Against</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <h4>No active proposals</h4>
              <p>Check back later for new governance proposals</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Dashboard Component
  const DashboardPage = () => {
    const [dashboardData, setDashboardData] = useState({
      applicationStats: null,
      portfolioStats: null,
      complianceStats: null,
      treasuryStats: null
    });

    useEffect(() => {
      loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
      try {
        const [appStats, portfolioStats, complianceStats, treasuryStats] = await Promise.all([
          intelligent_credit.getApplicationStats(),
          autonomous_finance.getPortfolioStats(),
          compliance_gateway.getComplianceStats(),
          governance_engine.getTreasuryStats()
        ]);

        setDashboardData({
          applicationStats: appStats,
          portfolioStats: portfolioStats,
          complianceStats: complianceStats,
          treasuryStats: treasuryStats
        });
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      }
    };

    return (
      <div className="dashboard-page">
        <div className="page-header">
          <h2>StudiFi Dashboard</h2>
          <p>Real-time platform analytics and performance metrics</p>
        </div>

        <div className="dashboard-grid">
          {dashboardData.applicationStats && (
            <div className="dashboard-section">
              <h3>Loan Applications</h3>
              <div className="stats-grid">
                <div className="stat-item">
                  <span className="value">{dashboardData.applicationStats.totalApplications}</span>
                  <span className="label">Total Applications</span>
                </div>
                <div className="stat-item">
                  <span className="value">{dashboardData.applicationStats.approvedApplications}</span>
                  <span className="label">Approved</span>
                </div>
                <div className="stat-item">
                  <span className="value">{dashboardData.applicationStats.rejectedApplications}</span>
                  <span className="label">Rejected</span>
                </div>
                <div className="stat-item">
                  <span className="value">{Math.round(dashboardData.applicationStats.averageCreditScore)}</span>
                  <span className="label">Avg Credit Score</span>
                </div>
              </div>
            </div>
          )}

          {dashboardData.portfolioStats && (
            <div className="dashboard-section">
              <h3>Loan Portfolio</h3>
              <div className="stats-grid">
                <div className="stat-item">
                  <span className="value">{dashboardData.portfolioStats.totalLoans}</span>
                  <span className="label">Total Loans</span>
                </div>
                <div className="stat-item">
                  <span className="value">${dashboardData.portfolioStats.totalDisbursed.toLocaleString()}</span>
                  <span className="label">Total Disbursed</span>
                </div>
                <div className="stat-item">
                  <span className="value">${dashboardData.portfolioStats.totalRepaid.toLocaleString()}</span>
                  <span className="label">Total Repaid</span>
                </div>
                <div className="stat-item">
                  <span className="value">{dashboardData.portfolioStats.activeLoans}</span>
                  <span className="label">Active Loans</span>
                </div>
              </div>
            </div>
          )}

          {dashboardData.complianceStats && (
            <div className="dashboard-section">
              <h3>Compliance Status</h3>
              <div className="stats-grid">
                <div className="stat-item">
                  <span className="value">{dashboardData.complianceStats.totalRecords}</span>
                  <span className="label">Total Records</span>
                </div>
                <div className="stat-item">
                  <span className="value">{dashboardData.complianceStats.verifiedRecords}</span>
                  <span className="label">Verified</span>
                </div>
                <div className="stat-item">
                  <span className="value">{dashboardData.complianceStats.pendingRecords}</span>
                  <span className="label">Pending</span>
                </div>
                <div className="stat-item">
                  <span className="value">{dashboardData.complianceStats.totalAuditLogs}</span>
                  <span className="label">Audit Logs</span>
                </div>
              </div>
            </div>
          )}

          {dashboardData.treasuryStats && (
            <div className="dashboard-section">
              <h3>Treasury & Governance</h3>
              <div className="stats-grid">
                <div className="stat-item">
                  <span className="value">${dashboardData.treasuryStats.balance.toLocaleString()}</span>
                  <span className="label">Treasury Balance</span>
                </div>
                <div className="stat-item">
                  <span className="value">${dashboardData.treasuryStats.totalDonations.toLocaleString()}</span>
                  <span className="label">Total Donations</span>
                </div>
                <div className="stat-item">
                  <span className="value">{dashboardData.treasuryStats.totalStakeholders}</span>
                  <span className="label">Stakeholders</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Notification system
  const addNotification = (message, type = 'info') => {
    const notification = {
      id: Date.now(),
      message,
      type,
      timestamp: new Date()
    };
    setNotifications(prev => [...prev, notification]);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, 5000);
  };

  // Render current view
  const renderCurrentView = () => {
    switch (currentView) {
      case 'home':
        return <HomePage />;
      case 'loans':
        return <LoanApplication />;
      case 'scholarships':
        return <ScholarshipsPage />;
      case 'governance':
        return <GovernancePage />;
      case 'dashboard':
        return <DashboardPage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="studifi-app">
      <Navigation />

      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="notifications">
          {notifications.map(notification => (
            <div key={notification.id} className={`notification ${notification.type}`}>
              {notification.message}
            </div>
          ))}
        </div>
      )}

      {/* Main content */}
      <main className="main-content">
        {renderCurrentView()}
      </main>

      {/* Footer */}
      <footer className="studifi-footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4>StudiFi</h4>
            <p>Decentralized Student Finance on Internet Computer</p>
          </div>
          <div className="footer-section">
            <h4>Platform</h4>
            <ul>
              <li>Microloans</li>
              <li>Scholarships</li>
              <li>Governance</li>
              <li>Compliance</li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Technology</h4>
            <ul>
              <li>Internet Computer</li>
              <li>Motoko</li>
              <li>React</li>
              <li>Web3</li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Community</h4>
            <ul>
              <li>Discord</li>
              <li>Twitter</li>
              <li>GitHub</li>
              <li>Forum</li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2025 StudiFi. Built on Internet Computer Protocol.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;