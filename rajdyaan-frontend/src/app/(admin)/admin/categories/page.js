'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    _id: '',
    name: '',
    description: '',
    parentCategory: '',
    templateSlug: 'default',
    isActive: true,
    image: null,
  });

  const [imageFile, setImageFile] = useState(null);
  const [removeImage, setRemoveImage] = useState(false);
  const imageInputRef = useRef(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/products/categories`);
      if (res.ok) {
        const data = await res.json();
        setCategories(data.data?.categories || data.data || []);
      }
    } catch (err) {
      toast.error('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
      setRemoveImage(false);
    }
  };

  const handleRemoveExistingImage = () => {
    setRemoveImage(true);
    setFormData((prev) => ({ ...prev, image: null }));
  };

  const resetForm = () => {
    setFormData({
      _id: '',
      name: '',
      description: '',
      parentCategory: '',
      templateSlug: 'default',
      isActive: true,
      image: null,
    });
    setImageFile(null);
    setRemoveImage(false);
    setIsEditing(false);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);

    const data = new FormData();
    data.append('name', formData.name);
    data.append('description', formData.description || '');
    if (formData.parentCategory) data.append('parentCategory', formData.parentCategory);
    data.append('templateSlug', formData.templateSlug);
    data.append('isActive', formData.isActive);

    if (imageFile) {
      data.append('image', imageFile);
    }
    if (removeImage) {
      data.append('removeImage', 'true');
    }

    try {
      const url = isEditing
        ? `${API_URL}/products/categories/${formData._id}`
        : `${API_URL}/products/categories`;

      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        body: data,
        credentials: 'include',
      });

      const resData = await res.json();
      if (res.ok) {
        toast.success(isEditing ? 'Category updated!' : 'Category added!');
        resetForm();
        fetchCategories();
      } else {
        toast.error(resData.message || 'Operation failed');
      }
    } catch (err) {
      toast.error('Something went wrong');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;

    try {
      const res = await fetch(`${API_URL}/products/categories/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (res.ok) {
        toast.success('Category deleted!');
        fetchCategories();
      } else {
        const data = await res.json();
        toast.error(data.message || 'Delete failed');
      }
    } catch (err) {
      toast.error('Failed to delete category');
    }
  };

  const handleEdit = (category) => {
    setFormData({
      _id: category._id,
      name: category.name,
      description: category.description || '',
      parentCategory: category.parentCategory || '',
      templateSlug: category.templateSlug || 'default',
      isActive: category.isActive !== false,
      image: category.image || null,
    });
    setImageFile(null);
    setRemoveImage(false);
    setIsEditing(true);
    setShowForm(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your product categories and templates.
          </p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="rounded-md bg-[#C9A84C] px-4 py-2 text-sm font-medium text-white hover:bg-[#b08d3a]"
          >
            + Add Category
          </button>
        )}
      </div>

      {showForm ? (
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">
              {isEditing ? 'Edit Category' : 'New Category'}
            </h2>
            <button
              onClick={resetForm}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#C9A84C] focus:outline-none focus:ring-1 focus:ring-[#C9A84C]"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Template Slug</label>
                <select
                  name="templateSlug"
                  value={formData.templateSlug}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#C9A84C] focus:outline-none focus:ring-1 focus:ring-[#C9A84C]"
                >
                  <option value="default">Default / Sweetener</option>
                  <option value="ghee">Ghee Template</option>
                  <option value="oil">Oil Template</option>
                  <option value="sweetener">Sweetener Template</option>
                  <option value="saree">Saree Template</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#C9A84C] focus:outline-none focus:ring-1 focus:ring-[#C9A84C]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Parent Category</label>
                <select
                  name="parentCategory"
                  value={formData.parentCategory}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#C9A84C] focus:outline-none focus:ring-1 focus:ring-[#C9A84C]"
                >
                  <option value="">None (Top Level)</option>
                  {categories
                    .filter((c) => c._id !== formData._id) // Prevent self-referencing
                    .map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                </select>
              </div>

              <div className="flex items-center pt-6">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="h-4 w-4 rounded border-gray-300 text-[#C9A84C] focus:ring-[#C9A84C]"
                />
                <label className="ml-2 block text-sm text-gray-700">Active (Visible on site)</label>
              </div>
            </div>

            {/* Image Upload */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="mb-4 text-sm font-medium text-gray-900">Category Banner / Image</h3>
              
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    ref={imageInputRef}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-md file:border-0 file:bg-gray-100 file:px-4 file:py-2 file:text-sm file:font-medium hover:file:bg-gray-200"
                  />
                  {imageFile && (
                    <p className="mt-2 text-xs text-green-600">Selected: {imageFile.name}</p>
                  )}
                </div>

                {/* Show existing image if present and not removed */}
                {formData.image?.url && !removeImage && (
                  <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                    <Image
                      src={formData.image.url}
                      alt={formData.name}
                      fill
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveExistingImage}
                      className="absolute right-1 top-1 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                      title="Remove image"
                    >
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}
                {removeImage && (
                  <div className="flex h-24 w-24 items-center justify-center rounded-md border border-dashed border-gray-300 bg-gray-50 text-xs text-gray-500 text-center">
                    Image will be removed
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-gray-200 pt-6">
              <button
                type="button"
                onClick={resetForm}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitLoading}
                className="rounded-md bg-[#C9A84C] px-6 py-2 text-sm font-medium text-white hover:bg-[#b08d3a] disabled:opacity-50"
              >
                {submitLoading ? 'Saving...' : isEditing ? 'Update Category' : 'Create Category'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading categories...</div>
          ) : categories.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No categories found. Create one above!</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-500">
                <thead className="bg-gray-50 text-xs uppercase text-gray-700">
                  <tr>
                    <th className="px-6 py-3">Image</th>
                    <th className="px-6 py-3">Name</th>
                    <th className="px-6 py-3">Template</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((category) => (
                    <tr key={category._id} className="border-b bg-white hover:bg-gray-50">
                      <td className="px-6 py-4">
                        {category.image?.url ? (
                          <div className="relative h-10 w-10 overflow-hidden rounded-md border border-gray-200">
                            <Image
                              src={category.image.url}
                              alt={category.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-gray-100 text-gray-400">
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                            </svg>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {category.name}
                        {category.parentCategory && (
                          <span className="ml-2 text-xs font-normal text-gray-400">
                            (Subcategory)
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs">
                        <span className="rounded bg-gray-100 px-2 py-1 text-gray-600">
                          {category.templateSlug || 'default'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            category.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {category.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleEdit(category)}
                          className="font-medium text-[#C9A84C] hover:underline"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(category._id)}
                          className="ml-4 font-medium text-red-600 hover:underline"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
