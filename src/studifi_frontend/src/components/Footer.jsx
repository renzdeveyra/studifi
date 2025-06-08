import React from 'react';

const Footer = () => (
  <footer className="studifi-footer">
    <div className="footer-content">
      <div className="footer-section">
        <h4>StudiFi</h4>
        <p>Decentralized Student Finance on Internet Computer</p>
      </div>
      <div className="footer-section">
        <h4>Platform</h4>
        <ul>
          <li>Microloans</li>
          <li>Scholarships</li>
          <li>Governance</li>
          <li>Compliance</li>
        </ul>
      </div>
      <div className="footer-section">
        <h4>Technology</h4>
        <ul>
          <li>Internet Computer</li>
          <li>Motoko</li>
          <li>React</li>
          <li>Web3</li>
        </ul>
      </div>
      <div className="footer-section">
        <h4>Community</h4>
        <ul>
          <li>Discord</li>
          <li>Twitter</li>
          <li>GitHub</li>
          <li>Forum</li>
        </ul>
      </div>
    </div>
    <div className="footer-bottom">
      <p>&copy; 2025 StudiFi. Built on Internet Computer Protocol.</p>
    </div>
  </footer>
);

export default Footer;