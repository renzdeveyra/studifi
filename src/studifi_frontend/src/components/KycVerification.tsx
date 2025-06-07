import React, { useState } from 'react';
import { Shield, University, CheckCircle, AlertCircle, Clock, X } from 'lucide-react';
import { useKycVerification, StartVerificationParams } from '../hooks/useKycVerification';
import { vcService, formatVerificationStatus} from '../services/verifiableCredentials';
import './KYCVerification.scss';

interface KycVerificationProps {
  identityManagerActor?: any;
  onVerificationComplete?: (verified: boolean, details?: StartVerificationParams) => void;
}

export const KycVerification: React.FC<KycVerificationProps> = ({
  identityManagerActor,
  onVerificationComplete
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
    
    try {
      const session = await startVerification(formData);
      setShowForm(false);
      
      setFormData({
        universityName: '',
        studentId: '',
        program: '',
        yearOfStudy: 1,
        expectedGraduation: '',
      });

      if (onVerificationComplete && session.status === 'Completed') {
        onVerificationComplete(true, formData);
      }
    } catch (error) {
      console.error('Verification failed:', error);
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
      <div className="verification-header">
        <div className="header-icon">
          <Shield />
        </div>
        <h3>KYC Verification</h3>
      </div>

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
            <div className="section-header">
              <University className="section-icon" />
              <span>Verify your student status with your university</span>
            </div>
            
            <p className="section-description">
              Use Internet Computer's Verifiable Credentials to securely prove your student status 
              without sharing personal information directly with StudiFi.
            </p>
            
            {!showForm ? (
              <button
                onClick={() => setShowForm(true)}
                disabled={isLoading}
                className="verification-btn primary"
              >
                {isLoading ? 'Processing...' : 'Start Verification'}
              </button>
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