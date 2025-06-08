import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface AcademicInfo {
  'gpa' : number,
  'major' : [] | [string],
  'minor' : [] | [string],
  'previous_degrees' : Array<string>,
  'university' : string,
  'expected_graduation' : string,
  'year_of_study' : number,
  'honors' : Array<string>,
  'extracurricular' : Array<string>,
  'program' : string,
}
export interface ApplicationFilters {
  'status' : [] | [ApplicationStatus],
  'date_to' : [] | [bigint],
  'min_amount' : [] | [bigint],
  'date_from' : [] | [bigint],
  'university' : [] | [string],
  'risk_level' : [] | [RiskLevel],
  'max_amount' : [] | [bigint],
  'program' : [] | [string],
}
export interface ApplicationStats {
  'approved_applications' : number,
  'rejected_applications' : number,
  'average_processing_time_hours' : number,
  'pending_applications' : number,
  'total_applications' : number,
  'average_credit_score' : number,
  'average_approved_amount' : bigint,
  'approval_rate' : number,
}
export type ApplicationStatus = { 'RequiresDocuments' : null } |
  { 'UnderReview' : null } |
  { 'Approved' : null } |
  { 'Withdrawn' : null } |
  { 'Rejected' : null } |
  { 'Submitted' : null } |
  { 'Expired' : null };
export interface CreditScore {
  'score' : number,
  'version' : string,
  'risk_level' : RiskLevel,
  'calculated_at' : bigint,
  'confidence' : number,
}
export type EmploymentStatus = { 'Internship' : null } |
  { 'Unemployed' : null } |
  { 'PartTime' : null } |
  { 'FullTime' : null } |
  { 'ResearchAssistant' : null } |
  { 'Fellowship' : null } |
  { 'TeachingAssistant' : null };
export interface FinancialAid {
  'renewable' : boolean,
  'aid_type' : string,
  'requirements' : string,
  'amount' : bigint,
}
export interface FinancialInfo {
  'financial_aid' : Array<FinancialAid>,
  'previous_loans' : Array<PreviousLoan>,
  'monthly_expenses' : bigint,
  'credit_history_length_months' : number,
  'family_income' : bigint,
  'existing_debt' : bigint,
  'savings' : bigint,
  'employment_status' : EmploymentStatus,
  'monthly_income' : bigint,
}
export interface LoanApplication {
  'id' : string,
  'status' : ApplicationStatus,
  'requested_amount' : bigint,
  'loan_terms' : [] | [LoanTerms],
  'student_id' : Principal,
  'created_at' : bigint,
  'notes' : Array<string>,
  'processed_at' : [] | [bigint],
  'financial_info' : FinancialInfo,
  'credit_score' : [] | [CreditScore],
  'purpose' : LoanPurpose,
  'academic_info' : AcademicInfo,
}
export type LoanPurpose = { 'StudyAbroad' : null } |
  { 'Research' : null } |
  { 'Tuition' : null } |
  { 'LivingExpenses' : null } |
  { 'Technology' : null } |
  { 'Emergency' : null } |
  { 'Other' : string } |
  { 'BooksAndSupplies' : null };
export type LoanStatus = { 'Late' : null } |
  { 'Default' : null } |
  { 'PaidOff' : null } |
  { 'Current' : null } |
  { 'Deferred' : null };
export interface LoanTerms {
  'special_conditions' : Array<string>,
  'prepayment_penalty' : boolean,
  'cosigner_required' : boolean,
  'collateral_required' : boolean,
  'grace_period_months' : number,
  'interest_rate' : number,
  'origination_fee' : bigint,
  'approved_amount' : bigint,
  'term_months' : number,
  'monthly_payment' : bigint,
}
export interface PaginatedResponse {
  'offset' : number,
  'limit' : number,
  'items' : Array<LoanApplication>,
  'total_count' : number,
  'has_more' : boolean,
}
export interface PaginationParams { 'offset' : number, 'limit' : number }
export interface PreviousLoan {
  'status' : LoanStatus,
  'late_payments' : number,
  'original_amount' : bigint,
  'on_time_payments' : number,
  'loan_type' : string,
  'remaining_balance' : bigint,
  'monthly_payment' : bigint,
}
export type RiskLevel = { 'Low' : null } |
  { 'VeryHigh' : null } |
  { 'High' : null } |
  { 'Medium' : null } |
  { 'VeryLow' : null };
export interface ScoringConfig {
  'financial_weight' : number,
  'maximum_loan_to_income_ratio' : number,
  'historical_weight' : number,
  'minimum_score_for_approval' : number,
  'academic_weight' : number,
  'progress_weight' : number,
  'program_weight' : number,
}
export interface Statistics {
  'total_amount' : bigint,
  'completed_count' : number,
  'active_count' : number,
  'average_amount' : bigint,
  'total_count' : number,
  'failed_count' : number,
}
export type StudiFiError = { 'InvalidInput' : string } |
  { 'NetworkError' : string } |
  { 'NotFound' : string } |
  { 'Unauthorized' : string } |
  { 'AlreadyExists' : string } |
  { 'InternalError' : string } |
  { 'Expired' : string } |
  { 'InsufficientFunds' : string };
export type StudiFiResult = { 'Ok' : LoanApplication } |
  { 'Err' : StudiFiError };
export type StudiFiResultTerms = { 'Ok' : LoanTerms } |
  { 'Err' : StudiFiError };
export type StudiFiResultUnit = { 'Ok' : null } |
  { 'Err' : StudiFiError };
export interface _SERVICE {
  'generate_loan_terms' : ActorMethod<
    [bigint, number, LoanPurpose],
    StudiFiResultTerms
  >,
  'get_application' : ActorMethod<[string], [] | [LoanApplication]>,
  'get_application_stats' : ActorMethod<[], ApplicationStats>,
  'get_credit_score' : ActorMethod<[Principal], [] | [CreditScore]>,
  'get_my_applications' : ActorMethod<[], Array<LoanApplication>>,
  'get_platform_stats' : ActorMethod<[], Statistics>,
  'get_scoring_config' : ActorMethod<[], ScoringConfig>,
  'process_application' : ActorMethod<[string], StudiFiResult>,
  'search_applications' : ActorMethod<
    [ApplicationFilters, [] | [PaginationParams]],
    PaginatedResponse
  >,
  'submit_loan_application' : ActorMethod<
    [bigint, LoanPurpose, AcademicInfo, FinancialInfo],
    StudiFiResult
  >,
  'update_scoring_config' : ActorMethod<[ScoringConfig], StudiFiResultUnit>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
