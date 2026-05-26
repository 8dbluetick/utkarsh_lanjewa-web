import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { loadCashfreeScript } from '../lib/cashfree';
import toast from 'react-hot-toast';

export default function Checkout() {
  const { cart, getTotal, getTotalMRP, getTotalDiscount, clearCart, appliedCoupon, applyCoupon, removeCoupon, getCouponDiscount, getFinalTotal } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [couponCode, setCouponCode] = useState('');

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
    toast.loading('Verifying prices...', { id: 'price_check' });

    // ✅ Always fetch LIVE prices from DB to prevent stale cart cache issues
    const productIds = cart.map(item => item.id);
    const { data: liveProducts, error: priceError } = await supabase
      .from('products')
      .select('id, price, is_free')
      .in('id', productIds);

    if (priceError || !liveProducts) {
      toast.error('Failed to verify prices. Please try again.', { id: 'price_check' });
      setIsProcessing(false);
      return;
    }

    // Calculate the REAL total using live DB prices
    const liveTotal = liveProducts.reduce((acc, p) => acc + (p.is_free ? 0 : p.price), 0);
    toast.dismiss('price_check');

    const finalTotal = liveTotal;

    // If the total is 0 (all items are free), bypass Cashfree
    if (finalTotal === 0) {
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

    // Cashfree Flow

    const isLoaded = await loadCashfreeScript();
    if (!isLoaded) {
      toast.error('Failed to load Cashfree SDK');
      setIsProcessing(false);
      return;
    }

    try {
      toast.loading('Initializing secure payment...', { id: 'payment' });
      
      // 1. Call our Edge Function to get the payment_session_id
      const { data: edgeData, error: edgeError } = await supabase.functions.invoke('create-cashfree-order', {
        body: { 
          amount: finalTotal,
          customer_id: user.id,
          customer_email: user.email,
          customer_phone: '9999999999', // Replace with actual if available
          return_url: window.location.origin + "/profile?order_id={order_id}"
        }
      });

      if (edgeError || !edgeData?.payment_session_id) {
        throw new Error(edgeData?.error || 'Failed to create Cashfree session');
      }

      const { payment_session_id, order_id } = edgeData;

      toast.dismiss('payment');

      // 2. Initialize Cashfree
      const cashfree = (window as any).Cashfree({
        mode: "production", // Live Mode
      });

      // ✅ Save cart to localStorage BEFORE opening Cashfree
      // This is needed in case Cashfree redirects the user (UPI/NetBanking)
      const pendingOrder = {
        order_id,
        user_id: user.id,
        products: cart.map(item => ({ id: item.id, price: item.is_free ? 0 : item.price }))
      };
      localStorage.setItem('pending_cashfree_order', JSON.stringify(pendingOrder));

      // 3. Open Checkout
      cashfree.checkout({
        paymentSessionId: payment_session_id,
        returnUrl: window.location.origin + "/profile?order_id=" + order_id,
      }).then(async (result: any) => {
        if (result.error) {
          toast.error('Payment failed: ' + result.error.message);
          setIsProcessing(false);
          return;
        }
        if (result.redirect) {
          // If Cashfree redirects (like for UPI apps), handle it gracefully
          return;
        }
        if (result.paymentDetails) {
           toast.loading('Verifying payment...', { id: 'payment_verify' });
           
           // Update coupon usage if applied
           if (appliedCoupon) {
             await supabase
               .from('coupons')
               .update({ current_uses: 0 }) // Note: This will be incremented on backend
               .eq('code', appliedCoupon.code);
           }
           
           // Insert a record for each item in the cart
           const inserts = cart.map(item => ({
             user_id: user.id,
             product_id: item.id,
             amount_paid: item.is_free ? 0 : item.price,
             status: 'completed',
             razorpay_payment_id: payment_session_id, // Store session ID for reference
             coupon_code: appliedCoupon?.code || null
           }));

           const { error } = await supabase.from('purchases').insert(inserts);

           if (error) {
             toast.error('Payment successful, but failed to record purchase. Please contact support.', { id: 'payment_verify' });
           } else {
             toast.success('Payment successful! 🎉', { id: 'payment_verify' });
             clearCart();
             navigate('/profile');
           }
           setIsProcessing(false);
        }
      });

    } catch (error: any) {
      toast.error('Error starting payment: ' + error.message, { id: 'payment' });
      setIsProcessing(false);
    }
  };

  const handleApplyCoupon = async () => {
    const success = await applyCoupon(couponCode);
    if (success) {
      setCouponCode('');
    }
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
             
             {/* Coupon Section */}
             <div className="mb-6 p-4 bg-primary/50 rounded-lg border border-gold/20">
               {appliedCoupon ? (
                 <div className="flex items-center justify-between mb-3">
                   <span className="text-green-400 font-bold">✓ Coupon Applied: {appliedCoupon.code}</span>
                   <button
                     onClick={removeCoupon}
                     className="text-xs text-red-400 hover:text-red-300 font-bold"
                   >
                     Remove
                   </button>
                 </div>
               ) : (
                 <div className="flex gap-2">
                   <input
                     type="text"
                     value={couponCode}
                     onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                     onKeyPress={(e) => e.key === 'Enter' && handleApplyCoupon()}
                     placeholder="Enter coupon code..."
                     className="flex-1 bg-black/50 border border-white/20 text-white px-3 py-2 rounded text-sm placeholder-gray-500 focus:outline-none focus:border-gold"
                   />
                   <button
                     onClick={handleApplyCoupon}
                     className="bg-gold hover:bg-yellow-500 text-primary font-bold px-4 py-2 rounded text-sm transition"
                   >
                     Apply
                   </button>
                 </div>
               )}
             </div>
             
             <div className="space-y-4 mb-6">
               <div className="flex justify-between text-cream">
                 <span>Subtotal (MRP)</span>
                 <span className="line-through text-gray-500">₹{getTotalMRP()}</span>
               </div>
               {getTotalDiscount() > 0 && (
                 <div className="flex justify-between text-cream">
                   <span>Discount</span>
                   <span className="text-green-400">- ₹{getTotalDiscount()}</span>
                 </div>
               )}
               <div className="flex justify-between text-cream">
                 <span>Subtotal</span>
                 <span>₹{getTotal()}</span>
               </div>
               {appliedCoupon && getCouponDiscount() > 0 && (
                 <div className="flex justify-between text-cream">
                   <span>Coupon Discount ({appliedCoupon.discount_percentage}%)</span>
                   <span className="text-green-400 font-bold">- ₹{getCouponDiscount()}</span>
                 </div>
               )}
               <div className="flex justify-between text-xl font-bold text-white pt-4 border-t border-white/10">
                 <span>Total Amount</span>
                 <span className="text-gold font-playfair">₹{getFinalTotal()}</span>
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
               {isProcessing ? 'Processing...' : `Pay ₹${getFinalTotal()} Securely`}
             </button>

             <div className="mt-4 flex items-center justify-center gap-2 text-sm text-cream opacity-60">
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
               Secured by Cashfree Payments
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}
