import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

export type CartItem = {
  id: string;
  title: string;
  price: number;
  original_price?: number;
  banner_url?: string;
  is_free: boolean;
};

export type AppliedCoupon = {
  code: string;
  discount_percentage: number;
};

type CartContextType = {
  cart: CartItem[];
  appliedCoupon: AppliedCoupon | null;
  addToCart: (product: any) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  getTotal: () => number;
  getTotalMRP: () => number;
  getTotalDiscount: () => number;
  isInCart: (productId: string) => boolean;
  applyCoupon: (code: string) => Promise<boolean>;
  removeCoupon: () => void;
  getCouponDiscount: () => number;
  getFinalTotal: () => number;
};

const CartContext = createContext<CartContextType>({
  cart: [],
  appliedCoupon: null,
  addToCart: () => {},
  removeFromCart: () => {},
  clearCart: () => {},
  getTotal: () => 0,
  getTotalMRP: () => 0,
  getTotalDiscount: () => 0,
  isInCart: () => false,
  applyCoupon: async () => false,
  removeCoupon: () => {},
  getCouponDiscount: () => 0,
  getFinalTotal: () => 0,
});

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);

  // Load from local storage on init
  useEffect(() => {
    const savedCart = localStorage.getItem('usl_cart');
    const savedCoupon = localStorage.getItem('usl_coupon');
    
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error('Failed to parse cart data');
      }
    }
    
    if (savedCoupon) {
      try {
        setAppliedCoupon(JSON.parse(savedCoupon));
      } catch (e) {
        console.error('Failed to parse coupon data');
      }
    }
  }, []);

  // Save to local storage on change
  useEffect(() => {
    localStorage.setItem('usl_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    if (appliedCoupon) {
      localStorage.setItem('usl_coupon', JSON.stringify(appliedCoupon));
    } else {
      localStorage.removeItem('usl_coupon');
    }
  }, [appliedCoupon]);

  const addToCart = (product: any) => {
    if (cart.find(item => item.id === product.id)) {
      toast('Item is already in your cart!', { icon: '⚠️' });
      return;
    }
    
    const newItem: CartItem = {
      id: product.id,
      title: product.title,
      price: product.price,
      original_price: product.original_price,
      banner_url: product.banner_url,
      is_free: product.is_free,
    };
    
    setCart(prev => [...prev, newItem]);
    toast.success('Added to Cart! 🛒');
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.id !== productId));
    toast.success('Removed from Cart');
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
  };

  const getTotal = () => {
    return cart.reduce((total, item) => total + (item.is_free ? 0 : item.price), 0);
  };

  const getTotalMRP = () => {
    return cart.reduce((total, item) => {
       const mrp = item.original_price || item.price;
       return total + (item.is_free ? 0 : mrp);
    }, 0);
  };

  const getTotalDiscount = () => {
    return getTotalMRP() - getTotal();
  };

  const getCouponDiscount = () => {
    if (!appliedCoupon) return 0;
    return Math.round((getTotal() * appliedCoupon.discount_percentage) / 100);
  };

  const getFinalTotal = () => {
    return Math.max(0, getTotal() - getCouponDiscount());
  };

  const isInCart = (productId: string) => {
    return cart.some(item => item.id === productId);
  };

  const applyCoupon = async (code: string): Promise<boolean> => {
    if (!code.trim()) {
      toast.error('Please enter a coupon code');
      return false;
    }

    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', code.toUpperCase().trim())
        .eq('is_active', true)
        .single();

      if (error || !data) {
        toast.error('Invalid coupon code');
        return false;
      }

      // Check expiry
      if (new Date(data.expiry_date) < new Date()) {
        toast.error('This coupon has expired');
        return false;
      }

      // Check max uses
      if (data.max_uses && data.current_uses >= data.max_uses) {
        toast.error('This coupon has reached its usage limit');
        return false;
      }

      setAppliedCoupon({
        code: data.code,
        discount_percentage: data.discount_percentage
      });

      toast.success(`🎉 Coupon applied! ${data.discount_percentage}% OFF`);
      return true;
    } catch (err: any) {
      toast.error('Error applying coupon');
      console.error(err);
      return false;
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    toast.success('Coupon removed');
  };

  return (
    <CartContext.Provider value={{ 
      cart, 
      appliedCoupon,
      addToCart, 
      removeFromCart, 
      clearCart, 
      getTotal, 
      getTotalMRP, 
      getTotalDiscount, 
      isInCart,
      applyCoupon,
      removeCoupon,
      getCouponDiscount,
      getFinalTotal
    }}>
      {children}
    </CartContext.Provider>
  );
};
