import React, { useState } from 'react';
import { X, Loader2, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export const StockModal = ({ isOpen, onClose, onSave, product }) => {
  const [quantityChanged, setQuantityChanged] = useState('');
  const [changeType, setChangeType] = useState('restock');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !product) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const qty = parseInt(quantityChanged, 10);
    if (isNaN(qty) || qty === 0) {
      setError('Please enter a valid stock quantity adjustment amount');
      return;
    }

    // Convert to negative if reduction/adjustment
    const finalQty = changeType === 'sale' || changeType === 'adjustment' && qty > 0 ? -Math.abs(qty) : Math.abs(qty);

    setSubmitting(true);
    try {
      await onSave({
        quantityChanged: finalQty,
        changeType,
        note
      });
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to adjust stock');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-200">
          <X size={20} />
        </button>

        <h2 className="text-xl font-bold text-slate-100 mb-1">Stock Adjustment</h2>
        <p className="text-xs text-slate-400 mb-4">
          Adjust inventory for <span className="text-emerald-400 font-semibold">{product.title}</span> (SKU: {product.sku})
        </p>

        <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl mb-4 flex items-center justify-between text-xs">
          <span className="text-slate-400">Current On-Hand Stock:</span>
          <span className="font-bold text-slate-100 text-sm">{product.stock_quantity} units</span>
        </div>

        {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5">Adjustment Type</label>
            <select
              value={changeType}
              onChange={(e) => setChangeType(e.target.value)}
              className="w-full bg-slate-950/60 border border-slate-800 focus:border-emerald-500 rounded-xl py-2 px-3 text-xs text-slate-100 outline-none"
            >
              <option value="restock">➕ Restock (Add Stock)</option>
              <option value="sale">➖ Manual Sale / Outflow (Reduce Stock)</option>
              <option value="adjustment">⚠️ Damage / Shrinkage Adjustment</option>
              <option value="return">🔄 Customer Return</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5">Quantity Amount *</label>
            <input
              type="number"
              min="1"
              value={quantityChanged}
              onChange={(e) => setQuantityChanged(e.target.value)}
              placeholder="e.g. 50"
              className="w-full bg-slate-950/60 border border-slate-800 focus:border-emerald-500 rounded-xl py-2 px-3 text-xs text-slate-100 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5">Audit Note / Reason</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Supplier Shipment #8402"
              className="w-full bg-slate-950/60 border border-slate-800 focus:border-emerald-500 rounded-xl py-2 px-3 text-xs text-slate-100 outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-semibold text-slate-400">Cancel</button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-lg shadow-emerald-600/20 flex items-center gap-2"
            >
              {submitting && <Loader2 size={14} className="animate-spin" />} Save Stock Change
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
