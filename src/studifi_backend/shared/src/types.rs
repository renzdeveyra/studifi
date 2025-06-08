use candid::{CandidType, Deserialize, Principal};

/// Common result type used across all canisters
pub type StudiFiResult<T> = Result<T, StudiFiError>;

/// Standardized error types for the StudiFi platform
#[derive(CandidType, Deserialize, Clone, Debug, thiserror::Error)]
pub enum StudiFiError {
    #[error("Not found: {0}")]
    NotFound(String),

    #[error("Already exists: {0}")]
    AlreadyExists(String),

    #[error("Unauthorized: {0}")]
    Unauthorized(String),

    #[error("Invalid input: {0}")]
    InvalidInput(String),

    #[error("Internal error: {0}")]
    InternalError(String),

    #[error("Insufficient funds: {0}")]
    InsufficientFunds(String),

    #[error("Expired: {0}")]
    Expired(String),

    #[error("Network error: {0}")]
    NetworkError(String),

    #[error("External service error: {0}")]
    ExternalServiceError(String),
}

/// Common timestamp type (nanoseconds since Unix epoch)
pub type Timestamp = u64;

/// Common amount type for financial calculations
pub type Amount = u64;

/// Common percentage type (0.0 to 1.0)
pub type Percentage = f64;

/// Common ID type for entities
pub type EntityId = String;

/// Platform-wide constants and limits
#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct PlatformLimits {
    pub max_loan_amount: Amount,
    pub min_loan_amount: Amount,
    pub max_loan_term_months: u32,
    pub min_loan_term_months: u32,
    pub max_interest_rate: Percentage,
    pub min_credit_score: u32,
    pub max_credit_score: u32,
}

impl Default for PlatformLimits {
    fn default() -> Self {
        Self {
            max_loan_amount: 50_000_00, // $50,000 in cents
            min_loan_amount: 100_00,    // $100 in cents
            max_loan_term_months: 120,  // 10 years
            min_loan_term_months: 6,    // 6 months
            max_interest_rate: 0.25,    // 25%
            min_credit_score: 0,
            max_credit_score: 1000,
        }
    }
}

/// Common validation trait
pub trait Validate {
    fn validate(&self) -> StudiFiResult<()>;
}

/// Common entity trait for items with timestamps
pub trait Timestamped {
    fn created_at(&self) -> Timestamp;
    fn updated_at(&self) -> Timestamp;
    fn set_updated_at(&mut self, timestamp: Timestamp);
}

/// Common entity trait for items with IDs
pub trait Identifiable {
    fn id(&self) -> &str;
}

/// Pagination parameters
#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct PaginationParams {
    pub offset: u32,
    pub limit: u32,
}

impl Default for PaginationParams {
    fn default() -> Self {
        Self {
            offset: 0,
            limit: 50,
        }
    }
}

/// Paginated response wrapper
#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct PaginatedResponse<T> {
    pub items: Vec<T>,
    pub total_count: u32,
    pub offset: u32,
    pub limit: u32,
    pub has_more: bool,
}

impl<T> PaginatedResponse<T> {
    pub fn new(items: Vec<T>, total_count: u32, offset: u32, limit: u32) -> Self {
        let has_more = offset + (items.len() as u32) < total_count;
        Self {
            items,
            total_count,
            offset,
            limit,
            has_more,
        }
    }
}

/// Common statistics structure
#[derive(CandidType, Deserialize, Clone, Debug, Default)]
pub struct Statistics {
    pub total_count: u32,
    pub active_count: u32,
    pub completed_count: u32,
    pub failed_count: u32,
    pub total_amount: Amount,
    pub average_amount: Amount,
}

/// Inter-canister call types
#[derive(CandidType, Deserialize, Clone, Debug)]
pub enum CanisterCall {
    IdentityManager(IdentityManagerCall),
    IntelligentCredit(IntelligentCreditCall),
    AutonomousFinance(AutonomousFinanceCall),
    GovernanceEngine(GovernanceEngineCall),
    ComplianceGateway(ComplianceGatewayCall),
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub enum IdentityManagerCall {
    GetStudentProfile(Principal),
    VerifyStudent(Principal),
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub enum IntelligentCreditCall {
    GetCreditScore(Principal),
    ProcessApplication(String),
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub enum AutonomousFinanceCall {
    CreateLoan(Principal, Amount, Percentage, u32, u32),
    ProcessPayment(String, Amount),
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub enum GovernanceEngineCall {
    GetStakeholder(Principal),
    ExecuteProposal(String),
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub enum ComplianceGatewayCall {
    PerformKycCheck(Principal),
    LogAuditEvent(Principal, String, String),
}
