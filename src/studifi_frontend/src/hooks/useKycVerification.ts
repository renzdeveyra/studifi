import { useState, useCallback, useEffect } from 'react';
import { Principal } from '@dfinity/principal';
import { 
  vcService, 
  VcVerificationSession, 
  VcVerificationStatus,
  VerifiableCredentialResponse 
} from '../services/verifiableCredentials';

export interface KycVerificationState {
  isLoading: boolean;
  error: string | null;
  sessions: VcVerificationSession[];
  currentSession: VcVerificationSession | null;
}

export interface StartVerificationParams {
  universityName: string;
  studentId: string;
  program: string;
  yearOfStudy: number;
  expectedGraduation: string;
}

export const useKycVerification = (identityManagerActor?: any) => {
  const [state, setState] = useState<KycVerificationState>({
    isLoading: false,
    error: null,
    sessions: [],
    currentSession: null,
  });

  // Load existing verification sessions
  const loadSessions = useCallback(async () => {
    if (!identityManagerActor) return;

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const sessions = await identityManagerActor.get_my_vc_sessions();
      setState(prev => ({ 
        ...prev, 
        sessions,
        isLoading: false 
      }));
    } catch (error) {
      console.error('Failed to load VC sessions:', error);
      setState(prev => ({ 
        ...prev, 
        error: `Failed to load sessions: ${error}`,
        isLoading: false 
      }));
    }
  }, [identityManagerActor]);

  // Start a new verification process
  const startVerification = useCallback(async (params: StartVerificationParams) => {
    if (!identityManagerActor) {
      throw new Error('Identity manager actor not available');
    }

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      // Get university configuration
      const university = vcService.getSupportedUniversities()
        .find(u => u.key === params.universityName);
      
      if (!university) {
        throw new Error(`University ${params.universityName} not supported`);
      }

      // Create verification session on the backend
      const sessionResult = await identityManagerActor.create_vc_verification_session(
        university.origin,
        [], // No canister ID for demo
        params.studentId,
        params.program
      );

      if ('Err' in sessionResult) {
        throw new Error(sessionResult.Err);
      }

      const session = sessionResult.Ok;
      
      setState(prev => ({ 
        ...prev, 
        currentSession: session,
        sessions: [...prev.sessions, session],
        isLoading: false 
      }));

      // Start the VC flow with Internet Identity
      await requestCredentialFromUniversity(session.id, params);

      return session;
    } catch (error) {
      console.error('Failed to start verification:', error);
      setState(prev => ({ 
        ...prev, 
        error: `Failed to start verification: ${error}`,
        isLoading: false 
      }));
      throw error;
    }
  }, [identityManagerActor]);

  // Request credential from university through Internet Identity
  const requestCredentialFromUniversity = useCallback(async (
    sessionId: string, 
    params: StartVerificationParams
  ) => {
    try {
      // Use the VC service to request credentials
      const credentialResponse = await vcService.requestStudentCredential(
        params.universityName,
        params.studentId,
        params.program,
        params.yearOfStudy,
        params.expectedGraduation
      );

      // Process the response through the backend
      await processCredentialResponse(sessionId, credentialResponse.verifiable_presentation);
      
    } catch (error) {
      console.error('Failed to request credential from university:', error);
      throw error;
    }
  }, []);

  // Process credential response
  const processCredentialResponse = useCallback(async (
    sessionId: string, 
    verifiablePresentation: string
  ) => {
    if (!identityManagerActor) {
      throw new Error('Identity manager actor not available');
    }

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const result = await identityManagerActor.process_vc_response(
        sessionId,
        verifiablePresentation
      );

      if ('Err' in result) {
        throw new Error(result.Err);
      }

      const response = result.Ok;
      
      // Update the session in state
      setState(prev => ({
        ...prev,
        sessions: prev.sessions.map(session => 
          session.id === sessionId 
            ? { ...session, status: 'Completed' as VcVerificationStatus, response }
            : session
        ),
        currentSession: prev.currentSession?.id === sessionId 
          ? { ...prev.currentSession, status: 'Completed' as VcVerificationStatus, response }
          : prev.currentSession,
        isLoading: false
      }));

      return response;
    } catch (error) {
      console.error('Failed to process credential response:', error);
      setState(prev => ({ 
        ...prev, 
        error: `Failed to process credential: ${error}`,
        isLoading: false 
      }));
      throw error;
    }
  }, [identityManagerActor]);

  // Check session status
  const checkSessionStatus = useCallback(async (sessionId: string) => {
    if (!identityManagerActor) return null;

    try {
      const status = await identityManagerActor.get_vc_session_status(sessionId);
      return status[0] || null; // Optional type in Candid
    } catch (error) {
      console.error('Failed to check session status:', error);
      return null;
    }
  }, [identityManagerActor]);

  // Verify a presentation
  const verifyPresentation = useCallback(async (jwt: string) => {
    if (!identityManagerActor) return false;

    try {
      const result = await identityManagerActor.verify_presentation(jwt);
      return 'Ok' in result ? result.Ok : false;
    } catch (error) {
      console.error('Failed to verify presentation:', error);
      return false;
    }
  }, [identityManagerActor]);

  // Get session by ID
  const getSession = useCallback((sessionId: string) => {
    return state.sessions.find(session => session.id === sessionId) || null;
  }, [state.sessions]);

  // Get sessions by status
  const getSessionsByStatus = useCallback((status: VcVerificationStatus) => {
    return state.sessions.filter(session => session.status === status);
  }, [state.sessions]);

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Reset state
  const reset = useCallback(() => {
    setState({
      isLoading: false,
      error: null,
      sessions: [],
      currentSession: null,
    });
  }, []);

  // Load sessions on mount
  useEffect(() => {
    if (identityManagerActor) {
      loadSessions();
    }
  }, [identityManagerActor, loadSessions]);

  return {
    // State
    ...state,
    
    // Actions
    startVerification,
    processCredentialResponse,
    checkSessionStatus,
    verifyPresentation,
    loadSessions,
    clearError,
    reset,
    
    // Getters
    getSession,
    getSessionsByStatus,
    
    // Computed values
    hasCompletedVerification: state.sessions.some(s => s.status === 'Completed'),
    hasPendingVerification: state.sessions.some(s => s.status === 'Pending' || s.status === 'InProgress'),
    latestSession: state.sessions.length > 0 ? state.sessions[state.sessions.length - 1] : null,
  };
};
