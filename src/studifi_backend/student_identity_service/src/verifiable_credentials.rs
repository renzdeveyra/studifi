use crate::types::*;
use candid::{CandidType, Deserialize, Principal};
use ic_cdk::api::time;
use serde::Serialize;
use shared::*;
use std::collections::HashMap;

/// Verifiable Credential Request for student verification
#[derive(CandidType, Deserialize, Clone, Debug, Serialize)]
pub struct VerifiableCredentialRequest {
    pub issuer: IssuerInfo,
    pub credential_spec: CredentialSpec,
    pub credential_subject: Principal,
    pub derivation_origin: Option<String>,
}

/// Information about the credential issuer (university)
#[derive(CandidType, Deserialize, Clone, Debug, Serialize)]
pub struct IssuerInfo {
    pub origin: String,
    pub canister_id: Option<Principal>,
}

/// Specification of the credential being requested
#[derive(CandidType, Deserialize, Clone, Debug, Serialize)]
pub struct CredentialSpec {
    pub credential_type: String,
    pub arguments: HashMap<String, CredentialArgument>,
}

/// Flexible credential argument that can hold different types
#[derive(CandidType, Deserialize, Clone, Debug, Serialize)]
pub enum CredentialArgument {
    Text(String),
    Number(f64),
    Boolean(bool),
}

/// Response from verifiable credential verification
#[derive(CandidType, Deserialize, Clone, Debug, Serialize)]
pub struct VerifiableCredentialResponse {
    pub verifiable_presentation: String, // JWT token
    pub verified: bool,
    pub credential_type: String,
    pub issuer: String,
    pub subject: Principal,
    pub issued_at: u64,
    pub expires_at: Option<u64>,
    pub claims: HashMap<String, CredentialArgument>,
}

/// Type alias for compatibility
pub type VcVerificationResponse = VerifiableCredentialResponse;

/// Status of a verifiable credential verification process
#[derive(CandidType, Deserialize, Clone, Debug, Serialize, PartialEq)]
pub enum VcVerificationStatus {
    Pending,
    InProgress,
    Completed,
    Failed,
    Expired,
}

/// Stored verification session
#[derive(CandidType, Deserialize, Clone, Debug, Serialize)]
pub struct VcVerificationSession {
    pub id: String,
    pub user_principal: Principal,
    pub request: VerifiableCredentialRequest,
    pub status: VcVerificationStatus,
    pub created_at: u64,
    pub updated_at: u64,
    pub response: Option<VerifiableCredentialResponse>,
    pub error_message: Option<String>,
}

impl VcVerificationSession {
    pub fn new(
        id: String,
        user_principal: Principal,
        request: VerifiableCredentialRequest,
    ) -> Self {
        let now = time();
        Self {
            id,
            user_principal,
            request,
            status: VcVerificationStatus::Pending,
            created_at: now,
            updated_at: now,
            response: None,
            error_message: None,
        }
    }

    pub fn update_status(&mut self, status: VcVerificationStatus) {
        self.status = status;
        self.updated_at = time();
    }

    pub fn complete_with_response(&mut self, response: VerifiableCredentialResponse) {
        self.response = Some(response);
        self.status = VcVerificationStatus::Completed;
        self.updated_at = time();
    }

    pub fn fail_with_error(&mut self, error: String) {
        self.error_message = Some(error);
        self.status = VcVerificationStatus::Failed;
        self.updated_at = time();
    }

    pub fn is_expired(&self) -> bool {
        const SESSION_TIMEOUT: u64 = 30 * 60 * 1_000_000_000; // 30 minutes in nanoseconds
        time() > self.created_at + SESSION_TIMEOUT
    }
}

/// Service for handling verifiable credentials as a relying party
pub struct VerifiableCredentialService;

impl VerifiableCredentialService {
    /// Create a new verification session for requesting student credentials
    pub fn create_student_verification_session(
        user_principal: Principal,
        university_origin: String,
        university_canister_id: Option<Principal>,
        student_id: String,
        program: String,
    ) -> StudiFiResult<VcVerificationSession> {
        let session_id = generate_id("VC_SESSION", 1);
        
        // Create credential specification for student verification
        let mut arguments = HashMap::new();
        arguments.insert("studentId".to_string(), CredentialArgument::Text(student_id));
        arguments.insert("program".to_string(), CredentialArgument::Text(program));
        arguments.insert("isCurrentStudent".to_string(), CredentialArgument::Boolean(true));
        
        let request = VerifiableCredentialRequest {
            issuer: IssuerInfo {
                origin: university_origin,
                canister_id: university_canister_id,
            },
            credential_spec: CredentialSpec {
                credential_type: "VerifiedStudent".to_string(),
                arguments,
            },
            credential_subject: user_principal,
            derivation_origin: None, // Will use default frontend origin
        };

        let session = VcVerificationSession::new(session_id, user_principal, request);
        Ok(session)
    }

    /// Process a verifiable credential response and update student profile
    pub fn process_credential_response(
        session: &mut VcVerificationSession,
        verifiable_presentation: String,
    ) -> StudiFiResult<()> {
        // In a real implementation, this would:
        // 1. Parse and verify the JWT verifiable presentation
        // 2. Validate the signature using canister signatures
        // 3. Check the credential claims
        // 4. Update the student profile accordingly

        // For now, we'll simulate successful verification
        let response = VerifiableCredentialResponse {
            verifiable_presentation: verifiable_presentation.clone(),
            verified: true,
            credential_type: session.request.credential_spec.credential_type.clone(),
            issuer: session.request.issuer.origin.clone(),
            subject: session.user_principal,
            issued_at: time(),
            expires_at: Some(time() + 365 * 24 * 60 * 60 * 1_000_000_000), // 1 year
            claims: session.request.credential_spec.arguments.clone(),
        };

        session.complete_with_response(response);
        
        ic_cdk::println!(
            "Processed verifiable credential for user: {:?}, type: {}",
            session.user_principal,
            session.request.credential_spec.credential_type
        );

        Ok(())
    }

    /// Verify a JWT verifiable presentation (simplified implementation)
    pub fn verify_presentation(jwt: &str) -> StudiFiResult<bool> {
        // In a real implementation, this would:
        // 1. Parse the JWT header and payload
        // 2. Verify the canister signature
        // 3. Check the credential chain (id_alias + actual credential)
        // 4. Validate expiration times
        // 5. Verify issuer authenticity

        // For now, we'll do basic validation
        if jwt.is_empty() || jwt.split('.').count() < 2 {
            return Err(StudiFiError::InvalidInput("Invalid JWT format".to_string()));
        }

        // Simulate successful verification
        Ok(true)
    }

    pub fn extract_claims(jwt: &str) -> StudiFiResult<HashMap<String, CredentialArgument>> {
        // In a real implementation, this would parse the JWT payload
        // and extract the credentialSubject claims
        
        let mut claims = HashMap::new();
        claims.insert("verified".to_string(), CredentialArgument::Boolean(true));
        claims.insert("verification_method".to_string(), CredentialArgument::Text("verifiable_credential".to_string()));
        
        Ok(claims)
    }
}

/// Helper function to create university issuer info
pub fn create_university_issuer(university_name: &str, canister_id: Option<Principal>) -> IssuerInfo {
    let origin = format!("https://{}.university.studifi.app", university_name.to_lowercase().replace(" ", "-"));
    IssuerInfo {
        origin,
        canister_id,
    }
}

/// Helper function to create student credential specification
pub fn create_student_credential_spec(
    student_id: String,
    program: String,
    year_of_study: u32,
    expected_graduation: String,
) -> CredentialSpec {
    let mut arguments = HashMap::new();
    arguments.insert("studentId".to_string(), CredentialArgument::Text(student_id));
    arguments.insert("program".to_string(), CredentialArgument::Text(program));
    arguments.insert("yearOfStudy".to_string(), CredentialArgument::Number(year_of_study as f64));
    arguments.insert("expectedGraduation".to_string(), CredentialArgument::Text(expected_graduation));
    arguments.insert("isCurrentStudent".to_string(), CredentialArgument::Boolean(true));

    CredentialSpec {
        credential_type: "VerifiedStudent".to_string(),
        arguments,
    }
}
