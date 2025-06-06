// KYCPage.jsx
import React, { useState } from 'react';
import './KYCPage.scss';
import ConfirmationModal from '../components/ConfirmationModal'; // Import the new modal component

const KYCPage = ({ onSubmissionComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    fullName: '',
    dateOfBirth: '',
    nationality: '',
    contactNumber: '',
    email: '',
    studentId: '',
    idDocument: null,
    selfieWithId: null,
    schoolSelection: '',
    enrollmentCertificate: null,
    walletAddress: '',
    permanentAddress: '',
    billingStatement: null
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  // NEW STATE: To track if terms are agreed via the modal
  const [termsAgreedViaModal, setTermsAgreedViaModal] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileUpload = (field, file) => {
    setFormData(prev => ({
      ...prev,
      [field]: file
    }));
  };

  const nextStep = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // NEW FUNCTION: Handles the click on the terms checkbox
  const handleTermsCheckboxClick = () => {
    // Only open the modal if terms haven't been agreed yet
    if (!termsAgreedViaModal) {
      setIsModalOpen(true);
    }
  };

  // MODIFIED: This function is now called when the user confirms IN THE MODAL
  const handleConfirmSubmission = () => {
    setTermsAgreedViaModal(true); // Set agreement to true
    setIsModalOpen(false); // Close the modal
    // Actual form submission will now happen via the main "Submit Application" button
  };

  // NEW FUNCTION: Handles the final form submission
  const handleFinalSubmission = () => {
    if (termsAgreedViaModal) {
      console.log('Submitting application:', formData);
      if (onSubmissionComplete) {
        onSubmissionComplete();
      }
    } else {
      // This case should ideally not be reached if the button is disabled,
      // but good for fallback or if user tries to bypass
      alert('Please agree to the Terms of Service and Privacy Policy by clicking the checkbox.');
    }
  };

  const steps = [
    'Personal Information',
    'ID Verification',
    'Proof of Enrollment',
    'Blockchain Wallet Link',
    'Address Verification',
    'Review & Confirm'
  ];

  return (
    <div className="kyc-container">
      <section className="kyc-hero">
        <div className="kyc-hero-content">
          <div className="brand-header">
            <h1>StudiFi</h1>
            <span className="brand-subtitle">KYC Process</span>
          </div>

          <div className="verification-intro">
            <h2>Verification Process</h2>
            <p>Complete the KYC process to access student loans and scholarships.</p>
            <p className="security-note">Your data is secure with us.</p>
          </div>

          <div className="progress-container">
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              ></div>
            </div>
            <div className="progress-steps">
              {steps.map((step, index) => (
                <div
                  key={index}
                  className={`progress-step ${index <= currentStep ? 'active' : ''} ${index === currentStep ? 'current' : ''}`}
                >
                  <div className="step-number">{index + 1}</div>
                  <span className="step-label">{step}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="kyc-content">
        <div className="container">
          <div className="kyc-form-container">
            <div className="form-content">
              {currentStep === 0 && (
                <div className="form-step active">
                  <div className="step-header">
                    <h3>Step 1: Personal Information</h3>
                    <p>Please fill in your personal information.</p>
                  </div>

                  <div className="form-grid">
                    <div className="form-group">
                      <label>Full Name</label>
                      <input
                        type="text"
                        placeholder="Enter your full name"
                        value={formData.fullName}
                        onChange={(e) => handleInputChange('fullName', e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label>Date of Birth</label>
                      <input
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label>Nationality</label>
                      <input
                        type="text"
                        placeholder="Enter your nationality"
                        value={formData.nationality}
                        onChange={(e) => handleInputChange('nationality', e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label>Contact Number</label>
                      <input
                        type="tel"
                        placeholder="Enter your contact number"
                        value={formData.contactNumber}
                        onChange={(e) => handleInputChange('contactNumber', e.target.value)}
                      />
                    </div>

                    <div className="form-group full-width">
                      <label>Email</label>
                      <input
                        type="email"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                      />
                    </div>

                    <div className="form-group full-width">
                      <label>Student ID Number (Optional)</label>
                      <input
                        type="text"
                        placeholder="Enter your Student ID"
                        value={formData.studentId}
                        onChange={(e) => handleInputChange('studentId', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 1 && (
                <div className="form-step active">
                  <div className="step-header">
                    <h3>Step 2: ID Verification</h3>
                    <p>Upload a valid government-issued ID</p>
                  </div>

                  <div className="upload-section">
                    <div className="upload-area">
                      <div className="upload-icon">📄</div>
                      <h4>Upload ID</h4>
                      <p>Choose file</p>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => handleFileUpload('idDocument', e.target.files[0])}
                        className="file-input"
                      />
                    </div>

                    <div className="selfie-area">
                      <div className="selfie-icon">🤳</div>
                      <h4>Selfie with ID</h4>
                      <p>Upload a photo holding your ID</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload('selfieWithId', e.target.files[0])}
                        className="file-input"
                      />
                      <button className="selfie-btn" onClick={() => document.querySelector('.selfie-area .file-input').click()}>
                        Upload Photo
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="form-step active">
                  <div className="step-header">
                    <h3>Step 3: Proof of Enrollment</h3>
                    <p>Upload your current Certificate of Enrollment</p>
                  </div>

                  <div className="form-grid">
                    <div className="form-group full-width">
                      <label>Select Your School</label>
                      <input
                        type="text"
                        list="schools"
                        placeholder="Choose your institution or enter manually"
                        value={formData.schoolSelection}
                        onChange={(e) => handleInputChange('schoolSelection', e.target.value)}
                      />
                      <datalist id="schools">
                        <option value="University of the Philippines" />
                        <option value="Ateneo de Manila University" />
                        <option value="De La Salle University" />
                        <option value="Other" />
                      </datalist>
                    </div>

                    <div className="upload-area full-width single-upload">
                      <div className="upload-icon">📋</div>
                      <h4>Upload Certificate</h4>
                      <p>Choose file</p>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => handleFileUpload('enrollmentCertificate', e.target.files[0])}
                        className="file-input"
                      />
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="form-step active">
                  <div className="step-header">
                    <h3>Step 4: Blockchain Wallet Link</h3>
                    <div className="wallet-icon">💼</div>
                    <p>Connect your wallet for secure transactions.</p>
                  </div>

                  <div className="wallet-connection">
                    <div className="wallet-options">
                      <button className="wallet-btn">
                        <span className="wallet-logo">🦊</span>
                        Connect MetaMask
                      </button>
                      <button className="wallet-btn">
                        <span className="wallet-logo">👛</span>
                        Connect WalletConnect
                      </button>
                    </div>

                    <div className="manual-wallet">
                      <div className="form-group full-width">
                        <label>Or enter wallet address manually:</label>
                        <input
                          type="text"
                          placeholder="0x..."
                          value={formData.walletAddress}
                          onChange={(e) => handleInputChange('walletAddress', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div className="form-step active">
                  <div className="step-header">
                    <h3>Step 5: Address Verification</h3>
                    <p>Please verify your address.</p>
                  </div>

                  <div className="form-grid">
                    <div className="form-group full-width">
                      <label>Permanent Address</label>
                      <textarea
                        placeholder="Enter your permanent address"
                        value={formData.permanentAddress}
                        onChange={(e) => handleInputChange('permanentAddress', e.target.value)}
                        rows="2"
                      />
                    </div>

                    <div className="upload-area full-width single-upload">
                      <div className="upload-icon">🧾</div>
                      <h4>Upload Billing Statement (Optional)</h4>
                      <p>Choose file</p>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => handleFileUpload('billingStatement', e.target.files[0])}
                        className="file-input"
                      />
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 5 && (
                <div className="form-step active">
                  <div className="step-header">
                    <h3>Final Step: Summary & Confirmation</h3>
                    <p>Review your details before submission.</p>
                  </div>

                  <div className="summary-section">
                    <div className="summary-row">
                      <div className="summary-card">
                        <h4>Personal Information</h4>
                        <div className="summary-item">
                          <span>Name:</span>
                          <span>{formData.fullName || 'Not provided'}</span>
                        </div>
                        <div className="summary-item">
                          <span>Email:</span>
                          <span>{formData.email || 'Not provided'}</span>
                        </div>
                        <div className="summary-item">
                          <span>Nationality:</span>
                          <span>{formData.nationality || 'Not provided'}</span>
                        </div>
                      </div>

                      <div className="summary-card">
                        <h4>Documents</h4>
                        <div className="summary-item">
                          <span>ID Document:</span>
                          <span>{formData.idDocument ? '✅ Uploaded' : '❌ Missing'}</span>
                        </div>
                        <div className="summary-item">
                          <span>Selfie with ID:</span>
                          <span>{formData.selfieWithId ? '✅ Uploaded' : '❌ Missing'}</span>
                        </div>
                        <div className="summary-item">
                          <span>Enrollment Certificate:</span>
                          <span>{formData.enrollmentCertificate ? '✅ Uploaded' : '❌ Missing'}</span>
                        </div>
                        <div className="summary-item">
                          <span>Wallet Connected:</span>
                          <span>{formData.walletAddress ? '✅ Connected' : '❌ Not connected'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="terms-section">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={termsAgreedViaModal} // Reflects the state
                          onChange={handleTermsCheckboxClick} // Opens modal on click
                        />
                        <span className="checkmark"></span>
                        I agree to the Terms of Service and Privacy Policy
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="form-navigation">
              {currentStep > 0 && (
                <button className="nav-btn prev-btn" onClick={prevStep}>
                  ← Previous
                </button>
              )}

              <div className="step-indicator">
                Step {currentStep + 1} of {steps.length}
              </div>

              {currentStep < 5 ? (
                <button className="nav-btn next-btn" onClick={nextStep}>
                  Next →
                </button>
              ) : (
                <button
                  className="nav-btn submit-btn"
                  onClick={handleFinalSubmission} // Calls the final submission handler
                  disabled={!termsAgreedViaModal} // Button disabled until terms are agreed
                >
                  Submit Application ⚡
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmSubmission}
        formData={formData}
      />
    </div>
  );
};

export default KYCPage;