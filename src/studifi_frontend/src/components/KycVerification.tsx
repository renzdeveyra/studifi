import React, { useState } from 'react';
import { Shield, University, CheckCircle, AlertCircle, Clock, X } from 'lucide-react';
import { useKycVerification, StartVerificationParams } from '../hooks/useKycVerification';
import { vcService, formatVerificationStatus, getStatusColor } from '../services/verifiableCredentials';

interface KycVerificationProps {
  identityManagerActor?: any;
  onVerificationComplete?: (verified: boolean) => void;
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
      
      // Reset form
      setFormData({
        universityName: '',
        studentId: '',
        program: '',
        yearOfStudy: 1,
        expectedGraduation: '',
      });

      if (onVerificationComplete && session.status === 'Completed') {
        onVerificationComplete(true);
      }
    } catch (error) {
      console.error('Verification failed:', error);
    }
  };

  const handleInputChange = (field: keyof StartVerificationParams, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'Failed':
        return <X className="w-5 h-5 text-red-600" />;
      case 'InProgress':
      case 'Pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-3 mb-6">
        <Shield className="w-6 h-6 text-blue-600" />
        <h2 className="text-xl font-semibold text-gray-900">KYC Verification</h2>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span className="text-red-800">{error}</span>
            </div>
            <button
              onClick={clearError}
              className="text-red-600 hover:text-red-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {hasCompletedVerification && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-green-800 font-medium">
              KYC Verification Completed Successfully
            </span>
          </div>
          <p className="text-green-700 text-sm mt-1">
            Your student status has been verified using verifiable credentials.
          </p>
        </div>
      )}

      {!hasCompletedVerification && !hasPendingVerification && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <University className="w-5 h-5 text-blue-600" />
            <span className="text-gray-700">
              Verify your student status with your university
            </span>
          </div>
          <p className="text-gray-600 text-sm mb-4">
            Use Internet Computer's Verifiable Credentials to securely prove your student status 
            without sharing personal information directly with StudiFi.
          </p>
          
          {!showForm ? (
            <button
              onClick={() => setShowForm(true)}
              disabled={isLoading}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Processing...' : 'Start Verification'}
            </button>
          ) : (
            <form onSubmit={handleStartVerification} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  University
                </label>
                <select
                  value={formData.universityName}
                  onChange={(e) => handleInputChange('universityName', e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select your university</option>
                  {universities.map((uni) => (
                    <option key={uni.key} value={uni.key}>
                      {uni.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Student ID
                </label>
                <input
                  type="text"
                  value={formData.studentId}
                  onChange={(e) => handleInputChange('studentId', e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your student ID"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Program/Major
                </label>
                <input
                  type="text"
                  value={formData.program}
                  onChange={(e) => handleInputChange('program', e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Computer Science"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Year of Study
                </label>
                <select
                  value={formData.yearOfStudy}
                  onChange={(e) => handleInputChange('yearOfStudy', parseInt(e.target.value))}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={1}>1st Year</option>
                  <option value={2}>2nd Year</option>
                  <option value={3}>3rd Year</option>
                  <option value={4}>4th Year</option>
                  <option value={5}>5th Year+</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expected Graduation
                </label>
                <input
                  type="text"
                  value={formData.expectedGraduation}
                  onChange={(e) => handleInputChange('expectedGraduation', e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., May 2025"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Starting...' : 'Request Verification'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {sessions.length > 0 && (
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-3">Verification History</h3>
          <div className="space-y-3">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(session.status)}
                    <span className={`font-medium ${getStatusColor(session.status)}`}>
                      {formatVerificationStatus(session.status)}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(Number(session.created_at) / 1_000_000).toLocaleDateString()}
                  </span>
                </div>
                
                <div className="text-sm text-gray-600">
                  <p>University: {session.request.issuer.origin}</p>
                  <p>Credential Type: {session.request.credential_spec.credential_type}</p>
                </div>

                {session.error_message && (
                  <div className="mt-2 text-sm text-red-600">
                    Error: {session.error_message}
                  </div>
                )}

                {session.response && (
                  <div className="mt-2 text-sm text-green-600">
                    ✓ Verified by {session.response.issuer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
