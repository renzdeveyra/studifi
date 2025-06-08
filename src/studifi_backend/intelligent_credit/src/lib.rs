mod types;
mod scoring;
mod storage;
mod analytics;
mod community_validation;
mod community_engine;

use candid::{candid_method, Principal};
use ic_cdk::{query, update, caller, init, pre_upgrade, post_upgrade};

use types::*;
use scoring::*;
use storage::*;
use analytics::*;
use community_validation::*;
use community_engine::*;
use shared::*;

/// Initialize the canister
#[init]
fn init() {
    ic_cdk::println!("Intelligent Credit canister initialized");
}

/// Pre-upgrade hook
#[pre_upgrade]
fn pre_upgrade() {
    ic_cdk::println!("Intelligent Credit canister upgrading...");
}

/// Post-upgrade hook
#[post_upgrade]
fn post_upgrade() {
    ic_cdk::println!("Intelligent Credit canister upgraded successfully");
}

/// Submit a loan application
#[update]
#[candid_method(update)]
async fn submit_loan_application(
    requested_amount: Amount,
    purpose: LoanPurpose,
    academic_info: AcademicInfo,
    financial_info: FinancialInfo,
) -> StudiFiResult<LoanApplication> {
    let caller = caller();

    // Validate inputs
    validate_amount(requested_amount)?;
    academic_info.validate()?;
    financial_info.validate()?;

    // Check loan amount limits
    if requested_amount < MIN_LOAN_AMOUNT || requested_amount > MAX_LOAN_AMOUNT {
        return Err(StudiFiError::InvalidInput(
            format!("Loan amount must be between {} and {}",
                format_currency(MIN_LOAN_AMOUNT),
                format_currency(MAX_LOAN_AMOUNT))
        ));
    }

    // Generate application ID
    let application_id = with_storage_mut(|storage| {
        let id = generate_id(LOAN_APPLICATION_PREFIX, storage.get_next_application_id());
        storage.increment_application_id();
        id
    });

    // Create loan application
    let application = LoanApplication {
        id: application_id.clone(),
        student_id: caller,
        requested_amount,
        purpose,
        academic_info,
        financial_info,
        status: ApplicationStatus::Submitted,
        credit_score: None,
        loan_terms: None,
        created_at: current_time(),
        processed_at: None,
        notes: Vec::new(),
        risk_assessment: None,
    };

    // Store application
    with_storage_mut(|storage| {
        storage.insert_application(application_id.clone(), application.clone());
    });

    // Process application immediately
    process_application(application_id).await
}

/// Process a loan application
#[update]
#[candid_method(update)]
async fn process_application(application_id: String) -> StudiFiResult<LoanApplication> {
    let mut application = with_storage(|storage| storage.get_application(&application_id))
        .ok_or_else(|| StudiFiError::NotFound("Application not found".to_string()))?;

    if application.status != ApplicationStatus::Submitted {
        return Err(StudiFiError::InvalidInput("Application already processed".to_string()));
    }

    // Calculate credit score
    let credit_score = CreditScoringEngine::calculate_enhanced_score(
        &application.academic_info,
        &application.financial_info,
        &None, // No historical data for now
    );

    // Perform risk assessment
    let risk_assessment = CreditScoringEngine::assess_risk(&application, &credit_score);

    // Get effective credit score (hybrid if available)
    let effective_score = CommunityValidationEngine::get_effective_credit_score(application.student_id)
        .unwrap_or(credit_score.score);

    // Generate loan terms if approved
    let (status, loan_terms) = if effective_score >= 500 {
        // Use effective score for loan terms calculation
        let effective_credit_score = CreditScore::new(effective_score, credit_score.factors.clone(), credit_score.confidence);
        let terms = CreditScoringEngine::generate_loan_terms(
            application.requested_amount,
            &effective_credit_score,
            &application.purpose,
        );
        (ApplicationStatus::Approved, Some(terms))
    } else {
        (ApplicationStatus::Rejected, None)
    };

    // Update application
    application.status = status;
    application.credit_score = Some(credit_score);
    application.loan_terms = loan_terms;
    application.risk_assessment = Some(risk_assessment);
    application.set_updated_at(current_time());

    // Store updated application
    with_storage_mut(|storage| {
        storage.update_application(application_id, application.clone());
        storage.insert_credit_score(application.student_id, application.credit_score.as_ref().unwrap().clone());
    });

    Ok(application)
}

/// Get application by ID
#[query]
#[candid_method(query)]
fn get_application(application_id: String) -> Option<LoanApplication> {
    with_storage(|storage| storage.get_application(&application_id))
}

/// Get applications for current caller
#[query]
#[candid_method(query)]
fn get_my_applications() -> Vec<LoanApplication> {
    let caller = caller();
    with_storage(|storage| storage.get_student_applications(&caller))
}

/// Get credit score for a student
#[query]
#[candid_method(query)]
fn get_credit_score(student_id: Principal) -> Option<CreditScore> {
    with_storage(|storage| storage.get_credit_score(&student_id))
}

/// Get application statistics
#[query]
#[candid_method(query)]
fn get_application_stats() -> ApplicationStats {
    with_storage(|storage| AnalyticsEngine::calculate_application_stats(storage))
}

/// Search applications with filters
#[query]
#[candid_method(query)]
fn search_applications(
    filters: ApplicationFilters,
    pagination: Option<PaginationParams>,
) -> PaginatedResponse<LoanApplication> {
    let pagination = pagination.unwrap_or_default();
    let applications = with_storage(|storage| storage.search_applications(&filters));
    paginate(&applications, &pagination)
}

/// Generate loan terms for an amount and credit score
#[query]
#[candid_method(query)]
fn generate_loan_terms(
    amount: Amount,
    credit_score: u32,
    purpose: LoanPurpose,
) -> StudiFiResult<LoanTerms> {
    validate_amount(amount)?;

    if amount < MIN_LOAN_AMOUNT || amount > MAX_LOAN_AMOUNT {
        return Err(StudiFiError::InvalidInput("Invalid loan amount".to_string()));
    }

    let mock_credit_score = CreditScore::new(credit_score, Vec::new(), 0.9);
    let terms = CreditScoringEngine::generate_loan_terms(amount, &mock_credit_score, &purpose);
    Ok(terms)
}

/// Update scoring configuration (admin only)
#[update]
#[candid_method(update)]
fn update_scoring_config(config: ScoringConfig) -> StudiFiResult<()> {
    // In production, check admin authorization
    with_storage_mut(|storage| {
        storage.set_scoring_config(config);
    });
    Ok(())
}

/// Get current scoring configuration
#[query]
#[candid_method(query)]
fn get_scoring_config() -> ScoringConfig {
    with_storage(|storage| storage.get_scoring_config())
}

// ============================================================================
// COMMUNITY VALIDATION FUNCTIONS
// ============================================================================

/// Create a community validation request for credit score adjustment
#[update]
#[candid_method(update)]
async fn create_validation_request(
    student_id: Principal,
    application_id: String,
    algorithm_score: u32,
    proposed_adjustment: i32,
    justification: String,
    evidence: Vec<ValidationEvidence>,
) -> StudiFiResult<CommunityValidationRequest> {
    let caller = caller();
    CommunityValidationEngine::create_validation_request(
        student_id,
        application_id,
        algorithm_score,
        proposed_adjustment,
        justification,
        evidence,
        caller,
    )
}

/// Cast a community vote on a validation request
#[update]
#[candid_method(update)]
async fn cast_community_vote(
    validation_id: String,
    adjustment_vote: i32,
    confidence: f64,
    voting_power: u64,
    justification: String,
) -> StudiFiResult<CommunityVote> {
    let caller = caller();
    CommunityValidationEngine::cast_community_vote(
        validation_id,
        caller,
        adjustment_vote,
        confidence,
        voting_power,
        justification,
    )
}

/// Process completed validation and calculate final adjustment
#[update]
#[candid_method(update)]
async fn process_validation(validation_id: String) -> StudiFiResult<i32> {
    CommunityValidationEngine::process_validation(validation_id)
}

/// Apply community validation to create hybrid credit score
#[update]
#[candid_method(update)]
async fn apply_community_validation(
    student_id: Principal,
    validation_id: String,
) -> StudiFiResult<HybridCreditScore> {
    CommunityValidationEngine::apply_community_validation(student_id, validation_id)
}

/// Get effective credit score (hybrid if available, otherwise algorithm)
#[query]
#[candid_method(query)]
fn get_effective_credit_score(student_id: Principal) -> Option<u32> {
    CommunityValidationEngine::get_effective_credit_score(student_id)
}

/// Get validation requests for a student
#[query]
#[candid_method(query)]
fn get_student_validations(student_id: Principal) -> Vec<CommunityValidationRequest> {
    CommunityValidationEngine::get_student_validations(student_id)
}

/// Get active validation requests
#[query]
#[candid_method(query)]
fn get_active_validations() -> Vec<CommunityValidationRequest> {
    CommunityValidationEngine::get_active_validations()
}

/// Get community validation statistics
#[query]
#[candid_method(query)]
fn get_validation_stats() -> CommunityValidationStats {
    CommunityValidationEngine::get_validation_stats()
}

/// Get validator reputation
#[query]
#[candid_method(query)]
fn get_validator_reputation(validator: Principal) -> Option<ValidatorReputation> {
    CommunityValidationEngine::get_validator_reputation(validator)
}

/// Get hybrid credit score for a student
#[query]
#[candid_method(query)]
fn get_hybrid_credit_score(student_id: Principal) -> Option<HybridCreditScore> {
    with_storage(|storage| storage.get_hybrid_score(&student_id))
}

/// Check if user is eligible for community validation
#[query]
#[candid_method(query)]
fn check_validation_eligibility(user: Principal) -> bool {
    CommunityValidationEngine::check_validation_eligibility(user)
}

/// Process expired validations (automation function)
#[update]
#[candid_method(update)]
async fn process_expired_validations() -> StudiFiResult<u32> {
    CommunityValidationEngine::process_expired_validations()
}

/// Get platform statistics
#[query]
#[candid_method(query)]
fn get_platform_stats() -> Statistics {
    with_storage(|storage| {
        let all_applications = storage.get_all_applications();
        let approved = all_applications.iter().filter(|app| app.status == ApplicationStatus::Approved).count() as u32;
        let rejected = all_applications.iter().filter(|app| app.status == ApplicationStatus::Rejected).count() as u32;
        let total_amount: Amount = all_applications.iter()
            .filter(|app| app.status == ApplicationStatus::Approved)
            .map(|app| app.requested_amount)
            .sum();
        let average_amount = if approved > 0 { total_amount / approved as u64 } else { 0 };

        Statistics {
            total_count: all_applications.len() as u32,
            active_count: approved,
            completed_count: approved,
            failed_count: rejected,
            total_amount,
            average_amount,
        }
    })
}

// Export Candid interface
candid::export_service!();

#[query(name = "__get_candid_interface_tmp_hack")]
fn export_candid() -> String {
    __export_service()
}
