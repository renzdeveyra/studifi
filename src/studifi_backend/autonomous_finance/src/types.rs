use candid::{CandidType, Deserialize, Principal};
use serde::Serialize;
use shared::*;

/// Active loan with comprehensive tracking
#[derive(CandidType, Deserialize, Clone, Debug, Serialize)]
pub struct Loan {
    pub id: String,
    pub student_id: Principal,
    pub original_amount: Amount,
    pub current_balance: Amount,
    pub interest_rate: Percentage,
    pub term_months: u32,
    pub monthly_payment: Amount,
    pub grace_period_months: u32,
    pub origination_fee: Amount,
    pub status: LoanStatus,
    pub created_at: Timestamp,
    pub first_payment_due: Timestamp,
    pub last_payment_date: Option<Timestamp>,
    pub payments_made: u32,
    pub late_payments: u32,
    pub purpose: String,
    pub collateral_required: bool,
    pub cosigner_id: Option<Principal>,
    pub special_conditions: Vec<String>,
}

impl Loan {
    pub fn new(
        id: String,
        student_id: Principal,
        amount: Amount,
        interest_rate: Percentage,
        term_months: u32,
        monthly_payment: Amount,
        grace_period_months: u32,
        origination_fee: Amount,
        purpose: String,
        collateral_required: bool,
        cosigner_id: Option<Principal>,
        special_conditions: Vec<String>,
    ) -> Self {
        let now = current_time();
        let grace_period_nanos = months_to_nanos(grace_period_months);

        Self {
            id,
            student_id,
            original_amount: amount,
            current_balance: amount,
            interest_rate,
            term_months,
            monthly_payment,
            grace_period_months,
            origination_fee,
            status: LoanStatus::Active,
            created_at: now,
            first_payment_due: now + grace_period_nanos,
            last_payment_date: None,
            payments_made: 0,
            late_payments: 0,
            purpose,
            collateral_required,
            cosigner_id,
            special_conditions,
        }
    }

    /// Calculate next payment due date
    pub fn next_payment_due(&self) -> Timestamp {
        if self.payments_made == 0 {
            self.first_payment_due
        } else {
            self.first_payment_due + months_to_nanos(self.payments_made)
        }
    }

    /// Check if payment is overdue
    pub fn is_overdue(&self) -> bool {
        if self.status != LoanStatus::Active {
            return false;
        }
        current_time() > self.next_payment_due()
    }

    /// Calculate days overdue
    pub fn days_overdue(&self) -> u64 {
        if !self.is_overdue() {
            return 0;
        }
        let overdue_nanos = current_time() - self.next_payment_due();
        overdue_nanos / days_to_nanos(1)
    }

    /// Calculate total interest paid so far
    pub fn total_interest_paid(&self) -> Amount {
        let total_paid = self.monthly_payment * self.payments_made as u64;
        let principal_paid = self.original_amount - self.current_balance;
        total_paid.saturating_sub(principal_paid)
    }

    /// Calculate remaining term in months
    pub fn remaining_term_months(&self) -> u32 {
        self.term_months.saturating_sub(self.payments_made)
    }

    /// Calculate total interest that will be paid over the life of the loan
    pub fn calculate_total_interest(&self) -> Amount {
        let total_payments = self.monthly_payment * self.term_months as u64;
        total_payments.saturating_sub(self.original_amount)
    }
}

impl Timestamped for Loan {
    fn created_at(&self) -> Timestamp {
        self.created_at
    }

    fn updated_at(&self) -> Timestamp {
        self.last_payment_date.unwrap_or(self.created_at)
    }

    fn set_updated_at(&mut self, timestamp: Timestamp) {
        self.last_payment_date = Some(timestamp);
    }
}

impl Identifiable for Loan {
    fn id(&self) -> &str {
        &self.id
    }
}

/// Loan status enumeration
#[derive(CandidType, Deserialize, Clone, Debug, PartialEq, Serialize)]
pub enum LoanStatus {
    Active,
    Late,
    Default,
    PaidOff,
    Deferred,
    InGracePeriod,
    Cancelled,
}

/// Payment record for tracking all transactions
#[derive(CandidType, Deserialize, Clone, Debug, Serialize)]
pub struct Payment {
    pub id: String,
    pub loan_id: String,
    pub student_id: Principal,
    pub amount: Amount,
    pub principal_portion: Amount,
    pub interest_portion: Amount,
    pub late_fee: Amount,
    pub payment_type: PaymentType,
    pub payment_method: PaymentMethod,
    pub status: PaymentStatus,
    pub created_at: Timestamp,
    pub processed_at: Option<Timestamp>,
    pub transaction_hash: Option<String>,
    pub notes: String,
}

impl Payment {
    pub fn new(
        id: String,
        loan_id: String,
        student_id: Principal,
        amount: Amount,
        principal_portion: Amount,
        interest_portion: Amount,
        late_fee: Amount,
        payment_type: PaymentType,
        payment_method: PaymentMethod,
    ) -> Self {
        Self {
            id,
            loan_id,
            student_id,
            amount,
            principal_portion,
            interest_portion,
            late_fee,
            payment_type,
            payment_method,
            status: PaymentStatus::Pending,
            created_at: current_time(),
            processed_at: None,
            transaction_hash: None,
            notes: String::new(),
        }
    }
}

impl Timestamped for Payment {
    fn created_at(&self) -> Timestamp {
        self.created_at
    }

    fn updated_at(&self) -> Timestamp {
        self.processed_at.unwrap_or(self.created_at)
    }

    fn set_updated_at(&mut self, timestamp: Timestamp) {
        self.processed_at = Some(timestamp);
    }
}

impl Identifiable for Payment {
    fn id(&self) -> &str {
        &self.id
    }
}

/// Payment type enumeration
#[derive(CandidType, Deserialize, Clone, Debug, PartialEq, Serialize)]
pub enum PaymentType {
    Regular,
    EarlyPayment,
    LatePayment,
    PartialPayment,
    FullPayoff,
    LateFee,
}

/// Payment method enumeration
#[derive(CandidType, Deserialize, Clone, Debug, PartialEq, Serialize)]
pub enum PaymentMethod {
    ICP,
    BankTransfer,
    CreditCard,
    Other(String),
}

/// Payment status enumeration
#[derive(CandidType, Deserialize, Clone, Debug, PartialEq, Serialize)]
pub enum PaymentStatus {
    Pending,
    Processing,
    Completed,
    Failed,
    Cancelled,
    Refunded,
}

/// Treasury configuration for fund management
#[derive(CandidType, Deserialize, Clone, Debug, Serialize)]
pub struct TreasuryConfig {
    pub total_funds: Amount,
    pub available_funds: Amount,
    pub reserved_funds: Amount,
    pub minimum_reserve_ratio: Percentage,
    pub maximum_loan_to_fund_ratio: Percentage,
    pub interest_reserve_ratio: Percentage,
    pub emergency_fund_ratio: Percentage,
    pub auto_rebalance_enabled: bool,
    pub last_rebalance: Timestamp,
}

impl Default for TreasuryConfig {
    fn default() -> Self {
        Self {
            total_funds: 1_000_000_00, // $1M initial treasury
            available_funds: 800_000_00, // $800K available for loans
            reserved_funds: 200_000_00, // $200K reserved
            minimum_reserve_ratio: 0.15, // 15% minimum reserve
            maximum_loan_to_fund_ratio: 0.80, // 80% max loan-to-fund ratio
            interest_reserve_ratio: 0.05, // 5% for interest payments
            emergency_fund_ratio: 0.10, // 10% emergency fund
            auto_rebalance_enabled: true,
            last_rebalance: current_time(),
        }
    }
}

/// Treasury statistics for monitoring
#[derive(CandidType, Deserialize, Clone, Debug, Default, Serialize)]
pub struct TreasuryStats {
    pub total_loans_outstanding: Amount,
    pub total_loans_disbursed: Amount,
    pub total_payments_received: Amount,
    pub total_interest_earned: Amount,
    pub total_defaults: Amount,
    pub active_loan_count: u32,
    pub default_rate: Percentage,
    pub average_loan_size: Amount,
    pub portfolio_yield: Percentage,
}
