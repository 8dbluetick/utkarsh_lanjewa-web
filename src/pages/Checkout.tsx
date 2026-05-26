import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { loadRazorpayScript } from '../lib/razorpay';
import toast from 'react-hot-toast';

export default function Checkout() {
  const { cart, getTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

  // If cart is empty, redirect back to cart
  if (cart.length === 0) {
    return <Navigate to="/cart" replace />;
  }

  const handlePayment = async () => {
    if (!user) {
      toast.error('Please login to continue');
      navigate('/login');
      return;
    }

    setIsProcessing(true);
    const total = getTotal();

    // If the total is 0 (all items are free), bypass Razorpay
    if (total === 0) {
      const inserts = cart.map(item => ({
        user_id: user.id,
        product_id: item.id,
        amount_paid: 0,
        status: 'completed',
        razorpay_payment_id: 'FREE_CART'
      }));

      const { error } = await supabase.from('purchases').insert(inserts);
      
      if (error) {
        toast.error('Failed to process free order');
      } else {
        toast.success('Successfully added to your profile! 🎉');
        clearCart();
        navigate('/profile');
      }
      setIsProcessing(false);
      return;
    }

    // Razorpay Flow
    const isLoaded = await loadRazorpayScript();
    if (!isLoaded) {
      toast.error('Failed to load Razorpay SDK');
      setIsProcessing(false);
      return;
    }

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: total * 100, // paise
      currency: "INR",
      name: "USL Notes",
      description: `Purchase of ${cart.length} study notes`,
      handler: async function (response: any) {
        toast.loading('Verifying payment...', { id: 'payment' });
        
        // Insert a record for each item in the cart
        const inserts = cart.map(item => ({
          user_id: user.id,
          product_id: item.id,
          amount_paid: item.is_free ? 0 : item.price,
          status: 'completed',
          razorpay_payment_id: response.razorpay_payment_id
        }));

        const { error } = await supabase.from('purchases').insert(inserts);

        if (error) {
          toast.error('Payment successful, but failed to record purchase. Please contact support.', { id: 'payment' });
        } else {
          toast.success('Payment successful! 🎉', { id: 'payment' });
          clearCart();
          navigate('/profile');
        }
        setIsProcessing(false);
      },
      prefill: {
        email: user.email,
      },
      theme: {
        color: "#C8860A"
      },
      modal: {
        ondismiss: function() {
          setIsProcessing(false);
        }
      }
    };

    const rzp = new (window as any).Razorpay(options);
    rzp.on('payment.failed', function (response: any) {
      toast.error('Payment failed: ' + response.error.description);
      setIsProcessing(false);
    });
    rzp.open();
  };

  return (
    <div className="container mx-auto px-6 py-12 pt-24 min-h-screen">
      <h1 className="text-4xl md:text-5xl font-playfair text-white mb-10 text-center animate-fade-up">
        Checkout
      </h1>

      <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-12">
        
        {/* Review Items */}
        <div className="md:w-2/3 animate-fade-in delay-100">
          <h2 className="text-2xl font-playfair text-white mb-6">Review Items</h2>
          <div className="glass-card rounded-xl overflow-hidden divide-y divide-white/10">
            {cart.map(item => (
              <div key={item.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                   <div className="w-16 h-16 bg-gray-900 rounded overflow-hidden shrink-0">
                     {item.banner_url ? (
                        <img src={item.banner_url} alt="" className="w-full h-full object-cover" />
                     ) : (
                        <div className="w-full h-full text-[10px] text-gray-500 flex items-center justify-center p-1 text-center">No Image</div>
                     )}
                   </div>
                   <span className="text-white font-medium line-clamp-1">{item.title}</span>
                </div>
                <span className="text-gold font-bold shrink-0">
                  {item.is_free ? 'FREE' : `₹${item.price}`}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Summary */}
        <div className="md:w-1/3 animate-fade-up delay-200">
          <div className="glass-card p-6 sticky top-24">
             <h2 className="text-xl font-playfair text-white mb-6 border-b border-white/10 pb-4">Payment Summary</h2>
             
             <div className="space-y-4 mb-6">
               <div className="flex justify-between text-cream">
                 <span>Subtotal</span>
                 <span>₹{getTotal()}</span>
               </div>
               <div className="flex justify-between text-cream">
                 <span>Taxes</span>
                 <span>Included</span>
               </div>
               <div className="flex justify-between text-xl font-bold text-white pt-4 border-t border-white/10">
                 <span>Total</span>
                 <span className="text-gold font-playfair">₹{getTotal()}</span>
               </div>
             </div>

             <button
               onClick={handlePayment}
               disabled={isProcessing}
               className={`w-full py-4 rounded-xl font-bold transition-all ${
                 isProcessing 
                   ? 'bg-gray-600 text-gray-300 cursor-not-allowed' 
                   : 'bg-gold hover:bg-yellow-500 text-primary shadow-[0_0_15px_rgba(200,134,10,0.3)]'
               }`}
             >
               {isProcessing ? 'Processing...' : `Pay ₹${getTotal()} Securely`}
             </button>

             <div className="mt-4 flex items-center justify-center gap-2 text-sm text-cream opacity-60">
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
               Secured by Razorpay
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}
