use std::collections::BTreeMap;
use std::cell::RefCell;
use candid::Principal;
use crate::types::*;
use shared::*;

/// Governance storage structure
#[derive(Default)]
pub struct GovernanceStorage {
    pub proposals: BTreeMap<String, Proposal>,
    pub votes: BTreeMap<String, Vec<Vote>>, // proposal_id -> votes
    pub tokens: BTreeMap<Principal, GovernanceToken>,
    pub delegations: BTreeMap<Principal, Vec<Delegation>>, // delegator -> delegations
    pub stakeholders: BTreeMap<Principal, Stakeholder>,
    pub counters: Counters,
}

#[derive(Default)]
pub struct Counters {
    pub proposal_counter: u64,
    pub vote_counter: u64,
}

thread_local! {
    static STORAGE: RefCell<GovernanceStorage> = RefCell::new(GovernanceStorage::default());
}

/// Storage access functions
pub fn with_storage<R>(f: impl FnOnce(&GovernanceStorage) -> R) -> R {
    STORAGE.with(|storage| f(&storage.borrow()))
}

pub fn with_storage_mut<R>(f: impl FnOnce(&mut GovernanceStorage) -> R) -> R {
    STORAGE.with(|storage| f(&mut storage.borrow_mut()))
}

impl GovernanceStorage {
    // Proposal operations
    pub fn insert_proposal(&mut self, id: String, proposal: Proposal) {
        self.proposals.insert(id, proposal);
    }

    pub fn get_proposal(&self, id: &str) -> Option<Proposal> {
        self.proposals.get(id).cloned()
    }

    pub fn update_proposal(&mut self, id: String, proposal: Proposal) {
        self.proposals.insert(id, proposal);
    }

    pub fn get_all_proposals(&self) -> Vec<Proposal> {
        self.proposals.values().cloned().collect()
    }

    pub fn get_active_proposals(&self) -> Vec<Proposal> {
        self.proposals
            .values()
            .filter(|p| p.is_active())
            .cloned()
            .collect()
    }

    pub fn get_proposals_by_status(&self, status: ProposalStatus) -> Vec<Proposal> {
        self.proposals
            .values()
            .filter(|p| p.status == status)
            .cloned()
            .collect()
    }

    // Vote operations
    pub fn add_vote(&mut self, proposal_id: String, vote: Vote) {
        self.votes
            .entry(proposal_id)
            .or_insert_with(Vec::new)
            .push(vote);
    }

    pub fn get_votes_for_proposal(&self, proposal_id: &str) -> Vec<Vote> {
        self.votes
            .get(proposal_id)
            .cloned()
            .unwrap_or_default()
    }

    pub fn has_voted(&self, proposal_id: &str, voter: &Principal) -> bool {
        if let Some(votes) = self.votes.get(proposal_id) {
            votes.iter().any(|v| v.voter == *voter)
        } else {
            false
        }
    }

    // Token operations
    pub fn insert_token(&mut self, holder: Principal, token: GovernanceToken) {
        self.tokens.insert(holder, token);
    }

    pub fn get_token(&self, holder: &Principal) -> Option<GovernanceToken> {
        self.tokens.get(holder).cloned()
    }

    pub fn update_token(&mut self, holder: Principal, token: GovernanceToken) {
        self.tokens.insert(holder, token);
    }

    pub fn get_all_tokens(&self) -> Vec<GovernanceToken> {
        self.tokens.values().cloned().collect()
    }

    pub fn get_total_voting_power(&self) -> u64 {
        self.tokens.values().map(|t| t.voting_power).sum()
    }

    // Delegation operations
    pub fn add_delegation(&mut self, delegator: Principal, delegation: Delegation) {
        self.delegations
            .entry(delegator)
            .or_insert_with(Vec::new)
            .push(delegation);
    }

    pub fn get_delegations_by_delegator(&self, delegator: &Principal) -> Vec<Delegation> {
        self.delegations
            .get(delegator)
            .cloned()
            .unwrap_or_default()
    }

    pub fn get_delegations_to_delegate(&self, delegate: &Principal) -> Vec<Delegation> {
        self.delegations
            .values()
            .flatten()
            .filter(|d| d.delegate == *delegate)
            .cloned()
            .collect()
    }

    pub fn remove_delegation(&mut self, delegator: &Principal, delegate: &Principal) {
        if let Some(delegations) = self.delegations.get_mut(delegator) {
            delegations.retain(|d| d.delegate != *delegate);
        }
    }

    // Stakeholder operations
    pub fn insert_stakeholder(&mut self, id: Principal, stakeholder: Stakeholder) {
        self.stakeholders.insert(id, stakeholder);
    }

    pub fn get_stakeholder(&self, id: &Principal) -> Option<Stakeholder> {
        self.stakeholders.get(id).cloned()
    }

    pub fn update_stakeholder(&mut self, id: Principal, stakeholder: Stakeholder) {
        self.stakeholders.insert(id, stakeholder);
    }

    pub fn get_all_stakeholders(&self) -> Vec<Stakeholder> {
        self.stakeholders.values().cloned().collect()
    }

    pub fn get_stakeholders_by_type(&self, stakeholder_type: StakeholderType) -> Vec<Stakeholder> {
        self.stakeholders
            .values()
            .filter(|s| s.stakeholder_type == stakeholder_type)
            .cloned()
            .collect()
    }

    // Counter operations
    pub fn get_next_proposal_id(&mut self) -> String {
        let id = generate_id(PROPOSAL_PREFIX, self.counters.proposal_counter);
        self.counters.proposal_counter += 1;
        id
    }

    pub fn get_next_vote_id(&mut self) -> u64 {
        let id = self.counters.vote_counter;
        self.counters.vote_counter += 1;
        id
    }

    // Statistics
    pub fn get_governance_stats(&self) -> GovernanceStats {
        let total_proposals = self.proposals.len() as u32;
        let active_proposals = self.get_active_proposals().len() as u32;
        let passed_proposals = self.get_proposals_by_status(ProposalStatus::Passed).len() as u32;
        let rejected_proposals = self.get_proposals_by_status(ProposalStatus::Rejected).len() as u32;
        
        let total_votes_cast = self.votes.values().map(|v| v.len() as u64).sum();
        let total_voting_power = self.get_total_voting_power();
        let total_token_holders = self.tokens.len() as u32;
        let total_tokens_issued = self.tokens.values().map(|t| t.balance).sum();
        let total_tokens_locked = self.tokens
            .values()
            .filter(|t| t.is_locked())
            .map(|t| t.balance)
            .sum();

        GovernanceStats {
            total_proposals,
            active_proposals,
            passed_proposals,
            rejected_proposals,
            total_votes_cast,
            total_voting_power,
            total_token_holders,
            total_tokens_issued,
            total_tokens_locked,
        }
    }

    // Utility functions
    pub fn calculate_quorum_for_proposal(&self, proposal_type: &ProposalType) -> u64 {
        let total_voting_power = self.get_total_voting_power();
        match proposal_type {
            ProposalType::Emergency { .. } => total_voting_power * 75 / 100, // 75% for emergency
            ProposalType::PlatformUpgrade { .. } => total_voting_power * 66 / 100, // 66% for upgrades
            ProposalType::TreasuryAllocation { .. } => total_voting_power * 51 / 100, // 51% for treasury
            ProposalType::ParameterChange { .. } => total_voting_power * 51 / 100, // 51% for parameters
            _ => total_voting_power * 33 / 100, // 33% for other proposals
        }
    }

    pub fn get_effective_voting_power(&self, voter: &Principal) -> u64 {
        let mut total_power = 0;

        // Own tokens
        if let Some(token) = self.get_token(voter) {
            total_power += token.voting_power;
        }

        // Delegated power
        let delegations = self.get_delegations_to_delegate(voter);
        for delegation in delegations {
            if delegation.expires_at.is_none() || 
               delegation.expires_at.unwrap() > current_time() {
                total_power += delegation.voting_power;
            }
        }

        total_power
    }
}
