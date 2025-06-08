import React, { useState, useEffect } from 'react';
import './ScholarshipDashboard.scss'; // Import the SCSS file

const ScholarshipDashboard = () => {
  useEffect(() => {
    console.log('ScholarshipDashboard mounted successfully');
  }, []);
  const [activeTab, setActiveTab] = useState('browse');

  const scholarshipData = [
    {
      id: 1,
      name: "Sarah Chen - Computer Science PhD",
      university: "Stanford University • Thesis Research Funding",
      amount: "$12,000 USDC",
      description: "Funding for AI research thesis on quantum machine learning applications. This research aims to bridge quantum computing and machine learning to develop novel algorithms for optimization problems.",
      status: "Voting Progress",
      timeLeft: "Ends in 3 days",
      votes: {
        for: { percentage: 65, count: 2540 },
        against: { percentage: 23, count: 890 },
        abstain: { percentage: 12, count: 460 }
      },
      quorum: "16% Achieved",
      tags: ["Tutored", "Active"]
    },
    {
      id: 2,
      name: "Marcus Johnson - Medical School",
      university: "Harvard Medical • Clinical Research Support",
      amount: "$8,500 USDC",
      description: "Support for clinical research on pediatric cardiology procedures. Research focuses on minimally invasive techniques for congenital heart defect repairs.",
      status: "Voting Progress",
      timeLeft: "Ends in 5 days",
      votes: {
        for: { percentage: 34, count: 1070 },
        against: { percentage: 32, count: 1120 },
        abstain: { percentage: 34, count: 890 }
      },
      quorum: "16% (Not yet achieved)",
      tags: ["Research", "Needs Review"]
    },
    {
      id: 3,
      name: "Elena Rodriguez - Environmental Engineering",
      university: "MIT • Sustainable Technology Research",
      amount: "$15,000 USDC",
      description: "Development of biodegradable plastic alternatives using marine algae. Project aims to create commercially viable eco-friendly packaging solutions.",
      status: "Voting Progress",
      timeLeft: "Ends in 1 day",
      votes: {
        for: { percentage: 82, count: 3100 },
        against: { percentage: 12, count: 460 },
        abstain: { percentage: 6, count: 240 }
      },
      quorum: "18% Achieved",
      tags: ["Sustainability", "Active"]
    }
  ];

  const stats = [
    { label: "Active Scholarship Tokens", value: "2,450 SCH", icon: "🎓", trend: "↗", color: "#7fff00" },
    { label: "My Voting Power", value: "3.2%", icon: "🗳️", trend: "↗", color: "#00ff88" },
    { label: "Total Proposals", value: "147", icon: "📄", trend: "↗", color: "#ffd700" },
    { label: "Funded Scholarships", value: "89", icon: "✅", trend: "↗", color: "#32cd32" }
  ];

  const bottomStats = [
    { label: "Total Votes Cast", value: "1,234", icon: "🗳️" },
    { label: "Number of Donors", value: "567", icon: "👥" },
    { label: "Quorum Required", value: "15%", icon: "⚖️" },
    { label: "Treasury Balance", value: "$485K", icon: "💰" }
  ];

  return (
    <div className="scholarship-dashboard">
      {/* Header Stats */}
      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card">
            <div className="stat-header">
              <span className="stat-icon">{stat.icon}</span>
              <span className="stat-trend" style={{ color: stat.color }}>{stat.trend}</span>
            </div>
            <div className="stat-value" style={{ color: stat.color }}>{stat.value}</div>
            <div className="stat-label">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Navigation Tabs */}
      <div className="tab-navigation">
        <button
          className={`tab-btn ${activeTab === 'browse' ? 'active' : ''}`}
          onClick={() => setActiveTab('browse')}
        >
          Browse Scholarships
        </button>
        <button
          className={`tab-btn ${activeTab === 'create' ? 'active' : ''}`}
          onClick={() => setActiveTab('create')}
        >
          Create Proposal
        </button>
      </div>

      {/* Main Content */}
      {activeTab === 'browse' && (
        <div className="scholarship-content">
          <div className="section-header">
            <h2>Active Scholarship Proposals</h2>
            <button className="new-proposal-btn">
              <span>✨</span> New Proposal
            </button>
          </div>

          <div className="scholarship-list">
            {scholarshipData.map((scholarship) => (
              <div key={scholarship.id} className="scholarship-card">
                <div className="scholarship-header">
                  <div className="scholarship-info">
                    <h3>{scholarship.name}</h3>
                    <p className="university">{scholarship.university}</p>
                    <div className="scholarship-tags">
                      {scholarship.tags.map((tag, index) => (
                        <span
                          key={index}
                          className={`tag ${tag.toLowerCase().replace(' ', '-')}`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="scholarship-amount">
                    <span className="amount">{scholarship.amount}</span>
                  </div>
                </div>

                <p className="scholarship-description">{scholarship.description}</p>

                <div className="voting-section">
                  <div className="voting-header">
                    <span className="status">{scholarship.status}</span>
                    <span className="time-left">{scholarship.timeLeft}</span>
                  </div>

                  <div className="progress-bar">
                    <div
                      className="progress-fill for"
                      style={{ width: `${scholarship.votes.for.percentage}%` }}
                    ></div>
                    <div
                      className="progress-fill against"
                      style={{ width: `${scholarship.votes.against.percentage}%` }}
                    ></div>
                    <div
                      className="progress-fill abstain"
                      style={{ width: `${scholarship.votes.abstain.percentage}%` }}
                    ></div>
                  </div>

                  <div className="vote-stats">
                    <div className="vote-stat">
                      <span className="vote-label for">For: {scholarship.votes.for.percentage}%</span>
                      <span className="vote-count">{scholarship.votes.for.count.toLocaleString()} votes</span>
                    </div>
                    <div className="vote-stat">
                      <span className="vote-label against">Against: {scholarship.votes.against.percentage}%</span>
                      <span className="vote-count">{scholarship.votes.against.count.toLocaleString()} votes</span>
                    </div>
                    <div className="vote-stat">
                      <span className="vote-label abstain">Abstain: {scholarship.votes.abstain.percentage}%</span>
                      <span className="vote-count">{scholarship.votes.abstain.count.toLocaleString()} votes</span>
                    </div>
                  </div>

                  <div className="quorum-status">
                    <span>Quorum: {scholarship.quorum}</span>
                  </div>
                </div>

                <div className="scholarship-actions">
                  <button className="cast-vote-btn">
                    <span>🗳️</span> Cast Vote
                  </button>
                  <button className="view-details-btn">
                    <span>👁️</span> View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'create' && (
        <div className="create-proposal-content">
          <div className="section-header">
            <h2>Create New Scholarship Proposal</h2>
            <p>Submit a proposal for community voting and funding</p>
          </div>

          <div className="proposal-form">
            <div className="sform-grid">
              <div className="sform-group">
                <label>Student Name</label>
                <input type="text" placeholder="Enter student's full name" />
              </div>
              <div className="sform-group">
                <label>Funding Amount (USDC)</label>
                <input type="number" placeholder="0.00" />
              </div>
              <div className="sform-group full-width">
                <label>University & Program</label>
                <input type="text" placeholder="e.g., MIT • Computer Science PhD" />
              </div>
              <div className="sform-group full-width">
                <label>Research Description</label>
                <textarea rows="4" placeholder="Describe the research project, its goals, and expected impact..."></textarea>
              </div>
              <div className="sform-group">
                <label>Category</label>
                <select>
                  <option>Select Category</option>
                  <option>Research</option>
                  <option>Sustainability</option>
                  <option>Medical</option>
                  <option>Technology</option>
                  <option>Other</option>
                </select>
              </div>
              <div className="sform-group">
                <label>Duration (months)</label>
                <input type="number" placeholder="12" />
              </div>
            </div>

            <div className="form-actions">
              <button className="submit-proposal-btn">
                <span>🚀</span> Submit Proposal
              </button>
              <button className="draft-btn">Save as Draft</button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Stats */}
      <div className="bottom-stats">
        {bottomStats.map((stat, index) => (
          <div key={index} className="bottom-stat-card">
            <div className="bottom-stat-icon">{stat.icon}</div>
            <div className="bottom-stat-content">
              <div className="bottom-stat-value">{stat.value}</div>
              <div className="bottom-stat-label">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScholarshipDashboard;