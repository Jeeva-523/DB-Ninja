import React, { useState, useEffect } from 'react';
import { productApi } from '../api/productApi';
import { categoryApi } from '../api/categoryApi';
import { ProductModal } from '../components/product/ProductModal';
import { StockModal } from '../components/product/StockModal';
import { Package, Plus, Search, Edit3, Trash2, SlidersHorizontal, ChevronLeft, ChevronRight, AlertTriangle, Layers } from 'lucide-react';

export const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, totalPages: 1, total: 0 });
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [stockProduct, setStockProduct] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchCategories = async () => {
    try {
      const res = await categoryApi.getAll({ limit: 100 });
      if (res.success) setCategories(res.data.categories);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchProducts = async (page = 1) => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await productApi.getAll({
        page,
        limit: 10,
        search,
        categoryId: selectedCategory,
        lowStock: lowStockOnly
      });
      if (res.success) {
        setProducts(res.data.products);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts(1);
  }, [search, selectedCategory, lowStockOnly]);

  const handleCreate = () => {
    setEditingProduct(null);
    setIsProductModalOpen(true);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setIsProductModalOpen(true);
  };

  const handleOpenStockModal = (product) => {
    setStockProduct(product);
    setIsStockModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      const res = await productApi.delete(id);
      if (res.success) fetchProducts(pagination.page);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to delete product');
    }
  };

  const handleSaveProduct = async (formData) => {
    if (editingProduct) {
      await productApi.update(editingProduct.id, formData);
    } else {
      await productApi.create(formData);
    }
    fetchProducts(pagination.page);
  };

  const handleSaveStock = async (stockData) => {
    await productApi.adjustStock(stockProduct.id, stockData);
    fetchProducts(pagination.page);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Package className="text-emerald-400" size={24} /> Product Catalog & Inventory
          </h1>
          <p className="text-xs text-slate-400 mt-1">Manage SKUs, prices, stock levels, and upload product assets</p>
        </div>
        <button
          onClick={handleCreate}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-emerald-600/20"
        >
          <Plus size={16} /> Add Product
        </button>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl">
          {errorMsg}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-3 text-slate-500" size={18} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, SKU, or description..."
            className="w-full bg-slate-950/60 border border-slate-800 focus:border-emerald-500 rounded-xl py-2 pl-10 pr-4 text-xs text-slate-100 placeholder-slate-500 outline-none"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-950/60 border border-slate-800 focus:border-emerald-500 rounded-xl py-2 px-3 text-xs text-slate-100 outline-none"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <button
            onClick={() => setLowStockOnly(!lowStockOnly)}
            className={`px-3 py-2 text-xs font-semibold rounded-xl border flex items-center gap-1.5 transition-all ${
              lowStockOnly ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' : 'bg-slate-950/60 text-slate-400 border-slate-800'
            }`}
          >
            <AlertTriangle size={14} /> Low Stock Warnings
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/60 text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Product</th>
                <th className="py-3.5 px-4">SKU</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Price</th>
                <th className="py-3.5 px-4">Stock</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500 text-xs">Loading products...</td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500 text-xs">No products found.</td>
                </tr>
              ) : (
                products.map((p) => {
                  const isLowStock = p.stock_quantity <= p.low_stock_threshold;
                  return (
                    <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          {p.image_url ? (
                            <img src={p.image_url} alt={p.title} className="w-10 h-10 rounded-lg object-cover border border-slate-700 shrink-0" />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-500 shrink-0">
                              <Package size={18} />
                            </div>
                          )}
                          <div>
                            <div className="font-medium text-slate-100">{p.title}</div>
                            <div className="text-xs text-slate-500">{p.slug}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs text-emerald-400">{p.sku}</td>
                      <td className="py-3.5 px-4 text-xs text-slate-400">{p.category_name}</td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-100">${Number(p.price).toFixed(2)}</div>
                        {p.sale_price && <div className="text-[10px] text-emerald-400 font-medium">Sale: ${Number(p.sale_price).toFixed(2)}</div>}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className={`font-bold ${isLowStock ? 'text-amber-400' : 'text-slate-100'}`}>
                            {p.stock_quantity} units
                          </span>
                          {isLowStock && <AlertTriangle size={14} className="text-amber-400" title="Low Stock Threshold Warning" />}
                        </div>
                        <button
                          onClick={() => handleOpenStockModal(p)}
                          className="text-[10px] text-emerald-400 hover:underline font-semibold mt-0.5 block"
                        >
                          Adjust Inventory
                        </button>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => handleEdit(p)} className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-lg">
                            <Edit3 size={16} />
                          </button>
                          <button onClick={() => handleDelete(p.id)} className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="bg-slate-950/60 px-6 py-4 border-t border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400">Page {pagination.page} of {pagination.totalPages}</span>
          <div className="flex items-center gap-2">
            <button
              disabled={pagination.page <= 1}
              onClick={() => fetchProducts(pagination.page - 1)}
              className="p-2 border border-slate-800 text-slate-400 hover:text-slate-200 rounded-lg disabled:opacity-30"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => fetchProducts(pagination.page + 1)}
              className="p-2 border border-slate-800 text-slate-400 hover:text-slate-200 rounded-lg disabled:opacity-30"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onSave={handleSaveProduct}
        product={editingProduct}
        categories={categories}
      />

      <StockModal
        isOpen={isStockModalOpen}
        onClose={() => setIsStockModalOpen(false)}
        onSave={handleSaveStock}
        product={stockProduct}
      />
    </div>
  );
};
