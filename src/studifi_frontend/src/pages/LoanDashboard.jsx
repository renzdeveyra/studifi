import React, { useState, useEffect } from 'react';
import './LoanDashboard.scss';

const LoanDashboard = ({ navigateTo }) => {
  useEffect(() => {
    console.log('LoanDashboard mounted successfully');
  }, []); // Accept navigateTo as a prop
  const [selectedPayment, setSelectedPayment] = useState(null);

  const loanData = {
    id: "ML-2024-001",
    appliedDate: "Jan 18, 2024",
    disbursedDate: "Jan 22, 2024",
    amount: 2500,
    interestRate: 3.5,
    monthlyPayment: 105,
    remainingBalance: 1890,
    status: "Active",
    progressPercentage: 24,
    currentPayment: 6,
    totalPayments: 24
  };

  const paymentHistory = [
    { id: 1, date: "Sep 2024", amount: 105.00, status: "paid", dueDate: "Sep 15" },
    { id: 2, date: "Oct 2024", amount: 105.00, status: "paid", dueDate: "Oct 15" },
    { id: 3, date: "Nov 2024", amount: 105.00, status: "upcoming", dueDate: "Nov 15" }
  ];

  const activityHistory = [
    {
      type: "payment",
      title: "Payment Received",
      description: "Monthly payment of $105.00 processed successfully",
      date: "Sep 14, 2024 - 2:30 PM",
      icon: "💰"
    },
    {
      type: "reminder",
      title: "Payment Reminder Sent",
      description: "Reminder: Payment due in 5 days",
      date: "Oct 10, 2024 - 9:00 AM",
      icon: "⏰"
    },
    {
      type: "disbursement",
      title: "Funds Disbursed",
      description: "Loan amount of $2,500 transferred to student account",
      date: "Jan 22, 2024 - 11:45 AM",
      icon: "💸"
    },
    {
      type: "verification",
      title: "Verification Completed",
      description: "All documents verified and approved",
      date: "Jan 18, 2024 - 3:20 PM",
      icon: "✅"
    },
    {
      type: "application",
      title: "Application Submitted",
      description: "Microloan application submitted for review",
      date: "Jan 18, 2024 - 4:15 PM",
      icon: "📄"
    }
  ];

  const quickActions = [
    { label: "View Loan Contract", icon: "📄", color: "blue", action: () => navigateTo('smart-contract', { contractType: 'loan' }) },
    { label: "Make Payment", icon: "💳", color: "green", action: () => navigateTo('payment') },
    { label: "Payment Calculator", icon: "🧮", color: "teal" },
    { label: "Contact Support", icon: "💬", color: "gray" },
    { label: "Apply for Another", icon: "➕", color: "purple", action: () => navigateTo('applyLoan') }
  ];

  return (
    <div className="loan-dashboard">
      <div className="dashboard-container">
        {/* Header Section */}
        <div className="loan-dashboard-header">
          <div className="loan-info">
            <h1>Loan #{loanData.id}</h1>
            <div className="loan-meta">
              <span>Applied: {loanData.appliedDate}</span>
              <span>•</span>
              <span>Disbursed: {loanData.disbursedDate}</span>
            </div>
          </div>
          <div className="status-badge active">
            {loanData.status}
          </div>
        </div>

        {/* Loan Overview Cards */}
        <div className="overview-cards">
          <div className="overview-card">
            <div className="card-label">Loan Amount</div>
            <div className="card-value">${loanData.amount.toLocaleString()}</div>
          </div>
          <div className="overview-card">
            <div className="card-label">Interest Rate</div>
            <div className="card-value">{loanData.interestRate}%</div>
          </div>
          <div className="overview-card">
            <div className="card-label">Monthly Payment</div>
            <div className="card-value">${loanData.monthlyPayment}</div>
          </div>
          <div className="overview-card highlight">
            <div className="card-label">Remaining Balance</div>
            <div className="card-value">${loanData.remainingBalance.toLocaleString()}</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <h3>Quick Actions</h3>
          <div className="actions-grid">
            {quickActions.map((action, index) => (
              <button 
                key={index} 
                className={`action-btn ${action.color}`}
                onClick={action.action} // Use the action property as onClick handler
              >
                <span className="action-icon">{action.icon}</span>
                {action.label}
              </button>
            ))}
          </div>
        </div>

        {/* Repayment Timeline */}
        <div className="repayment-section">
          <h3>Repayment Timeline</h3>
          <div className="progress-info">
            <span>Progress: {loanData.currentPayment} of {loanData.totalPayments} payments</span>
            <span className="progress-percentage">{loanData.progressPercentage}% Complete</span>
          </div>
          
          <div className="timeline-container">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${loanData.progressPercentage}%` }}
              ></div>
            </div>
            
            <div className="timeline-markers">
              <div className="marker completed">
                <div className="marker-dot"></div>
                <div className="marker-label">
                  <div className="marker-title">Start</div>
                  <div className="marker-date">Mar 22 - Apr</div>
                </div>
              </div>
              <div className="marker completed">
                <div className="marker-dot"></div>
                <div className="marker-label">
                  <div className="marker-title">First Payment</div>
                  <div className="marker-date">Apr 22</div>
                </div>
              </div>
              <div className="marker current">
                <div className="marker-dot"></div>
                <div className="marker-label">
                  <div className="marker-title">Current</div>
                  <div className="marker-date">Oct 24</div>
                </div>
              </div>
              <div className="marker upcoming">
                <div className="marker-dot"></div>
                <div className="marker-label">
                  <div className="marker-title">Final Payment</div>
                  <div className="marker-date">2026</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Payments */}
        <div className="payments-section">
          <h3>Recent Payments</h3>
          <div className="payments-grid">
            {paymentHistory.map((payment) => (
              <div 
                key={payment.id} 
                className={`payment-card ${payment.status}`}
                onClick={() => setSelectedPayment(payment)}
              >
                <div className="payment-header">
                  <span className="payment-month">{payment.date}</span>
                  <div className={`payment-status-dot ${payment.status}`}></div>
                </div>
                <div className="payment-amount">${payment.amount.toFixed(2)}</div>
                <div className="payment-due">
                  {payment.status === 'paid' ? 'Paid on' : 'Due'} {payment.dueDate}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Activity History */}
        <div className="activity-section">
          <h3>Activity History</h3>
          <div className="activity-list">
            {activityHistory.map((activity, index) => (
              <div key={index} className={`activity-item ${activity.type}`}>
                <div className="activity-icon">{activity.icon}</div>
                <div className="activity-content">
                  <div className="activity-title">{activity.title}</div>
                  <div className="activity-description">{activity.description}</div>
                </div>
                <div className="activity-date">{activity.date}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoanDashboard;