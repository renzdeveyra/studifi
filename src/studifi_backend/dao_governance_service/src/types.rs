use candid::{CandidType, Deserialize, Principal};
use serde::Serialize;
use shared::*;

/// Governance token representing voting power and platform ownership
#[derive(CandidType, Deserialize, Clone, Debug, Serialize)]
pub struct GovernanceToken {
    pub holder: Principal,
    pub balance: u64,
    pub locked_until: Option<Timestamp>,
    pub voting_power: u64,
    pub earned_from: TokenSource,
    pub created_at: Timestamp,
    pub last_updated: Timestamp,
}

impl GovernanceToken {
    pub fn new(holder: Principal, balance: u64, source: TokenSource) -> Self {
        let now = current_time();
        Self {
            holder,
            balance,
            locked_until: None,
            voting_power: balance, // 1:1 ratio by default
            earned_from: source,
            created_at: now,
            last_updated: now,
        }
    }

    pub fn lock_tokens(&mut self, duration_seconds: u64) {
        let now = current_time();
        self.locked_until = Some(now + (duration_seconds * 1_000_000_000));
        // Locked tokens get bonus voting power
        self.voting_power = (self.balance as f64 * self.lock_multiplier()) as u64;
        self.last_updated = now;
    }

    pub fn is_locked(&self) -> bool {
        if let Some(locked_until) = self.locked_until {
            current_time() < locked_until
        } else {
            false
        }
    }

    fn lock_multiplier(&self) -> f64 {
        if let Some(locked_until) = self.locked_until {
            let now = current_time();
            if locked_until > now {
                let lock_duration_days = (locked_until - now) / (24 * 60 * 60 * 1_000_000_000);
                match lock_duration_days {
                    0..=30 => 1.0,      // No bonus for < 30 days
                    31..=90 => 1.25,    // 25% bonus for 1-3 months
                    91..=365 => 1.5,    // 50% bonus for 3-12 months
                    _ => 2.0,           // 100% bonus for > 1 year
                }
            } else {
                1.0
            }
        } else {
            1.0
        }
    }
}

/// Source of governance tokens
#[derive(CandidType, Deserialize, Clone, Debug, PartialEq, Serialize)]
pub enum TokenSource {
    InitialDistribution,
    LoanOrigination,
    LoanRepayment,
    ScholarshipDonation,
    CommunityParticipation,
    Delegation,
    Staking,
}

/// Governance proposal with comprehensive tracking
#[derive(CandidType, Deserialize, Clone, Debug, Serialize)]
pub struct Proposal {
    pub id: String,
    pub proposer: Principal,
    pub title: String,
    pub description: String,
    pub proposal_type: ProposalType,
    pub status: ProposalStatus,
    pub voting_starts_at: Timestamp,
    pub voting_ends_at: Timestamp,
    pub votes_for: u64,
    pub votes_against: u64,
    pub votes_abstain: u64,
    pub total_voting_power: u64,
    pub quorum_required: u64,
    pub execution_delay: Timestamp,
    pub executed_at: Option<Timestamp>,
    pub created_at: Timestamp,
    pub updated_at: Timestamp,
}

impl Proposal {
    pub fn new(
        id: String,
        proposer: Principal,
        title: String,
        description: String,
        proposal_type: ProposalType,
        voting_period_seconds: u64,
    ) -> Self {
        let now = current_time();
        let voting_ends_at = now + (voting_period_seconds * 1_000_000_000);
        
        Self {
            id,
            proposer,
            title,
            description,
            proposal_type,
            status: ProposalStatus::Active,
            voting_starts_at: now,
            voting_ends_at,
            votes_for: 0,
            votes_against: 0,
            votes_abstain: 0,
            total_voting_power: 0,
            quorum_required: 0, // Will be set based on proposal type
            execution_delay: 24 * 60 * 60 * 1_000_000_000, // 24 hours default
            executed_at: None,
            created_at: now,
            updated_at: now,
        }
    }

    pub fn is_active(&self) -> bool {
        let now = current_time();
        self.status == ProposalStatus::Active && 
        now >= self.voting_starts_at && 
        now <= self.voting_ends_at
    }

    pub fn is_passed(&self) -> bool {
        self.votes_for > self.votes_against && 
        (self.votes_for + self.votes_against + self.votes_abstain) >= self.quorum_required
    }

    pub fn can_execute(&self) -> bool {
        let now = current_time();
        self.status == ProposalStatus::Passed && 
        now >= (self.voting_ends_at + self.execution_delay)
    }
}

/// Types of governance proposals
#[derive(CandidType, Deserialize, Clone, Debug, PartialEq, Serialize)]
pub enum ProposalType {
    ParameterChange {
        parameter: String,
        current_value: String,
        new_value: String,
    },
    TreasuryAllocation {
        treasury_type: TreasuryType,
        amount: Amount,
        recipient: Option<Principal>,
        purpose: String,
    },
    ScholarshipCreation {
        name: String,
        amount: Amount,
        criteria: ScholarshipCriteria,
        max_recipients: u32,
    },
    CreditScoreAdjustment {
        student_id: Principal,
        current_score: u32,
        proposed_score: u32,
        justification: String,
    },
    PlatformUpgrade {
        canister: String,
        version: String,
        changes: Vec<String>,
    },
    Emergency {
        action: String,
        justification: String,
    },
}

/// Treasury types for allocation proposals
#[derive(CandidType, Deserialize, Clone, Debug, PartialEq, Serialize)]
pub enum TreasuryType {
    Loan,
    Scholarship,
    Protocol,
}

/// Proposal status tracking
#[derive(CandidType, Deserialize, Clone, Debug, PartialEq, Serialize)]
pub enum ProposalStatus {
    Active,
    Passed,
    Rejected,
    Executed,
    Expired,
    Cancelled,
}

/// Individual vote record
#[derive(CandidType, Deserialize, Clone, Debug, Serialize)]
pub struct Vote {
    pub proposal_id: String,
    pub voter: Principal,
    pub vote_type: VoteType,
    pub voting_power: u64,
    pub delegated_from: Option<Principal>,
    pub cast_at: Timestamp,
}

/// Vote options
#[derive(CandidType, Deserialize, Clone, Debug, PartialEq, Serialize)]
pub enum VoteType {
    For,
    Against,
    Abstain,
}

/// Delegation record for proxy voting
#[derive(CandidType, Deserialize, Clone, Debug, Serialize)]
pub struct Delegation {
    pub delegator: Principal,
    pub delegate: Principal,
    pub voting_power: u64,
    pub expires_at: Option<Timestamp>,
    pub created_at: Timestamp,
}

/// Scholarship criteria for governance proposals
#[derive(CandidType, Deserialize, Clone, Debug, PartialEq, Serialize)]
pub struct ScholarshipCriteria {
    pub min_gpa: f64,
    pub required_programs: Vec<String>,
    pub max_recipients: u32,
    pub geographic_restrictions: Vec<String>,
    pub other_requirements: Vec<String>,
}

/// Governance statistics
#[derive(CandidType, Deserialize, Clone, Debug, Default, Serialize)]
pub struct GovernanceStats {
    pub total_proposals: u32,
    pub active_proposals: u32,
    pub passed_proposals: u32,
    pub rejected_proposals: u32,
    pub total_votes_cast: u64,
    pub total_voting_power: u64,
    pub total_token_holders: u32,
    pub total_tokens_issued: u64,
    pub total_tokens_locked: u64,
}

/// Stakeholder information
#[derive(CandidType, Deserialize, Clone, Debug, Serialize)]
pub struct Stakeholder {
    pub id: Principal,
    pub stakeholder_type: StakeholderType,
    pub tokens: GovernanceToken,
    pub delegations_received: Vec<Delegation>,
    pub delegations_given: Vec<Delegation>,
    pub proposals_created: u32,
    pub votes_cast: u32,
    pub reputation_score: u32,
    pub joined_at: Timestamp,
}

/// Types of platform stakeholders
#[derive(CandidType, Deserialize, Clone, Debug, PartialEq, Serialize)]
pub enum StakeholderType {
    Student,
    Donor,
    University,
    CommunityMember,
    TeamMember,
    Validator,
}

impl StakeholderType {
    pub fn base_voting_power(&self) -> u64 {
        match self {
            StakeholderType::Student => VOTING_POWER_STUDENT,
            StakeholderType::Donor => VOTING_POWER_DONOR,
            StakeholderType::University => VOTING_POWER_UNIVERSITY,
            StakeholderType::CommunityMember => VOTING_POWER_COMMUNITY,
            StakeholderType::TeamMember => VOTING_POWER_TEAM,
            StakeholderType::Validator => VOTING_POWER_TEAM * 2,
        }
    }
}
