import React, { createContext, useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';

export type CartItem = {
  id: string;
  title: string;
  price: number;
  original_price?: number;
  banner_url?: string;
  is_free: boolean;
};

type CartContextType = {
  cart: CartItem[];
  addToCart: (product: any) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  getTotal: () => number;
  getTotalMRP: () => number;
  getTotalDiscount: () => number;
  isInCart: (productId: string) => boolean;
};

const CartContext = createContext<CartContextType>({
  cart: [],
  addToCart: () => {},
  removeFromCart: () => {},
  clearCart: () => {},
  getTotal: () => 0,
  getTotalMRP: () => 0,
  getTotalDiscount: () => 0,
  isInCart: () => false,
});

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  // Load from local storage on init
  useEffect(() => {
    const savedCart = localStorage.getItem('usl_cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error('Failed to parse cart data');
      }
    }
  }, []);

  // Save to local storage on change
  useEffect(() => {
    localStorage.setItem('usl_cart', JSON.stringify(cart));
  }, [cart]);

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

  const isInCart = (productId: string) => {
    return cart.some(item => item.id === productId);
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, getTotal, getTotalMRP, getTotalDiscount, isInCart }}>
      {children}
    </CartContext.Provider>
  );
};
