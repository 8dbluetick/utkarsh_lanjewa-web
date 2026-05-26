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

export type Coupon = {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  product_id?: string;
};

type CartContextType = {
  cart: CartItem[];
  appliedCoupon: Coupon | null;
  addToCart: (product: any) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  getTotal: () => number;
  getTotalMRP: () => number;
  getTotalDiscount: () => number;
  isInCart: (productId: string) => boolean;
  applyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
  removeCoupon: () => void;
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
  applyCoupon: async () => ({ success: false, message: '' }),
  removeCoupon: () => {}
});

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(() => {
    const savedCoupon = localStorage.getItem('appliedCoupon');
    return savedCoupon ? JSON.parse(savedCoupon) : null;
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    if (appliedCoupon) {
      localStorage.setItem('appliedCoupon', JSON.stringify(appliedCoupon));
    } else {
      localStorage.removeItem('appliedCoupon');
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
  };

  const getTotal = () => {
    let total = cart.reduce((acc, item) => acc + (item.is_free ? 0 : item.price), 0);
    
    // Apply coupon discount if valid
    if (appliedCoupon) {
      // Check if coupon is for a specific product
      if (appliedCoupon.product_id) {
        const targetItem = cart.find(item => item.id === appliedCoupon.product_id);
        if (targetItem && !targetItem.is_free) {
           let discount = 0;
           if (appliedCoupon.discount_type === 'percentage') {
             discount = (targetItem.price * appliedCoupon.discount_value) / 100;
           } else {
             discount = appliedCoupon.discount_value;
           }
           total -= discount;
        }
      } else {
        // Apply to whole cart
        let discount = 0;
        if (appliedCoupon.discount_type === 'percentage') {
          discount = (total * appliedCoupon.discount_value) / 100;
        } else {
          discount = appliedCoupon.discount_value;
        }
        total -= discount;
      }
    }
    
    return Math.max(0, Math.round(total)); // Ensure it doesn't go below 0
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

  const isInCart = (productId: string) => {
    return cart.some(item => item.id === productId);
  };

  const applyCoupon = async (code: string) => {
    if (!code) return { success: false, message: 'Please enter a code' };
    
    // Fetch coupon from DB
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('active', true)
      .single();
      
    if (error || !data) {
      return { success: false, message: 'Invalid or inactive coupon code' };
    }

    // Check if it applies to a specific product that is NOT in the cart
    if (data.product_id) {
      if (!cart.some(item => item.id === data.product_id)) {
        return { success: false, message: 'This coupon is not valid for the items in your cart.' };
      }
    }

    setAppliedCoupon(data);
    return { success: true, message: 'Coupon applied successfully!' };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  return (
    <CartContext.Provider value={{ cart, appliedCoupon, addToCart, removeFromCart, clearCart, getTotal, getTotalMRP, getTotalDiscount, isInCart, applyCoupon, removeCoupon }}>
      {children}
    </CartContext.Provider>
  );
};
