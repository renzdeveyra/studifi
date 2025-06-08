import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const GovernancePage = () => {
  const [proposals, setProposals] = useState([]);
  const [stats, setStats] = useState(null);
  const [myTokens, setMyTokens] = useState(null);
  const [myVotingPower, setMyVotingPower] = useState(0);
  const [showCreateProposal, setShowCreateProposal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { isAuthenticated, actors } = useAuth();

  useEffect(() => {
    if (isAuthenticated && actors.daoGovernance) {
      loadGovernanceData();
    }
  }, [isAuthenticated, actors.daoGovernance]);

  const loadGovernanceData = async () => {
    if (!actors.daoGovernance) {
      setError('DAO governance service not available');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const [proposalsResult, statsResult, tokensResult, votingPowerResult] = await Promise.all([
        actors.daoGovernance.get_active_proposals(),
        actors.daoGovernance.get_governance_stats(),
        actors.daoGovernance.get_my_tokens(),
        actors.daoGovernance.get_my_voting_power()
      ]);

      setProposals(proposalsResult || []);
      setStats(statsResult);
      setMyTokens(tokensResult?.[0] || null); // Handle Option type
      setMyVotingPower(Number(votingPowerResult || 0));
    } catch (error) {
      console.error('Error loading governance data:', error);
      setError('Failed to load governance data');
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (proposalId, voteType) => {
    if (!actors.daoGovernance) {
      setError('DAO governance service not available');
      return;
    }

    try {
      const result = await actors.daoGovernance.vote_on_proposal(proposalId, { [voteType]: null });
      if (result?.Ok) {
        console.log('Vote cast successfully');
        loadGovernanceData(); // Refresh data
      } else {
        console.error('Vote failed:', result?.Err);
        setError('Failed to cast vote: ' + JSON.stringify(result?.Err));
      }
    } catch (error) {
      console.error('Error casting vote:', error);
      setError('Error casting vote');
    }
  };

  const handleInitializeDemo = async () => {
    if (!actors.daoGovernance) {
      setError('DAO governance service not available');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const result = await actors.daoGovernance.initialize_demo_governance();
      if (result?.Ok) {
        console.log('Demo governance initialized');
        loadGovernanceData(); // Refresh data
      } else {
        console.error('Initialization failed:', result?.Err);
        setError('Failed to initialize demo governance');
      }
    } catch (error) {
      console.error('Error initializing demo:', error);
      setError('Error initializing demo governance');
    } finally {
      setLoading(false);
    }
  };

  const handleClaimTokens = async () => {
    setLoading(true);
    try {
      const result = await dao_governance_service.claim_demo_tokens(BigInt(250));
      if (result.Ok) {
        console.log('Tokens claimed successfully');
        loadGovernanceData(); // Refresh data
      } else {
        console.error('Token claim failed:', result.Err);
      }
    } catch (error) {
      console.error('Error claiming tokens:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDemoProposal = async () => {
    setLoading(true);
    try {
      const result = await dao_governance_service.create_demo_proposal();
      if (result.Ok) {
        console.log('Demo proposal created');
        loadGovernanceData(); // Refresh data
      } else {
        console.error('Proposal creation failed:', result.Err);
      }
    } catch (error) {
      console.error('Error creating demo proposal:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="governance-page">
      <div className="page-header">
        <div className="header-content">
          <h2>Community Governance</h2>
          <p>Participate in StudiFi's decentralized decision-making</p>
        </div>
        <div className="header-actions">
          {!myTokens ? (
            <button
              className="btn-primary"
              onClick={handleInitializeDemo}
              disabled={loading}
            >
              Get Started (Demo)
            </button>
          ) : (
            <>
              <button
                className="btn-secondary"
                onClick={handleClaimTokens}
                disabled={loading}
              >
                Claim More Tokens
              </button>
              <button
                className="btn-primary"
                onClick={() => setShowCreateProposal(!showCreateProposal)}
                disabled={myVotingPower < 100}
              >
                {showCreateProposal ? 'Cancel' : 'Create Proposal'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* User's Governance Info */}
      <div className="user-governance-info">
        <div className="info-card">
          <h4>My Governance Tokens</h4>
          <p>{myTokens ? Number(myTokens.balance) : 0}</p>
        </div>
        <div className="info-card">
          <h4>My Voting Power</h4>
          <p>{myVotingPower}</p>
        </div>
        <div className="info-card">
          <h4>Lock Status</h4>
          <p>{myTokens?.locked_until ? 'Locked' : 'Unlocked'}</p>
        </div>
      </div>

      {stats && (
        <div className="governance-stats">
          <div className="stat-card">
            <h3>{stats.total_proposals}</h3>
            <p>Total Proposals</p>
          </div>
          <div className="stat-card">
            <h3>{stats.active_proposals}</h3>
            <p>Active Proposals</p>
          </div>
          <div className="stat-card">
            <h3>{stats.passed_proposals}</h3>
            <p>Passed Proposals</p>
          </div>
          <div className="stat-card">
            <h3>{Number(stats.total_votes_cast)}</h3>
            <p>Total Votes Cast</p>
          </div>
          <div className="stat-card">
            <h3>{stats.total_token_holders}</h3>
            <p>Token Holders</p>
          </div>
          <div className="stat-card">
            <h3>{Number(stats.total_voting_power)}</h3>
            <p>Total Voting Power</p>
          </div>
        </div>
      )}

      {/* Create Proposal Form */}
      {showCreateProposal && (
        <div className="create-proposal-form">
          <h3>Create New Proposal</h3>
          <p>For demo purposes, you can create a sample proposal:</p>
          <button
            className="btn-primary"
            onClick={handleCreateDemoProposal}
            disabled={loading || myVotingPower < 100}
          >
            Create Demo Proposal
          </button>
          <p className="note">Minimum 100 voting power required to create proposals</p>
        </div>
      )}

      <div className="proposals-section">
        <h3>Active Proposals</h3>
        {loading ? (
          <div className="loading">Loading proposals...</div>
        ) : proposals.length > 0 ? (
          <div className="proposals-list">
            {proposals.map((proposal, index) => {
              const proposalType = Object.keys(proposal.proposal_type)[0];
              const totalVotes = Number(proposal.votes_for) + Number(proposal.votes_against) + Number(proposal.votes_abstain);
              const forPercentage = totalVotes > 0 ? (Number(proposal.votes_for) / totalVotes * 100).toFixed(1) : 0;
              const againstPercentage = totalVotes > 0 ? (Number(proposal.votes_against) / totalVotes * 100).toFixed(1) : 0;

              return (
                <div key={proposal.id} className="proposal-card">
                  <div className="proposal-header">
                    <h4>{proposal.title}</h4>
                    <span className="proposal-type">{proposalType}</span>
                    <span className="proposal-status">{Object.keys(proposal.status)[0]}</span>
                  </div>
                  <p className="description">{proposal.description}</p>

                  <div className="voting-info">
                    <div className="vote-breakdown">
                      <div className="vote-bar">
                        <div className="vote-for" style={{width: `${forPercentage}%`}}></div>
                        <div className="vote-against" style={{width: `${againstPercentage}%`}}></div>
                      </div>
                      <div className="vote-stats">
                        <span className="votes-for">For: {Number(proposal.votes_for)} ({forPercentage}%)</span>
                        <span className="votes-against">Against: {Number(proposal.votes_against)} ({againstPercentage}%)</span>
                        <span className="votes-abstain">Abstain: {Number(proposal.votes_abstain)}</span>
                      </div>
                    </div>

                    <div className="proposal-details">
                      <p>Quorum Required: {Number(proposal.quorum_required)}</p>
                      <p>Voting Ends: {new Date(Number(proposal.voting_ends_at) / 1000000).toLocaleDateString()}</p>
                    </div>

                    {myVotingPower > 0 && (
                      <div className="voting-actions">
                        <button
                          className="btn-vote-for"
                          onClick={() => handleVote(proposal.id, 'For')}
                          disabled={loading}
                        >
                          Vote For
                        </button>
                        <button
                          className="btn-vote-against"
                          onClick={() => handleVote(proposal.id, 'Against')}
                          disabled={loading}
                        >
                          Vote Against
                        </button>
                        <button
                          className="btn-vote-abstain"
                          onClick={() => handleVote(proposal.id, 'Abstain')}
                          disabled={loading}
                        >
                          Abstain
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-state">
            <h4>No active proposals</h4>
            <p>Be the first to create a governance proposal!</p>
            {!myTokens && (
              <p className="note">You need governance tokens to participate in voting.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default GovernancePage;