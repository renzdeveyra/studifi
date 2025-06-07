import React, { useState, useEffect } from 'react';
import { governance_engine } from 'declarations/governance_engine';

const ScholarshipsPage = () => {
  const [scholarships, setScholarships] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    loadScholarships();
  }, []);

  const loadScholarships = async () => {
    try {
      const result = await governance_engine.getOpenScholarships();
      setScholarships(result);
    } catch (error) {
      console.error('Error loading scholarships:', error);
    }
  };

  return (
    <div className="scholarships-page-section"> {/* Apply dashboard section class */}
      <div className="container">
        <header className="page-header dashboard-section-wrapper">
          <div className="section-header-left">
            <h2 className="section-title">Scholarship Marketplace</h2>
            <p className="section-description">Transparent, community-governed scholarship distribution</p>
          </div>
          <div className="section-content-right">
            <button
              className="btn-primary"
              onClick={() => setShowCreateForm(!showCreateForm)}
            >
              {showCreateForm ? 'Cancel' : 'Create Scholarship'}
            </button>
          </div>
        </header>

        {showCreateForm && (
          <div className="create-scholarship-form dashboard-section-wrapper">
            <div className="section-header-left">
              <h3 className="section-title">Create New Scholarship</h3>
              <p className="section-description">Coming soon - Scholarship creation interface</p>
            </div>
            <div className="section-content-right">
              {/* Placeholder for scholarship creation form */}
              <div className="aid-status-card">
                <div className="card-image-container">
                  <div className="card-image">✨</div>
                </div>
                <div className="card-details">
                  <h4 className="card-title">New Scholarship Creation</h4>
                  <p className="card-text">
                    This section will allow you to define the criteria, amount, and other details for a new scholarship.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="scholarships-grid dashboard-section-wrapper">
          <div className="section-header-left">
            <h2 className="section-title">Available Scholarships</h2>
            <p className="section-description">Browse and apply for open scholarships.</p>
          </div>
          <div className="section-content-right overview-grid"> {/* Use overview-grid for scholarship cards */}
            {scholarships.length > 0 ? (
              scholarships.map((scholarship, index) => (
                <div key={index} className="scholarship-card overview-card"> {/* Apply overview-card style */}
                  <span className="overview-icon">🎓</span>
                  <h3 className="overview-label">{scholarship.name}</h3>
                  <p className="overview-value">${scholarship.amount.toLocaleString()}</p>
                  <p className="card-text">{scholarship.description}</p>
                  <div className="criteria card-text">
                    <p><strong>Min GPA:</strong> {scholarship.criteria.minGPA}</p>
                    <p><strong>Programs:</strong> {scholarship.criteria.requiredPrograms.join(', ')}</p>
                    <p><strong>Max Recipients:</strong> {scholarship.criteria.maxRecipients}</p>
                  </div>
                  <button className="btn-secondary">Apply Now</button>
                </div>
              ))
            ) : (
              <div className="empty-state aid-status-card"> {/* Reuse aid-status-card for empty state */}
                <div className="card-image-container">
                  <div className="card-image">🤔</div>
                </div>
                <div className="card-details">
                  <h4 className="card-title">No scholarships available</h4>
                  <p className="card-text">Be the first to create a scholarship for students!</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScholarshipsPage;