import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

export default function Home() {
  const [email, setEmail] = useState('');
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({});

  useEffect(() => {
    async function fetchFeatured() {
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('is_published', true)
        .eq('is_featured', true)
        .limit(3);
      if (data) setFeaturedProducts(data);
    }
    async function fetchSettings() {
      const { data } = await supabase.from('settings').select('*');
      if (data) {
        const s = data.reduce((acc, row) => ({ ...acc, [row.key]: row.value }), {});
        setSettings(s);
      }
    }
    fetchFeatured();
    fetchSettings();
  }, []);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('subscribers').insert([{ email, source: 'website' }]);
      if (error) throw error;
      toast.success('Subscribed successfully! 🎉');
      setEmail('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to subscribe');
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative w-full bg-primary overflow-hidden pt-24 pb-16">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: settings.hero_bg_url ? `url(${settings.hero_bg_url})` : `url('https://www.transparenttextures.com/patterns/diagonal-stripes.png')`,
          backgroundSize: settings.hero_bg_url ? 'cover' : 'auto',
          backgroundPosition: 'center'
        }}></div>
        <div className="container mx-auto px-6 relative z-10 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-5xl md:text-6xl font-bold font-playfair mb-6 text-transparent bg-clip-text gold-gradient">
              {settings.hero_heading || 'BAMS Notes That Actually Work'}
            </h1>
            <p className="text-lg md:text-xl text-cream mb-8 opacity-90 max-w-2xl whitespace-pre-line">
              {settings.hero_subtext || 'Handwritten, High-Yield, Exam-Ready Notes by Utkarsh S Lanjewar — 2nd Year BAMS.'}
            </p>
            <Link to="/shop" className="inline-block bg-gold text-primary font-bold px-8 py-4 rounded-full hover:scale-105 transition-transform shadow-[0_0_15px_rgba(200,134,10,0.5)]">
              {settings.hero_cta_text || 'Browse Notes →'}
            </Link>
          </div>
          <div className="flex-1 flex justify-center">
            <div className="w-64 h-64 md:w-80 md:h-80 rounded-full border-4 border-gold overflow-hidden relative shadow-[0_0_30px_rgba(200,134,10,0.3)]">
              <img src={settings.hero_photo_url || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400'} alt="Utkarsh" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-card-bg border-y border-[rgba(200,134,10,0.2)] py-8">
        <div className="container mx-auto px-6 flex flex-wrap justify-around gap-8 text-center">
          <div>
            <div className="text-3xl font-bold text-gold font-playfair">{settings.stat_1_value || '9+'}</div>
            <div className="text-cream opacity-80 text-sm tracking-wider uppercase mt-1">{settings.stat_1_label || 'Subjects'}</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-gold font-playfair">{settings.stat_2_value || '500+'}</div>
            <div className="text-cream opacity-80 text-sm tracking-wider uppercase mt-1">{settings.stat_2_label || 'Students'}</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-gold font-playfair">{settings.stat_3_value || '4.8★'}</div>
            <div className="text-cream opacity-80 text-sm tracking-wider uppercase mt-1">{settings.stat_3_label || 'Rated'}</div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 container mx-auto px-6">
        <div className="flex justify-between items-end mb-10">
          <h2 className="text-4xl font-playfair text-white">Most Popular Notes</h2>
          <Link to="/shop" className="text-gold hover:underline">View All →</Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featuredProducts.map((product) => (
            <div key={product.id} className="glass-card hover:border-gold transition-colors duration-300 overflow-hidden flex flex-col group">
              <div className="h-48 w-full relative overflow-hidden bg-gray-900">
                {product.banner_url ? (
                  <img src={product.banner_url} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500">No Image</div>
                )}
                {product.original_price && (
                  <div className="absolute top-2 right-2 bg-maroon text-white text-xs font-bold px-2 py-1 rounded">
                    {Math.round(((product.original_price - product.price) / product.original_price) * 100)}% OFF
                  </div>
                )}
              </div>
              <div className="p-6 flex flex-col flex-1">
                <span className="text-xs font-bold tracking-wider text-gold uppercase mb-2 block">{product.subject}</span>
                <h3 className="text-xl font-playfair text-white mb-2">{product.title}</h3>
                <div className="mt-auto flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-2xl font-bold text-gold">₹{product.price}</span>
                    {product.original_price && <span className="text-sm text-gray-500 line-through">₹{product.original_price}</span>}
                  </div>
                  <Link to={`/product/${product.id}`} className="bg-white/10 hover:bg-gold hover:text-primary text-white px-4 py-2 rounded-lg transition-colors text-sm font-semibold">
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
          {featuredProducts.length === 0 && (
            <div className="col-span-3 text-center py-12 text-cream opacity-60">No featured products found.</div>
          )}
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 bg-card-bg">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 order-2 md:order-1 text-center md:text-left">
            <h2 className="text-4xl font-playfair text-white mb-6">Hi, I'm Utkarsh 👋</h2>
            <p className="text-lg text-cream opacity-90 mb-8 leading-relaxed max-w-2xl mx-auto md:mx-0">
              A 2nd Year BAMS student passionate about making Ayurveda education accessible. These are my personal handwritten notes that helped me ace exams. Skip the overwhelming textbooks and focus on high-yield clinical points.
            </p>
            <a href="https://instagram.com/utkarsh_lanjewar" target="_blank" rel="noreferrer" className="inline-block border-2 border-gold text-gold px-6 py-3 rounded-full hover:bg-gold hover:text-primary transition-colors font-semibold">
              Follow @utkarsh_lanjewar
            </a>
          </div>
          <div className="flex-1 order-1 md:order-2 flex justify-center">
            <div className="w-48 h-48 rounded-full overflow-hidden border-2 border-gold/50 shadow-xl">
              <img src={settings.hero_photo_url || 'https://images.unsplash.com/photo-1537368910025-702800a968af?auto=format&fit=crop&q=80&w=400'} alt="Study Notes" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-24 gold-gradient">
        <div className="container mx-auto px-6 text-center max-w-2xl">
          <h2 className="text-4xl font-playfair text-primary mb-4 font-bold">Get Free Study Tips</h2>
          <p className="text-primary/80 mb-8 text-lg font-medium">Join 7,500+ students receiving weekly Ayurvedic biohacks and study strategies.</p>
          <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-4 justify-center">
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email" 
              required
              className="px-6 py-4 rounded-full text-primary w-full sm:w-96 focus:outline-none focus:ring-4 focus:ring-white/50"
            />
            <button type="submit" className="bg-primary text-white px-8 py-4 rounded-full font-bold hover:bg-gray-900 transition-colors">
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
