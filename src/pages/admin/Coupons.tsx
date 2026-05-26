import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

export default function Coupons() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newCoupon, setNewCoupon] = useState({
    code: '',
    discount_type: 'percentage',
    discount_value: '',
    product_id: '',
    active: true
  });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    // Fetch coupons
    const { data: couponsData } = await supabase
      .from('coupons')
      .select(`*, products(title)`)
      .order('created_at', { ascending: false });
    
    if (couponsData) setCoupons(couponsData);

    // Fetch products for dropdown
    const { data: productsData } = await supabase
      .from('products')
      .select('id, title')
      .eq('is_free', false);
      
    if (productsData) setProducts(productsData);
    setLoading(false);
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCoupon.code || !newCoupon.discount_value) {
      toast.error('Please fill all required fields');
      return;
    }

    const payload: any = {
      code: newCoupon.code.toUpperCase(),
      discount_type: newCoupon.discount_type,
      discount_value: parseFloat(newCoupon.discount_value),
      active: newCoupon.active
    };

    if (newCoupon.product_id) {
      payload.product_id = newCoupon.product_id;
    }

    const { error } = await supabase.from('coupons').insert([payload]);

    if (error) {
      toast.error('Failed to create coupon: ' + error.message);
    } else {
      toast.success('Coupon created successfully!');
      setNewCoupon({ code: '', discount_type: 'percentage', discount_value: '', product_id: '', active: true });
      setIsCreating(false);
      fetchData();
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('coupons')
      .update({ active: !currentStatus })
      .eq('id', id);
      
    if (error) {
      toast.error('Failed to update status');
    } else {
      toast.success(currentStatus ? 'Coupon disabled' : 'Coupon activated');
      fetchData();
    }
  };

  const deleteCoupon = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this coupon?')) return;
    const { error } = await supabase.from('coupons').delete().eq('id', id);
    if (error) toast.error('Failed to delete coupon');
    else {
      toast.success('Coupon deleted');
      fetchData();
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-playfair text-white">Manage Coupons</h2>
        <button 
          onClick={() => setIsCreating(!isCreating)}
          className="bg-gold text-primary font-bold px-6 py-2 rounded hover:bg-yellow-500 transition"
        >
          {isCreating ? 'Cancel' : 'Create New Coupon'}
        </button>
      </div>

      {isCreating && (
        <form onSubmit={handleCreate} className="bg-card-bg border border-white/10 p-6 rounded-xl mb-8 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm text-cream/70 mb-2">Coupon Code</label>
              <input
                type="text"
                required
                value={newCoupon.code}
                onChange={e => setNewCoupon({...newCoupon, code: e.target.value.toUpperCase()})}
                className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white"
                placeholder="e.g. DIWALI50"
              />
            </div>
            
            <div>
              <label className="block text-sm text-cream/70 mb-2">Discount Type</label>
              <select
                value={newCoupon.discount_type}
                onChange={e => setNewCoupon({...newCoupon, discount_type: e.target.value})}
                className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (₹)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-cream/70 mb-2">Discount Value</label>
              <input
                type="number"
                required
                min="1"
                step="0.01"
                value={newCoupon.discount_value}
                onChange={e => setNewCoupon({...newCoupon, discount_value: e.target.value})}
                className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white"
                placeholder={newCoupon.discount_type === 'percentage' ? 'e.g. 10 for 10%' : 'e.g. 50 for ₹50'}
              />
            </div>

            <div>
              <label className="block text-sm text-cream/70 mb-2">Target Product (Optional)</label>
              <select
                value={newCoupon.product_id}
                onChange={e => setNewCoupon({...newCoupon, product_id: e.target.value})}
                className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white"
              >
                <option value="">Apply to Entire Cart</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </select>
            </div>
          </div>
          <button type="submit" className="bg-gold text-primary font-bold px-8 py-3 rounded-lg hover:bg-yellow-500 transition w-full">
            Save Coupon
          </button>
        </form>
      )}

      {loading ? (
        <div className="text-white">Loading coupons...</div>
      ) : (
        <div className="bg-card-bg border border-white/10 rounded-xl overflow-hidden">
          <table className="w-full text-left text-cream">
            <thead className="bg-black/40 border-b border-white/10">
              <tr>
                <th className="p-4">Code</th>
                <th className="p-4">Discount</th>
                <th className="p-4">Target</th>
                <th className="p-4">Status</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map(coupon => (
                <tr key={coupon.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="p-4 font-bold text-white">{coupon.code}</td>
                  <td className="p-4 text-green-400 font-bold">
                    {coupon.discount_type === 'percentage' ? `${coupon.discount_value}%` : `₹${coupon.discount_value}`}
                  </td>
                  <td className="p-4 text-sm">
                    {coupon.product_id ? coupon.products?.title : 'Entire Cart'}
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${coupon.active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                      {coupon.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="p-4 space-x-4">
                    <button 
                      onClick={() => toggleActive(coupon.id, coupon.active)}
                      className="text-sm text-gold hover:underline"
                    >
                      {coupon.active ? 'Disable' : 'Enable'}
                    </button>
                    <button 
                      onClick={() => deleteCoupon(coupon.id)}
                      className="text-sm text-red-400 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {coupons.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-cream/50">No coupons found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
