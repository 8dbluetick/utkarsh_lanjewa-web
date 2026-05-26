import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { format } from 'date-fns';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalSubscribers: 0
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      // Get Revenue & Orders
      const { data: purchases } = await supabase.from('purchases').select('amount_paid, purchased_at, profiles(full_name), products(title)').order('purchased_at', { ascending: false });
      
      let rev = 0;
      if (purchases) {
        rev = purchases.reduce((sum, p) => sum + Number(p.amount_paid), 0);
        setRecentOrders(purchases.slice(0, 5));
      }

      // Count Products
      const { count: prodCount } = await supabase.from('products').select('*', { count: 'exact', head: true });
      
      // Count Subscribers
      const { count: subCount } = await supabase.from('subscribers').select('*', { count: 'exact', head: true });

      setStats({
        totalRevenue: rev,
        totalOrders: purchases?.length || 0,
        totalProducts: prodCount || 0,
        totalSubscribers: subCount || 0
      });
      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading) return <div className="text-white">Loading Dashboard...</div>;

  return (
    <div>
      <h2 className="text-3xl font-playfair text-white mb-8">Admin Dashboard</h2>
      
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <div className="glass-card p-6 border-l-4 border-gold">
          <p className="text-cream/70 text-sm font-bold uppercase tracking-wider mb-2">Total Revenue</p>
          <p className="text-3xl font-bold text-white">₹{stats.totalRevenue.toLocaleString()}</p>
        </div>
        <div className="glass-card p-6 border-l-4 border-blue-400">
          <p className="text-cream/70 text-sm font-bold uppercase tracking-wider mb-2">Total Orders</p>
          <p className="text-3xl font-bold text-white">{stats.totalOrders}</p>
        </div>
        <div className="glass-card p-6 border-l-4 border-green-400">
          <p className="text-cream/70 text-sm font-bold uppercase tracking-wider mb-2">Active Products</p>
          <p className="text-3xl font-bold text-white">{stats.totalProducts}</p>
        </div>
        <div className="glass-card p-6 border-l-4 border-purple-400">
          <p className="text-cream/70 text-sm font-bold uppercase tracking-wider mb-2">Subscribers</p>
          <p className="text-3xl font-bold text-white">{stats.totalSubscribers}</p>
        </div>
      </div>

      {/* Recent Orders */}
      <div>
        <h3 className="text-2xl font-playfair text-white mb-6">Recent Transactions</h3>
        <div className="bg-card-bg border border-white/10 rounded-xl overflow-hidden">
          <table className="w-full text-left text-cream">
            <thead className="bg-black/40 border-b border-white/10">
              <tr>
                <th className="p-4">Customer</th>
                <th className="p-4">Product</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Date</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order, i) => (
                <tr key={i} className="border-b border-white/5 hover:bg-white/5">
                  <td className="p-4 font-bold">{order.profiles?.full_name || 'Unknown User'}</td>
                  <td className="p-4">{order.products?.title || 'Unknown Product'}</td>
                  <td className="p-4 text-green-400 font-bold">₹{order.amount_paid}</td>
                  <td className="p-4 text-sm text-cream/70">{format(new Date(order.purchased_at), 'dd MMM yyyy, HH:mm')}</td>
                </tr>
              ))}
              {recentOrders.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-cream/50">No orders yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
