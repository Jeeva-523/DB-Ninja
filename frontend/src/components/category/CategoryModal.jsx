import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';

export const CategoryModal = ({ isOpen, onClose, onSave, category = null, parentCategories = [] }) => {
  const [name, setName] = useState('');
  const [parentId, setParentId] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (category) {
      setName(category.name || '');
      setParentId(category.parent_id || '');
      setDescription(category.description || '');
    } else {
      setName('');
      setParentId('');
      setDescription('');
    }
    setError('');
  }, [category, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Category name is required');
      return;
    }

    setSubmitting(true);
    try {
      await onSave({
        name,
        parentId: parentId ? parseInt(parentId, 10) : null,
        description
      });
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save category');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-bold text-slate-100 mb-1">
          {category ? 'Edit Category' : 'Create New Category'}
        </h2>
        <p className="text-xs text-slate-400 mb-6">Organize products into hierarchical categories</p>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
              Category Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Smartphones"
              className="w-full bg-slate-950/60 border border-slate-800 focus:border-emerald-500 rounded-xl py-2.5 px-3.5 text-sm text-slate-100 placeholder-slate-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
              Parent Category (Optional)
            </label>
            <select
              value={parentId}
              onChange={(e) => setParentId(e.target.value)}
              className="w-full bg-slate-950/60 border border-slate-800 focus:border-emerald-500 rounded-xl py-2.5 px-3.5 text-sm text-slate-100 outline-none"
            >
              <option value="">None (Top-Level Category)</option>
              {parentCategories
                ?.filter((c) => !category || c.id !== category.id)
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Short category description..."
              className="w-full bg-slate-950/60 border border-slate-800 focus:border-emerald-500 rounded-xl py-2.5 px-3.5 text-sm text-slate-100 placeholder-slate-500 outline-none resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-lg shadow-emerald-600/20 flex items-center gap-2"
            >
              {submitting && <Loader2 size={14} className="animate-spin" />}
              {category ? 'Update Category' : 'Save Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
