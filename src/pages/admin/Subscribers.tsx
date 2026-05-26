import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function Subscribers() {
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSubscribers() {
      const { data } = await supabase
        .from('subscribers')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (data) setSubscribers(data);
      setLoading(false);
    }
    fetchSubscribers();
  }, []);

  const handleCopyEmails = () => {
    const emails = subscribers.map(s => s.email).join(', ');
    navigator.clipboard.writeText(emails);
    toast.success('All emails copied to clipboard!');
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-playfair text-white">Subscribers</h2>
        <button onClick={handleCopyEmails} className="bg-gold text-primary px-4 py-2 rounded font-bold hover:bg-white transition">
          Copy All Emails
        </button>
      </div>
      
      {loading ? (
        <div className="text-white">Loading subscribers...</div>
      ) : (
        <div className="bg-card-bg border border-white/10 rounded-xl overflow-hidden">
          <table className="w-full text-left text-cream">
            <thead className="bg-black/40 border-b border-white/10">
              <tr>
                <th className="p-4">Email</th>
                <th className="p-4">Source</th>
                <th className="p-4">Subscribed On</th>
              </tr>
            </thead>
            <tbody>
              {subscribers.map(sub => (
                <tr key={sub.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="p-4 font-bold text-white">{sub.email}</td>
                  <td className="p-4 text-sm text-cream/70 capitalize">{sub.source}</td>
                  <td className="p-4 text-sm">{format(new Date(sub.created_at), 'dd MMM yyyy')}</td>
                </tr>
              ))}
              {subscribers.length === 0 && (
                <tr>
                  <td colSpan={3} className="p-8 text-center text-cream/50">No subscribers yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
