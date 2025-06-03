use crate::types::*;
use shared::*;

/// Enhanced credit scoring engine with machine learning capabilities
pub struct CreditScoringEngine;

impl CreditScoringEngine {
    /// Calculate enhanced credit score with multiple factors
    pub fn calculate_enhanced_score(
        academic: &AcademicInfo,
        financial: &FinancialInfo,
        historical: &Option<Vec<CreditScore>>,
    ) -> CreditScore {
        let mut total_score = 0.0;
        let mut factors = Vec::new();
        let config = ScoringConfig::default();

        // Academic Performance Factor (40% weight)
        let academic_factor = Self::calculate_academic_factor(academic);
        total_score += academic_factor.score * config.academic_weight;
        factors.push(academic_factor);

        // Financial Stability Factor (30% weight)
        let financial_factor = Self::calculate_financial_factor(financial);
        total_score += financial_factor.score * config.financial_weight;
        factors.push(financial_factor);

        // Program Viability Factor (20% weight)
        let program_factor = Self::calculate_program_factor(academic);
        total_score += program_factor.score * config.program_weight;
        factors.push(program_factor);

        // Academic Progress Factor (10% weight)
        let progress_factor = Self::calculate_progress_factor(academic);
        total_score += progress_factor.score * config.progress_weight;
        factors.push(progress_factor);

        // Historical Factor (if available)
        if let Some(history) = historical {
            let historical_factor = Self::calculate_historical_factor(history);
            total_score += historical_factor.score * config.historical_weight;
            factors.push(historical_factor);
        }

        // Convert to 0-1000 scale
        let final_score = (total_score * 10.0).min(1000.0).max(0.0) as u32;
        
        // Calculate confidence based on data completeness
        let confidence = Self::calculate_confidence(&factors, historical.is_some());

        CreditScore::new(final_score, factors, confidence)
    }

    /// Calculate academic performance factor
    fn calculate_academic_factor(academic: &AcademicInfo) -> CreditFactor {
        let gpa_score = (academic.gpa / 4.0 * 100.0).min(100.0);
        
        // Bonus for honors and achievements
        let honors_bonus = (academic.honors.len() as f64 * 5.0).min(15.0);
        let extracurricular_bonus = (academic.extracurricular.len() as f64 * 2.0).min(10.0);
        
        let total_score = (gpa_score + honors_bonus + extracurricular_bonus).min(100.0);
        
        let impact = match total_score {
            90.0..=100.0 => "Exceptional academic performance significantly boosts creditworthiness",
            80.0..=89.9 => "Strong academic performance positively impacts credit score",
            70.0..=79.9 => "Good academic standing supports loan approval",
            60.0..=69.9 => "Adequate academic performance with room for improvement",
            _ => "Academic performance may impact loan terms",
        };

        CreditFactor {
            name: "Academic Performance".to_string(),
            weight: CREDIT_WEIGHT_ACADEMIC,
            score: total_score,
            impact: impact.to_string(),
            category: FactorCategory::Academic,
            trend: None, // Would be calculated from historical data
        }
    }

    /// Calculate financial stability factor
    fn calculate_financial_factor(financial: &FinancialInfo) -> CreditFactor {
        let net_income = financial.monthly_income.saturating_sub(financial.monthly_expenses) as f64;
        let debt_to_income = if financial.monthly_income > 0 {
            financial.existing_debt as f64 / (financial.monthly_income * 12) as f64
        } else {
            1.0
        };
        
        // Base score from net income
        let income_score = (net_income / 1000.0 * 50.0).min(50.0);
        
        // Debt-to-income ratio impact
        let debt_score = match debt_to_income {
            0.0..=0.2 => 30.0,
            0.2..=0.4 => 20.0,
            0.4..=0.6 => 10.0,
            _ => 0.0,
        };
        
        // Employment status bonus
        let employment_bonus = match financial.employment_status {
            EmploymentStatus::FullTime => 15.0,
            EmploymentStatus::PartTime => 10.0,
            EmploymentStatus::TeachingAssistant | EmploymentStatus::ResearchAssistant => 12.0,
            EmploymentStatus::Fellowship => 8.0,
            EmploymentStatus::Internship => 5.0,
            EmploymentStatus::Unemployed => 0.0,
        };
        
        // Savings bonus
        let savings_bonus = if financial.savings > 0 {
            ((financial.savings as f64 / 1000.0).ln() * 2.0).min(5.0)
        } else {
            0.0
        };
        
        let total_score = (income_score + debt_score + employment_bonus + savings_bonus).min(100.0);
        
        let impact = match total_score {
            80.0..=100.0 => "Excellent financial stability strongly supports loan approval",
            60.0..=79.9 => "Good financial management positively impacts creditworthiness",
            40.0..=59.9 => "Adequate financial position with manageable debt levels",
            20.0..=39.9 => "Financial constraints may affect loan terms",
            _ => "Significant financial challenges identified",
        };

        CreditFactor {
            name: "Financial Stability".to_string(),
            weight: CREDIT_WEIGHT_FINANCIAL,
            score: total_score,
            impact: impact.to_string(),
            category: FactorCategory::Financial,
            trend: None,
        }
    }

    /// Calculate program viability factor
    fn calculate_program_factor(academic: &AcademicInfo) -> CreditFactor {
        let program_score = Self::get_program_score(&academic.program);
        
        // University reputation bonus (simplified)
        let university_bonus = Self::get_university_bonus(&academic.university);
        
        // Major/minor bonus
        let specialization_bonus = if academic.major.is_some() { 5.0 } else { 0.0 } +
                                  if academic.minor.is_some() { 2.0 } else { 0.0 };
        
        let total_score = (program_score + university_bonus + specialization_bonus).min(100.0);
        
        let impact = match total_score {
            90.0..=100.0 => "Excellent program with outstanding job prospects",
            80.0..=89.9 => "Strong program with good employment opportunities",
            70.0..=79.9 => "Solid program with reasonable career prospects",
            60.0..=69.9 => "Moderate employment outlook for this field",
            _ => "Limited job market data for this program",
        };

        CreditFactor {
            name: "Program Employability".to_string(),
            weight: CREDIT_WEIGHT_PROGRAM,
            score: total_score,
            impact: impact.to_string(),
            category: FactorCategory::Program,
            trend: None,
        }
    }

    /// Calculate academic progress factor
    fn calculate_progress_factor(academic: &AcademicInfo) -> CreditFactor {
        let year_score = (academic.year_of_study as f64 / 4.0 * 80.0).min(80.0);
        
        // Previous degrees bonus
        let degree_bonus = (academic.previous_degrees.len() as f64 * 10.0).min(20.0);
        
        let total_score = (year_score + degree_bonus).min(100.0);
        
        let impact = match academic.year_of_study {
            4.. => "Advanced student with strong commitment to completion",
            3 => "Upper-level student showing good academic progress",
            2 => "Sophomore with established academic track record",
            1 => "First-year student with potential for growth",
            _ => "Academic progress assessment",
        };

        CreditFactor {
            name: "Academic Progress".to_string(),
            weight: CREDIT_WEIGHT_PROGRESS,
            score: total_score,
            impact: impact.to_string(),
            category: FactorCategory::Progress,
            trend: None,
        }
    }

    /// Calculate historical factor from previous credit scores
    fn calculate_historical_factor(history: &[CreditScore]) -> CreditFactor {
        if history.is_empty() {
            return CreditFactor {
                name: "Credit History".to_string(),
                weight: 0.0,
                score: 50.0, // Neutral score
                impact: "No credit history available".to_string(),
                category: FactorCategory::Historical,
                trend: None,
            };
        }

        let avg_score = history.iter().map(|s| s.score as f64).sum::<f64>() / history.len() as f64;
        let trend = Self::calculate_score_trend(history);
        
        let impact = match trend {
            Some(Trend::Improving) => "Credit score shows positive improvement trend",
            Some(Trend::Stable) => "Credit score remains consistently stable",
            Some(Trend::Declining) => "Credit score shows concerning decline",
            None => "Insufficient history for trend analysis",
        };

        CreditFactor {
            name: "Credit History".to_string(),
            weight: 0.1, // 10% when available
            score: (avg_score / 10.0).min(100.0),
            impact: impact.to_string(),
            category: FactorCategory::Historical,
            trend,
        }
    }

    /// Calculate confidence score based on data completeness
    fn calculate_confidence(factors: &[CreditFactor], has_history: bool) -> f64 {
        let mut confidence = 0.7; // Base confidence
        
        // Boost confidence based on number of factors
        confidence += factors.len() as f64 * 0.05;
        
        // Historical data bonus
        if has_history {
            confidence += 0.1;
        }
        
        // Check for complete data
        let complete_factors = factors.iter().filter(|f| f.score > 0.0).count();
        confidence += (complete_factors as f64 / factors.len() as f64) * 0.15;
        
        confidence.min(1.0)
    }

    /// Get program score based on market demand
    fn get_program_score(program: &str) -> f64 {
        let program_lower = program.to_lowercase();
        
        if program_lower.contains("computer") || program_lower.contains("software") || 
           program_lower.contains("data science") || program_lower.contains("ai") ||
           program_lower.contains("machine learning") {
            PROGRAM_SCORE_STEM
        } else if program_lower.contains("engineering") || program_lower.contains("mathematics") ||
                  program_lower.contains("physics") || program_lower.contains("chemistry") {
            PROGRAM_SCORE_STEM
        } else if program_lower.contains("medicine") || program_lower.contains("nursing") ||
                  program_lower.contains("pharmacy") || program_lower.contains("health") {
            PROGRAM_SCORE_HEALTHCARE
        } else if program_lower.contains("business") || program_lower.contains("finance") ||
                  program_lower.contains("economics") || program_lower.contains("accounting") {
            PROGRAM_SCORE_BUSINESS
        } else if program_lower.contains("education") || program_lower.contains("teaching") {
            PROGRAM_SCORE_EDUCATION
        } else {
            PROGRAM_SCORE_DEFAULT
        }
    }

    /// Get university reputation bonus
    fn get_university_bonus(university: &str) -> f64 {
        let university_lower = university.to_lowercase();
        
        // Top tier universities
        if university_lower.contains("mit") || university_lower.contains("stanford") ||
           university_lower.contains("harvard") || university_lower.contains("caltech") {
            15.0
        }
        // Second tier
        else if university_lower.contains("berkeley") || university_lower.contains("carnegie") ||
                university_lower.contains("princeton") || university_lower.contains("yale") {
            10.0
        }
        // Well-known universities
        else if university_lower.contains("university") {
            5.0
        } else {
            0.0
        }
    }

    /// Calculate trend from historical scores
    fn calculate_score_trend(history: &[CreditScore]) -> Option<Trend> {
        if history.len() < 2 {
            return None;
        }

        let recent_avg = history.iter().rev().take(3).map(|s| s.score as f64).sum::<f64>() / 3.0;
        let older_avg = history.iter().take(3).map(|s| s.score as f64).sum::<f64>() / 3.0;
        
        let diff = recent_avg - older_avg;
        
        if diff > 20.0 {
            Some(Trend::Improving)
        } else if diff < -20.0 {
            Some(Trend::Declining)
        } else {
            Some(Trend::Stable)
        }
    }

    /// Generate loan terms based on credit score and other factors
    pub fn generate_loan_terms(
        requested_amount: Amount,
        credit_score: &CreditScore,
        purpose: &LoanPurpose,
    ) -> LoanTerms {
        let risk_multiplier = purpose.risk_multiplier();
        let base_rate = credit_score.risk_level.to_interest_rate();
        let adjusted_rate = (base_rate * risk_multiplier).min(MAX_INTEREST_RATE);
        
        // Calculate approved amount based on credit score
        let approval_percentage = match credit_score.score {
            800..=1000 => 1.0,
            700..=799 => 0.95,
            600..=699 => 0.85,
            500..=599 => 0.75,
            400..=499 => 0.60,
            _ => 0.50,
        };
        
        let approved_amount = ((requested_amount as f64 * approval_percentage) as Amount)
            .min(MAX_LOAN_AMOUNT)
            .max(MIN_LOAN_AMOUNT);
        
        // Standard term: 5 years for most loans
        let term_months = 60;
        let grace_period = if credit_score.score >= 700 { 6 } else { 3 };
        
        let monthly_payment = calculate_monthly_payment(approved_amount, adjusted_rate, term_months);
        let origination_fee = (approved_amount as f64 * 0.01) as Amount; // 1% origination fee
        
        LoanTerms {
            approved_amount,
            interest_rate: adjusted_rate,
            term_months,
            monthly_payment,
            grace_period_months: grace_period,
            origination_fee,
            prepayment_penalty: false,
            cosigner_required: credit_score.score < 600,
            collateral_required: credit_score.score < 500,
            special_conditions: Self::generate_special_conditions(credit_score),
        }
    }

    /// Generate special conditions based on risk assessment
    fn generate_special_conditions(credit_score: &CreditScore) -> Vec<String> {
        let mut conditions = Vec::new();
        
        if credit_score.score < 600 {
            conditions.push("Quarterly academic progress reports required".to_string());
        }
        
        if credit_score.score < 500 {
            conditions.push("Mandatory financial counseling session".to_string());
            conditions.push("Bi-annual income verification".to_string());
        }
        
        if credit_score.confidence < 0.7 {
            conditions.push("Additional documentation may be requested".to_string());
        }
        
        conditions
    }

    /// Assess overall risk for the application
    pub fn assess_risk(application: &LoanApplication, credit_score: &CreditScore) -> RiskAssessment {
        let mut risk_factors = Vec::new();
        let mut mitigating_factors = Vec::new();
        
        // Analyze risk factors
        if credit_score.score < 600 {
            risk_factors.push("Below-average credit score".to_string());
        }
        
        if application.requested_amount > 25_000_00 {
            risk_factors.push("High loan amount requested".to_string());
        }
        
        let debt_to_income = application.financial_info.existing_debt as f64 / 
                           (application.financial_info.monthly_income * 12) as f64;
        if debt_to_income > 0.4 {
            risk_factors.push("High existing debt-to-income ratio".to_string());
        }
        
        // Analyze mitigating factors
        if application.academic_info.gpa > 3.5 {
            mitigating_factors.push("Strong academic performance".to_string());
        }
        
        if application.financial_info.savings > 5_000_00 {
            mitigating_factors.push("Substantial savings balance".to_string());
        }
        
        if !application.academic_info.honors.is_empty() {
            mitigating_factors.push("Academic honors and achievements".to_string());
        }
        
        // Calculate overall risk score
        let base_risk = (1000 - credit_score.score) as f64 / 1000.0;
        let risk_adjustment = risk_factors.len() as f64 * 0.1 - mitigating_factors.len() as f64 * 0.05;
        let overall_risk = (base_risk + risk_adjustment).max(0.0).min(1.0);
        
        // Calculate default probability (simplified model)
        let default_probability = overall_risk * 0.15; // Max 15% default probability
        
        // Determine recommended action
        let recommended_action = match credit_score.score {
            700.. => RecommendedAction::Approve,
            600..=699 => if risk_factors.len() <= 1 { 
                RecommendedAction::Approve 
            } else { 
                RecommendedAction::ApproveWithConditions 
            },
            500..=599 => RecommendedAction::ApproveWithConditions,
            400..=499 => RecommendedAction::RequireCosigner,
            _ => RecommendedAction::Reject,
        };
        
        RiskAssessment {
            overall_risk_score: overall_risk,
            default_probability,
            recommended_action,
            risk_factors,
            mitigating_factors,
            monitoring_requirements: vec![
                "Monthly payment tracking".to_string(),
                "Academic progress monitoring".to_string(),
            ],
        }
    }
}
