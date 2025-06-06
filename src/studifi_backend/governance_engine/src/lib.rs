use candid::{candid_method, Principal};
use ic_cdk::{query, update, init, pre_upgrade, post_upgrade, caller};
use shared::*;

mod types;
mod storage;
mod voting;

use types::*;
use storage::*;
use voting::*;

#[init]
fn init() {
    ic_cdk::println!("Governance Engine canister initialized");
}

#[pre_upgrade]
fn pre_upgrade() {
    ic_cdk::println!("Governance Engine canister upgrading...");
}

#[post_upgrade]
fn post_upgrade() {
    ic_cdk::println!("Governance Engine canister upgraded successfully");
}

// ============================================================================
// GOVERNANCE TOKEN MANAGEMENT
// ============================================================================

/// Issue governance tokens to a user
#[update]
#[candid_method(update)]
async fn issue_tokens(
    recipient: Principal,
    amount: u64,
    source: TokenSource,
    stakeholder_type: StakeholderType,
) -> StudiFiResult<GovernanceToken> {
    let _caller = caller();

    // TODO: Add authorization check (only admin or governance can issue tokens)

    // Create or update token
    let token = with_storage_mut(|storage| {
        match storage.get_token(&recipient) {
            Some(mut existing_token) => {
                existing_token.balance += amount;
                existing_token.voting_power += amount;
                existing_token.last_updated = current_time();
                storage.update_token(recipient, existing_token.clone());
                existing_token
            },
            None => {
                let new_token = GovernanceToken::new(recipient, amount, source.clone());
                storage.insert_token(recipient, new_token.clone());

                // Create stakeholder record
                let stakeholder = Stakeholder {
                    id: recipient,
                    stakeholder_type: stakeholder_type.clone(),
                    tokens: new_token.clone(),
                    delegations_received: Vec::new(),
                    delegations_given: Vec::new(),
                    proposals_created: 0,
                    votes_cast: 0,
                    reputation_score: stakeholder_type.base_voting_power() as u32,
                    joined_at: current_time(),
                };
                storage.insert_stakeholder(recipient, stakeholder);

                new_token
            }
        }
    });

    ic_cdk::println!("Issued {} tokens to {:?} from {:?}", amount, recipient, source);
    Ok(token)
}

/// Lock tokens for increased voting power
#[update]
#[candid_method(update)]
async fn lock_tokens(duration_seconds: u64) -> StudiFiResult<GovernanceToken> {
    let caller = caller();

    let mut token = with_storage(|storage| storage.get_token(&caller))
        .ok_or_else(|| StudiFiError::NotFound("No tokens found".to_string()))?;

    if token.is_locked() {
        return Err(StudiFiError::InvalidInput("Tokens already locked".to_string()));
    }

    token.lock_tokens(duration_seconds);

    with_storage_mut(|storage| {
        storage.update_token(caller, token.clone());
    });

    ic_cdk::println!("Locked {} tokens for {:?} for {} seconds",
                    token.balance, caller, duration_seconds);
    Ok(token)
}

/// Get token information for a user
#[query]
#[candid_method(query)]
fn get_tokens(holder: Principal) -> Option<GovernanceToken> {
    with_storage(|storage| storage.get_token(&holder))
}

/// Get my token information
#[query]
#[candid_method(query)]
fn get_my_tokens() -> Option<GovernanceToken> {
    let caller = caller();
    with_storage(|storage| storage.get_token(&caller))
}

// ============================================================================
// PROPOSAL MANAGEMENT
// ============================================================================

/// Create a governance proposal
#[update]
#[candid_method(update)]
async fn create_proposal(
    title: String,
    description: String,
    proposal_type: ProposalType,
    voting_period_seconds: Option<u64>,
) -> StudiFiResult<Proposal> {
    let caller = caller();

    // Validate inputs
    if title.len() > MAX_TITLE_LENGTH {
        return Err(StudiFiError::InvalidInput("Title too long".to_string()));
    }

    if description.len() > MAX_DESCRIPTION_LENGTH {
        return Err(StudiFiError::InvalidInput("Description too long".to_string()));
    }

    // Check if caller has tokens (can propose)
    let token = with_storage(|storage| storage.get_token(&caller))
        .ok_or_else(|| StudiFiError::Unauthorized("No tokens to create proposal".to_string()))?;

    if token.voting_power < 100 { // Minimum 100 voting power to propose
        return Err(StudiFiError::Unauthorized("Insufficient voting power to propose".to_string()));
    }

    // Create proposal
    let proposal_id = with_storage_mut(|storage| storage.get_next_proposal_id());
    let voting_period = voting_period_seconds.unwrap_or(DEFAULT_VOTING_PERIOD / 1_000_000_000);

    let mut proposal = Proposal::new(
        proposal_id.clone(),
        caller,
        title,
        description,
        proposal_type,
        voting_period,
    );

    // Set quorum based on proposal type
    proposal.quorum_required = with_storage(|storage|
        storage.calculate_quorum_for_proposal(&proposal.proposal_type)
    );

    // Store proposal
    with_storage_mut(|storage| {
        storage.insert_proposal(proposal_id.clone(), proposal.clone());

        // Update stakeholder stats
        if let Some(mut stakeholder) = storage.get_stakeholder(&caller) {
            stakeholder.proposals_created += 1;
            storage.update_stakeholder(caller, stakeholder);
        }
    });

    ic_cdk::println!("Created proposal: {} by {:?}", proposal.id, caller);
    Ok(proposal)
}

/// Get proposal by ID
#[query]
#[candid_method(query)]
fn get_proposal(proposal_id: String) -> Option<Proposal> {
    with_storage(|storage| storage.get_proposal(&proposal_id))
}

/// Get all active proposals
#[query]
#[candid_method(query)]
fn get_active_proposals() -> Vec<Proposal> {
    with_storage(|storage| storage.get_active_proposals())
}

/// Get all proposals
#[query]
#[candid_method(query)]
fn get_all_proposals() -> Vec<Proposal> {
    with_storage(|storage| storage.get_all_proposals())
}

/// Get proposals by status
#[query]
#[candid_method(query)]
fn get_proposals_by_status(status: ProposalStatus) -> Vec<Proposal> {
    with_storage(|storage| storage.get_proposals_by_status(status))
}

// ============================================================================
// VOTING FUNCTIONS
// ============================================================================

/// Cast a vote on a proposal
#[update]
#[candid_method(update)]
async fn vote_on_proposal(
    proposal_id: String,
    vote_type: VoteType,
) -> StudiFiResult<Vote> {
    let caller = caller();
    VotingEngine::cast_vote(proposal_id, caller, vote_type)
}

/// Process proposal after voting ends
#[update]
#[candid_method(update)]
async fn process_proposal(proposal_id: String) -> StudiFiResult<Proposal> {
    VotingEngine::process_proposal(proposal_id)
}

/// Execute a passed proposal
#[update]
#[candid_method(update)]
async fn execute_proposal(proposal_id: String) -> StudiFiResult<String> {
    VotingEngine::execute_proposal(proposal_id)
}

/// Get votes for a proposal
#[query]
#[candid_method(query)]
fn get_proposal_votes(proposal_id: String) -> Vec<Vote> {
    with_storage(|storage| storage.get_votes_for_proposal(&proposal_id))
}

/// Get voting history for current user
#[query]
#[candid_method(query)]
fn get_my_voting_history() -> Vec<Vote> {
    let caller = caller();
    VotingEngine::get_voting_history(&caller)
}

// ============================================================================
// DELEGATION FUNCTIONS
// ============================================================================

/// Delegate voting power to another user
#[update]
#[candid_method(update)]
async fn delegate_voting_power(
    delegate: Principal,
    duration_seconds: Option<u64>,
) -> StudiFiResult<Delegation> {
    let caller = caller();
    VotingEngine::delegate_voting_power(caller, delegate, duration_seconds)
}

/// Remove delegation
#[update]
#[candid_method(update)]
async fn remove_delegation(delegate: Principal) -> StudiFiResult<()> {
    let caller = caller();
    VotingEngine::remove_delegation(caller, delegate)
}

/// Get delegations given by current user
#[query]
#[candid_method(query)]
fn get_my_delegations() -> Vec<Delegation> {
    let caller = caller();
    with_storage(|storage| storage.get_delegations_by_delegator(&caller))
}

/// Get delegations received by current user
#[query]
#[candid_method(query)]
fn get_delegations_to_me() -> Vec<Delegation> {
    let caller = caller();
    with_storage(|storage| storage.get_delegations_to_delegate(&caller))
}

// ============================================================================
// STAKEHOLDER FUNCTIONS
// ============================================================================

/// Get stakeholder information
#[query]
#[candid_method(query)]
fn get_stakeholder(id: Principal) -> Option<Stakeholder> {
    with_storage(|storage| storage.get_stakeholder(&id))
}

/// Get my stakeholder information
#[query]
#[candid_method(query)]
fn get_my_stakeholder_info() -> Option<Stakeholder> {
    let caller = caller();
    with_storage(|storage| storage.get_stakeholder(&caller))
}

/// Get all stakeholders by type
#[query]
#[candid_method(query)]
fn get_stakeholders_by_type(stakeholder_type: StakeholderType) -> Vec<Stakeholder> {
    with_storage(|storage| storage.get_stakeholders_by_type(stakeholder_type))
}

// ============================================================================
// STATISTICS AND REPORTING
// ============================================================================

/// Get governance statistics
#[query]
#[candid_method(query)]
fn get_governance_stats() -> GovernanceStats {
    with_storage(|storage| storage.get_governance_stats())
}

/// Get platform statistics (legacy)
#[query]
#[candid_method(query)]
fn get_platform_stats() -> Statistics {
    Statistics::default()
}

/// Get effective voting power for a user
#[query]
#[candid_method(query)]
fn get_effective_voting_power(user: Principal) -> u64 {
    with_storage(|storage| storage.get_effective_voting_power(&user))
}

/// Get my effective voting power
#[query]
#[candid_method(query)]
fn get_my_voting_power() -> u64 {
    let caller = caller();
    with_storage(|storage| storage.get_effective_voting_power(&caller))
}

// ============================================================================
// INITIALIZATION AND DEMO FUNCTIONS
// ============================================================================

/// Initialize governance with demo tokens for testing
#[update]
#[candid_method(update)]
async fn initialize_demo_governance() -> StudiFiResult<String> {
    let caller = caller();

    // Give the caller some initial tokens to test with
    let token = with_storage_mut(|storage| {
        // Check if already has tokens
        if storage.get_token(&caller).is_some() {
            return Err(StudiFiError::AlreadyExists("User already has tokens".to_string()));
        }

        let new_token = GovernanceToken::new(caller, 1000, TokenSource::InitialDistribution);
        storage.insert_token(caller, new_token.clone());

        // Create stakeholder record
        let stakeholder = Stakeholder {
            id: caller,
            stakeholder_type: StakeholderType::Student,
            tokens: new_token.clone(),
            delegations_received: Vec::new(),
            delegations_given: Vec::new(),
            proposals_created: 0,
            votes_cast: 0,
            reputation_score: 100,
            joined_at: current_time(),
        };
        storage.insert_stakeholder(caller, stakeholder);

        Ok(new_token)
    })?;

    ic_cdk::println!("Initialized demo governance for {:?} with {} tokens", caller, token.balance);
    Ok(format!("Initialized with {} governance tokens", token.balance))
}

/// Claim additional tokens (for demo purposes)
#[update]
#[candid_method(update)]
async fn claim_demo_tokens(amount: u64) -> StudiFiResult<GovernanceToken> {
    let caller = caller();

    if amount > 500 {
        return Err(StudiFiError::InvalidInput("Maximum 500 tokens per claim".to_string()));
    }

    let token = with_storage_mut(|storage| {
        match storage.get_token(&caller) {
            Some(mut existing_token) => {
                existing_token.balance += amount;
                existing_token.voting_power += amount;
                existing_token.last_updated = current_time();
                storage.update_token(caller, existing_token.clone());
                existing_token
            },
            None => {
                // Create new token if doesn't exist
                let new_token = GovernanceToken::new(caller, amount, TokenSource::CommunityParticipation);
                storage.insert_token(caller, new_token.clone());

                // Create stakeholder record
                let stakeholder = Stakeholder {
                    id: caller,
                    stakeholder_type: StakeholderType::Student,
                    tokens: new_token.clone(),
                    delegations_received: Vec::new(),
                    delegations_given: Vec::new(),
                    proposals_created: 0,
                    votes_cast: 0,
                    reputation_score: 50,
                    joined_at: current_time(),
                };
                storage.insert_stakeholder(caller, stakeholder);

                new_token
            }
        }
    });

    ic_cdk::println!("Claimed {} tokens for {:?}", amount, caller);
    Ok(token)
}

/// Create a demo proposal for testing
#[update]
#[candid_method(update)]
async fn create_demo_proposal() -> StudiFiResult<Proposal> {
    let caller = caller();

    // Check if caller has tokens
    let token = with_storage(|storage| storage.get_token(&caller))
        .ok_or_else(|| StudiFiError::Unauthorized("No tokens found".to_string()))?;

    if token.voting_power < 100 {
        return Err(StudiFiError::Unauthorized("Need at least 100 voting power".to_string()));
    }

    // Create a sample parameter change proposal
    let proposal_type = ProposalType::ParameterChange {
        parameter: "max_loan_amount".to_string(),
        current_value: "50000".to_string(),
        new_value: "75000".to_string(),
    };

    let proposal_id = with_storage_mut(|storage| storage.get_next_proposal_id());

    let mut proposal = Proposal::new(
        proposal_id.clone(),
        caller,
        "Increase Maximum Loan Amount".to_string(),
        "Proposal to increase the maximum loan amount from $50,000 to $75,000 to better serve graduate students and professional programs.".to_string(),
        proposal_type,
        7 * 24 * 60 * 60, // 7 days voting period
    );

    // Set quorum based on proposal type
    proposal.quorum_required = with_storage(|storage|
        storage.calculate_quorum_for_proposal(&proposal.proposal_type)
    );

    // Store proposal
    with_storage_mut(|storage| {
        storage.insert_proposal(proposal_id.clone(), proposal.clone());

        // Update stakeholder stats
        if let Some(mut stakeholder) = storage.get_stakeholder(&caller) {
            stakeholder.proposals_created += 1;
            storage.update_stakeholder(caller, stakeholder);
        }
    });

    ic_cdk::println!("Created demo proposal: {} by {:?}", proposal.id, caller);
    Ok(proposal)
}

candid::export_service!();

#[query(name = "__get_candid_interface_tmp_hack")]
fn export_candid() -> String {
    __export_service()
}
