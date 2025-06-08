mod types;
mod storage;
mod treasury;
mod automation;

use candid::{candid_method, Principal};
use ic_cdk::{query, update, init, pre_upgrade, post_upgrade, caller};
use ic_cdk_timers::{set_timer_interval, TimerId};
use std::time::Duration;
use shared::*;

use types::*;
use storage::*;
use treasury::*;
use automation::*;

// Global timer for automation
static mut AUTOMATION_TIMER: Option<TimerId> = None;

#[init]
fn init() {
    ic_cdk::println!("Loan Management Service canister initialized");

    // Initialize treasury with default configuration
    with_storage_mut(|storage| {
        let treasury_config = TreasuryConfig::default();
        storage.set_treasury_config(treasury_config);
    });

    // Initialize separate treasuries
    let _ = TreasuryEngine::initialize_treasuries();

    // Start automation timer (runs every hour)
    unsafe {
        AUTOMATION_TIMER = Some(set_timer_interval(
            Duration::from_secs(AUTOMATION_INTERVAL_SECONDS),
            || {
                ic_cdk::spawn(async {
                    if let Err(e) = AutomationEngine::run_scheduled_tasks().await {
                        ic_cdk::println!("Automation error: {:?}", e);
                    }
                });
            },
        ));
    }
}

#[pre_upgrade]
fn pre_upgrade() {
    ic_cdk::println!("Loan Management Service canister upgrading...");
}

#[post_upgrade]
fn post_upgrade() {
    ic_cdk::println!("Loan Management Service canister upgraded successfully");

    // Restart automation timer after upgrade
    unsafe {
        AUTOMATION_TIMER = Some(set_timer_interval(
            Duration::from_secs(AUTOMATION_INTERVAL_SECONDS),
            || {
                ic_cdk::spawn(async {
                    if let Err(e) = AutomationEngine::run_scheduled_tasks().await {
                        ic_cdk::println!("Automation error: {:?}", e);
                    }
                });
            },
        ));
    }
}

// ============================================================================
// LOAN MANAGEMENT FUNCTIONS
// ============================================================================

/// Create a new loan from approved application
#[update]
#[candid_method(update)]
async fn create_loan(
    student_id: Principal,
    principal_amount: Amount,
    interest_rate: Percentage,
    term_months: u32,
    grace_period_months: u32,
    purpose: String,
    collateral_required: bool,
    cosigner_id: Option<Principal>,
    special_conditions: Vec<String>,
) -> StudiFiResult<Loan> {
    // Validate inputs
    validate_amount(principal_amount)?;
    validate_percentage(interest_rate)?;

    if term_months < MIN_LOAN_TERM_MONTHS || term_months > MAX_LOAN_TERM_MONTHS {
        return Err(StudiFiError::InvalidInput(
            format!("Term must be between {} and {} months", MIN_LOAN_TERM_MONTHS, MAX_LOAN_TERM_MONTHS)
        ));
    }

    // Check treasury eligibility
    TreasuryEngine::check_loan_eligibility(principal_amount)?;

    // Calculate loan terms
    let monthly_payment = calculate_monthly_payment(principal_amount, interest_rate, term_months);
    let origination_fee = (principal_amount as f64 * 0.01) as Amount; // 1% origination fee

    // Generate loan ID and create loan
    let loan_id = with_storage_mut(|storage| storage.get_next_loan_id());

    let loan = Loan::new(
        loan_id.clone(),
        student_id,
        principal_amount,
        interest_rate,
        term_months,
        monthly_payment,
        grace_period_months,
        origination_fee,
        purpose,
        collateral_required,
        cosigner_id,
        special_conditions,
    );

    // Allocate treasury funds
    TreasuryEngine::allocate_loan_funds(principal_amount)?;

    // Store the loan
    with_storage_mut(|storage| {
        storage.insert_loan(loan_id.clone(), loan.clone());
    });

    ic_cdk::println!("Created loan {} for student {:?}", loan_id, student_id);
    Ok(loan)
}

/// Get loan by ID
#[query]
#[candid_method(query)]
fn get_loan(loan_id: String) -> Option<Loan> {
    with_storage(|storage| storage.get_loan(&loan_id))
}

/// Get all loans for a student
#[query]
#[candid_method(query)]
fn get_student_loans(student_id: Principal) -> Vec<Loan> {
    with_storage(|storage| storage.get_loans_by_student(&student_id))
}

/// Get current user's loans
#[query]
#[candid_method(query)]
fn get_my_loans() -> Vec<Loan> {
    let caller = caller();
    with_storage(|storage| storage.get_loans_by_student(&caller))
}

/// Get all active loans (for admin/monitoring)
#[query]
#[candid_method(query)]
fn get_all_active_loans() -> Vec<Loan> {
    with_storage(|storage| storage.get_active_loans())
}

/// Get overdue loans (for admin/monitoring)
#[query]
#[candid_method(query)]
fn get_overdue_loans() -> Vec<Loan> {
    with_storage(|storage| storage.get_overdue_loans())
}

// ============================================================================
// PAYMENT PROCESSING FUNCTIONS
// ============================================================================

/// Process a loan payment
#[update]
#[candid_method(update)]
async fn process_payment(
    loan_id: String,
    payment_amount: Amount,
    payment_method: PaymentMethod,
) -> StudiFiResult<Payment> {
    let caller = caller();

    // Validate payment amount
    validate_amount(payment_amount)?;

    // Get the loan
    let mut loan = with_storage(|storage| storage.get_loan(&loan_id))
        .ok_or_else(|| StudiFiError::NotFound("Loan not found".to_string()))?;

    // Verify caller is the loan holder or cosigner
    if loan.student_id != caller && loan.cosigner_id != Some(caller) {
        return Err(StudiFiError::Unauthorized("Not authorized to make payments on this loan".to_string()));
    }

    // Check if loan is in a payable state
    if loan.status == LoanStatus::PaidOff || loan.status == LoanStatus::Cancelled {
        return Err(StudiFiError::InvalidInput("Loan is not in a payable state".to_string()));
    }

    // Calculate payment breakdown
    let breakdown = AutomationEngine::calculate_payment_breakdown(&loan, payment_amount);

    // Create payment record
    let payment_id = with_storage_mut(|storage| storage.get_next_payment_id());
    let mut payment = Payment::new(
        payment_id.clone(),
        loan_id.clone(),
        caller,
        payment_amount,
        breakdown.principal_portion,
        breakdown.interest_portion,
        0, // Late fees handled separately
        PaymentType::Regular,
        payment_method,
    );

    // Update loan balance
    loan.current_balance = breakdown.remaining_balance;
    loan.payments_made += 1;
    loan.set_updated_at(current_time());

    // Update loan status if paid off
    if loan.current_balance == 0 {
        loan.status = LoanStatus::PaidOff;
    }

    // Process payment to treasury
    TreasuryEngine::process_payment_to_treasury(
        breakdown.principal_portion,
        breakdown.interest_portion,
        0,
    )?;

    // Mark payment as completed
    payment.status = PaymentStatus::Completed;
    payment.set_updated_at(current_time());

    // Store updates
    with_storage_mut(|storage| {
        let _ = storage.update_loan(loan_id.clone(), loan);
        storage.insert_payment(payment_id.clone(), payment.clone());
    });

    ic_cdk::println!(
        "Processed payment {} for loan {}: principal={}, interest={}",
        payment_id, loan_id,
        format_currency(breakdown.principal_portion),
        format_currency(breakdown.interest_portion)
    );

    Ok(payment)
}

/// Make early payoff of entire loan
#[update]
#[candid_method(update)]
async fn make_early_payoff(loan_id: String, payment_method: PaymentMethod) -> StudiFiResult<Payment> {
    let caller = caller();

    // Get the loan
    let loan = with_storage(|storage| storage.get_loan(&loan_id))
        .ok_or_else(|| StudiFiError::NotFound("Loan not found".to_string()))?;

    // Verify caller is the loan holder or cosigner
    if loan.student_id != caller && loan.cosigner_id != Some(caller) {
        return Err(StudiFiError::Unauthorized("Not authorized to make payments on this loan".to_string()));
    }

    // Get early payoff information
    let payoff_info = AutomationEngine::check_early_payoff_eligibility(&loan);

    if !payoff_info.is_eligible {
        return Err(StudiFiError::InvalidInput("Loan is not eligible for early payoff".to_string()));
    }

    // Process the payoff payment
    let payment_id = with_storage_mut(|storage| storage.get_next_payment_id());
    let mut payment = Payment::new(
        payment_id.clone(),
        loan_id.clone(),
        caller,
        payoff_info.total_payoff_amount,
        payoff_info.remaining_balance,
        0, // No interest for payoff
        payoff_info.prepayment_penalty,
        PaymentType::FullPayoff,
        payment_method,
    );

    // Update loan
    let mut updated_loan = loan.clone();
    updated_loan.current_balance = 0;
    updated_loan.status = LoanStatus::PaidOff;
    updated_loan.set_updated_at(current_time());

    // Process payment to treasury
    TreasuryEngine::process_payment_to_treasury(
        payoff_info.remaining_balance,
        0,
        payoff_info.prepayment_penalty,
    )?;

    // Mark payment as completed
    payment.status = PaymentStatus::Completed;
    payment.set_updated_at(current_time());

    // Store updates
    with_storage_mut(|storage| {
        let _ = storage.update_loan(loan_id.clone(), updated_loan);
        storage.insert_payment(payment_id.clone(), payment.clone());
    });

    ic_cdk::println!(
        "Processed early payoff {} for loan {}: amount={}",
        payment_id, loan_id, format_currency(payoff_info.total_payoff_amount)
    );

    Ok(payment)
}

/// Get payment by ID
#[query]
#[candid_method(query)]
fn get_payment(payment_id: String) -> Option<Payment> {
    with_storage(|storage| storage.get_payment(&payment_id))
}

/// Get all payments for a loan
#[query]
#[candid_method(query)]
fn get_loan_payments(loan_id: String) -> Vec<Payment> {
    with_storage(|storage| storage.get_payments_by_loan(&loan_id))
}

/// Get all payments for current user
#[query]
#[candid_method(query)]
fn get_my_payments() -> Vec<Payment> {
    let caller = caller();
    with_storage(|storage| storage.get_payments_by_student(&caller))
}

/// Calculate payment breakdown for a loan
#[query]
#[candid_method(query)]
fn calculate_payment_breakdown(loan_id: String, payment_amount: Amount) -> StudiFiResult<PaymentBreakdown> {
    let loan = with_storage(|storage| storage.get_loan(&loan_id))
        .ok_or_else(|| StudiFiError::NotFound("Loan not found".to_string()))?;

    validate_amount(payment_amount)?;

    Ok(AutomationEngine::calculate_payment_breakdown(&loan, payment_amount))
}

/// Get early payoff information for a loan
#[query]
#[candid_method(query)]
fn get_early_payoff_info(loan_id: String) -> StudiFiResult<EarlyPayoffInfo> {
    let loan = with_storage(|storage| storage.get_loan(&loan_id))
        .ok_or_else(|| StudiFiError::NotFound("Loan not found".to_string()))?;

    Ok(AutomationEngine::check_early_payoff_eligibility(&loan))
}

// ============================================================================
// TREASURY MANAGEMENT FUNCTIONS
// ============================================================================

/// Get treasury health information
#[query]
#[candid_method(query)]
fn get_treasury_health() -> TreasuryHealth {
    TreasuryEngine::get_treasury_health()
}

/// Get treasury configuration
#[query]
#[candid_method(query)]
fn get_treasury_config() -> TreasuryConfig {
    with_storage(|storage| storage.get_treasury_config())
}

/// Update treasury configuration (admin only)
#[update]
#[candid_method(update)]
fn update_treasury_config(config: TreasuryConfig) -> StudiFiResult<()> {
    // TODO: Add admin authorization check
    with_storage_mut(|storage| {
        storage.set_treasury_config(config);
    });
    Ok(())
}

// ============================================================================
// SEPARATE TREASURY MANAGEMENT FUNCTIONS
// ============================================================================

/// Get configuration for a specific treasury type
#[query]
#[candid_method(query)]
fn get_separate_treasury_config(treasury_type: TreasuryType) -> StudiFiResult<SeparateTreasuryConfig> {
    TreasuryEngine::get_treasury_config(treasury_type)
}

/// Get all separate treasury configurations
#[query]
#[candid_method(query)]
fn get_all_separate_treasuries() -> Vec<SeparateTreasuryConfig> {
    with_storage(|storage| storage.get_all_separate_treasuries())
}

/// Add funds to a specific treasury (governance approved)
#[update]
#[candid_method(update)]
fn add_treasury_funds(treasury_type: TreasuryType, amount: Amount, source: String) -> StudiFiResult<()> {
    // TODO: Add governance authorization check
    TreasuryEngine::add_treasury_funds(treasury_type, amount, source)
}

/// Allocate funds from a specific treasury (with governance check)
#[update]
#[candid_method(update)]
fn allocate_treasury_funds(
    treasury_type: TreasuryType,
    amount: Amount,
    purpose: String,
    governance_approved: bool,
) -> StudiFiResult<()> {
    TreasuryEngine::allocate_treasury_funds(treasury_type, amount, purpose, governance_approved)
}

/// Transfer funds between treasuries (requires governance approval)
#[update]
#[candid_method(update)]
fn transfer_between_treasuries(
    from_treasury: TreasuryType,
    to_treasury: TreasuryType,
    amount: Amount,
    governance_approved: bool,
) -> StudiFiResult<()> {
    TreasuryEngine::transfer_between_treasuries(from_treasury, to_treasury, amount, governance_approved)
}

/// Get multi-treasury health overview
#[query]
#[candid_method(query)]
fn get_multi_treasury_health() -> StudiFiResult<MultiTreasuryHealth> {
    TreasuryEngine::get_multi_treasury_health()
}

/// Get treasury health for a specific treasury type
#[query]
#[candid_method(query)]
fn get_treasury_health_for_type(treasury_type: TreasuryType) -> StudiFiResult<TreasuryHealth> {
    TreasuryEngine::get_treasury_health_for_type(treasury_type)
}

/// Legacy treasury functions (for backward compatibility)
#[update]
#[candid_method(update)]
fn add_legacy_treasury_funds(amount: Amount, source: String) -> StudiFiResult<()> {
    // Default to loan treasury for backward compatibility
    TreasuryEngine::add_treasury_funds(TreasuryType::Loan, amount, source)
}

/// Manually trigger treasury rebalancing
#[update]
#[candid_method(update)]
fn rebalance_treasury() -> StudiFiResult<()> {
    // TODO: Implement cross-treasury rebalancing logic
    Ok(())
}

// ============================================================================
// STATISTICS AND REPORTING FUNCTIONS
// ============================================================================

/// Get comprehensive platform statistics
#[query]
#[candid_method(query)]
fn get_platform_stats() -> Statistics {
    let treasury_stats = with_storage(|storage| storage.calculate_treasury_stats());

    Statistics {
        total_count: treasury_stats.active_loan_count,
        active_count: treasury_stats.active_loan_count,
        completed_count: 0, // TODO: Calculate completed loans
        failed_count: 0, // TODO: Calculate failed/defaulted loans
        total_amount: treasury_stats.total_loans_outstanding,
        average_amount: treasury_stats.average_loan_size,
    }
}

/// Get detailed treasury statistics
#[query]
#[candid_method(query)]
fn get_treasury_stats() -> TreasuryStats {
    with_storage(|storage| storage.calculate_treasury_stats())
}

/// Get loan statistics for a specific student
#[query]
#[candid_method(query)]
fn get_student_loan_stats(student_id: Principal) -> StudentLoanStats {
    let loans = with_storage(|storage| storage.get_loans_by_student(&student_id));
    let payments = with_storage(|storage| storage.get_payments_by_student(&student_id));

    let total_borrowed = loans.iter().map(|loan| loan.original_amount).sum();
    let current_balance = loans.iter().map(|loan| loan.current_balance).sum();
    let total_paid = payments.iter()
        .filter(|payment| payment.status == PaymentStatus::Completed)
        .map(|payment| payment.amount)
        .sum();

    let active_loans = loans.iter().filter(|loan|
        loan.status == LoanStatus::Active || loan.status == LoanStatus::Late
    ).count() as u32;

    let on_time_payments = payments.iter()
        .filter(|payment| payment.payment_type == PaymentType::Regular)
        .count() as u32;

    let late_payments = loans.iter().map(|loan| loan.late_payments).sum();

    StudentLoanStats {
        total_borrowed,
        current_balance,
        total_paid,
        active_loans,
        completed_loans: loans.iter().filter(|loan| loan.status == LoanStatus::PaidOff).count() as u32,
        on_time_payments,
        late_payments,
        credit_score_impact: calculate_credit_impact(&loans, &payments),
    }
}

/// Get current user's loan statistics
#[query]
#[candid_method(query)]
fn get_my_loan_stats() -> StudentLoanStats {
    let caller = caller();
    get_student_loan_stats(caller)
}

// ============================================================================
// AUTOMATION AND MAINTENANCE FUNCTIONS
// ============================================================================

/// Manually trigger automation tasks (admin only)
#[update]
#[candid_method(update)]
async fn run_automation_tasks() -> StudiFiResult<()> {
    // TODO: Add admin authorization check
    AutomationEngine::run_scheduled_tasks().await
}

/// Update loan status manually (admin only)
#[update]
#[candid_method(update)]
fn update_loan_status(loan_id: String, new_status: LoanStatus) -> StudiFiResult<Loan> {
    // TODO: Add admin authorization check

    let mut loan = with_storage(|storage| storage.get_loan(&loan_id))
        .ok_or_else(|| StudiFiError::NotFound("Loan not found".to_string()))?;

    loan.status = new_status;
    loan.set_updated_at(current_time());

    with_storage_mut(|storage| {
        storage.update_loan(loan_id, loan.clone())
    })
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/// Calculate credit score impact based on loan history
fn calculate_credit_impact(loans: &[Loan], payments: &[Payment]) -> i32 {
    let mut impact = 0;

    // Positive impact for completed loans
    impact += loans.iter().filter(|loan| loan.status == LoanStatus::PaidOff).count() as i32 * 10;

    // Negative impact for late payments
    impact -= loans.iter().map(|loan| loan.late_payments).sum::<u32>() as i32 * 5;

    // Negative impact for defaults
    impact -= loans.iter().filter(|loan| loan.status == LoanStatus::Default).count() as i32 * 50;

    // Positive impact for on-time payments
    impact += payments.iter()
        .filter(|payment| payment.payment_type == PaymentType::Regular)
        .count() as i32 * 2;

    impact
}

/// Student loan statistics
#[derive(candid::CandidType, candid::Deserialize, Clone, Debug, serde::Serialize)]
pub struct StudentLoanStats {
    pub total_borrowed: Amount,
    pub current_balance: Amount,
    pub total_paid: Amount,
    pub active_loans: u32,
    pub completed_loans: u32,
    pub on_time_payments: u32,
    pub late_payments: u32,
    pub credit_score_impact: i32,
}

// ============================================================================
// CANDID EXPORT
// ============================================================================

candid::export_service!();

#[query(name = "__get_candid_interface_tmp_hack")]
fn export_candid() -> String {
    __export_service()
}