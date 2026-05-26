import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import DOMPurify from 'dompurify';
import toast from 'react-hot-toast';

export default function ProductDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { addToCart, isInCart } = useCart();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [related, setRelated] = useState<any[]>([]);

  useEffect(() => {
    async function fetchProduct() {
      if (!id) return;
      setLoading(true);
      const { data } = await supabase.from('products').select('*').eq('id', id).single();
      if (data) {
        setProduct(data);
        if (data.is_free) setHasPurchased(true); // Free products are always "purchased"
        
        // Fetch related
        const { data: rel } = await supabase
          .from('products')
          .select('*')
          .eq('subject', data.subject)
          .neq('id', id)
          .limit(3);
        if (rel) setRelated(rel);
      }
      setLoading(false);
    }
    fetchProduct();
  }, [id]);

  useEffect(() => {
    async function checkPurchase() {
      if (!user || !id || !product || product.is_free) return;
      const { data } = await supabase
        .from('purchases')
        .select('*')
        .eq('user_id', user.id)
        .eq('product_id', id)
        .eq('status', 'completed');
      if (data && data.length > 0) {
        setHasPurchased(true);
      }
    }
    checkPurchase();
  }, [user, id, product]);

  const handleBuyNow = async () => {
    if (!user) {
      toast.error('Please login to purchase');
      return;
    }
    // Free product claim logic
    if (product.is_free) {
       const { error } = await supabase.from('purchases').insert([{
         user_id: user.id,
         product_id: product.id,
         amount_paid: 0,
         status: 'completed',
         razorpay_payment_id: 'FREE' // Using same field for compatibility
       }]);
       if (error) toast.error('Failed to claim free product');
       else {
         toast.success('Successfully added to your profile! 🎉');
         setHasPurchased(true);
       }
    }
  };

  const handleDownload = async () => {
    if (!product.file_url) {
      toast.error('Main file not available for this product yet.');
      return;
    }
    try {
      const { data, error } = await supabase.storage
        .from('ebooks')
        .createSignedUrl(product.file_url, 3600); 
        
      if (error) throw error;
      if (data?.signedUrl) {
        window.open(data.signedUrl, '_blank');
      }
    } catch (err: any) {
      toast.error('Failed to download file: ' + err.message);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center pt-24"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold"></div></div>;
  if (!product) return <div className="min-h-screen pt-24 text-center">Product not found.</div>;

  return (
    <div className="container mx-auto px-6 py-12 pt-24">
      <div className="flex flex-col md:flex-row gap-12 mb-16">
        {/* Left Column (Banner/Video) */}
        <div className="md:w-1/2 animate-fade-in">
          {product.video_url ? (
            <div className="rounded-xl overflow-hidden shadow-[0_0_30px_rgba(200,134,10,0.15)] bg-black aspect-video relative">
              <video 
                src={product.video_url} 
                controls 
                className="w-full h-full object-contain"
                poster={product.banner_url || ''}
              />
            </div>
          ) : (
            <div className="rounded-xl overflow-hidden shadow-[0_0_30px_rgba(200,134,10,0.15)] bg-gray-900 aspect-video relative">
              {product.banner_url ? (
                 <img src={product.banner_url} alt={product.title} className="w-full h-full object-cover" />
              ) : (
                 <div className="w-full h-full flex items-center justify-center text-gray-500">No Image</div>
              )}
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="md:w-1/2 flex flex-col justify-center animate-fade-up delay-100">
          <div className="flex items-center gap-3 mb-4">
            <span className="inline-block bg-maroon/20 text-maroon font-bold px-3 py-1 rounded-full text-sm uppercase tracking-wider border border-maroon/30">
              {product.subject}
            </span>
            {product.is_free && (
              <span className="inline-block bg-blue-500/20 text-blue-400 font-bold px-3 py-1 rounded-full text-sm uppercase tracking-wider border border-blue-500/30">
                FREE
              </span>
            )}
          </div>
          
          <h1 className="text-3xl md:text-4xl font-playfair text-white mb-4 leading-tight">{product.title}</h1>
          
          <div className="flex items-center gap-2 mb-6">
            <div className="flex text-gold">★★★★★</div>
            <span className="text-cream opacity-70 text-sm">(5.0 Average)</span>
          </div>

          <div className="flex items-end gap-4 mb-8">
            <span className="text-5xl font-bold text-gold font-playfair">
              {product.is_free ? 'FREE' : `₹${product.price}`}
            </span>
            {product.original_price && !product.is_free && (
              <>
                <span className="text-xl text-gray-500 line-through mb-1">₹{product.original_price}</span>
                <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-sm font-bold mb-1 border border-green-500/30">
                  {Math.round(((product.original_price - product.price) / product.original_price) * 100)}% OFF
                </span>
              </>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            {hasPurchased ? (
              <button onClick={handleDownload} className="bg-green-600 hover:bg-green-500 text-white font-bold py-4 rounded-xl transition-colors px-8 shadow-lg flex-1">
                Download {product.is_free ? 'Free Notes' : 'Purchased Notes'}
              </button>
            ) : product.is_free ? (
              <button onClick={handleBuyNow} className="bg-gold hover:bg-yellow-500 text-primary font-bold py-4 rounded-xl transition-colors px-8 shadow-[0_0_15px_rgba(200,134,10,0.4)] flex-1 text-lg">
                Claim For Free
              </button>
            ) : isInCart(product.id) ? (
              <Link to="/cart" className="bg-white/10 hover:bg-white/20 text-white font-bold py-4 rounded-xl transition-colors px-8 flex-1 text-lg flex items-center justify-center border border-white/20">
                Go to Cart
              </Link>
            ) : (
              <button onClick={() => addToCart(product)} className="bg-gold hover:bg-yellow-500 text-primary font-bold py-4 rounded-xl transition-colors px-8 shadow-[0_0_15px_rgba(200,134,10,0.4)] flex-1 text-lg">
                Add to Cart
              </button>
            )}

            {/* Free Sample Button (if applicable) */}
            {product.free_pdf_url && !product.is_free && (
               <a 
                 href={product.free_pdf_url} 
                 target="_blank" 
                 rel="noreferrer"
                 className="bg-white/10 hover:bg-white/20 text-white font-bold py-4 px-8 rounded-xl transition-colors flex-1 text-center"
               >
                 View Free Sample
               </a>
            )}
          </div>
          
          {!product.is_free && (
            <p className="text-sm text-cream opacity-60 flex items-center gap-2 mt-4">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
              Secured by Cashfree Payments
            </p>
          )}
        </div>
      </div>

      {/* Description */}
      <div className="glass-card p-8 md:p-12 mb-16">
        <h2 className="text-3xl font-playfair text-gold mb-6 border-b border-white/10 pb-4">About These Notes</h2>
        <div 
          className="ql-editor !px-0 prose prose-invert max-w-none text-cream/90"
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(product.description || '') }}
        />
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <div>
          <h2 className="text-3xl font-playfair text-white mb-8 border-l-4 border-gold pl-4">More {product.subject} Notes</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             {related.map(rel => (
               <Link to={`/product/${rel.id}`} key={rel.id} className="glass-card hover:border-gold transition p-4 flex gap-4 items-center group">
                 <div className="w-20 h-20 rounded bg-gray-800 overflow-hidden shrink-0">
                   {rel.banner_url && <img src={rel.banner_url} alt="" className="w-full h-full object-cover group-hover:scale-110 transition" />}
                 </div>
                 <div>
                   <h4 className="font-playfair text-white line-clamp-2 mb-1">{rel.title}</h4>
                   <span className="text-gold font-bold">
                     {rel.is_free ? 'FREE' : `₹${rel.price}`}
                   </span>
                 </div>
               </Link>
             ))}
          </div>
        </div>
      )}
    </div>
  );
}
