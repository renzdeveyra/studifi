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
        expectedGraduation: "2025" // Assuming a default value or fetching it
      };

      const financialInfo = {
        monthlyIncome: parseInt(formData.monthlyIncome),
        monthlyExpenses: parseInt(formData.monthlyExpenses),
        existingDebt: parseInt(formData.existingDebt),
        familialIncome: parseInt(formData.familyIncome)
      };

      // Call the intelligent_credit backend function
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
        {/* Header Section - Styled to match the screenshot */}
        <header className="loan-application-header">
          <h1 className="page-title">Loan Application Form</h1>
          <p className="page-subtitle">Please fill in your details to apply for a student loan.</p>
        </header>

        {applicationResult ? (
          // Application Result Section (unchanged from your original code)
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
          // Loan Application Form
          <form onSubmit={handleSubmit} className="loan-application-form-container">
            {/* Form Fields arranged in a grid */}
            <div className="form-grid">
              {/* Loan Details */}
              <div className="form-field-group">
                <label htmlFor="requestedAmount" className="form-label">Requested Amount</label>
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
                <p className="input-hint">Minimum: $100 | Maximum: $50,000</p>
              </div>

              <div className="form-field-group">
                <label htmlFor="purpose" className="form-label">Purpose</label>
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
                <p className="input-hint">Choose the primary purpose for your loan</p>
              </div>

              {/* Academic Information */}
              <div className="form-field-group">
                <label htmlFor="university" className="form-label">University</label>
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

              <div className="form-field-group">
                <label htmlFor="program" className="form-label">Program</label>
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

              <div className="form-field-group">
                <label htmlFor="gpa" className="form-label">GPA</label>
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
                <p className="input-hint">Scale: 0.00 - 4.00</p>
              </div>

              <div className="form-field-group">
                <label htmlFor="yearOfStudy" className="form-label">Year of Study</label>
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

              {/* Financial Information */}
              <div className="form-field-group">
                <label htmlFor="monthlyIncome" className="form-label">Monthly Income</label>
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
                <p className="input-hint">Include part-time work, allowances, etc.</p>
              </div>

              <div className="form-field-group">
                <label htmlFor="monthlyExpenses" className="form-label">Monthly Expenses</label>
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
                <p className="input-hint">Include rent, food, transportation, etc.</p>
              </div>

              <div className="form-field-group">
                <label htmlFor="existingDebt" className="form-label">Existing Debt</label>
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
                <p className="input-hint">Include credit cards, other loans, etc.</p>
              </div>

              <div className="form-field-group">
                <label htmlFor="familyIncome" className="form-label">Family Income</label>
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
                <p className="input-hint">Combined annual income of parents/guardians</p>
              </div>

              {/* Submit Actions - Now directly inside the form-grid */}
              <div className="form-actions-bottom">
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
                                <button type="submit" className="btn-primary" disabled={isLoading}>
                  {isLoading ? '🔄 Processing...' : 'Submit Application'}
                </button>
              </div>
            </div> {/* End of form-grid */}
          </form>
        )}
      </div>
    </section>
  );
};

export default LoanApplication;
