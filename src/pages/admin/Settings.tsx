import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

export default function Settings() {
  const [adminEmail, setAdminEmail] = useState('');
  const [tagline, setTagline] = useState('');
  const [instagram, setInstagram] = useState('');
  const [youtube, setYoutube] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchSettings() {
      const { data } = await supabase.from('settings').select('*').eq('id', 1).single();
      if (data) {
        setAdminEmail(data.admin_email || '');
        setTagline(data.tagline || '');
        setInstagram(data.instagram_url || '');
        setYoutube(data.youtube_url || '');
        setLinkedin(data.linkedin_url || '');
      }
      setLoading(false);
    }
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    const { error } = await supabase
      .from('settings')
      .upsert({
        id: 1,
        admin_email: adminEmail,
        tagline,
        instagram_url: instagram,
        youtube_url: youtube,
        linkedin_url: linkedin
      });
      
    if (error) {
      toast.error('Failed to save settings: ' + error.message);
    } else {
      toast.success('Settings updated successfully! 🎉');
    }
    setSaving(false);
  };

  if (loading) return <div className="text-white">Loading Settings...</div>;

  return (
    <div className="max-w-3xl">
      <h2 className="text-3xl font-playfair text-white mb-8">Website Settings</h2>
      
      <form onSubmit={handleSave} className="glass-card p-8 flex flex-col gap-6">
        <div>
          <label className="block text-cream mb-2 font-bold">Admin Email (Has Full Access)</label>
          <input 
            type="email" 
            value={adminEmail} 
            onChange={e => setAdminEmail(e.target.value)} 
            className="w-full bg-primary border border-white/20 rounded p-3 text-white focus:border-gold outline-none" 
            required
          />
          <p className="text-xs text-cream/50 mt-1">Changing this will lock you out if you don't use the new email to login.</p>
        </div>

        <div>
          <label className="block text-cream mb-2 font-bold">Website Tagline</label>
          <input 
            type="text" 
            value={tagline} 
            onChange={e => setTagline(e.target.value)} 
            className="w-full bg-primary border border-white/20 rounded p-3 text-white focus:border-gold outline-none" 
            placeholder="e.g. BAMS Notes That Actually Work"
          />
        </div>

        <div className="border-t border-white/10 pt-6 mt-2">
          <h3 className="text-xl font-playfair text-gold mb-4">Social Links</h3>
          
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-cream mb-2">Instagram URL</label>
              <input 
                type="url" 
                value={instagram} 
                onChange={e => setInstagram(e.target.value)} 
                className="w-full bg-primary border border-white/20 rounded p-3 text-white focus:border-gold outline-none" 
              />
            </div>
            <div>
              <label className="block text-cream mb-2">YouTube URL</label>
              <input 
                type="url" 
                value={youtube} 
                onChange={e => setYoutube(e.target.value)} 
                className="w-full bg-primary border border-white/20 rounded p-3 text-white focus:border-gold outline-none" 
              />
            </div>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={saving}
          className="mt-6 bg-gold text-primary font-bold py-3 rounded-lg hover:bg-white transition disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </form>
    </div>
  );
}
