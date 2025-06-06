use crate::types::*;
use crate::storage::*;
use crate::treasury::*;
use shared::*;

/// Automation engine for scheduled tasks and loan management
pub struct AutomationEngine;

impl AutomationEngine {
    /// Run all scheduled automation tasks
    pub async fn run_scheduled_tasks() -> StudiFiResult<()> {
        ic_cdk::println!("Running scheduled automation tasks...");

        // Update loan statuses
        Self::update_loan_statuses().await?;

        // Process overdue loans
        Self::process_overdue_loans().await?;

        // Send payment reminders
        Self::send_payment_reminders().await?;

        // Rebalance treasury
        TreasuryEngine::rebalance_treasury()?;

        // Update interest accruals
        Self::update_interest_accruals().await?;

        ic_cdk::println!("Completed scheduled automation tasks");
        Ok(())
    }

    /// Update loan statuses based on current conditions
    async fn update_loan_statuses() -> StudiFiResult<()> {
        let active_loans = with_storage(|storage| storage.get_active_loans());

        for mut loan in active_loans {
            let old_status = loan.status.clone();
            let new_status = Self::determine_loan_status(&loan);

            if old_status != new_status {
                loan.status = new_status.clone();
                loan.set_updated_at(current_time());

                with_storage_mut(|storage| {
                    let _ = storage.update_loan(loan.id.clone(), loan.clone());
                });

                ic_cdk::println!(
                    "Updated loan {} status from {:?} to {:?}",
                    loan.id, old_status, new_status
                );

                // Handle status-specific actions
                match new_status {
                    LoanStatus::Default => {
                        Self::handle_loan_default(&loan).await?;
                    }
                    LoanStatus::Late => {
                        Self::apply_late_fees(&loan).await?;
                    }
                    _ => {}
                }
            }
        }

        Ok(())
    }

    /// Determine appropriate loan status based on current conditions
    fn determine_loan_status(loan: &Loan) -> LoanStatus {
        let now = current_time();
        let next_payment_due = loan.next_payment_due();

        // Check if in grace period
        if now < loan.first_payment_due {
            return LoanStatus::InGracePeriod;
        }

        // Check if paid off
        if loan.current_balance == 0 {
            return LoanStatus::PaidOff;
        }

        // Check if overdue
        if now > next_payment_due {
            let days_overdue = loan.days_overdue();
            
            // Default after 90 days overdue
            if days_overdue > 90 {
                return LoanStatus::Default;
            }
            // Late after 1 day overdue
            else if days_overdue > 0 {
                return LoanStatus::Late;
            }
        }

        LoanStatus::Active
    }

    /// Process overdue loans and apply appropriate actions
    async fn process_overdue_loans() -> StudiFiResult<()> {
        let overdue_loans = with_storage(|storage| storage.get_overdue_loans());

        for loan in overdue_loans {
            let days_overdue = loan.days_overdue();

            ic_cdk::println!(
                "Processing overdue loan {}: {} days overdue",
                loan.id, days_overdue
            );

            // Apply escalating actions based on days overdue
            match days_overdue {
                1..=7 => {
                    // Send reminder (handled in send_payment_reminders)
                }
                8..=30 => {
                    // Apply late fee if not already applied
                    Self::apply_late_fees(&loan).await?;
                }
                31..=60 => {
                    // Send urgent notice
                    Self::send_urgent_notice(&loan).await?;
                }
                61..=90 => {
                    // Final notice before default
                    Self::send_final_notice(&loan).await?;
                }
                _ => {
                    // Default handling is done in update_loan_statuses
                }
            }
        }

        Ok(())
    }

    /// Send payment reminders to students
    async fn send_payment_reminders() -> StudiFiResult<()> {
        let active_loans = with_storage(|storage| storage.get_active_loans());
        let reminder_threshold = days_to_nanos(PAYMENT_REMINDER_DAYS);

        for loan in active_loans {
            let next_payment_due = loan.next_payment_due();
            let time_until_due = next_payment_due.saturating_sub(current_time());

            // Send reminder if payment is due within reminder threshold
            if time_until_due <= reminder_threshold && time_until_due > 0 {
                Self::send_payment_reminder(&loan).await?;
            }
        }

        Ok(())
    }

    /// Send payment reminder to student
    async fn send_payment_reminder(loan: &Loan) -> StudiFiResult<()> {
        // In a real implementation, this would send an email or notification
        ic_cdk::println!(
            "Sending payment reminder for loan {} to student {:?}",
            loan.id, loan.student_id
        );

        // TODO: Integrate with notification system
        // This could call the compliance gateway to log the reminder
        
        Ok(())
    }

    /// Apply late fees to overdue loan
    async fn apply_late_fees(loan: &Loan) -> StudiFiResult<()> {
        // Check if late fee already applied for current period
        let payments = with_storage(|storage| storage.get_payments_by_loan(&loan.id));
        let current_period_start = loan.next_payment_due() - months_to_nanos(1);
        
        let late_fee_already_applied = payments.iter().any(|payment| {
            payment.payment_type == PaymentType::LateFee &&
            payment.created_at >= current_period_start
        });

        if late_fee_already_applied {
            return Ok(());
        }

        // Calculate late fee (5% of monthly payment, minimum $25)
        let late_fee = std::cmp::max(
            (loan.monthly_payment as f64 * 0.05) as Amount,
            25_00 // $25 minimum
        );

        // Create late fee payment record
        let payment_id = with_storage_mut(|storage| storage.get_next_payment_id());
        let late_fee_payment = Payment::new(
            payment_id,
            loan.id.clone(),
            loan.student_id,
            late_fee,
            0, // No principal portion
            0, // No interest portion
            late_fee,
            PaymentType::LateFee,
            PaymentMethod::ICP,
        );

        with_storage_mut(|storage| {
            storage.insert_payment(late_fee_payment.id.clone(), late_fee_payment);
        });

        ic_cdk::println!(
            "Applied late fee of {} to loan {}",
            format_currency(late_fee), loan.id
        );

        Ok(())
    }

    /// Send urgent notice for severely overdue loan
    async fn send_urgent_notice(loan: &Loan) -> StudiFiResult<()> {
        ic_cdk::println!(
            "Sending urgent notice for loan {} to student {:?}",
            loan.id, loan.student_id
        );

        // TODO: Integrate with notification system
        Ok(())
    }

    /// Send final notice before default
    async fn send_final_notice(loan: &Loan) -> StudiFiResult<()> {
        ic_cdk::println!(
            "Sending final notice for loan {} to student {:?}",
            loan.id, loan.student_id
        );

        // TODO: Integrate with notification system and compliance gateway
        Ok(())
    }

    /// Handle loan default
    async fn handle_loan_default(loan: &Loan) -> StudiFiResult<()> {
        ic_cdk::println!(
            "Handling default for loan {} with remaining balance {}",
            loan.id, format_currency(loan.current_balance)
        );

        // Update treasury to reflect the loss
        TreasuryEngine::handle_loan_default(loan.current_balance)?;

        // TODO: Integrate with compliance gateway for regulatory reporting
        // TODO: Integrate with governance for default handling policies

        Ok(())
    }

    /// Update interest accruals for all active loans
    async fn update_interest_accruals() -> StudiFiResult<()> {
        let active_loans = with_storage(|storage| storage.get_active_loans());

        for mut loan in active_loans {
            // Calculate daily interest accrual
            let daily_rate = loan.interest_rate / 365.0;
            let daily_interest = (loan.current_balance as f64 * daily_rate) as Amount;

            // Add accrued interest to balance (compound daily)
            loan.current_balance += daily_interest;
            loan.set_updated_at(current_time());

            with_storage_mut(|storage| {
                let _ = storage.update_loan(loan.id.clone(), loan);
            });
        }

        Ok(())
    }

    /// Calculate payment breakdown for a loan payment
    pub fn calculate_payment_breakdown(
        loan: &Loan,
        payment_amount: Amount,
    ) -> PaymentBreakdown {
        // Calculate interest portion (current balance * monthly rate)
        let monthly_rate = loan.interest_rate / 12.0;
        let interest_portion = (loan.current_balance as f64 * monthly_rate) as Amount;
        
        // Remaining goes to principal
        let principal_portion = payment_amount.saturating_sub(interest_portion);
        
        // Ensure we don't pay more principal than remaining balance
        let actual_principal = std::cmp::min(principal_portion, loan.current_balance);
        let actual_interest = payment_amount.saturating_sub(actual_principal);

        PaymentBreakdown {
            total_amount: payment_amount,
            principal_portion: actual_principal,
            interest_portion: actual_interest,
            late_fee: 0, // Late fees are handled separately
            remaining_balance: loan.current_balance.saturating_sub(actual_principal),
        }
    }

    /// Check if loan is eligible for early payoff
    pub fn check_early_payoff_eligibility(loan: &Loan) -> EarlyPayoffInfo {
        let remaining_balance = loan.current_balance;
        let prepayment_penalty = if loan.special_conditions.contains(&"no_prepayment_penalty".to_string()) {
            0
        } else {
            // 2% of remaining balance as prepayment penalty
            (remaining_balance as f64 * 0.02) as Amount
        };

        let total_payoff_amount = remaining_balance + prepayment_penalty;
        let interest_savings = loan.calculate_total_interest() - loan.total_interest_paid();

        EarlyPayoffInfo {
            remaining_balance,
            prepayment_penalty,
            total_payoff_amount,
            interest_savings,
            is_eligible: true, // Most loans are eligible for early payoff
        }
    }
}

/// Payment breakdown structure
#[derive(candid::CandidType, candid::Deserialize, Clone, Debug, serde::Serialize)]
pub struct PaymentBreakdown {
    pub total_amount: Amount,
    pub principal_portion: Amount,
    pub interest_portion: Amount,
    pub late_fee: Amount,
    pub remaining_balance: Amount,
}

/// Early payoff information
#[derive(candid::CandidType, candid::Deserialize, Clone, Debug, serde::Serialize)]
pub struct EarlyPayoffInfo {
    pub remaining_balance: Amount,
    pub prepayment_penalty: Amount,
    pub total_payoff_amount: Amount,
    pub interest_savings: Amount,
    pub is_eligible: bool,
}
