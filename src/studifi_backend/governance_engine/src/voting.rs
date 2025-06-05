use candid::Principal;
use crate::types::*;
use crate::storage::*;
use shared::*;

/// Voting engine for governance proposals
pub struct VotingEngine;

impl VotingEngine {
    /// Cast a vote on a proposal
    pub fn cast_vote(
        proposal_id: String,
        voter: Principal,
        vote_type: VoteType,
    ) -> StudiFiResult<Vote> {
        // Validate proposal exists and is active
        let mut proposal = with_storage(|storage| storage.get_proposal(&proposal_id))
            .ok_or_else(|| StudiFiError::NotFound("Proposal not found".to_string()))?;

        if !proposal.is_active() {
            return Err(StudiFiError::InvalidInput("Proposal is not active".to_string()));
        }

        // Check if voter has already voted
        if with_storage(|storage| storage.has_voted(&proposal_id, &voter)) {
            return Err(StudiFiError::AlreadyExists("Vote already cast".to_string()));
        }

        // Get effective voting power (including delegations)
        let voting_power = with_storage(|storage| storage.get_effective_voting_power(&voter));

        if voting_power == 0 {
            return Err(StudiFiError::Unauthorized("No voting power".to_string()));
        }

        // Create vote record
        let vote = Vote {
            proposal_id: proposal_id.clone(),
            voter,
            vote_type: vote_type.clone(),
            voting_power,
            delegated_from: None, // TODO: Track delegation source
            cast_at: current_time(),
        };

        // Update proposal vote counts
        match vote_type {
            VoteType::For => proposal.votes_for += voting_power,
            VoteType::Against => proposal.votes_against += voting_power,
            VoteType::Abstain => proposal.votes_abstain += voting_power,
        }

        proposal.updated_at = current_time();

        // Store vote and update proposal
        with_storage_mut(|storage| {
            storage.add_vote(proposal_id.clone(), vote.clone());
            storage.update_proposal(proposal_id, proposal);
        });

        Ok(vote)
    }

    /// Process proposal after voting period ends
    pub fn process_proposal(proposal_id: String) -> StudiFiResult<Proposal> {
        let mut proposal = with_storage(|storage| storage.get_proposal(&proposal_id))
            .ok_or_else(|| StudiFiError::NotFound("Proposal not found".to_string()))?;

        let now = current_time();

        // Check if voting period has ended
        if now <= proposal.voting_ends_at {
            return Err(StudiFiError::InvalidInput("Voting period not ended".to_string()));
        }

        // Skip if already processed
        if proposal.status != ProposalStatus::Active {
            return Ok(proposal);
        }

        // Calculate quorum requirement
        proposal.quorum_required = with_storage(|storage| 
            storage.calculate_quorum_for_proposal(&proposal.proposal_type)
        );

        // Determine outcome
        let total_votes = proposal.votes_for + proposal.votes_against + proposal.votes_abstain;
        
        if total_votes < proposal.quorum_required {
            proposal.status = ProposalStatus::Rejected;
        } else if proposal.votes_for > proposal.votes_against {
            proposal.status = ProposalStatus::Passed;
        } else {
            proposal.status = ProposalStatus::Rejected;
        }

        proposal.updated_at = now;

        // Store updated proposal
        with_storage_mut(|storage| {
            storage.update_proposal(proposal_id, proposal.clone());
        });

        ic_cdk::println!("Processed proposal {}: {:?}", proposal.id, proposal.status);
        Ok(proposal)
    }

    /// Execute a passed proposal
    pub fn execute_proposal(proposal_id: String) -> StudiFiResult<String> {
        let mut proposal = with_storage(|storage| storage.get_proposal(&proposal_id))
            .ok_or_else(|| StudiFiError::NotFound("Proposal not found".to_string()))?;

        if !proposal.can_execute() {
            return Err(StudiFiError::InvalidInput("Proposal cannot be executed yet".to_string()));
        }

        // Execute based on proposal type
        let execution_result = match &proposal.proposal_type {
            ProposalType::ParameterChange { parameter, new_value, .. } => {
                Self::execute_parameter_change(parameter, new_value)
            },
            ProposalType::TreasuryAllocation { treasury_type, amount, recipient, purpose } => {
                Self::execute_treasury_allocation(treasury_type, *amount, recipient, purpose)
            },
            ProposalType::ScholarshipCreation { name, amount, criteria, max_recipients } => {
                Self::execute_scholarship_creation(name, *amount, criteria, *max_recipients)
            },
            ProposalType::CreditScoreAdjustment { student_id, proposed_score, .. } => {
                Self::execute_credit_score_adjustment(*student_id, *proposed_score)
            },
            ProposalType::PlatformUpgrade { canister, version, .. } => {
                Self::execute_platform_upgrade(canister, version)
            },
            ProposalType::Emergency { action, .. } => {
                Self::execute_emergency_action(action)
            },
        };

        match execution_result {
            Ok(result) => {
                proposal.status = ProposalStatus::Executed;
                proposal.executed_at = Some(current_time());
                proposal.updated_at = current_time();

                with_storage_mut(|storage| {
                    storage.update_proposal(proposal_id, proposal);
                });

                Ok(result)
            },
            Err(e) => {
                ic_cdk::println!("Failed to execute proposal {}: {:?}", proposal_id, e);
                Err(e)
            }
        }
    }

    /// Delegate voting power to another user
    pub fn delegate_voting_power(
        delegator: Principal,
        delegate: Principal,
        duration_seconds: Option<u64>,
    ) -> StudiFiResult<Delegation> {
        // Get delegator's token
        let token = with_storage(|storage| storage.get_token(&delegator))
            .ok_or_else(|| StudiFiError::NotFound("No tokens found".to_string()))?;

        if token.is_locked() {
            return Err(StudiFiError::InvalidInput("Tokens are locked".to_string()));
        }

        // Create delegation
        let expires_at = duration_seconds.map(|d| current_time() + (d * 1_000_000_000));
        
        let delegation = Delegation {
            delegator,
            delegate,
            voting_power: token.voting_power,
            expires_at,
            created_at: current_time(),
        };

        // Store delegation
        with_storage_mut(|storage| {
            storage.add_delegation(delegator, delegation.clone());
        });

        ic_cdk::println!("Delegated {} voting power from {:?} to {:?}", 
                        token.voting_power, delegator, delegate);
        Ok(delegation)
    }

    /// Remove delegation
    pub fn remove_delegation(
        delegator: Principal,
        delegate: Principal,
    ) -> StudiFiResult<()> {
        with_storage_mut(|storage| {
            storage.remove_delegation(&delegator, &delegate);
        });

        ic_cdk::println!("Removed delegation from {:?} to {:?}", delegator, delegate);
        Ok(())
    }

    // Execution functions for different proposal types
    fn execute_parameter_change(parameter: &str, new_value: &str) -> StudiFiResult<String> {
        // TODO: Implement parameter changes
        ic_cdk::println!("Executing parameter change: {} = {}", parameter, new_value);
        Ok(format!("Parameter {} updated to {}", parameter, new_value))
    }

    fn execute_treasury_allocation(
        treasury_type: &TreasuryType,
        amount: Amount,
        _recipient: &Option<Principal>,
        purpose: &str,
    ) -> StudiFiResult<String> {
        // TODO: Implement treasury allocation
        ic_cdk::println!("Executing treasury allocation: {:?} {} for {}", 
                        treasury_type, format_currency(amount), purpose);
        Ok(format!("Allocated {} from {:?} treasury", format_currency(amount), treasury_type))
    }

    fn execute_scholarship_creation(
        name: &str,
        amount: Amount,
        _criteria: &ScholarshipCriteria,
        max_recipients: u32,
    ) -> StudiFiResult<String> {
        // TODO: Implement scholarship creation
        ic_cdk::println!("Creating scholarship: {} for {} with {} max recipients", 
                        name, format_currency(amount), max_recipients);
        Ok(format!("Created scholarship: {}", name))
    }

    fn execute_credit_score_adjustment(
        student_id: Principal,
        proposed_score: u32,
    ) -> StudiFiResult<String> {
        // TODO: Implement credit score adjustment
        ic_cdk::println!("Adjusting credit score for {:?} to {}", student_id, proposed_score);
        Ok(format!("Adjusted credit score for student"))
    }

    fn execute_platform_upgrade(canister: &str, version: &str) -> StudiFiResult<String> {
        // TODO: Implement platform upgrade
        ic_cdk::println!("Upgrading {} to version {}", canister, version);
        Ok(format!("Upgraded {} to {}", canister, version))
    }

    fn execute_emergency_action(action: &str) -> StudiFiResult<String> {
        // TODO: Implement emergency actions
        ic_cdk::println!("Executing emergency action: {}", action);
        Ok(format!("Executed emergency action: {}", action))
    }

    /// Calculate quadratic voting power
    pub fn calculate_quadratic_voting_power(token_balance: u64) -> u64 {
        // Quadratic voting: voting power = sqrt(tokens)
        (token_balance as f64).sqrt() as u64
    }

    /// Get voting history for a user
    pub fn get_voting_history(voter: &Principal) -> Vec<Vote> {
        with_storage(|storage| {
            storage.votes
                .values()
                .flatten()
                .filter(|v| v.voter == *voter)
                .cloned()
                .collect()
        })
    }
}
