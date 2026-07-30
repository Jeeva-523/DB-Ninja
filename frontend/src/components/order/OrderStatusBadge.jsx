import React from 'react';

export const OrderStatusBadge = ({ status }) => {
  switch (status?.toLowerCase()) {
    case 'completed':
    case 'delivered':
      return <span className="px-2.5 py-1 text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg">Delivered</span>;
    case 'shipped':
      return <span className="px-2.5 py-1 text-[11px] font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-lg">Shipped</span>;
    case 'processing':
      return <span className="px-2.5 py-1 text-[11px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-lg">Processing</span>;
    case 'pending':
      return <span className="px-2.5 py-1 text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-lg">Pending</span>;
    case 'cancelled':
      return <span className="px-2.5 py-1 text-[11px] font-semibold bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg">Cancelled</span>;
    default:
      return <span className="px-2.5 py-1 text-[11px] font-semibold bg-slate-800 text-slate-400 border border-slate-700 rounded-lg">{status}</span>;
  }
};
