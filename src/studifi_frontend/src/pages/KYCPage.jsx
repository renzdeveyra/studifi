// KYCPage.jsx
import React, { useState } from 'react';
import './KYCPage.scss';
import ConfirmationModal from '../components/ConfirmationModal';
import { KycVerification } from '../components/KycVerification'; // Import KycVerification

// Assume identityManagerActor is passed as a prop for this example
// In a real app, you might initialize it here or pass it from a higher-level component
const KYCPage = ({ onSubmissionComplete, identityManagerActor, onInternetIdentityLogin }) => { // Add identityManagerActor and onInternetIdentityLogin props
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    fullName: '',
    dateOfBirth: '',
    nationality: '',
    contactNumber: '',
    email: '',
    idDocument: null,
    selfieWithId: null,
    studentVerificationDetails: null // New field to store details from KycVerification
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [termsAgreedViaModal, setTermsAgreedViaModal] = useState(false);
  const [kycVerificationComplete, setKycVerificationComplete] = useState(false); // State for KycVerification status

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

  // Function to display a temporary pop-up message
  const showAppAlert = (message) => {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'app-alert-popup';
    messageDiv.textContent = message;
    document.body.appendChild(messageDiv);
    
    // Add animation
    messageDiv.style.animation = 'fadeInOut 3s ease-in-out';
    
    setTimeout(() => {
      messageDiv.style.opacity = '0';
      setTimeout(() => {
        document.body.removeChild(messageDiv);
      }, 300);
    }, 3000);
  };

  const nextStep = () => {
    // Add validation specific to each step before advancing
    if (currentStep === 2 && !kycVerificationComplete) {
      showAppAlert('Please complete the Student Verification first.');
      return;
    }
    if (currentStep < 3) { // Updated to reflect new total steps (4 steps, 0-3)
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleTermsCheckboxClick = () => {
    // This checkbox now primarily just opens the modal
    if (!termsAgreedViaModal) {
      setIsModalOpen(true);
    }
  };

  const handleConfirmSubmission = () => {
    setTermsAgreedViaModal(true);
    setIsModalOpen(false);
  };

  const handleFinalSubmission = () => {
    if (termsAgreedViaModal) {
      console.log('Submitting application:', formData);
      if (onSubmissionComplete) {
        onSubmissionComplete();
      }
    } else {
      showAppAlert('Please agree to the Terms of Service and Privacy Policy by clicking the checkbox.');
    }
  };

  // Handler for KycVerification completion, now accepting verificationDetails
  const handleKycVerificationComplete = (verified, details) => {
    setKycVerificationComplete(verified);
    if (verified) {
      setFormData(prev => ({
        ...prev,
        studentVerificationDetails: details
      }));
      
      // Show success message
      showAppAlert('Student verification completed successfully!');
      
      // Automatically advance to the next step if verification is successful
      setTimeout(() => {
        setCurrentStep(prev => prev < 3 ? prev + 1 : prev);
      }, 1500);
    } else {
      // Show error message
      showAppAlert('Student verification failed. Please try again.');
    }
  };

  const steps = [
    'Personal Information',
    'ID Verification',
    'Student Verification (VC)', // Updated step name
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
                  </div>
                </div>
              )}

              {currentStep === 1 && (
                <div className="form-step active">
                  <div className="step-header">
                    <h3>Step 2: ID Verification</h3>
                    <p>Upload a valid government-issued ID and a selfie with it.</p>
                  </div>

                  <div className="upload-section">
                    <div className="upload-area">
                      <div className="upload-icon">📄</div>
                      <h4>Upload ID Document</h4>
                      <p>Choose file: {formData.idDocument ? formData.idDocument.name : 'No file chosen'}</p>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => handleFileUpload('idDocument', e.target.files[0])}
                        className="file-input"
                      />
                    </div>

                    <div className="selfie-area">
                      <div className="selfie-icon">🤳</div>
                      <h4>Upload Selfie with ID</h4>
                      <p>Choose file: {formData.selfieWithId ? formData.selfieWithId.name : 'No file chosen'}</p>
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
                    <h3>Step 3: Student Verification (Verifiable Credential)</h3>
                    <p>Complete your student status verification using Verifiable Credentials.</p>
                  </div>
                  {/* Integrate KycVerification component here */}
                  <div className="kyc-verification-wrapper" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <KycVerification
                      identityManagerActor={identityManagerActor}
                      onVerificationComplete={handleKycVerificationComplete}
                      onInternetIdentityLogin={onInternetIdentityLogin}
                    />
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="form-step active">
                  <div className="step-header">
                    <h3>Step 4: Review & Confirm</h3>
                    <p>Please review your information before submitting.</p>
                  </div>
                  <div className="review-summary">
                    <h4>Personal Information</h4>
                    <p><strong>Full Name:</strong> {formData.fullName}</p>
                    <p><strong>Date of Birth:</strong> {formData.dateOfBirth}</p>
                    <p><strong>Nationality:</strong> {formData.nationality}</p>
                    <p><strong>Contact Number:</strong> {formData.contactNumber}</p>
                    <p><strong>Email:</strong> {formData.email}</p>

                    <h4 className="mt-4">ID Verification</h4>
                    <p><strong>ID Document:</strong> {formData.idDocument ? formData.idDocument.name : 'Not uploaded'}</p>
                    <p><strong>Selfie with ID:</strong> {formData.selfieWithId ? formData.selfieWithId.name : 'Not uploaded'}</p>

                    <h4 className="mt-4">Student Verification (VC)</h4>
                    {kycVerificationComplete && formData.studentVerificationDetails ? (
                      <>
                        <p><strong>Status:</strong> Completed</p>
                        <p><strong>University:</strong> {formData.studentVerificationDetails.universityName}</p>
                        <p><strong>Student ID:</strong> {formData.studentVerificationDetails.studentId}</p>
                        <p><strong>Program:</strong> {formData.studentVerificationDetails.program}</p>
                        <p><strong>Year of Study:</strong> {formData.studentVerificationDetails.yearOfStudy}</p>
                        <p><strong>Expected Graduation:</strong> {formData.studentVerificationDetails.expectedGraduation}</p>
                      </>
                    ) : (
                      <p><strong>Status:</strong> Not completed</p>
                    )}

                    <div className="terms-checkbox mt-4">
                      <label className="checkbox-container">
                        <input
                          type="checkbox"
                          checked={termsAgreedViaModal}
                          onChange={handleTermsCheckboxClick}
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

              {currentStep < 3 ? (
                <button className="nav-btn next-btn" onClick={nextStep}>
                  Next →
                </button>
              ) : (
                <button
                  className="nav-btn submit-btn"
                  onClick={handleFinalSubmission}
                  disabled={!termsAgreedViaModal}
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
