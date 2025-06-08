import React, { useState } from 'react';
import { CheckCircle, AlertCircle, Clock, X, Shield, Key } from 'lucide-react';
import { useKycVerification, StartVerificationParams } from '../hooks/useKycVerification';
import { vcService, formatVerificationStatus} from '../services/verifiableCredentials';
import './KycVerification.scss';

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
      showAlert('Please fill in all required fields', 'error');
      return;
    }

    // Check if identity manager actor is available
    if (!identityManagerActor) {
      showAlert('Please authenticate first to start verification', 'error');
      return;
    }

    console.log('Starting verification with data:', formData);

    try {
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

      showAlert('Verification request submitted successfully! Please wait while we process your credentials.', 'success');

      // Call the completion handler if the session is completed
      if (onVerificationComplete && session.status === 'Completed') {
        onVerificationComplete(true, formData);
      }
    } catch (error) {
      console.error('Verification failed:', error);
      showAlert(`Verification failed: ${error}`, 'error');
      
      if (onVerificationComplete) {
        onVerificationComplete(false);
      }
    }
  };

  const showAlert = (message: string, type: 'success' | 'error') => {
    // Create and show alert
    const alertElement = document.createElement('div');
    alertElement.className = `verification-alert ${type}`;
    alertElement.innerHTML = `
      <div class="alert-content">
        <div class="alert-text">
          <div class="alert-title">${type === 'success' ? 'Success' : 'Error'}</div>
          <div class="alert-subtitle">${message}</div>
        </div>
      </div>
      <button class="alert-close" onclick="this.parentElement.remove()">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    `;

    const container = document.querySelector('.kyc-verification-container');
    if (container) {
      container.insertBefore(alertElement, container.firstChild);
      setTimeout(() => {
        if (alertElement.parentNode) {
          alertElement.remove();
        }
      }, 5000);
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

  // If not authenticated, show authentication section
  if (!identityManagerActor) {
    return (
      <div className="kyc-verification-container">
        <div className="authentication-required-section">
          <div className="auth-header">
            <Shield className="auth-icon" size={48} />
            <p>To proceed with student verification, you must first authenticate using Internet Identity</p>
          </div>
          
          <div className="auth-benefits">
            <div className="benefit-item">
              <Key className="benefit-icon" size={20} />
              <span>Secure & Private</span>
            </div>
            <div className="benefit-item">
              <Shield className="benefit-icon" size={20} />
              <span>Decentralized Identity</span>
            </div>
            <div className="benefit-item">
              <CheckCircle className="benefit-icon" size={20} />
              <span>No Passwords Required</span>
            </div>
          </div>

          <div className="auth-action">
            {onInternetIdentityLogin ? (
              <button
                onClick={onInternetIdentityLogin}
                className="verification-btn primary large"
              >
                <Key className="btn-icon" size={20} />
                Login with Internet Identity
              </button>
            ) : (
              <div className="auth-fallback">
                <AlertCircle className="alert-icon" />
                <p>Internet Identity login function not available. Please contact support.</p>
              </div>
            )}
          </div>

        </div>
      </div>
    );
  }

  // If authenticated, show the main verification interface
  return (
    <div className="kyc-verification-container">
      {error && (
        <div className="verification-alert error">
          <div className="alert-content">
            <AlertCircle className="alert-icon" />
            <div className="alert-text">
              <div className="alert-title">Verification Error</div>
              <div className="alert-subtitle">{error}</div>
            </div>
          </div>
          <button onClick={clearError} className="alert-close">
            <X size={14} />
          </button>
        </div>
      )}

      {hasCompletedVerification && (
        <div className="verification-alert success">
          <div className="alert-content">
            <CheckCircle className="alert-icon" />
            <div className="alert-text">
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
            <div className="authenticated-header">
              <CheckCircle className="auth-success-icon" size={20} />
              <span className="auth-status">Authenticated with Internet Identity</span>
            </div>
            
            {!showForm ? (
              <button
                onClick={() => setShowForm(true)}
                disabled={isLoading}
                className="verification-btn primary"
              >
                {isLoading ? 'Processing...' : 'Start Student Verification'}
              </button>
            ) : (
              <form onSubmit={handleStartVerification} className="verification-form">
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="university">University</label>
                    <select
                      id="university"
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
                    <label htmlFor="studentId">Student ID</label>
                    <input
                      id="studentId"
                      type="text"
                      value={formData.studentId}
                      onChange={(e) => handleInputChange('studentId', e.target.value)}
                      required
                      placeholder="Enter your student ID"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="program">Program/Major</label>
                    <input
                      id="program"
                      type="text"
                      value={formData.program}
                      onChange={(e) => handleInputChange('program', e.target.value)}
                      required
                      placeholder="e.g., Computer Science"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="yearOfStudy">Year of Study</label>
                    <select
                      id="yearOfStudy"
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
                    <label htmlFor="graduation">Expected Graduation</label>
                    <input
                      id="graduation"
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
              </form>
            )}

            <div className="verification-requirement-message">
              You must complete this verification step to proceed.
            </div>
          </>
        )}

        {hasPendingVerification && !hasCompletedVerification && (
          <div className="verification-alert">
            <div className="alert-content">
              <Clock className="alert-icon" />
              <div className="alert-text">
                <div className="alert-title">Verification In Progress</div>
                <div className="alert-subtitle">
                  Your verification request is being processed. Please wait...
                </div>
              </div>
            </div>
          </div>
        )}

        {sessions.length > 0 && (
          <div className="verification-history">
            <h4>Verification History</h4>
            <div className="history-list">
              {sessions.slice().reverse().map((session) => (
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
                    <p><strong>University:</strong> {session.request.issuer.origin}</p>
                    <p><strong>Credential Type:</strong> {session.request.credential_spec.credential_type}</p>
                  </div>

                  {session.error_message && (
                    <div className="history-error">
                      <strong>Error:</strong> {session.error_message}
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