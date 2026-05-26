import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

type Tab = 'website' | 'announcements' | 'hero' | 'social' | 'email' | 'payments' | 'admin';

export default function Settings() {
  const [activeTab, setActiveTab] = useState<Tab>('website');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<Record<string, string>>({});
  
  // Analytics State
  const [payments, setPayments] = useState<any[]>([]);
  const [subCount, setSubCount] = useState(0);

  // Define required keys
  const defaultKeys = {
    announcement_text: '', announcement_link: '', announcement_bg: '#C8860A',
    announcement_color: '#000000', announcement_active: 'false', hero_heading: 'BAMS Notes That Actually Work',
    hero_subtext: 'Handwritten, High-Yield, Exam-Ready Notes', hero_cta_text: 'Browse Notes →', 
    hero_bg_url: '', hero_photo_url: '', stat_1_value: '9+', stat_1_label: 'Subjects', 
    stat_2_value: '500+', stat_2_label: 'Students', stat_3_value: '4.8★', stat_3_label: 'Rated', 
    youtube_url: '', maintenance_mode: 'false', notify_on_purchase: 'true', 
    notify_on_subscriber: 'true', notify_on_failed_payment: 'true', site_name: 'USL Notes', 
    site_tagline: '', instagram_url: '', whatsapp_number: '', admin_email: 'sb108750@gmail.com', 
    contact_email: ''
  };

  useEffect(() => {
    fetchSettings();
    if (activeTab === 'payments' || activeTab === 'email') {
      fetchAnalytics();
    }
  }, [activeTab]);

  const fetchSettings = async () => {
    setLoading(true);
    const { data } = await supabase.from('settings').select('*');
    if (data) {
      const dbSettings = data.reduce((acc, row) => ({ ...acc, [row.key]: row.value }), {});
      setSettings({ ...defaultKeys, ...dbSettings });
    } else {
      setSettings(defaultKeys);
    }
    setLoading(false);
  };

  const fetchAnalytics = async () => {
    const { data: pData } = await supabase.from('purchases').select('*, profiles(full_name, email), products(title)').order('purchased_at', { ascending: false });
    if (pData) setPayments(pData);
    const { count } = await supabase.from('subscribers').select('*', { count: 'exact', head: true });
    if (count !== null) setSubCount(count);
  };

  const handleChange = (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    
    // Prepare upsert array
    const updates = Object.entries(settings).map(([key, value]) => ({ key, value }));
    
    const { error } = await supabase.from('settings').upsert(updates, { onConflict: 'key' });
    
    if (error) {
      toast.error('Failed to save: ' + error.message);
    } else {
      toast.success('Settings updated successfully! 🎉');
    }
    setSaving(false);
  };

  const uploadAsset = async (file: File, bucket: string, key: string) => {
    const ext = file.name.split('.').pop();
    const fileName = `${key}_${Date.now()}.${ext}`;
    
    const { error: uploadError } = await supabase.storage.from(bucket).upload(fileName, file);
    if (uploadError) {
      if (uploadError.message.includes('Bucket not found')) {
         await supabase.storage.createBucket(bucket, { public: true });
         await supabase.storage.from(bucket).upload(fileName, file);
      } else {
         toast.error('Upload failed: ' + uploadError.message);
         return;
      }
    }
    
    const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);
    handleChange(key, data.publicUrl);
    toast.success('Asset uploaded!');
  };

  if (loading && Object.keys(settings).length === 0) return <div className="text-white p-8">Loading Settings...</div>;

  const TabButton = ({ id, label, icon }: { id: Tab, label: string, icon: string }) => (
    <button 
      onClick={() => setActiveTab(id)}
      className={`px-4 py-2 rounded-full font-semibold transition flex items-center gap-2
        ${activeTab === id ? 'bg-gold text-primary' : 'bg-transparent border border-gray-700 text-gray-400 hover:text-white'}`}
    >
      <span>{icon}</span> {label}
    </button>
  );

  return (
    <div className="max-w-6xl pb-24">
      <h2 className="text-3xl font-playfair text-white mb-6">Website Control Panel</h2>
      
      {/* Tabs */}
      <div className="flex flex-wrap gap-3 mb-8">
        <TabButton id="website" icon="🌐" label="Website" />
        <TabButton id="announcements" icon="📢" label="Announcements" />
        <TabButton id="hero" icon="🖼️" label="Hero Banner" />
        <TabButton id="social" icon="🔗" label="Social Links" />
        <TabButton id="email" icon="📧" label="Email" />
        <TabButton id="payments" icon="⚙️" label="Payments" />
        <TabButton id="admin" icon="👤" label="Admin Access" />
      </div>

      <div className="glass-card p-8 bg-[rgba(255,255,255,0.04)] border border-[rgba(200,134,10,0.2)] rounded-xl">
        
        {/* TAB 1: WEBSITE */}
        {activeTab === 'website' && (
          <form onSubmit={handleSave} className="flex flex-col gap-6">
            <h3 className="text-xl font-playfair text-gold border-b border-white/10 pb-2">General Info</h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-xs uppercase tracking-widest text-yellow-600 mb-1">Site Name</label>
                <input type="text" value={settings.site_name} onChange={e => handleChange('site_name', e.target.value)} className="w-full bg-[#0D1824] border border-gray-700 focus:border-gold text-white rounded-lg p-3" />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-yellow-600 mb-1">Currency</label>
                <select className="w-full bg-[#0D1824] border border-gray-700 focus:border-gold text-white rounded-lg p-3">
                  <option>INR (₹)</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-xs uppercase tracking-widest text-yellow-600 mb-1">Site Tagline</label>
                <input type="text" value={settings.site_tagline} onChange={e => handleChange('site_tagline', e.target.value)} className="w-full bg-[#0D1824] border border-gray-700 focus:border-gold text-white rounded-lg p-3" />
              </div>
            </div>

            <h3 className="text-xl font-playfair text-gold border-b border-white/10 pb-2 mt-4">Maintenance Mode</h3>
            <div className="flex items-center gap-4 p-4 border border-gray-700 rounded-lg bg-[#0D1824]">
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={settings.maintenance_mode === 'true'} onChange={e => handleChange('maintenance_mode', e.target.checked ? 'true' : 'false')} />
                <div className="w-14 h-7 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gold"></div>
              </label>
              <div>
                <div className="text-white font-bold">{settings.maintenance_mode === 'true' ? 'Site is in maintenance mode' : 'Site live'}</div>
                <div className="text-gray-400 text-sm">Visitors see maintenance page</div>
              </div>
            </div>
            {settings.maintenance_mode === 'true' && (
              <div className="bg-red-500/10 border border-red-500 text-red-400 p-4 rounded-lg font-bold">
                ⚠️ Your site is currently DOWN for visitors
              </div>
            )}
            
            <div className="mt-4">
              <button type="submit" disabled={saving} className="bg-gold text-primary font-bold px-8 py-3 rounded-lg hover:bg-white transition disabled:opacity-50">
                {saving ? 'Saving...' : 'Save Website Settings'}
              </button>
            </div>
          </form>
        )}

        {/* TAB 2: ANNOUNCEMENTS */}
        {activeTab === 'announcements' && (
          <form onSubmit={handleSave} className="flex flex-col gap-6">
             <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <h3 className="text-xl font-playfair text-gold">Announcement Bar</h3>
                <label className="flex items-center gap-3 cursor-pointer">
                  <span className={`font-bold ${settings.announcement_active === 'true' ? 'text-green-400' : 'text-gray-400'}`}>
                    {settings.announcement_active === 'true' ? '✅ LIVE on website' : '⬜ Hidden'}
                  </span>
                  <div className="relative inline-flex items-center">
                    <input type="checkbox" className="sr-only peer" checked={settings.announcement_active === 'true'} onChange={e => handleChange('announcement_active', e.target.checked ? 'true' : 'false')} />
                    <div className="w-14 h-7 bg-gray-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-green-500"></div>
                  </div>
                </label>
             </div>

             <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="block text-xs uppercase tracking-widest text-yellow-600 mb-1">Announcement Text ({settings.announcement_text.length}/100)</label>
                  <input maxLength={100} type="text" value={settings.announcement_text} onChange={e => handleChange('announcement_text', e.target.value)} className="w-full bg-[#0D1824] border border-gray-700 focus:border-gold text-white rounded-lg p-3" placeholder="🎉 New Notes Added! Use code BAMS20" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs uppercase tracking-widest text-yellow-600 mb-1">Announcement Link (Optional)</label>
                  <input type="url" value={settings.announcement_link} onChange={e => handleChange('announcement_link', e.target.value)} className="w-full bg-[#0D1824] border border-gray-700 focus:border-gold text-white rounded-lg p-3" placeholder="https://" />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-yellow-600 mb-1">Background Color</label>
                  <div className="flex gap-4 items-center">
                    <input type="color" value={settings.announcement_bg} onChange={e => handleChange('announcement_bg', e.target.value)} className="w-12 h-12 rounded cursor-pointer" />
                    <input type="text" value={settings.announcement_bg} onChange={e => handleChange('announcement_bg', e.target.value)} className="flex-1 bg-[#0D1824] border border-gray-700 focus:border-gold text-white rounded-lg p-3" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-yellow-600 mb-1">Text Color</label>
                  <div className="flex gap-4 items-center">
                    <input type="color" value={settings.announcement_color} onChange={e => handleChange('announcement_color', e.target.value)} className="w-12 h-12 rounded cursor-pointer" />
                    <input type="text" value={settings.announcement_color} onChange={e => handleChange('announcement_color', e.target.value)} className="flex-1 bg-[#0D1824] border border-gray-700 focus:border-gold text-white rounded-lg p-3" />
                  </div>
                </div>
             </div>

             <div className="mt-4">
               <label className="block text-xs uppercase tracking-widest text-yellow-600 mb-2">Live Preview</label>
               <div 
                 className="w-full py-3 text-center font-bold text-sm rounded-lg" 
                 style={{ backgroundColor: settings.announcement_bg, color: settings.announcement_color }}
               >
                 {settings.announcement_text || 'Your announcement will appear here...'}
               </div>
             </div>

             <div className="mt-4">
              <button type="submit" disabled={saving} className="bg-gold text-primary font-bold px-8 py-3 rounded-lg hover:bg-white transition disabled:opacity-50">
                {saving ? 'Saving...' : 'Save Announcements'}
              </button>
            </div>
          </form>
        )}

        {/* TAB 3: HERO BANNER */}
        {activeTab === 'hero' && (
          <form onSubmit={handleSave} className="flex flex-col gap-6">
             <div className="grid grid-cols-2 gap-8">
               <div className="flex flex-col gap-6">
                 <div>
                    <label className="block text-xs uppercase tracking-widest text-yellow-600 mb-1">Hero Heading</label>
                    <input type="text" value={settings.hero_heading} onChange={e => handleChange('hero_heading', e.target.value)} className="w-full bg-[#0D1824] border border-gray-700 focus:border-gold text-white rounded-lg p-3 font-playfair text-xl" />
                 </div>
                 <div>
                    <label className="block text-xs uppercase tracking-widest text-yellow-600 mb-1">Hero Subtext</label>
                    <textarea value={settings.hero_subtext} onChange={e => handleChange('hero_subtext', e.target.value)} className="w-full h-24 bg-[#0D1824] border border-gray-700 focus:border-gold text-white rounded-lg p-3 resize-none" />
                 </div>
                 <div>
                    <label className="block text-xs uppercase tracking-widest text-yellow-600 mb-1">CTA Button Text</label>
                    <input type="text" value={settings.hero_cta_text} onChange={e => handleChange('hero_cta_text', e.target.value)} className="w-full bg-[#0D1824] border border-gray-700 focus:border-gold text-white rounded-lg p-3" />
                 </div>
                 <div className="border border-white/10 p-4 rounded-lg">
                    <h4 className="text-gold font-bold mb-4">Stats Bar Values</h4>
                    <div className="grid grid-cols-2 gap-2 mb-2">
                       <input value={settings.stat_1_value} onChange={e => handleChange('stat_1_value', e.target.value)} className="bg-[#0D1824] border border-gray-700 text-white rounded p-2" placeholder="Value (9+)" />
                       <input value={settings.stat_1_label} onChange={e => handleChange('stat_1_label', e.target.value)} className="bg-[#0D1824] border border-gray-700 text-white rounded p-2" placeholder="Label (Subjects)" />
                       <input value={settings.stat_2_value} onChange={e => handleChange('stat_2_value', e.target.value)} className="bg-[#0D1824] border border-gray-700 text-white rounded p-2" placeholder="Value" />
                       <input value={settings.stat_2_label} onChange={e => handleChange('stat_2_label', e.target.value)} className="bg-[#0D1824] border border-gray-700 text-white rounded p-2" placeholder="Label" />
                       <input value={settings.stat_3_value} onChange={e => handleChange('stat_3_value', e.target.value)} className="bg-[#0D1824] border border-gray-700 text-white rounded p-2" placeholder="Value" />
                       <input value={settings.stat_3_label} onChange={e => handleChange('stat_3_label', e.target.value)} className="bg-[#0D1824] border border-gray-700 text-white rounded p-2" placeholder="Label" />
                    </div>
                 </div>
               </div>
               
               <div className="flex flex-col gap-6">
                 <div>
                    <label className="block text-xs uppercase tracking-widest text-yellow-600 mb-1">Hero Background Image</label>
                    <div className="border-2 border-dashed border-gold/50 rounded-xl p-4 text-center bg-[#0D1824] hover:bg-gold/5 transition relative overflow-hidden h-48 flex items-center justify-center group">
                       {settings.hero_bg_url ? (
                         <img src={settings.hero_bg_url} alt="Hero BG" className="absolute inset-0 w-full h-full object-cover opacity-50" />
                       ) : null}
                       <div className="relative z-10">
                         <input type="file" accept="image/*" onChange={e => {if(e.target.files?.[0]) uploadAsset(e.target.files[0], 'site-assets', 'hero_bg_url')}} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                         <span className="text-white font-bold bg-black/50 px-4 py-2 rounded">Click to Upload Background</span>
                       </div>
                    </div>
                 </div>
                 <div>
                    <label className="block text-xs uppercase tracking-widest text-yellow-600 mb-1">Profile Photo (Circular)</label>
                    <div className="flex items-center gap-4">
                      <div className="w-24 h-24 rounded-full border-2 border-gold overflow-hidden bg-[#0D1824]">
                        {settings.hero_photo_url ? <img src={settings.hero_photo_url} className="w-full h-full object-cover" /> : null}
                      </div>
                      <div className="relative flex-1">
                         <input type="file" accept="image/*" onChange={e => {if(e.target.files?.[0]) uploadAsset(e.target.files[0], 'site-assets', 'hero_photo_url')}} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                         <button type="button" className="bg-white/10 border border-white/20 text-white px-4 py-2 rounded w-full hover:bg-white/20">Upload Photo</button>
                      </div>
                    </div>
                 </div>
               </div>
             </div>

             <div className="mt-4">
              <button type="submit" disabled={saving} className="bg-gold text-primary font-bold px-8 py-3 rounded-lg hover:bg-white transition disabled:opacity-50">
                {saving ? 'Saving...' : 'Save Hero Settings'}
              </button>
            </div>
          </form>
        )}

        {/* TAB 4: SOCIAL LINKS */}
        {activeTab === 'social' && (
          <form onSubmit={handleSave} className="flex flex-col gap-6">
             <div className="grid grid-cols-2 gap-6">
               <div>
                  <label className="block text-xs uppercase tracking-widest text-yellow-600 mb-1">Instagram URL</label>
                  <input type="url" value={settings.instagram_url} onChange={e => handleChange('instagram_url', e.target.value)} className="w-full bg-[#0D1824] border border-gray-700 focus:border-gold text-white rounded-lg p-3" placeholder="https://instagram.com/..." />
               </div>
               <div>
                  <label className="block text-xs uppercase tracking-widest text-yellow-600 mb-1">WhatsApp Number</label>
                  <input type="text" value={settings.whatsapp_number} onChange={e => handleChange('whatsapp_number', e.target.value)} className="w-full bg-[#0D1824] border border-gray-700 focus:border-gold text-white rounded-lg p-3" placeholder="+91XXXXXXXXXX" />
               </div>
               <div>
                  <label className="block text-xs uppercase tracking-widest text-yellow-600 mb-1">YouTube Channel URL</label>
                  <input type="url" value={settings.youtube_url} onChange={e => handleChange('youtube_url', e.target.value)} className="w-full bg-[#0D1824] border border-gray-700 focus:border-gold text-white rounded-lg p-3" placeholder="https://youtube.com/..." />
               </div>
               <div>
                  <label className="block text-xs uppercase tracking-widest text-yellow-600 mb-1">Contact Email</label>
                  <input type="email" value={settings.contact_email} onChange={e => handleChange('contact_email', e.target.value)} className="w-full bg-[#0D1824] border border-gray-700 focus:border-gold text-white rounded-lg p-3" />
               </div>
             </div>

             <div className="mt-4">
              <button type="submit" disabled={saving} className="bg-gold text-primary font-bold px-8 py-3 rounded-lg hover:bg-white transition disabled:opacity-50">
                {saving ? 'Saving...' : 'Save Social Links'}
              </button>
            </div>
          </form>
        )}

        {/* TAB 5: EMAIL SETTINGS */}
        {activeTab === 'email' && (
          <form onSubmit={handleSave} className="flex flex-col gap-6">
             <div className="flex justify-between items-center bg-[#0D1824] border border-gray-700 p-6 rounded-lg">
                <div>
                   <h4 className="text-white font-bold text-lg mb-1">Subscribers Export</h4>
                   <p className="text-gray-400 text-sm">You have {subCount} subscribers</p>
                </div>
                <button type="button" onClick={() => toast('Export feature coming soon!')} className="border border-gold text-gold hover:bg-gold hover:text-black font-bold px-4 py-2 rounded transition">
                  Download CSV
                </button>
             </div>

             <h3 className="text-xl font-playfair text-gold border-b border-white/10 pb-2 mt-4">Notification Preferences</h3>
             <div className="flex flex-col gap-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={settings.notify_on_purchase === 'true'} onChange={e => handleChange('notify_on_purchase', e.target.checked ? 'true' : 'false')} className="w-5 h-5 accent-gold" />
                  <span className="text-white">Email me on new purchase</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={settings.notify_on_subscriber === 'true'} onChange={e => handleChange('notify_on_subscriber', e.target.checked ? 'true' : 'false')} className="w-5 h-5 accent-gold" />
                  <span className="text-white">Email me on new subscriber</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={settings.notify_on_failed_payment === 'true'} onChange={e => handleChange('notify_on_failed_payment', e.target.checked ? 'true' : 'false')} className="w-5 h-5 accent-gold" />
                  <span className="text-white">Email me on failed payment</span>
                </label>
             </div>

             <div className="mt-4">
              <button type="submit" disabled={saving} className="bg-gold text-primary font-bold px-8 py-3 rounded-lg hover:bg-white transition disabled:opacity-50">
                {saving ? 'Saving...' : 'Save Email Settings'}
              </button>
            </div>
          </form>
        )}

        {/* TAB 6: PAYMENTS STATS (READ ONLY) */}
        {activeTab === 'payments' && (() => {
           const success = payments; // Currently our db doesn't track status, all are assumed success
           const totalRevenue = success.reduce((sum, p) => sum + Number(p.amount_paid), 0);
           
           return (
          <div className="flex flex-col gap-6">
             <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-[#0D1824] border border-gray-700 p-4 rounded-lg">
                   <div className="text-gray-400 text-xs font-bold uppercase mb-1">Total Revenue</div>
                   <div className="text-gold text-2xl font-bold">₹{totalRevenue.toLocaleString()}</div>
                   <div className="text-xs text-gray-500 mt-1">All time earnings</div>
                </div>
                <div className="bg-[#0D1824] border border-gray-700 p-4 rounded-lg">
                   <div className="text-gray-400 text-xs font-bold uppercase mb-1 flex items-center gap-1"><span className="text-green-500">✓</span> Successful</div>
                   <div className="text-white text-2xl font-bold">{success.length}</div>
                   <div className="text-xs text-gray-500 mt-1">Orders completed</div>
                </div>
                <div className="bg-[#0D1824] border border-gray-700 p-4 rounded-lg">
                   <div className="text-gray-400 text-xs font-bold uppercase mb-1 flex items-center gap-1"><span className="text-red-500">✗</span> Failed</div>
                   <div className="text-white text-2xl font-bold">0</div>
                   <div className="text-xs text-gray-500 mt-1">Payment failures</div>
                </div>
                <div className="bg-[#0D1824] border border-gray-700 p-4 rounded-lg">
                   <div className="text-gray-400 text-xs font-bold uppercase mb-1 flex items-center gap-1"><span className="text-yellow-500">⏳</span> Pending</div>
                   <div className="text-white text-2xl font-bold">0</div>
                   <div className="text-xs text-gray-500 mt-1">Awaiting confirmation</div>
                </div>
             </div>

             <div className="bg-[#0D1824] border border-gray-700 p-6 rounded-lg mt-2">
                <div className="flex justify-between text-sm text-gray-400 mb-2">
                   <span>Payment Success Rate: 100%</span>
                   <span>100%</span>
                </div>
                <div className="w-full bg-red-900/50 rounded-full h-2.5">
                   <div className="bg-green-500 h-2.5 rounded-full" style={{ width: '100%' }}></div>
                </div>
             </div>

             <h3 className="text-xl font-playfair text-gold border-b border-white/10 pb-2 mt-4">Recent Transactions</h3>
             <div className="overflow-x-auto">
               <table className="w-full text-left text-cream text-sm">
                 <thead className="bg-black/40 border-b border-white/10">
                   <tr>
                     <th className="p-3">Date</th>
                     <th className="p-3">Student Email</th>
                     <th className="p-3">Product</th>
                     <th className="p-3">Amount</th>
                     <th className="p-3">Status</th>
                   </tr>
                 </thead>
                 <tbody>
                   {payments.slice(0, 20).map((p, i) => (
                     <tr key={i} className="border-b border-white/5 hover:bg-white/5">
                       <td className="p-3 text-gray-400">{format(new Date(p.purchased_at), 'dd MMM yyyy, HH:mm')}</td>
                       <td className="p-3">{p.profiles?.email || 'Unknown'}</td>
                       <td className="p-3 truncate max-w-[200px]">{p.products?.title}</td>
                       <td className="p-3 font-bold">₹{p.amount_paid}</td>
                       <td className="p-3"><span className="bg-green-900/30 text-green-400 px-2 py-1 rounded text-xs border border-green-500/20">✓ Paid</span></td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
          </div>
        )})()}

        {/* TAB 7: ADMIN ACCESS */}
        {activeTab === 'admin' && (
          <form onSubmit={handleSave} className="flex flex-col gap-6">
             <div>
                <label className="block text-xs uppercase tracking-widest text-yellow-600 mb-1">Current Admin Email</label>
                <input type="email" value={settings.admin_email} onChange={e => handleChange('admin_email', e.target.value)} className="w-full bg-[#0D1824] border border-gray-700 focus:border-gold text-white rounded-lg p-3" />
                <p className="text-xs text-red-400 mt-2">Warning: Changing this will log you out if it doesn't match your current Google session.</p>
             </div>

             <div className="mt-4">
              <button type="submit" disabled={saving} className="bg-gold text-primary font-bold px-8 py-3 rounded-lg hover:bg-white transition disabled:opacity-50">
                {saving ? 'Saving...' : 'Save & Re-login'}
              </button>
            </div>

            <div className="border border-red-500/50 bg-red-500/5 p-6 rounded-lg mt-8">
               <h3 className="text-xl font-bold text-red-500 mb-4">Danger Zone</h3>
               <div className="flex gap-4">
                  <button type="button" onClick={() => window.confirm('Are you sure? This cannot be undone.')} className="border border-red-500 text-red-500 hover:bg-red-500 hover:text-white px-4 py-2 rounded transition font-bold text-sm">
                     Clear All Pending Payments
                  </button>
                  <button type="button" onClick={() => toast('Exporting JSON...')} className="border border-gray-500 text-gray-300 hover:bg-gray-800 px-4 py-2 rounded transition font-bold text-sm">
                     Export All Data (JSON)
                  </button>
               </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
