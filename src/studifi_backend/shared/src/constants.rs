use crate::types::*;

/// Platform version
pub const PLATFORM_VERSION: &str = "1.0.0";

/// Default pagination limit
pub const DEFAULT_PAGE_LIMIT: u32 = 50;

/// Maximum pagination limit
pub const MAX_PAGE_LIMIT: u32 = 1000;

/// Credit score ranges
pub const CREDIT_SCORE_MIN: u32 = 0;
pub const CREDIT_SCORE_MAX: u32 = 1000;
pub const CREDIT_SCORE_EXCELLENT: u32 = 800;
pub const CREDIT_SCORE_GOOD: u32 = 650;
pub const CREDIT_SCORE_FAIR: u32 = 500;
pub const CREDIT_SCORE_POOR: u32 = 350;

/// Loan limits
pub const MIN_LOAN_AMOUNT: Amount = 100_00; // $100
pub const MAX_LOAN_AMOUNT: Amount = 50_000_00; // $50,000
pub const MIN_LOAN_TERM_MONTHS: u32 = 6;
pub const MAX_LOAN_TERM_MONTHS: u32 = 120; // 10 years

/// Interest rate limits
pub const MIN_INTEREST_RATE: Percentage = 0.0; // 0%
pub const MAX_INTEREST_RATE: Percentage = 0.25; // 25%

/// Grace period limits
pub const MIN_GRACE_PERIOD_MONTHS: u32 = 0;
pub const MAX_GRACE_PERIOD_MONTHS: u32 = 12;

/// GPA limits
pub const MIN_GPA: f64 = 0.0;
pub const MAX_GPA: f64 = 4.0;

/// Year of study limits
pub const MIN_YEAR_OF_STUDY: u32 = 1;
pub const MAX_YEAR_OF_STUDY: u32 = 8; // Including graduate studies

/// Voting period limits (in nanoseconds)
pub const MIN_VOTING_PERIOD: Timestamp = 24 * 60 * 60 * 1_000_000_000; // 1 day
pub const MAX_VOTING_PERIOD: Timestamp = 30 * 24 * 60 * 60 * 1_000_000_000; // 30 days
pub const DEFAULT_VOTING_PERIOD: Timestamp = 7 * 24 * 60 * 60 * 1_000_000_000; // 7 days

/// KYC/AML limits
pub const KYC_EXPIRY_PERIOD: Timestamp = 365 * 24 * 60 * 60 * 1_000_000_000; // 1 year
pub const AML_CHECK_THRESHOLD: Amount = 10_000_00; // $10,000

/// Risk assessment thresholds
pub const RISK_SCORE_LOW: f64 = 0.3;
pub const RISK_SCORE_MEDIUM: f64 = 0.6;
pub const RISK_SCORE_HIGH: f64 = 0.8;

/// Automation intervals (in seconds)
pub const AUTOMATION_INTERVAL_SECONDS: u64 = 3600; // 1 hour
pub const PAYMENT_REMINDER_DAYS: u64 = 7;
pub const OVERDUE_CHECK_DAYS: u64 = 1;

/// Treasury limits
pub const MIN_PROPOSAL_AMOUNT: Amount = 100_00; // $100
pub const MAX_PROPOSAL_AMOUNT: Amount = 1_000_000_00; // $1,000,000

/// Scholarship limits
pub const MIN_SCHOLARSHIP_AMOUNT: Amount = 500_00; // $500
pub const MAX_SCHOLARSHIP_AMOUNT: Amount = 100_000_00; // $100,000
pub const MAX_SCHOLARSHIP_RECIPIENTS: u32 = 100;

/// Text field limits
pub const MAX_NAME_LENGTH: usize = 100;
pub const MAX_EMAIL_LENGTH: usize = 254;
pub const MAX_DESCRIPTION_LENGTH: usize = 2000;
pub const MAX_TITLE_LENGTH: usize = 200;
pub const MAX_UNIVERSITY_NAME_LENGTH: usize = 200;
pub const MAX_PROGRAM_NAME_LENGTH: usize = 200;

/// ID prefixes
pub const STUDENT_PROFILE_PREFIX: &str = "STUDENT";
pub const LOAN_APPLICATION_PREFIX: &str = "APP";
pub const LOAN_PREFIX: &str = "LOAN";
pub const PAYMENT_PREFIX: &str = "PAY";
pub const PROPOSAL_PREFIX: &str = "PROP";
pub const SCHOLARSHIP_PREFIX: &str = "SCHOL";
pub const COMPLIANCE_RECORD_PREFIX: &str = "COMP";
pub const AUDIT_LOG_PREFIX: &str = "AUDIT";
pub const REPORT_PREFIX: &str = "RPT";

/// Error messages
pub const ERROR_UNAUTHORIZED: &str = "Unauthorized access";
pub const ERROR_NOT_FOUND: &str = "Resource not found";
pub const ERROR_ALREADY_EXISTS: &str = "Resource already exists";
pub const ERROR_INVALID_INPUT: &str = "Invalid input provided";
pub const ERROR_INSUFFICIENT_FUNDS: &str = "Insufficient funds";
pub const ERROR_EXPIRED: &str = "Resource has expired";
pub const ERROR_INTERNAL: &str = "Internal server error";

/// Success messages
pub const SUCCESS_CREATED: &str = "Resource created successfully";
pub const SUCCESS_UPDATED: &str = "Resource updated successfully";
pub const SUCCESS_DELETED: &str = "Resource deleted successfully";
pub const SUCCESS_PROCESSED: &str = "Request processed successfully";

/// Credit scoring weights
pub const CREDIT_WEIGHT_ACADEMIC: f64 = 0.4; // 40%
pub const CREDIT_WEIGHT_FINANCIAL: f64 = 0.3; // 30%
pub const CREDIT_WEIGHT_PROGRAM: f64 = 0.2; // 20%
pub const CREDIT_WEIGHT_PROGRESS: f64 = 0.1; // 10%

/// Program scoring (out of 100)
pub const PROGRAM_SCORE_STEM: f64 = 95.0;
pub const PROGRAM_SCORE_BUSINESS: f64 = 85.0;
pub const PROGRAM_SCORE_HEALTHCARE: f64 = 90.0;
pub const PROGRAM_SCORE_EDUCATION: f64 = 80.0;
pub const PROGRAM_SCORE_DEFAULT: f64 = 75.0;

/// Risk level mappings
pub const RISK_LEVEL_VERY_LOW_THRESHOLD: u32 = 800;
pub const RISK_LEVEL_LOW_THRESHOLD: u32 = 650;
pub const RISK_LEVEL_MEDIUM_THRESHOLD: u32 = 500;
pub const RISK_LEVEL_HIGH_THRESHOLD: u32 = 350;

/// Interest rates by risk level
pub const INTEREST_RATE_VERY_LOW: Percentage = 0.0; // 0%
pub const INTEREST_RATE_LOW: Percentage = 0.02; // 2%
pub const INTEREST_RATE_MEDIUM: Percentage = 0.05; // 5%
pub const INTEREST_RATE_HIGH: Percentage = 0.08; // 8%
pub const INTEREST_RATE_VERY_HIGH: Percentage = 0.12; // 12%

/// Stakeholder voting power
pub const VOTING_POWER_STUDENT: u64 = 10;
pub const VOTING_POWER_DONOR: u64 = 50;
pub const VOTING_POWER_UNIVERSITY: u64 = 100;
pub const VOTING_POWER_COMMUNITY: u64 = 5;
pub const VOTING_POWER_TEAM: u64 = 200;

/// Platform limits instance
pub fn get_platform_limits() -> PlatformLimits {
    PlatformLimits {
        max_loan_amount: MAX_LOAN_AMOUNT,
        min_loan_amount: MIN_LOAN_AMOUNT,
        max_loan_term_months: MAX_LOAN_TERM_MONTHS,
        min_loan_term_months: MIN_LOAN_TERM_MONTHS,
        max_interest_rate: MAX_INTEREST_RATE,
        min_credit_score: CREDIT_SCORE_MIN,
        max_credit_score: CREDIT_SCORE_MAX,
    }
}
