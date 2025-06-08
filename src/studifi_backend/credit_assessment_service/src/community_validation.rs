use candid::{CandidType, Deserialize, Principal};
use serde::Serialize;
use crate::types::*;
use shared::*;

/// Community validation request for credit score adjustment
#[derive(CandidType, Deserialize, Clone, Debug, Serialize)]
pub struct CommunityValidationRequest {
    pub id: String,
    pub student_id: Principal,
    pub application_id: String,
    pub algorithm_score: u32,
    pub proposed_adjustment: i32, // Can be positive or negative
    pub justification: String,
    pub evidence: Vec<ValidationEvidence>,
    pub status: ValidationStatus,
    pub created_by: Principal,
    pub created_at: Timestamp,
    pub voting_ends_at: Timestamp,
    pub votes: Vec<CommunityVote>,
    pub final_adjustment: Option<i32>,
    pub processed_at: Option<Timestamp>,
}

impl CommunityValidationRequest {
    pub fn new(
        id: String,
        student_id: Principal,
        application_id: String,
        algorithm_score: u32,
        proposed_adjustment: i32,
        justification: String,
        evidence: Vec<ValidationEvidence>,
        created_by: Principal,
    ) -> Self {
        let now = current_time();
        Self {
            id,
            student_id,
            application_id,
            algorithm_score,
            proposed_adjustment,
            justification,
            evidence,
            status: ValidationStatus::Active,
            created_by,
            created_at: now,
            voting_ends_at: now + (7 * 24 * 60 * 60 * 1_000_000_000), // 7 days
            votes: Vec::new(),
            final_adjustment: None,
            processed_at: None,
        }
    }

    pub fn is_active(&self) -> bool {
        self.status == ValidationStatus::Active && current_time() <= self.voting_ends_at
    }

    pub fn calculate_weighted_adjustment(&self) -> i32 {
        if self.votes.is_empty() {
            return 0;
        }

        let total_voting_power: u64 = self.votes.iter().map(|v| v.voting_power).sum();
        if total_voting_power == 0 {
            return 0;
        }

        let weighted_sum: i64 = self.votes.iter()
            .map(|v| v.adjustment_vote as i64 * v.voting_power as i64)
            .sum();

        (weighted_sum / total_voting_power as i64) as i32
    }
}

/// Community vote on credit score adjustment
#[derive(CandidType, Deserialize, Clone, Debug, Serialize)]
pub struct CommunityVote {
    pub validation_id: String,
    pub voter: Principal,
    pub adjustment_vote: i32, // Voter's suggested adjustment
    pub confidence: f64, // Voter's confidence in their assessment (0.0-1.0)
    pub voting_power: u64, // Based on governance tokens
    pub justification: String,
    pub cast_at: Timestamp,
}

/// Evidence provided for validation
#[derive(CandidType, Deserialize, Clone, Debug, Serialize)]
pub struct ValidationEvidence {
    pub evidence_type: EvidenceType,
    pub description: String,
    pub impact: EvidenceImpact,
    pub verified: bool,
    pub provided_by: Principal,
}

/// Types of evidence for validation
#[derive(CandidType, Deserialize, Clone, Debug, PartialEq, Eq, Hash, Serialize)]
pub enum EvidenceType {
    LocalKnowledge,      // Community member knows the student personally
    AcademicRecord,      // Additional academic information
    FinancialCircumstance, // Special financial circumstances
    CharacterReference,  // Character reference from community
    WorkExperience,      // Relevant work experience
    CommunityInvolvement, // Community service/involvement
    Other(String),       // Other evidence type
}

/// Impact of evidence on credit assessment
#[derive(CandidType, Deserialize, Clone, Debug, PartialEq, Serialize)]
pub enum EvidenceImpact {
    StronglyPositive,    // +50 to +100 points
    Positive,            // +20 to +50 points
    SlightlyPositive,    // +5 to +20 points
    Neutral,             // No impact
    SlightlyNegative,    // -5 to -20 points
    Negative,            // -20 to -50 points
    StronglyNegative,    // -50 to -100 points
}

impl EvidenceImpact {
    pub fn to_score_range(&self) -> (i32, i32) {
        match self {
            EvidenceImpact::StronglyPositive => (50, 100),
            EvidenceImpact::Positive => (20, 50),
            EvidenceImpact::SlightlyPositive => (5, 20),
            EvidenceImpact::Neutral => (0, 0),
            EvidenceImpact::SlightlyNegative => (-20, -5),
            EvidenceImpact::Negative => (-50, -20),
            EvidenceImpact::StronglyNegative => (-100, -50),
        }
    }
}

/// Status of validation request
#[derive(CandidType, Deserialize, Clone, Debug, PartialEq, Serialize)]
pub enum ValidationStatus {
    Active,              // Currently accepting votes
    Completed,           // Voting completed, adjustment calculated
    Applied,             // Adjustment applied to credit score
    Rejected,            // Validation request rejected
    Expired,             // Voting period expired
}

/// Hybrid credit score combining algorithm and community input
#[derive(CandidType, Deserialize, Clone, Debug, Serialize)]
pub struct HybridCreditScore {
    pub student_id: Principal,
    pub algorithm_score: CreditScore,
    pub community_adjustment: i32,
    pub final_score: u32,
    pub community_confidence: f64,
    pub validation_count: u32,
    pub last_community_review: Option<Timestamp>,
    pub hybrid_factors: Vec<CommunityFactor>,
    pub calculated_at: Timestamp,
}

impl HybridCreditScore {
    pub fn new(algorithm_score: CreditScore, community_adjustment: i32) -> Self {
        let adjusted_score = (algorithm_score.score as i32 + community_adjustment)
            .max(0)
            .min(1000) as u32;

        Self {
            student_id: Principal::anonymous(), // Will be set when stored
            algorithm_score,
            community_adjustment,
            final_score: adjusted_score,
            community_confidence: 0.0,
            validation_count: 0,
            last_community_review: None,
            hybrid_factors: Vec::new(),
            calculated_at: current_time(),
        }
    }

    pub fn apply_community_validation(&mut self, validation: &CommunityValidationRequest) {
        if validation.status == ValidationStatus::Applied {
            if let Some(adjustment) = validation.final_adjustment {
                self.community_adjustment += adjustment;
                self.final_score = (self.algorithm_score.score as i32 + self.community_adjustment)
                    .max(0)
                    .min(1000) as u32;
                
                self.validation_count += 1;
                self.last_community_review = Some(current_time());
                
                // Calculate community confidence based on vote consensus
                self.community_confidence = self.calculate_community_confidence(&validation.votes);
                
                // Add community factors
                self.add_community_factors(validation);
            }
        }
    }

    fn calculate_community_confidence(&self, votes: &[CommunityVote]) -> f64 {
        if votes.is_empty() {
            return 0.0;
        }

        // Calculate consensus based on vote variance
        let adjustments: Vec<i32> = votes.iter().map(|v| v.adjustment_vote).collect();
        let mean = adjustments.iter().sum::<i32>() as f64 / adjustments.len() as f64;
        let variance = adjustments.iter()
            .map(|&x| (x as f64 - mean).powi(2))
            .sum::<f64>() / adjustments.len() as f64;
        
        // Lower variance = higher confidence
        let consensus_score = 1.0 / (1.0 + variance / 100.0);
        
        // Weight by average voter confidence
        let avg_voter_confidence = votes.iter().map(|v| v.confidence).sum::<f64>() / votes.len() as f64;
        
        (consensus_score * avg_voter_confidence).min(1.0)
    }

    fn add_community_factors(&mut self, validation: &CommunityValidationRequest) {
        // Group evidence by type and create community factors
        let mut evidence_groups: std::collections::HashMap<EvidenceType, Vec<&ValidationEvidence>> = 
            std::collections::HashMap::new();
        
        for evidence in &validation.evidence {
            evidence_groups.entry(evidence.evidence_type.clone())
                .or_insert_with(Vec::new)
                .push(evidence);
        }

        for (evidence_type, evidences) in evidence_groups {
            let factor = CommunityFactor {
                name: format!("{:?}", evidence_type),
                evidence_count: evidences.len() as u32,
                average_impact: self.calculate_average_impact(&evidences),
                community_weight: self.calculate_community_weight(&evidences),
                verified_count: evidences.iter().filter(|e| e.verified).count() as u32,
            };
            self.hybrid_factors.push(factor);
        }
    }

    fn calculate_average_impact(&self, evidences: &[&ValidationEvidence]) -> f64 {
        if evidences.is_empty() {
            return 0.0;
        }

        let total_impact: i32 = evidences.iter()
            .map(|e| {
                let (min, max) = e.impact.to_score_range();
                (min + max) / 2
            })
            .sum();

        total_impact as f64 / evidences.len() as f64
    }

    fn calculate_community_weight(&self, evidences: &[&ValidationEvidence]) -> f64 {
        let verified_count = evidences.iter().filter(|e| e.verified).count();
        let total_count = evidences.len();
        
        if total_count == 0 {
            return 0.0;
        }

        // Weight based on verification rate and evidence count
        let verification_rate = verified_count as f64 / total_count as f64;
        let count_weight = (total_count as f64).min(5.0) / 5.0; // Max weight at 5 pieces of evidence
        
        verification_rate * count_weight
    }
}

/// Community-contributed factor in credit assessment
#[derive(CandidType, Deserialize, Clone, Debug, Serialize)]
pub struct CommunityFactor {
    pub name: String,
    pub evidence_count: u32,
    pub average_impact: f64,
    pub community_weight: f64,
    pub verified_count: u32,
}

/// Community validation statistics
#[derive(CandidType, Deserialize, Clone, Debug, Default, Serialize)]
pub struct CommunityValidationStats {
    pub total_validations: u32,
    pub active_validations: u32,
    pub completed_validations: u32,
    pub average_adjustment: f64,
    pub total_community_votes: u64,
    pub unique_validators: u32,
    pub average_consensus_score: f64,
}

/// Validator reputation and performance
#[derive(CandidType, Deserialize, Clone, Debug, Serialize)]
pub struct ValidatorReputation {
    pub validator: Principal,
    pub total_votes: u32,
    pub accurate_predictions: u32,
    pub reputation_score: f64,
    pub specialization: Vec<EvidenceType>,
    pub average_confidence: f64,
    pub last_active: Timestamp,
}

impl ValidatorReputation {
    pub fn new(validator: Principal) -> Self {
        Self {
            validator,
            total_votes: 0,
            accurate_predictions: 0,
            reputation_score: 0.5, // Start with neutral reputation
            specialization: Vec::new(),
            average_confidence: 0.0,
            last_active: current_time(),
        }
    }

    pub fn update_reputation(&mut self, vote_accuracy: bool, confidence: f64) {
        self.total_votes += 1;
        if vote_accuracy {
            self.accurate_predictions += 1;
        }
        
        // Calculate new reputation score
        let accuracy_rate = self.accurate_predictions as f64 / self.total_votes as f64;
        self.reputation_score = accuracy_rate * 0.7 + confidence * 0.3;
        
        // Update average confidence
        self.average_confidence = (self.average_confidence * (self.total_votes - 1) as f64 + confidence) 
                                 / self.total_votes as f64;
        
        self.last_active = current_time();
    }
}
