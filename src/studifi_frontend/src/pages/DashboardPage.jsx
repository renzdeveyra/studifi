// pages/DashboardPage.jsx
import React, { useState, useEffect } from 'react';
import { intelligent_credit } from 'declarations/intelligent_credit';
import { autonomous_finance } from 'declarations/autonomous_finance';
import { compliance_gateway } from 'declarations/compliance_gateway';
import { governance_engine } from 'declarations/governance_engine';
import { identity_manager } from 'declarations/identity_manager';
import { Wallet, CreditCard, CheckCircle, Calendar, FileText, GraduationCap, Link } from 'lucide-react';
import { AuthClient } from '@dfinity/auth-client'; // Assuming @dfinity/auth-client for principal

const DashboardPage = ({ setCurrentView }) => {
  const [dashboardData, setDashboardData] = useState({
    applicationStats: null,
    portfolioStats: null,
    complianceStats: null,
    treasuryStats: null,
    studentProfile: null
  });
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [authClient, setAuthClient] = useState(null);
  const [principal, setPrincipal] = useState(null);

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
    if (principal) {
      loadDashboardData();
    }
  }, [principal]); // Reload data when principal is available

  const loadDashboardData = async () => {
    setIsLoadingData(true);
    try {
      // Use the obtained principal for getStudentProfile
      const [appStats, portfolioStats, complianceStats, treasuryStats, studentProfileOpt] = await Promise.all([
        intelligent_credit.getApplicationStats(),
        autonomous_finance.getPortfolioStats(),
        compliance_gateway.getComplianceStats(),
        governance_engine.getTreasuryStats(),
        identity_manager.getStudentProfile(principal) // Pass the actual principal
      ]);

      setDashboardData({
        applicationStats: appStats,
        portfolioStats: portfolioStats,
        complianceStats: complianceStats,
        treasuryStats: treasuryStats,
        studentProfile: studentProfileOpt[0] // Assuming getStudentProfile returns an Opt type, so take the first element
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      // Optionally add a notification for data loading error
      // addNotification('Failed to load dashboard data.', 'error');
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
    const totalDisbursed = Number(getStatValue('portfolioStats.totalDisbursed', 0));
    const totalRepaid = Number(getStatValue('portfolioStats.totalRepaid', 0));
    if (typeof totalDisbursed === 'number' && typeof totalRepaid === 'number') {
      return `$${(totalDisbursed - totalRepaid).toLocaleString()}`;
    }
    return 'N/A';
  };

  const getUserName = () => {
    return getStatValue('studentProfile.fullName', 'Student');
  };

const getRepaymentStatus = () => {
  if (dashboardData.portfolioStats) {
    const activeLoans = Number(getStatValue('portfolioStats.activeLoans', 0));
    const defaultedLoans = Number(getStatValue('portfolioStats.defaultedLoans', 0));
    const completedLoans = Number(getStatValue('portfolioStats.completedLoans', 0));

    if (activeLoans > 0) {
      return 'In Progress';
    } else if (defaultedLoans > 0) {
      return 'Defaulted';
    } else if (completedLoans > 0 && activeLoans === 0 && defaultedLoans === 0) {
      return 'Completed';
    } else {
      return 'No Active Loans';
    }
  }
  return 'Loading...';
};

const getScholarshipApplicationStatus = () => {
    // This part would ideally fetch actual scholarship application data for the user.
    // For now, we'll use a placeholder or derive a status from available general stats if possible.
    // Since treasuryStats doesn't directly provide per-user scholarship application status,
    // we'll keep it as 'Pending' or similar placeholder.
    if (dashboardData.treasuryStats) {
        // Example: If there are available funds, maybe imply scholarships are active
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
    // This would require fetching actual scholarship awarded to the user.
    // For now, it remains static as the current API calls don't provide this detail per user.
    return "$2000 awarded";
};

const getScholarshipSponsor = () => {
    // This would require fetching actual scholarship awarded to the user.
    // For now, it remains static as the current API calls don't provide this detail per user.
    return "ABC Foundation";
};

const getScholarshipOverallStatus = () => {
    // This would require fetching actual scholarship awarded to the user.
    // For now, it remains static as the current API calls don't provide this detail per user.
    return "Approved";
};

const getNextDueDate = () => {
    // This would require fetching a specific loan's payment schedule.
    // For now, it remains static as the current API calls don't provide this detail per user.
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

const getComplianceAuditLogs = () => {
    return getStatValue('complianceStats.totalAuditLogs');
};

const getComplianceVerifiedRecords = () => {
    return getStatValue('complianceStats.verifiedRecords');
};

const getCompliancePendingRecords = () => {
    return getStatValue('complianceStats.pendingRecords');
};

const getTreasuryTotalFunds = () => {
    return getStatValue('treasuryStats.totalFunds');
};

const getTreasuryAllocatedFunds = () => {
    return getStatValue('treasuryStats.allocatedFunds');
};

const getTreasuryAvailableFunds = () => {
    return getStatValue('treasuryStats.availableFunds');
};

const getApplicationAverageCreditScore = () => {
    return getStatValue('applicationStats.averageCreditScore');
};

const getPortfolioActiveLoans = () => {
    return getStatValue('portfolioStats.activeLoans');
};

const getPortfolioCompletedLoans = () => {
    return getStatValue('portfolioStats.completedLoans');
};

const getPortfolioDefaultedLoans = () => {
    return getStatValue('portfolioStats.defaultedLoans');
};

const getStudentEmail = () => {
    return getStatValue('studentProfile.email', 'N/A');
};

const getStudentUniversity = () => {
    return getStatValue('studentProfile.university', 'N/A');
};

const getStudentGPA = () => {
    return getStatValue('studentProfile.gpa', 'N/A');
};

const getStudentYearOfStudy = () => {
    return getStatValue('studentProfile.yearOfStudy', 'N/A');
};

const getStudentProgram = () => {
    return getStatValue('studentProfile.program', 'N/A');
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


  return (
    <div className="dashboard-page">
      {/* Profile Header Section */}
      <div className="dashboard-header">
        <div className="profile-section">
          <div className="profile-avatar"></div>
          <div className="profile-info">
            <div className="user-name">{getUserName()}</div> {/* Display user name from student profile */}
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
              <div className="card-subtitle">Approved Amount</div>
              <div className="card-value">${getStatValue('portfolioStats.totalDisbursed')}</div>
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
                <div className="card-title-center">Total Borrowed</div>
              </div>
              <div className="card-value-center">${getStatValue('portfolioStats.totalDisbursed')}</div>
            </div>
            <div className="overview-card">
              <CreditCard className="overview-icon" size={60} />
              <div className="card-info-flex">
                <div className="card-title-center">Remaining Balance</div>
              </div>
              <div className="card-value-center">{getRemainingBalance()}</div>
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

      {/* Scholarship Status Section */}
      <div className="dashboard-section-wrapper">
        <div className="section-header-left">
          <div className="section-title">Scholarship Status</div>
          <p className="section-description">Track your scholarship opportunities.</p>
          <button onClick={() => setCurrentView('scholarships')} className="view-details-button">
            <div className="btn-primary">Browse Scholarships</div>
          </button>
        </div>
        <div className="section-content-right">
          <div className="aid-status-card">
            <div className="card-image-container">
              <img src="https://placehold.co/100x100/d8d8d8/ffffff?text=Scholarship" alt="Scholarship Image" className="card-image" />
            </div>
            <div className="card-details">
              <div className="card-title">Status: {getScholarshipOverallStatus()}</div>
              <div className="card-subtitle">Sponsor: {getScholarshipSponsor()}</div>
              <div className="card-value">{getScholarshipAwardedAmount()}</div>
            </div>
          </div>
          <div className="aid-status-card">
            <div className="card-image-container">
              <img src="https://placehold.co/100x100/d8d8d8/ffffff?text=Applications" alt="Applications Image" className="card-image" />
            </div>
            <div className="card-details">
              <div className="card-title">Loan Applications Pending Review</div>
              <p className="card-text">{getLoanApplicationPendingCount()} applications pending review.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Active Applications Section */}
      <div className="dashboard-section-wrapper">
        <div className="section-header-left">
          <div className="section-title">Active Applications</div>
        </div>
        <div className="section-content-right">
          <div className="active-application-item">
            <FileText className="application-icon" size={40} />
            <div className="application-details">
              <div className="application-title">Student Loan Application</div>
              <div className="application-status">Status: {getLoanStatus()}</div>
            </div>
          </div>
          <div className="active-application-item">
            <GraduationCap className="application-icon" size={40} />
            <div className="application-details">
              <div className="application-title">Scholarship Application</div>
              <div className="application-status">Status: {getScholarshipApplicationStatus()}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Schedule Section */}
      <div className="dashboard-section-wrapper">
        <div className="section-header-left">
          <div className="section-title">Payment Schedule</div>
          <p className="section-description">Stay on top of your payment due dates.</p>
          <div className="payment-actions">
            <button className="btn-secondary">Set AutoPay</button>
            <button className="btn-primary">Make Payment</button>
          </div>
          
        </div>
        <div className="section-content-right">
          <div className="aid-status-card">
            <div className="card-image-container">
              <img src="https://placehold.co/100x100/d8d8d8/ffffff?text=Payment" alt="Payment Image" className="card-image" />
            </div>
            <div className="card-details">
              <div className="card-title">Upcoming Dues</div>
              <p className="card-text">Payment of {getUpcomingPaymentDetails()}</p>
              <div className="card-tag">
                <div className="tag-text">Payment Method: Gcash</div> {/* This remains static for now, as payment method isn't in current stats */} 
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Wallet Integration Section */}
      <div className="dashboard-section-wrapper">
        <div className="section-header-left">
          <div className="section-title">Wallet Integration</div>
          <button className="view-details-button">
            <div className="btn-primary">Connect or Switch Wallet</div>
          </button>
        </div>
        <div className="section-content-right">
          <div className="active-application-item">
            <Link className="application-icon" size={40} />
            <div className="application-details">
              <div className="application-title">Wallet Address</div>
              <div className="application-status">Status: {getWalletVerificationStatus()}</div>
            </div>
            <div className="wallet-address-value">{getWalletAddress()}</div>
          </div>
        </div>
      </div>

      {/* Info Slider Section */}
      <div className="dashboard-section-wrapper">
        <div className="info-slider-container">
          <div className="info-slider-card">
            <p className="info-slider-text">
              Your loan is powered by verified smart contracts. For more information about security, check our audits.
            </p>
            <div className="info-slider-dots">
              <div className="dot active"></div>
              <div className="dot"></div>
              <div className="dot"></div>
              <div className="dot"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;