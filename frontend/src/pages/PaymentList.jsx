import React, { useState, useEffect } from 'react';
import { paymentApi } from '../api/paymentApi';
import { DollarSign, Search, CreditCard, RefreshCw, ChevronLeft, ChevronRight, CheckCircle, AlertCircle, RotateCcw } from 'lucide-react';

export const PaymentList = () => {
  const [payments, setPayments] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, totalPages: 1, total: 0 });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchPayments = async (page = 1) => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await paymentApi.getAll({
        page,
        limit: 10,
        search,
        status: statusFilter
      });
      if (res.success) {
        setPayments(res.data.payments);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      console.error('Failed to fetch payments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments(1);
  }, [search, statusFilter]);

  const handleRefund = async (paymentId) => {
    if (!window.confirm('Are you sure you want to issue a refund for this transaction?')) return;
    try {
      const res = await paymentApi.refund(paymentId);
      if (res.success) fetchPayments(pagination.page);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to process refund');
    }
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return <span className="px-2.5 py-1 text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg flex items-center gap-1"><CheckCircle size={12} /> Completed</span>;
      case 'refunded':
        return <span className="px-2.5 py-1 text-[11px] font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-lg flex items-center gap-1"><RotateCcw size={12} /> Refunded</span>;
      case 'failed':
        return <span className="px-2.5 py-1 text-[11px] font-semibold bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg flex items-center gap-1"><AlertCircle size={12} /> Failed</span>;
      default:
        return <span className="px-2.5 py-1 text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-lg">{status}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <DollarSign className="text-emerald-400" size={24} /> Financial Transactions & Payments
          </h1>
          <p className="text-xs text-slate-400 mt-1">Audit gateway transaction IDs, payment statuses, and execute refund operations</p>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl">
          {errorMsg}
        </div>
      )}

      {/* Filter and Search */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-3 text-slate-500" size={18} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by transaction ID, order ID, or customer..."
            className="w-full bg-slate-950/60 border border-slate-800 focus:border-emerald-500 rounded-xl py-2 pl-10 pr-4 text-xs text-slate-100 placeholder-slate-500 outline-none"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-950/60 border border-slate-800 focus:border-emerald-500 rounded-xl py-2 px-3 text-xs text-slate-100 outline-none"
        >
          <option value="">All Payment Statuses</option>
          <option value="completed">Completed</option>
          <option value="refunded">Refunded</option>
          <option value="failed">Failed</option>
          <option value="pending">Pending</option>
        </select>
      </div>

      {/* Payments Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/60 text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Transaction ID</th>
                <th className="py-3.5 px-4">Order ID</th>
                <th className="py-3.5 px-4">Payer</th>
                <th className="py-3.5 px-4">Gateway / Method</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Refund Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 text-xs">Loading payment transactions...</td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 text-xs">No payment transactions recorded.</td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-xs text-emerald-400">{p.transaction_id}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-200">#{p.order_id}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-100">{p.payer_name}</div>
                      <div className="text-xs text-slate-500">{p.payer_email}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="capitalize text-xs text-slate-200 font-semibold">{p.payment_gateway}</div>
                      <div className="text-[10px] text-slate-500 uppercase">{p.payment_method}</div>
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-slate-100">
                      ${Number(p.amount).toFixed(2)} <span className="text-[10px] text-slate-500 font-normal">{p.currency}</span>
                    </td>
                    <td className="py-3.5 px-4">{getStatusBadge(p.status)}</td>
                    <td className="py-3.5 px-4 text-right">
                      {p.status === 'completed' && (
                        <button
                          onClick={() => handleRefund(p.id)}
                          className="px-3 py-1.5 text-xs font-semibold text-purple-400 hover:bg-purple-500/10 border border-purple-500/20 rounded-lg transition-all flex items-center gap-1 ml-auto"
                        >
                          <RotateCcw size={14} /> Issue Refund
                        </button>
                      )}
                    </td>
                  </tr>
                ))
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
              onClick={() => fetchPayments(pagination.page - 1)}
              className="p-2 border border-slate-800 text-slate-400 hover:text-slate-200 rounded-lg disabled:opacity-30"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => fetchPayments(pagination.page + 1)}
              className="p-2 border border-slate-800 text-slate-400 hover:text-slate-200 rounded-lg disabled:opacity-30"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
