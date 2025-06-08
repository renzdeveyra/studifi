import React from 'react';
import './AboutUs.scss';

import AdrianImg from '../assets/Adrian.jpg';
import BaronImg from '../assets/Baron.jpg';
import RenzImg from '../assets/Renz.jpg';
import FrancisImg from '../assets/Francis.jpg';
import NazarethImg from '../assets/Nazareth.jpg';

const AboutUs = () => {
  const teamMembers = [
    {
      id: 1,
      name: "Adrian Azures",
      role: "Team Leader",
      phone: "+639953677577",
      email: "adrianazures6@gmail.com",
      image: AdrianImg,
      bio: "Passionate full-stack developer and team leader with expertise in blockchain technology and DeFi solutions. Leads the Code Crusader team in building innovative educational finance platforms."
    },
    {
      id: 2,
      name: "Baron Ocasiones",
      role: "Lead Researcher",
      phone: "+639509410759",
      email: "mvbocasiones@tip.edu.ph",
      image: BaronImg,
      bio: "Expert researcher specializing in blockchain protocols and decentralized systems. Drives technical innovation and ensures our solutions meet the highest industry standards."
    },
    {
      id: 3,
      name: "Renz De Veyra",
      role: "Backend Lead",
      phone: "+639455933109",
      email: "mrdeveyra@tip.edu.ph",
      image: RenzImg,
      bio: "Senior backend developer with deep expertise in smart contracts and blockchain architecture. Builds robust, scalable systems that power our DeFi education platform."
    },
    {
      id: 4,
      name: "Francis Reyes",
      role: "Frontend Developer",
      phone: "+639152788004",
      email: "mfarayes@tip.edu.ph",
      image: FrancisImg,
      bio: "Creative frontend developer focused on creating intuitive user experiences. Transforms complex blockchain interactions into simple, elegant interfaces."
    },
    {
      id: 5,
      name: "Nazareth Maño",
      role: "Backend Developer",
      phone: "+639508410759",
      email: "ncm.0001x@gmail.com",
      image: NazarethImg,
      bio: "Skilled backend developer specializing in API development and database optimization. Ensures seamless integration between frontend and blockchain systems."
    }
  ];

  const handleImageError = (e) => {
    e.target.style.display = 'none';
    e.target.parentElement.style.background = 'linear-gradient(135deg, #333, #555)';
    e.target.parentElement.innerHTML = '<div style="display: flex; align-items: center; justify-content: center; height: 100%; font-size: 3rem; color: rgba(127, 255, 0, 0.6);">👤</div>';
  };

  return (
    <section className="about-us-section">
      <div className="container">
        {/* Team Introduction */}
        <div className="team-intro">
          <div className="team-badge">
            <span className="badge-icon">⚡</span>
            <span className="badge-text">Code Crusader Team</span>
          </div>
          <h1 className="team-title">
            Meet the <span className="highlight">Code Crusaders</span>
          </h1>
          <p className="team-description">
            We are a passionate team of developers, researchers, and innovators dedicated to revolutionizing 
            education finance through blockchain technology. Our mission is to create transparent, 
            accessible, and community-driven financial solutions for students worldwide.
          </p>
          <div className="team-stats">
            <div className="stat-item">
              <span className="stat-number">5</span>
              <span className="stat-label">Expert Developers</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">3+</span>
              <span className="stat-label">Years Experience</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">100%</span>
              <span className="stat-label">Blockchain Focused</span>
            </div>
          </div>
        </div>

        {/* Team Members Grid */}
        <div className="team-grid">
          {teamMembers.map((member) => {
            const firstName = member.name.split(' ')[0];

            return (
              <div key={member.id} className="team-card">
                <div className="card-background"></div>
                <div className="member-image" data-member={firstName}>
                  <img 
                    src={member.image} 
                    alt={member.name}
                    onError={handleImageError}
                  />
                  <div className="image-overlay">
                    <div className="overlay-icon"></div>
                  </div>
                </div>
                <div className="member-info">
                  <h3 className="member-name">{member.name}</h3>
                  <p className="member-role">{member.role}</p>
                  <p className="member-bio">{member.bio}</p>
                  <div className="contact-info">
                    <div className="contact-item">
                      <span className="contact-icon">📞</span>
                      <span className="contact-text">{member.phone}</span>
                    </div>
                    <div className="contact-item">
                      <span className="contact-icon">✉️</span>
                      <span className="contact-text">{member.email}</span>
                    </div>
                  </div>
                </div>
                <div className="card-glow"></div>
              </div>
            );
          })}
        </div>

        {/* Team Mission */}
        <div className="team-mission">
          <div className="mission-content">
            <h2>Our Mission</h2>
            <p>
              The Code Crusader team is committed to democratizing education finance through cutting-edge 
              blockchain technology. We believe that every student deserves access to transparent, 
              fair, and community-driven financial services that empower their educational journey.
            </p>
            <div className="mission-values">
              <div className="value-item">
                <div className="value-icon">🚀</div>
                <h4>Innovation</h4>
                <p>Pushing the boundaries of what's possible in DeFi education</p>
              </div>
              <div className="value-item">
                <div className="value-icon">🤝</div>
                <h4>Community</h4>
                <p>Building solutions that put students and community first</p>
              </div>
              <div className="value-item">
                <div className="value-icon">🔒</div>
                <h4>Trust</h4>
                <p>Ensuring transparency and security in every transaction</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutUs;
