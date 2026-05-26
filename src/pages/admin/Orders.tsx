import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { format } from 'date-fns';

export default function Orders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      const { data } = await supabase
        .from('purchases')
        .select(`
          id,
          amount_paid,
          purchased_at,
          razorpay_payment_id,
          profiles ( full_name, email ),
          products ( title )
        `)
        .order('purchased_at', { ascending: false });
        
      if (data) setOrders(data);
      setLoading(false);
    }
    fetchOrders();
  }, []);

  return (
    <div>
      <h2 className="text-3xl font-playfair text-white mb-8">All Orders</h2>
      
      {loading ? (
        <div className="text-white">Loading orders...</div>
      ) : (
        <div className="bg-card-bg border border-white/10 rounded-xl overflow-hidden">
          <table className="w-full text-left text-cream">
            <thead className="bg-black/40 border-b border-white/10">
              <tr>
                <th className="p-4">Date</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Product</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Txn ID</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="p-4 text-sm">{format(new Date(order.purchased_at), 'dd MMM yyyy')}</td>
                  <td className="p-4">
                    <div className="font-bold text-white">{order.profiles?.full_name}</div>
                    <div className="text-xs text-cream/60">{order.profiles?.email}</div>
                  </td>
                  <td className="p-4">{order.products?.title}</td>
                  <td className="p-4 text-green-400 font-bold">₹{order.amount_paid}</td>
                  <td className="p-4 text-xs font-mono text-cream/50">{order.razorpay_payment_id || 'FREE'}</td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-cream/50">No orders found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
