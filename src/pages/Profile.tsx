import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function Profile() {
  const { profile, signOut } = useAuth();
  const [purchases, setPurchases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPurchases() {
      if (!profile) return;
      const { data, error } = await supabase
        .from('purchases')
        .select(`
          *,
          products (*)
        `)
        .eq('user_id', profile.id)
        .eq('status', 'completed')
        .order('purchased_at', { ascending: false });
        
      if (!error && data) {
        setPurchases(data);
      }
      setLoading(false);
    }
    fetchPurchases();
  }, [profile]);

  const handleDownload = async (fileUrl: string) => {
    try {
      const { data, error } = await supabase.storage.from('ebooks').createSignedUrl(fileUrl, 3600);
      if (error) throw error;
      if (data?.signedUrl) {
        window.open(data.signedUrl, '_blank');
      }
    } catch (err: any) {
      toast.error('Failed to download: ' + err.message);
    }
  };

  if (!profile) return null;

  return (
    <div className="container mx-auto px-6 py-12 pt-24 min-h-screen">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Sidebar */}
        <div className="md:w-1/4">
          <div className="glass-card p-6 text-center">
            <img 
              src={profile.avatar_url || `https://ui-avatars.com/api/?name=${profile.full_name}&background=C8860A&color=fff`} 
              alt="Avatar" 
              className="w-24 h-24 rounded-full mx-auto mb-4 border-2 border-gold"
            />
            <h2 className="text-xl font-bold text-white mb-1">{profile.full_name}</h2>
            <p className="text-sm text-cream/70 mb-4">{profile.email}</p>
            <p className="text-xs text-cream/50 mb-6">Member since {format(new Date(profile.created_at), 'MMM yyyy')}</p>
            
            {profile.email === 'sb108750@gmail.com' && (
              <Link to="/admin/products" className="block w-full bg-gold text-primary font-bold px-4 py-2 rounded mb-3 hover:bg-white transition">
                Go to Admin Panel
              </Link>
            )}

            <button 
              onClick={signOut}
              className="w-full border border-maroon text-maroon hover:bg-maroon hover:text-white px-4 py-2 rounded transition"
            >
              Log Out
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="md:w-3/4">
          <div className="glass-card p-8 min-h-[400px]">
            <h2 className="text-2xl font-playfair text-gold mb-6 border-b border-white/10 pb-4">My Purchases</h2>
            
            {loading ? (
               <div className="flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gold"></div></div>
            ) : purchases.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-cream/60 mb-4">You haven't bought any notes yet.</p>
                <Link to="/shop" className="text-gold font-bold hover:underline">Browse Shop →</Link>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {purchases.map(purchase => (
                  <div key={purchase.id} className="bg-primary/50 border border-white/5 rounded-lg p-4 flex flex-col sm:flex-row items-center gap-6">
                    <div className="w-16 h-16 bg-gray-900 rounded overflow-hidden shrink-0 hidden sm:block">
                      {purchase.products.banner_url && <img src={purchase.products.banner_url} className="w-full h-full object-cover" alt="banner" />}
                    </div>
                    <div className="flex-1 text-center sm:text-left">
                      <h3 className="font-bold text-white mb-1">{purchase.products.title}</h3>
                      <p className="text-xs text-cream/60">Purchased on {format(new Date(purchase.purchased_at), 'dd MMM yyyy')}</p>
                    </div>
                    <div className="font-bold text-gold">₹{purchase.amount_paid}</div>
                    <button 
                      onClick={() => handleDownload(purchase.products.file_url)}
                      disabled={!purchase.products.file_url}
                      className="bg-gold text-primary font-bold px-6 py-2 rounded hover:bg-white transition disabled:opacity-50"
                    >
                      Download
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
