// Note: @dfinity/verifiable-credentials is still in development
// For now, we'll create a mock implementation
import { Principal } from '@dfinity/principal';

// Types for verifiable credentials
export interface IssuerInfo {
  origin: string;
  canister_id?: Principal | string;
}

export interface CredentialArgument {
  Text?: string;
  Number?: number;
  Boolean?: boolean;
}

export interface CredentialSpec {
  credential_type: string;
  arguments: Record<string, CredentialArgument>;
}

export interface VerifiableCredentialRequest {
  issuer: IssuerInfo;
  credential_spec: CredentialSpec;
  credential_subject: Principal;
  derivation_origin?: string;
}

export interface VerifiableCredentialResponse {
  verifiable_presentation: string;
  verified: boolean;
  credential_type: string;
  issuer: string;
  subject: Principal;
  issued_at: bigint;
  expires_at?: bigint;
  claims: Record<string, CredentialArgument>;
}

export type VcVerificationStatus = 
  | 'Pending'
  | 'InProgress' 
  | 'Completed'
  | 'Failed'
  | 'Expired';

export interface VcVerificationSession {
  id: string;
  user_principal: Principal;
  request: VerifiableCredentialRequest;
  status: VcVerificationStatus;
  created_at: bigint;
  updated_at: bigint;
  response?: VerifiableCredentialResponse;
  error_message?: string;
}

// University configurations for demo purposes
export const DEMO_UNIVERSITIES = {
  'MIT': {
    name: 'Massachusetts Institute of Technology',
    origin: 'https://mit.university.studifi.app',
    canister_id: undefined, // Will be set when university issuer is deployed
  },
  'Stanford': {
    name: 'Stanford University', 
    origin: 'https://stanford.university.studifi.app',
    canister_id: undefined,
  },
  'Harvard': {
    name: 'Harvard University',
    origin: 'https://harvard.university.studifi.app', 
    canister_id: undefined,
  },
  'Berkeley': {
    name: 'UC Berkeley',
    origin: 'https://berkeley.university.studifi.app',
    canister_id: undefined,
  }
};

// Service class for handling verifiable credentials
export class VerifiableCredentialsService {
  private identityProviderUrl: string;

  constructor(identityProviderUrl = 'https://identity.internetcomputer.org') {
    this.identityProviderUrl = identityProviderUrl;
  }

  /**
   * Request a student verification credential from a university
   */
  async requestStudentCredential(
    universityName: string,
    studentId: string,
    program: string,
    yearOfStudy: number,
    expectedGraduation: string
  ): Promise<VerifiableCredentialResponse> {
    const university = DEMO_UNIVERSITIES[universityName as keyof typeof DEMO_UNIVERSITIES];
    if (!university) {
      throw new Error(`University ${universityName} not supported`);
    }

    // Create credential specification
    const credentialSpec: CredentialSpec = {
      credential_type: 'VerifiedStudent',
      arguments: {
        studentId: { Text: studentId },
        program: { Text: program },
        yearOfStudy: { Number: yearOfStudy },
        expectedGraduation: { Text: expectedGraduation },
        isCurrentStudent: { Boolean: true },
      }
    };

    // Create the request
    const request = {
      issuer: {
        origin: university.origin,
        canisterId: university.canister_id as string | undefined,
      },
      credentialSpec,
      credentialSubject: 'did:icp:' + Principal.anonymous().toText(), // Will be replaced with actual user principal
    };

    try {
      // Mock implementation for demo purposes
      // In production, this would use the actual @dfinity/verifiable-credentials SDK
      console.log('Mock: Requesting verifiable credential from', university.name);

      // Simulate async credential request
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Create mock JWT verifiable presentation
      const mockJWT = this.createMockVerifiablePresentation(request);

      // Parse the result and return structured response
      return this.parseVerifiablePresentation(mockJWT);
    } catch (error) {
      console.error('Failed to request student credential:', error);
      throw new Error(`Failed to request credential: ${error}`);
    }
  }

  /**
   * Create a mock verifiable presentation for demo purposes
   */
  private createMockVerifiablePresentation(request: any): string {
    const header = btoa(JSON.stringify({ alg: 'EdDSA', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({
      iss: request.issuer.origin,
      sub: 'did:icp:mock-student-id',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour
      vc: {
        '@context': 'https://www.w3.org/2018/credentials/v1',
        type: ['VerifiableCredential', request.credentialSpec.credential_type],
        credentialSubject: request.credentialSpec.arguments
      }
    }));
    const signature = 'mock-signature-for-demo';

    return `${header}.${payload}.${signature}`;
  }

  /**
   * Parse a verifiable presentation JWT and extract claims
   */
  private parseVerifiablePresentation(jwt: string): VerifiableCredentialResponse {
    try {
      // In a real implementation, this would properly parse and verify the JWT
      // For now, we'll create a mock response
      const mockResponse: VerifiableCredentialResponse = {
        verifiable_presentation: jwt,
        verified: true,
        credential_type: 'VerifiedStudent',
        issuer: 'university.studifi.app',
        subject: Principal.anonymous(),
        issued_at: BigInt(Date.now() * 1_000_000), // Convert to nanoseconds
        expires_at: BigInt((Date.now() + 365 * 24 * 60 * 60 * 1000) * 1_000_000), // 1 year from now
        claims: {
          verified: { Boolean: true },
          verification_method: { Text: 'verifiable_credential' },
        }
      };

      return mockResponse;
    } catch (error) {
      throw new Error(`Failed to parse verifiable presentation: ${error}`);
    }
  }

  /**
   * Verify a verifiable presentation
   */
  async verifyPresentation(jwt: string): Promise<boolean> {
    try {
      // In a real implementation, this would:
      // 1. Parse the JWT header and payload
      // 2. Verify the canister signature
      // 3. Check the credential chain (id_alias + actual credential)
      // 4. Validate expiration times
      // 5. Verify issuer authenticity

      if (!jwt || jwt.split('.').length < 2) {
        return false;
      }

      // For demo purposes, return true for valid-looking JWTs
      return true;
    } catch (error) {
      console.error('Error verifying presentation:', error);
      return false;
    }
  }

  /**
   * Create a university issuer configuration
   */
  createUniversityIssuer(universityName: string, canisterId?: Principal): IssuerInfo {
    const origin = `https://${universityName.toLowerCase().replace(/\s+/g, '-')}.university.studifi.app`;
    return {
      origin,
      canister_id: canisterId,
    };
  }

  /**
   * Get supported universities
   */
  getSupportedUniversities(): Array<{ key: string; name: string; origin: string }> {
    return Object.entries(DEMO_UNIVERSITIES).map(([key, university]) => ({
      key,
      name: university.name,
      origin: university.origin,
    }));
  }

  /**
   * Check if a credential is expired
   */
  isCredentialExpired(expiresAt?: bigint): boolean {
    if (!expiresAt) return false;
    const now = BigInt(Date.now() * 1_000_000); // Convert to nanoseconds
    return now > expiresAt;
  }

  /**
   * Format credential claims for display
   */
  formatClaims(claims: Record<string, CredentialArgument>): Record<string, string> {
    const formatted: Record<string, string> = {};
    
    for (const [key, value] of Object.entries(claims)) {
      if (value.Text) {
        formatted[key] = value.Text;
      } else if (value.Number !== undefined) {
        formatted[key] = value.Number.toString();
      } else if (value.Boolean !== undefined) {
        formatted[key] = value.Boolean ? 'Yes' : 'No';
      }
    }
    
    return formatted;
  }
}

// Export a default instance
export const vcService = new VerifiableCredentialsService();

// Utility functions
export const createStudentCredentialSpec = (
  studentId: string,
  program: string,
  yearOfStudy: number,
  expectedGraduation: string
): CredentialSpec => ({
  credential_type: 'VerifiedStudent',
  arguments: {
    studentId: { Text: studentId },
    program: { Text: program },
    yearOfStudy: { Number: yearOfStudy },
    expectedGraduation: { Text: expectedGraduation },
    isCurrentStudent: { Boolean: true },
  }
});

export const formatVerificationStatus = (status: VcVerificationStatus): string => {
  switch (status) {
    case 'Pending': return 'Pending';
    case 'InProgress': return 'In Progress';
    case 'Completed': return 'Completed';
    case 'Failed': return 'Failed';
    case 'Expired': return 'Expired';
    default: return 'Unknown';
  }
};

export const getStatusColor = (status: VcVerificationStatus): string => {
  switch (status) {
    case 'Pending': return 'text-yellow-600';
    case 'InProgress': return 'text-blue-600';
    case 'Completed': return 'text-green-600';
    case 'Failed': return 'text-red-600';
    case 'Expired': return 'text-gray-600';
    default: return 'text-gray-400';
  }
};