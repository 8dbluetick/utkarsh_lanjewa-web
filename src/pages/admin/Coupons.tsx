import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

interface Coupon {
  id: string;
  code: string;
  discount_percentage: number;
  max_uses: number | null;
  current_uses: number;
  expiry_date: string;
  is_active: boolean;
  created_at: string;
}

export default function Coupons() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentCoupon, setCurrentCoupon] = useState<Coupon | null>(null);
  const [showForm, setShowForm] = useState(false);

  // Form State
  const [code, setCode] = useState('');
  const [discountPercentage, setDiscountPercentage] = useState('');
  const [maxUses, setMaxUses] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      toast.error('Failed to fetch coupons');
      console.error(error);
    } else if (data) {
      setCoupons(data);
    }
    setLoading(false);
  };

  const resetForm = () => {
    setCode('');
    setDiscountPercentage('');
    setMaxUses('');
    setExpiryDate('');
    setIsActive(true);
    setCurrentCoupon(null);
    setIsEditing(false);
    setShowForm(false);
  };

  const handleEdit = (coupon: Coupon) => {
    setCurrentCoupon(coupon);
    setCode(coupon.code);
    setDiscountPercentage(coupon.discount_percentage.toString());
    setMaxUses(coupon.max_uses?.toString() || '');
    setExpiryDate(coupon.expiry_date);
    setIsActive(coupon.is_active);
    setIsEditing(true);
    setShowForm(true);
  };

  const handleCreateNew = () => {
    resetForm();
    setShowForm(true);
  };

  const validateForm = () => {
    if (!code.trim()) {
      toast.error('Coupon code is required');
      return false;
    }
    if (!discountPercentage || parseFloat(discountPercentage) <= 0 || parseFloat(discountPercentage) > 100) {
      toast.error('Discount must be between 1-100%');
      return false;
    }
    if (!expiryDate) {
      toast.error('Expiry date is required');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    const couponData = {
      code: code.toUpperCase().trim(),
      discount_percentage: parseFloat(discountPercentage),
      max_uses: maxUses ? parseInt(maxUses) : null,
      expiry_date: expiryDate,
      is_active: isActive
    };

    try {
      if (isEditing && currentCoupon) {
        const { error } = await supabase
          .from('coupons')
          .update(couponData)
          .eq('id', currentCoupon.id);
        
        if (error) throw error;
        toast.success('Coupon updated successfully');
      } else {
        const { error } = await supabase
          .from('coupons')
          .insert([couponData]);
        
        if (error) throw error;
        toast.success('Coupon created successfully');
      }
      
      resetForm();
      await fetchCoupons();
    } catch (err: any) {
      toast.error(err.message || 'Error saving coupon');
    }
  };

  const handleDelete = async (couponId: string) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return;

    try {
      const { error } = await supabase
        .from('coupons')
        .delete()
        .eq('id', couponId);
      
      if (error) throw error;
      toast.success('Coupon deleted successfully');
      await fetchCoupons();
    } catch (err: any) {
      toast.error(err.message || 'Error deleting coupon');
    }
  };

  const toggleActive = async (coupon: Coupon) => {
    try {
      const { error } = await supabase
        .from('coupons')
        .update({ is_active: !coupon.is_active })
        .eq('id', coupon.id);
      
      if (error) throw error;
      toast.success(coupon.is_active ? 'Coupon deactivated' : 'Coupon activated');
      await fetchCoupons();
    } catch (err: any) {
      toast.error(err.message || 'Error updating coupon');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-playfair text-white">Coupon Codes</h2>
        {!showForm && (
          <button
            onClick={handleCreateNew}
            className="bg-gold hover:bg-yellow-500 text-primary font-bold px-6 py-2 rounded-lg transition"
          >
            + New Coupon
          </button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <div className="glass-card p-8 mb-8 border border-gold/30">
          <h3 className="text-xl font-playfair text-gold mb-6">
            {isEditing ? 'Edit Coupon' : 'Create New Coupon'}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-cream font-bold mb-2">Coupon Code</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g., SUMMER50"
                className="w-full bg-primary/50 border border-white/20 text-white rounded-lg px-4 py-3 placeholder-gray-500 focus:outline-none focus:border-gold"
              />
            </div>

            <div>
              <label className="block text-cream font-bold mb-2">Discount (%)</label>
              <input
                type="number"
                min="1"
                max="100"
                value={discountPercentage}
                onChange={(e) => setDiscountPercentage(e.target.value)}
                placeholder="e.g., 50"
                className="w-full bg-primary/50 border border-white/20 text-white rounded-lg px-4 py-3 placeholder-gray-500 focus:outline-none focus:border-gold"
              />
            </div>

            <div>
              <label className="block text-cream font-bold mb-2">Max Uses (Leave empty for unlimited)</label>
              <input
                type="number"
                min="0"
                value={maxUses}
                onChange={(e) => setMaxUses(e.target.value)}
                placeholder="e.g., 50"
                className="w-full bg-primary/50 border border-white/20 text-white rounded-lg px-4 py-3 placeholder-gray-500 focus:outline-none focus:border-gold"
              />
            </div>

            <div>
              <label className="block text-cream font-bold mb-2">Expiry Date</label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full bg-primary/50 border border-white/20 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-gold"
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-5 h-5 rounded"
              />
              <span className="text-cream font-bold">Active</span>
            </label>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleSave}
              className="flex-1 bg-gold hover:bg-yellow-500 text-primary font-bold px-6 py-3 rounded-lg transition"
            >
              {isEditing ? 'Update Coupon' : 'Create Coupon'}
            </button>
            <button
              onClick={resetForm}
              className="flex-1 border border-white/20 text-cream hover:bg-white/10 font-bold px-6 py-3 rounded-lg transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Coupons Table */}
      {loading ? (
        <div className="text-white text-center py-12">Loading coupons...</div>
      ) : (
        <div className="bg-card-bg border border-white/10 rounded-xl overflow-hidden">
          <table className="w-full text-left text-cream">
            <thead className="bg-black/40 border-b border-white/10">
              <tr>
                <th className="p-4">Code</th>
                <th className="p-4">Discount</th>
                <th className="p-4">Uses</th>
                <th className="p-4">Expiry</th>
                <th className="p-4">Status</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((coupon) => (
                <tr key={coupon.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="p-4 font-bold text-gold">{coupon.code}</td>
                  <td className="p-4 font-bold text-green-400">{coupon.discount_percentage}% OFF</td>
                  <td className="p-4 text-sm">
                    {coupon.current_uses}
                    {coupon.max_uses && ` / ${coupon.max_uses}`}
                  </td>
                  <td className="p-4 text-sm">
                    {format(new Date(coupon.expiry_date), 'dd MMM yyyy')}
                    {new Date(coupon.expiry_date) < new Date() && (
                      <span className="ml-2 text-red-400 font-bold">(Expired)</span>
                    )}
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded text-sm font-bold ${
                      coupon.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {coupon.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="p-4 text-sm flex gap-2">
                    <button
                      onClick={() => toggleActive(coupon)}
                      className="text-blue-400 hover:text-blue-300 font-bold"
                    >
                      {coupon.is_active ? 'Disable' : 'Enable'}
                    </button>
                    <button
                      onClick={() => handleEdit(coupon)}
                      className="text-yellow-400 hover:text-yellow-300 font-bold"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(coupon.id)}
                      className="text-red-400 hover:text-red-300 font-bold"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {coupons.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-cream/50">
                    No coupons yet. Create one to get started!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
