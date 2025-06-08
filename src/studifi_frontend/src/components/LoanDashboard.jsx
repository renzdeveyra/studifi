import React, { useState, useEffect } from 'react';
import { autonomous_finance } from 'declarations/autonomous_finance';
import { AuthClient } from '@dfinity/auth-client';
import { Wallet, CreditCard, Calendar, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';


const LoanDashboard = ({ addNotification }) => {
  const [principal, setPrincipal] = useState(null);
  const [loans, setLoans] = useState([]);
  const [loanStats, setLoanStats] = useState(null);
  const [treasuryHealth, setTreasuryHealth] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initAuth = async () => {
      const client = await AuthClient.create();
      const identity = client.getIdentity();
      setPrincipal(identity.getPrincipal());
    };
    initAuth();
  }, []);

  useEffect(() => {
    if (principal && !principal.isAnonymous()) {
      loadLoanData();
    }
  }, [principal]);

  const loadLoanData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [myLoans, myStats, treasuryHealthData] = await Promise.all([
        autonomous_finance.get_my_loans(),
        autonomous_finance.get_my_loan_stats(),
        autonomous_finance.get_treasury_health()
      ]);

      // Handle Result types from Rust
      if (myLoans.Ok) {
        setLoans(myLoans.Ok);
      } else {
        console.error('Error fetching loans:', myLoans.Err);
        setError('Failed to load loans: ' + JSON.stringify(myLoans.Err));
      }

      if (myStats.Ok) {
        setLoanStats(myStats.Ok);
      } else {
        console.error('Error fetching loan stats:', myStats.Err);
      }

      if (treasuryHealthData.Ok) {
        setTreasuryHealth(treasuryHealthData.Ok);
      } else {
        console.error('Error fetching treasury health:', treasuryHealthData.Err);
      }

    } catch (error) {
      console.error('Error loading loan data:', error);
      setError('Failed to load loan data. Please try again.');
      addNotification('Failed to load loan data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount) => {
    if (typeof amount === 'bigint') {
      return `$${Number(amount).toLocaleString()}`;
    }
    return `$${Number(amount || 0).toLocaleString()}`;
  };

  const formatPercentage = (percentage) => {
    return `${Number(percentage || 0).toFixed(2)}%`;
  };

  const getLoanStatusColor = (status) => {
    if (!status || typeof status !== 'object') return 'gray';
    const statusKey = Object.keys(status)[0];
    switch (statusKey) {
      case 'Active': return 'green';
      case 'Late': return 'red';
      case 'PaidOff': return 'blue';
      case 'Defaulted': return 'red';
      default: return 'gray';
    }
  };

  const getLoanStatusText = (status) => {
    if (!status || typeof status !== 'object') return 'Unknown';
    return Object.keys(status)[0];
  };

  const getTreasuryHealthStatus = () => {
    if (!treasuryHealth) return 'Unknown';
    
    const utilizationRate = Number(treasuryHealth.utilizationRate || 0);
    if (utilizationRate < 50) return 'Excellent';
    if (utilizationRate < 75) return 'Good';
    if (utilizationRate < 90) return 'Fair';
    return 'Critical';
  };

  const getTreasuryHealthColor = () => {
    const status = getTreasuryHealthStatus();
    switch (status) {
      case 'Excellent': return 'green';
      case 'Good': return 'blue';
      case 'Fair': return 'orange';
      case 'Critical': return 'red';
      default: return 'gray';
    }
  };

  if (loading) {
    return (
      <div className="loan-dashboard">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your loan information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="loan-dashboard">
        <div className="error-container">
          <AlertCircle size={48} color="red" />
          <h3>Error Loading Loans</h3>
          <p>{error}</p>
          <button onClick={loadLoanData} className="btn-primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="loan-dashboard">
      <div className="dashboard-header">
        <h2>Loan Management Dashboard</h2>
        <button onClick={loadLoanData} className="btn-secondary">
          Refresh Data
        </button>
      </div>

      {/* Loan Statistics Overview */}
      {loanStats && (
        <div className="stats-grid">
          <div className="stat-card">
            <Wallet className="stat-icon" size={40} />
            <div className="stat-content">
              <h3>Total Borrowed</h3>
              <p className="stat-value">{formatAmount(loanStats.totalBorrowed)}</p>
            </div>
          </div>
          <div className="stat-card">
            <CreditCard className="stat-icon" size={40} />
            <div className="stat-content">
              <h3>Total Repaid</h3>
              <p className="stat-value">{formatAmount(loanStats.totalRepaid)}</p>
            </div>
          </div>
          <div className="stat-card">
            <TrendingUp className="stat-icon" size={40} />
            <div className="stat-content">
              <h3>Outstanding Balance</h3>
              <p className="stat-value">{formatAmount(loanStats.outstandingBalance)}</p>
            </div>
          </div>
          <div className="stat-card">
            <Calendar className="stat-icon" size={40} />
            <div className="stat-content">
              <h3>Active Loans</h3>
              <p className="stat-value">{Number(loanStats.activeLoans || 0)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Treasury Health Indicator */}
      {treasuryHealth && (
        <div className="treasury-health-card">
          <div className="health-header">
            <h3>Platform Treasury Health</h3>
            <span className={`health-status ${getTreasuryHealthColor()}`}>
              {getTreasuryHealthStatus()}
            </span>
          </div>
          <div className="health-metrics">
            <div className="metric">
              <span>Utilization Rate:</span>
              <span>{formatPercentage(treasuryHealth.utilizationRate)}</span>
            </div>
            <div className="metric">
              <span>Available Funds:</span>
              <span>{formatAmount(treasuryHealth.availableFunds)}</span>
            </div>
            <div className="metric">
              <span>Total Funds:</span>
              <span>{formatAmount(treasuryHealth.totalFunds)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Individual Loans */}
      <div className="loans-section">
        <h3>Your Loans</h3>
        {loans.length === 0 ? (
          <div className="no-loans">
            <p>You don't have any loans yet.</p>
            <button className="btn-primary">Apply for a Loan</button>
          </div>
        ) : (
          <div className="loans-grid">
            {loans.map((loan, index) => (
              <div key={loan.id || index} className="loan-card">
                <div className="loan-header">
                  <h4>Loan #{loan.id || index + 1}</h4>
                  <span className={`loan-status ${getLoanStatusColor(loan.status)}`}>
                    {getLoanStatusText(loan.status)}
                  </span>
                </div>
                <div className="loan-details">
                  <div className="detail-row">
                    <span>Principal Amount:</span>
                    <span>{formatAmount(loan.principalAmount)}</span>
                  </div>
                  <div className="detail-row">
                    <span>Interest Rate:</span>
                    <span>{formatPercentage(loan.interestRate)}</span>
                  </div>
                  <div className="detail-row">
                    <span>Outstanding Balance:</span>
                    <span>{formatAmount(loan.outstandingBalance)}</span>
                  </div>
                  <div className="detail-row">
                    <span>Term:</span>
                    <span>{Number(loan.termMonths || 0)} months</span>
                  </div>
                </div>
                <div className="loan-actions">
                  <button className="btn-secondary">View Details</button>
                  <button className="btn-primary">Make Payment</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LoanDashboard;
