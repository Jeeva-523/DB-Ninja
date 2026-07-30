import React, { useState, useEffect } from 'react';
import { categoryApi } from '../api/categoryApi';
import { CategoryModal } from '../components/category/CategoryModal';
import { Plus, Search, Edit3, Trash2, FolderTree, ChevronLeft, ChevronRight } from 'lucide-react';

export const CategoryList = () => {
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, totalPages: 1, total: 0 });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchCategories = async (page = 1, searchQuery = search) => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await categoryApi.getAll({ page, limit: 10, search: searchQuery });
      if (res.success) {
        setCategories(res.data.categories);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories(1, search);
  }, [search]);

  const handleCreate = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      const res = await categoryApi.delete(id);
      if (res.success) {
        fetchCategories(pagination.page);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to delete category');
    }
  };

  const handleSaveModal = async (formData) => {
    if (editingCategory) {
      await categoryApi.update(editingCategory.id, formData);
    } else {
      await categoryApi.create(formData);
    }
    fetchCategories(pagination.page);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <FolderTree className="text-emerald-400" size={24} /> Category Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">Manage e-commerce product taxonomy, subcategories, and URL slugs</p>
        </div>
        <button
          onClick={handleCreate}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-emerald-600/20"
        >
          <Plus size={16} /> Add Category
        </button>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl">
          {errorMsg}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3.5 top-3 text-slate-500" size={18} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search categories by name or description..."
            className="w-full bg-slate-950/60 border border-slate-800 focus:border-emerald-500 rounded-xl py-2 pl-10 pr-4 text-xs text-slate-100 placeholder-slate-500 outline-none"
          />
        </div>
        <span className="text-xs text-slate-400 font-medium">Total: {pagination.total} Categories</span>
      </div>

      {/* Data Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/60 text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">ID</th>
                <th className="py-3.5 px-4">Category Name</th>
                <th className="py-3.5 px-4">Slug</th>
                <th className="py-3.5 px-4">Parent Category</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500 text-xs">Loading categories...</td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500 text-xs">No categories found matching your search.</td>
                </tr>
              ) : (
                categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-400">#{cat.id}</td>
                    <td className="py-3.5 px-4 font-medium text-slate-100">{cat.name}</td>
                    <td className="py-3.5 px-4 font-mono text-xs text-emerald-400">{cat.slug}</td>
                    <td className="py-3.5 px-4 text-xs text-slate-400">{cat.parent_name || 'Top Level'}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-0.5 text-[11px] font-semibold rounded-lg ${cat.is_active ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-400'}`}>
                        {cat.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(cat)}
                          className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-lg transition-all"
                          title="Edit"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(cat.id)}
                          className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-all"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="bg-slate-950/60 px-6 py-4 border-t border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              disabled={pagination.page <= 1}
              onClick={() => fetchCategories(pagination.page - 1)}
              className="p-2 border border-slate-800 text-slate-400 hover:text-slate-200 rounded-lg disabled:opacity-30"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => fetchCategories(pagination.page + 1)}
              className="p-2 border border-slate-800 text-slate-400 hover:text-slate-200 rounded-lg disabled:opacity-30"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Category Modal Component */}
      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveModal}
        category={editingCategory}
        parentCategories={categories}
      />
    </div>
  );
};
