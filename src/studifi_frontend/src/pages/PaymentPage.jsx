import React, { useState, useEffect } from 'react';
import './PaymentPage.scss';

const PaymentPage = ({ navigateTo }) => {
  useEffect(() => {
    console.log('PaymentPage mounted successfully');
  }, []);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [notes, setNotes] = useState('');
  const [isPartialPaymentAllowed] = useState(true);

  // Mock loan data - in real app this would come from props or API
  const loanData = {
    outstandingAmount: 45250.00,
    dueDate: 'Dec 15, 2024',
    loanId: 'EDU-2024-001',
    minimumPayment: 500.00
  };

  const paymentMethods = [
    { value: 'bank_transfer', label: 'Bank Transfer', icon: '🏦' },
    { value: 'credit_card', label: 'Credit Card', icon: '💳' },
    { value: 'debit_card', label: 'Debit Card', icon: '💳' },
    { value: 'digital_wallet', label: 'Digital Wallet', icon: '📱' }
  ];

  const processingFee = 25.00;
  const totalAmount = paymentAmount ? parseFloat(paymentAmount) + processingFee : 0;

  const handlePaymentAmountChange = (e) => {
    setPaymentAmount(e.target.value);
  };

  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
  };

  const handleNotesChange = (e) => {
    setNotes(e.target.value);
  };

  const handleBackToDashboard = () => {
    navigateTo('dashboard');
  };

  const handleConfirmPayment = () => {
    // In a real app, this would process the payment
    console.log('Processing payment:', {
      amount: paymentAmount,
      method: paymentMethod,
      notes: notes
    });
    // For now, just show an alert and go back to dashboard
    alert('Payment processing would happen here. Redirecting to dashboard...');
    navigateTo('dashboard');
  };

  return (
    <section className="payment-page-section">
      <div className="container">
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <span onClick={handleBackToDashboard} className="breadcrumb-link">Dashboard</span>
          <span className="breadcrumb-separator">›</span>
          <span className="breadcrumb-current">Make Payment</span>
        </div>

        {/* Page Header */}
        <div className="payment-header">
          <h1 className="page-title">Make a Payment</h1>
          <p className="page-description">Complete your loan payment securely and efficiently</p>
        </div>

        <div className="payment-content">
          {/* Left Side - Payment Summary */}
          <div className="payment-summary">
            <div className="summary-card">
              <div className="summary-icon">💰</div>
              <h3 className="summary-title">Payment Summary</h3>
              
              <div className="summary-details">
                <div className="summary-item">
                  <span className="summary-label">Outstanding Amount</span>
                  <span className="summary-value">${loanData.outstandingAmount.toLocaleString()}</span>
                </div>
                
                <div className="summary-item">
                  <span className="summary-label">Due Date</span>
                  <span className="summary-value due-date">{loanData.dueDate}</span>
                </div>
                
                <div className="summary-item">
                  <span className="summary-label">Loan ID</span>
                  <span className="summary-value">{loanData.loanId}</span>
                </div>
              </div>

              {isPartialPaymentAllowed && (
                <div className="partial-payment-notice">
                  <div className="notice-icon">✅</div>
                  <span className="notice-text">Partial Payment Allowed</span>
                </div>
              )}
            </div>
          </div>

          {/* Right Side - Payment Details Form */}
          <div className="payment-form-section">
            <div className="form-card">
              <h3 className="form-title">Payment Details</h3>
              
              {/* Payment Amount */}
              <div className="form-group">
                <label htmlFor="paymentAmount" className="form-label">Payment Amount</label>
                <div className="amount-input-wrapper">
                  <span className="currency-symbol">₱</span>
                  <input
                    type="number"
                    id="paymentAmount"
                    value={paymentAmount}
                    onChange={handlePaymentAmountChange}
                    placeholder="0.00"
                    min="0.01"
                    step="0.01"
                    className="amount-input"
                  />
                </div>
                <div className="minimum-payment-info">
                  Minimum payment: ₱{loanData.minimumPayment.toFixed(2)}
                </div>
              </div>

              {/* Payment Method */}
              <div className="form-group">
                <label className="form-label">Payment Method</label>
                <div className="payment-methods-grid">
                  {paymentMethods.map((method) => (
                    <div
                      key={method.value}
                      className={`payment-method-card ${paymentMethod === method.value ? 'selected' : ''}`}
                      onClick={() => handlePaymentMethodChange(method.value)}
                    >
                      <span className="method-icon">{method.icon}</span>
                      <span className="method-label">{method.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div className="form-group">
                <label htmlFor="notes" className="form-label">Notes / Memo (Optional)</label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={handleNotesChange}
                  placeholder="Add any additional notes..."
                  className="notes-textarea"
                  rows="4"
                />
              </div>

              {/* Review & Confirm Section */}
              {paymentAmount && paymentMethod && (
                <div className="review-section">
                  <h4 className="review-title">Review & Confirm</h4>
                  
                  <div className="review-details">
                    <div className="review-item">
                      <span className="review-label">Payment Amount</span>
                      <span className="review-value">₱{parseFloat(paymentAmount).toFixed(2)}</span>
                    </div>
                    
                    <div className="review-item">
                      <span className="review-label">Processing Fee</span>
                      <span className="review-value">₱{processingFee.toFixed(2)}</span>
                    </div>
                    
                    <div className="review-item total">
                      <span className="review-label">Total Amount</span>
                      <span className="review-value total-amount">₱{totalAmount.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="form-actions">
                    <button 
                      type="button" 
                      onClick={handleBackToDashboard}
                      className="btn-secondary"
                    >
                      ← Back to Dashboard
                    </button>
                    <button 
                      type="button" 
                      onClick={handleConfirmPayment}
                      className="btn-primary"
                      disabled={!paymentAmount || !paymentMethod}
                    >
                      🔒 Confirm Payment
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="security-notice">
          <div className="security-icon">🛡️</div>
          <div className="security-content">
            <h4 className="security-title">Secure Transaction</h4>
            <p className="security-text">
              All transactions are secured and recorded on-chain. Your payment information is encrypted and protected.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PaymentPage;
