import React from 'react';
import { Sun, Eye, Coffee, Brain } from 'lucide-react';
import './ContentHub.css';

const contentItems = [
  {
    icon: <Sun size={32} />,
    title: "Modern Dinacharya",
    description: "The 5-Minute Morning Ritual for Busy Professionals.",
  },
  {
    icon: <Eye size={32} />,
    title: "Digital Eye Care",
    description: "Ayurvedic Secrets to Combat Screen Fatigue.",
  },
  {
    icon: <Coffee size={32} />,
    title: "Biohacking with Herbs",
    description: "Ashwagandha & Matcha: Energy without the Crash.",
  },
  {
    icon: <Brain size={32} />,
    title: "Mental Wellness",
    description: "3-Minute Pranayama for Exam & Work Anxiety.",
  }
];

const ContentHub = () => {
  return (
    <section id="ayurveda" className="content-hub">
      <div className="container">
        <div className="hub-header">
          <h2 className="section-title">Ayurveda & Modern Living</h2>
          <p className="hub-subtitle">Practical wisdom for everyday challenges.</p>
        </div>
        
        <div className="content-grid">
          {contentItems.map((item, index) => (
            <div key={index} className="content-card">
              <div className="card-icon">{item.icon}</div>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </div>
          ))}
        </div>

        <div className="quiz-cta">
          <div className="quiz-content glass">
            <h3>Discover Your Unique Blueprint</h3>
            <p>Take the 2-minute assessment to find your Dosha and get personalized wellness tips.</p>
            <button className="btn btn-secondary">Take the Dosha Quiz</button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContentHub;
