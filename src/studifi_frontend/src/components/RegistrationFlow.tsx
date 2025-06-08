import React, { useState, useEffect } from 'react';
import { AuthClient } from '@dfinity/auth-client';
import { identity_manager } from '../../../declarations/identity_manager';
import { User, Shield, CheckCircle, AlertCircle, ArrowRight, ArrowLeft } from 'lucide-react';

interface RegistrationStep {
  id: number;
  title: string;
  description: string;
  completed: boolean;
}

interface UserRegistrationData {
  // Personal Information
  fullName: string;
  email: string;
  dateOfBirth: string;
  phoneNumber: string;
  
  // University Information
  university: string;
  studentId: string;
  program: string;
  yearOfStudy: number;
  expectedGraduation: string;
  
  // Additional Documents
  additionalDocuments: string[];
}

interface RegistrationFlowProps {
  onRegistrationComplete: (userData: UserRegistrationData) => void;
  onCancel: () => void;
}

export const RegistrationFlow: React.FC<RegistrationFlowProps> = ({
  onRegistrationComplete,
  onCancel
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [authClient, setAuthClient] = useState<AuthClient | null>(null);
  const [principal, setPrincipal] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [registrationData, setRegistrationData] = useState<UserRegistrationData>({
    fullName: '',
    email: '',
    dateOfBirth: '',
    phoneNumber: '',
    university: '',
    studentId: '',
    program: '',
    yearOfStudy: 1,
    expectedGraduation: '',
    additionalDocuments: []
  });

  const steps: RegistrationStep[] = [
    {
      id: 1,
      title: 'Identity Creation',
      description: 'Create your Internet Identity',
      completed: !!principal && !principal.isAnonymous()
    },
    {
      id: 2,
      title: 'Personal Information',
      description: 'Provide your personal details',
      completed: !!(registrationData.fullName && registrationData.email)
    },
    {
      id: 3,
      title: 'University Verification',
      description: 'Verify your student status',
      completed: !!(registrationData.university && registrationData.studentId)
    },
    {
      id: 4,
      title: 'KYC Verification',
      description: 'Complete identity verification',
      completed: false
    }
  ];

  useEffect(() => {
    initAuthClient();
  }, []);

  const initAuthClient = async () => {
    try {
      const client = await AuthClient.create();
      setAuthClient(client);
      
      if (await client.isAuthenticated()) {
        const identity = client.getIdentity();
        setPrincipal(identity.getPrincipal());
      }
    } catch (error) {
      console.error('Failed to initialize auth client:', error);
      setError('Failed to initialize authentication');
    }
  };

  const handleInternetIdentityLogin = async () => {
    if (!authClient) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      await authClient.login({
        identityProvider: import.meta.env.DFX_NETWORK === "local"
          ? `http://localhost:4943/?canisterId=${import.meta.env.CANISTER_ID_INTERNET_IDENTITY || 'rdmx6-jaaaa-aaaaa-aaadq-cai'}`
          : "https://identity.ic0.app",
        onSuccess: () => {
          const identity = authClient.getIdentity();
          setPrincipal(identity.getPrincipal());
          setCurrentStep(2); // Move to personal information step
        },
        onError: (error) => {
          console.error('Login failed:', error);
          setError('Failed to authenticate with Internet Identity');
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      setError('Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof UserRegistrationData, value: string | number | string[]) => {
    setRegistrationData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!principal && !principal.isAnonymous();
      case 2:
        return !!(registrationData.fullName && registrationData.email && registrationData.dateOfBirth);
      case 3:
        return !!(registrationData.university && registrationData.studentId && registrationData.program);
      default:
        return false;
    }
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const handlePreviousStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmitRegistration = async () => {
    if (!principal || !authClient) {
      setError('Authentication required');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Create verification request for the backend
      const verificationRequest = {
        student_id: registrationData.studentId,
        university: registrationData.university,
        email: registrationData.email,
        full_name: registrationData.fullName,
        program: registrationData.program,
        year_of_study: registrationData.yearOfStudy,
        expected_graduation: registrationData.expectedGraduation,
        additional_documents: registrationData.additionalDocuments
      };

      // Create student profile on the backend
      const result = await identity_manager.create_student_profile(verificationRequest);
      
      if ('Err' in result) {
        throw new Error(typeof result.Err === 'string' ? result.Err : JSON.stringify(result.Err));
      }

      // Registration successful
      onRegistrationComplete(registrationData);
      
    } catch (error) {
      console.error('Registration failed:', error);
      setError(`Registration failed: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <User className="mx-auto h-16 w-16 text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Create Your Digital Identity</h3>
              <p className="text-gray-600 mb-6">
                First, you'll need to create an Internet Identity to securely access StudiFi.
                This creates a unique, anonymous identity that only you control.
              </p>
            </div>
            
            {!principal || principal.isAnonymous() ? (
              <button
                onClick={handleInternetIdentityLogin}
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <Shield className="mr-2 h-5 w-5" />
                    Create Internet Identity
                  </>
                )}
              </button>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                  <span className="text-green-800">Identity created successfully!</span>
                </div>
                <p className="text-sm text-green-600 mt-1">
                  Principal: {principal.toString()}
                </p>
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold mb-2">Personal Information</h3>
              <p className="text-gray-600">Please provide your personal details for verification.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={registrationData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your full name"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={registrationData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your email"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Birth *
                </label>
                <input
                  type="date"
                  value={registrationData.dateOfBirth}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={registrationData.phoneNumber}
                  onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your phone number"
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold mb-2">University Information</h3>
              <p className="text-gray-600">Provide your university and academic details.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  University *
                </label>
                <select
                  value={registrationData.university}
                  onChange={(e) => handleInputChange('university', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select your university</option>
                  <option value="MIT">Massachusetts Institute of Technology</option>
                  <option value="Stanford">Stanford University</option>
                  <option value="Harvard">Harvard University</option>
                  <option value="Berkeley">UC Berkeley</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Student ID *
                </label>
                <input
                  type="text"
                  value={registrationData.studentId}
                  onChange={(e) => handleInputChange('studentId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your student ID"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Program/Major *
                </label>
                <input
                  type="text"
                  value={registrationData.program}
                  onChange={(e) => handleInputChange('program', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Computer Science"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Year of Study *
                </label>
                <select
                  value={registrationData.yearOfStudy}
                  onChange={(e) => handleInputChange('yearOfStudy', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value={1}>1st Year</option>
                  <option value={2}>2nd Year</option>
                  <option value={3}>3rd Year</option>
                  <option value={4}>4th Year</option>
                  <option value={5}>5th Year+</option>
                </select>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expected Graduation
                </label>
                <input
                  type="text"
                  value={registrationData.expectedGraduation}
                  onChange={(e) => handleInputChange('expectedGraduation', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., May 2025"
                />
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Shield className="mx-auto h-16 w-16 text-green-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Complete Registration</h3>
              <p className="text-gray-600">
                Review your information and complete the registration process.
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <h4 className="font-medium text-gray-900">Registration Summary</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div><span className="font-medium">Name:</span> {registrationData.fullName}</div>
                <div><span className="font-medium">Email:</span> {registrationData.email}</div>
                <div><span className="font-medium">University:</span> {registrationData.university}</div>
                <div><span className="font-medium">Student ID:</span> {registrationData.studentId}</div>
                <div><span className="font-medium">Program:</span> {registrationData.program}</div>
                <div><span className="font-medium">Year:</span> {registrationData.yearOfStudy}</div>
              </div>
            </div>
            
            <button
              onClick={handleSubmitRegistration}
              disabled={isLoading}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-5 w-5" />
                  Complete Registration
                </>
              )}
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                step.completed 
                  ? 'bg-green-600 border-green-600 text-white' 
                  : currentStep === step.id
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'bg-white border-gray-300 text-gray-500'
              }`}>
                {step.completed ? (
                  <CheckCircle className="w-6 h-6" />
                ) : (
                  <span className="text-sm font-medium">{step.id}</span>
                )}
              </div>
              {index < steps.length - 1 && (
                <div className={`w-full h-1 mx-4 ${
                  step.completed ? 'bg-green-600' : 'bg-gray-300'
                }`} />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2">
          {steps.map((step) => (
            <div key={step.id} className="text-center flex-1">
              <p className="text-sm font-medium text-gray-900">{step.title}</p>
              <p className="text-xs text-gray-500">{step.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      )}

      {/* Step Content */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        {renderStepContent()}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <button
          onClick={currentStep === 1 ? onCancel : handlePreviousStep}
          className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {currentStep === 1 ? 'Cancel' : 'Previous'}
        </button>
        
        {currentStep < 4 && (
          <button
            onClick={handleNextStep}
            disabled={!validateStep(currentStep)}
            className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
            <ArrowRight className="ml-2 h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
};
