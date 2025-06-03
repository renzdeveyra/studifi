use candid::{CandidType, Deserialize, Principal};
use serde::Serialize;
use shared::*;

/// Enhanced credit score with confidence and historical tracking
#[derive(CandidType, Deserialize, Clone, Debug, Serialize)]
pub struct CreditScore {
    pub score: u32, // 0-1000 scale
    pub risk_level: RiskLevel,
    pub factors: Vec<CreditFactor>,
    pub confidence: f64, // Algorithm confidence (0.0-1.0)
    pub calculated_at: Timestamp,
    pub version: String, // Algorithm version for tracking
}

impl CreditScore {
    pub fn new(score: u32, factors: Vec<CreditFactor>, confidence: f64) -> Self {
        Self {
            score,
            risk_level: RiskLevel::from_score(score),
            factors,
            confidence,
            calculated_at: current_time(),
            version: "2.0".to_string(),
        }
    }
}

/// Risk levels with enhanced granularity
#[derive(CandidType, Deserialize, Clone, Debug, PartialEq, Serialize)]
pub enum RiskLevel {
    VeryLow,   // 800-1000
    Low,       // 650-799
    Medium,    // 500-649
    High,      // 350-499
    VeryHigh,  // 0-349
}

impl RiskLevel {
    pub fn from_score(score: u32) -> Self {
        match score {
            800..=1000 => RiskLevel::VeryLow,
            650..=799 => RiskLevel::Low,
            500..=649 => RiskLevel::Medium,
            350..=499 => RiskLevel::High,
            _ => RiskLevel::VeryHigh,
        }
    }

    pub fn to_interest_rate(&self) -> Percentage {
        match self {
            RiskLevel::VeryLow => INTEREST_RATE_VERY_LOW,
            RiskLevel::Low => INTEREST_RATE_LOW,
            RiskLevel::Medium => INTEREST_RATE_MEDIUM,
            RiskLevel::High => INTEREST_RATE_HIGH,
            RiskLevel::VeryHigh => INTEREST_RATE_VERY_HIGH,
        }
    }
}

/// Credit factor with enhanced impact analysis
#[derive(CandidType, Deserialize, Clone, Debug, Serialize)]
pub struct CreditFactor {
    pub name: String,
    pub weight: f64,
    pub score: f64,
    pub impact: String,
    pub category: FactorCategory,
    pub trend: Option<Trend>, // Historical trend if available
}

/// Factor categories for better organization
#[derive(CandidType, Deserialize, Clone, Debug, Serialize)]
pub enum FactorCategory {
    Academic,
    Financial,
    Program,
    Progress,
    Historical,
    External,
}

/// Trend analysis for factors
#[derive(CandidType, Deserialize, Clone, Debug, Serialize)]
pub enum Trend {
    Improving,
    Stable,
    Declining,
}

/// Enhanced loan application with more detailed information
#[derive(CandidType, Deserialize, Clone, Debug, Serialize)]
pub struct LoanApplication {
    pub id: String,
    pub student_id: Principal,
    pub requested_amount: Amount,
    pub purpose: LoanPurpose,
    pub academic_info: AcademicInfo,
    pub financial_info: FinancialInfo,
    pub status: ApplicationStatus,
    pub credit_score: Option<CreditScore>,
    pub loan_terms: Option<LoanTerms>,
    pub created_at: Timestamp,
    pub processed_at: Option<Timestamp>,
    pub notes: Vec<String>,
    pub risk_assessment: Option<RiskAssessment>,
}

impl Identifiable for LoanApplication {
    fn id(&self) -> &str {
        &self.id
    }
}

impl Timestamped for LoanApplication {
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

/// Loan purpose with predefined categories
#[derive(CandidType, Deserialize, Clone, Debug, Serialize)]
pub enum LoanPurpose {
    Tuition,
    BooksAndSupplies,
    LivingExpenses,
    Technology,
    Research,
    StudyAbroad,
    Emergency,
    Other(String),
}

impl LoanPurpose {
    pub fn risk_multiplier(&self) -> f64 {
        match self {
            LoanPurpose::Tuition => 0.8,
            LoanPurpose::BooksAndSupplies => 0.9,
            LoanPurpose::Technology => 0.9,
            LoanPurpose::Research => 0.85,
            LoanPurpose::StudyAbroad => 1.1,
            LoanPurpose::LivingExpenses => 1.0,
            LoanPurpose::Emergency => 1.2,
            LoanPurpose::Other(_) => 1.1,
        }
    }
}

/// Enhanced academic information
#[derive(CandidType, Deserialize, Clone, Debug, Serialize)]
pub struct AcademicInfo {
    pub gpa: f64,
    pub year_of_study: u32,
    pub program: String,
    pub university: String,
    pub expected_graduation: String,
    pub major: Option<String>,
    pub minor: Option<String>,
    pub honors: Vec<String>,
    pub extracurricular: Vec<String>,
    pub previous_degrees: Vec<String>,
}

impl Validate for AcademicInfo {
    fn validate(&self) -> StudiFiResult<()> {
        validate_gpa(self.gpa)?;
        
        if self.year_of_study < MIN_YEAR_OF_STUDY || self.year_of_study > MAX_YEAR_OF_STUDY {
            return Err(StudiFiError::InvalidInput(
                format!("Year of study must be between {} and {}", MIN_YEAR_OF_STUDY, MAX_YEAR_OF_STUDY)
            ));
        }
        
        if self.program.trim().is_empty() {
            return Err(StudiFiError::InvalidInput("Program cannot be empty".to_string()));
        }
        
        if self.university.trim().is_empty() {
            return Err(StudiFiError::InvalidInput("University cannot be empty".to_string()));
        }
        
        Ok(())
    }
}

/// Enhanced financial information
#[derive(CandidType, Deserialize, Clone, Debug, Serialize)]
pub struct FinancialInfo {
    pub monthly_income: Amount,
    pub monthly_expenses: Amount,
    pub existing_debt: Amount,
    pub family_income: Amount,
    pub savings: Amount,
    pub employment_status: EmploymentStatus,
    pub credit_history_length_months: u32,
    pub previous_loans: Vec<PreviousLoan>,
    pub financial_aid: Vec<FinancialAid>,
}

impl Validate for FinancialInfo {
    fn validate(&self) -> StudiFiResult<()> {
        // All amounts should be reasonable
        if self.monthly_income > 50_000_00 { // $50,000/month seems unreasonable for a student
            return Err(StudiFiError::InvalidInput("Monthly income seems unreasonably high".to_string()));
        }
        
        if self.monthly_expenses > self.monthly_income * 3 {
            return Err(StudiFiError::InvalidInput("Monthly expenses seem unreasonably high compared to income".to_string()));
        }
        
        Ok(())
    }
}

/// Employment status for students
#[derive(CandidType, Deserialize, Clone, Debug, Serialize)]
pub enum EmploymentStatus {
    Unemployed,
    PartTime,
    FullTime,
    Internship,
    Fellowship,
    TeachingAssistant,
    ResearchAssistant,
}

/// Previous loan information
#[derive(CandidType, Deserialize, Clone, Debug, Serialize)]
pub struct PreviousLoan {
    pub loan_type: String,
    pub original_amount: Amount,
    pub remaining_balance: Amount,
    pub monthly_payment: Amount,
    pub status: LoanStatus,
    pub on_time_payments: u32,
    pub late_payments: u32,
}

/// Financial aid information
#[derive(CandidType, Deserialize, Clone, Debug, Serialize)]
pub struct FinancialAid {
    pub aid_type: String,
    pub amount: Amount,
    pub renewable: bool,
    pub requirements: String,
}

/// Loan status
#[derive(CandidType, Deserialize, Clone, Debug, PartialEq, Serialize)]
pub enum LoanStatus {
    Current,
    Late,
    Default,
    PaidOff,
    Deferred,
}

/// Application status with more granular states
#[derive(CandidType, Deserialize, Clone, Debug, PartialEq, Serialize)]
pub enum ApplicationStatus {
    Submitted,
    UnderReview,
    RequiresDocuments,
    Approved,
    Rejected,
    Withdrawn,
    Expired,
}

/// Enhanced loan terms
#[derive(CandidType, Deserialize, Clone, Debug, Serialize)]
pub struct LoanTerms {
    pub approved_amount: Amount,
    pub interest_rate: Percentage,
    pub term_months: u32,
    pub monthly_payment: Amount,
    pub grace_period_months: u32,
    pub origination_fee: Amount,
    pub prepayment_penalty: bool,
    pub cosigner_required: bool,
    pub collateral_required: bool,
    pub special_conditions: Vec<String>,
}

impl LoanTerms {
    pub fn calculate_total_cost(&self) -> Amount {
        let total_payments = self.monthly_payment * self.term_months as u64;
        total_payments + self.origination_fee
    }
    
    pub fn calculate_total_interest(&self) -> Amount {
        self.calculate_total_cost() - self.approved_amount - self.origination_fee
    }
}

/// Risk assessment details
#[derive(CandidType, Deserialize, Clone, Debug, Serialize)]
pub struct RiskAssessment {
    pub overall_risk_score: f64,
    pub default_probability: f64,
    pub recommended_action: RecommendedAction,
    pub risk_factors: Vec<String>,
    pub mitigating_factors: Vec<String>,
    pub monitoring_requirements: Vec<String>,
}

/// Recommended actions based on risk assessment
#[derive(CandidType, Deserialize, Clone, Debug, Serialize)]
pub enum RecommendedAction {
    Approve,
    ApproveWithConditions,
    RequireAdditionalDocuments,
    RequireCosigner,
    ReduceLoanAmount,
    Reject,
    Defer,
}

/// Application analytics and statistics
#[derive(CandidType, Deserialize, Clone, Debug, Default, Serialize)]
pub struct ApplicationStats {
    pub total_applications: u32,
    pub approved_applications: u32,
    pub rejected_applications: u32,
    pub pending_applications: u32,
    pub average_credit_score: f64,
    pub average_approved_amount: Amount,
    pub average_processing_time_hours: f64,
    pub approval_rate: f64,
}

/// Credit scoring configuration
#[derive(CandidType, Deserialize, Clone, Debug, Serialize)]
pub struct ScoringConfig {
    pub academic_weight: f64,
    pub financial_weight: f64,
    pub program_weight: f64,
    pub progress_weight: f64,
    pub historical_weight: f64,
    pub minimum_score_for_approval: u32,
    pub maximum_loan_to_income_ratio: f64,
}

impl Default for ScoringConfig {
    fn default() -> Self {
        Self {
            academic_weight: CREDIT_WEIGHT_ACADEMIC,
            financial_weight: CREDIT_WEIGHT_FINANCIAL,
            program_weight: CREDIT_WEIGHT_PROGRAM,
            progress_weight: CREDIT_WEIGHT_PROGRESS,
            historical_weight: 0.0, // New factor
            minimum_score_for_approval: 500,
            maximum_loan_to_income_ratio: 3.0,
        }
    }
}

/// Application filters for searching
#[derive(CandidType, Deserialize, Clone, Debug, Default, Serialize)]
pub struct ApplicationFilters {
    pub status: Option<ApplicationStatus>,
    pub min_amount: Option<Amount>,
    pub max_amount: Option<Amount>,
    pub university: Option<String>,
    pub program: Option<String>,
    pub risk_level: Option<RiskLevel>,
    pub date_from: Option<Timestamp>,
    pub date_to: Option<Timestamp>,
}
