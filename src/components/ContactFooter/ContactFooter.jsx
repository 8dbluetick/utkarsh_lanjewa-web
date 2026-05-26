import React from 'react';
import { Camera, Video, Briefcase, Send } from 'lucide-react';
import './ContactFooter.css';

const ContactFooter = () => {
  return (
    <footer id="contact" className="site-footer">
      <div className="container">
        <div className="collaborations">
          <p className="collab-title">TRUSTED BY & WORKED WITH</p>
          <div className="logo-slider">
            {/* Placeholder for logos */}
            <div className="logo-placeholder">Brand One</div>
            <div className="logo-placeholder">Wellness Co</div>
            <div className="logo-placeholder">AyurTech</div>
            <div className="logo-placeholder">MedLife</div>
          </div>
        </div>

        <div className="footer-content">
          <div className="footer-left">
            <h2>Let's Connect</h2>
            <p>Whether it's a collaboration inquiry, a speaking opportunity, or a general question about Ayurveda, my inbox is open.</p>
            
            <div className="social-links">
              <a href="https://instagram.com/utkarsh_lanjewar" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="Instagram">
                <Camera size={24} />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="YouTube">
                <Video size={24} />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="LinkedIn">
                <Briefcase size={24} />
              </a>
            </div>
            
            <div className="newsletter">
              <h3>Subscribe for Weekly Ayurvedic Biohacks</h3>
              <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
                <input type="email" placeholder="Your email address" required />
                <button type="submit" className="btn btn-primary">Subscribe</button>
              </form>
            </div>
          </div>

          <div className="footer-right">
            <form className="contact-form" onSubmit={(e) => e.preventDefault()}>
              <div className="form-group">
                <label htmlFor="name">Name</label>
                <input type="text" id="name" required placeholder="John Doe" />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input type="email" id="email" required placeholder="john@example.com" />
              </div>
              <div className="form-group">
                <label htmlFor="subject">Subject</label>
                <select id="subject" required>
                  <option value="">Select a topic</option>
                  <option value="collaboration">Brand Collaboration</option>
                  <option value="speaking">Speaking Engagement</option>
                  <option value="medical">Medical/Ayurveda Question</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="message">Message</label>
                <textarea id="message" rows="4" required placeholder="How can I help you?"></textarea>
              </div>
              <button type="submit" className="btn btn-primary w-full">
                <Send size={18} />
                Send Message
              </button>
            </form>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="copyright">&copy; {new Date().getFullYear()} Utkarsh Lanjewar. All rights reserved.</p>
          <div className="medical-disclaimer">
            <strong>Disclaimer:</strong> Content is for educational purposes only and not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default ContactFooter;
