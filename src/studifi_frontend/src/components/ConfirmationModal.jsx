// ConfirmationModal.jsx
import React, { useState } from 'react';
import './ConfirmationModal.scss'; // You'll create this SCSS file next

const ConfirmationModal = ({ isOpen, onClose, onConfirm, formData }) => {
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  if (!isOpen) return null;

  const handleConfirmClick = () => {
    if (agreedToTerms) {
      onConfirm();
    } else {
      alert('Please agree to the Data Privacy Act and Honor Pledge.');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Review & Confirm Submission</h2>
        <p>Please review the following information and confirm your understanding.</p>

        <div className="modal-section">
          <h4>Data Privacy Act (Republic Act No. 10173)</h4>
          <p>
            By proceeding, you acknowledge and consent to the collection, processing, and storage of your personal data
            as provided in this Know Your Customer (KYC) process, in accordance with the Philippine Data Privacy Act of 2012.
            Your data will be used solely for the purpose of verifying your identity and eligibility for student loans and scholarships
            offered through StudiFi. We are committed to protecting your privacy and ensuring the security of your information.
            For more details, please refer to our full Privacy Policy.
          </p>
        </div>

        <div className="modal-section">
          <h4>Honor Pledge</h4>
          <p>
            I hereby certify that all information provided in this application is true, accurate, and complete to the best of my knowledge and belief.
            I understand that any false statements or misrepresentations may result in the rejection of my application,
            withdrawal of any awarded loans or scholarships, and may subject me to legal action.
          </p>
        </div>

        <div className="modal-checkbox-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
            />
            <span className="checkmark"></span>
            I have read and agree to the Data Privacy Act and Honor Pledge.
          </label>
        </div>
          <div className="modal-actions">
            <button className="cancel-btn" onClick={onClose}>Cancel</button>
            <button className="confirm-btn" onClick={handleConfirmClick} disabled={!agreedToTerms}>
              Yes, I'm sure!
            </button>
          </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;