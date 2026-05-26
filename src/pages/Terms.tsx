import React from 'react';

export default function Terms() {
  return (
    <div className="container mx-auto px-6 py-12 pt-32 min-h-screen">
      <div className="max-w-4xl mx-auto glass-card p-8 md:p-12 animate-fade-up">
        <h1 className="text-4xl font-playfair text-gold mb-8">Terms & Conditions</h1>
        
        <div className="space-y-6 text-cream/90 leading-relaxed prose prose-invert max-w-none">
          <p>Last updated: {new Date().toLocaleDateString()}</p>
          
          <p>Welcome to USL Notes. By accessing or using this website, you agree to be bound by these Terms and Conditions. Please read them carefully.</p>

          <h3 className="text-xl font-bold text-white mt-8 mb-4">1. Digital Products</h3>
          <p>All study notes, PDFs, and related materials sold on this website are digital products. Upon successful payment, the products will be added to your profile from where they can be viewed or downloaded.</p>

          <h3 className="text-xl font-bold text-white mt-8 mb-4">2. Intellectual Property & Copyright</h3>
          <p>All content provided on this website, including but not limited to handwritten notes, study guides, and text, is the intellectual property of Utkarsh Lanjewar. You are purchasing a single-user license for personal study use only.</p>
          <ul className="list-disc pl-6 space-y-2 text-cream/80">
            <li>You may not reproduce, distribute, forward, or share these materials with others.</li>
            <li>You may not resell or upload these materials to any public or private platforms.</li>
            <li>Violation of copyright will result in immediate termination of your account without a refund and may invite legal action.</li>
          </ul>

          <h3 className="text-xl font-bold text-white mt-8 mb-4">3. Pricing and Payments</h3>
          <p>All prices are listed in Indian Rupees (INR - ₹). We reserve the right to modify prices at any time. Payments are processed securely via our payment gateway partners (Cashfree/Razorpay).</p>

          <h3 className="text-xl font-bold text-white mt-8 mb-4">4. Account Registration</h3>
          <p>To purchase or claim free materials, you must register using your Google account. You are responsible for maintaining the confidentiality of your account credentials.</p>

          <h3 className="text-xl font-bold text-white mt-8 mb-4">5. Limitation of Liability</h3>
          <p>These study notes are created to assist BAMS students in their academic preparation. However, they are not a substitute for standard textbooks or university lectures. We do not guarantee specific grades or examination outcomes. The materials are provided "as is" without any warranties.</p>
        </div>
      </div>
    </div>
  );
}
