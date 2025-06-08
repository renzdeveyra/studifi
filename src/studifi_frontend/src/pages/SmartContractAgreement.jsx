import React, { useState, useEffect } from 'react';
import './SmartContractAgreement.scss';

const SmartContractAgreement = ({ navigateTo, contractData, contractType = 'loan' }) => {
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [digitalSignature, setDigitalSignature] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    console.log('SmartContractAgreement mounted successfully');
  }, []);

  const handleAcceptContract = async () => {
    if (!acceptedTerms || !acceptedPrivacy || !digitalSignature.trim()) {
      alert('Please complete all required fields and accept all terms.');
      return;
    }

    setIsLoading(true);

    // Simulate blockchain transaction
    setTimeout(() => {
      setIsLoading(false);
      const actionText = contractType === 'scholarship' ? 'Scholarship application submitted to DAO for review!' : 'Loan smart contract successfully executed on Internet Computer blockchain!';
      alert(actionText);
      navigateTo('dashboard');
    }, 3000);
  };

  const handleDeclineContract = () => {
    const actionText = contractType === 'scholarship' ? 'scholarship application' : 'loan agreement';
    if (window.confirm(`Are you sure you want to decline this ${actionText}? This will cancel your application.`)) {
      navigateTo('dashboard');
    }
  };

  // Mock contract data if not provided - dynamic based on type
  const contract = contractData || (contractType === 'scholarship' ? {
    type: 'Scholarship Application',
    amount: '$3,000',
    duration: '1 Academic Year',
    requirements: 'Maintain 3.5 GPA',
    contractAddress: 'rdmx6-jaaaa-aaaah-qcaiq-cai',
    network: 'Internet Computer',
    timestamp: new Date().toISOString(),
    gasFeesICP: '0.0000',
    gasFeesUSD: '$0.00'
  } : {
    type: 'Student Loan Agreement',
    amount: '$5,000',
    interestRate: '3.5%',
    term: '24 months',
    contractAddress: 'rdmx6-jaaaa-aaaah-qcaiq-cai',
    network: 'Internet Computer',
    timestamp: new Date().toISOString(),
    gasFeesICP: '0.0000',
    gasFeesUSD: '$0.00',
    // Student-friendly loan benefits
    benefits: {
      zeroInterest: true,
      zeroInterestDetails: 'Qualified for 0% APR based on academic performance',
      delayedRepayment: true,
      delayedRepaymentDetails: '6-month grace period after graduation',
      earlyRepaymentIncentive: true,
      earlyRepaymentDetails: '5% discount for payments made 30+ days early'
    }
  });

  return (
    <section className="smart-contract-page">
      {/* Debug indicator */}
      <div style={{
        position: 'fixed',
        top: '10px',
        right: '10px',
        background: 'orange',
        color: 'white',
        padding: '10px',
        zIndex: 9999,
        borderRadius: '5px'
      }}>
        Smart Contract Page Loaded
      </div>

      <div className="container">
        {/* Breadcrumb Navigation */}
        <nav className="breadcrumb">
          <span className="breadcrumb-link" onClick={() => navigateTo('dashboard')}>Dashboard</span>
          <span className="breadcrumb-separator">›</span>
          <span className="breadcrumb-current">Smart Contract Agreement</span>
        </nav>

        {/* Page Header */}
        <header className="contract-header">
          <div className="header-content">
            <h1 className="page-title">
              {contractType === 'scholarship' ? 'Scholarship Application' : 'Smart Contract Agreement'}
            </h1>
            <p className="page-description">
              {contractType === 'scholarship'
                ? 'Submit your scholarship application for DAO community review and voting on the Internet Computer blockchain'
                : 'Review and execute your student loan smart contract on the Internet Computer blockchain'
              }
            </p>
          </div>
          <div className="blockchain-status">
            <div className="status-indicator">
              <div className="status-dot"></div>
              <span className="status-text">Internet Computer Network</span>
            </div>
          </div>
        </header>

        {/* Contract Overview */}
        <div className="contract-overview">
          <div className="overview-card">
            <div className="card-header">
              <h2 className="card-title">
                <span className="contract-icon">📄</span>
                {contract.type}
              </h2>
              <div className="contract-badge">Smart Contract</div>
            </div>
            
            <div className="contract-details">
              {contractType === 'scholarship' ? (
                <>
                  <div className="detail-row">
                    <span className="detail-label">Scholarship Amount:</span>
                    <span className="detail-value">{contract.amount}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Duration:</span>
                    <span className="detail-value">{contract.duration}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Requirements:</span>
                    <span className="detail-value">{contract.requirements}</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="detail-row">
                    <span className="detail-label">Loan Amount:</span>
                    <span className="detail-value">{contract.amount}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Interest Rate:</span>
                    <span className="detail-value">{contract.interestRate}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Repayment Term:</span>
                    <span className="detail-value">{contract.term}</span>
                  </div>
                </>
              )}
            </div>

            {/* Loan Benefits Section - Only for loan contracts */}
            {contractType === 'loan' && contract.benefits && (
              <div className="loan-benefits">
                <h3 className="benefits-title">
                  <span className="benefits-icon">🎁</span>
                  Your Loan Benefits
                </h3>
                <div className="benefits-list">
                  {contract.benefits.zeroInterest && (
                    <div className="benefit-item">
                      <div className="benefit-header">
                        <span className="benefit-icon">💰</span>
                        <span className="benefit-name">Zero Interest Rate</span>
                        <span className="benefit-badge">0% APR</span>
                      </div>
                      <p className="benefit-description">{contract.benefits.zeroInterestDetails}</p>
                    </div>
                  )}

                  {contract.benefits.delayedRepayment && (
                    <div className="benefit-item">
                      <div className="benefit-header">
                        <span className="benefit-icon">🎓</span>
                        <span className="benefit-name">Grace Period</span>
                        <span className="benefit-badge">Post-Graduation</span>
                      </div>
                      <p className="benefit-description">{contract.benefits.delayedRepaymentDetails}</p>
                    </div>
                  )}

                  {contract.benefits.earlyRepaymentIncentive && (
                    <div className="benefit-item">
                      <div className="benefit-header">
                        <span className="benefit-icon">⚡</span>
                        <span className="benefit-name">Early Payment Rewards</span>
                        <span className="benefit-badge">5% Discount</span>
                      </div>
                      <p className="benefit-description">{contract.benefits.earlyRepaymentDetails}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Blockchain Information */}
          <div className="blockchain-info">
            <h3 className="info-title">
              <span className="blockchain-icon">⛓️</span>
              Blockchain Details
            </h3>
            <div className="blockchain-details">
              <div className="blockchain-item">
                <span className="item-label">Contract Address:</span>
                <span className="item-value contract-address">
                  {contract.contractAddress}
                  <button className="copy-btn" onClick={() => navigator.clipboard.writeText(contract.contractAddress)}>
                    📋
                  </button>
                </span>
              </div>
              <div className="blockchain-item">
                <span className="item-label">Network:</span>
                <span className="item-value">{contract.network}</span>
              </div>
              <div className="blockchain-item">
                <span className="item-label">Transaction Fees:</span>
                <span className="item-value zero-fees">{contract.gasFeesUSD}</span>
              </div>
              <div className="blockchain-item">
                <span className="item-label">Timestamp:</span>
                <span className="item-value">{new Date(contract.timestamp).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Contract Terms */}
        <div className="contract-terms">
          <h2 className="terms-title">
            {contractType === 'scholarship' ? 'Application Terms & Conditions' : 'Contract Terms & Conditions'}
          </h2>
          <div className="terms-content">
            {contractType === 'scholarship' ? (
              <>
                <div className="terms-section">
                  <h3>1. Scholarship Application</h3>
                  <p>This application will be submitted to the StudiFi DAO for community review. Your academic records, financial need, and project proposals will be evaluated by governance token holders who vote on scholarship awards.</p>
                </div>

                <div className="terms-section">
                  <h3>2. DAO Governance Process</h3>
                  <p>Scholarship funding decisions are made through decentralized governance. Community members holding governance tokens review applications and vote on awards. The voting process is transparent and recorded on the Internet Computer blockchain.</p>
                </div>

                <div className="terms-section">
                  <h3>3. Award Requirements</h3>
                  <p>If awarded, you must maintain the specified academic requirements and provide progress reports to the community. Failure to meet requirements may result in funding suspension as determined by DAO vote.</p>
                </div>

                <div className="terms-section">
                  <h3>4. Community Participation</h3>
                  <p>Scholarship recipients are encouraged to participate in the StudiFi community, sharing knowledge and supporting future applicants. This helps strengthen the decentralized education ecosystem.</p>
                </div>
              </>
            ) : (
              <>
                <div className="terms-section">
                  <h3>1. Loan Agreement</h3>
                  <p>This smart contract governs the individual loan agreement between you and the StudiFi protocol on the Internet Computer blockchain. The loan amount, interest rate, and repayment schedule are fixed terms immutably recorded on-chain.</p>
                </div>

                <div className="terms-section">
                  <h3>2. Fixed Contract Terms</h3>
                  <p>Unlike scholarship programs which involve DAO governance, loan agreements have predetermined, immutable terms. Once executed, the contract terms cannot be changed by community voting or governance decisions.</p>
                </div>

                <div className="terms-section">
                  <h3>3. Blockchain Transparency</h3>
                  <p>All loan transactions, payments, and contract interactions are recorded on the Internet Computer blockchain, ensuring complete transparency and immutability of your agreement terms.</p>
                </div>

                <div className="terms-section">
                  <h3>4. Zero Transaction Fees</h3>
                  <p>Thanks to the Internet Computer's reverse gas model, there are no transaction fees for contract execution, loan disbursement, or repayment transactions.</p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Agreement Section */}
        <div className="agreement-section">
          <h2 className="agreement-title">
            {contractType === 'scholarship' ? 'Application Confirmation' : 'Digital Agreement'}
          </h2>

          <div className="checkbox-group">
            <label className="checkbox-item">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
              />
              <span className="checkmark"></span>
              <span className="checkbox-text">
                {contractType === 'scholarship'
                  ? 'I have read and agree to the scholarship application terms and DAO governance process'
                  : 'I have read and agree to the smart contract terms and conditions'
                }
              </span>
            </label>

            <label className="checkbox-item">
              <input
                type="checkbox"
                checked={acceptedPrivacy}
                onChange={(e) => setAcceptedPrivacy(e.target.checked)}
              />
              <span className="checkmark"></span>
              <span className="checkbox-text">
                I consent to the privacy policy and data processing on the blockchain
              </span>
            </label>
          </div>

          <div className="signature-field">
            <label className="signature-label">Digital Signature:</label>
            <input
              type="text"
              className="signature-input"
              placeholder="Type your full legal name as digital signature"
              value={digitalSignature}
              onChange={(e) => setDigitalSignature(e.target.value)}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="contract-actions">
          <button
            className="btn-decline"
            onClick={handleDeclineContract}
            disabled={isLoading}
          >
            <span className="btn-icon">❌</span>
            {contractType === 'scholarship' ? 'Cancel Application' : 'Decline Contract'}
          </button>

          <button
            className="btn-accept"
            onClick={handleAcceptContract}
            disabled={!acceptedTerms || !acceptedPrivacy || !digitalSignature.trim() || isLoading}
          >
            {isLoading ? (
              <>
                <span className="btn-icon loading">⏳</span>
                {contractType === 'scholarship' ? 'Submitting to DAO...' : 'Executing on Blockchain...'}
              </>
            ) : (
              <>
                <span className="btn-icon">✅</span>
                {contractType === 'scholarship' ? 'Submit Application' : 'Accept & Execute Contract'}
              </>
            )}
          </button>
        </div>

        {/* Security Notice */}
        <div className="security-notice">
          <div className="security-icon">🔒</div>
          <div className="security-content">
            <h3 className="security-title">Blockchain Security</h3>
            <p className="security-text">
              {contractType === 'scholarship'
                ? 'Your scholarship application will be securely stored on the Internet Computer blockchain and reviewed by the DAO community. All voting and decisions are transparent and immutable.'
                : 'This smart contract is deployed on the Internet Computer blockchain, ensuring immutable execution and transparent terms. Your loan agreement will be cryptographically secured and cannot be altered after execution.'
              }
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SmartContractAgreement;
