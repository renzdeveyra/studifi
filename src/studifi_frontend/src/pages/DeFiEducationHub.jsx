import React, { useState } from 'react';
import './DeFiEducationHub.scss';

const DeFiEducationHub = ({ navigateTo }) => {
  const [activeModule, setActiveModule] = useState(null);

  const learningModules = [
    {
      id: 'blockchain-basics',
      title: 'Blockchain Basics',
      icon: '⛓️',
      description: 'Learn how blockchain technology works and why it matters for education',
      content: 'Blockchain is like a digital ledger that everyone can see but no one can cheat. Think of it as a shared notebook where every transaction is recorded permanently and transparently.'
    },
    {
      id: 'smart-contracts',
      title: 'Smart Contracts',
      icon: '📄',
      description: 'Understand automated agreements that execute themselves',
      content: 'Smart contracts are like digital vending machines - you put in what you agreed to, and the contract automatically gives you what you should receive. No middleman needed!'
    },
    {
      id: 'dao-governance',
      title: 'DAO Governance',
      icon: '🏛️',
      description: 'Discover how communities make decisions together',
      content: 'A DAO is like a student council, but for the entire community. Everyone with voting tokens can propose ideas and vote on important decisions about scholarships and platform improvements.'
    },
    {
      id: 'zero-fees',
      title: 'Zero Transaction Fees',
      icon: '💰',
      description: 'Learn why Internet Computer blockchain has no gas fees',
      content: 'Unlike other blockchains that charge fees for every transaction, Internet Computer uses a "reverse gas model" where the platform pays for your transactions. This means more money stays in your pocket!'
    }
  ];

  const benefits = [
    {
      icon: '🔍',
      title: 'Complete Transparency',
      description: 'Every transaction, loan term, and payment is recorded on the blockchain for anyone to verify'
    },
    {
      icon: '🚫',
      title: 'Zero Hidden Fees',
      description: 'No origination fees, processing fees, or surprise charges thanks to blockchain efficiency'
    },
    {
      icon: '⚡',
      title: 'Instant Approvals',
      description: 'Smart contracts evaluate your application and provide decisions in seconds, not weeks'
    },
    {
      icon: '🌍',
      title: 'Global Access',
      description: 'Access education funding from anywhere in the world without traditional banking barriers'
    },
    {
      icon: '🗳️',
      title: 'Community Voice',
      description: 'Participate in governance decisions that shape the future of education finance'
    },
    {
      icon: '🔒',
      title: 'Cryptographic Security',
      description: 'Your data and funds are protected by military-grade blockchain security'
    }
  ];

  const comparisonData = [
    {
      category: 'Application Process',
      traditional: 'Weeks of paperwork and waiting',
      defi: 'Instant smart contract evaluation'
    },
    {
      category: 'Fees',
      traditional: 'Origination fees, processing fees, hidden charges',
      defi: 'Zero fees thanks to Internet Computer'
    },
    {
      category: 'Transparency',
      traditional: 'Complex terms buried in fine print',
      defi: 'All terms visible on blockchain'
    },
    {
      category: 'Flexibility',
      traditional: 'Rigid bank policies',
      defi: 'Community-driven, student-focused terms'
    },
    {
      category: 'Global Access',
      traditional: 'Limited to specific regions/banks',
      defi: 'Available worldwide, 24/7'
    }
  ];

  return (
    <section className="defi-education-hub">
      <div className="container">
        {/* Breadcrumb Navigation */}
        <nav className="breadcrumb">
          <span className="breadcrumb-link" onClick={() => navigateTo('home')}>Home</span>
          <span className="breadcrumb-separator">›</span>
          <span className="breadcrumb-current">DeFi Education Hub</span>
        </nav>

        {/* Hero Section */}
        <header className="education-hero">
          <div className="hero-content">
            <h1 className="hero-title">
              DeFi Education Hub
              <span className="title-accent">📚</span>
            </h1>
            <p className="hero-description">
              Learn how decentralized finance is revolutionizing education funding. 
              Discover the benefits of blockchain technology for students like you.
            </p>
          </div>
          <div className="hero-stats">
            <div className="stat-item">
              <span className="stat-number">100%</span>
              <span className="stat-label">Transparent</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">0%</span>
              <span className="stat-label">Hidden Fees</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">24/7</span>
              <span className="stat-label">Available</span>
            </div>
          </div>
        </header>

        {/* What is DeFi Education Section */}
        <section className="what-is-defi">
          <div className="section-header">
            <h2 className="section-title">What is DeFi Education?</h2>
            <p className="section-description">
              DeFi (Decentralized Finance) Education combines blockchain technology with student funding to create 
              a transparent, fair, and accessible financial system for learners worldwide.
            </p>
          </div>
          
          <div className="defi-explanation">
            <div className="explanation-card">
              <div className="card-icon">🎓</div>
              <h3>Student-Centric</h3>
              <p>Built by students, for students. Every feature is designed with your needs in mind, from flexible repayment terms to zero hidden fees.</p>
            </div>
            
            <div className="explanation-card">
              <div className="card-icon">🌐</div>
              <h3>Decentralized</h3>
              <p>No single bank or institution controls your funding. The community makes decisions together, ensuring fairness and transparency.</p>
            </div>
            
            <div className="explanation-card">
              <div className="card-icon">⚡</div>
              <h3>Instant & Efficient</h3>
              <p>Smart contracts automate the entire process, from application to approval to disbursement, making everything faster and cheaper.</p>
            </div>
          </div>
        </section>

        {/* Call to Action - Ready to Experience DeFi Education */}
        <section className="cta-section">
          <div className="cta-content">
            <h2 className="cta-title">Ready to Experience DeFi Education?</h2>
            <p className="cta-description">
              Join thousands of students who have already discovered the benefits of decentralized education finance.
            </p>
            <div className="cta-buttons">
              <button className="btn-primary" onClick={() => navigateTo('kyc')}>
                <span className="btn-icon">🚀</span>
                Get Started Now
              </button>
              <button className="btn-secondary" onClick={() => navigateTo('home')}>
                <span className="btn-icon">🏠</span>
                Back to Home
              </button>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="benefits-section">
          <div className="section-header">
            <h2 className="section-title">Why Choose DeFi for Education?</h2>
            <p className="section-description">
              Discover the advantages that make blockchain-based education finance superior to traditional methods.
            </p>
          </div>
          
          <div className="benefits-grid">
            {benefits.map((benefit, index) => (
              <div key={index} className="benefit-card">
                <div className="benefit-icon">{benefit.icon}</div>
                <h3 className="benefit-title">{benefit.title}</h3>
                <p className="benefit-description">{benefit.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Interactive Learning Modules */}
        <section className="learning-modules">
          <div className="section-header">
            <h2 className="section-title">Interactive Learning Modules</h2>
            <p className="section-description">
              Click on any module below to learn more about the technology powering your education finance.
            </p>
          </div>
          
          <div className="modules-grid">
            {learningModules.map((module) => (
              <div 
                key={module.id} 
                className={`module-card ${activeModule === module.id ? 'active' : ''}`}
                onClick={() => setActiveModule(activeModule === module.id ? null : module.id)}
              >
                <div className="module-header">
                  <span className="module-icon">{module.icon}</span>
                  <h3 className="module-title">{module.title}</h3>
                </div>
                <p className="module-description">{module.description}</p>
                {activeModule === module.id && (
                  <div className="module-content">
                    <p>{module.content}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Comparison Section */}
        <section className="comparison-section">
          <div className="section-header">
            <h2 className="section-title">Traditional vs. DeFi Student Loans</h2>
            <p className="section-description">
              See how DeFi education finance compares to traditional student loans.
            </p>
          </div>
          
          <div className="comparison-table">
            <div className="table-header">
              <div className="header-cell">Feature</div>
              <div className="header-cell traditional">Traditional Loans</div>
              <div className="header-cell defi">DeFi Loans</div>
            </div>
            
            {comparisonData.map((row, index) => (
              <div key={index} className="table-row">
                <div className="cell category">{row.category}</div>
                <div className="cell traditional">{row.traditional}</div>
                <div className="cell defi">{row.defi}</div>
              </div>
            ))}
          </div>
        </section>


      </div>
    </section>
  );
};

export default DeFiEducationHub;
