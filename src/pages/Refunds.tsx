import React from 'react';

export default function Refunds() {
  return (
    <div className="container mx-auto px-6 py-12 pt-32 min-h-screen">
      <div className="max-w-4xl mx-auto glass-card p-8 md:p-12 animate-fade-up">
        <h1 className="text-4xl font-playfair text-gold mb-8">Refund & Cancellation Policy</h1>
        
        <div className="space-y-6 text-cream/90 leading-relaxed prose prose-invert max-w-none">
          <p>Last updated: {new Date().toLocaleDateString()}</p>
          
          <h3 className="text-xl font-bold text-white mt-8 mb-4">No Refund Policy for Digital Goods</h3>
          <p>Due to the nature of digital products (PDF notes, study materials, ebooks), <strong>all sales are final and non-refundable</strong>.</p>
          <p>Once a purchase is completed and the digital content is unlocked or downloaded to your profile, it cannot be "returned." Therefore, we do not offer refunds, exchanges, or cancellations for any digital products under any circumstances.</p>

          <h3 className="text-xl font-bold text-white mt-8 mb-4">Exceptions</h3>
          <p>A refund may only be considered in the following exceptional technical scenarios:</p>
          <ul className="list-disc pl-6 space-y-2 text-cream/80">
            <li><strong>Duplicate Payment:</strong> If your card/bank was charged twice for the exact same order due to a technical glitch during the checkout process.</li>
            <li><strong>Non-delivery:</strong> If payment was successfully deducted, but the digital product was not added to your profile within 24 hours, AND our technical team is unable to resolve the issue or manually grant access.</li>
          </ul>

          <h3 className="text-xl font-bold text-white mt-8 mb-4">How to Request Support</h3>
          <p>If you face a duplicate charge or non-delivery issue, please contact us within 3 days of the transaction at <strong>sb108750@gmail.com</strong> with your transaction ID and registered email address. If verified, the duplicate amount will be refunded to the original source of payment within 5-7 business days.</p>

          <h3 className="text-xl font-bold text-white mt-8 mb-4">Cancellations</h3>
          <p>Since access to the digital materials is granted instantly upon successful payment, cancellations are not applicable. If you initiate a chargeback or dispute through your bank for a valid, delivered purchase, your account on our platform will be permanently banned.</p>
        </div>
      </div>
    </div>
  );
}
