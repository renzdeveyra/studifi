import React, { useState, useEffect } from 'react';
import { autonomous_finance } from 'declarations/autonomous_finance';
import { CreditCard, DollarSign, Calendar, AlertCircle, CheckCircle } from 'lucide-react';


const PaymentForm = ({ loanId, onPaymentSuccess, onCancel, addNotification }) => {
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('ICP');
  const [paymentBreakdown, setPaymentBreakdown] = useState(null);
  const [earlyPayoffInfo, setEarlyPayoffInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [error, setError] = useState(null);

  const paymentMethods = [
    { value: 'ICP', label: 'ICP Token', icon: '🪙' },
    { value: 'BankTransfer', label: 'Bank Transfer', icon: '🏦' },
    { value: 'CreditCard', label: 'Credit Card', icon: '💳' }
  ];

  useEffect(() => {
    if (loanId) {
      loadEarlyPayoffInfo();
    }
  }, [loanId]);

  useEffect(() => {
    if (paymentAmount && parseFloat(paymentAmount) > 0) {
      calculatePaymentBreakdown();
    } else {
      setPaymentBreakdown(null);
    }
  }, [paymentAmount, loanId]);

  const loadEarlyPayoffInfo = async () => {
    try {
      const result = await autonomous_finance.get_early_payoff_info(loanId);
      if (result.Ok) {
        setEarlyPayoffInfo(result.Ok);
      } else {
        console.error('Error fetching early payoff info:', result.Err);
      }
    } catch (error) {
      console.error('Error loading early payoff info:', error);
    }
  };

  const calculatePaymentBreakdown = async () => {
    if (!paymentAmount || !loanId) return;
    
    setCalculating(true);
    try {
      const amount = Math.round(parseFloat(paymentAmount) * 100); // Convert to cents
      const result = await autonomous_finance.calculate_payment_breakdown(loanId, BigInt(amount));
      
      if (result.Ok) {
        setPaymentBreakdown(result.Ok);
        setError(null);
      } else {
        setError('Error calculating payment breakdown: ' + JSON.stringify(result.Err));
        setPaymentBreakdown(null);
      }
    } catch (error) {
      console.error('Error calculating payment breakdown:', error);
      setError('Failed to calculate payment breakdown');
      setPaymentBreakdown(null);
    } finally {
      setCalculating(false);
    }
  };

  const handleSubmitPayment = async (e) => {
    e.preventDefault();
    
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      setError('Please enter a valid payment amount');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const amount = Math.round(parseFloat(paymentAmount) * 100); // Convert to cents
      const methodVariant = { [paymentMethod]: null }; // Create variant object
      
      const result = await autonomous_finance.process_payment(
        loanId,
        BigInt(amount),
        methodVariant
      );

      if (result.Ok) {
        addNotification('Payment processed successfully!', 'success');
        onPaymentSuccess && onPaymentSuccess(result.Ok);
      } else {
        const errorMsg = typeof result.Err === 'object' 
          ? Object.keys(result.Err)[0] + ': ' + Object.values(result.Err)[0]
          : result.Err;
        setError('Payment failed: ' + errorMsg);
        addNotification('Payment failed: ' + errorMsg, 'error');
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      setError('Failed to process payment. Please try again.');
      addNotification('Payment processing failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount) => {
    if (typeof amount === 'bigint') {
      return `$${(Number(amount) / 100).toFixed(2)}`;
    }
    return `$${(Number(amount || 0) / 100).toFixed(2)}`;
  };

  const handleEarlyPayoff = () => {
    if (earlyPayoffInfo) {
      setPaymentAmount((Number(earlyPayoffInfo.totalAmount) / 100).toString());
    }
  };

  return (
    <div className="payment-form-container">
      <div className="payment-form-header">
        <h3>Make a Payment</h3>
        <button onClick={onCancel} className="close-button">×</button>
      </div>

      {error && (
        <div className="error-message">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {earlyPayoffInfo && (
        <div className="early-payoff-info">
          <h4>Early Payoff Option</h4>
          <p>Pay off your entire loan today for {formatAmount(earlyPayoffInfo.totalAmount)}</p>
          <p className="savings">Save {formatAmount(earlyPayoffInfo.interestSavings)} in interest!</p>
          <button onClick={handleEarlyPayoff} className="btn-secondary">
            Use Early Payoff Amount
          </button>
        </div>
      )}

      <form onSubmit={handleSubmitPayment} className="payment-form">
        <div className="form-group">
          <label htmlFor="paymentAmount">Payment Amount</label>
          <div className="amount-input-container">
            <DollarSign size={20} className="amount-icon" />
            <input
              type="number"
              id="paymentAmount"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              placeholder="0.00"
              min="0.01"
              step="0.01"
              required
              className="amount-input"
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="paymentMethod">Payment Method</label>
          <div className="payment-methods">
            {paymentMethods.map((method) => (
              <label key={method.value} className="payment-method-option">
                <input
                  type="radio"
                  name="paymentMethod"
                  value={method.value}
                  checked={paymentMethod === method.value}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <div className="method-content">
                  <span className="method-icon">{method.icon}</span>
                  <span className="method-label">{method.label}</span>
                </div>
              </label>
            ))}
          </div>
        </div>

        {calculating && (
          <div className="calculating-message">
            <div className="spinner"></div>
            <span>Calculating payment breakdown...</span>
          </div>
        )}

        {paymentBreakdown && (
          <div className="payment-breakdown">
            <h4>Payment Breakdown</h4>
            <div className="breakdown-item">
              <span>Principal Payment:</span>
              <span>{formatAmount(paymentBreakdown.principalAmount)}</span>
            </div>
            <div className="breakdown-item">
              <span>Interest Payment:</span>
              <span>{formatAmount(paymentBreakdown.interestAmount)}</span>
            </div>
            <div className="breakdown-item">
              <span>Fees:</span>
              <span>{formatAmount(paymentBreakdown.feesAmount)}</span>
            </div>
            <div className="breakdown-item total">
              <span>Total Payment:</span>
              <span>{formatAmount(paymentBreakdown.totalAmount)}</span>
            </div>
            <div className="breakdown-item">
              <span>Remaining Balance:</span>
              <span>{formatAmount(paymentBreakdown.remainingBalance)}</span>
            </div>
          </div>
        )}

        <div className="form-actions">
          <button type="button" onClick={onCancel} className="btn-secondary">
            Cancel
          </button>
          <button 
            type="submit" 
            className="btn-primary"
            disabled={loading || calculating || !paymentAmount}
          >
            {loading ? (
              <>
                <div className="spinner"></div>
                Processing...
              </>
            ) : (
              <>
                <CreditCard size={20} />
                Process Payment
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PaymentForm;
