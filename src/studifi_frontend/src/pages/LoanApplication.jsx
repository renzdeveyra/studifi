import React, { useState } from 'react';
import { intelligent_credit } from 'declarations/intelligent_credit';
import './LoanApplication.scss';

const LoanApplication = ({ addNotification, setIsLoading, isLoading }) => {
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
        expectedGraduation: "2025"
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
    <section className="loan-application-page-section">
      <div className="container">
        {/* Header Section */}
        <header className="loan-application-header">
          <div className="header-content">
            <div className="header-icon">💰</div>
            <div className="header-info">
              <h1 className="page-title">Apply for a Student Loan</h1>
              <p className="page-subtitle">Get instant approval with our AI-powered assessment</p>
            </div>
          </div>
        </header>

        {applicationResult ? (
          // Application Result Section
          <div className="dashboard-section-wrapper">
            <div className="section-header-left">
              <h2 className="section-title">Application Submitted!</h2>
              <p className="section-description">
                Your loan application has been successfully submitted. Here's a summary of your application details.
              </p>
              <div className="payment-actions">
                <button onClick={() => setApplicationResult(null)} className="btn-primary">
                  Apply for Another Loan
                </button>
                <button className="btn-secondary">
                  View Application Status
                </button>
              </div>
            </div>
            <div className="section-content-right">
              <div className="aid-status-card">
                <div className="card-image-container">
                  <div className="card-image">✅</div>
                </div>
                <div className="card-details">
                  <h4 className="card-title">Application #{applicationResult.id}</h4>
                  <p className="card-subtitle">Status:</p>
                  <p className="card-value">{Object.keys(applicationResult.status)[0]}</p>
                  <p className="card-text">
                    <strong>Requested Amount:</strong> ${applicationResult.requestedAmount.toLocaleString()}
                  </p>
                  <p className="card-text">
                    <strong>Purpose:</strong> {applicationResult.purpose}
                  </p>
                  {applicationResult.creditScore && (
                    <div className="card-tag">
                      <span className="tag-text">Credit Score: {applicationResult.creditScore.score}/1000</span>
                      <span className="tag-text">Risk Level: {Object.keys(applicationResult.creditScore.riskLevel)[0]}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="loan-application-form">
            {/* Loan Details Section */}
            <div className="dashboard-section-wrapper">
              <div className="section-header-left">
                <h2 className="section-title">Loan Details</h2>
                <p className="section-description">
                  Tell us how much you need and what you'll use it for. This helps us provide the best loan terms for your situation.
                </p>
              </div>
              <div className="section-content-right">
                <div className="form-group aid-status-card">
                  <div className="card-image-container">
                    <div className="card-image">💵</div>
                  </div>
                  <div className="card-details">
                    <label htmlFor="requestedAmount" className="card-title">Requested Amount</label>
                    <input
                      type="number"
                      id="requestedAmount"
                      name="requestedAmount"
                      value={formData.requestedAmount}
                      onChange={handleInputChange}
                      required
                      min="100"
                      max="50000"
                      className="form-input"
                      placeholder="Enter amount in USD"
                    />
                    <p className="card-text">Minimum: $100 | Maximum: $50,000</p>
                  </div>
                </div>

                <div className="form-group aid-status-card">
                  <div className="card-image-container">
                    <div className="card-image">🎯</div>
                  </div>
                  <div className="card-details">
                    <label htmlFor="purpose" className="card-title">Purpose</label>
                    <select
                      id="purpose"
                      name="purpose"
                      value={formData.purpose}
                      onChange={handleInputChange}
                      required
                      className="form-input"
                    >
                      <option value="">Select purpose</option>
                      <option value="Tuition">Tuition</option>
                      <option value="Books & Supplies">Books & Supplies</option>
                      <option value="Living Expenses">Living Expenses</option>
                      <option value="Technology">Technology</option>
                      <option value="Other">Other</option>
                    </select>
                    <p className="card-text">Choose the primary purpose for your loan</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Academic Information Section */}
            <div className="dashboard-section-wrapper">
              <div className="section-header-left">
                <h2 className="section-title">Academic Information</h2>
                <p className="section-description">
                  Your academic performance and enrollment details help us assess your loan eligibility and determine the best rates.
                </p>
              </div>
              <div className="section-content-right">
                <div className="form-group aid-status-card">
                  <div className="card-image-container">
                    <div className="card-image">🏫</div>
                  </div>
                  <div className="card-details">
                    <label htmlFor="university" className="card-title">University</label>
                    <input
                      type="text"
                      id="university"
                      name="university"
                      value={formData.university}
                      onChange={handleInputChange}
                      required
                      className="form-input"
                      placeholder="Enter your university name"
                    />
                  </div>
                </div>

                <div className="form-group aid-status-card">
                  <div className="card-image-container">
                    <div className="card-image">📚</div>
                  </div>
                  <div className="card-details">
                    <label htmlFor="program" className="card-title">Program</label>
                    <input
                      type="text"
                      id="program"
                      name="program"
                      value={formData.program}
                      onChange={handleInputChange}
                      required
                      className="form-input"
                      placeholder="e.g., Computer Science, Business Administration"
                    />
                  </div>
                </div>

                <div className="form-group aid-status-card">
                  <div className="card-image-container">
                    <div className="card-image">📊</div>
                  </div>
                  <div className="card-details">
                    <label htmlFor="gpa" className="card-title">GPA</label>
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
                      className="form-input"
                      placeholder="e.g., 3.75"
                    />
                    <p className="card-text">Scale: 0.00 - 4.00</p>
                  </div>
                </div>

                <div className="form-group aid-status-card">
                  <div className="card-image-container">
                    <div className="card-image">🎓</div>
                  </div>
                  <div className="card-details">
                    <label htmlFor="yearOfStudy" className="card-title">Year of Study</label>
                    <select
                      id="yearOfStudy"
                      name="yearOfStudy"
                      value={formData.yearOfStudy}
                      onChange={handleInputChange}
                      required
                      className="form-input"
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
            </div>

            {/* Financial Information Section */}
            <div className="dashboard-section-wrapper">
              <div className="section-header-left">
                <h2 className="section-title">Financial Information</h2>
                <p className="section-description">
                  Provide details about your current financial situation to help us determine your loan capacity and repayment ability.
                </p>
              </div>
              <div className="section-content-right">
                <div className="form-group aid-status-card">
                  <div className="card-image-container">
                    <div className="card-image">💼</div>
                  </div>
                  <div className="card-details">
                    <label htmlFor="monthlyIncome" className="card-title">Monthly Income</label>
                    <input
                      type="number"
                      id="monthlyIncome"
                      name="monthlyIncome"
                      value={formData.monthlyIncome}
                      onChange={handleInputChange}
                      required
                      min="0"
                      className="form-input"
                      placeholder="Enter your monthly income"
                    />
                    <p className="card-text">Include part-time work, allowances, etc.</p>
                  </div>
                </div>

                <div className="form-group aid-status-card">
                  <div className="card-image-container">
                    <div className="card-image">💸</div>
                  </div>
                  <div className="card-details">
                    <label htmlFor="monthlyExpenses" className="card-title">Monthly Expenses</label>
                    <input
                      type="number"
                      id="monthlyExpenses"
                      name="monthlyExpenses"
                      value={formData.monthlyExpenses}
                      onChange={handleInputChange}
                      required
                      min="0"
                      className="form-input"
                      placeholder="Enter your monthly expenses"
                    />
                    <p className="card-text">Include rent, food, transportation, etc.</p>
                  </div>
                </div>

                <div className="form-group aid-status-card">
                  <div className="card-image-container">
                    <div className="card-image">⚠️</div>
                  </div>
                  <div className="card-details">
                    <label htmlFor="existingDebt" className="card-title">Existing Debt</label>
                    <input
                      type="number"
                      id="existingDebt"
                      name="existingDebt"
                      value={formData.existingDebt}
                      onChange={handleInputChange}
                      required
                      min="0"
                      className="form-input"
                      placeholder="Enter total existing debt"
                    />
                    <p className="card-text">Include credit cards, other loans, etc.</p>
                  </div>
                </div>

                <div className="form-group aid-status-card">
                  <div className="card-image-container">
                    <div className="card-image">👨‍👩‍👧‍👦</div>
                  </div>
                  <div className="card-details">
                    <label htmlFor="familyIncome" className="card-title">Family Income</label>
                    <input
                      type="number"
                      id="familyIncome"
                      name="familyIncome"
                      value={formData.familyIncome}
                      onChange={handleInputChange}
                      required
                      min="0"
                      className="form-input"
                      placeholder="Enter annual family income"
                    />
                    <p className="card-text">Combined annual income of parents/guardians</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Section */}
            <div className="dashboard-section-wrapper">
              <div className="section-header-left">
                <h2 className="section-title">Submit Application</h2>
                <p className="section-description">
                  Review your information and submit your loan application. You'll receive an instant assessment based on our AI evaluation.
                </p>
              </div>
              <div className="section-content-right">
                <div className="form-actions-card aid-status-card">
                  <div className="card-image-container">
                    <div className="card-image">🚀</div>
                  </div>
                  <div className="card-details">
                    <h4 className="card-title">Ready to Submit?</h4>
                    <p className="card-text">
                      Your application will be processed instantly using our AI-powered assessment system.
                    </p>
                    <div className="form-actions">
                      <button type="submit" className="btn-primary" disabled={isLoading}>
                        {isLoading ? '🔄 Processing...' : '✨ Submit Application'}
                      </button>
                      <button type="button" className="btn-secondary" onClick={() => setFormData({
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
                      })}>
                        🔄 Reset Form
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>
        )}
      </div>
    </section>
  );
};

export default LoanApplication;