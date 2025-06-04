import React, { useState, useEffect } from 'react';
import { governance_engine } from 'declarations/governance_engine';

const GovernancePage = () => {
  const [proposals, setProposals] = useState([]);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    loadGovernanceData();
  }, []);

  const loadGovernanceData = async () => {
    try {
      const [proposalsResult, statsResult] = await Promise.all([
        governance_engine.getAllActiveProposals(),
        governance_engine.getGovernanceStats()
      ]);
      setProposals(proposalsResult);
      setStats(statsResult);
    } catch (error) {
      console.error('Error loading governance data:', error);
    }
  };

  return (
    <div className="governance-page">
      <div className="page-header">
        <h2>Community Governance</h2>
        <p>Participate in StudiFi's decentralized decision-making</p>
      </div>

      {stats && (
        <div className="governance-stats">
          <div className="stat-card">
            <h3>{stats.totalProposals}</h3>
            <p>Total Proposals</p>
          </div>
          <div className="stat-card">
            <h3>{stats.activeProposals}</h3>
            <p>Active Proposals</p>
          </div>
          <div className="stat-card">
            <h3>{stats.passedProposals}</h3>
            <p>Passed Proposals</p>
          </div>
          <div className="stat-card">
            <h3>{stats.totalVotes}</h3>
            <p>Total Votes Cast</p>
          </div>
        </div>
      )}

      <div className="proposals-section">
        <h3>Active Proposals</h3>
        {proposals.length > 0 ? (
          <div className="proposals-list">
            {proposals.map((proposal, index) => (
              <div key={index} className="proposal-card">
                <h4>{proposal.title}</h4>
                <p className="proposal-type">{Object.keys(proposal.proposalType)[0]}</p>
                <p className="description">{proposal.description}</p>
                <div className="voting-info">
                  <div className="votes">
                    <span className="votes-for">For: {proposal.votesFor}</span>
                    <span className="votes-against">Against: {proposal.votesAgainst}</span>
                  </div>
                  <div className="voting-actions">
                    <button className="btn-vote-for">Vote For</button>
                    <button className="btn-vote-against">Vote Against</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <h4>No active proposals</h4>
            <p>Check back later for new governance proposals</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GovernancePage;