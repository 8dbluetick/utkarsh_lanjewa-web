import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`navbar ${isScrolled ? 'scrolled glass' : ''}`}>
      <div className="container navbar-container">
        <a href="#" className="logo">
          Utkarsh Lanjewar
        </a>

        {/* Desktop Nav */}
        <div className="nav-links">
          <a href="#about" className="nav-link">About</a>
          <a href="#ayurveda" className="nav-link">Ayurveda</a>
          <a href="#store" className="nav-link">Resources</a>
          <a href="#contact" className="nav-link">Contact</a>
          <a href="#quiz" className="btn btn-primary nav-btn">Find Your Dosha</a>
        </div>

        {/* Mobile Nav Toggle */}
        <button 
          className="mobile-toggle"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="mobile-menu glass">
          <a href="#about" className="mobile-link" onClick={() => setIsMobileMenuOpen(false)}>About</a>
          <a href="#ayurveda" className="mobile-link" onClick={() => setIsMobileMenuOpen(false)}>Ayurveda</a>
          <a href="#store" className="mobile-link" onClick={() => setIsMobileMenuOpen(false)}>Resources</a>
          <a href="#contact" className="mobile-link" onClick={() => setIsMobileMenuOpen(false)}>Contact</a>
          <a href="#quiz" className="btn btn-primary mobile-btn" onClick={() => setIsMobileMenuOpen(false)}>Find Your Dosha</a>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
