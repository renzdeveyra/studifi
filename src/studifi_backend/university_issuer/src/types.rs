use candid::{CandidType, Deserialize, Principal};
use serde::Serialize;
use shared::*;
use std::collections::HashMap;

/// Student record in university database
#[derive(CandidType, Deserialize, Clone, Debug, Serialize)]
pub struct Student {
    pub id: String,
    pub full_name: String,
    pub program: String,
    pub year_of_study: u32,
    pub is_enrolled: bool,
    pub enrollment_date: Timestamp,
    pub added_by: Principal,
}

/// Verifiable Credentials types (following IC VC spec)
#[derive(CandidType, Deserialize, Clone, Debug, Serialize)]
pub struct CredentialSpec {
    pub credential_type: String,
    pub arguments: Vec<(String, CredentialArgument)>,
}

#[derive(CandidType, Deserialize, Clone, Debug, Serialize)]
pub enum CredentialArgument {
    Text(String),
    Number(f64),
    Boolean(bool),
}

#[derive(CandidType, Deserialize, Clone, Debug, Serialize)]
pub struct CredentialRequest {
    pub credential_subject: String,
    pub credential_spec: CredentialSpec,
}

#[derive(CandidType, Deserialize, Clone, Debug, Serialize)]
pub struct PrepareCredentialRequest {
    pub signed_id_alias: SignedIdAlias,
    pub credential_spec: CredentialSpec,
}

#[derive(CandidType, Deserialize, Clone, Debug, Serialize)]
pub struct SignedIdAlias {
    pub credential_jws: String,
}

#[derive(CandidType, Deserialize, Clone, Debug, Serialize)]
pub struct PreparedCredentialData {
    pub prepared_context: Vec<u8>,
}

#[derive(CandidType, Deserialize, Clone, Debug, Serialize)]
pub struct GetCredentialRequest {
    pub signed_id_alias: SignedIdAlias,
    pub credential_spec: CredentialSpec,
    pub prepared_context: Vec<u8>,
}

#[derive(CandidType, Deserialize, Clone, Debug, Serialize)]
pub struct IssuedCredentialData {
    pub vc_jws: String,
}

/// Internal context for prepared credentials
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct PreparedContext {
    pub student_id: String,
    pub credential_spec: CredentialSpec,
    pub prepared_at: Timestamp,
    pub id_alias_jws: String,
}

impl Student {
    pub fn new(
        id: String,
        full_name: String,
        program: String,
        year_of_study: u32,
        added_by: Principal,
    ) -> Self {
        Self {
            id,
            full_name,
            program,
            year_of_study,
            is_enrolled: true,
            enrollment_date: current_time(),
            added_by,
        }
    }

    pub fn is_valid(&self) -> StudiFiResult<()> {
        if self.id.is_empty() {
            return Err(StudiFiError::InvalidInput("Student ID cannot be empty".to_string()));
        }

        if self.full_name.is_empty() {
            return Err(StudiFiError::InvalidInput("Full name cannot be empty".to_string()));
        }

        if self.program.is_empty() {
            return Err(StudiFiError::InvalidInput("Program cannot be empty".to_string()));
        }

        if self.year_of_study == 0 || self.year_of_study > 10 {
            return Err(StudiFiError::InvalidInput("Year of study must be between 1 and 10".to_string()));
        }

        Ok(())
    }

    pub fn enroll(&mut self) {
        self.is_enrolled = true;
    }

    pub fn unenroll(&mut self) {
        self.is_enrolled = false;
    }
}

impl CredentialSpec {
    pub fn get_argument(&self, key: &str) -> Option<&CredentialArgument> {
        self.arguments.iter()
            .find(|(k, _)| k == key)
            .map(|(_, v)| v)
    }

    pub fn get_text_argument(&self, key: &str) -> Option<String> {
        self.get_argument(key).and_then(|arg| match arg {
            CredentialArgument::Text(text) => Some(text.clone()),
            _ => None,
        })
    }

    pub fn get_number_argument(&self, key: &str) -> Option<f64> {
        self.get_argument(key).and_then(|arg| match arg {
            CredentialArgument::Number(num) => Some(*num),
            _ => None,
        })
    }

    pub fn get_boolean_argument(&self, key: &str) -> Option<bool> {
        self.get_argument(key).and_then(|arg| match arg {
            CredentialArgument::Boolean(bool_val) => Some(*bool_val),
            _ => None,
        })
    }
}

/// University configuration
#[derive(CandidType, Deserialize, Clone, Debug, Serialize)]
pub struct UniversityConfig {
    pub name: String,
    pub domain: String,
    pub supported_credentials: Vec<String>,
    pub admin_principals: Vec<Principal>,
    pub is_active: bool,
    pub created_at: Timestamp,
}

impl UniversityConfig {
    pub fn new(name: String, domain: String, admin: Principal) -> Self {
        Self {
            name,
            domain,
            supported_credentials: vec!["VerifiedStudent".to_string(), "VerifiedGraduate".to_string()],
            admin_principals: vec![admin],
            is_active: true,
            created_at: current_time(),
        }
    }

    pub fn is_admin(&self, principal: &Principal) -> bool {
        self.admin_principals.contains(principal)
    }

    pub fn supports_credential(&self, credential_type: &str) -> bool {
        self.supported_credentials.contains(&credential_type.to_string())
    }
}

/// Credential issuance record
#[derive(CandidType, Deserialize, Clone, Debug, Serialize)]
pub struct CredentialIssuanceRecord {
    pub id: String,
    pub student_id: String,
    pub credential_type: String,
    pub issued_at: Timestamp,
    pub expires_at: Option<Timestamp>,
    pub revoked: bool,
    pub revoked_at: Option<Timestamp>,
}

impl CredentialIssuanceRecord {
    pub fn new(student_id: String, credential_type: String) -> Self {
        Self {
            id: generate_id("CRED", 1),
            student_id,
            credential_type,
            issued_at: current_time(),
            expires_at: Some(current_time() + 365 * 24 * 60 * 60 * 1_000_000_000), // 1 year
            revoked: false,
            revoked_at: None,
        }
    }

    pub fn is_expired(&self) -> bool {
        if let Some(expires_at) = self.expires_at {
            current_time() > expires_at
        } else {
            false
        }
    }

    pub fn revoke(&mut self) {
        self.revoked = true;
        self.revoked_at = Some(current_time());
    }

    pub fn is_valid(&self) -> bool {
        !self.revoked && !self.is_expired()
    }
}
