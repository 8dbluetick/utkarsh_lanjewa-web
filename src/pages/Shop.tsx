import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function Shop() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      let query = supabase.from('products').select('*').eq('is_published', true);
      
      if (filter !== 'All') {
        query = query.eq('subject', filter);
      }
      
      const { data } = await query;
      if (data) setProducts(data);
      setLoading(false);
    }
    fetchProducts();
  }, [filter]);

  const subjects = ['All', 'Anatomy', 'Dravyaguna', 'Padartha Vigyan', 'Other'];

  return (
    <div className="container mx-auto px-6 py-12 min-h-screen pt-24">
      <h1 className="text-4xl md:text-5xl font-playfair text-white mb-8 text-center">All Study Notes</h1>
      
      <div className="flex flex-wrap gap-4 justify-center mb-12">
        {subjects.map(sub => (
          <button
            key={sub}
            onClick={() => setFilter(sub)}
            className={`px-6 py-2 rounded-full border transition-colors ${
              filter === sub 
                ? 'bg-gold text-primary border-gold font-bold' 
                : 'border-gold/30 text-cream hover:border-gold'
            }`}
          >
            {sub}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product, index) => (
            <div key={product.id} className={`glass-card hover:border-gold transition-colors duration-300 overflow-hidden flex flex-col group animate-fade-up delay-${((index % 4) + 1) * 100}`}>
              <div className="h-56 w-full relative overflow-hidden bg-gray-900">
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
                <h3 className="text-xl font-playfair text-white mb-4 line-clamp-2">{product.title}</h3>
                <div className="mt-auto pt-4 border-t border-white/10 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-2xl font-bold text-gold">₹{product.price}</span>
                    {product.original_price && <span className="text-sm text-gray-500 line-through">₹{product.original_price}</span>}
                  </div>
                  <Link to={`/product/${product.id}`} className="bg-gold text-primary hover:bg-white px-6 py-2 rounded-lg transition-colors text-sm font-bold">
                    Buy Now
                  </Link>
                </div>
              </div>
            </div>
          ))}
          {products.length === 0 && (
            <div className="col-span-full text-center py-12 text-cream opacity-60">
              No products found in this category.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
