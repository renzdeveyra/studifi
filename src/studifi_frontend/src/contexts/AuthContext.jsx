import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthClient } from '@dfinity/auth-client';
import { createActor as createStudentIdentityActor } from 'declarations/student_identity_service';
import { createActor as createCreditAssessmentActor } from 'declarations/credit_assessment_service';
import { createActor as createLoanManagementActor } from 'declarations/loan_management_service';
import { createActor as createDAOGovernanceActor } from 'declarations/dao_governance_service';
import { createActor as createComplianceActor } from 'declarations/compliance_service';
import { createActor as createUniversityCredentialActor } from 'declarations/university_credential_service';
import { createActor as createAuthenticationActor } from 'declarations/authentication_service';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [authClient, setAuthClient] = useState(null);
  const [identity, setIdentity] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Backend actors
  const [actors, setActors] = useState({
    studentIdentity: null,
    creditAssessment: null,
    loanManagement: null,
    daoGovernance: null,
    compliance: null,
    universityCredential: null,
    authentication: null,
  });

  // Initialize authentication on mount
  useEffect(() => {
    initAuth();
  }, []);

  const initAuth = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('Initializing auth...');
      const client = await AuthClient.create();
      setAuthClient(client);

      if (await client.isAuthenticated()) {
        console.log('User is already authenticated');
        const userIdentity = client.getIdentity();
        setIdentity(userIdentity);
        setIsAuthenticated(true);
        await createActors(userIdentity);
      } else {
        console.log('User is not authenticated');
        setIsAuthenticated(false);
      }
      
      console.log('Auth initialized successfully');
    } catch (error) {
      console.error('Failed to initialize auth:', error);
      setError('Failed to initialize authentication');
    } finally {
      setIsLoading(false);
    }
  };

  const createActors = async (userIdentity) => {
    try {
      const agentOptions = {
        identity: userIdentity,
      };

      const newActors = {
        studentIdentity: createStudentIdentityActor(
          import.meta.env.VITE_CANISTER_ID_STUDENT_IDENTITY_SERVICE,
          { agentOptions }
        ),
        creditAssessment: createCreditAssessmentActor(
          import.meta.env.VITE_CANISTER_ID_CREDIT_ASSESSMENT_SERVICE,
          { agentOptions }
        ),
        loanManagement: createLoanManagementActor(
          import.meta.env.VITE_CANISTER_ID_LOAN_MANAGEMENT_SERVICE,
          { agentOptions }
        ),
        daoGovernance: createDAOGovernanceActor(
          import.meta.env.VITE_CANISTER_ID_DAO_GOVERNANCE_SERVICE,
          { agentOptions }
        ),
        compliance: createComplianceActor(
          import.meta.env.VITE_CANISTER_ID_COMPLIANCE_SERVICE,
          { agentOptions }
        ),
        universityCredential: createUniversityCredentialActor(
          import.meta.env.VITE_CANISTER_ID_UNIVERSITY_CREDENTIAL_SERVICE,
          { agentOptions }
        ),
        authentication: createAuthenticationActor(
          import.meta.env.VITE_CANISTER_ID_AUTHENTICATION_SERVICE,
          { agentOptions }
        ),
      };

      setActors(newActors);
      console.log('All actors created successfully');
    } catch (error) {
      console.error('Failed to create actors:', error);
      setError('Failed to create backend connections');
    }
  };

  const login = async () => {
    if (!authClient) {
      throw new Error('Auth client not initialized');
    }

    try {
      setIsLoading(true);
      setError(null);

      const identityProvider = process.env.DFX_NETWORK === "local" 
        ? `http://localhost:4943/?canisterId=${import.meta.env.VITE_CANISTER_ID_INTERNET_IDENTITY}`
        : "https://identity.ic0.app";

      await authClient.login({
        identityProvider,
        onSuccess: async () => {
          console.log('Internet Identity login successful');
          const userIdentity = authClient.getIdentity();
          setIdentity(userIdentity);
          setIsAuthenticated(true);
          await createActors(userIdentity);
        },
        onError: (error) => {
          console.error('Login failed:', error);
          setError('Internet Identity login failed. Please try again.');
          throw error;
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      setError('Failed to connect to Internet Identity. Please check your connection.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      if (authClient) {
        await authClient.logout();
      }
      setIdentity(null);
      setIsAuthenticated(false);
      setActors({
        studentIdentity: null,
        creditAssessment: null,
        loanManagement: null,
        daoGovernance: null,
        compliance: null,
        universityCredential: null,
        authentication: null,
      });
      setError(null);
    } catch (error) {
      console.error('Logout error:', error);
      setError('Failed to logout');
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    // Auth state
    authClient,
    identity,
    isAuthenticated,
    isLoading,
    error,
    
    // Backend actors
    actors,
    
    // Auth methods
    login,
    logout,
    clearError,
    
    // Utility methods
    getPrincipal: () => identity?.getPrincipal(),
    isAnonymous: () => identity?.getPrincipal()?.isAnonymous() ?? true,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
