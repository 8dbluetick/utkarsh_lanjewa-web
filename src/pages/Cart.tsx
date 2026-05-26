import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

export default function Cart() {
  const { cart, removeFromCart, getTotal, getTotalMRP, getTotalDiscount, appliedCoupon, applyCoupon, removeCoupon } = useCart();
  const navigate = useNavigate();
  const [couponCode, setCouponCode] = useState('');
  const [isApplying, setIsApplying] = useState(false);

  const handleApplyCoupon = async () => {
    setIsApplying(true);
    const { success, message } = await applyCoupon(couponCode);
    if (success) {
      toast.success(message);
      setCouponCode('');
    } else {
      toast.error(message);
    }
    setIsApplying(false);
  };

  return (
    <div className="container mx-auto px-6 py-12 pt-24 min-h-screen">
      <h1 className="text-4xl md:text-5xl font-playfair text-white mb-10 text-center animate-fade-up">
        Your Cart
      </h1>

      {cart.length === 0 ? (
        <div className="text-center animate-fade-in delay-100 mt-20">
          <div className="text-6xl mb-6">🛒</div>
          <h2 className="text-2xl font-playfair text-white mb-4">Your cart is empty</h2>
          <p className="text-cream opacity-70 mb-8">Looks like you haven't added any study notes yet.</p>
          <Link to="/shop" className="bg-gold text-primary font-bold px-8 py-3 rounded-full hover:bg-white transition">
            Browse Notes
          </Link>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Cart Items List */}
          <div className="lg:w-2/3 flex flex-col gap-6 animate-fade-up delay-100">
            {cart.map((item, index) => (
              <div key={item.id} className="glass-card flex items-center p-4 gap-6 group hover:border-gold/50 transition">
                <div className="w-24 h-24 md:w-32 md:h-32 shrink-0 bg-gray-900 rounded overflow-hidden">
                  {item.banner_url ? (
                    <img src={item.banner_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs text-center p-2">No Image</div>
                  )}
                </div>
                
                <div className="flex-1">
                  <h3 className="text-xl font-playfair text-white mb-2 line-clamp-2">{item.title}</h3>
                  <div className="text-gold font-bold text-lg mb-4">
                    {item.is_free ? 'FREE' : `₹${item.price}`}
                  </div>
                  <button 
                    onClick={() => removeFromCart(item.id)}
                    className="text-red-400 hover:text-red-300 text-sm font-semibold transition flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:w-1/3 animate-fade-up delay-200">
            <div className="glass-card p-6 sticky top-24">
              <h3 className="text-2xl font-playfair text-white mb-6 border-b border-white/10 pb-4">Order Summary</h3>
              
              <div className="flex justify-between mb-4 text-cream">
                <span>Items ({cart.length}):</span>
                <span className="line-through text-gray-500">₹{getTotalMRP()}</span>
              </div>
              
              <div className="flex justify-between mb-4 text-cream">
                <span>Product Discount:</span>
                <span className="text-green-400">- ₹{getTotalDiscount()}</span>
              </div>

              {/* Coupon Section */}
              <div className="py-4 border-t border-b border-white/10 mb-4">
                {appliedCoupon ? (
                  <div className="flex items-center justify-between bg-green-500/10 border border-green-500/20 p-3 rounded-lg">
                    <div>
                      <span className="text-green-400 font-bold block">Coupon Applied!</span>
                      <span className="text-sm text-green-400/80">{appliedCoupon.code}</span>
                    </div>
                    <button onClick={removeCoupon} className="text-red-400 text-sm hover:underline">Remove</button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Enter Coupon Code" 
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      className="flex-1 bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-gold"
                    />
                    <button 
                      onClick={handleApplyCoupon}
                      disabled={isApplying || !couponCode}
                      className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition disabled:opacity-50"
                    >
                      {isApplying ? '...' : 'Apply'}
                    </button>
                  </div>
                )}
              </div>
              
              <div className="flex justify-between items-end mb-8 pt-4">
                <span className="text-xl text-white font-bold">Total:</span>
                <span className="text-3xl font-playfair text-gold font-bold">₹{getTotal()}</span>
              </div>
              
              <button 
                onClick={() => navigate('/checkout')}
                className="w-full bg-gold hover:bg-yellow-500 text-primary font-bold py-4 rounded-xl transition-colors shadow-[0_0_15px_rgba(200,134,10,0.3)] text-lg"
              >
                Proceed to Checkout
              </button>
              
              <p className="text-xs text-cream opacity-50 mt-4 text-center">
                Secure checkout. 100% money back guarantee.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
