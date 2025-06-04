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
    <div className="scholarships-page">
      <div className="page-header">
        <h2>Scholarship Marketplace</h2>
        <p>Transparent, community-governed scholarship distribution</p>
        <button
          className="btn-primary"
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          {showCreateForm ? 'Cancel' : 'Create Scholarship'}
        </button>
      </div>

      {showCreateForm && (
        <div className="create-scholarship-form">
          <h3>Create New Scholarship</h3>
          <p>Coming soon - Scholarship creation interface</p>
        </div>
      )}

      <div className="scholarships-grid">
        {scholarships.length > 0 ? (
          scholarships.map((scholarship, index) => (
            <div key={index} className="scholarship-card">
              <h3>{scholarship.name}</h3>
              <p className="amount">${scholarship.amount.toLocaleString()}</p>
              <p className="description">{scholarship.description}</p>
              <div className="criteria">
                <p><strong>Min GPA:</strong> {scholarship.criteria.minGPA}</p>
                <p><strong>Programs:</strong> {scholarship.criteria.requiredPrograms.join(', ')}</p>
                <p><strong>Max Recipients:</strong> {scholarship.criteria.maxRecipients}</p>
              </div>
              <button className="btn-secondary">Apply Now</button>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <h3>No scholarships available</h3>
            <p>Be the first to create a scholarship for students!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScholarshipsPage;