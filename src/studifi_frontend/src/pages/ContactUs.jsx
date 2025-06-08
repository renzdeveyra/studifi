import React, { useState } from 'react';
import './ContactUs.scss';

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    category: 'general'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      setSubmitMessage('Thank you for your message! We\'ll get back to you within 24 hours.');
      setIsSubmitting(false);
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
        category: 'general'
      });
    }, 1500);
  };

  const contactMethods = [
    {
      icon: '📧',
      title: 'Email Support',
      description: 'Get in touch via email',
      contact: 'support@studifi.com',
      response: '24 hours response'
    },
    {
      icon: '💬',
      title: 'Live Chat',
      description: 'Chat with our team',
      contact: 'Available 24/7',
      response: 'Instant response'
    },
    {
      icon: '📞',
      title: 'Phone Support',
      description: 'Call us directly',
      contact: '+1 (555) 123-4567',
      response: 'Mon-Fri 9AM-6PM'
    },
    {
      icon: '🏢',
      title: 'Office Visit',
      description: 'Visit our headquarters',
      contact: '123 DeFi Street, Blockchain City',
      response: 'By appointment'
    }
  ];

  const faqItems = [
    {
      question: 'How does DeFi student lending work?',
      answer: 'Our platform uses smart contracts on the Internet Computer blockchain to provide transparent, zero-fee student loans with instant approval through AI-powered credit assessment.'
    },
    {
      question: 'What are the eligibility requirements?',
      answer: 'Students must complete KYC verification, be enrolled in an accredited institution, and meet our community-driven lending criteria determined by DAO governance.'
    },
    {
      question: 'How do I participate in the scholarship DAO?',
      answer: 'Hold StudiFi tokens to participate in governance, vote on scholarship distributions, and help shape the future of decentralized education finance.'
    },
    {
      question: 'Are there any hidden fees?',
      answer: 'No hidden fees! Thanks to Internet Computer\'s reverse gas model, all transactions are completely free for users.'
    }
  ];

  return (
    <section className="sf-contact-us-section">
      <div className="sf-contact-container">
        {/* Header Section */}
        <div className="sf-contact-header">
          <div className="sf-contact-badge">
            <span className="sf-badge-icon">💬</span>
            <span className="sf-badge-text">Get in Touch</span>
          </div>
          <h1 className="sf-contact-title">
            Contact the <span className="sf-contact-highlight">Code Crusaders</span>
          </h1>
          <p className="sf-contact-description">
            Have questions about DeFi education finance? Need support with our platform? 
            Our team is here to help you navigate the future of student funding.
          </p>
        </div>

        {/* Contact Methods Grid */}
        <div className="sf-contact-methods">
          <div className="sf-methods-grid">
            {contactMethods.map((method, index) => (
              <div key={index} className="sf-contact-method-card">
                <div className="sf-method-icon">{method.icon}</div>
                <h3 className="sf-method-title">{method.title}</h3>
                <p className="sf-method-description">{method.description}</p>
                <div className="sf-method-contact">{method.contact}</div>
                <div className="sf-method-response">{method.response}</div>
                <div className="sf-card-glow"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="sf-contact-main-content">
          {/* Contact Form */}
          <div className="sf-contact-form-section">
            <div className="sf-form-header">
              <h2>Send us a Message</h2>
              <p>Fill out the form below and we'll get back to you as soon as possible.</p>
            </div>

            <form className="sf-contact-form" onSubmit={handleSubmit}>
              <div className="sf-form-row">
                <div className="sf-form-group">
                  <label htmlFor="name">Full Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="Your full name"
                  />
                </div>
                <div className="sf-form-group">
                  <label htmlFor="email">Email Address *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="your.email@example.com"
                  />
                </div>
              </div>

              <div className="sf-form-row">
                <div className="sf-form-group">
                  <label htmlFor="category">Category</label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                  >
                    <option value="general">General Inquiry</option>
                    <option value="technical">Technical Support</option>
                    <option value="loans">Student Loans</option>
                    <option value="dao">DAO & Governance</option>
                    <option value="partnership">Partnership</option>
                  </select>
                </div>
                <div className="sf-form-group">
                  <label htmlFor="subject">Subject *</label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    placeholder="Brief subject line"
                  />
                </div>
              </div>

              <div className="sf-form-group">
                <label htmlFor="message">Message *</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows="6"
                  placeholder="Tell us how we can help you..."
                ></textarea>
              </div>

              <button 
                type="submit" 
                className="sf-submit-btn"
                disabled={isSubmitting}
              >
                <span className="sf-btn-icon">
                  {isSubmitting ? '⏳' : '🚀'}
                </span>
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </button>

              {submitMessage && (
                <div className="sf-submit-message">
                  {submitMessage}
                </div>
              )}
            </form>
          </div>

          {/* FAQ Section */}
          <div className="sf-faq-section">
            <div className="sf-faq-header">
              <h2>Frequently Asked Questions</h2>
              <p>Quick answers to common questions about StudiFi.</p>
            </div>

            <div className="sf-faq-list">
              {faqItems.map((item, index) => (
                <div key={index} className="sf-faq-item">
                  <div className="sf-faq-question">
                    <span className="sf-faq-icon">❓</span>
                    <h4>{item.question}</h4>
                  </div>
                  <div className="sf-faq-answer">
                    <p>{item.answer}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="sf-faq-footer">
              <p>Still have questions?</p>
              <button className="sf-faq-contact-btn">
                <span className="sf-btn-icon">💬</span>
                Start Live Chat
              </button>
            </div>
          </div>
        </div>

        {/* Team Contact Section */}
        <div className="sf-team-contact-section">
          <div className="sf-team-contact-header">
            <h2>Direct Team Contact</h2>
            <p>Reach out to specific team members based on your needs.</p>
          </div>
          
          <div className="sf-team-contact-grid">
            <div className="sf-team-contact-card">
              <div className="sf-team-avatar">A</div>
              <div className="sf-team-info">
                <h4>Adrian Azures</h4>
                <p className="sf-team-role">Team Leader & Strategy</p>
                <div className="sf-team-contact-details">
                  <div className="sf-contact-detail">
                    <span className="sf-contact-icon">📧</span>
                    <span>adrianazures6@gmail.com</span>
                  </div>
                  <div className="sf-contact-detail">
                    <span className="sf-contact-icon">📞</span>
                    <span>+639953677577</span>
                  </div>
                </div>
                <p className="sf-team-expertise">Platform strategy, partnerships, and general inquiries</p>
              </div>
            </div>

            <div className="sf-team-contact-card">
              <div className="sf-team-avatar">B</div>
              <div className="sf-team-info">
                <h4>Baron Ocasiones</h4>
                <p className="sf-team-role">Lead Researcher</p>
                <div className="sf-team-contact-details">
                  <div className="sf-contact-detail">
                    <span className="sf-contact-icon">📧</span>
                    <span>mvbocasiones@tip.edu.ph</span>
                  </div>
                  <div className="sf-contact-detail">
                    <span className="sf-contact-icon">📞</span>
                    <span>+639509410759</span>
                  </div>
                </div>
                <p className="sf-team-expertise">Blockchain research, DeFi protocols, and technical documentation</p>
              </div>
            </div>

            <div className="sf-team-contact-card">
              <div className="sf-team-avatar">R</div>
              <div className="sf-team-info">
                <h4>Renz De Veyra</h4>
                <p className="sf-team-role">Backend Lead</p>
                <div className="sf-team-contact-details">
                  <div className="sf-contact-detail">
                    <span className="sf-contact-icon">📧</span>
                    <span>mrdeveyra@tip.edu.ph</span>
                  </div>
                  <div className="sf-contact-detail">
                    <span className="sf-contact-icon">📞</span>
                    <span>+639455933109</span>
                  </div>
                </div>
                <p className="sf-team-expertise">Smart contracts, backend architecture, and API issues</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactUs;