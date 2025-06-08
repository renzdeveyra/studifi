export const idlFactory = ({ IDL }) => {
  const TokenSource = IDL.Variant({
    'Delegation' : IDL.Null,
    'InitialDistribution' : IDL.Null,
    'ScholarshipDonation' : IDL.Null,
    'LoanOrigination' : IDL.Null,
    'LoanRepayment' : IDL.Null,
    'CommunityParticipation' : IDL.Null,
    'Staking' : IDL.Null,
  });
  const GovernanceToken = IDL.Record({
    'balance' : IDL.Nat64,
    'last_updated' : IDL.Nat64,
    'created_at' : IDL.Nat64,
    'earned_from' : TokenSource,
    'locked_until' : IDL.Opt(IDL.Nat64),
    'holder' : IDL.Principal,
    'voting_power' : IDL.Nat64,
  });
  const StudiFiError = IDL.Variant({
    'InvalidInput' : IDL.Text,
    'NetworkError' : IDL.Text,
    'NotFound' : IDL.Text,
    'Unauthorized' : IDL.Text,
    'AlreadyExists' : IDL.Text,
    'InternalError' : IDL.Text,
    'Expired' : IDL.Text,
    'InsufficientFunds' : IDL.Text,
  });
  const StudiFiResultToken = IDL.Variant({
    'Ok' : GovernanceToken,
    'Err' : StudiFiError,
  });
  const ProposalStatus = IDL.Variant({
    'Passed' : IDL.Null,
    'Active' : IDL.Null,
    'Rejected' : IDL.Null,
    'Executed' : IDL.Null,
    'Cancelled' : IDL.Null,
    'Expired' : IDL.Null,
  });
  const ScholarshipCriteria = IDL.Record({
    'geographic_restrictions' : IDL.Vec(IDL.Text),
    'min_gpa' : IDL.Float64,
    'required_programs' : IDL.Vec(IDL.Text),
    'other_requirements' : IDL.Vec(IDL.Text),
    'max_recipients' : IDL.Nat32,
  });
  const TreasuryType = IDL.Variant({
    'Loan' : IDL.Null,
    'Protocol' : IDL.Null,
    'Scholarship' : IDL.Null,
  });
  const ProposalType = IDL.Variant({
    'ScholarshipCreation' : IDL.Record({
      'name' : IDL.Text,
      'max_recipients' : IDL.Nat32,
      'criteria' : ScholarshipCriteria,
      'amount' : IDL.Nat64,
    }),
    'PlatformUpgrade' : IDL.Record({
      'version' : IDL.Text,
      'canister' : IDL.Text,
      'changes' : IDL.Vec(IDL.Text),
    }),
    'TreasuryAllocation' : IDL.Record({
      'recipient' : IDL.Opt(IDL.Principal),
      'treasury_type' : TreasuryType,
      'amount' : IDL.Nat64,
      'purpose' : IDL.Text,
    }),
    'ParameterChange' : IDL.Record({
      'parameter' : IDL.Text,
      'new_value' : IDL.Text,
      'current_value' : IDL.Text,
    }),
    'CreditScoreAdjustment' : IDL.Record({
      'justification' : IDL.Text,
      'current_score' : IDL.Nat32,
      'student_id' : IDL.Principal,
      'proposed_score' : IDL.Nat32,
    }),
    'Emergency' : IDL.Record({
      'justification' : IDL.Text,
      'action' : IDL.Text,
    }),
  });
  const Proposal = IDL.Record({
    'id' : IDL.Text,
    'quorum_required' : IDL.Nat64,
    'execution_delay' : IDL.Nat64,
    'status' : ProposalStatus,
    'title' : IDL.Text,
    'updated_at' : IDL.Nat64,
    'executed_at' : IDL.Opt(IDL.Nat64),
    'votes_abstain' : IDL.Nat64,
    'description' : IDL.Text,
    'created_at' : IDL.Nat64,
    'voting_ends_at' : IDL.Nat64,
    'proposer' : IDL.Principal,
    'votes_for' : IDL.Nat64,
    'total_voting_power' : IDL.Nat64,
    'voting_starts_at' : IDL.Nat64,
    'proposal_type' : ProposalType,
    'votes_against' : IDL.Nat64,
  });
  const StudiFiResultProposal = IDL.Variant({
    'Ok' : Proposal,
    'Err' : StudiFiError,
  });
  const Delegation = IDL.Record({
    'delegate' : IDL.Principal,
    'created_at' : IDL.Nat64,
    'delegator' : IDL.Principal,
    'expires_at' : IDL.Opt(IDL.Nat64),
    'voting_power' : IDL.Nat64,
  });
  const StudiFiResultDelegation = IDL.Variant({
    'Ok' : Delegation,
    'Err' : StudiFiError,
  });
  const StudiFiResult = IDL.Variant({ 'Ok' : IDL.Text, 'Err' : StudiFiError });
  const GovernanceStats = IDL.Record({
    'total_tokens_locked' : IDL.Nat64,
    'active_proposals' : IDL.Nat32,
    'total_tokens_issued' : IDL.Nat64,
    'total_votes_cast' : IDL.Nat64,
    'rejected_proposals' : IDL.Nat32,
    'total_token_holders' : IDL.Nat32,
    'total_voting_power' : IDL.Nat64,
    'passed_proposals' : IDL.Nat32,
    'total_proposals' : IDL.Nat32,
  });
  const StakeholderType = IDL.Variant({
    'University' : IDL.Null,
    'Donor' : IDL.Null,
    'Student' : IDL.Null,
    'Validator' : IDL.Null,
    'TeamMember' : IDL.Null,
    'CommunityMember' : IDL.Null,
  });
  const Stakeholder = IDL.Record({
    'id' : IDL.Principal,
    'delegations_received' : IDL.Vec(Delegation),
    'votes_cast' : IDL.Nat32,
    'proposals_created' : IDL.Nat32,
    'tokens' : GovernanceToken,
    'joined_at' : IDL.Nat64,
    'stakeholder_type' : StakeholderType,
    'delegations_given' : IDL.Vec(Delegation),
    'reputation_score' : IDL.Nat32,
  });
  const VoteType = IDL.Variant({
    'For' : IDL.Null,
    'Abstain' : IDL.Null,
    'Against' : IDL.Null,
  });
  const Vote = IDL.Record({
    'voter' : IDL.Principal,
    'vote_type' : VoteType,
    'cast_at' : IDL.Nat64,
    'proposal_id' : IDL.Text,
    'delegated_from' : IDL.Opt(IDL.Principal),
    'voting_power' : IDL.Nat64,
  });
  const Statistics = IDL.Record({
    'total_amount' : IDL.Nat64,
    'completed_count' : IDL.Nat32,
    'active_count' : IDL.Nat32,
    'average_amount' : IDL.Nat64,
    'total_count' : IDL.Nat32,
    'failed_count' : IDL.Nat32,
  });
  const StudiFiResultVote = IDL.Variant({ 'Ok' : Vote, 'Err' : StudiFiError });
  return IDL.Service({
    'claim_demo_tokens' : IDL.Func([IDL.Nat64], [StudiFiResultToken], []),
    'create_demo_proposal' : IDL.Func([], [StudiFiResultProposal], []),
    'create_proposal' : IDL.Func(
        [IDL.Text, IDL.Text, ProposalType, IDL.Opt(IDL.Nat64)],
        [StudiFiResultProposal],
        [],
      ),
    'delegate_voting_power' : IDL.Func(
        [IDL.Principal, IDL.Opt(IDL.Nat64)],
        [StudiFiResultDelegation],
        [],
      ),
    'execute_proposal' : IDL.Func([IDL.Text], [StudiFiResult], []),
    'get_active_proposals' : IDL.Func([], [IDL.Vec(Proposal)], ['query']),
    'get_all_proposals' : IDL.Func([], [IDL.Vec(Proposal)], ['query']),
    'get_delegations_to_me' : IDL.Func([], [IDL.Vec(Delegation)], ['query']),
    'get_effective_voting_power' : IDL.Func(
        [IDL.Principal],
        [IDL.Nat64],
        ['query'],
      ),
    'get_governance_stats' : IDL.Func([], [GovernanceStats], ['query']),
    'get_my_delegations' : IDL.Func([], [IDL.Vec(Delegation)], ['query']),
    'get_my_stakeholder_info' : IDL.Func([], [IDL.Opt(Stakeholder)], ['query']),
    'get_my_tokens' : IDL.Func([], [IDL.Opt(GovernanceToken)], ['query']),
    'get_my_voting_history' : IDL.Func([], [IDL.Vec(Vote)], ['query']),
    'get_my_voting_power' : IDL.Func([], [IDL.Nat64], ['query']),
    'get_platform_stats' : IDL.Func([], [Statistics], ['query']),
    'get_proposal' : IDL.Func([IDL.Text], [IDL.Opt(Proposal)], ['query']),
    'get_proposal_votes' : IDL.Func([IDL.Text], [IDL.Vec(Vote)], ['query']),
    'get_proposals_by_status' : IDL.Func(
        [ProposalStatus],
        [IDL.Vec(Proposal)],
        ['query'],
      ),
    'get_stakeholder' : IDL.Func(
        [IDL.Principal],
        [IDL.Opt(Stakeholder)],
        ['query'],
      ),
    'get_stakeholders_by_type' : IDL.Func(
        [StakeholderType],
        [IDL.Vec(Stakeholder)],
        ['query'],
      ),
    'get_tokens' : IDL.Func(
        [IDL.Principal],
        [IDL.Opt(GovernanceToken)],
        ['query'],
      ),
    'initialize_demo_governance' : IDL.Func([], [StudiFiResult], []),
    'issue_tokens' : IDL.Func(
        [IDL.Principal, IDL.Nat64, TokenSource, StakeholderType],
        [StudiFiResultToken],
        [],
      ),
    'lock_tokens' : IDL.Func([IDL.Nat64], [StudiFiResultToken], []),
    'process_proposal' : IDL.Func([IDL.Text], [StudiFiResultProposal], []),
    'remove_delegation' : IDL.Func([IDL.Principal], [StudiFiResult], []),
    'vote_on_proposal' : IDL.Func(
        [IDL.Text, VoteType],
        [StudiFiResultVote],
        [],
      ),
  });
};
export const init = ({ IDL }) => { return []; };
