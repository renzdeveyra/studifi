import React, { useState } from 'react';
import { RegistrationFlow } from '../components/RegistrationFlow';
import { RegistrationSuccess } from '../components/RegistrationSuccess';
import { identity_manager } from '../../../declarations/identity_manager';

interface UserRegistrationData {
  fullName: string;
  email: string;
  dateOfBirth: string;
  phoneNumber: string;
  university: string;
  studentId: string;
  program: string;
  yearOfStudy: number;
  expectedGraduation: string;
  additionalDocuments: string[];
}

interface RegistrationPageProps {
  setCurrentView: (view: string) => void;
  addNotification?: (notification: any) => void;
}

export const RegistrationPage: React.FC<RegistrationPageProps> = ({
  setCurrentView,
  addNotification
}) => {
  const [registrationStep, setRegistrationStep] = useState<'registration' | 'success'>('registration');
  const [userData, setUserData] = useState<UserRegistrationData | null>(null);

  const handleRegistrationComplete = (data: UserRegistrationData) => {
    setUserData(data);
    setRegistrationStep('success');
    
    // Add success notification
    if (addNotification) {
      addNotification({
        id: Date.now(),
        type: 'success',
        title: 'Registration Successful!',
        message: `Welcome to StudiFi, ${data.fullName}! Your account has been created.`,
        duration: 5000
      });
    }
  };

  const handleContinueToDashboard = () => {
    setCurrentView('dashboard');
  };

  const handleCancelRegistration = () => {
    setCurrentView('home');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {registrationStep === 'registration' ? (
        <RegistrationFlow
          onRegistrationComplete={handleRegistrationComplete}
          onCancel={handleCancelRegistration}
        />
      ) : (
        userData && (
          <RegistrationSuccess
            userData={userData}
            onContinueToDashboard={handleContinueToDashboard}
            identityManagerActor={identity_manager}
          />
        )
      )}
    </div>
  );
};
