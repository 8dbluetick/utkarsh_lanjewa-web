import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { format } from 'date-fns';

export default function Orders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      try {
        // Fetch all purchases with their related data
        const { data, error } = await supabase
          .from('purchases')
          .select(`
            id,
            amount_paid,
            purchased_at,
            razorpay_payment_id,
            status,
            coupon_code
          `)
          .order('purchased_at', { ascending: false });
          
        if (error) {
          console.error('Error fetching orders:', error);
          setOrders([]);
          setLoading(false);
          return;
        }

        if (data && data.length > 0) {
          // Fetch profile and product details separately for better reliability
          const enrichedOrders = await Promise.all(
            data.map(async (order) => {
              // Fetch user profile
              const { data: profileData } = await supabase
                .from('profiles')
                .select('full_name, email')
                .eq('id', order.user_id)
                .single();

              // Fetch product info
              const { data: productData } = await supabase
                .from('products')
                .select('title')
                .eq('id', order.product_id)
                .single();

              return {
                ...order,
                profiles: profileData || { full_name: 'Unknown User', email: 'N/A' },
                products: productData || { title: 'Unknown Product' }
              };
            })
          );
          
          setOrders(enrichedOrders);
        } else {
          setOrders([]);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Unexpected error fetching orders:', err);
        setOrders([]);
        setLoading(false);
      }
    }
    fetchOrders();
  }, []);

  return (
    <div>
      <h2 className="text-3xl font-playfair text-white mb-8">All Orders</h2>
      
      {loading ? (
        <div className="text-white flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold"></div>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-card-bg border border-white/10 rounded-xl p-8 text-center">
          <p className="text-cream/50">No orders yet. When customers make purchases, they will appear here.</p>
        </div>
      ) : (
        <div className="bg-card-bg border border-white/10 rounded-xl overflow-hidden">
          <table className="w-full text-left text-cream">
            <thead className="bg-black/40 border-b border-white/10">
              <tr>
                <th className="p-4">Date</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Product</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Coupon</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="p-4 text-sm">{format(new Date(order.purchased_at), 'dd MMM yyyy, HH:mm')}</td>
                  <td className="p-4">
                    <div className="font-bold text-white">{order.profiles?.full_name || 'Unknown'}</div>
                    <div className="text-xs text-cream/60">{order.profiles?.email || 'N/A'}</div>
                  </td>
                  <td className="p-4">{order.products?.title || 'Unknown Product'}</td>
                  <td className="p-4 text-green-400 font-bold">₹{order.amount_paid}</td>
                  <td className="p-4 text-xs">
                    {order.coupon_code ? (
                      <span className="bg-gold/20 text-gold px-2 py-1 rounded font-bold">{order.coupon_code}</span>
                    ) : (
                      <span className="text-cream/40">—</span>
                    )}
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded text-sm font-bold ${
                      order.status === 'completed' 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {order.status || 'completed'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
