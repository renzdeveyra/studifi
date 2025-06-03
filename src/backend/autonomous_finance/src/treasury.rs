use crate::types::*;
use crate::storage::*;
use shared::*;

/// Treasury management engine for fund allocation and risk management
pub struct TreasuryEngine;

impl TreasuryEngine {
    /// Check if sufficient funds are available for a loan
    pub fn check_loan_eligibility(loan_amount: Amount) -> StudiFiResult<()> {
        let config = with_storage(|storage| storage.get_treasury_config());
        
        if loan_amount > config.available_funds {
            return Err(StudiFiError::InsufficientFunds(
                format!("Requested amount {} exceeds available funds {}", 
                    format_currency(loan_amount), 
                    format_currency(config.available_funds))
            ));
        }

        // Check loan-to-fund ratio
        let stats = with_storage(|storage| storage.calculate_treasury_stats());
        let new_total_outstanding = stats.total_loans_outstanding + loan_amount;
        let loan_to_fund_ratio = new_total_outstanding as f64 / config.total_funds as f64;

        if loan_to_fund_ratio > config.maximum_loan_to_fund_ratio {
            return Err(StudiFiError::InsufficientFunds(
                "Loan would exceed maximum loan-to-fund ratio".to_string()
            ));
        }

        // Check reserve requirements
        let remaining_funds = config.available_funds - loan_amount;
        let reserve_ratio = remaining_funds as f64 / config.total_funds as f64;

        if reserve_ratio < config.minimum_reserve_ratio {
            return Err(StudiFiError::InsufficientFunds(
                "Loan would violate minimum reserve requirements".to_string()
            ));
        }

        Ok(())
    }

    /// Allocate funds for a new loan
    pub fn allocate_loan_funds(loan_amount: Amount) -> StudiFiResult<()> {
        Self::check_loan_eligibility(loan_amount)?;

        with_storage_mut(|storage| {
            let mut config = storage.get_treasury_config();
            config.available_funds -= loan_amount;
            config.reserved_funds += loan_amount;
            storage.set_treasury_config(config);
        });

        ic_cdk::println!("Allocated {} for loan", format_currency(loan_amount));
        Ok(())
    }

    /// Process a loan payment and update treasury
    pub fn process_payment_to_treasury(
        principal_portion: Amount,
        interest_portion: Amount,
        late_fee: Amount,
    ) -> StudiFiResult<()> {
        with_storage_mut(|storage| {
            let mut config = storage.get_treasury_config();
            
            // Principal portion goes back to available funds
            config.available_funds += principal_portion;
            config.reserved_funds -= principal_portion;
            
            // Interest and fees increase total treasury
            config.total_funds += interest_portion + late_fee;
            config.available_funds += interest_portion + late_fee;
            
            storage.set_treasury_config(config);
        });

        ic_cdk::println!(
            "Processed payment: principal={}, interest={}, late_fee={}", 
            format_currency(principal_portion),
            format_currency(interest_portion),
            format_currency(late_fee)
        );
        Ok(())
    }

    /// Handle loan default and update treasury
    pub fn handle_loan_default(remaining_balance: Amount) -> StudiFiResult<()> {
        with_storage_mut(|storage| {
            let mut config = storage.get_treasury_config();
            
            // Remove defaulted amount from reserved funds
            config.reserved_funds = config.reserved_funds.saturating_sub(remaining_balance);
            config.total_funds = config.total_funds.saturating_sub(remaining_balance);
            
            storage.set_treasury_config(config);
        });

        ic_cdk::println!("Handled loan default: {}", format_currency(remaining_balance));
        Ok(())
    }

    /// Rebalance treasury funds based on current portfolio
    pub fn rebalance_treasury() -> StudiFiResult<()> {
        let (config, stats) = with_storage(|storage| {
            (storage.get_treasury_config(), storage.calculate_treasury_stats())
        });

        if !config.auto_rebalance_enabled {
            return Ok(());
        }

        let mut new_config = config.clone();
        
        // Calculate optimal fund allocation
        let target_reserve = (new_config.total_funds as f64 * new_config.minimum_reserve_ratio) as Amount;
        let target_emergency = (new_config.total_funds as f64 * new_config.emergency_fund_ratio) as Amount;
        let target_interest_reserve = (new_config.total_funds as f64 * new_config.interest_reserve_ratio) as Amount;
        
        let total_reserves_needed = target_reserve + target_emergency + target_interest_reserve;
        let available_for_loans = new_config.total_funds.saturating_sub(total_reserves_needed);
        
        // Update configuration
        new_config.available_funds = available_for_loans.saturating_sub(stats.total_loans_outstanding);
        new_config.reserved_funds = stats.total_loans_outstanding;
        new_config.last_rebalance = current_time();

        with_storage_mut(|storage| {
            storage.set_treasury_config(new_config);
        });

        ic_cdk::println!("Treasury rebalanced successfully");
        Ok(())
    }

    /// Get current treasury health metrics
    pub fn get_treasury_health() -> TreasuryHealth {
        let config = with_storage(|storage| storage.get_treasury_config());
        let stats = with_storage(|storage| storage.calculate_treasury_stats());

        let reserve_ratio = if config.total_funds > 0 {
            config.available_funds as f64 / config.total_funds as f64
        } else {
            0.0
        };

        let loan_to_fund_ratio = if config.total_funds > 0 {
            stats.total_loans_outstanding as f64 / config.total_funds as f64
        } else {
            0.0
        };

        let utilization_rate = if config.total_funds > 0 {
            (config.total_funds - config.available_funds) as f64 / config.total_funds as f64
        } else {
            0.0
        };

        let health_score = Self::calculate_health_score(
            reserve_ratio,
            loan_to_fund_ratio,
            stats.default_rate,
            utilization_rate,
        );

        TreasuryHealth {
            total_funds: config.total_funds,
            available_funds: config.available_funds,
            reserved_funds: config.reserved_funds,
            reserve_ratio,
            loan_to_fund_ratio,
            utilization_rate,
            default_rate: stats.default_rate,
            health_score,
            health_status: Self::determine_health_status(health_score),
            recommendations: Self::generate_recommendations(&config, &stats),
        }
    }

    /// Calculate overall treasury health score (0.0 to 1.0)
    fn calculate_health_score(
        reserve_ratio: f64,
        loan_to_fund_ratio: f64,
        default_rate: f64,
        utilization_rate: f64,
    ) -> f64 {
        let mut score = 1.0;

        // Penalize low reserves
        if reserve_ratio < 0.15 {
            score -= (0.15 - reserve_ratio) * 2.0;
        }

        // Penalize high loan-to-fund ratio
        if loan_to_fund_ratio > 0.80 {
            score -= (loan_to_fund_ratio - 0.80) * 3.0;
        }

        // Penalize high default rate
        score -= default_rate * 5.0;

        // Penalize very high or very low utilization
        if utilization_rate > 0.90 {
            score -= (utilization_rate - 0.90) * 2.0;
        } else if utilization_rate < 0.30 {
            score -= (0.30 - utilization_rate) * 1.0;
        }

        score.max(0.0).min(1.0)
    }

    /// Determine health status based on score
    fn determine_health_status(score: f64) -> TreasuryHealthStatus {
        match score {
            s if s >= 0.8 => TreasuryHealthStatus::Excellent,
            s if s >= 0.6 => TreasuryHealthStatus::Good,
            s if s >= 0.4 => TreasuryHealthStatus::Fair,
            s if s >= 0.2 => TreasuryHealthStatus::Poor,
            _ => TreasuryHealthStatus::Critical,
        }
    }

    /// Generate recommendations based on current state
    fn generate_recommendations(config: &TreasuryConfig, stats: &TreasuryStats) -> Vec<String> {
        let mut recommendations = Vec::new();

        let reserve_ratio = config.available_funds as f64 / config.total_funds as f64;
        let loan_to_fund_ratio = stats.total_loans_outstanding as f64 / config.total_funds as f64;

        if reserve_ratio < 0.15 {
            recommendations.push("Increase treasury reserves to maintain liquidity".to_string());
        }

        if loan_to_fund_ratio > 0.80 {
            recommendations.push("Reduce new loan originations to manage risk".to_string());
        }

        if stats.default_rate > 0.05 {
            recommendations.push("Review credit policies to reduce default rate".to_string());
        }

        if stats.active_loan_count < 10 {
            recommendations.push("Increase marketing to grow loan portfolio".to_string());
        }

        if config.total_funds < 500_000_00 {
            recommendations.push("Consider fundraising to increase treasury capacity".to_string());
        }

        recommendations
    }

    /// Add funds to treasury (for governance-approved funding)
    pub fn add_treasury_funds(amount: Amount, source: String) -> StudiFiResult<()> {
        with_storage_mut(|storage| {
            let mut config = storage.get_treasury_config();
            config.total_funds += amount;
            config.available_funds += amount;
            storage.set_treasury_config(config);
        });

        ic_cdk::println!("Added {} to treasury from {}", format_currency(amount), source);
        Ok(())
    }

    /// Withdraw funds from treasury (for governance-approved expenses)
    pub fn withdraw_treasury_funds(amount: Amount, purpose: String) -> StudiFiResult<()> {
        let config = with_storage(|storage| storage.get_treasury_config());

        if amount > config.available_funds {
            return Err(StudiFiError::InsufficientFunds(
                "Insufficient available funds for withdrawal".to_string()
            ));
        }

        // Check if withdrawal would violate reserve requirements
        let remaining_funds = config.available_funds - amount;
        let reserve_ratio = remaining_funds as f64 / config.total_funds as f64;

        if reserve_ratio < config.minimum_reserve_ratio {
            return Err(StudiFiError::InsufficientFunds(
                "Withdrawal would violate minimum reserve requirements".to_string()
            ));
        }

        with_storage_mut(|storage| {
            let mut config = storage.get_treasury_config();
            config.total_funds -= amount;
            config.available_funds -= amount;
            storage.set_treasury_config(config);
        });

        ic_cdk::println!("Withdrew {} from treasury for {}", format_currency(amount), purpose);
        Ok(())
    }
}

/// Treasury health information
#[derive(candid::CandidType, candid::Deserialize, Clone, Debug, serde::Serialize)]
pub struct TreasuryHealth {
    pub total_funds: Amount,
    pub available_funds: Amount,
    pub reserved_funds: Amount,
    pub reserve_ratio: f64,
    pub loan_to_fund_ratio: f64,
    pub utilization_rate: f64,
    pub default_rate: f64,
    pub health_score: f64,
    pub health_status: TreasuryHealthStatus,
    pub recommendations: Vec<String>,
}

/// Treasury health status enumeration
#[derive(candid::CandidType, candid::Deserialize, Clone, Debug, PartialEq, serde::Serialize)]
pub enum TreasuryHealthStatus {
    Excellent,
    Good,
    Fair,
    Poor,
    Critical,
}
