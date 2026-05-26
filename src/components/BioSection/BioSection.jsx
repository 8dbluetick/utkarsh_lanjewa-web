import React from 'react';
import { HeartPulse, Stethoscope, Leaf } from 'lucide-react';
import './BioSection.css';

const BioSection = () => {
  return (
    <section id="about" className="bio-section">
      <div className="container bio-container">
        <div className="bio-content">
          <h2 className="section-title">The "Dr. in the Making"</h2>
          <p className="bio-text">
            I'm Utkarsh, a 2nd-year BAMS student with a vision. Ayurveda isn't just about ancient texts; it's the ultimate biohack for modern living. My mission is to decode this 5,000-year-old wisdom and make it accessible, practical, and highly effective for today's fast-paced world.
          </p>
          <div className="bio-values">
            <div className="value-card">
              <Stethoscope className="value-icon" />
              <h3>Clinical Focus</h3>
              <p>Rooted in rigorous medical study and practice.</p>
            </div>
            <div className="value-card">
              <Leaf className="value-icon" />
              <h3>Modern Ayurveda</h3>
              <p>Ancient herbs, modern application.</p>
            </div>
            <div className="value-card">
              <HeartPulse className="value-icon" />
              <h3>Holistic Health</h3>
              <p>Optimizing mind, body, and spirit.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BioSection;
