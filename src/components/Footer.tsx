import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-[#080A0F] border-t border-white/5 pt-16 pb-8 mt-auto">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-2xl font-playfair font-bold text-gold mb-4 tracking-wider">USL Notes</h3>
            <p className="text-cream opacity-70 mb-6 max-w-sm leading-relaxed">
              Premium, handwritten, high-yield study materials for BAMS students. Crafted with care by Utkarsh S Lanjewar to help you ace your university exams.
            </p>
          </div>
          
          <div>
            <h4 className="text-lg font-playfair font-bold text-white mb-4">Quick Links</h4>
            <ul className="space-y-3">
              <li><Link to="/" className="text-cream opacity-70 hover:text-gold transition">Home</Link></li>
              <li><Link to="/shop" className="text-cream opacity-70 hover:text-gold transition">All Notes</Link></li>
              <li><Link to="/login" className="text-cream opacity-70 hover:text-gold transition">My Profile / Login</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-playfair font-bold text-white mb-4">Legal & Support</h4>
            <ul className="space-y-3">
              <li><Link to="/contact" className="text-cream opacity-70 hover:text-gold transition">Contact Us</Link></li>
              <li><Link to="/terms" className="text-cream opacity-70 hover:text-gold transition">Terms & Conditions</Link></li>
              <li><Link to="/refunds" className="text-cream opacity-70 hover:text-gold transition">Refund & Cancellation Policy</Link></li>
            </ul>
          </div>
          
        </div>
        
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-cream opacity-50 text-sm">
            © {new Date().getFullYear()} Utkarsh Lanjewar. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-cream opacity-50 text-sm">
            <span>Prices are in INR (₹)</span>
            <span>•</span>
            <span className="flex items-center gap-1">
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
               Secured by Cashfree
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
