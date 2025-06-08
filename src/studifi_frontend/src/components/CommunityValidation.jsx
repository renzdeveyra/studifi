import React, { useState, useEffect } from 'react';
import { credit_assessment_service } from 'declarations/credit_assessment_service';
import { dao_governance_service } from 'declarations/dao_governance_service';

const CommunityValidation = () => {
  const [activeValidations, setActiveValidations] = useState([]);
  const [myValidations, setMyValidations] = useState([]);
  const [validationStats, setValidationStats] = useState(null);
  const [myVotingPower, setMyVotingPower] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedValidation, setSelectedValidation] = useState(null);
  const [showVoteModal, setShowVoteModal] = useState(false);

  // Vote form state
  const [voteAdjustment, setVoteAdjustment] = useState(0);
  const [voteConfidence, setVoteConfidence] = useState(0.5);
  const [voteJustification, setVoteJustification] = useState('');

  useEffect(() => {
    loadValidationData();
  }, []);

  const loadValidationData = async () => {
    setLoading(true);
    try {
      const [activeResult, statsResult, votingPowerResult] = await Promise.all([
        credit_assessment_service.get_active_validations(),
        credit_assessment_service.get_validation_stats(),
        dao_governance_service.get_my_voting_power()
      ]);
      
      setActiveValidations(activeResult);
      setValidationStats(statsResult);
      setMyVotingPower(Number(votingPowerResult));
    } catch (error) {
      console.error('Error loading validation data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async () => {
    if (!selectedValidation) return;

    try {
      setLoading(true);
      const result = await credit_assessment_service.cast_community_vote(
        selectedValidation.id,
        voteAdjustment,
        voteConfidence,
        myVotingPower,
        voteJustification
      );

      if (result.Ok) {
        console.log('Vote cast successfully');
        setShowVoteModal(false);
        setSelectedValidation(null);
        resetVoteForm();
        loadValidationData(); // Refresh data
      } else {
        console.error('Vote failed:', result.Err);
      }
    } catch (error) {
      console.error('Error casting vote:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetVoteForm = () => {
    setVoteAdjustment(0);
    setVoteConfidence(0.5);
    setVoteJustification('');
  };

  const openVoteModal = (validation) => {
    setSelectedValidation(validation);
    setShowVoteModal(true);
    resetVoteForm();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(Number(amount) / 100);
  };

  const getEvidenceTypeColor = (evidenceType) => {
    const type = Object.keys(evidenceType)[0];
    switch (type) {
      case 'LocalKnowledge': return '#2563eb';
      case 'AcademicRecord': return '#059669';
      case 'FinancialCircumstance': return '#dc2626';
      case 'CharacterReference': return '#7c3aed';
      case 'WorkExperience': return '#ea580c';
      case 'CommunityInvolvement': return '#16a34a';
      default: return '#6b7280';
    }
  };

  const getImpactColor = (impact) => {
    const impactType = Object.keys(impact)[0];
    switch (impactType) {
      case 'StronglyPositive': return '#059669';
      case 'Positive': return '#16a34a';
      case 'SlightlyPositive': return '#65a30d';
      case 'Neutral': return '#6b7280';
      case 'SlightlyNegative': return '#ca8a04';
      case 'Negative': return '#dc2626';
      case 'StronglyNegative': return '#991b1b';
      default: return '#6b7280';
    }
  };

  if (loading && activeValidations.length === 0) {
    return (
      <div className="community-validation loading">
        <h2>Community Credit Validation</h2>
        <p>Loading validation requests...</p>
      </div>
    );
  }

  return (
    <div className="community-validation">
      <div className="validation-header">
        <h2>Community Credit Validation</h2>
        <p>Help validate credit scores through community knowledge and expertise</p>
        <div className="user-info">
          <span className="voting-power">Your Voting Power: {myVotingPower}</span>
          <button onClick={loadValidationData} className="refresh-btn">
            Refresh
          </button>
        </div>
      </div>

      {/* Validation Statistics */}
      {validationStats && (
        <div className="validation-stats">
          <div className="stat-card">
            <h4>Total Validations</h4>
            <p>{validationStats.total_validations}</p>
          </div>
          <div className="stat-card">
            <h4>Active Validations</h4>
            <p>{validationStats.active_validations}</p>
          </div>
          <div className="stat-card">
            <h4>Community Validators</h4>
            <p>{validationStats.unique_validators}</p>
          </div>
          <div className="stat-card">
            <h4>Average Adjustment</h4>
            <p>{validationStats.average_adjustment.toFixed(1)} pts</p>
          </div>
          <div className="stat-card">
            <h4>Consensus Score</h4>
            <p>{(validationStats.average_consensus_score * 100).toFixed(1)}%</p>
          </div>
        </div>
      )}

      {/* Active Validation Requests */}
      <div className="validations-section">
        <h3>Active Validation Requests</h3>
        {activeValidations.length > 0 ? (
          <div className="validations-list">
            {activeValidations.map((validation, index) => {
              const hasVoted = validation.votes.some(vote => vote.voter.toString() === 'current-user'); // TODO: Get actual user
              const totalVotes = validation.votes.length;
              const weightedAdjustment = totalVotes > 0 ? 
                validation.votes.reduce((sum, vote) => sum + (vote.adjustment_vote * vote.voting_power), 0) /
                validation.votes.reduce((sum, vote) => sum + vote.voting_power, 0) : 0;

              return (
                <div key={validation.id} className="validation-card">
                  <div className="validation-header">
                    <h4>Credit Score Validation</h4>
                    <span className="validation-id">ID: {validation.id}</span>
                  </div>

                  <div className="validation-details">
                    <div className="score-info">
                      <div className="score-item">
                        <label>Algorithm Score:</label>
                        <span className="score">{validation.algorithm_score}</span>
                      </div>
                      <div className="score-item">
                        <label>Proposed Adjustment:</label>
                        <span className={`adjustment ${validation.proposed_adjustment >= 0 ? 'positive' : 'negative'}`}>
                          {validation.proposed_adjustment >= 0 ? '+' : ''}{validation.proposed_adjustment}
                        </span>
                      </div>
                      <div className="score-item">
                        <label>Current Community Adjustment:</label>
                        <span className={`adjustment ${weightedAdjustment >= 0 ? 'positive' : 'negative'}`}>
                          {weightedAdjustment >= 0 ? '+' : ''}{weightedAdjustment.toFixed(1)}
                        </span>
                      </div>
                    </div>

                    <div className="justification">
                      <h5>Justification:</h5>
                      <p>{validation.justification}</p>
                    </div>

                    <div className="evidence">
                      <h5>Evidence ({validation.evidence.length} items):</h5>
                      <div className="evidence-list">
                        {validation.evidence.slice(0, 3).map((evidence, idx) => (
                          <div key={idx} className="evidence-item">
                            <span 
                              className="evidence-type"
                              style={{backgroundColor: getEvidenceTypeColor(evidence.evidence_type)}}
                            >
                              {Object.keys(evidence.evidence_type)[0]}
                            </span>
                            <span 
                              className="evidence-impact"
                              style={{color: getImpactColor(evidence.impact)}}
                            >
                              {Object.keys(evidence.impact)[0]}
                            </span>
                            <span className="evidence-desc">{evidence.description}</span>
                          </div>
                        ))}
                        {validation.evidence.length > 3 && (
                          <span className="evidence-more">+{validation.evidence.length - 3} more</span>
                        )}
                      </div>
                    </div>

                    <div className="voting-info">
                      <div className="vote-stats">
                        <span>Votes: {totalVotes}</span>
                        <span>Voting Power: {validation.votes.reduce((sum, vote) => sum + vote.voting_power, 0)}</span>
                        <span>Ends: {new Date(Number(validation.voting_ends_at) / 1000000).toLocaleDateString()}</span>
                      </div>

                      {myVotingPower > 0 && !hasVoted && (
                        <button 
                          className="vote-btn"
                          onClick={() => openVoteModal(validation)}
                          disabled={loading}
                        >
                          Cast Vote
                        </button>
                      )}

                      {hasVoted && (
                        <span className="voted-indicator">✓ You have voted</span>
                      )}

                      {myVotingPower === 0 && (
                        <span className="no-power-indicator">No voting power</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-state">
            <h4>No active validation requests</h4>
            <p>Check back later for new credit validation requests from the community.</p>
          </div>
        )}
      </div>

      {/* Vote Modal */}
      {showVoteModal && selectedValidation && (
        <div className="modal-overlay">
          <div className="vote-modal">
            <div className="modal-header">
              <h3>Cast Your Vote</h3>
              <button 
                className="close-btn"
                onClick={() => setShowVoteModal(false)}
              >
                ×
              </button>
            </div>

            <div className="modal-content">
              <div className="validation-summary">
                <p><strong>Algorithm Score:</strong> {selectedValidation.algorithm_score}</p>
                <p><strong>Proposed Adjustment:</strong> {selectedValidation.proposed_adjustment}</p>
                <p><strong>Your Voting Power:</strong> {myVotingPower}</p>
              </div>

              <div className="vote-form">
                <div className="form-group">
                  <label>Your Adjustment Vote (-200 to +200):</label>
                  <input
                    type="number"
                    min="-200"
                    max="200"
                    value={voteAdjustment}
                    onChange={(e) => setVoteAdjustment(parseInt(e.target.value) || 0)}
                  />
                </div>

                <div className="form-group">
                  <label>Confidence (0.0 to 1.0): {voteConfidence.toFixed(2)}</label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={voteConfidence}
                    onChange={(e) => setVoteConfidence(parseFloat(e.target.value))}
                  />
                </div>

                <div className="form-group">
                  <label>Justification (required):</label>
                  <textarea
                    value={voteJustification}
                    onChange={(e) => setVoteJustification(e.target.value)}
                    placeholder="Explain your reasoning for this adjustment..."
                    rows="4"
                    required
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button 
                  className="btn-secondary"
                  onClick={() => setShowVoteModal(false)}
                >
                  Cancel
                </button>
                <button 
                  className="btn-primary"
                  onClick={handleVote}
                  disabled={loading || !voteJustification.trim()}
                >
                  {loading ? 'Casting Vote...' : 'Cast Vote'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityValidation;
