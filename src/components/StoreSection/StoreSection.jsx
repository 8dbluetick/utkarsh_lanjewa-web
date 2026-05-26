import React from 'react';
import { ShoppingBag, Star, CheckCircle } from 'lucide-react';
import './StoreSection.css';

const StoreSection = () => {
  return (
    <section id="store" className="store-section">
      <div className="container">
        <div className="store-header">
          <h2 className="section-title">The BAMS Student Store</h2>
          <p className="store-subtitle">Resources to help you study smarter, not harder.</p>
        </div>

        <div className="product-showcase">
          <div className="product-image-container">
            <div className="mockup-book">
              <div className="book-cover">
                <span className="book-badge">Bestseller</span>
                <h3>Pocket OPD Guide</h3>
                <p>Diseases & Their Treatment</p>
                <div className="book-author">By Utkarsh Lanjewar</div>
              </div>
            </div>
          </div>
          <div className="product-details">
            <div className="rating">
              <Star className="star filled" size={20} />
              <Star className="star filled" size={20} />
              <Star className="star filled" size={20} />
              <Star className="star filled" size={20} />
              <Star className="star filled" size={20} />
              <span className="rating-text">(120+ Reviews)</span>
            </div>
            <h3 className="product-title">Pocket OPD Guide: Diseases & Their Treatment</h3>
            <p className="product-description">
              The ultimate quick-reference guide for BAMS students and young practitioners. Stop fumbling through massive textbooks during clinicals.
            </p>
            <ul className="product-features">
              <li><CheckCircle className="feature-icon" size={20} /> 68+ Common Diseases Covered</li>
              <li><CheckCircle className="feature-icon" size={20} /> Every Symptom Detailed</li>
              <li><CheckCircle className="feature-icon" size={20} /> Specific Drugs & Exact Dosages</li>
              <li><CheckCircle className="feature-icon" size={20} /> Easy-to-read formatting</li>
            </ul>
            <div className="product-actions">
              <span className="price">₹499 <span className="original-price">₹999</span></span>
              <button className="btn btn-primary">
                <ShoppingBag size={20} />
                Get Instant Access
              </button>
            </div>
          </div>
        </div>

        <div className="blog-teaser">
          <div className="blog-content">
            <span className="blog-label">Latest Article</span>
            <h3>The Medical Student's Side-Hustle: How to Earn While You Learn</h3>
            <a href="#" className="btn btn-outline">Read the Blog</a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StoreSection;
