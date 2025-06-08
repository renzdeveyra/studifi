use crate::types::*;
use crate::storage::*;
use shared::*;

/// Multi-treasury management engine for separated fund allocation
pub struct TreasuryEngine;

/// Separate treasury types for different purposes
#[derive(candid::CandidType, candid::Deserialize, Clone, Debug, PartialEq, serde::Serialize)]
pub enum TreasuryType {
    Loan,       // Revenue-generating loans
    Scholarship, // Community-governed grants
    Protocol,   // Platform operations and rewards
}

impl Default for TreasuryType {
    fn default() -> Self {
        TreasuryType::Loan
    }
}

/// Individual treasury configuration
#[derive(candid::CandidType, candid::Deserialize, Clone, Debug, serde::Serialize)]
pub struct SeparateTreasuryConfig {
    pub treasury_type: TreasuryType,
    pub total_funds: Amount,
    pub available_funds: Amount,
    pub reserved_funds: Amount,
    pub minimum_reserve_ratio: Percentage,
    pub maximum_allocation_ratio: Percentage, // Max % of total funds that can be allocated
    pub governance_required: bool, // Whether governance approval is needed for allocations
    pub created_at: Timestamp,
    pub last_updated: Timestamp,
}

impl SeparateTreasuryConfig {
    pub fn new(treasury_type: TreasuryType) -> Self {
        let now = current_time();
        match treasury_type {
            TreasuryType::Loan => Self {
                treasury_type,
                total_funds: 1_000_000_00, // $1M for loans
                available_funds: 800_000_00,
                reserved_funds: 200_000_00,
                minimum_reserve_ratio: 0.15, // 15% reserve for liquidity
                maximum_allocation_ratio: 0.85, // 85% max allocation
                governance_required: false, // Automated loan approval
                created_at: now,
                last_updated: now,
            },
            TreasuryType::Scholarship => Self {
                treasury_type,
                total_funds: 500_000_00, // $500K for scholarships
                available_funds: 500_000_00,
                reserved_funds: 0,
                minimum_reserve_ratio: 0.05, // 5% reserve
                maximum_allocation_ratio: 0.95, // 95% max allocation
                governance_required: true, // All scholarships need governance approval
                created_at: now,
                last_updated: now,
            },
            TreasuryType::Protocol => Self {
                treasury_type,
                total_funds: 200_000_00, // $200K for protocol
                available_funds: 150_000_00,
                reserved_funds: 50_000_00,
                minimum_reserve_ratio: 0.10, // 10% reserve
                maximum_allocation_ratio: 0.90, // 90% max allocation
                governance_required: true, // Protocol expenses need governance approval
                created_at: now,
                last_updated: now,
            },
        }
    }
}

/// Treasury statistics for each separate treasury
#[derive(candid::CandidType, candid::Deserialize, Clone, Debug, Default, serde::Serialize)]
pub struct SeparateTreasuryStats {
    pub treasury_type: TreasuryType,
    pub total_allocated: Amount,
    pub total_returned: Amount,
    pub total_revenue: Amount, // Interest, fees, etc.
    pub active_allocations: u32,
    pub allocation_count: u32,
    pub average_allocation: Amount,
    pub utilization_rate: Percentage,
    pub return_rate: Percentage, // For loans: repayment rate, for scholarships: 0
}

/// Combined treasury health across all treasuries
#[derive(candid::CandidType, candid::Deserialize, Clone, Debug, serde::Serialize)]
pub struct MultiTreasuryHealth {
    pub loan_treasury: TreasuryHealth,
    pub scholarship_treasury: TreasuryHealth,
    pub protocol_treasury: TreasuryHealth,
    pub total_platform_funds: Amount,
    pub overall_health_score: f64,
    pub cross_treasury_recommendations: Vec<String>,
}

impl TreasuryEngine {
    /// Check if sufficient funds are available for a loan from the loan treasury
    pub fn check_loan_eligibility(loan_amount: Amount) -> StudiFiResult<()> {
        let loan_treasury = Self::get_treasury_config(TreasuryType::Loan)?;

        if loan_amount > loan_treasury.available_funds {
            return Err(StudiFiError::InsufficientFunds(
                format!("Requested amount {} exceeds available loan funds {}",
                    format_currency(loan_amount),
                    format_currency(loan_treasury.available_funds))
            ));
        }

        // Check allocation ratio
        let new_reserved = loan_treasury.reserved_funds + loan_amount;
        let allocation_ratio = new_reserved as f64 / loan_treasury.total_funds as f64;

        if allocation_ratio > loan_treasury.maximum_allocation_ratio {
            return Err(StudiFiError::InsufficientFunds(
                "Loan would exceed maximum allocation ratio for loan treasury".to_string()
            ));
        }

        // Check reserve requirements
        let remaining_funds = loan_treasury.available_funds - loan_amount;
        let reserve_ratio = remaining_funds as f64 / loan_treasury.total_funds as f64;

        if reserve_ratio < loan_treasury.minimum_reserve_ratio {
            return Err(StudiFiError::InsufficientFunds(
                "Loan would violate minimum reserve requirements".to_string()
            ));
        }

        Ok(())
    }

    /// Get treasury configuration for a specific treasury type
    pub fn get_treasury_config(treasury_type: TreasuryType) -> StudiFiResult<SeparateTreasuryConfig> {
        with_storage(|storage| {
            storage.get_separate_treasury_config(&treasury_type)
                .ok_or_else(|| StudiFiError::NotFound(format!("Treasury {:?} not found", treasury_type)))
        })
    }

    /// Initialize all treasury types with default configurations
    pub fn initialize_treasuries() -> StudiFiResult<()> {
        with_storage_mut(|storage| {
            storage.set_separate_treasury_config(SeparateTreasuryConfig::new(TreasuryType::Loan));
            storage.set_separate_treasury_config(SeparateTreasuryConfig::new(TreasuryType::Scholarship));
            storage.set_separate_treasury_config(SeparateTreasuryConfig::new(TreasuryType::Protocol));
        });

        ic_cdk::println!("Initialized all treasury types");
        Ok(())
    }

    /// Check if allocation is allowed for a specific treasury
    pub fn check_allocation_eligibility(
        treasury_type: TreasuryType,
        amount: Amount,
        governance_approved: bool,
    ) -> StudiFiResult<()> {
        let treasury = Self::get_treasury_config(treasury_type.clone())?;

        // Check governance requirements
        if treasury.governance_required && !governance_approved {
            return Err(StudiFiError::Unauthorized(
                format!("Governance approval required for {:?} treasury allocations", treasury_type)
            ));
        }

        // Check available funds
        if amount > treasury.available_funds {
            return Err(StudiFiError::InsufficientFunds(
                format!("Insufficient funds in {:?} treasury", treasury_type)
            ));
        }

        // Check allocation limits
        let new_reserved = treasury.reserved_funds + amount;
        let allocation_ratio = new_reserved as f64 / treasury.total_funds as f64;

        if allocation_ratio > treasury.maximum_allocation_ratio {
            return Err(StudiFiError::InsufficientFunds(
                format!("Allocation would exceed maximum ratio for {:?} treasury", treasury_type)
            ));
        }

        // Check reserve requirements
        let remaining_funds = treasury.available_funds - amount;
        let reserve_ratio = remaining_funds as f64 / treasury.total_funds as f64;

        if reserve_ratio < treasury.minimum_reserve_ratio {
            return Err(StudiFiError::InsufficientFunds(
                format!("Allocation would violate reserve requirements for {:?} treasury", treasury_type)
            ));
        }

        Ok(())
    }

    /// Allocate funds for a new loan from the loan treasury
    pub fn allocate_loan_funds(loan_amount: Amount) -> StudiFiResult<()> {
        Self::check_loan_eligibility(loan_amount)?;

        with_storage_mut(|storage| {
            let mut loan_treasury = storage.get_separate_treasury_config(&TreasuryType::Loan)
                .unwrap_or_else(|| SeparateTreasuryConfig::new(TreasuryType::Loan));

            loan_treasury.available_funds -= loan_amount;
            loan_treasury.reserved_funds += loan_amount;
            loan_treasury.last_updated = current_time();

            storage.set_separate_treasury_config(loan_treasury);
        });

        ic_cdk::println!("Allocated {} from loan treasury", format_currency(loan_amount));
        Ok(())
    }

    /// Allocate funds from a specific treasury (with governance check)
    pub fn allocate_treasury_funds(
        treasury_type: TreasuryType,
        amount: Amount,
        purpose: String,
        governance_approved: bool,
    ) -> StudiFiResult<()> {
        Self::check_allocation_eligibility(treasury_type.clone(), amount, governance_approved)?;

        with_storage_mut(|storage| {
            let mut treasury = storage.get_separate_treasury_config(&treasury_type)
                .unwrap_or_else(|| SeparateTreasuryConfig::new(treasury_type.clone()));

            treasury.available_funds -= amount;
            treasury.reserved_funds += amount;
            treasury.last_updated = current_time();

            storage.set_separate_treasury_config(treasury);
        });

        ic_cdk::println!("Allocated {} from {:?} treasury for {}",
                        format_currency(amount), treasury_type, purpose);
        Ok(())
    }

    /// Add funds to a specific treasury
    pub fn add_treasury_funds(
        treasury_type: TreasuryType,
        amount: Amount,
        source: String,
    ) -> StudiFiResult<()> {
        with_storage_mut(|storage| {
            let mut treasury = storage.get_separate_treasury_config(&treasury_type)
                .unwrap_or_else(|| SeparateTreasuryConfig::new(treasury_type.clone()));

            treasury.total_funds += amount;
            treasury.available_funds += amount;
            treasury.last_updated = current_time();

            storage.set_separate_treasury_config(treasury);
        });

        ic_cdk::println!("Added {} to {:?} treasury from {}",
                        format_currency(amount), treasury_type, source);
        Ok(())
    }

    /// Transfer funds between treasuries (requires governance approval)
    pub fn transfer_between_treasuries(
        from_treasury: TreasuryType,
        to_treasury: TreasuryType,
        amount: Amount,
        governance_approved: bool,
    ) -> StudiFiResult<()> {
        if !governance_approved {
            return Err(StudiFiError::Unauthorized(
                "Governance approval required for inter-treasury transfers".to_string()
            ));
        }

        // Check source treasury has sufficient funds
        let from_config = Self::get_treasury_config(from_treasury.clone())?;
        if amount > from_config.available_funds {
            return Err(StudiFiError::InsufficientFunds(
                format!("Insufficient funds in {:?} treasury", from_treasury)
            ));
        }

        // Perform transfer
        with_storage_mut(|storage| {
            // Deduct from source treasury
            let mut from_config = storage.get_separate_treasury_config(&from_treasury)
                .unwrap();
            from_config.total_funds -= amount;
            from_config.available_funds -= amount;
            from_config.last_updated = current_time();
            storage.set_separate_treasury_config(from_config);

            // Add to destination treasury
            let mut to_config = storage.get_separate_treasury_config(&to_treasury)
                .unwrap_or_else(|| SeparateTreasuryConfig::new(to_treasury.clone()));
            to_config.total_funds += amount;
            to_config.available_funds += amount;
            to_config.last_updated = current_time();
            storage.set_separate_treasury_config(to_config);
        });

        ic_cdk::println!("Transferred {} from {:?} to {:?} treasury",
                        format_currency(amount), from_treasury, to_treasury);
        Ok(())
    }

    /// Process a loan payment and update loan treasury
    pub fn process_payment_to_treasury(
        principal_portion: Amount,
        interest_portion: Amount,
        late_fee: Amount,
    ) -> StudiFiResult<()> {
        with_storage_mut(|storage| {
            let mut loan_treasury = storage.get_separate_treasury_config(&TreasuryType::Loan)
                .unwrap_or_else(|| SeparateTreasuryConfig::new(TreasuryType::Loan));

            // Principal portion goes back to available funds
            loan_treasury.available_funds += principal_portion;
            loan_treasury.reserved_funds -= principal_portion;

            // Interest and fees increase total treasury (revenue)
            loan_treasury.total_funds += interest_portion + late_fee;
            loan_treasury.available_funds += interest_portion + late_fee;
            loan_treasury.last_updated = current_time();

            storage.set_separate_treasury_config(loan_treasury);
        });

        ic_cdk::println!(
            "Processed payment to loan treasury: principal={}, interest={}, late_fee={}",
            format_currency(principal_portion),
            format_currency(interest_portion),
            format_currency(late_fee)
        );
        Ok(())
    }

    /// Return funds to treasury when allocation is completed/cancelled
    pub fn return_treasury_funds(
        treasury_type: TreasuryType,
        amount: Amount,
        revenue: Amount, // Additional revenue generated (e.g., interest)
    ) -> StudiFiResult<()> {
        with_storage_mut(|storage| {
            let mut treasury = storage.get_separate_treasury_config(&treasury_type)
                .unwrap_or_else(|| SeparateTreasuryConfig::new(treasury_type.clone()));

            // Return principal to available funds
            treasury.available_funds += amount;
            treasury.reserved_funds -= amount;

            // Add any revenue generated
            if revenue > 0 {
                treasury.total_funds += revenue;
                treasury.available_funds += revenue;
            }

            treasury.last_updated = current_time();
            storage.set_separate_treasury_config(treasury);
        });

        ic_cdk::println!("Returned {} to {:?} treasury with {} revenue",
                        format_currency(amount), treasury_type, format_currency(revenue));
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

    /// Get multi-treasury health overview
    pub fn get_multi_treasury_health() -> StudiFiResult<MultiTreasuryHealth> {
        let loan_health = Self::get_treasury_health_for_type(TreasuryType::Loan)?;
        let scholarship_health = Self::get_treasury_health_for_type(TreasuryType::Scholarship)?;
        let protocol_health = Self::get_treasury_health_for_type(TreasuryType::Protocol)?;

        let total_platform_funds = loan_health.total_funds +
                                  scholarship_health.total_funds +
                                  protocol_health.total_funds;

        let overall_health_score = loan_health.health_score * 0.5 +
                                   scholarship_health.health_score * 0.3 +
                                   protocol_health.health_score * 0.2;

        let cross_treasury_recommendations = Self::generate_cross_treasury_recommendations(
            &loan_health, &scholarship_health, &protocol_health
        );

        Ok(MultiTreasuryHealth {
            loan_treasury: loan_health,
            scholarship_treasury: scholarship_health,
            protocol_treasury: protocol_health,
            total_platform_funds,
            overall_health_score,
            cross_treasury_recommendations,
        })
    }

    /// Get treasury health for a specific treasury type
    pub fn get_treasury_health_for_type(treasury_type: TreasuryType) -> StudiFiResult<TreasuryHealth> {
        let config = Self::get_treasury_config(treasury_type.clone())?;

        let reserve_ratio = if config.total_funds > 0 {
            config.available_funds as f64 / config.total_funds as f64
        } else {
            0.0
        };

        let utilization_rate = if config.total_funds > 0 {
            config.reserved_funds as f64 / config.total_funds as f64
        } else {
            0.0
        };

        // For now, use simplified metrics. In a full implementation,
        // you'd calculate treasury-specific metrics
        let loan_to_fund_ratio = utilization_rate; // Simplified
        let default_rate = 0.02; // Placeholder - would come from actual data

        let health_score = Self::calculate_health_score(
            reserve_ratio,
            loan_to_fund_ratio,
            default_rate,
            utilization_rate,
        );

        Ok(TreasuryHealth {
            total_funds: config.total_funds,
            available_funds: config.available_funds,
            reserved_funds: config.reserved_funds,
            reserve_ratio,
            loan_to_fund_ratio,
            utilization_rate,
            default_rate,
            health_score,
            health_status: Self::determine_health_status(health_score),
            recommendations: Self::generate_treasury_recommendations(&config, treasury_type),
        })
    }

    /// Generate recommendations for a specific treasury
    fn generate_treasury_recommendations(
        config: &SeparateTreasuryConfig,
        treasury_type: TreasuryType
    ) -> Vec<String> {
        let mut recommendations = Vec::new();

        let reserve_ratio = config.available_funds as f64 / config.total_funds as f64;
        let utilization_rate = config.reserved_funds as f64 / config.total_funds as f64;

        match treasury_type {
            TreasuryType::Loan => {
                if reserve_ratio < 0.15 {
                    recommendations.push("Increase loan treasury reserves for liquidity".to_string());
                }
                if utilization_rate > 0.85 {
                    recommendations.push("Consider reducing new loan originations".to_string());
                }
                if config.total_funds < 500_000_00 {
                    recommendations.push("Consider increasing loan treasury capacity".to_string());
                }
            },
            TreasuryType::Scholarship => {
                if utilization_rate < 0.30 {
                    recommendations.push("Consider creating more scholarship opportunities".to_string());
                }
                if config.total_funds < 100_000_00 {
                    recommendations.push("Seek additional scholarship funding sources".to_string());
                }
            },
            TreasuryType::Protocol => {
                if reserve_ratio < 0.20 {
                    recommendations.push("Maintain higher protocol treasury reserves".to_string());
                }
                if config.total_funds < 50_000_00 {
                    recommendations.push("Ensure adequate protocol operational funds".to_string());
                }
            },
        }

        recommendations
    }

    /// Generate cross-treasury recommendations
    fn generate_cross_treasury_recommendations(
        loan_health: &TreasuryHealth,
        scholarship_health: &TreasuryHealth,
        protocol_health: &TreasuryHealth,
    ) -> Vec<String> {
        let mut recommendations = Vec::new();

        // Check for imbalances between treasuries
        let total_funds = loan_health.total_funds + scholarship_health.total_funds + protocol_health.total_funds;
        let loan_percentage = loan_health.total_funds as f64 / total_funds as f64;
        let scholarship_percentage = scholarship_health.total_funds as f64 / total_funds as f64;

        if loan_percentage > 0.80 {
            recommendations.push("Consider rebalancing funds to increase scholarship treasury".to_string());
        }

        if scholarship_percentage < 0.10 {
            recommendations.push("Scholarship treasury may be underfunded relative to platform size".to_string());
        }

        if loan_health.health_score < 0.5 && scholarship_health.available_funds > scholarship_health.total_funds * 50 / 100 {
            recommendations.push("Consider temporary transfer from scholarship to loan treasury".to_string());
        }

        recommendations
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
