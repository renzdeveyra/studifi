import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthClient } from '@dfinity/auth-client';
import { createActor as createIdentityManagerActor } from 'declarations/identity_manager';
import { createActor as createIntelligentCreditActor } from 'declarations/intelligent_credit';
import { createActor as createAutonomousFinanceActor } from 'declarations/autonomous_finance';
import { createActor as createGovernanceEngineActor } from 'declarations/governance_engine';
import { createActor as createComplianceGatewayActor } from 'declarations/compliance_gateway';

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
    identityManager: null,
    intelligentCredit: null,
    autonomousFinance: null,
    governanceEngine: null,
    complianceGateway: null,
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
        identityManager: createIdentityManagerActor(
          import.meta.env.VITE_CANISTER_ID_IDENTITY_MANAGER,
          { agentOptions }
        ),
        intelligentCredit: createIntelligentCreditActor(
          import.meta.env.VITE_CANISTER_ID_INTELLIGENT_CREDIT,
          { agentOptions }
        ),
        autonomousFinance: createAutonomousFinanceActor(
          import.meta.env.VITE_CANISTER_ID_AUTONOMOUS_FINANCE,
          { agentOptions }
        ),
        governanceEngine: createGovernanceEngineActor(
          import.meta.env.VITE_CANISTER_ID_GOVERNANCE_ENGINE,
          { agentOptions }
        ),
        complianceGateway: createComplianceGatewayActor(
          import.meta.env.VITE_CANISTER_ID_COMPLIANCE_GATEWAY,
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
        identityManager: null,
        intelligentCredit: null,
        autonomousFinance: null,
        governanceEngine: null,
        complianceGateway: null,
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
