mod types;
mod scoring;
mod storage;
mod analytics;

use candid::{candid_method, Principal};
use ic_cdk::{query, update, caller, init, pre_upgrade, post_upgrade};

use types::*;
use scoring::*;
use storage::*;
use analytics::*;
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

    // Generate loan terms if approved
    let (status, loan_terms) = if credit_score.score >= 500 {
        let terms = CreditScoringEngine::generate_loan_terms(
            application.requested_amount,
            &credit_score,
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
