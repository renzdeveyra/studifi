import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface Delegation {
  'delegate' : Principal,
  'created_at' : bigint,
  'delegator' : Principal,
  'expires_at' : [] | [bigint],
  'voting_power' : bigint,
}
export interface GovernanceStats {
  'total_tokens_locked' : bigint,
  'active_proposals' : number,
  'total_tokens_issued' : bigint,
  'total_votes_cast' : bigint,
  'rejected_proposals' : number,
  'total_token_holders' : number,
  'total_voting_power' : bigint,
  'passed_proposals' : number,
  'total_proposals' : number,
}
export interface GovernanceToken {
  'balance' : bigint,
  'last_updated' : bigint,
  'created_at' : bigint,
  'earned_from' : TokenSource,
  'locked_until' : [] | [bigint],
  'holder' : Principal,
  'voting_power' : bigint,
}
export interface Proposal {
  'id' : string,
  'quorum_required' : bigint,
  'execution_delay' : bigint,
  'status' : ProposalStatus,
  'title' : string,
  'updated_at' : bigint,
  'executed_at' : [] | [bigint],
  'votes_abstain' : bigint,
  'description' : string,
  'created_at' : bigint,
  'voting_ends_at' : bigint,
  'proposer' : Principal,
  'votes_for' : bigint,
  'total_voting_power' : bigint,
  'voting_starts_at' : bigint,
  'proposal_type' : ProposalType,
  'votes_against' : bigint,
}
export type ProposalStatus = { 'Passed' : null } |
  { 'Active' : null } |
  { 'Rejected' : null } |
  { 'Executed' : null } |
  { 'Cancelled' : null } |
  { 'Expired' : null };
export type ProposalType = {
    'ScholarshipCreation' : {
      'name' : string,
      'max_recipients' : number,
      'criteria' : ScholarshipCriteria,
      'amount' : bigint,
    }
  } |
  {
    'PlatformUpgrade' : {
      'version' : string,
      'canister' : string,
      'changes' : Array<string>,
    }
  } |
  {
    'TreasuryAllocation' : {
      'recipient' : [] | [Principal],
      'treasury_type' : TreasuryType,
      'amount' : bigint,
      'purpose' : string,
    }
  } |
  {
    'ParameterChange' : {
      'parameter' : string,
      'new_value' : string,
      'current_value' : string,
    }
  } |
  {
    'CreditScoreAdjustment' : {
      'justification' : string,
      'current_score' : number,
      'student_id' : Principal,
      'proposed_score' : number,
    }
  } |
  { 'Emergency' : { 'justification' : string, 'action' : string } };
export interface ScholarshipCriteria {
  'geographic_restrictions' : Array<string>,
  'min_gpa' : number,
  'required_programs' : Array<string>,
  'other_requirements' : Array<string>,
  'max_recipients' : number,
}
export interface Stakeholder {
  'id' : Principal,
  'delegations_received' : Array<Delegation>,
  'votes_cast' : number,
  'proposals_created' : number,
  'tokens' : GovernanceToken,
  'joined_at' : bigint,
  'stakeholder_type' : StakeholderType,
  'delegations_given' : Array<Delegation>,
  'reputation_score' : number,
}
export type StakeholderType = { 'University' : null } |
  { 'Donor' : null } |
  { 'Student' : null } |
  { 'Validator' : null } |
  { 'TeamMember' : null } |
  { 'CommunityMember' : null };
export interface Statistics {
  'total_amount' : bigint,
  'completed_count' : number,
  'active_count' : number,
  'average_amount' : bigint,
  'total_count' : number,
  'failed_count' : number,
}
export type StudiFiError = { 'InvalidInput' : string } |
  { 'NetworkError' : string } |
  { 'NotFound' : string } |
  { 'Unauthorized' : string } |
  { 'AlreadyExists' : string } |
  { 'InternalError' : string } |
  { 'Expired' : string } |
  { 'InsufficientFunds' : string };
export type StudiFiResult = { 'Ok' : string } |
  { 'Err' : StudiFiError };
export type StudiFiResultDelegation = { 'Ok' : Delegation } |
  { 'Err' : StudiFiError };
export type StudiFiResultProposal = { 'Ok' : Proposal } |
  { 'Err' : StudiFiError };
export type StudiFiResultToken = { 'Ok' : GovernanceToken } |
  { 'Err' : StudiFiError };
export type StudiFiResultVote = { 'Ok' : Vote } |
  { 'Err' : StudiFiError };
export type TokenSource = { 'Delegation' : null } |
  { 'InitialDistribution' : null } |
  { 'ScholarshipDonation' : null } |
  { 'LoanOrigination' : null } |
  { 'LoanRepayment' : null } |
  { 'CommunityParticipation' : null } |
  { 'Staking' : null };
export type TreasuryType = { 'Loan' : null } |
  { 'Protocol' : null } |
  { 'Scholarship' : null };
export interface Vote {
  'voter' : Principal,
  'vote_type' : VoteType,
  'cast_at' : bigint,
  'proposal_id' : string,
  'delegated_from' : [] | [Principal],
  'voting_power' : bigint,
}
export type VoteType = { 'For' : null } |
  { 'Abstain' : null } |
  { 'Against' : null };
export interface _SERVICE {
  'claim_demo_tokens' : ActorMethod<[bigint], StudiFiResultToken>,
  'create_demo_proposal' : ActorMethod<[], StudiFiResultProposal>,
  'create_proposal' : ActorMethod<
    [string, string, ProposalType, [] | [bigint]],
    StudiFiResultProposal
  >,
  'delegate_voting_power' : ActorMethod<
    [Principal, [] | [bigint]],
    StudiFiResultDelegation
  >,
  'execute_proposal' : ActorMethod<[string], StudiFiResult>,
  'get_active_proposals' : ActorMethod<[], Array<Proposal>>,
  'get_all_proposals' : ActorMethod<[], Array<Proposal>>,
  'get_delegations_to_me' : ActorMethod<[], Array<Delegation>>,
  'get_effective_voting_power' : ActorMethod<[Principal], bigint>,
  'get_governance_stats' : ActorMethod<[], GovernanceStats>,
  'get_my_delegations' : ActorMethod<[], Array<Delegation>>,
  'get_my_stakeholder_info' : ActorMethod<[], [] | [Stakeholder]>,
  'get_my_tokens' : ActorMethod<[], [] | [GovernanceToken]>,
  'get_my_voting_history' : ActorMethod<[], Array<Vote>>,
  'get_my_voting_power' : ActorMethod<[], bigint>,
  'get_platform_stats' : ActorMethod<[], Statistics>,
  'get_proposal' : ActorMethod<[string], [] | [Proposal]>,
  'get_proposal_votes' : ActorMethod<[string], Array<Vote>>,
  'get_proposals_by_status' : ActorMethod<[ProposalStatus], Array<Proposal>>,
  'get_stakeholder' : ActorMethod<[Principal], [] | [Stakeholder]>,
  'get_stakeholders_by_type' : ActorMethod<
    [StakeholderType],
    Array<Stakeholder>
  >,
  'get_tokens' : ActorMethod<[Principal], [] | [GovernanceToken]>,
  'initialize_demo_governance' : ActorMethod<[], StudiFiResult>,
  'issue_tokens' : ActorMethod<
    [Principal, bigint, TokenSource, StakeholderType],
    StudiFiResultToken
  >,
  'lock_tokens' : ActorMethod<[bigint], StudiFiResultToken>,
  'process_proposal' : ActorMethod<[string], StudiFiResultProposal>,
  'remove_delegation' : ActorMethod<[Principal], StudiFiResult>,
  'vote_on_proposal' : ActorMethod<[string, VoteType], StudiFiResultVote>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
