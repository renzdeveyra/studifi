import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface EarlyPayoffInfo {
  'is_eligible' : boolean,
  'prepayment_penalty' : bigint,
  'interest_savings' : bigint,
  'remaining_balance' : bigint,
  'total_payoff_amount' : bigint,
}
export interface Loan {
  'id' : string,
  'status' : LoanStatus,
  'late_payments' : number,
  'original_amount' : bigint,
  'special_conditions' : Array<string>,
  'current_balance' : bigint,
  'student_id' : Principal,
  'first_payment_due' : bigint,
  'created_at' : bigint,
  'cosigner_id' : [] | [Principal],
  'collateral_required' : boolean,
  'grace_period_months' : number,
  'interest_rate' : number,
  'origination_fee' : bigint,
  'term_months' : number,
  'last_payment_date' : [] | [bigint],
  'payments_made' : number,
  'purpose' : string,
  'monthly_payment' : bigint,
}
export type LoanStatus = { 'Late' : null } |
  { 'Active' : null } |
  { 'InGracePeriod' : null } |
  { 'Default' : null } |
  { 'PaidOff' : null } |
  { 'Cancelled' : null } |
  { 'Deferred' : null };
export interface Payment {
  'id' : string,
  'status' : PaymentStatus,
  'loan_id' : string,
  'transaction_hash' : [] | [string],
  'payment_type' : PaymentType,
  'interest_portion' : bigint,
  'student_id' : Principal,
  'created_at' : bigint,
  'payment_method' : PaymentMethod,
  'notes' : string,
  'principal_portion' : bigint,
  'late_fee' : bigint,
  'processed_at' : [] | [bigint],
  'amount' : bigint,
}
export interface PaymentBreakdown {
  'total_amount' : bigint,
  'interest_portion' : bigint,
  'principal_portion' : bigint,
  'late_fee' : bigint,
  'remaining_balance' : bigint,
}
export type PaymentMethod = { 'ICP' : null } |
  { 'CreditCard' : null } |
  { 'BankTransfer' : null } |
  { 'Other' : string };
export type PaymentStatus = { 'Failed' : null } |
  { 'Refunded' : null } |
  { 'Cancelled' : null } |
  { 'Processing' : null } |
  { 'Completed' : null } |
  { 'Pending' : null };
export type PaymentType = { 'LateFee' : null } |
  { 'Regular' : null } |
  { 'PartialPayment' : null } |
  { 'FullPayoff' : null } |
  { 'EarlyPayment' : null } |
  { 'LatePayment' : null };
export interface Statistics {
  'total_amount' : bigint,
  'completed_count' : number,
  'active_count' : number,
  'average_amount' : bigint,
  'total_count' : number,
  'failed_count' : number,
}
export interface StudentLoanStats {
  'late_payments' : number,
  'current_balance' : bigint,
  'on_time_payments' : number,
  'total_paid' : bigint,
  'credit_score_impact' : number,
  'completed_loans' : number,
  'active_loans' : number,
  'total_borrowed' : bigint,
}
export type StudiFiError = { 'InvalidInput' : string } |
  { 'NetworkError' : string } |
  { 'NotFound' : string } |
  { 'Unauthorized' : string } |
  { 'AlreadyExists' : string } |
  { 'InternalError' : string } |
  { 'Expired' : string } |
  { 'InsufficientFunds' : string };
export type StudiFiResult = { 'Ok' : null } |
  { 'Err' : StudiFiError };
export type StudiFiResultBreakdown = { 'Ok' : PaymentBreakdown } |
  { 'Err' : StudiFiError };
export type StudiFiResultLoan = { 'Ok' : Loan } |
  { 'Err' : StudiFiError };
export type StudiFiResultPayment = { 'Ok' : Payment } |
  { 'Err' : StudiFiError };
export type StudiFiResultPayoffInfo = { 'Ok' : EarlyPayoffInfo } |
  { 'Err' : StudiFiError };
export interface TreasuryConfig {
  'available_funds' : bigint,
  'maximum_loan_to_fund_ratio' : number,
  'interest_reserve_ratio' : number,
  'reserved_funds' : bigint,
  'emergency_fund_ratio' : number,
  'last_rebalance' : bigint,
  'total_funds' : bigint,
  'minimum_reserve_ratio' : number,
  'auto_rebalance_enabled' : boolean,
}
export interface TreasuryHealth {
  'utilization_rate' : number,
  'available_funds' : bigint,
  'default_rate' : number,
  'recommendations' : Array<string>,
  'reserved_funds' : bigint,
  'reserve_ratio' : number,
  'health_status' : TreasuryHealthStatus,
  'total_funds' : bigint,
  'health_score' : number,
  'loan_to_fund_ratio' : number,
}
export type TreasuryHealthStatus = { 'Fair' : null } |
  { 'Good' : null } |
  { 'Poor' : null } |
  { 'Critical' : null } |
  { 'Excellent' : null };
export interface TreasuryStats {
  'default_rate' : number,
  'total_defaults' : bigint,
  'active_loan_count' : number,
  'average_loan_size' : bigint,
  'total_interest_earned' : bigint,
  'portfolio_yield' : number,
  'total_loans_outstanding' : bigint,
  'total_payments_received' : bigint,
  'total_loans_disbursed' : bigint,
}
export interface _SERVICE {
  'add_treasury_funds' : ActorMethod<[bigint, string], StudiFiResult>,
  'calculate_payment_breakdown' : ActorMethod<
    [string, bigint],
    StudiFiResultBreakdown
  >,
  'create_loan' : ActorMethod<
    [
      Principal,
      bigint,
      number,
      number,
      number,
      string,
      boolean,
      [] | [Principal],
      Array<string>,
    ],
    StudiFiResultLoan
  >,
  'get_all_active_loans' : ActorMethod<[], Array<Loan>>,
  'get_early_payoff_info' : ActorMethod<[string], StudiFiResultPayoffInfo>,
  'get_loan' : ActorMethod<[string], [] | [Loan]>,
  'get_loan_payments' : ActorMethod<[string], Array<Payment>>,
  'get_my_loan_stats' : ActorMethod<[], StudentLoanStats>,
  'get_my_loans' : ActorMethod<[], Array<Loan>>,
  'get_my_payments' : ActorMethod<[], Array<Payment>>,
  'get_overdue_loans' : ActorMethod<[], Array<Loan>>,
  'get_payment' : ActorMethod<[string], [] | [Payment]>,
  'get_platform_stats' : ActorMethod<[], Statistics>,
  'get_student_loan_stats' : ActorMethod<[Principal], StudentLoanStats>,
  'get_student_loans' : ActorMethod<[Principal], Array<Loan>>,
  'get_treasury_config' : ActorMethod<[], TreasuryConfig>,
  'get_treasury_health' : ActorMethod<[], TreasuryHealth>,
  'get_treasury_stats' : ActorMethod<[], TreasuryStats>,
  'make_early_payoff' : ActorMethod<
    [string, PaymentMethod],
    StudiFiResultPayment
  >,
  'process_payment' : ActorMethod<
    [string, bigint, PaymentMethod],
    StudiFiResultPayment
  >,
  'rebalance_treasury' : ActorMethod<[], StudiFiResult>,
  'run_automation_tasks' : ActorMethod<[], StudiFiResult>,
  'update_loan_status' : ActorMethod<[string, LoanStatus], StudiFiResultLoan>,
  'update_treasury_config' : ActorMethod<[TreasuryConfig], StudiFiResult>,
  'withdraw_treasury_funds' : ActorMethod<[bigint, string], StudiFiResult>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
