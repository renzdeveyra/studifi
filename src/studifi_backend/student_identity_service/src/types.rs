use candid::{CandidType, Deserialize, Principal};
use serde::Serialize;
use shared::*;

/// Student profile with enhanced validation
#[derive(CandidType, Deserialize, Clone, Debug, Serialize)]
pub struct StudentProfile {
    pub id: Principal,
    pub email: String,
    pub full_name: String,
    pub university: String,
    pub student_id: String,
    pub program: String,
    pub year_of_study: u32,
    pub gpa: f64,
    pub is_verified: bool,
    pub kyc_status: KycStatus,
    pub created_at: Timestamp,
    pub updated_at: Timestamp,
}

impl Validate for StudentProfile {
    fn validate(&self) -> StudiFiResult<()> {
        validate_email(&self.email)?;
        validate_gpa(self.gpa)?;
        
        if self.full_name.trim().is_empty() {
            return Err(StudiFiError::InvalidInput("Full name cannot be empty".to_string()));
        }
        
        if self.university.trim().is_empty() {
            return Err(StudiFiError::InvalidInput("University cannot be empty".to_string()));
        }
        
        if self.student_id.trim().is_empty() {
            return Err(StudiFiError::InvalidInput("Student ID cannot be empty".to_string()));
        }
        
        if self.program.trim().is_empty() {
            return Err(StudiFiError::InvalidInput("Program cannot be empty".to_string()));
        }
        
        if self.year_of_study < MIN_YEAR_OF_STUDY || self.year_of_study > MAX_YEAR_OF_STUDY {
            return Err(StudiFiError::InvalidInput(
                format!("Year of study must be between {} and {}", MIN_YEAR_OF_STUDY, MAX_YEAR_OF_STUDY)
            ));
        }
        
        Ok(())
    }
}

impl Timestamped for StudentProfile {
    fn created_at(&self) -> Timestamp {
        self.created_at
    }
    
    fn updated_at(&self) -> Timestamp {
        self.updated_at
    }
    
    fn set_updated_at(&mut self, timestamp: Timestamp) {
        self.updated_at = timestamp;
    }
}

impl Identifiable for StudentProfile {
    fn id(&self) -> &str {
        &self.student_id
    }
}

/// KYC status with enhanced tracking
#[derive(CandidType, Deserialize, Clone, Debug, PartialEq, Serialize)]
pub enum KycStatus {
    Pending,
    InProgress,
    Verified,
    Rejected,
    Expired,
}

impl Default for KycStatus {
    fn default() -> Self {
        KycStatus::Pending
    }
}

/// University verification result
#[derive(CandidType, Deserialize, Clone, Debug, Serialize)]
pub struct UniversityVerification {
    pub university: String,
    pub student_id: String,
    pub is_valid: bool,
    pub verified_at: Timestamp,
    pub verification_method: String,
    pub confidence_score: f64,
}

/// Verification request with enhanced fields
#[derive(CandidType, Deserialize, Clone, Debug, Serialize)]
pub struct VerificationRequest {
    pub student_id: String,
    pub university: String,
    pub email: String,
    pub full_name: String,
    pub program: String,
    pub year_of_study: u32,
    pub expected_graduation: String,
    pub additional_documents: Vec<String>,
}

impl Validate for VerificationRequest {
    fn validate(&self) -> StudiFiResult<()> {
        validate_email(&self.email)?;
        
        if self.full_name.trim().is_empty() {
            return Err(StudiFiError::InvalidInput("Full name cannot be empty".to_string()));
        }
        
        if self.university.trim().is_empty() {
            return Err(StudiFiError::InvalidInput("University cannot be empty".to_string()));
        }
        
        if self.student_id.trim().is_empty() {
            return Err(StudiFiError::InvalidInput("Student ID cannot be empty".to_string()));
        }
        
        if self.program.trim().is_empty() {
            return Err(StudiFiError::InvalidInput("Program cannot be empty".to_string()));
        }
        
        if self.year_of_study < MIN_YEAR_OF_STUDY || self.year_of_study > MAX_YEAR_OF_STUDY {
            return Err(StudiFiError::InvalidInput(
                format!("Year of study must be between {} and {}", MIN_YEAR_OF_STUDY, MAX_YEAR_OF_STUDY)
            ));
        }
        
        Ok(())
    }
}

/// Verification statistics
#[derive(CandidType, Deserialize, Clone, Debug, Default, Serialize)]
pub struct VerificationStats {
    pub total_students: u32,
    pub verified_students: u32,
    pub pending_verifications: u32,
    pub rejected_verifications: u32,
    pub expired_verifications: u32,
    pub average_verification_time_hours: f64,
}

/// Student search filters
#[derive(CandidType, Deserialize, Clone, Debug, Default, Serialize)]
pub struct StudentSearchFilters {
    pub university: Option<String>,
    pub program: Option<String>,
    pub year_of_study: Option<u32>,
    pub kyc_status: Option<KycStatus>,
    pub is_verified: Option<bool>,
    pub min_gpa: Option<f64>,
    pub max_gpa: Option<f64>,
}

/// Bulk verification request
#[derive(CandidType, Deserialize, Clone, Debug, Serialize)]
pub struct BulkVerificationRequest {
    pub requests: Vec<VerificationRequest>,
    pub batch_id: String,
    pub priority: VerificationPriority,
}

/// Verification priority levels
#[derive(CandidType, Deserialize, Clone, Debug, Serialize)]
pub enum VerificationPriority {
    Low,
    Normal,
    High,
    Urgent,
}

impl Default for VerificationPriority {
    fn default() -> Self {
        VerificationPriority::Normal
    }
}

/// University API integration types
#[derive(CandidType, Deserialize, Clone, Debug, Serialize)]
pub struct UniversityApiConfig {
    pub university_name: String,
    pub api_endpoint: String,
    pub api_key_hash: String,
    pub supported_verification_types: Vec<String>,
    pub rate_limit_per_hour: u32,
    pub is_active: bool,
}

/// Document verification types
#[derive(CandidType, Deserialize, Clone, Debug, Serialize)]
pub enum DocumentType {
    StudentId,
    Transcript,
    EnrollmentVerification,
    GraduationCertificate,
    Other(String),
}


