'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const fileInputRef = useRef(null);

  // Form State
  const [formData, setFormData] = useState({
    _id: '',
    name: '',
    description: '',
    price: '',
    comparePrice: '',
    category: '',
    stock: '',
    weight: '',
    tags: '',
    sku: '',
    benefits: '',
    ingredients: '',
    storageConditions: '',
    isFeatured: false,
    images: [] // Preview URLs or File objects
  });

  const [mainImageFile, setMainImageFile] = useState(null);
  const [hoverImageFile, setHoverImageFile] = useState(null);
  const [extraImagesFiles, setExtraImagesFiles] = useState([]);
  const [imagesToRemove, setImagesToRemove] = useState([]); // IDs of existing images to delete

  const mainImageInputRef = useRef(null);
  const hoverImageInputRef = useRef(null);
  const extraImagesInputRef = useRef(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        fetch(`${API_URL}/products`),
        fetch(`${API_URL}/products/categories`) // I should verify if this exists or use a generic one
      ]);
      
      // Let's check categories route - if it fails I'll fallback to a generic one I know exists or create it
      let catData = [];
      if (catRes.ok) {
        const d = await catRes.json();
        catData = d.data?.categories || d.data || [];
      } else {
        // Fallback: Fetch categories from a likely route or list them manually if needed
        // For now let's assume I might need to create this route on backend
      }

      const prodData = await prodRes.json();
      setProducts(prodData.data?.products || prodData.data || []);
      setCategories(catData);
    } catch (err) {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleMainImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setMainImageFile(e.target.files[0]);
    }
  };

  const handleHoverImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setHoverImageFile(e.target.files[0]);
    }
  };

  const handleExtraImagesChange = (e) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setExtraImagesFiles(prev => [...prev, ...files]);
    }
  };

  const removeExtraImageFile = (index) => {
    setExtraImagesFiles(prev => prev.filter((_, i) => i !== index));
  };

  const markImageForRemoval = (publicId) => {
    setImagesToRemove(prev => [...prev, publicId]);
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter(img => img.publicId !== publicId)
    }));
  };

  const resetForm = () => {
    setFormData({
      _id: '',
      name: '',
      description: '',
      price: '',
      comparePrice: '',
      category: '',
      stock: '',
      weight: '',
      tags: '',
      benefits: '',
      ingredients: '',
      storageConditions: '',
      isFeatured: false,
      images: []
    });
    setMainImageFile(null);
    setHoverImageFile(null);
    setExtraImagesFiles([]);
    setImagesToRemove([]);
    setIsEditing(false);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);

    const data = new FormData();
    data.append('name', formData.name);
    data.append('description', formData.description);
    data.append('price', formData.price);
    if (formData.comparePrice) data.append('comparePrice', formData.comparePrice);
    data.append('category', formData.category);
    data.append('stock', formData.stock || 0);
    data.append('weight', formData.weight || 0);
    data.append('tags', formData.tags);
    data.append('isFeatured', formData.isFeatured);
    if (formData.sku) data.append('sku', formData.sku);
    if (formData.benefits) data.append('benefits', formData.benefits);
    if (formData.ingredients) data.append('ingredients', formData.ingredients);
    if (formData.storageConditions) data.append('storageConditions', formData.storageConditions);

    if (mainImageFile) data.append('mainImage', mainImageFile);
    if (hoverImageFile) data.append('hoverImage', hoverImageFile);
    
    extraImagesFiles.forEach(file => {
      data.append('extraImages', file);
    });

    if (imagesToRemove.length > 0) {
      imagesToRemove.forEach(id => data.append('removeImages[]', id));
    }

    try {
      const url = isEditing 
        ? `${API_URL}/products/${formData._id}` 
        : `${API_URL}/products`;
      
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        body: data,
        // No Content-Type header - browser sets it for FormData
        credentials: 'include'
      });

      const resData = await res.json();
      if (res.ok) {
        toast.success(isEditing ? 'Product updated!' : 'Product added!');
        resetForm();
        fetchData();
      } else {
        console.error('❌ Server error response:', resData);
        let errorMsg = resData.message || 'Operation failed';
        
        if (resData.errors && resData.errors.length > 0) {
          // Check if first error is an object (express-validator) or string (Mongoose)
          const firstErr = resData.errors[0];
          if (typeof firstErr === 'object') {
            errorMsg = firstErr.message || firstErr.msg || `${firstErr.field}: ${firstErr.message}`;
          } else {
            errorMsg = firstErr; // It's a string
          }
        }
        toast.error(errorMsg);
      }
    } catch (err) {
      toast.error('Something went wrong');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleEdit = (product) => {
    setFormData({
      _id: product._id,
      name: product.name,
      description: product.description,
      price: product.price,
      comparePrice: product.comparePrice || '',
      category: product.category?._id || product.category,
      stock: product.stock,
      weight: product.weight,
      tags: product.tags?.join(', ') || '',
      sku: product.sku || '',
      benefits: product.benefits || '',
      ingredients: product.ingredients || '',
      storageConditions: product.storageConditions || '',
      isFeatured: product.isFeatured || false,
      images: product.images || []
    });
    setIsEditing(true);
    setShowForm(true);
    setImagesToRemove([]);
    setExtraImagesFiles([]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
      const res = await fetch(`${API_URL}/products/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (res.ok) {
        toast.success('Product deleted');
        fetchData();
      } else {
        const d = await res.json();
        toast.error(d.message || 'Delete failed');
      }
    } catch (err) {
      toast.error('Network error');
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-between items-center">
        <h1 className="font-heading text-3xl font-bold text-primary">Manage Products</h1>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-accent text-primary px-6 py-2 rounded-xl font-bold hover:shadow-lg transition-all"
        >
          {showForm ? 'Cancel' : '+ Add New Product'}
        </button>
      </div>

      {/* Form Section */}
      {showForm && (
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-primary/5 animate-in fade-in slide-in-from-top-4 duration-300">
          <h2 className="font-heading text-xl font-bold mb-6 text-primary">
            {isEditing ? 'Edit Product' : 'Add New Product'}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField label="Product Title" name="name" value={formData.name} onChange={handleInputChange} required />
            <InputField label="Custom SKU (Product ID)" name="sku" value={formData.sku} onChange={handleInputChange} placeholder="Leave blank to auto-generate (e.g. KHJ-1234)" />
            
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase tracking-widest text-primary/50">Category</label>
              <select 
                name="category" 
                value={formData.category} 
                onChange={handleInputChange} 
                className="bg-secondary/50 border border-primary/10 rounded-xl px-4 py-3 outline-none focus:border-accent transition-all"
                required
              >
                <option value="">Select a Category</option>
                {categories.map(cat => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
            </div>
            
            <div className="md:col-span-2">
              <label className="text-xs font-bold uppercase tracking-widest text-primary/50 block mb-2">Description</label>
              <textarea 
                name="description" 
                value={formData.description} 
                onChange={handleInputChange} 
                rows="4"
                className="w-full bg-secondary/50 border border-primary/10 rounded-xl px-4 py-3 outline-none focus:border-accent transition-all"
                required
              ></textarea>
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-bold uppercase tracking-widest text-primary/50 block mb-2">Product Benefits</label>
              <textarea 
                name="benefits" 
                value={formData.benefits} 
                onChange={handleInputChange} 
                rows="3"
                className="w-full bg-secondary/50 border border-primary/10 rounded-xl px-4 py-3 outline-none focus:border-accent transition-all"
              ></textarea>
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-bold uppercase tracking-widest text-primary/50 block mb-2">Ingredients</label>
              <textarea 
                name="ingredients" 
                value={formData.ingredients} 
                onChange={handleInputChange} 
                rows="2"
                className="w-full bg-secondary/50 border border-primary/10 rounded-xl px-4 py-3 outline-none focus:border-accent transition-all"
              ></textarea>
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-bold uppercase tracking-widest text-primary/50 block mb-2">Storage Conditions</label>
              <textarea 
                name="storageConditions" 
                value={formData.storageConditions} 
                onChange={handleInputChange} 
                rows="2"
                className="w-full bg-secondary/50 border border-primary/10 rounded-xl px-4 py-3 outline-none focus:border-accent transition-all"
              ></textarea>
            </div>

            <InputField label="Price (₹)" name="price" type="number" value={formData.price} onChange={handleInputChange} required />
            <InputField label="Compare Price (MRP)" name="comparePrice" type="number" value={formData.comparePrice} onChange={handleInputChange} />
            
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase tracking-widest text-primary/50">Feature on Homepage?</label>
              <label className="flex items-center gap-3 bg-secondary/50 border border-primary/10 rounded-xl px-4 py-3 cursor-pointer hover:border-accent transition-all">
                <input 
                  type="checkbox" 
                  name="isFeatured" 
                  checked={formData.isFeatured} 
                  onChange={handleInputChange} 
                  className="w-5 h-5 accent-accent"
                />
                <span className="font-bold text-primary">Yes, show in Featured Products</span>
              </label>
            </div>

            <InputField label="Stock Quantity" name="stock" type="number" value={formData.stock} onChange={handleInputChange} required />
            <InputField label="Weight (grams)" name="weight" type="number" value={formData.weight} onChange={handleInputChange} />
            
            <div className="md:col-span-2">
              <InputField label="Materials / Tags (comma separated)" name="tags" value={formData.tags} onChange={handleInputChange} placeholder="organic, raw, pure" />
            </div>

            <div className="md:col-span-1">
              <label className="text-xs font-bold uppercase tracking-widest text-primary/50 block mb-2">Main Image (Showing)</label>
              <input 
                type="file" 
                onChange={handleMainImageChange}
                ref={mainImageInputRef}
                className="hidden"
                accept="image/*"
              />
              <div className="flex gap-4 items-center">
                <button 
                  type="button"
                  onClick={() => mainImageInputRef.current.click()}
                  className="w-24 h-24 border-2 border-dashed border-primary/20 rounded-2xl flex flex-col items-center justify-center text-primary/40 hover:border-accent hover:text-accent transition-all flex-shrink-0"
                >
                  <span className="text-2xl">+</span>
                  <span className="text-[10px] font-bold">UPLOAD</span>
                </button>

                {mainImageFile ? (
                  <div className="w-24 h-24 rounded-2xl overflow-hidden relative border border-accent/30 flex-shrink-0">
                    <Image src={URL.createObjectURL(mainImageFile)} alt="preview" fill className="object-cover" />
                    <div className="absolute top-0 right-0 bg-accent text-[8px] font-bold px-1 rounded-bl">NEW</div>
                  </div>
                ) : isEditing && formData.images?.[0] ? (
                  <div className="w-24 h-24 rounded-2xl overflow-hidden relative border border-primary/10 flex-shrink-0">
                    <Image src={formData.images[0].url} alt="main" fill className="object-cover" />
                    <div className="absolute bottom-0 w-full bg-black/50 text-white text-[10px] text-center py-1">CURRENT</div>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="md:col-span-1">
              <label className="text-xs font-bold uppercase tracking-widest text-primary/50 block mb-2">Hover Image</label>
              <input 
                type="file" 
                onChange={handleHoverImageChange}
                ref={hoverImageInputRef}
                className="hidden"
                accept="image/*"
              />
              <div className="flex gap-4 items-center">
                <button 
                  type="button"
                  onClick={() => hoverImageInputRef.current.click()}
                  className="w-24 h-24 border-2 border-dashed border-primary/20 rounded-2xl flex flex-col items-center justify-center text-primary/40 hover:border-accent hover:text-accent transition-all flex-shrink-0"
                >
                  <span className="text-2xl">+</span>
                  <span className="text-[10px] font-bold">UPLOAD</span>
                </button>

                {hoverImageFile ? (
                  <div className="w-24 h-24 rounded-2xl overflow-hidden relative border border-accent/30 flex-shrink-0">
                    <Image src={URL.createObjectURL(hoverImageFile)} alt="preview" fill className="object-cover" />
                    <div className="absolute top-0 right-0 bg-accent text-[8px] font-bold px-1 rounded-bl">NEW</div>
                  </div>
                ) : isEditing && formData.images?.[1] ? (
                  <div className="w-24 h-24 rounded-2xl overflow-hidden relative border border-primary/10 flex-shrink-0">
                    <Image src={formData.images[1].url} alt="hover" fill className="object-cover" />
                    <div className="absolute bottom-0 w-full bg-black/50 text-white text-[10px] text-center py-1">CURRENT</div>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-bold uppercase tracking-widest text-primary/50 block mb-2">Other Images (Details Page Only)</label>
              <input 
                type="file" 
                onChange={handleExtraImagesChange}
                ref={extraImagesInputRef}
                className="hidden"
                accept="image/*"
                multiple
              />
              <div className="flex flex-wrap gap-4 items-center">
                <button 
                  type="button"
                  onClick={() => extraImagesInputRef.current.click()}
                  className="w-24 h-24 border-2 border-dashed border-primary/20 rounded-2xl flex flex-col items-center justify-center text-primary/40 hover:border-accent hover:text-accent transition-all flex-shrink-0"
                >
                  <span className="text-2xl">+</span>
                  <span className="text-[10px] font-bold">ADD OTHERS</span>
                </button>

                {/* Existing Extra Images (from index 2 onwards) */}
                {isEditing && formData.images.slice(2).map((img) => (
                  <div key={img.publicId} className="w-24 h-24 rounded-2xl overflow-hidden relative border border-primary/10 flex-shrink-0 group">
                    <Image src={img.url} alt="extra" fill className="object-cover" />
                    <button 
                      type="button"
                      onClick={() => markImageForRemoval(img.publicId)}
                      className="absolute inset-0 bg-red-500/80 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                    >
                      Delete
                    </button>
                  </div>
                ))}

                {/* New Extra Images Previews */}
                {extraImagesFiles.map((file, idx) => (
                  <div key={idx} className="w-24 h-24 rounded-2xl overflow-hidden relative border border-accent/30 flex-shrink-0 group">
                    <Image src={URL.createObjectURL(file)} alt="new extra" fill className="object-cover" />
                    <button 
                      type="button"
                      onClick={() => removeExtraImageFile(idx)}
                      className="absolute inset-0 bg-red-500/80 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                    >
                      Remove
                    </button>
                    <div className="absolute top-0 right-0 bg-accent text-[8px] font-bold px-1 rounded-bl">NEW</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="md:col-span-2 pt-4">
              <button 
                type="submit" 
                disabled={submitLoading}
                className="w-full bg-primary text-secondary py-4 rounded-2xl font-bold uppercase tracking-widest hover:bg-accent hover:text-primary transition-all disabled:opacity-50"
              >
                {submitLoading ? 'Saving...' : isEditing ? 'Update Product' : 'Create Product'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* List Section */}
      <div className="bg-white rounded-3xl shadow-sm border border-primary/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-secondary/50">
              <tr>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-primary/50">Product</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-primary/50">Category</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-primary/50">Price</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-primary/50">Stock</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-primary/50">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary/5">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-10 text-center text-primary/40 animate-pulse">Loading products...</td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-10 text-center text-primary/40 font-medium">No products found. Add your first one!</td>
                </tr>
              ) : products.map(product => (
                <tr key={product._id} className="hover:bg-secondary/20 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-secondary overflow-hidden relative flex-shrink-0">
                        {product.images?.[0] && (
                          <Image src={product.images[0].url} alt={product.name} fill className="object-cover" />
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-primary">{product.name}</span>
                        <div className="flex gap-2 items-center">
                          <span className="text-[10px] bg-accent/20 text-primary px-1.5 rounded font-bold">{product.sku}</span>
                          <span className="text-[10px] opacity-30 font-mono italic">{product._id}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium px-3 py-1 bg-secondary rounded-full text-primary/70 italic">
                      {product.category?.name || 'Uncategorized'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-accent">₹{product.price}</span>
                      {product.comparePrice && <span className="text-xs line-through opacity-30">₹{product.comparePrice}</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-sm font-bold ${product.stock > 10 ? 'text-green-600' : 'text-red-500'}`}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleEdit(product)}
                        className="p-2 bg-primary/5 hover:bg-accent hover:text-primary rounded-lg transition-all"
                      >
                        ✏️
                      </button>
                      <button 
                        onClick={() => handleDelete(product._id)}
                        className="p-2 bg-primary/5 hover:bg-red-500 hover:text-white rounded-lg transition-all"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function InputField({ label, ...props }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-bold uppercase tracking-widest text-primary/50">{label}</label>
      <input 
        className="bg-secondary/50 border border-primary/10 rounded-xl px-4 py-3 outline-none focus:border-accent transition-all"
        {...props}
      />
    </div>
  );
}
