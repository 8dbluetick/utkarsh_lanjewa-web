import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, profile } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  if (location.pathname.startsWith('/admin')) return null;

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-primary/95 backdrop-blur-md border-b border-white/10 py-3' : 'bg-transparent py-5'}`}>
      <div className="container mx-auto px-6 flex justify-between items-center">
        <Link to="/" className="text-2xl font-playfair font-bold text-gold tracking-wider">
          USL Notes
        </Link>
        
        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          <Link to="/" className="text-cream hover:text-gold transition text-sm font-semibold uppercase tracking-wider">Home</Link>
          <Link to="/shop" className="text-cream hover:text-gold transition text-sm font-semibold uppercase tracking-wider">Shop</Link>
          
          {user?.email === 'sb108750@gmail.com' && (
             <Link to="/admin/products" className="text-maroon hover:text-white bg-maroon/20 px-3 py-1 rounded transition text-sm font-bold uppercase tracking-wider">
               Admin Panel
             </Link>
          )}

          {user ? (
            <Link to="/profile" className="flex items-center gap-2 hover:opacity-80 transition">
              <img src={profile?.avatar_url || `https://ui-avatars.com/api/?name=${profile?.full_name}&background=C8860A&color=fff`} alt="Profile" className="w-8 h-8 rounded-full border border-gold" />
            </Link>
          ) : (
            <Link to="/login" className="bg-gold text-primary font-bold px-5 py-2 rounded-full hover:bg-white transition text-sm">
              Login
            </Link>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="md:hidden flex items-center gap-4">
          {user && (
            <Link to="/profile" className="flex items-center gap-2">
              <img src={profile?.avatar_url || `https://ui-avatars.com/api/?name=${profile?.full_name}&background=C8860A&color=fff`} alt="Profile" className="w-8 h-8 rounded-full border border-gold" />
            </Link>
          )}
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-gold p-2" aria-label="Toggle Menu">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"}></path>
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-primary border-b border-white/10 shadow-lg py-4 px-6 flex flex-col gap-4">
          <Link to="/" className="text-cream hover:text-gold transition text-lg font-semibold uppercase tracking-wider">Home</Link>
          <Link to="/shop" className="text-cream hover:text-gold transition text-lg font-semibold uppercase tracking-wider">Shop</Link>
          
          {user?.email === 'sb108750@gmail.com' && (
             <Link to="/admin/products" className="text-maroon hover:text-white bg-maroon/20 px-3 py-2 rounded inline-block w-max transition text-sm font-bold uppercase tracking-wider">
               Admin Panel
             </Link>
          )}

          {!user && (
            <Link to="/login" className="bg-gold text-primary font-bold px-5 py-2 rounded-full hover:bg-white transition text-sm w-max mt-2">
              Login
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
