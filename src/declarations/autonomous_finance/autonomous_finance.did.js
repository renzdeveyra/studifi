export const idlFactory = ({ IDL }) => {
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
  const StudiFiResult = IDL.Variant({ 'Ok' : IDL.Null, 'Err' : StudiFiError });
  const PaymentBreakdown = IDL.Record({
    'total_amount' : IDL.Nat64,
    'interest_portion' : IDL.Nat64,
    'principal_portion' : IDL.Nat64,
    'late_fee' : IDL.Nat64,
    'remaining_balance' : IDL.Nat64,
  });
  const StudiFiResultBreakdown = IDL.Variant({
    'Ok' : PaymentBreakdown,
    'Err' : StudiFiError,
  });
  const LoanStatus = IDL.Variant({
    'Late' : IDL.Null,
    'Active' : IDL.Null,
    'InGracePeriod' : IDL.Null,
    'Default' : IDL.Null,
    'PaidOff' : IDL.Null,
    'Cancelled' : IDL.Null,
    'Deferred' : IDL.Null,
  });
  const Loan = IDL.Record({
    'id' : IDL.Text,
    'status' : LoanStatus,
    'late_payments' : IDL.Nat32,
    'original_amount' : IDL.Nat64,
    'special_conditions' : IDL.Vec(IDL.Text),
    'current_balance' : IDL.Nat64,
    'student_id' : IDL.Principal,
    'first_payment_due' : IDL.Nat64,
    'created_at' : IDL.Nat64,
    'cosigner_id' : IDL.Opt(IDL.Principal),
    'collateral_required' : IDL.Bool,
    'grace_period_months' : IDL.Nat32,
    'interest_rate' : IDL.Float64,
    'origination_fee' : IDL.Nat64,
    'term_months' : IDL.Nat32,
    'last_payment_date' : IDL.Opt(IDL.Nat64),
    'payments_made' : IDL.Nat32,
    'purpose' : IDL.Text,
    'monthly_payment' : IDL.Nat64,
  });
  const StudiFiResultLoan = IDL.Variant({ 'Ok' : Loan, 'Err' : StudiFiError });
  const EarlyPayoffInfo = IDL.Record({
    'is_eligible' : IDL.Bool,
    'prepayment_penalty' : IDL.Nat64,
    'interest_savings' : IDL.Nat64,
    'remaining_balance' : IDL.Nat64,
    'total_payoff_amount' : IDL.Nat64,
  });
  const StudiFiResultPayoffInfo = IDL.Variant({
    'Ok' : EarlyPayoffInfo,
    'Err' : StudiFiError,
  });
  const PaymentStatus = IDL.Variant({
    'Failed' : IDL.Null,
    'Refunded' : IDL.Null,
    'Cancelled' : IDL.Null,
    'Processing' : IDL.Null,
    'Completed' : IDL.Null,
    'Pending' : IDL.Null,
  });
  const PaymentType = IDL.Variant({
    'LateFee' : IDL.Null,
    'Regular' : IDL.Null,
    'PartialPayment' : IDL.Null,
    'FullPayoff' : IDL.Null,
    'EarlyPayment' : IDL.Null,
    'LatePayment' : IDL.Null,
  });
  const PaymentMethod = IDL.Variant({
    'ICP' : IDL.Null,
    'CreditCard' : IDL.Null,
    'BankTransfer' : IDL.Null,
    'Other' : IDL.Text,
  });
  const Payment = IDL.Record({
    'id' : IDL.Text,
    'status' : PaymentStatus,
    'loan_id' : IDL.Text,
    'transaction_hash' : IDL.Opt(IDL.Text),
    'payment_type' : PaymentType,
    'interest_portion' : IDL.Nat64,
    'student_id' : IDL.Principal,
    'created_at' : IDL.Nat64,
    'payment_method' : PaymentMethod,
    'notes' : IDL.Text,
    'principal_portion' : IDL.Nat64,
    'late_fee' : IDL.Nat64,
    'processed_at' : IDL.Opt(IDL.Nat64),
    'amount' : IDL.Nat64,
  });
  const StudentLoanStats = IDL.Record({
    'late_payments' : IDL.Nat32,
    'current_balance' : IDL.Nat64,
    'on_time_payments' : IDL.Nat32,
    'total_paid' : IDL.Nat64,
    'credit_score_impact' : IDL.Int32,
    'completed_loans' : IDL.Nat32,
    'active_loans' : IDL.Nat32,
    'total_borrowed' : IDL.Nat64,
  });
  const Statistics = IDL.Record({
    'total_amount' : IDL.Nat64,
    'completed_count' : IDL.Nat32,
    'active_count' : IDL.Nat32,
    'average_amount' : IDL.Nat64,
    'total_count' : IDL.Nat32,
    'failed_count' : IDL.Nat32,
  });
  const TreasuryConfig = IDL.Record({
    'available_funds' : IDL.Nat64,
    'maximum_loan_to_fund_ratio' : IDL.Float64,
    'interest_reserve_ratio' : IDL.Float64,
    'reserved_funds' : IDL.Nat64,
    'emergency_fund_ratio' : IDL.Float64,
    'last_rebalance' : IDL.Nat64,
    'total_funds' : IDL.Nat64,
    'minimum_reserve_ratio' : IDL.Float64,
    'auto_rebalance_enabled' : IDL.Bool,
  });
  const TreasuryHealthStatus = IDL.Variant({
    'Fair' : IDL.Null,
    'Good' : IDL.Null,
    'Poor' : IDL.Null,
    'Critical' : IDL.Null,
    'Excellent' : IDL.Null,
  });
  const TreasuryHealth = IDL.Record({
    'utilization_rate' : IDL.Float64,
    'available_funds' : IDL.Nat64,
    'default_rate' : IDL.Float64,
    'recommendations' : IDL.Vec(IDL.Text),
    'reserved_funds' : IDL.Nat64,
    'reserve_ratio' : IDL.Float64,
    'health_status' : TreasuryHealthStatus,
    'total_funds' : IDL.Nat64,
    'health_score' : IDL.Float64,
    'loan_to_fund_ratio' : IDL.Float64,
  });
  const TreasuryStats = IDL.Record({
    'default_rate' : IDL.Float64,
    'total_defaults' : IDL.Nat64,
    'active_loan_count' : IDL.Nat32,
    'average_loan_size' : IDL.Nat64,
    'total_interest_earned' : IDL.Nat64,
    'portfolio_yield' : IDL.Float64,
    'total_loans_outstanding' : IDL.Nat64,
    'total_payments_received' : IDL.Nat64,
    'total_loans_disbursed' : IDL.Nat64,
  });
  const StudiFiResultPayment = IDL.Variant({
    'Ok' : Payment,
    'Err' : StudiFiError,
  });
  return IDL.Service({
    'add_treasury_funds' : IDL.Func([IDL.Nat64, IDL.Text], [StudiFiResult], []),
    'calculate_payment_breakdown' : IDL.Func(
        [IDL.Text, IDL.Nat64],
        [StudiFiResultBreakdown],
        ['query'],
      ),
    'create_loan' : IDL.Func(
        [
          IDL.Principal,
          IDL.Nat64,
          IDL.Float64,
          IDL.Nat32,
          IDL.Nat32,
          IDL.Text,
          IDL.Bool,
          IDL.Opt(IDL.Principal),
          IDL.Vec(IDL.Text),
        ],
        [StudiFiResultLoan],
        [],
      ),
    'get_all_active_loans' : IDL.Func([], [IDL.Vec(Loan)], ['query']),
    'get_early_payoff_info' : IDL.Func(
        [IDL.Text],
        [StudiFiResultPayoffInfo],
        ['query'],
      ),
    'get_loan' : IDL.Func([IDL.Text], [IDL.Opt(Loan)], ['query']),
    'get_loan_payments' : IDL.Func([IDL.Text], [IDL.Vec(Payment)], ['query']),
    'get_my_loan_stats' : IDL.Func([], [StudentLoanStats], ['query']),
    'get_my_loans' : IDL.Func([], [IDL.Vec(Loan)], ['query']),
    'get_my_payments' : IDL.Func([], [IDL.Vec(Payment)], ['query']),
    'get_overdue_loans' : IDL.Func([], [IDL.Vec(Loan)], ['query']),
    'get_payment' : IDL.Func([IDL.Text], [IDL.Opt(Payment)], ['query']),
    'get_platform_stats' : IDL.Func([], [Statistics], ['query']),
    'get_student_loan_stats' : IDL.Func(
        [IDL.Principal],
        [StudentLoanStats],
        ['query'],
      ),
    'get_student_loans' : IDL.Func([IDL.Principal], [IDL.Vec(Loan)], ['query']),
    'get_treasury_config' : IDL.Func([], [TreasuryConfig], ['query']),
    'get_treasury_health' : IDL.Func([], [TreasuryHealth], ['query']),
    'get_treasury_stats' : IDL.Func([], [TreasuryStats], ['query']),
    'make_early_payoff' : IDL.Func(
        [IDL.Text, PaymentMethod],
        [StudiFiResultPayment],
        [],
      ),
    'process_payment' : IDL.Func(
        [IDL.Text, IDL.Nat64, PaymentMethod],
        [StudiFiResultPayment],
        [],
      ),
    'rebalance_treasury' : IDL.Func([], [StudiFiResult], []),
    'run_automation_tasks' : IDL.Func([], [StudiFiResult], []),
    'update_loan_status' : IDL.Func(
        [IDL.Text, LoanStatus],
        [StudiFiResultLoan],
        [],
      ),
    'update_treasury_config' : IDL.Func([TreasuryConfig], [StudiFiResult], []),
    'withdraw_treasury_funds' : IDL.Func(
        [IDL.Nat64, IDL.Text],
        [StudiFiResult],
        [],
      ),
  });
};
export const init = ({ IDL }) => { return []; };
