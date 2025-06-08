import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, Shield, University, CreditCard, ArrowRight } from 'lucide-react';
import { KycVerification } from './KycVerification';

interface RegistrationSuccessProps {
  userData: {
    fullName: string;
    email: string;
    university: string;
    studentId: string;
    program: string;
    yearOfStudy: number;
  };
  onContinueToDashboard: () => void;
  identityManagerActor?: any;
}

export const RegistrationSuccess: React.FC<RegistrationSuccessProps> = ({
  userData,
  onContinueToDashboard,
  identityManagerActor
}) => {
  const [currentStep, setCurrentStep] = useState<'welcome' | 'kyc' | 'complete'>('welcome');
  const [kycCompleted, setKycCompleted] = useState(false);

  const handleKycComplete = (verified: boolean) => {
    setKycCompleted(verified);
    setCurrentStep('complete');
  };

  const handleStartKyc = () => {
    setCurrentStep('kyc');
  };

  const renderWelcomeStep = () => (
    <div className="text-center space-y-6">
      <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
        <CheckCircle className="w-12 h-12 text-green-600" />
      </div>
      
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome to StudiFi, {userData.fullName}!
        </h2>
        <p className="text-lg text-gray-600">
          Your account has been created successfully. Let's complete your verification to unlock all features.
        </p>
      </div>

      {/* Account Summary */}
      <div className="bg-gray-50 rounded-lg p-6 text-left max-w-md mx-auto">
        <h3 className="font-semibold text-gray-900 mb-4">Account Summary</h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Name:</span>
            <span className="font-medium">{userData.fullName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Email:</span>
            <span className="font-medium">{userData.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">University:</span>
            <span className="font-medium">{userData.university}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Student ID:</span>
            <span className="font-medium">{userData.studentId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Program:</span>
            <span className="font-medium">{userData.program}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Year:</span>
            <span className="font-medium">{userData.yearOfStudy}</span>
          </div>
        </div>
      </div>

      {/* Next Steps */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-900">Next Steps</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {/* Step 1: KYC Verification */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
            <h4 className="font-medium text-gray-900 mb-2">Complete KYC</h4>
            <p className="text-sm text-gray-600 mb-3">
              Verify your identity to access all StudiFi features
            </p>
            <div className="flex items-center justify-center text-xs text-orange-600">
              <Clock className="w-4 h-4 mr-1" />
              Pending
            </div>
          </div>

          {/* Step 2: University Verification */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 text-center opacity-50">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <University className="w-6 h-6 text-gray-400" />
            </div>
            <h4 className="font-medium text-gray-900 mb-2">University Verification</h4>
            <p className="text-sm text-gray-600 mb-3">
              Verify your student status with your university
            </p>
            <div className="flex items-center justify-center text-xs text-gray-400">
              <Clock className="w-4 h-4 mr-1" />
              Waiting
            </div>
          </div>

          {/* Step 3: Access Financial Services */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 text-center opacity-50">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <CreditCard className="w-6 h-6 text-gray-400" />
            </div>
            <h4 className="font-medium text-gray-900 mb-2">Financial Services</h4>
            <p className="text-sm text-gray-600 mb-3">
              Apply for loans, scholarships, and more
            </p>
            <div className="flex items-center justify-center text-xs text-gray-400">
              <Clock className="w-4 h-4 mr-1" />
              Waiting
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <button
          onClick={handleStartKyc}
          className="w-full max-w-md mx-auto bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
        >
          <Shield className="mr-2 h-5 w-5" />
          Start KYC Verification
        </button>
        
        <button
          onClick={onContinueToDashboard}
          className="w-full max-w-md mx-auto bg-gray-100 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center"
        >
          Skip for Now - Go to Dashboard
          <ArrowRight className="ml-2 h-4 w-4" />
        </button>
      </div>
    </div>
  );

  const renderCompleteStep = () => (
    <div className="text-center space-y-6">
      <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
        <CheckCircle className="w-12 h-12 text-green-600" />
      </div>
      
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          {kycCompleted ? 'Verification Complete!' : 'Registration Complete!'}
        </h2>
        <p className="text-lg text-gray-600">
          {kycCompleted 
            ? 'Your identity has been verified. You now have full access to StudiFi.'
            : 'Your account is set up. You can complete verification later from your dashboard.'
          }
        </p>
      </div>

      {kycCompleted && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 max-w-md mx-auto">
          <div className="flex items-center justify-center mb-2">
            <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
            <span className="font-medium text-green-800">Verification Status</span>
          </div>
          <p className="text-sm text-green-700">
            ✅ Identity Verified<br />
            ✅ Student Status Confirmed<br />
            ✅ Ready for Financial Services
          </p>
        </div>
      )}

      <div className="space-y-3">
        <h3 className="text-xl font-semibold text-gray-900">What's Next?</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto text-left">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">🎓 Apply for Loans</h4>
            <p className="text-sm text-gray-600">
              Access competitive student loans with flexible terms
            </p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">💰 Find Scholarships</h4>
            <p className="text-sm text-gray-600">
              Discover scholarships that match your profile
            </p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">🏛️ Participate in Governance</h4>
            <p className="text-sm text-gray-600">
              Vote on platform decisions and earn rewards
            </p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">📊 Track Your Progress</h4>
            <p className="text-sm text-gray-600">
              Monitor your financial health and academic progress
            </p>
          </div>
        </div>
      </div>

      <button
        onClick={onContinueToDashboard}
        className="w-full max-w-md mx-auto bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
      >
        Go to Dashboard
        <ArrowRight className="ml-2 h-5 w-5" />
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {currentStep === 'welcome' && renderWelcomeStep()}
        
        {currentStep === 'kyc' && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Identity Verification</h2>
              <p className="text-gray-600">
                Complete your KYC verification to unlock all StudiFi features
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-lg p-6">
              <KycVerification
                identityManagerActor={identityManagerActor}
                onVerificationComplete={handleKycComplete}
              />
            </div>
            
            <div className="text-center">
              <button
                onClick={() => setCurrentStep('welcome')}
                className="text-gray-600 hover:text-gray-800"
              >
                ← Back to Welcome
              </button>
            </div>
          </div>
        )}
        
        {currentStep === 'complete' && renderCompleteStep()}
      </div>
    </div>
  );
};
