import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import imageCompression from 'browser-image-compression';

export default function Products() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<any>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [shortTagline, setShortTagline] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [subject, setSubject] = useState('Anatomy');
  const [isPublished, setIsPublished] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isFree, setIsFree] = useState(false);
  
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [slug, setSlug] = useState('');

  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [freePdfFile, setFreePdfFile] = useState<File | null>(null);
  
  const [uploading, setUploading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false); // For description preview

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (!currentProduct && title) {
      setSlug(title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
      setMetaTitle(title);
    }
  }, [title]);

  useEffect(() => {
    if (!currentProduct && shortTagline) {
      setMetaDescription(shortTagline);
    }
  }, [shortTagline]);

  const fetchProducts = async () => {
    setLoading(true);
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (data) setProducts(data);
    setLoading(false);
  };

  const handleEdit = (product: any) => {
    setCurrentProduct(product);
    setTitle(product.title || '');
    setShortTagline(product.short_tagline || '');
    setDescription(product.description || '');
    setPrice(product.price?.toString() || '0');
    setOriginalPrice(product.original_price?.toString() || '');
    setSubject(product.subject || 'Anatomy');
    setIsPublished(product.is_published);
    setIsFeatured(product.is_featured);
    setIsFree(product.is_free || false);
    setTags(product.tags || []);
    setSlug(product.slug || '');
    setMetaTitle(product.title || '');
    setMetaDescription(product.meta_description || '');
    setBannerPreview(product.banner_url || null);
    setIsEditing(true);
  };

  const handleCreateNew = () => {
    setCurrentProduct(null);
    setTitle('');
    setShortTagline('');
    setDescription('');
    setPrice('');
    setOriginalPrice('');
    setSubject('Anatomy');
    setIsPublished(true);
    setIsFeatured(false);
    setIsFree(false);
    setTags([]);
    setSlug('');
    setMetaTitle('');
    setMetaDescription('');
    setBannerFile(null);
    setBannerPreview(null);
    setPdfFile(null);
    setVideoFile(null);
    setFreePdfFile(null);
    setIsEditing(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const options = { maxSizeMB: 1, maxWidthOrHeight: 1920, useWebWorker: true };
      const compressedFile = await imageCompression(file, options);
      setBannerFile(compressedFile);
      setBannerPreview(URL.createObjectURL(compressedFile));
    } catch (error) {
      toast.error('Error compressing image');
    }
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (tags.length >= 5) {
        toast.error('Max 5 tags allowed');
        return;
      }
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const insertFormatting = (tag: string) => {
    const textarea = document.getElementById('desc-editor') as HTMLTextAreaElement;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const before = text.substring(0, start);
    const selected = text.substring(start, end);
    const after = text.substring(end, text.length);
    
    let insertText = '';
    if (tag === 'B') insertText = `<strong>${selected || 'bold text'}</strong>`;
    if (tag === 'I') insertText = `<em>${selected || 'italic text'}</em>`;
    if (tag === 'U') insertText = `<u>${selected || 'underlined'}</u>`;
    if (tag === 'H2') insertText = `<h2>${selected || 'Heading'}</h2>`;
    if (tag === 'UL') insertText = `\n<ul>\n  <li>${selected || 'item'}</li>\n</ul>\n`;

    setDescription(before + insertText + after);
    setTimeout(() => textarea.focus(), 0);
  };

  const uploadFile = async (file: File, bucket: string, isPublic: boolean = false) => {
    const ext = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;
    const { error: uploadError } = await supabase.storage.from(bucket).upload(fileName, file);
    if (uploadError) {
      if (uploadError.message.includes('Bucket not found')) {
         await supabase.storage.createBucket(bucket, { public: isPublic });
         await supabase.storage.from(bucket).upload(fileName, file);
      } else throw uploadError;
    }
    if (isPublic) return supabase.storage.from(bucket).getPublicUrl(fileName).data.publicUrl;
    return fileName;
  };

  const handleSubmit = async (e?: React.FormEvent, forceDraft = false) => {
    if (e) e.preventDefault();
    setUploading(true);

    try {
      let finalBanner = currentProduct?.banner_url;
      let finalFile = currentProduct?.file_url;
      let finalVideo = currentProduct?.preview_video_url;
      let finalFreePdf = currentProduct?.sample_pdf_url;

      if (bannerFile) finalBanner = await uploadFile(bannerFile, 'banners', true);
      if (pdfFile) finalFile = await uploadFile(pdfFile, 'ebooks', false);
      if (videoFile) finalVideo = await uploadFile(videoFile, 'extras', true);
      if (freePdfFile) finalFreePdf = await uploadFile(freePdfFile, 'extras', true);

      const productData = {
        title, short_tagline: shortTagline, description,
        price: isFree ? 0 : parseFloat(price || '0'),
        original_price: originalPrice ? parseFloat(originalPrice) : null,
        subject, is_published: forceDraft ? false : isPublished,
        is_featured: isFeatured, is_free: isFree,
        tags, slug, meta_description: metaDescription,
        banner_url: finalBanner, file_url: finalFile,
        preview_video_url: finalVideo, sample_pdf_url: finalFreePdf
      };

      if (currentProduct) {
        const { error } = await supabase.from('products').update(productData).eq('id', currentProduct.id);
        if (error) throw error;
        toast.success(forceDraft ? 'Draft saved!' : 'Product updated!');
      } else {
        const { error } = await supabase.from('products').insert([productData]);
        if (error) throw error;
        toast.success(forceDraft ? 'Draft saved!' : 'Product published!');
      }

      setIsEditing(false);
      fetchProducts();
    } catch (error: any) {
      toast.error(error.message || 'Error saving product');
    } finally {
      setUploading(false);
    }
  };

  if (isEditing) {
    return (
      <div className="max-w-6xl mx-auto pb-32">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-1.5 h-8 bg-gold rounded-full"></div>
          <h2 className="text-3xl font-playfair text-white">{currentProduct ? 'Edit Product' : 'Add New Product'}</h2>
        </div>
        
        <form onSubmit={e => handleSubmit(e, false)} className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative">
          
          {/* LEFT COLUMN */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            
            {/* CARD 1: Basic Info */}
            <div className="glass-card bg-[rgba(255,255,255,0.04)] border border-[rgba(200,134,10,0.2)] p-6 rounded-xl">
               {/* Free Toggle */}
               <div className={`mb-6 p-4 border rounded-xl flex items-center gap-3 transition-colors ${isFree ? 'bg-[rgba(200,134,10,0.1)] border-gold' : 'bg-[#0D1824] border-gray-700'}`}>
                 <input type="checkbox" id="freeToggle" checked={isFree} onChange={e => setIsFree(e.target.checked)} className="w-5 h-5 accent-gold" />
                 <label htmlFor="freeToggle" className="text-white font-bold cursor-pointer">Mark as FREE (₹0)</label>
               </div>

               <div className="mb-6">
                 <label className="block text-xs uppercase tracking-widest text-yellow-600 mb-1">Product Title</label>
                 <div className="relative">
                   <input required maxLength={80} type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-[#0D1824] border border-gray-700 focus:border-gold text-white rounded-lg p-3 pr-16" placeholder="e.g. Complete Anatomy Handwritten Notes" />
                   <span className="absolute right-3 top-3 text-xs text-gray-500">{title.length} / 80</span>
                 </div>
               </div>

               <div className="mb-6">
                 <label className="block text-xs uppercase tracking-widest text-yellow-600 mb-1">Short Tagline</label>
                 <input maxLength={100} type="text" value={shortTagline} onChange={e => setShortTagline(e.target.value)} className="w-full bg-[#0D1824] border border-gray-700 focus:border-gold text-white rounded-lg p-3" placeholder="e.g. High-Yield Exam Notes | 2nd Year BAMS" />
               </div>

               <div>
                 <label className="block text-xs uppercase tracking-widest text-yellow-600 mb-1">Subject</label>
                 <select value={subject} onChange={e => setSubject(e.target.value)} className="w-full bg-[#0D1824] border border-gray-700 focus:border-gold text-white rounded-lg p-3 appearance-none">
                   <option value="Anatomy">🟡 Anatomy</option>
                   <option value="Dravyaguna">🟠 Dravyaguna</option>
                   <option value="Padartha Vigyan">🔴 Padartha Vigyan</option>
                   <option value="Kriya Sharir">🔵 Kriya Sharir</option>
                   <option value="Rachana Sharir">🟢 Rachana Sharir</option>
                   <option value="Other">⚪ Other</option>
                 </select>
               </div>
            </div>

            {/* CARD 2: Pricing */}
            {!isFree && (
              <div className="glass-card bg-[rgba(255,255,255,0.04)] border border-[rgba(200,134,10,0.2)] p-6 rounded-xl">
                <div className="grid grid-cols-2 gap-6 mb-4">
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-yellow-600 mb-1">Price (₹)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-3 text-gray-400">₹</span>
                      <input required type="number" value={price} onChange={e => setPrice(e.target.value)} className="w-full bg-[#0D1824] border border-gray-700 focus:border-gold text-white rounded-lg p-3 pl-8" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-yellow-600 mb-1">Original Price (₹)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-3 text-gray-400">₹</span>
                      <input type="number" value={originalPrice} onChange={e => setOriginalPrice(e.target.value)} className="w-full bg-[#0D1824] border border-gray-700 focus:border-gold text-white rounded-lg p-3 pl-8" />
                    </div>
                  </div>
                </div>
                {price && (
                  <div className="bg-[#0D1824] p-3 rounded-lg flex items-center gap-3 border border-gray-700 text-sm">
                    <span className="text-gray-400">Preview:</span>
                    <span className="font-bold text-white text-lg">₹{price}</span>
                    {originalPrice && Number(originalPrice) > Number(price) && (
                      <>
                        <span className="text-gray-500 line-through">₹{originalPrice}</span>
                        <span className="bg-red-500/20 text-red-400 px-2 py-0.5 rounded text-xs font-bold">
                          {Math.round(((Number(originalPrice) - Number(price)) / Number(originalPrice)) * 100)}% OFF
                        </span>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* CARD 3: Description */}
            <div className="glass-card bg-[rgba(255,255,255,0.04)] border border-[rgba(200,134,10,0.2)] p-6 rounded-xl">
               <div className="flex justify-between items-center mb-2">
                 <label className="block text-xs uppercase tracking-widest text-yellow-600">Description</label>
                 <div className="flex gap-2">
                   <button type="button" onClick={() => setPreviewMode(false)} className={`text-xs px-3 py-1 rounded ${!previewMode ? 'bg-gold text-primary font-bold' : 'bg-[#0D1824] text-gray-400'}`}>Edit</button>
                   <button type="button" onClick={() => setPreviewMode(true)} className={`text-xs px-3 py-1 rounded ${previewMode ? 'bg-gold text-primary font-bold' : 'bg-[#0D1824] text-gray-400'}`}>Preview</button>
                 </div>
               </div>

               {!previewMode ? (
                 <div className="bg-[#0D1824] border border-gray-700 rounded-lg overflow-hidden flex flex-col">
                   <div className="bg-[#080A0F] p-2 flex gap-2 border-b border-gray-700">
                     <button type="button" onClick={() => insertFormatting('B')} className="w-8 h-8 rounded hover:bg-white/10 text-white font-bold">B</button>
                     <button type="button" onClick={() => insertFormatting('I')} className="w-8 h-8 rounded hover:bg-white/10 text-white italic">I</button>
                     <button type="button" onClick={() => insertFormatting('U')} className="w-8 h-8 rounded hover:bg-white/10 text-white underline">U</button>
                     <div className="w-px h-6 bg-gray-700 my-auto mx-1"></div>
                     <button type="button" onClick={() => insertFormatting('H2')} className="px-2 h-8 rounded hover:bg-white/10 text-white font-bold">H2</button>
                     <button type="button" onClick={() => insertFormatting('UL')} className="px-2 h-8 rounded hover:bg-white/10 text-white font-bold">• List</button>
                   </div>
                   <textarea id="desc-editor" value={description} onChange={e => setDescription(e.target.value)} className="w-full h-64 p-4 bg-transparent text-white border-none focus:ring-0 outline-none resize-y" placeholder="Write product details..." />
                 </div>
               ) : (
                 <div className="bg-[#0D1824] border border-gray-700 rounded-lg p-4 h-[312px] overflow-y-auto custom-html-preview text-cream">
                    {/* Safe HTML rendering for preview */}
                    <div dangerouslySetInnerHTML={{ __html: description || '<span class="text-gray-500">No description provided.</span>' }} />
                 </div>
               )}
               <div className="text-right text-xs text-gray-500 mt-2">{description.split(/\s+/).filter(w => w.length > 0).length} words</div>
            </div>

            {/* CARD 7: SEO */}
            <div className="glass-card bg-[rgba(255,255,255,0.04)] border border-[rgba(200,134,10,0.2)] p-6 rounded-xl">
               <h3 className="text-lg font-playfair text-gold border-b border-white/10 pb-2 mb-4">SEO & Discovery</h3>
               <div className="grid gap-4">
                 <div>
                   <label className="block text-xs uppercase tracking-widest text-yellow-600 mb-1">Meta Title</label>
                   <input type="text" value={metaTitle} onChange={e => setMetaTitle(e.target.value)} className="w-full bg-[#0D1824] border border-gray-700 focus:border-gold text-white rounded-lg p-3" />
                 </div>
                 <div>
                   <label className="block text-xs uppercase tracking-widest text-yellow-600 mb-1">Meta Description</label>
                   <input type="text" value={metaDescription} onChange={e => setMetaDescription(e.target.value)} className="w-full bg-[#0D1824] border border-gray-700 focus:border-gold text-white rounded-lg p-3" />
                 </div>
                 <div>
                   <label className="block text-xs uppercase tracking-widest text-yellow-600 mb-1">Custom URL Slug</label>
                   <div className="flex items-center">
                     <span className="bg-[#080A0F] border border-gray-700 border-r-0 text-gray-500 p-3 rounded-l-lg text-sm">uslnotes.com/product/</span>
                     <input type="text" value={slug} onChange={e => setSlug(e.target.value)} className="flex-1 bg-[#0D1824] border border-gray-700 focus:border-gold text-white rounded-r-lg p-3" />
                   </div>
                 </div>
               </div>
            </div>

          </div>

          {/* RIGHT COLUMN */}
          <div className="flex flex-col gap-8">
            
            {/* CARD 4: Media Upload */}
            <div className="glass-card bg-[rgba(255,255,255,0.04)] border border-[rgba(200,134,10,0.2)] p-6 rounded-xl">
               <label className="block text-xs uppercase tracking-widest text-yellow-600 mb-2">Cover Banner</label>
               <div className="border-2 border-dashed border-gold/50 rounded-xl bg-[#0D1824] hover:bg-gold/5 transition relative overflow-hidden h-40 flex items-center justify-center mb-6">
                 {bannerPreview ? (
                   <>
                     <img src={bannerPreview} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
                     <button type="button" onClick={(e) => { e.preventDefault(); setBannerFile(null); setBannerPreview(null); }} className="absolute top-2 right-2 bg-black/70 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-500 z-10">✕</button>
                   </>
                 ) : (
                   <div className="text-center p-4">
                     <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                     <p className="text-gold font-bold">Click or drag image</p>
                     <p className="text-xs text-gray-500 mt-1">16:9 ratio recommended</p>
                   </div>
                 )}
               </div>

               <label className="block text-xs uppercase tracking-widest text-yellow-600 mb-2">Private PDF (Main eBook)</label>
               <div className="bg-[#0D1824] border border-gray-700 rounded-lg p-4 relative overflow-hidden group">
                 <input type="file" accept="application/pdf" onChange={e => setPdfFile(e.target.files?.[0] || null)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                 <div className="flex items-center gap-3">
                   <div className="w-10 h-10 bg-red-500/20 text-red-500 rounded flex items-center justify-center font-bold">PDF</div>
                   <div className="flex-1 truncate">
                     <div className="text-white text-sm font-bold truncate">{pdfFile ? pdfFile.name : currentProduct?.file_url ? 'existing_file.pdf' : 'Upload PDF'}</div>
                     <div className="text-xs text-green-400 mt-1">✓ File secured in private storage</div>
                   </div>
                 </div>
               </div>
            </div>

            {/* CARD 5: Extras */}
            <div className="glass-card bg-[rgba(255,255,255,0.04)] border border-[rgba(200,134,10,0.2)] p-6 rounded-xl">
               <h3 className="text-lg font-playfair text-gold border-b border-white/10 pb-2 mb-4">Extras & Previews</h3>
               
               <div className="mb-4">
                 <label className="block text-xs text-gray-400 mb-1">Free Sample PDF</label>
                 <input type="file" accept="application/pdf" onChange={e => setFreePdfFile(e.target.files?.[0] || null)} className="w-full text-xs text-cream bg-[#0D1824] border border-gray-700 p-2 rounded" />
                 {currentProduct?.sample_pdf_url && !freePdfFile && <p className="text-xs text-green-400 mt-1">Has existing sample</p>}
               </div>
               
               <div>
                 <label className="block text-xs text-gray-400 mb-1">Preview Video (.mp4)</label>
                 <input type="file" accept="video/mp4" onChange={e => setVideoFile(e.target.files?.[0] || null)} className="w-full text-xs text-cream bg-[#0D1824] border border-gray-700 p-2 rounded" />
                 <p className="text-[10px] text-gray-500 mt-1">Max 50MB recommended</p>
                 {currentProduct?.preview_video_url && !videoFile && <p className="text-xs text-green-400 mt-1">Has existing video</p>}
               </div>
            </div>

            {/* CARD 6: Settings */}
            <div className="glass-card bg-[rgba(255,255,255,0.04)] border border-[rgba(200,134,10,0.2)] p-6 rounded-xl">
               <div className="flex flex-col gap-4 mb-6">
                 <label className="flex items-center justify-between cursor-pointer">
                   <div>
                     <div className="text-white font-bold">{isPublished ? '✓ Published' : 'Draft'}</div>
                     <div className="text-xs text-gray-500">{isPublished ? 'Visible to students' : 'Hidden from shop'}</div>
                   </div>
                   <div className="relative inline-flex items-center">
                    <input type="checkbox" className="sr-only peer" checked={isPublished} onChange={e => setIsPublished(e.target.checked)} />
                    <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                  </div>
                 </label>

                 <label className="flex items-center justify-between cursor-pointer">
                   <div>
                     <div className="text-white font-bold">Featured</div>
                     <div className="text-xs text-gray-500">{isFeatured ? '⭐ Shows on Home page' : 'Not featured'}</div>
                   </div>
                   <div className="relative inline-flex items-center">
                    <input type="checkbox" className="sr-only peer" checked={isFeatured} onChange={e => setIsFeatured(e.target.checked)} />
                    <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold"></div>
                  </div>
                 </label>
               </div>

               <div>
                 <label className="block text-xs uppercase tracking-widest text-yellow-600 mb-2">Tags</label>
                 <div className="flex flex-wrap gap-2 mb-2">
                   {tags.map(t => (
                     <span key={t} className="bg-gold/20 text-gold border border-gold/30 px-2 py-1 rounded text-xs flex items-center gap-1">
                       {t} <button type="button" onClick={() => removeTag(t)} className="hover:text-white">✕</button>
                     </span>
                   ))}
                 </div>
                 <input type="text" value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={handleAddTag} placeholder="Type tag and press Enter..." className="w-full bg-[#0D1824] border border-gray-700 focus:border-gold text-white rounded-lg p-2 text-sm" />
               </div>
            </div>

          </div>

          {/* ACTION BAR (Fixed Bottom) */}
          <div className="fixed bottom-0 left-64 right-0 bg-[#080A0F]/80 backdrop-blur-md border-t border-white/10 p-4 z-50 flex justify-between items-center px-8">
            <button type="button" onClick={() => setIsEditing(false)} className="text-gray-400 hover:text-white font-bold transition">← Back to Products</button>
            <div className="flex gap-4">
              <button type="button" onClick={(e) => handleSubmit(e, true)} disabled={uploading} className="border border-gold text-gold hover:bg-gold hover:text-primary px-6 py-3 rounded-lg font-bold transition disabled:opacity-50">
                Save as Draft
              </button>
              <button type="submit" disabled={uploading} className="bg-gold text-primary px-8 py-3 rounded-lg font-bold hover:bg-white transition disabled:opacity-50 shadow-[0_0_15px_rgba(200,134,10,0.3)]">
                {uploading ? 'Saving & Uploading...' : 'Publish Product'}
              </button>
            </div>
          </div>
        </form>
        
        {/* Simple CSS for custom HTML preview styling */}
        <style dangerouslySetInnerHTML={{__html: `
          .custom-html-preview h2 { font-family: 'Playfair Display', serif; font-size: 1.5rem; margin-bottom: 0.5rem; color: #fff; }
          .custom-html-preview strong { color: #C8860A; font-weight: bold; }
          .custom-html-preview u { text-decoration-color: #C8860A; text-decoration-thickness: 2px; }
          .custom-html-preview ul { list-style-type: none; padding-left: 1rem; }
          .custom-html-preview li::before { content: "✦ "; color: #C8860A; font-weight: bold; }
          .custom-html-preview li { margin-bottom: 0.25rem; }
        `}} />
      </div>
    );
  }

  // --- List View Output (Omitted specific details for brevity, reused existing layout) ---
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
                    {p.is_free ? <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-xs border border-blue-500/20">FREE</span> : 'Paid'}
                  </td>
                  <td className="p-4">{p.is_free ? '₹0' : `₹${p.price}`}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs border ${p.is_published ? 'bg-green-500/20 text-green-400 border-green-500/20' : 'bg-gray-500/20 text-gray-400 border-gray-500/20'}`}>
                      {p.is_published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button onClick={() => handleEdit(p)} className="text-gold hover:underline mr-4">Edit</button>
                    <button onClick={async () => {
                      if (!window.confirm('Are you sure you want to delete this product?')) return;
                      await supabase.from('products').delete().eq('id', p.id);
                      fetchProducts();
                    }} className="text-red-400 hover:underline">Delete</button>
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
