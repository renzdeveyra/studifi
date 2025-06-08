import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const TreasuryDashboard = () => {
  const [treasuries, setTreasuries] = useState([]);
  const [multiTreasuryHealth, setMultiTreasuryHealth] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedTreasury, setSelectedTreasury] = useState('Loan');
  const [error, setError] = useState(null);

  const { isAuthenticated, actors } = useAuth();

  useEffect(() => {
    if (isAuthenticated && actors.loanManagement) {
      loadTreasuryData();
    }
  }, [isAuthenticated, actors.loanManagement]);

  const loadTreasuryData = async () => {
    if (!actors.loanManagement) {
      setError('Loan management service not available');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const [treasuriesResult, healthResult] = await Promise.all([
        actors.loanManagement.get_all_separate_treasuries(),
        actors.loanManagement.get_multi_treasury_health()
      ]);

      setTreasuries(treasuriesResult || []);
      if (healthResult?.Ok) {
        setMultiTreasuryHealth(healthResult.Ok);
      }
    } catch (error) {
      console.error('Error loading treasury data:', error);
      setError('Failed to load treasury data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(Number(amount) / 100);
  };

  const formatPercentage = (ratio) => {
    return (Number(ratio) * 100).toFixed(1) + '%';
  };

  const getTreasuryTypeColor = (treasuryType) => {
    switch (treasuryType) {
      case 'Loan': return '#2563eb';
      case 'Scholarship': return '#dc2626';
      case 'Protocol': return '#059669';
      default: return '#6b7280';
    }
  };

  const getHealthStatusColor = (status) => {
    switch (status) {
      case 'Excellent': return '#059669';
      case 'Good': return '#16a34a';
      case 'Fair': return '#ca8a04';
      case 'Poor': return '#dc2626';
      case 'Critical': return '#991b1b';
      default: return '#6b7280';
    }
  };

  if (loading) {
    return (
      <div className="treasury-dashboard loading">
        <h2>Treasury Dashboard</h2>
        <p>Loading treasury data...</p>
      </div>
    );
  }

  return (
    <div className="treasury-dashboard">
      <div className="dashboard-header">
        <h2>Multi-Treasury Dashboard</h2>
        <p>Separate treasury management for loans, scholarships, and protocol operations</p>
        <button onClick={loadTreasuryData} className="refresh-btn">
          Refresh Data
        </button>
      </div>

      {/* Overall Health Summary */}
      {multiTreasuryHealth && (
        <div className="overall-health">
          <h3>Platform Treasury Health</h3>
          <div className="health-summary">
            <div className="health-metric">
              <h4>Total Platform Funds</h4>
              <p className="amount">{formatCurrency(multiTreasuryHealth.total_platform_funds)}</p>
            </div>
            <div className="health-metric">
              <h4>Overall Health Score</h4>
              <p className="score">{(Number(multiTreasuryHealth.overall_health_score) * 100).toFixed(1)}%</p>
            </div>
          </div>
          
          {multiTreasuryHealth.cross_treasury_recommendations.length > 0 && (
            <div className="recommendations">
              <h4>Cross-Treasury Recommendations</h4>
              <ul>
                {multiTreasuryHealth.cross_treasury_recommendations.map((rec, index) => (
                  <li key={index}>{rec}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Individual Treasury Cards */}
      <div className="treasuries-grid">
        {treasuries.map((treasury, index) => {
          const treasuryType = Object.keys(treasury.treasury_type)[0];
          const utilizationRate = treasury.total_funds > 0 
            ? (Number(treasury.reserved_funds) / Number(treasury.total_funds)) 
            : 0;
          const reserveRatio = treasury.total_funds > 0 
            ? (Number(treasury.available_funds) / Number(treasury.total_funds)) 
            : 0;

          return (
            <div key={index} className="treasury-card" style={{borderLeftColor: getTreasuryTypeColor(treasuryType)}}>
              <div className="treasury-header">
                <h3>{treasuryType} Treasury</h3>
                <span className={`governance-badge ${treasury.governance_required ? 'required' : 'not-required'}`}>
                  {treasury.governance_required ? 'Governance Required' : 'Automated'}
                </span>
              </div>

              <div className="treasury-metrics">
                <div className="metric">
                  <label>Total Funds</label>
                  <span className="value">{formatCurrency(treasury.total_funds)}</span>
                </div>
                <div className="metric">
                  <label>Available</label>
                  <span className="value">{formatCurrency(treasury.available_funds)}</span>
                </div>
                <div className="metric">
                  <label>Reserved</label>
                  <span className="value">{formatCurrency(treasury.reserved_funds)}</span>
                </div>
                <div className="metric">
                  <label>Utilization Rate</label>
                  <span className="value">{formatPercentage(utilizationRate)}</span>
                </div>
                <div className="metric">
                  <label>Reserve Ratio</label>
                  <span className="value">{formatPercentage(reserveRatio)}</span>
                </div>
                <div className="metric">
                  <label>Min Reserve Required</label>
                  <span className="value">{formatPercentage(treasury.minimum_reserve_ratio)}</span>
                </div>
              </div>

              <div className="treasury-bars">
                <div className="bar-container">
                  <label>Fund Allocation</label>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill available" 
                      style={{width: `${reserveRatio * 100}%`}}
                    ></div>
                    <div 
                      className="progress-fill reserved" 
                      style={{width: `${utilizationRate * 100}%`}}
                    ></div>
                  </div>
                  <div className="bar-legend">
                    <span className="legend-item available">Available</span>
                    <span className="legend-item reserved">Reserved</span>
                  </div>
                </div>
              </div>

              <div className="treasury-actions">
                <button 
                  className="btn-secondary"
                  onClick={() => setSelectedTreasury(treasuryType)}
                >
                  Manage {treasuryType}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Treasury Health Details */}
      {multiTreasuryHealth && (
        <div className="treasury-health-details">
          <h3>Individual Treasury Health</h3>
          <div className="health-grid">
            {[
              { name: 'Loan', health: multiTreasuryHealth.loan_treasury },
              { name: 'Scholarship', health: multiTreasuryHealth.scholarship_treasury },
              { name: 'Protocol', health: multiTreasuryHealth.protocol_treasury }
            ].map(({ name, health }) => (
              <div key={name} className="health-card">
                <h4>{name} Treasury Health</h4>
                <div className="health-score">
                  <span 
                    className="score-value"
                    style={{color: getHealthStatusColor(Object.keys(health.health_status)[0])}}
                  >
                    {(Number(health.health_score) * 100).toFixed(1)}%
                  </span>
                  <span className="status">{Object.keys(health.health_status)[0]}</span>
                </div>
                
                <div className="health-metrics">
                  <div className="metric-row">
                    <span>Reserve Ratio:</span>
                    <span>{formatPercentage(health.reserve_ratio)}</span>
                  </div>
                  <div className="metric-row">
                    <span>Utilization:</span>
                    <span>{formatPercentage(health.utilization_rate)}</span>
                  </div>
                  <div className="metric-row">
                    <span>Default Rate:</span>
                    <span>{formatPercentage(health.default_rate)}</span>
                  </div>
                </div>

                {health.recommendations.length > 0 && (
                  <div className="health-recommendations">
                    <h5>Recommendations:</h5>
                    <ul>
                      {health.recommendations.slice(0, 2).map((rec, index) => (
                        <li key={index}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TreasuryDashboard;
