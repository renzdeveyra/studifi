import React, { useState } from 'react';
import { intelligent_credit } from 'declarations/intelligent_credit';

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

export default LoanApplication;