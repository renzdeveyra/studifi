import React, { useState, useEffect } from 'react';
import { AuthClient } from '@dfinity/auth-client';
import { intelligent_credit } from 'declarations/intelligent_credit';
import { autonomous_finance } from 'declarations/autonomous_finance';
import { compliance_gateway } from 'declarations/compliance_gateway';
import { governance_engine } from 'declarations/governance_engine';
import { identity_manager } from 'declarations/identity_manager';
import { Wallet, CreditCard, CheckCircle, Calendar, FileText, GraduationCap, Link } from 'lucide-react';


const DashboardPage = ({ setCurrentView, addNotification }) => {
  const [authClient, setAuthClient] = useState(null);
  const [principal, setPrincipal] = useState(null);
  const [dashboardData, setDashboardData] = useState({});
  const [isLoadingData, setIsLoadingData] = useState(false);

  useEffect(() => {
    const initAuthClient = async () => {
      const client = await AuthClient.create();
      setAuthClient(client);
      const identity = client.getIdentity();
      setPrincipal(identity.getPrincipal());
    };
    initAuthClient();
  }, []);

  useEffect(() => {
    if (principal && !principal.isAnonymous()) {
      loadDashboardData();
    }
  }, [principal]); // Reload data when principal is available

  const loadDashboardData = async () => {
    setIsLoadingData(true);
    try {
      // Use the obtained principal for get_student_profile - FIXED METHOD NAMES
      const [appStats, treasuryStats, complianceStats, governanceStats, studentProfileOpt] = await Promise.all([
        intelligent_credit.get_application_stats(),
        autonomous_finance.get_treasury_stats(),
        compliance_gateway.get_platform_stats(),
        governance_engine.get_platform_stats(),
        identity_manager.get_student_profile(principal) // Pass the actual principal
      ]);

      setDashboardData({
        applicationStats: appStats,
        treasuryStats: treasuryStats,
        complianceStats: complianceStats,
        governanceStats: governanceStats,
        studentProfile: studentProfileOpt[0] // Assuming get_student_profile returns an Opt type, so take the first element
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      addNotification('Failed to load dashboard data. Please try again.', 'error');
    } finally {
      setIsLoadingData(false);
    }
  };

  // Helper to safely access nested properties
  const getStatValue = (statPath, defaultValue = 'N/A') => {
    let value = dashboardData;
    for (const key of statPath.split('.')) {
      if (value && typeof value === 'object' && value.hasOwnProperty(key)) {
        value = value[key];
      } else {
        return defaultValue;
      }
    }
    // Handle BigInt conversion if necessary, assuming numbers for display
    if (typeof value === 'bigint') {
      return Number(value).toLocaleString();
    }
    return typeof value === 'number' ? value.toLocaleString() : value;
  };

  const getLoanStatus = () => {
    if (dashboardData.applicationStats) {
      const pending = Number(getStatValue('applicationStats.totalApplications', 0)) -
                      Number(getStatValue('applicationStats.approvedApplications', 0)) -
                      Number(getStatValue('applicationStats.rejectedApplications', 0));
      return pending > 0 ? 'Under Review' : 'No Pending Loans';
    }
    return 'Loading...';
  };

  const getRemainingBalance = () => {
    const totalDisbursed = Number(getStatValue('treasuryStats.totalFunds', 0));
    const totalRepaid = Number(getStatValue('treasuryStats.allocatedFunds', 0));
    if (typeof totalDisbursed === 'number' && typeof totalRepaid === 'number') {
      return `$${(totalDisbursed - totalRepaid).toLocaleString()}`;
    }
    return 'N/A';
  };

  const getUserName = () => {
    return getStatValue('studentProfile.fullName', 'Student');
  };

  const getRepaymentStatus = () => {
    if (dashboardData.treasuryStats) {
      const availableFunds = Number(getStatValue('treasuryStats.availableFunds', 0));
      const allocatedFunds = Number(getStatValue('treasuryStats.allocatedFunds', 0));
      
      if (allocatedFunds > 0) {
        return 'In Progress';
      } else if (availableFunds > allocatedFunds) {
        return 'Completed';
      } else {
        return 'No Active Loans';
      }
    }
    return 'Loading...';
  };

  const getScholarshipApplicationStatus = () => {
    if (dashboardData.treasuryStats) {
      if (Number(getStatValue('treasuryStats.availableFunds', 0)) > 0) {
        return 'Opportunities Available';
      }
    }
    return 'Pending';
  };

  const getUpcomingPaymentDetails = () => {
    // This would require fetching individual loan payment schedules.
    // For now, it remains static as the current API calls don't provide this detail per user.
    return "$500 due on 2023-12-01 (Gcash)";
  };

  const getWalletAddress = () => {
    return principal ? principal.toText() : 'N/A';
  };

  const getWalletVerificationStatus = () => {
    return getStatValue('studentProfile.isVerified') === true ? 'Verified' : 'Not Verified';
  };

  const getScholarshipAwardedAmount = () => {
    return "$2000 awarded";
  };

  const getScholarshipSponsor = () => {
    return "ABC Foundation";
  };

  const getScholarshipOverallStatus = () => {
    return "Approved";
  };

  const getNextDueDate = () => {
    return "2023-12-01";
  };

  const getLoanApplicationPendingCount = () => {
    if (dashboardData.applicationStats) {
      const total = Number(getStatValue('applicationStats.totalApplications', 0));
      const approved = Number(getStatValue('applicationStats.approvedApplications', 0));
      const rejected = Number(getStatValue('applicationStats.rejectedApplications', 0));
      return total - approved - rejected;
    }
    return 0;
  };

  const getKYCStatus = () => {
    const kycStatus = getStatValue('studentProfile.kycStatus', null);
    if (kycStatus) {
      // KYCStatus is a variant, so you might need to extract the key
      if (typeof kycStatus === 'object' && kycStatus !== null) {
        return Object.keys(kycStatus)[0]; // Get the key of the variant (e.g., 'Verified', 'Pending')
      }
    }
    return 'N/A';
  };

  if (isLoadingData) {
    return (
      <div className="dashboard-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      {/* Profile Header Section */}
      <div className="dashboard-header">
        <div className="profile-section">
          <div className="profile-avatar"></div>
          <div className="profile-info">
            <div className="user-name">{getUserName()}</div>
            <p className="welcome-message">Welcome back to your financial dashboard!</p>
          </div>
          <div className="profile-actions">
            <button className="btn-secondary">Settings</button>
            <button className="btn-primary">View Profile</button>
          </div>
        </div>
      </div>

      {/* Current Financial Aid Status Section */}
      <div className="dashboard-section-wrapper">
        <div className="section-header-left">
          <div className="section-title">Current Financial Aid Status</div>
        </div>
        <div className="section-content-right">
          <div className="aid-status-card">
            <div className="card-image-container">
              <img src="https://placehold.co/100x100/d8d8d8/ffffff?text=Loan" alt="Loan Image" className="card-image" />
            </div>
            <div className="card-details">
              <div className="card-title">Current Loan Summary</div>
              <div className="card-subtitle">Treasury Total Funds</div>
              <div className="card-value">${getStatValue('treasuryStats.totalFunds')}</div>
              <div className="card-tag">
                <div className="tag-text">Next Due Date: {getNextDueDate()}</div>
              </div>
            </div>
          </div>
          <div className="aid-status-card">
            <div className="card-image-container">
              <img src="https://placehold.co/100x100/d8d8d8/ffffff?text=Tip" alt="Tip Image" className="card-image" />
            </div>
            <div className="card-details">
              <div className="card-title">Tip of the Day</div>
              <p className="card-text">Your KYC Status: {getKYCStatus()}. {dashboardData.studentProfile?.isVerified === false ? 'Remember to verify your wallet before the 10th to avoid delays.' : 'Your wallet is verified.'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Loan Overview Section */}
      <div className="dashboard-section-wrapper">
        <div className="section-header-left">
          <div className="section-title">Loan Overview</div>
          <button onClick={() => setCurrentView('loans')} className="view-details-button">
            <div className="btn-primary">View Loan Details</div>
          </button>
        </div>
        <div className="section-content-right">
          <div className="overview-grid">
            <div className="overview-card">
              <Wallet className="overview-icon" size={60} />
              <div className="card-info-flex">
                <div className="card-title-center">Total Available</div>
              </div>
              <div className="card-value-center">${getStatValue('treasuryStats.availableFunds')}</div>
            </div>
            <div className="overview-card">
              <CreditCard className="overview-icon" size={60} />
              <div className="card-info-flex">
                <div className="card-title-center">Allocated Funds</div>
              </div>
              <div className="card-value-center">${getStatValue('treasuryStats.allocatedFunds')}</div>
            </div>
            <div className="overview-card">
              <CheckCircle className="overview-icon" size={60} />
              <div className="card-info-flex">
                <div className="card-title-center">Repayment Status</div>
              </div>
              <div className="card-value-center">{getRepaymentStatus()}</div>
            </div>
            <div className="overview-card">
              <Calendar className="overview-icon" size={60} />
              <div className="card-info-flex">
                <div className="card-title-center">Next Payment</div>
              </div>
              <div className="card-value-center">{getUpcomingPaymentDetails()}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
