import React, { useState } from 'react';
import { CheckCircle, AlertCircle, Clock, X } from 'lucide-react';
import { useKycVerification, StartVerificationParams } from '../hooks/useKycVerification';
import { vcService, formatVerificationStatus} from '../services/verifiableCredentials';
import './KYCVerification.scss';

interface KycVerificationProps {
  identityManagerActor?: any;
  onVerificationComplete?: (verified: boolean, details?: StartVerificationParams) => void;
  onInternetIdentityLogin?: () => void;
}

export const KycVerification: React.FC<KycVerificationProps> = ({
  identityManagerActor,
  onVerificationComplete,
  onInternetIdentityLogin
}) => {
  const {
    isLoading,
    error,
    sessions,
    currentSession,
    hasCompletedVerification,
    hasPendingVerification,
    startVerification,
    clearError,
  } = useKycVerification(identityManagerActor);

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<StartVerificationParams>({
    universityName: '',
    studentId: '',
    program: '',
    yearOfStudy: 1,
    expectedGraduation: '',
  });

  const universities = vcService.getSupportedUniversities();

  const handleStartVerification = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form data
    if (!formData.universityName || !formData.studentId || !formData.program) {
      alert('Please fill in all required fields');
      return;
    }

    // Check if identity manager actor is available
    if (!identityManagerActor) {
      alert('Please authenticate first to start verification');
      return;
    }

    console.log('Starting verification with data:', formData);
    console.log('Identity manager actor:', identityManagerActor);

    try {
      // Show loading state
      const session = await startVerification(formData);
      setShowForm(false);
      
      // Reset form data after successful submission
      setFormData({
        universityName: '',
        studentId: '',
        program: '',
        yearOfStudy: 1,
        expectedGraduation: '',
      });

      // Show a success message to the user
      const messageDiv = document.createElement('div');
      messageDiv.className = 'verification-alert success';
      messageDiv.innerHTML = `
        <div class="alert-content">
          <div>Verification request submitted successfully! Please wait while we process your credentials.</div>
        </div>
      `;
      document.querySelector('.kyc-verification-container')?.appendChild(messageDiv);
      setTimeout(() => {
        messageDiv.remove();
      }, 5000);

      // Call the completion handler if the session is completed
      if (onVerificationComplete && session.status === 'Completed') {
        onVerificationComplete(true, formData);
      }
    } catch (error) {
      console.error('Verification failed:', error);
      
      // Show error message
      const messageDiv = document.createElement('div');
      messageDiv.className = 'verification-alert error';
      messageDiv.innerHTML = `
        <div class="alert-content">
          <div>Verification failed: ${error}</div>
        </div>
      `;
      document.querySelector('.kyc-verification-container')?.appendChild(messageDiv);
      setTimeout(() => {
        messageDiv.remove();
      }, 5000);
      
      if (onVerificationComplete) {
        onVerificationComplete(false);
      }
    }
  };

  const handleInputChange = (field: keyof StartVerificationParams, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed':
        return <CheckCircle className="status-icon completed" />;
      case 'Failed':
        return <X className="status-icon failed" />;
      case 'InProgress':
      case 'Pending':
        return <Clock className="status-icon pending" />;
      default:
        return <AlertCircle className="status-icon default" />;
    }
  };

  return (
    <div className="kyc-verification-container">
      {!identityManagerActor && (
        <div className="verification-alert error">
          <div className="alert-content">
            <AlertCircle className="alert-icon" />
            <div>
              <div>Please authenticate with Internet Identity first to start verification</div>
              {onInternetIdentityLogin && (
                <button
                  onClick={onInternetIdentityLogin}
                  className="verification-btn primary"
                  style={{ marginTop: '0.5rem' }}
                >
                  Login with Internet Identity
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="verification-alert error">
          <div className="alert-content">
            <AlertCircle className="alert-icon" />
            <span>{error}</span>
          </div>
          <button onClick={clearError} className="alert-close">
            <X />
          </button>
        </div>
      )}

      {hasCompletedVerification && (
        <div className="verification-alert success">
          <div className="alert-content">
            <CheckCircle className="alert-icon" />
            <div>
              <div className="alert-title">KYC Verification Completed Successfully</div>
              <div className="alert-subtitle">
                Your student status has been verified using verifiable credentials.
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="verification-section">
        {!hasCompletedVerification && !hasPendingVerification && (
          <>
            <p className="section-description">
              Use Internet Computer's Verifiable Credentials to securely prove your student status 
              without sharing personal information directly with StudiFi.
            </p>
            
            {!showForm ? (
              <>
                <button
                  onClick={() => setShowForm(true)}
                  disabled={isLoading}
                  className="verification-btn primary"
                >
                  {isLoading ? 'Processing...' : 'Start Verification'}
                </button>
                
                <div className="verification-requirement-message">
                  You must complete this verification step to proceed.
                </div>
              </>
            ) : (
              <form onSubmit={handleStartVerification} className="verification-form">
                <div className="form-grid">
                  <div className="form-group">
                    <label>University</label>
                    <select
                      value={formData.universityName}
                      onChange={(e) => handleInputChange('universityName', e.target.value)}
                      required
                    >
                      <option value="">Select your university</option>
                      {universities.map((uni) => (
                        <option key={uni.key} value={uni.key}>
                          {uni.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Student ID</label>
                    <input
                      type="text"
                      value={formData.studentId}
                      onChange={(e) => handleInputChange('studentId', e.target.value)}
                      required
                      placeholder="Enter your student ID"
                    />
                  </div>

                  <div className="form-group">
                    <label>Program/Major</label>
                    <input
                      type="text"
                      value={formData.program}
                      onChange={(e) => handleInputChange('program', e.target.value)}
                      required
                      placeholder="e.g., Computer Science"
                    />
                  </div>

                  <div className="form-group">
                    <label>Year of Study</label>
                    <select
                      value={formData.yearOfStudy}
                      onChange={(e) => handleInputChange('yearOfStudy', parseInt(e.target.value))}
                      required
                    >
                      <option value={1}>1st Year</option>
                      <option value={2}>2nd Year</option>
                      <option value={3}>3rd Year</option>
                      <option value={4}>4th Year</option>
                      <option value={5}>5th Year+</option>
                    </select>
                  </div>

                  <div className="form-group full-width">
                    <label>Expected Graduation</label>
                    <input
                      type="text"
                      value={formData.expectedGraduation}
                      onChange={(e) => handleInputChange('expectedGraduation', e.target.value)}
                      required
                      placeholder="e.g., May 2025"
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="verification-btn primary"
                  >
                    {isLoading ? 'Starting...' : 'Request Verification'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="verification-btn secondary"
                  >
                    Cancel
                  </button>
                </div>
                
                <div className="verification-requirement-message">
                  You must complete this verification step to proceed.
                </div>
              </form>
            )}
          </>
        )}

        {sessions.length > 0 && (
          <div className="verification-history">
            <h4>Verification History</h4>
            <div className="history-list">
              {sessions.map((session) => (
                <div key={session.id} className="history-item">
                  <div className="history-header">
                    <div className="status-info">
                      {getStatusIcon(session.status)}
                      <span className={`status-text ${session.status.toLowerCase()}`}>
                        {formatVerificationStatus(session.status)}
                      </span>
                    </div>
                    <span className="history-date">
                      {new Date(Number(session.created_at) / 1_000_000).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="history-details">
                    <p>University: {session.request.issuer.origin}</p>
                    <p>Credential Type: {session.request.credential_spec.credential_type}</p>
                  </div>

                  {session.error_message && (
                    <div className="history-error">
                      Error: {session.error_message}
                    </div>
                  )}

                  {session.response && (
                    <div className="history-success">
                      ✓ Verified by {session.response.issuer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
