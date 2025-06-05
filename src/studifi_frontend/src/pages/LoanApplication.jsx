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
    familyIncome: '',
    savings: '0',
    employmentStatus: 'PartTime'
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
      // Convert purpose to proper enum variant
      const purposeVariant = (() => {
        switch (formData.purpose) {
          case 'Tuition': return { 'Tuition': null };
          case 'Books & Supplies': return { 'BooksAndSupplies': null };
          case 'Living Expenses': return { 'LivingExpenses': null };
          case 'Technology': return { 'Technology': null };
          case 'Other': return { 'Other': 'General educational expenses' };
          default: return { 'Other': formData.purpose };
        }
      })();

      // Prepare academic info with all required fields
      const academicInfo = {
        gpa: parseFloat(formData.gpa),
        year_of_study: parseInt(formData.yearOfStudy),
        program: formData.program,
        university: formData.university,
        expected_graduation: "2025-06-01", // ISO date format
        major: [], // Optional field
        minor: [], // Optional field
        previous_degrees: [], // Empty array for new students
        honors: [], // Empty array
        extracurricular: [] // Empty array
      };

      // Convert employment status to proper enum variant
      const employmentStatusVariant = (() => {
        switch (formData.employmentStatus) {
          case 'FullTime': return { 'FullTime': null };
          case 'PartTime': return { 'PartTime': null };
          case 'Internship': return { 'Internship': null };
          case 'TeachingAssistant': return { 'TeachingAssistant': null };
          case 'ResearchAssistant': return { 'ResearchAssistant': null };
          case 'Fellowship': return { 'Fellowship': null };
          case 'Unemployed': return { 'Unemployed': null };
          default: return { 'PartTime': null };
        }
      })();

      // Prepare financial info with all required fields (convert to BigInt)
      const financialInfo = {
        monthly_income: BigInt(Math.round(parseFloat(formData.monthlyIncome || 0) * 100)), // Convert to cents
        monthly_expenses: BigInt(Math.round(parseFloat(formData.monthlyExpenses || 0) * 100)),
        existing_debt: BigInt(Math.round(parseFloat(formData.existingDebt || 0) * 100)),
        family_income: BigInt(Math.round(parseFloat(formData.familyIncome || 0) * 100)),
        savings: BigInt(Math.round(parseFloat(formData.savings || 0) * 100)),
        employment_status: employmentStatusVariant,
        credit_history_length_months: 0, // Default for students
        previous_loans: [], // Empty array for new students
        financial_aid: []   // Empty array - no financial aid initially
      };

      console.log('Submitting loan application with data:', {
        requestedAmount: BigInt(Math.round(parseFloat(formData.requestedAmount) * 100)),
        purpose: purposeVariant,
        academicInfo,
        financialInfo
      });

      const result = await intelligent_credit.submit_loan_application(
        BigInt(Math.round(parseFloat(formData.requestedAmount) * 100)), // Convert to cents as BigInt
        purposeVariant,
        academicInfo,
        financialInfo
      );

      console.log('Loan application result:', result);

      // Check for Result type with capital 'O'
      if (result.Ok) {
        setApplicationResult(result.Ok);
        addNotification('Loan application submitted successfully!', 'success');
      } else if (result.Err) {
        const errorMessage = typeof result.Err === 'object'
          ? Object.keys(result.Err)[0] + ': ' + Object.values(result.Err)[0]
          : result.Err;
        console.error('Application submission error:', result.Err);
        addNotification('Error submitting application: ' + errorMessage, 'error');
      } else {
        console.error('Unexpected result format:', result);
        addNotification('Unexpected response format from server', 'error');
      }
    } catch (error) {
      console.error('Error submitting loan application:', error);
      addNotification('Error submitting application: ' + error.message, 'error');
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
            <p><strong>Requested Amount:</strong> ${(Number(applicationResult.requested_amount) / 100).toLocaleString()}</p>
            <p><strong>Purpose:</strong> {typeof applicationResult.purpose === 'object' ? Object.keys(applicationResult.purpose)[0] : applicationResult.purpose}</p>
            {applicationResult.credit_score && applicationResult.credit_score.length > 0 && (
              <div className="credit-score">
                <h4>Credit Assessment</h4>
                <p><strong>Score:</strong> {applicationResult.credit_score[0].score}/1000</p>
                <p><strong>Risk Level:</strong> {Object.keys(applicationResult.credit_score[0].risk_level)[0]}</p>
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
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="savings">Current Savings ($)</label>
                <input
                  type="number"
                  id="savings"
                  name="savings"
                  value={formData.savings}
                  onChange={handleInputChange}
                  required
                  min="0"
                />
              </div>
              <div className="form-group">
                <label htmlFor="employmentStatus">Employment Status</label>
                <select
                  id="employmentStatus"
                  name="employmentStatus"
                  value={formData.employmentStatus}
                  onChange={handleInputChange}
                  required
                >
                  <option value="PartTime">Part-time</option>
                  <option value="FullTime">Full-time</option>
                  <option value="Internship">Internship</option>
                  <option value="TeachingAssistant">Teaching Assistant</option>
                  <option value="ResearchAssistant">Research Assistant</option>
                  <option value="Fellowship">Fellowship</option>
                  <option value="Unemployed">Unemployed</option>
                </select>
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