import React from 'react';

export default function Contact() {
  return (
    <div className="container mx-auto px-6 py-12 pt-32 min-h-screen">
      <div className="max-w-3xl mx-auto glass-card p-8 md:p-12 animate-fade-up">
        <h1 className="text-4xl md:text-5xl font-playfair text-gold mb-8">Contact Us</h1>
        
        <div className="space-y-6 text-cream/90 leading-relaxed">
          <p>
            If you have any questions about our study materials, need technical support, or have payment-related inquiries, we are here to help!
          </p>

          <div className="bg-primary/50 p-6 rounded-lg border border-white/10 mt-8 space-y-4">
            <div className="flex items-start gap-4">
               <div className="text-gold text-2xl mt-1">✉️</div>
               <div>
                 <h3 className="text-white font-bold mb-1">Email Support</h3>
                 <p>Drop us an email at: <a href="mailto:sb108750@gmail.com" className="text-gold hover:underline">sb108750@gmail.com</a></p>
                 <p className="text-sm opacity-70 mt-1">We aim to respond to all queries within 24-48 hours.</p>
               </div>
            </div>

            <div className="flex items-start gap-4">
               <div className="text-gold text-2xl mt-1">📍</div>
               <div>
                 <h3 className="text-white font-bold mb-1">Operating Address</h3>
                 <p>Utkarsh Lanjewar<br/>Maharashtra, India</p>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
