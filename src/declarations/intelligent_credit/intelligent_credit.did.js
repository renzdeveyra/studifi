export const idlFactory = ({ IDL }) => {
  const LoanPurpose = IDL.Variant({
    'StudyAbroad' : IDL.Null,
    'Research' : IDL.Null,
    'Tuition' : IDL.Null,
    'LivingExpenses' : IDL.Null,
    'Technology' : IDL.Null,
    'Emergency' : IDL.Null,
    'Other' : IDL.Text,
    'BooksAndSupplies' : IDL.Null,
  });
  const LoanTerms = IDL.Record({
    'special_conditions' : IDL.Vec(IDL.Text),
    'prepayment_penalty' : IDL.Bool,
    'cosigner_required' : IDL.Bool,
    'collateral_required' : IDL.Bool,
    'grace_period_months' : IDL.Nat32,
    'interest_rate' : IDL.Float64,
    'origination_fee' : IDL.Nat64,
    'approved_amount' : IDL.Nat64,
    'term_months' : IDL.Nat32,
    'monthly_payment' : IDL.Nat64,
  });
  const StudiFiError = IDL.Variant({
    'InvalidInput' : IDL.Text,
    'NetworkError' : IDL.Text,
    'NotFound' : IDL.Text,
    'Unauthorized' : IDL.Text,
    'AlreadyExists' : IDL.Text,
    'InternalError' : IDL.Text,
    'Expired' : IDL.Text,
    'InsufficientFunds' : IDL.Text,
  });
  const StudiFiResultTerms = IDL.Variant({
    'Ok' : LoanTerms,
    'Err' : StudiFiError,
  });
  const ApplicationStatus = IDL.Variant({
    'RequiresDocuments' : IDL.Null,
    'UnderReview' : IDL.Null,
    'Approved' : IDL.Null,
    'Withdrawn' : IDL.Null,
    'Rejected' : IDL.Null,
    'Submitted' : IDL.Null,
    'Expired' : IDL.Null,
  });
  const FinancialAid = IDL.Record({
    'renewable' : IDL.Bool,
    'aid_type' : IDL.Text,
    'requirements' : IDL.Text,
    'amount' : IDL.Nat64,
  });
  const LoanStatus = IDL.Variant({
    'Late' : IDL.Null,
    'Default' : IDL.Null,
    'PaidOff' : IDL.Null,
    'Current' : IDL.Null,
    'Deferred' : IDL.Null,
  });
  const PreviousLoan = IDL.Record({
    'status' : LoanStatus,
    'late_payments' : IDL.Nat32,
    'original_amount' : IDL.Nat64,
    'on_time_payments' : IDL.Nat32,
    'loan_type' : IDL.Text,
    'remaining_balance' : IDL.Nat64,
    'monthly_payment' : IDL.Nat64,
  });
  const EmploymentStatus = IDL.Variant({
    'Internship' : IDL.Null,
    'Unemployed' : IDL.Null,
    'PartTime' : IDL.Null,
    'FullTime' : IDL.Null,
    'ResearchAssistant' : IDL.Null,
    'Fellowship' : IDL.Null,
    'TeachingAssistant' : IDL.Null,
  });
  const FinancialInfo = IDL.Record({
    'financial_aid' : IDL.Vec(FinancialAid),
    'previous_loans' : IDL.Vec(PreviousLoan),
    'monthly_expenses' : IDL.Nat64,
    'credit_history_length_months' : IDL.Nat32,
    'family_income' : IDL.Nat64,
    'existing_debt' : IDL.Nat64,
    'savings' : IDL.Nat64,
    'employment_status' : EmploymentStatus,
    'monthly_income' : IDL.Nat64,
  });
  const RiskLevel = IDL.Variant({
    'Low' : IDL.Null,
    'VeryHigh' : IDL.Null,
    'High' : IDL.Null,
    'Medium' : IDL.Null,
    'VeryLow' : IDL.Null,
  });
  const CreditScore = IDL.Record({
    'score' : IDL.Nat32,
    'version' : IDL.Text,
    'risk_level' : RiskLevel,
    'calculated_at' : IDL.Nat64,
    'confidence' : IDL.Float64,
  });
  const AcademicInfo = IDL.Record({
    'gpa' : IDL.Float64,
    'major' : IDL.Opt(IDL.Text),
    'minor' : IDL.Opt(IDL.Text),
    'previous_degrees' : IDL.Vec(IDL.Text),
    'university' : IDL.Text,
    'expected_graduation' : IDL.Text,
    'year_of_study' : IDL.Nat32,
    'honors' : IDL.Vec(IDL.Text),
    'extracurricular' : IDL.Vec(IDL.Text),
    'program' : IDL.Text,
  });
  const LoanApplication = IDL.Record({
    'id' : IDL.Text,
    'status' : ApplicationStatus,
    'requested_amount' : IDL.Nat64,
    'loan_terms' : IDL.Opt(LoanTerms),
    'student_id' : IDL.Principal,
    'created_at' : IDL.Nat64,
    'notes' : IDL.Vec(IDL.Text),
    'processed_at' : IDL.Opt(IDL.Nat64),
    'financial_info' : FinancialInfo,
    'credit_score' : IDL.Opt(CreditScore),
    'purpose' : LoanPurpose,
    'academic_info' : AcademicInfo,
  });
  const ApplicationStats = IDL.Record({
    'approved_applications' : IDL.Nat32,
    'rejected_applications' : IDL.Nat32,
    'average_processing_time_hours' : IDL.Float64,
    'pending_applications' : IDL.Nat32,
    'total_applications' : IDL.Nat32,
    'average_credit_score' : IDL.Float64,
    'average_approved_amount' : IDL.Nat64,
    'approval_rate' : IDL.Float64,
  });
  const Statistics = IDL.Record({
    'total_amount' : IDL.Nat64,
    'completed_count' : IDL.Nat32,
    'active_count' : IDL.Nat32,
    'average_amount' : IDL.Nat64,
    'total_count' : IDL.Nat32,
    'failed_count' : IDL.Nat32,
  });
  const ScoringConfig = IDL.Record({
    'financial_weight' : IDL.Float64,
    'maximum_loan_to_income_ratio' : IDL.Float64,
    'historical_weight' : IDL.Float64,
    'minimum_score_for_approval' : IDL.Nat32,
    'academic_weight' : IDL.Float64,
    'progress_weight' : IDL.Float64,
    'program_weight' : IDL.Float64,
  });
  const StudiFiResult = IDL.Variant({
    'Ok' : LoanApplication,
    'Err' : StudiFiError,
  });
  const ApplicationFilters = IDL.Record({
    'status' : IDL.Opt(ApplicationStatus),
    'date_to' : IDL.Opt(IDL.Nat64),
    'min_amount' : IDL.Opt(IDL.Nat64),
    'date_from' : IDL.Opt(IDL.Nat64),
    'university' : IDL.Opt(IDL.Text),
    'risk_level' : IDL.Opt(RiskLevel),
    'max_amount' : IDL.Opt(IDL.Nat64),
    'program' : IDL.Opt(IDL.Text),
  });
  const PaginationParams = IDL.Record({
    'offset' : IDL.Nat32,
    'limit' : IDL.Nat32,
  });
  const PaginatedResponse = IDL.Record({
    'offset' : IDL.Nat32,
    'limit' : IDL.Nat32,
    'items' : IDL.Vec(LoanApplication),
    'total_count' : IDL.Nat32,
    'has_more' : IDL.Bool,
  });
  const StudiFiResultUnit = IDL.Variant({
    'Ok' : IDL.Null,
    'Err' : StudiFiError,
  });
  return IDL.Service({
    'generate_loan_terms' : IDL.Func(
        [IDL.Nat64, IDL.Nat32, LoanPurpose],
        [StudiFiResultTerms],
        ['query'],
      ),
    'get_application' : IDL.Func(
        [IDL.Text],
        [IDL.Opt(LoanApplication)],
        ['query'],
      ),
    'get_application_stats' : IDL.Func([], [ApplicationStats], ['query']),
    'get_credit_score' : IDL.Func(
        [IDL.Principal],
        [IDL.Opt(CreditScore)],
        ['query'],
      ),
    'get_my_applications' : IDL.Func([], [IDL.Vec(LoanApplication)], ['query']),
    'get_platform_stats' : IDL.Func([], [Statistics], ['query']),
    'get_scoring_config' : IDL.Func([], [ScoringConfig], ['query']),
    'process_application' : IDL.Func([IDL.Text], [StudiFiResult], []),
    'search_applications' : IDL.Func(
        [ApplicationFilters, IDL.Opt(PaginationParams)],
        [PaginatedResponse],
        ['query'],
      ),
    'submit_loan_application' : IDL.Func(
        [IDL.Nat64, LoanPurpose, AcademicInfo, FinancialInfo],
        [StudiFiResult],
        [],
      ),
    'update_scoring_config' : IDL.Func(
        [ScoringConfig],
        [StudiFiResultUnit],
        [],
      ),
  });
};
export const init = ({ IDL }) => { return []; };
