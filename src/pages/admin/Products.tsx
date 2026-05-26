import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

export default function Products() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<any>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [subject, setSubject] = useState('Anatomy');
  const [isPublished, setIsPublished] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isFree, setIsFree] = useState(false);
  
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [freePdfFile, setFreePdfFile] = useState<File | null>(null);
  
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (data) setProducts(data);
    setLoading(false);
  };

  const handleEdit = (product: any) => {
    setCurrentProduct(product);
    setTitle(product.title);
    setDescription(product.description);
    setPrice(product.price?.toString() || '0');
    setOriginalPrice(product.original_price ? product.original_price.toString() : '');
    setSubject(product.subject);
    setIsPublished(product.is_published);
    setIsFeatured(product.is_featured);
    setIsFree(product.is_free || false);
    setIsEditing(true);
  };

  const handleCreateNew = () => {
    setCurrentProduct(null);
    setTitle('');
    setDescription('');
    setPrice('');
    setOriginalPrice('');
    setSubject('Anatomy');
    setIsPublished(true);
    setIsFeatured(false);
    setIsFree(false);
    setBannerFile(null);
    setPdfFile(null);
    setVideoFile(null);
    setFreePdfFile(null);
    setIsEditing(true);
  };

  const uploadFile = async (file: File, bucket: string, isPublic: boolean = false) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage.from(bucket).upload(filePath, file);
    if (uploadError) {
      if (uploadError.message.includes('Bucket not found')) {
         await supabase.storage.createBucket(bucket, { public: isPublic });
         await supabase.storage.from(bucket).upload(filePath, file);
      } else {
         throw uploadError;
      }
    }

    if (isPublic) {
      const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
      return data.publicUrl;
    }
    return filePath; // For private files, store path and generate signed URL later
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    try {
      let finalBannerUrl = currentProduct?.banner_url;
      let finalFileUrl = currentProduct?.file_url;
      let finalVideoUrl = currentProduct?.video_url;
      let finalFreePdfUrl = currentProduct?.free_pdf_url;

      if (bannerFile) finalBannerUrl = await uploadFile(bannerFile, 'images', true);
      if (pdfFile) finalFileUrl = await uploadFile(pdfFile, 'ebooks', false);
      if (videoFile) finalVideoUrl = await uploadFile(videoFile, 'videos', true);
      if (freePdfFile) finalFreePdfUrl = await uploadFile(freePdfFile, 'free_pdfs', true);

      const productData = {
        title,
        description,
        price: isFree ? 0 : parseFloat(price),
        original_price: originalPrice ? parseFloat(originalPrice) : null,
        subject,
        is_published: isPublished,
        is_featured: isFeatured,
        is_free: isFree,
        banner_url: finalBannerUrl,
        file_url: finalFileUrl,
        video_url: finalVideoUrl,
        free_pdf_url: finalFreePdfUrl
      };

      if (currentProduct) {
        const { error } = await supabase.from('products').update(productData).eq('id', currentProduct.id);
        if (error) throw error;
        toast.success('Product updated!');
      } else {
        const { error } = await supabase.from('products').insert([productData]);
        if (error) throw error;
        toast.success('Product created!');
      }

      setIsEditing(false);
      fetchProducts();
    } catch (error: any) {
      toast.error(error.message || 'Error saving product');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) toast.error(error.message);
    else {
      toast.success('Deleted successfully');
      fetchProducts();
    }
  };

  if (isEditing) {
    return (
      <div className="max-w-4xl">
        <button onClick={() => setIsEditing(false)} className="text-gold hover:underline mb-6">← Back to Products</button>
        <h2 className="text-3xl font-playfair text-white mb-8">{currentProduct ? 'Edit Product' : 'Add New Product'}</h2>
        
        <form onSubmit={handleSubmit} className="glass-card p-8 flex flex-col gap-6">
          <div className="flex items-center gap-2 text-gold font-bold bg-gold/10 p-4 rounded border border-gold/20">
              <input type="checkbox" checked={isFree} onChange={e => setIsFree(e.target.checked)} className="w-5 h-5 accent-gold" />
              This is a completely FREE product
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-cream mb-2">Title</label>
              <input required type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-primary border border-white/20 rounded p-3 text-white" />
            </div>
            <div>
              <label className="block text-cream mb-2">Subject</label>
              <select value={subject} onChange={e => setSubject(e.target.value)} className="w-full bg-primary border border-white/20 rounded p-3 text-white">
                <option>Anatomy</option>
                <option>Dravyaguna</option>
                <option>Padartha Vigyan</option>
                <option>Other</option>
              </select>
            </div>
          </div>

          {!isFree && (
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-cream mb-2">Price (₹)</label>
                <input required={!isFree} type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} className="w-full bg-primary border border-white/20 rounded p-3 text-white" />
              </div>
              <div>
                <label className="block text-cream mb-2">Original Price (₹) - Optional</label>
                <input type="number" step="0.01" value={originalPrice} onChange={e => setOriginalPrice(e.target.value)} className="w-full bg-primary border border-white/20 rounded p-3 text-white" />
              </div>
            </div>
          )}

          <div>
            <label className="block text-cream mb-2">Description (Text or HTML)</label>
            <div className="bg-white rounded overflow-hidden p-1">
              <textarea 
                value={description} 
                onChange={e => setDescription(e.target.value)} 
                className="w-full h-64 p-4 bg-white text-gray-900 border-none focus:ring-2 focus:ring-gold outline-none resize-y"
                placeholder="Enter product description here... (You can use simple HTML tags like <b>, <i>, <br> if you want formatting)"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 mt-4 p-4 border border-white/10 rounded">
            <h3 className="col-span-2 text-xl font-playfair text-white border-b border-white/10 pb-2">Main Content</h3>
            <div>
               <label className="block text-cream mb-2">Cover Image (Banner)</label>
               <input type="file" accept="image/*" onChange={e => setBannerFile(e.target.files?.[0] || null)} className="w-full text-cream text-sm" />
               {currentProduct?.banner_url && !bannerFile && <p className="text-xs text-green-400 mt-1">Has existing banner</p>}
            </div>
            <div>
               <label className="block text-cream mb-2">Private PDF (Main eBook)</label>
               <input type="file" accept="application/pdf" onChange={e => setPdfFile(e.target.files?.[0] || null)} className="w-full text-cream text-sm" />
               {currentProduct?.file_url && !pdfFile && <p className="text-xs text-green-400 mt-1">Has existing PDF</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 mt-4 p-4 border border-white/10 rounded">
            <h3 className="col-span-2 text-xl font-playfair text-white border-b border-white/10 pb-2">Extras / Previews</h3>
            <div>
               <label className="block text-cream mb-2">Preview Video (.mp4)</label>
               <input type="file" accept="video/mp4" onChange={e => setVideoFile(e.target.files?.[0] || null)} className="w-full text-cream text-sm" />
               {currentProduct?.video_url && !videoFile && <p className="text-xs text-green-400 mt-1">Has existing video</p>}
            </div>
            <div>
               <label className="block text-cream mb-2">Free Sample PDF</label>
               <input type="file" accept="application/pdf" onChange={e => setFreePdfFile(e.target.files?.[0] || null)} className="w-full text-cream text-sm" />
               {currentProduct?.free_pdf_url && !freePdfFile && <p className="text-xs text-green-400 mt-1">Has existing free sample</p>}
            </div>
          </div>

          <div className="flex gap-6 mt-4">
            <label className="flex items-center gap-2 text-cream">
              <input type="checkbox" checked={isPublished} onChange={e => setIsPublished(e.target.checked)} className="w-4 h-4" />
              Published
            </label>
            <label className="flex items-center gap-2 text-cream">
              <input type="checkbox" checked={isFeatured} onChange={e => setIsFeatured(e.target.checked)} className="w-4 h-4" />
              Featured (Shows on Home)
            </label>
          </div>

          <button disabled={uploading} type="submit" className="bg-gold text-primary font-bold py-3 rounded mt-4 hover:bg-white transition disabled:opacity-50">
            {uploading ? 'Saving & Uploading...' : 'Save Product'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-playfair text-white">Products Management</h2>
        <button onClick={handleCreateNew} className="bg-gold text-primary px-4 py-2 rounded font-bold hover:bg-white transition">
          + Add New Product
        </button>
      </div>

      {loading ? (
        <div className="text-cream">Loading...</div>
      ) : (
        <div className="bg-card-bg border border-white/10 rounded-xl overflow-hidden">
          <table className="w-full text-left text-cream">
            <thead className="bg-black/40 border-b border-white/10">
              <tr>
                <th className="p-4">Title</th>
                <th className="p-4">Subject</th>
                <th className="p-4">Type</th>
                <th className="p-4">Price</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="p-4 font-bold text-white">{p.title}</td>
                  <td className="p-4">{p.subject}</td>
                  <td className="p-4">
                    {p.is_free ? <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-xs">FREE</span> : 'Paid'}
                  </td>
                  <td className="p-4">{p.is_free ? '₹0' : `₹${p.price}`}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs ${p.is_published ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                      {p.is_published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button onClick={() => handleEdit(p)} className="text-gold hover:underline mr-4">Edit</button>
                    <button onClick={() => handleDelete(p.id)} className="text-red-400 hover:underline">Delete</button>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-cream/50">No products found. Add one!</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
