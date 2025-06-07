use candid::{candid_method, CandidType, Deserialize, Principal};
use ic_cdk::{query, update, init, pre_upgrade, post_upgrade, caller, api::time};
use serde::Serialize;
use shared::*;
use std::collections::HashMap;

mod types;
mod storage;

use types::*;
use storage::*;

#[init]
fn init() {
    ic_cdk::println!("University Issuer canister initialized");
}

#[pre_upgrade]
fn pre_upgrade() {
    ic_cdk::println!("University Issuer canister upgrading...");
}

#[post_upgrade]
fn post_upgrade() {
    ic_cdk::println!("University Issuer canister upgraded successfully");
}

// ============================================================================
// VERIFIABLE CREDENTIALS ISSUER API (IC VC SPEC COMPLIANCE)
// ============================================================================

/// Get consent message for credential issuance
#[query]
#[candid_method(query)]
fn vc_consent_message(credential_spec: CredentialSpec) -> StudiFiResult<String> {
    let message = match credential_spec.credential_type.as_str() {
        "VerifiedStudent" => {
            "This university will issue a verifiable credential confirming your current student status. \
             This credential will include your student ID, program, and enrollment status. \
             No personal information beyond what you specify will be shared."
        },
        "VerifiedGraduate" => {
            "This university will issue a verifiable credential confirming your graduation status. \
             This credential will include your degree, graduation date, and academic standing."
        },
        _ => "This university will issue a verifiable credential with the requested information."
    };
    
    Ok(message.to_string())
}

/// Get derivation origin for this issuer
#[query]
#[candid_method(query)]
fn derivation_origin() -> StudiFiResult<String> {
    // Return this canister's URL as the derivation origin
    let canister_id = ic_cdk::api::id();
    Ok(format!("https://{}.icp0.io", canister_id.to_text()))
}

/// Prepare credential for issuance
#[update]
#[candid_method(update)]
fn prepare_credential(request: PrepareCredentialRequest) -> StudiFiResult<PreparedCredentialData> {
    ic_cdk::println!("Preparing credential for type: {}", request.credential_spec.credential_type);
    
    // Validate the credential request
    if request.credential_spec.credential_type != "VerifiedStudent" {
        return Err(StudiFiError::InvalidInput("Unsupported credential type".to_string()));
    }

    // Extract student ID from arguments
    let student_id = request.credential_spec.arguments
        .iter()
        .find(|(key, _)| key == "studentId")
        .and_then(|(_, value)| match value {
            CredentialArgument::Text(id) => Some(id.clone()),
            _ => None,
        })
        .ok_or_else(|| StudiFiError::InvalidInput("Student ID required".to_string()))?;

    // Verify student exists in our records
    let student = with_storage(|storage| storage.get_student(&student_id))
        .ok_or_else(|| StudiFiError::NotFound("Student not found in university records".to_string()))?;

    // Create prepared context (in real implementation, this would be more sophisticated)
    let prepared_context = PreparedContext {
        student_id: student.id.clone(),
        credential_spec: request.credential_spec.clone(),
        prepared_at: time(),
        id_alias_jws: request.signed_id_alias.credential_jws,
    };

    let context_bytes = serde_json::to_vec(&prepared_context)
        .map_err(|e| StudiFiError::InternalError(format!("Serialization error: {}", e)))?;

    Ok(PreparedCredentialData {
        prepared_context: context_bytes,
    })
}

/// Issue the actual credential
#[update]
#[candid_method(update)]
fn get_credential(request: GetCredentialRequest) -> StudiFiResult<IssuedCredentialData> {
    ic_cdk::println!("Issuing credential");

    // Deserialize prepared context
    let prepared_context: PreparedContext = serde_json::from_slice(&request.prepared_context)
        .map_err(|e| StudiFiError::InternalError(format!("Deserialization error: {}", e)))?;

    // Verify the request matches the prepared context
    if prepared_context.credential_spec.credential_type != request.credential_spec.credential_type {
        return Err(StudiFiError::InvalidInput("Credential spec mismatch".to_string()));
    }

    // Get student information
    let student = with_storage(|storage| storage.get_student(&prepared_context.student_id))
        .ok_or_else(|| StudiFiError::NotFound("Student not found".to_string()))?;

    // Create the verifiable credential JWT
    let vc_jwt = create_student_credential_jwt(&student, &request.credential_spec)?;

    Ok(IssuedCredentialData {
        vc_jws: vc_jwt,
    })
}

// ============================================================================
// UNIVERSITY MANAGEMENT FUNCTIONS
// ============================================================================

/// Add a student to university records
#[update]
#[candid_method(update)]
fn add_student(
    student_id: String,
    full_name: String,
    program: String,
    year_of_study: u32,
) -> StudiFiResult<()> {
    let caller = caller();
    ic_cdk::println!("Adding student {} by {:?}", student_id, caller);

    let student = Student {
        id: student_id.clone(),
        full_name,
        program,
        year_of_study,
        is_enrolled: true,
        enrollment_date: time(),
        added_by: caller,
    };

    with_storage_mut(|storage| {
        storage.add_student(student_id, student);
    });

    Ok(())
}

/// Verify if a student exists and is enrolled
#[query]
#[candid_method(query)]
fn verify_student(student_id: String) -> StudiFiResult<String> {
    match with_storage(|storage| storage.get_student(&student_id)) {
        Some(student) if student.is_enrolled => {
            Ok(format!("Student {} is currently enrolled in {}", student.full_name, student.program))
        },
        Some(_) => Err(StudiFiError::NotFound("Student is not currently enrolled".to_string())),
        None => Err(StudiFiError::NotFound("Student not found in university records".to_string())),
    }
}

/// Get platform statistics
#[query]
#[candid_method(query)]
fn get_platform_stats() -> Statistics {
    with_storage(|storage| {
        let students = storage.get_all_students();
        let total_count = students.len() as u32;
        let active_count = students.iter().filter(|(_, s)| s.is_enrolled).count() as u32;

        Statistics {
            total_count,
            active_count,
            completed_count: active_count, // For simplicity
            failed_count: 0,
            total_amount: 0,
            average_amount: 0,
        }
    })
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/// Create a JWT for student credential (simplified implementation)
fn create_student_credential_jwt(
    student: &Student,
    credential_spec: &CredentialSpec,
) -> StudiFiResult<String> {
    // In a real implementation, this would:
    // 1. Create a proper JWT header
    // 2. Create a VC payload following W3C standards
    // 3. Sign with canister signature
    // 4. Return the complete JWT

    // For demo purposes, create a mock JWT structure
    let header = r#"{"alg":"EdDSA","typ":"JWT"}"#;
    let payload = format!(
        r#"{{
            "iss": "{}",
            "sub": "did:icp:{}",
            "iat": {},
            "exp": {},
            "vc": {{
                "@context": "https://www.w3.org/2018/credentials/v1",
                "type": ["VerifiableCredential", "{}"],
                "credentialSubject": {{
                    "{}": {{
                        "studentId": "{}",
                        "program": "{}",
                        "yearOfStudy": {},
                        "isCurrentStudent": true,
                        "universityName": "Demo University"
                    }}
                }}
            }}
        }}"#,
        ic_cdk::api::id().to_text(),
        student.id,
        time() / 1_000_000_000, // Convert to seconds
        (time() + 365 * 24 * 60 * 60 * 1_000_000_000) / 1_000_000_000, // 1 year from now
        credential_spec.credential_type,
        credential_spec.credential_type,
        student.id,
        student.program,
        student.year_of_study
    );

    // Base64 encode (simplified - in real implementation would be proper base64url)
    let encoded_header = base64_encode(header);
    let encoded_payload = base64_encode(&payload);
    
    // Mock signature (in real implementation, would use canister signature)
    let signature = "mock_signature_would_be_canister_signature_here";

    Ok(format!("{}.{}.{}", encoded_header, encoded_payload, signature))
}

/// Simple base64 encoding (for demo purposes)
fn base64_encode(input: &str) -> String {
    // This is a simplified implementation for demo purposes
    // In production, use a proper base64url encoding library
    format!("base64_{}", input.len())
}

// Export Candid interface
candid::export_service!();

#[query(name = "__get_candid_interface_tmp_hack")]
fn export_candid() -> String {
    __export_service()
}