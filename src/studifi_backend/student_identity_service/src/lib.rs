mod types;
mod storage;
mod verification;
mod verifiable_credentials;

use candid::{candid_method, Principal};
use ic_cdk::{query, update, caller, init, pre_upgrade, post_upgrade};


use types::*;
use storage::*;
use verification::*;
use verifiable_credentials::*;
use shared::*;

/// Initialize the canister
#[init]
fn init() {
    ic_cdk::println!("Identity Manager canister initialized");
}

/// Pre-upgrade hook
#[pre_upgrade]
fn pre_upgrade() {
    ic_cdk::println!("Identity Manager canister upgrading...");
    // Stable storage automatically handles persistence
}

/// Post-upgrade hook
#[post_upgrade]
fn post_upgrade() {
    ic_cdk::println!("Identity Manager canister upgraded successfully");
}

/// Create a new student profile
#[update]
#[candid_method(update)]
async fn create_student_profile(request: VerificationRequest) -> StudiFiResult<StudentProfile> {
    let caller = caller();

    // Validate the request
    request.validate()?;

    // Check if profile already exists
    if with_storage(|storage| storage.get_student_profile(&caller)).is_some() {
        return Err(StudiFiError::AlreadyExists("Profile already exists for this principal".to_string()));
    }

    // Create new student profile
    let now = current_time();
    let profile = StudentProfile {
        id: caller,
        email: sanitize_text(&request.email),
        full_name: sanitize_text(&request.full_name),
        university: sanitize_text(&request.university),
        student_id: sanitize_text(&request.student_id),
        program: sanitize_text(&request.program),
        year_of_study: request.year_of_study,
        gpa: 0.0, // Will be updated after verification
        is_verified: false,
        kyc_status: KycStatus::Pending,
        created_at: now,
        updated_at: now,
    };

    // Validate the profile
    profile.validate()?;

    // Store the profile and verification request
    with_storage_mut(|storage| {
        storage.insert_student_profile(caller, profile.clone());
        storage.insert_verification_request(request.student_id.clone(), request);
    });

    // Start verification process
    let verification_result = VerificationService::simulate_university_verification(
        &with_storage(|storage| storage.get_verification_request(&profile.student_id).unwrap())
    ).await;

    match verification_result {
        Ok(_verification) => {
            ic_cdk::println!("Verification initiated for student: {}", profile.full_name);
        }
        Err(e) => {
            ic_cdk::println!("Verification failed: {:?}", e);
        }
    }

    Ok(profile)
}

/// Get student profile by principal
#[query]
#[candid_method(query)]
fn get_student_profile(student_id: Principal) -> Option<StudentProfile> {
    with_storage(|storage| storage.get_student_profile(&student_id))
}

/// Get current caller's profile
#[query]
#[candid_method(query)]
fn get_my_profile() -> Option<StudentProfile> {
    let caller = caller();
    with_storage(|storage| storage.get_student_profile(&caller))
}

/// Update KYC status
#[update]
#[candid_method(update)]
fn update_kyc_status(status: KycStatus) -> StudiFiResult<StudentProfile> {
    let caller = caller();

    with_storage_mut(|storage| {
        match storage.get_student_profile(&caller) {
            Some(mut profile) => {
                profile.kyc_status = status;
                profile.set_updated_at(current_time());

                // Auto-verify if KYC is verified
                if profile.kyc_status == KycStatus::Verified {
                    profile.is_verified = true;
                }

                storage.update_student_profile(caller, profile)
            }
            None => Err(StudiFiError::NotFound("Profile not found".to_string())),
        }
    })
}

/// Verify student with GPA update
#[update]
#[candid_method(update)]
async fn verify_student(gpa: f64) -> StudiFiResult<StudentProfile> {
    let caller = caller();

    // Validate GPA
    validate_gpa(gpa)?;

    with_storage_mut(|storage| {
        match storage.get_student_profile(&caller) {
            Some(mut profile) => {
                profile.gpa = gpa;
                profile.is_verified = true;
                profile.kyc_status = KycStatus::Verified;
                profile.set_updated_at(current_time());

                storage.update_student_profile(caller, profile)
            }
            None => Err(StudiFiError::NotFound("Profile not found".to_string())),
        }
    })
}

/// Get all verified students
#[query]
#[candid_method(query)]
fn get_all_verified_students() -> Vec<StudentProfile> {
    with_storage(|storage| storage.get_verified_students())
}

/// Search students with filters
#[query]
#[candid_method(query)]
fn search_students(filters: StudentSearchFilters, pagination: Option<PaginationParams>) -> PaginatedResponse<StudentProfile> {
    let pagination = pagination.unwrap_or_default();
    let students = with_storage(|storage| storage.search_students(&filters));
    paginate(&students, &pagination)
}

/// Get verification statistics
#[query]
#[candid_method(query)]
fn get_verification_stats() -> VerificationStats {
    with_storage(|storage| storage.get_verification_stats())
}

/// Verify with university API (for authorized callers)
#[update]
#[candid_method(update)]
async fn verify_with_university_api(university: String, student_id: String) -> StudiFiResult<UniversityVerification> {
    // In production, you would check authorization here
    let caller = caller();
    ic_cdk::println!("University verification requested by: {:?}", caller);

    // Get university configuration
    let config = with_storage(|storage| storage.get_university_config(&university))
        .ok_or_else(|| StudiFiError::NotFound("University configuration not found".to_string()))?;

    VerificationService::verify_with_university_api(&university, &student_id, &config).await
}

/// Add university API configuration (admin only)
#[update]
#[candid_method(update)]
fn add_university_config(config: UniversityApiConfig) -> StudiFiResult<()> {
    // In production, you would check admin authorization here
    let caller = caller();
    ic_cdk::println!("University config added by: {:?}", caller);

    with_storage_mut(|storage| {
        storage.insert_university_config(config.university_name.clone(), config);
    });

    Ok(())
}

/// Get university configurations
#[query]
#[candid_method(query)]
fn get_university_configs() -> Vec<UniversityApiConfig> {
    with_storage(|storage| {
        storage.get_all_university_configs()
            .into_iter()
            .map(|(_, config)| config)
            .collect()
    })
}

/// Batch verify students
#[update]
#[candid_method(update)]
async fn batch_verify_students(
    requests: Vec<VerificationRequest>,
    priority: VerificationPriority,
) -> Vec<StudiFiResult<UniversityVerification>> {
    VerificationService::batch_verify(requests, priority).await
}

/// Check if verification is expired
#[query]
#[candid_method(query)]
fn is_verification_expired(student_id: Principal) -> bool {
    match with_storage(|storage| storage.get_student_profile(&student_id)) {
        Some(profile) => VerificationService::is_verification_expired(&profile),
        None => false,
    }
}

/// Generate verification report
#[query]
#[candid_method(query)]
fn generate_verification_report(student_id: Principal) -> StudiFiResult<String> {
    match with_storage(|storage| storage.get_student_profile(&student_id)) {
        Some(profile) => Ok(VerificationService::generate_verification_report(&profile)),
        None => Err(StudiFiError::NotFound("Student profile not found".to_string())),
    }
}

/// Update student profile
#[update]
#[candid_method(update)]
fn update_student_profile(
    email: Option<String>,
    university: Option<String>,
    program: Option<String>,
    year_of_study: Option<u32>,
) -> StudiFiResult<StudentProfile> {
    let caller = caller();

    with_storage_mut(|storage| {
        match storage.get_student_profile(&caller) {
            Some(mut profile) => {
                // Update fields if provided
                if let Some(email) = email {
                    validate_email(&email)?;
                    profile.email = sanitize_text(&email);
                }

                if let Some(university) = university {
                    profile.university = sanitize_text(&university);
                }

                if let Some(program) = program {
                    profile.program = sanitize_text(&program);
                }

                if let Some(year) = year_of_study {
                    if year < MIN_YEAR_OF_STUDY || year > MAX_YEAR_OF_STUDY {
                        return Err(StudiFiError::InvalidInput(
                            format!("Year of study must be between {} and {}", MIN_YEAR_OF_STUDY, MAX_YEAR_OF_STUDY)
                        ));
                    }
                    profile.year_of_study = year;
                }

                profile.set_updated_at(current_time());
                storage.update_student_profile(caller, profile)
            }
            None => Err(StudiFiError::NotFound("Profile not found".to_string())),
        }
    })
}

/// Delete student profile (self-deletion only)
#[update]
#[candid_method(update)]
fn delete_my_profile() -> StudiFiResult<()> {
    let caller = caller();

    match with_storage_mut(|storage| storage.remove_student_profile(&caller)) {
        Some(_) => Ok(()),
        None => Err(StudiFiError::NotFound("Profile not found".to_string())),
    }
}

/// Get platform statistics
#[query]
#[candid_method(query)]
fn get_platform_stats() -> Statistics {
    with_storage(|storage| {
        let all_profiles: Vec<StudentProfile> = storage.get_all_student_profiles()
            .into_iter()
            .map(|(_, profile)| profile)
            .collect();

        let total_count = all_profiles.len() as u32;
        let active_count = all_profiles.iter().filter(|p| p.is_verified).count() as u32;
        let completed_count = all_profiles.iter().filter(|p| p.kyc_status == KycStatus::Verified).count() as u32;
        let failed_count = all_profiles.iter().filter(|p| p.kyc_status == KycStatus::Rejected).count() as u32;

        Statistics {
            total_count,
            active_count,
            completed_count,
            failed_count,
            total_amount: 0, // Not applicable for identity manager
            average_amount: 0, // Not applicable for identity manager
        }
    })
}

// ============================================================================
// VERIFIABLE CREDENTIALS (RELYING PARTY)
// ============================================================================

/// Create a verifiable credential verification session
#[update]
#[candid_method(update)]
fn create_vc_verification_session(
    university_origin: String,
    university_canister_id: Option<Principal>,
    student_id: String,
    program: String,
) -> StudiFiResult<VcVerificationSession> {
    let caller = caller();

    // Validate inputs
    if university_origin.is_empty() || student_id.is_empty() || program.is_empty() {
        return Err(StudiFiError::InvalidInput("All fields are required".to_string()));
    }

    let session = VerifiableCredentialService::create_student_verification_session(
        caller,
        university_origin,
        university_canister_id,
        student_id,
        program,
    )?;

    // Store the session
    with_storage_mut(|storage| {
        storage.insert_vc_session(session.id.clone(), session.clone());
    });

    ic_cdk::println!("Created VC verification session: {} for user: {:?}", session.id, caller);
    Ok(session)
}

/// Process verifiable credential response
#[update]
#[candid_method(update)]
fn process_vc_response(
    session_id: String,
    verifiable_presentation: String,
) -> StudiFiResult<VcVerificationResponse> {
    let caller = caller();

    let mut session = with_storage_mut(|storage| {
        storage.get_vc_session(&session_id)
    }).ok_or_else(|| StudiFiError::NotFound("Verification session not found".to_string()))?;

    // Verify the caller owns this session
    if session.user_principal != caller {
        return Err(StudiFiError::Unauthorized("Session does not belong to caller".to_string()));
    }

    // Check if session is expired
    if session.is_expired() {
        session.update_status(VcVerificationStatus::Expired);
        with_storage_mut(|storage| {
            storage.update_vc_session(session_id.clone(), session);
        });
        return Err(StudiFiError::Expired("Verification session has expired".to_string()));
    }

    // Process the credential response
    match VerifiableCredentialService::process_credential_response(&mut session, verifiable_presentation) {
        Ok(_) => {
            // Update student profile with verified status
            if let Some(response) = &session.response {
                with_storage_mut(|storage| {
                    if let Some(mut profile) = storage.get_student_profile(&caller) {
                        profile.is_verified = response.verified;
                        profile.kyc_status = if response.verified {
                            KycStatus::Verified
                        } else {
                            KycStatus::Rejected
                        };
                        profile.set_updated_at(current_time());
                        storage.update_student_profile(caller, profile);
                    }
                });
            }

            // Store updated session
            with_storage_mut(|storage| {
                storage.update_vc_session(session_id, session.clone());
            });

            Ok(session.response.unwrap())
        },
        Err(e) => {
            session.fail_with_error(format!("Failed to process credential: {:?}", e));
            with_storage_mut(|storage| {
                storage.update_vc_session(session_id, session);
            });
            Err(e)
        }
    }
}

/// Get verification session status
#[query]
#[candid_method(query)]
fn get_vc_session_status(session_id: String) -> Option<VcVerificationStatus> {
    let caller = caller();

    with_storage(|storage| {
        storage.get_vc_session(&session_id)
            .filter(|session| session.user_principal == caller)
            .map(|session| session.status)
    })
}

/// Get all verification sessions for the caller
#[query]
#[candid_method(query)]
fn get_my_vc_sessions() -> Vec<VcVerificationSession> {
    let caller = caller();

    with_storage(|storage| {
        storage.get_all_vc_sessions()
            .into_iter()
            .filter(|(_, session)| session.user_principal == caller)
            .map(|(_, session)| session)
            .collect()
    })
}

/// Verify a verifiable presentation JWT (utility function)
#[query]
#[candid_method(query)]
fn verify_presentation(jwt: String) -> StudiFiResult<bool> {
    VerifiableCredentialService::verify_presentation(&jwt)
}

// Export Candid interface
candid::export_service!();

#[query(name = "__get_candid_interface_tmp_hack")]
fn export_candid() -> String {
    __export_service()
}
