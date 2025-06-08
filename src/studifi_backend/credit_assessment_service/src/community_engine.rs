use candid::Principal;
use crate::community_validation::*;
use crate::types::*;
use crate::storage::*;
use shared::*;

/// Community validation engine for hybrid credit scoring
pub struct CommunityValidationEngine;

impl CommunityValidationEngine {
    /// Create a new community validation request
    pub fn create_validation_request(
        student_id: Principal,
        application_id: String,
        algorithm_score: u32,
        proposed_adjustment: i32,
        justification: String,
        evidence: Vec<ValidationEvidence>,
        created_by: Principal,
    ) -> StudiFiResult<CommunityValidationRequest> {
        // Validate inputs
        if justification.len() < 50 {
            return Err(StudiFiError::InvalidInput(
                "Justification must be at least 50 characters".to_string()
            ));
        }

        if evidence.is_empty() {
            return Err(StudiFiError::InvalidInput(
                "At least one piece of evidence is required".to_string()
            ));
        }

        if proposed_adjustment.abs() > 200 {
            return Err(StudiFiError::InvalidInput(
                "Proposed adjustment cannot exceed ±200 points".to_string()
            ));
        }

        // Generate validation ID
        let validation_id = generate_id("VAL", with_storage(|storage| storage.get_next_validation_id()));

        let validation_request = CommunityValidationRequest::new(
            validation_id.clone(),
            student_id,
            application_id,
            algorithm_score,
            proposed_adjustment,
            justification,
            evidence,
            created_by,
        );

        // Store the validation request
        with_storage_mut(|storage| {
            storage.insert_validation_request(validation_id.clone(), validation_request.clone());
            storage.increment_validation_id();
        });

        ic_cdk::println!("Created validation request {} for student {:?}", 
                        validation_id, student_id);
        Ok(validation_request)
    }

    /// Cast a community vote on a validation request
    pub fn cast_community_vote(
        validation_id: String,
        voter: Principal,
        adjustment_vote: i32,
        confidence: f64,
        voting_power: u64,
        justification: String,
    ) -> StudiFiResult<CommunityVote> {
        // Get validation request
        let mut validation = with_storage(|storage| storage.get_validation_request(&validation_id))
            .ok_or_else(|| StudiFiError::NotFound("Validation request not found".to_string()))?;

        // Check if validation is still active
        if !validation.is_active() {
            return Err(StudiFiError::InvalidInput("Validation period has ended".to_string()));
        }

        // Check if voter has already voted
        if validation.votes.iter().any(|v| v.voter == voter) {
            return Err(StudiFiError::AlreadyExists("Vote already cast".to_string()));
        }

        // Validate inputs
        if adjustment_vote.abs() > 200 {
            return Err(StudiFiError::InvalidInput(
                "Vote adjustment cannot exceed ±200 points".to_string()
            ));
        }

        if !(0.0..=1.0).contains(&confidence) {
            return Err(StudiFiError::InvalidInput(
                "Confidence must be between 0.0 and 1.0".to_string()
            ));
        }

        if voting_power == 0 {
            return Err(StudiFiError::Unauthorized("No voting power".to_string()));
        }

        // Create vote
        let vote = CommunityVote {
            validation_id: validation_id.clone(),
            voter,
            adjustment_vote,
            confidence,
            voting_power,
            justification,
            cast_at: current_time(),
        };

        // Add vote to validation request
        validation.votes.push(vote.clone());

        // Store updated validation
        with_storage_mut(|storage| {
            storage.insert_validation_request(validation_id.clone(), validation);
        });

        // Update validator reputation
        Self::update_validator_reputation(voter, confidence);

        ic_cdk::println!("Vote cast by {:?} on validation {}", voter, validation_id);
        Ok(vote)
    }

    /// Process completed validation and calculate final adjustment
    pub fn process_validation(validation_id: String) -> StudiFiResult<i32> {
        let mut validation = with_storage(|storage| storage.get_validation_request(&validation_id))
            .ok_or_else(|| StudiFiError::NotFound("Validation request not found".to_string()))?;

        // Check if validation period has ended
        if validation.is_active() {
            return Err(StudiFiError::InvalidInput("Validation period not yet ended".to_string()));
        }

        // Skip if already processed
        if validation.status != ValidationStatus::Active {
            return Ok(validation.final_adjustment.unwrap_or(0));
        }

        // Calculate weighted adjustment
        let final_adjustment = validation.calculate_weighted_adjustment();

        // Apply limits to final adjustment
        let limited_adjustment = final_adjustment.max(-100).min(100);

        // Update validation status
        validation.final_adjustment = Some(limited_adjustment);
        validation.status = ValidationStatus::Completed;
        validation.processed_at = Some(current_time());

        // Store updated validation
        with_storage_mut(|storage| {
            storage.insert_validation_request(validation_id.clone(), validation.clone());
        });

        ic_cdk::println!("Processed validation {} with adjustment {}", 
                        validation_id, limited_adjustment);
        Ok(limited_adjustment)
    }

    /// Apply community validation to create hybrid credit score
    pub fn apply_community_validation(
        student_id: Principal,
        validation_id: String,
    ) -> StudiFiResult<HybridCreditScore> {
        // Get validation request
        let mut validation = with_storage(|storage| storage.get_validation_request(&validation_id))
            .ok_or_else(|| StudiFiError::NotFound("Validation request not found".to_string()))?;

        // Check if validation is completed
        if validation.status != ValidationStatus::Completed {
            return Err(StudiFiError::InvalidInput("Validation not yet completed".to_string()));
        }

        // Get current algorithm score
        let algorithm_score = with_storage(|storage| storage.get_credit_score(&student_id))
            .ok_or_else(|| StudiFiError::NotFound("Credit score not found".to_string()))?;

        // Create or update hybrid score
        let mut hybrid_score = with_storage(|storage| storage.get_hybrid_score(&student_id))
            .unwrap_or_else(|| HybridCreditScore::new(algorithm_score, 0));

        // Apply the validation
        hybrid_score.apply_community_validation(&validation);

        // Mark validation as applied
        validation.status = ValidationStatus::Applied;

        // Store updates
        with_storage_mut(|storage| {
            storage.insert_validation_request(validation_id.clone(), validation);
            storage.insert_hybrid_score(student_id, hybrid_score.clone());
        });

        ic_cdk::println!("Applied validation {} to student {:?}", validation_id, student_id);
        Ok(hybrid_score)
    }

    /// Get effective credit score (hybrid if available, otherwise algorithm)
    pub fn get_effective_credit_score(student_id: Principal) -> Option<u32> {
        // Try to get hybrid score first
        if let Some(hybrid_score) = with_storage(|storage| storage.get_hybrid_score(&student_id)) {
            // Check if hybrid score is recent (within 6 months)
            let six_months_ago = current_time() - (6 * 30 * 24 * 60 * 60 * 1_000_000_000);
            if hybrid_score.calculated_at > six_months_ago {
                return Some(hybrid_score.final_score);
            }
        }

        // Fall back to algorithm score
        with_storage(|storage| storage.get_credit_score(&student_id))
            .map(|score| score.score)
    }

    /// Get validation requests for a student
    pub fn get_student_validations(student_id: Principal) -> Vec<CommunityValidationRequest> {
        with_storage(|storage| storage.get_validations_for_student(&student_id))
    }

    /// Get active validation requests
    pub fn get_active_validations() -> Vec<CommunityValidationRequest> {
        with_storage(|storage| storage.get_active_validations())
    }

    /// Get validation requests that need processing
    pub fn get_validations_to_process() -> Vec<CommunityValidationRequest> {
        with_storage(|storage| storage.get_validations_to_process())
    }

    /// Update validator reputation based on vote accuracy
    fn update_validator_reputation(validator: Principal, confidence: f64) {
        with_storage_mut(|storage| {
            let mut reputation = storage.get_validator_reputation(&validator)
                .unwrap_or_else(|| ValidatorReputation::new(validator));

            // For now, assume neutral accuracy since we don't have outcome data yet
            // In a full implementation, this would be called after loan performance is known
            reputation.update_reputation(true, confidence);
            storage.insert_validator_reputation(validator, reputation);
        });
    }

    /// Get community validation statistics
    pub fn get_validation_stats() -> CommunityValidationStats {
        with_storage(|storage| storage.calculate_validation_stats())
    }

    /// Get validator reputation
    pub fn get_validator_reputation(validator: Principal) -> Option<ValidatorReputation> {
        with_storage(|storage| storage.get_validator_reputation(&validator))
    }

    /// Check if a user is eligible to participate in community validation
    pub fn check_validation_eligibility(_user: Principal) -> bool {
        // For now, simple check - user must have governance tokens
        // In a full implementation, this could include reputation requirements, etc.
        
        // This would integrate with governance engine to check token balance
        // For demo purposes, return true
        true
    }

    /// Automatically process expired validations
    pub fn process_expired_validations() -> StudiFiResult<u32> {
        let validations_to_process = Self::get_validations_to_process();
        let mut processed_count = 0;

        for validation in validations_to_process {
            if let Ok(_) = Self::process_validation(validation.id.clone()) {
                processed_count += 1;
            }
        }

        ic_cdk::println!("Processed {} expired validations", processed_count);
        Ok(processed_count)
    }

    /// Create governance proposal for credit score adjustment
    pub fn create_governance_proposal_for_adjustment(
        validation_id: String,
        _proposer: Principal,
    ) -> StudiFiResult<String> {
        let validation = with_storage(|storage| storage.get_validation_request(&validation_id))
            .ok_or_else(|| StudiFiError::NotFound("Validation request not found".to_string()))?;

        if validation.status != ValidationStatus::Completed {
            return Err(StudiFiError::InvalidInput("Validation must be completed first".to_string()));
        }

        let _final_adjustment = validation.final_adjustment.unwrap_or(0);
        
        // This would integrate with governance engine to create a proposal
        // For now, return a placeholder proposal ID
        let proposal_id = format!("PROP-CREDIT-{}", validation_id);
        
        ic_cdk::println!("Created governance proposal {} for credit adjustment", proposal_id);
        Ok(proposal_id)
    }
}
