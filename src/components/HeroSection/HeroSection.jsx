import React from 'react';
import { ArrowRight, BookOpen } from 'lucide-react';
import './HeroSection.css';

const HeroSection = () => {
  return (
    <section id="home" className="hero">
      <div className="container hero-container">
        <div className="hero-content">
          <div className="badge">Dr. in the Making</div>
          <h1 className="hero-title">
            Modernizing <span className="highlight">Ayurveda</span> for the New Generation
          </h1>
          <p className="hero-subtitle">
            Bridging the gap between 5,000-year-old Ayurvedic wisdom and the fast-paced 21st-century lifestyle. Join 7.5k+ others on the journey to holistic wellness.
          </p>
          <div className="hero-actions">
            <a href="#store" className="btn btn-primary">
              <BookOpen size={20} />
              Get the Pocket OPD Guide
            </a>
            <a href="#community" className="btn btn-secondary">
              Join the Community
              <ArrowRight size={20} />
            </a>
          </div>
          <div className="hero-stats">
            <div className="stat">
              <span className="stat-value">7.5k+</span>
              <span className="stat-label">Community Members</span>
            </div>
            <div className="stat">
              <span className="stat-value">2nd Yr</span>
              <span className="stat-label">BAMS Student</span>
            </div>
          </div>
        </div>
        <div className="hero-image-wrapper">
          <div className="hero-image-bg"></div>
          <img 
            src="/hero.png" 
            alt="Utkarsh Lanjewar" 
            className="hero-image"
          />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
